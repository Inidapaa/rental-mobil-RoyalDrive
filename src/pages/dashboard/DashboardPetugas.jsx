import { useState, useEffect } from "react";
import { Car, Receipt } from "lucide-react";
import { supabase } from "../../lib/supabase";
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

function DashboardPetugas() {
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

      // Fetch mobil
      const { data: mobil, error: mobilError } = await supabase
        .from("mobil")
        .select("*")
        .order("id_mobil", { ascending: false });

      if (mobilError) throw mobilError;

      // Fetch transaksi
      const { data: transaksi, error: transaksiError } = await supabase
        .from("transaksi")
        .select("*")
        .order("id_transaksi", { ascending: false });

      if (transaksiError) throw transaksiError;

      setMobilList(mobil || []);
      setTransaksiList(transaksi || []);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            Total Mobil
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
            Total Transaksi
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <Receipt className="w-6 h-6 text-yellow-500" />
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
              <Receipt className="w-6 h-6 text-yellow-500" />
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
            Sedang Berlangsung
          </p>
        </div>
      </div>

      {/* Data Mobil */}
      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="p-6 border-b border-dark-light flex items-center justify-between">
          <h3 className="text-xl font-bold uppercase tracking-wide">Data Mobil</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-dark-light hover:bg-dark-light">
                <TableHead>ID</TableHead>
                <TableHead>Nama Mobil</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Harga/Hari</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mobilList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#a0a0a0]">
                    {loading ? "Memuat data..." : "Tidak ada data mobil"}
                  </TableCell>
                </TableRow>
              ) : (
                mobilList.map((mobil) => (
                  <TableRow key={mobil.id_mobil}>
                    <TableCell className="text-sm">{mobil.id_mobil}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {mobil.nama_mobil}
                    </TableCell>
                    <TableCell className="text-sm">{mobil.merk}</TableCell>
                    <TableCell className="text-sm">{mobil.tipe}</TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(mobil.harga_sewa_harian).replace("Rp", "Rp ")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mobil.status === "tersedia"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-orange-500/20 text-orange-500"
                        }`}
                      >
                        {mobil.status === "tersedia" ? "Tersedia" : "Disewa"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Data Transaksi */}
      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="p-6 border-b border-dark-light">
          <h3 className="text-xl font-bold uppercase tracking-wide">
            Data Transaksi
          </h3>
        </div>
        <div className="overflow-x-auto">
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
                    {loading ? "Memuat data..." : "Tidak ada data transaksi"}
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
                          {getStatusLabel(transaksi.status_transaksi)}
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
    </div>
  );
}

export default DashboardPetugas;

