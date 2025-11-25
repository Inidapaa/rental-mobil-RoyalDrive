import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { supabase } from "../../lib/supabase";
import { getStatusColor, getStatusLabel } from "../../lib/status";
import { useNotification } from "../../contexts/NotificationContext";

function TransaksiCRUD() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [mobilList, setMobilList] = useState([]);
  const [pelangganList, setPelangganList] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch transaksi
      const { data: transaksi, error: transaksiError } = await supabase
        .from("transaksi")
        .select("*")
        .order("id_transaksi", { ascending: false });

      if (transaksiError) throw transaksiError;

      // Fetch mobil
      const { data: mobil, error: mobilError } = await supabase
        .from("mobil")
        .select("id_mobil, nama_mobil");

      if (mobilError) throw mobilError;

      // Fetch pelanggan
      const { data: pelanggan, error: pelangganError } = await supabase
        .from("pelanggan")
        .select("id_pelanggan, nama");

      if (pelangganError) throw pelangganError;

      setTransaksiList(transaksi || []);
      setMobilList(mobil || []);
      setPelangganList(pelanggan || []);
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
      {loading && !transaksiList.length && (
        <div className="text-center py-8 text-[#a0a0a0]">Memuat data...</div>
      )}

      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-dark-light hover:bg-dark-light">
              <TableHead>ID</TableHead>
              <TableHead>Mobil</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tanggal Sewa</TableHead>
              <TableHead>Tanggal Kembali</TableHead>
              <TableHead>Total Harga</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaksiList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-[#a0a0a0]"
                >
                  {loading ? "Memuat data..." : "Tidak ada data transaksi"}
                </TableCell>
              </TableRow>
            ) : (
              transaksiList.map((transaksi) => (
                <TableRow key={transaksi.id_transaksi}>
                  <TableCell className="text-sm">
                    {transaksi.id_transaksi}
                  </TableCell>
                  <TableCell className="text-sm">
                    {mobilList.find((m) => m.id_mobil === transaksi.id_mobil)
                      ?.nama_mobil || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pelangganList.find(
                      (p) => p.id_pelanggan === transaksi.id_pelanggan
                    )?.nama || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {transaksi.tanggal_sewa}
                  </TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}

export default TransaksiCRUD;
