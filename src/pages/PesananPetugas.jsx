import { useState, useEffect, useRef } from "react";
import { Receipt, Calendar, Car, User as UserIcon, X } from "lucide-react";
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

function PesananPetugas() {
  const { user } = useAuth();
  const [transaksiList, setTransaksiList] = useState([]);
  const [mobilList, setMobilList] = useState([]);
  const [pelangganList, setPelangganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const notify = useNotification();
  const hasFetched = useRef(false);
  const currentEmail = useRef(null);

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

          // Fetch semua transaksi (petugas bisa lihat semua)
          const { data: transaksi, error: transaksiError } = await supabase
            .from("transaksi")
            .select("*")
            .order("id_transaksi", { ascending: false });

          if (transaksiError) {
            console.error("Error fetching transaksi:", transaksiError);
            setTransaksiList([]);
          } else {
            setTransaksiList(transaksi || []);
          }

          // Fetch semua mobil
          const { data: mobil, error: mobilError } = await supabase
            .from("mobil")
            .select("*");

          if (mobilError) {
            console.error("Error fetching mobil:", mobilError);
            setMobilList([]);
          } else {
            setMobilList(mobil || []);
          }

          // Fetch semua pelanggan untuk mendapatkan info pelanggan
          const { data: pelanggan, error: pelangganError } = await supabase
            .from("pelanggan")
            .select("*");

          if (pelangganError) {
            console.error("Error fetching pelanggan:", pelangganError);
            setPelangganList([]);
          } else {
            setPelangganList(pelanggan || []);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setTransaksiList([]);
          setMobilList([]);
          setPelangganList([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user?.email]);

  // Listen to transaction updates
  useEffect(() => {
    const handleUpdate = () => {
      hasFetched.current = false;
      if (user?.email) {
        currentEmail.current = null;
      }
    };

    window.addEventListener(TRANSAKSI_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(TRANSAKSI_UPDATED_EVENT, handleUpdate);
    };
  }, [user?.email]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle cancel pesanan
  const handleCancel = async (transaksi) => {
    if (
      !window.confirm("Batalkan pesanan ini? Tindakan tidak dapat dibatalkan.")
    ) {
      return;
    }
    try {
      setCancellingId(transaksi.id_transaksi);
      const { error } = await supabase
        .from("transaksi")
        .update({ status_transaksi: "batal" })
        .eq("id_transaksi", transaksi.id_transaksi);

      if (error) throw error;

      setTransaksiList((prev) =>
        prev.map((item) =>
          item.id_transaksi === transaksi.id_transaksi
            ? { ...item, status_transaksi: "batal" }
            : item
        )
      );
      notify("Pesanan berhasil dibatalkan.", "success");
      window.dispatchEvent(new Event(TRANSAKSI_UPDATED_EVENT));
    } catch (err) {
      console.error("Error cancelling booking:", err);
      notify("Gagal membatalkan pesanan: " + err.message, "error");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 uppercase tracking-wide">
            Pesanan
          </h1>
          <p className="text-base sm:text-lg text-[#a0a0a0] uppercase tracking-wide">
            Daftar pesanan penyewaan mobil yang telah dibuat
          </p>
        </div>

        {/* Daftar Pesanan */}
        <div className="bg-dark-light rounded-xl border border-dark-lighter overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-dark-lighter">
            <h3 className="text-xl font-bold uppercase tracking-wide">
              Daftar Pesanan
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
              <p>Belum ada pesanan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-dark-lighter hover:bg-dark-lighter">
                    <TableHead>ID Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
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
                    const pelanggan = pelangganList.find(
                      (p) => p.id_pelanggan === transaksi.id_pelanggan
                    );
                    return (
                      <TableRow key={transaksi.id_transaksi}>
                        <TableCell className="text-sm font-medium">
                          #{transaksi.id_transaksi}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-[#a0a0a0]" />
                            <div>
                              <p className="font-semibold">
                                {pelanggan?.nama || "N/A"}
                              </p>
                              <p className="text-xs text-[#a0a0a0]">
                                {pelanggan?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {mobil?.foto && (
                              <img
                                src={mobil.foto}
                                alt={mobil?.nama_mobil}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/48";
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
                          {formatCurrency(transaksi.total_harga).replace(
                            "Rp",
                            "Rp "
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              transaksi.status_transaksi
                            )}`}
                          >
                            {getStatusLabel(
                              transaksi.status_transaksi,
                              "petugas"
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isCancelableStatus(transaksi.status_transaksi) && (
                            <button
                              type="button"
                              onClick={() => handleCancel(transaksi)}
                              disabled={cancellingId === transaksi.id_transaksi}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg border border-red-500/50 text-red-300 text-xs font-semibold uppercase tracking-wide hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PesananPetugas;
