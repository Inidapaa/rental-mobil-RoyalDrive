import { useState, useEffect, useRef } from "react";
import { Receipt, Calendar, Car, MapPin, Phone, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/useAuth";
import { useNotification } from "../components/NotificationProvider";
import { TRANSAKSI_UPDATED_EVENT } from "../lib/events";
import {
  STATUS,
  getStatusColor,
  getStatusLabel,
  isCancelableStatus,
} from "../lib/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

function Pesanan() {
  const { user } = useAuth();
  const [transaksiList, setTransaksiList] = useState([]);
  const [mobilList, setMobilList] = useState([]);
  const [pelangganData, setPelangganData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const notify = useNotification();
  const hasFetched = useRef(false); // Flag untuk mencegah multiple fetch
  const currentEmail = useRef(null); // Track email yang sedang di-fetch

  useEffect(() => {
    const userEmail = user?.email;
    
    // Jika email berubah, reset flag
    if (currentEmail.current !== userEmail) {
      hasFetched.current = false;
      currentEmail.current = userEmail;
    }

    // Jika user belum ada, set loading false
    if (!userEmail) {
      setLoading(false);
      return;
    }

    // Fetch data hanya sekali per email
    if (!hasFetched.current) {
      hasFetched.current = true;
      
      const fetchData = async () => {
        try {
          setLoading(true);

          // Fetch data pelanggan
          const { data: pelanggan, error: pelangganError } = await supabase
            .from("pelanggan")
            .select("*")
            .eq("email", userEmail)
            .maybeSingle();

          if (pelangganError && pelangganError.code !== "PGRST116") {
            console.error("Error fetching pelanggan:", pelangganError);
            // Tetap lanjutkan untuk fetch mobil dan transaksi
          }

          if (pelanggan) {
            setPelangganData(pelanggan);

            // Fetch transaksi pelanggan
            const { data: transaksi, error: transaksiError } = await supabase
              .from("transaksi")
              .select("*")
              .eq("id_pelanggan", pelanggan.id_pelanggan)
              .order("id_transaksi", { ascending: false });

            if (transaksiError) {
              console.error("Error fetching transaksi:", transaksiError);
              setTransaksiList([]);
            } else {
              setTransaksiList(transaksi || []);
            }
          } else {
            // Jika pelanggan tidak ditemukan, set empty list
            setTransaksiList([]);
            setPelangganData(null);
          }

          // Fetch semua mobil untuk mendapatkan nama mobil
          const { data: mobil, error: mobilError } = await supabase
            .from("mobil")
            .select("*");

          if (mobilError) {
            console.error("Error fetching mobil:", mobilError);
            setMobilList([]);
          } else {
            setMobilList(mobil || []);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          // Set empty arrays on error
          setTransaksiList([]);
          setMobilList([]);
          setPelangganData(null);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user?.email]); // Hanya depend pada email, bukan seluruh user object

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCancel = async (transaksi) => {
    if (
      !window.confirm(
        "Batalkan pemesanan ini? Tindakan tidak dapat dibatalkan."
      )
    ) {
      return;
    }
    try {
      setCancellingId(transaksi.id_transaksi);
      const { error } = await supabase
        .from("transaksi")
        .update({ status_transaksi: STATUS.BATAL })
        .eq("id_transaksi", transaksi.id_transaksi);

      if (error) throw error;

      setTransaksiList((prev) =>
        prev.map((item) =>
          item.id_transaksi === transaksi.id_transaksi
            ? { ...item, status_transaksi: "batal" }
            : item
        )
      );
      notify("Pemesanan berhasil dibatalkan.", "success");
      window.dispatchEvent(new Event(TRANSAKSI_UPDATED_EVENT));
    } catch (err) {
      console.error("Error cancelling booking:", err);
      notify("Gagal membatalkan pemesanan: " + err.message, "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
            Pesanan Saya
          </h1>
          <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
            Riwayat pemesanan kendaraan
          </p>
        </div>

        {/* Info Pelanggan */}
        {pelangganData && (
          <div className="bg-dark-light rounded-xl p-6 mb-6 border border-dark-lighter">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">
              Informasi Pelanggan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-[#a0a0a0]">Nama</p>
                  <p className="font-semibold">{pelangganData.nama}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-[#a0a0a0]">No. HP</p>
                  <p className="font-semibold">{pelangganData.no_hp}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-[#a0a0a0]">Email</p>
                  <p className="font-semibold">{pelangganData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                <div>
                  <p className="text-sm text-[#a0a0a0]">Alamat</p>
                  <p className="font-semibold">{pelangganData.alamat}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daftar Pesanan */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter overflow-hidden">
          <div className="p-6 border-b border-dark-lighter">
            <h3 className="text-xl font-bold uppercase tracking-wide">
              Riwayat Pemesanan
            </h3>
          </div>
          {loading ? (
            <div className="text-center py-8 text-[#a0a0a0]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Memuat data...
            </div>
          ) : transaksiList.length === 0 ? (
            <div className="text-center py-8 text-[#a0a0a0]">
              <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Belum ada riwayat pemesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-dark-lighter hover:bg-dark-lighter">
                    <TableHead>ID Pesanan</TableHead>
                    <TableHead>Mobil</TableHead>
                    <TableHead>Tanggal Sewa</TableHead>
                    <TableHead>Tanggal Kembali</TableHead>
                    <TableHead>Total Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaksiList.map((transaksi) => {
                    const mobil = mobilList.find(
                      (m) => m.id_mobil === transaksi.id_mobil
                    );
                    return (
                      <TableRow key={transaksi.id_transaksi}>
                        <TableCell className="text-sm font-medium">
                          #{transaksi.id_transaksi}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {mobil?.foto && (
                              <img
                                src={mobil.foto}
                                alt={mobil?.nama_mobil}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/48";
                                }}
                              />
                            )}
                            <div>
                              <p className="font-semibold">
                                {mobil?.nama_mobil || "N/A"}
                              </p>
                              <p className="text-xs text-[#a0a0a0]">
                                {mobil?.merk} - {mobil?.tipe}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#a0a0a0]" />
                            {transaksi.tanggal_sewa}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#a0a0a0]" />
                            {transaksi.tanggal_kembali}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {formatCurrency(transaksi.total_harga).replace("Rp", "Rp ")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              transaksi.status_transaksi
                            )}`}
                          >
                            {getStatusLabel(transaksi.status_transaksi, "customer")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isCancelableStatus(transaksi.status_transaksi) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(transaksi)}
                              disabled={cancellingId === transaksi.id_transaksi}
                              className="px-3 py-1 rounded-lg border border-red-500/50 text-red-300 text-xs font-semibold uppercase tracking-wide hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === transaksi.id_transaksi
                                ? "Memproses..."
                                : "Batalkan"}
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Pesanan;

