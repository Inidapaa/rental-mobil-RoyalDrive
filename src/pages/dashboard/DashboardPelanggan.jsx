import { useState, useEffect } from "react";
import { Car, Calendar, Receipt } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/useAuth";
import { useNotification } from "../../components/NotificationProvider";
import { STATUS, getStatusColor, getStatusLabel } from "../../lib/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

function DashboardPelanggan() {
  const { user } = useAuth();
  const [mobilList, setMobilList] = useState([]);
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch mobil tersedia
      const { data: mobil, error: mobilError } = await supabase
        .from("mobil")
        .select("*")
        .eq("status", "tersedia")
        .order("id_mobil", { ascending: false });

      if (mobilError) throw mobilError;

      // Fetch transaksi pelanggan (jika ada user)
      if (user?.email) {
        // Cari id_pelanggan berdasarkan email
        const { data: pelanggan } = await supabase
          .from("pelanggan")
          .select("id_pelanggan")
          .eq("email", user.email)
          .single();

        if (pelanggan) {
          const { data: transaksi, error: transaksiError } = await supabase
            .from("transaksi")
            .select("*")
            .eq("id_pelanggan", pelanggan.id_pelanggan)
            .order("id_transaksi", { ascending: false });

          if (transaksiError) throw transaksiError;
          setTransaksiList(transaksi || []);
        }
      }

      setMobilList(mobil || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      notify("Gagal memuat data: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-lighter rounded-xl p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/20 p-3 rounded-lg">
              <Car className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? "..." : mobilList.length}
          </h3>
          <p className="text-sm text-[#a0a0a0] uppercase tracking-wide">
            Mobil Tersedia
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading ? "..." : transaksiList.length}
          </h3>
          <p className="text-sm text-[#a0a0a0] uppercase tracking-wide">
            Total Pemesanan
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading
              ? "..."
              : transaksiList.filter(
                  (t) => t.status_transaksi === STATUS.KONFIRMASI
                ).length}
          </h3>
          <p className="text-sm text-[#a0a0a0] uppercase tracking-wide">
            Menunggu Konfirmasi
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-1">
            {loading
              ? "..."
              : transaksiList.filter(
                  (t) => t.status_transaksi === STATUS.BERLANGSUNG
                ).length}
          </h3>
          <p className="text-sm text-[#a0a0a0] uppercase tracking-wide">
            Pemesanan Aktif
          </p>
        </div>
      </div>

      {/* Mobil Tersedia */}
      <div className="bg-dark-lighter rounded-xl border border-dark-light p-6">
        <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">
          Mobil Tersedia
        </h3>
        {loading ? (
          <div className="text-center py-8 text-[#a0a0a0]">Memuat data...</div>
        ) : mobilList.length === 0 ? (
          <div className="text-center py-8 text-[#a0a0a0]">
            Tidak ada mobil tersedia
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mobilList.map((mobil) => (
              <div
                key={mobil.id_mobil}
                className="bg-dark-light rounded-lg p-4 border border-dark-lighter"
              >
                {mobil.foto && (
                  <img
                    src={mobil.foto}
                    alt={mobil.nama_mobil}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                )}
                <h4 className="font-bold text-lg mb-2">{mobil.nama_mobil}</h4>
                <p className="text-sm text-[#a0a0a0] mb-2">
                  {mobil.merk} - {mobil.tipe}
                </p>
                <p className="text-primary font-bold">
                  {formatCurrency(mobil.harga_sewa_harian).replace("Rp", "Rp ")}/hari
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Pemesanan */}
      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="p-6 border-b border-dark-light">
          <h3 className="text-xl font-bold uppercase tracking-wide">
            Riwayat Pemesanan
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-dark-light hover:bg-dark-light">
              <TableHead>ID</TableHead>
              <TableHead>Mobil</TableHead>
              <TableHead>Tanggal Sewa</TableHead>
              <TableHead>Tanggal Kembali</TableHead>
              <TableHead>Total Harga</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaksiList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#a0a0a0]">
                  {loading ? "Memuat data..." : "Tidak ada riwayat pemesanan"}
                </TableCell>
              </TableRow>
            ) : (
              transaksiList.map((transaksi) => {
                const mobil = mobilList.find((m) => m.id_mobil === transaksi.id_mobil);
                return (
                  <TableRow key={transaksi.id_transaksi}>
                    <TableCell className="text-sm">
                      {transaksi.id_transaksi}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {mobil?.nama_mobil || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">{transaksi.tanggal_sewa}</TableCell>
                    <TableCell className="text-sm">
                      {transaksi.tanggal_kembali}
                    </TableCell>
                    <TableCell className="text-sm">
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
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DashboardPelanggan;

