import { useState, useEffect, useMemo, useCallback } from "react";
import { FileText } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../components/NotificationProvider";
import { TRANSAKSI_UPDATED_EVENT } from "../../lib/events";
import { STATUS, getStatusLabel } from "../../lib/status";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

function Laporan() {
  const [transaksiList, setTransaksiList] = useState([]);
  const [mobilList, setMobilList] = useState([]);
  const [pelangganList, setPelangganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const notify = useNotification();

  const fetchData = useCallback(async () => {
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
        .select("*");

      if (mobilError) throw mobilError;

      // Fetch pelanggan
      const { data: pelanggan, error: pelangganError } = await supabase
        .from("pelanggan")
        .select("*");

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
  }, [notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalRevenue = () => {
    return transaksiList
      .filter((t) => t.status_transaksi === STATUS.SELESAI)
      .reduce((sum, t) => sum + (t.total_harga || 0), 0);
  };

  const statusOptions = useMemo(() => {
    // Ambil nilai status yang BENAR-BENAR ada di database
    const dbStatuses = [
      ...new Set(transaksiList.map((t) => t.status_transaksi).filter(Boolean)),
    ];
    console.log("Status values from database:", dbStatuses);

    // Buat options dari status yang ada di database
    const dbOptions = dbStatuses.map((status) => ({
      value: status, // Gunakan nilai PERSIS dari database
      label: getStatusLabel(status),
    }));

    // Jika tidak ada status di database, gunakan fallback dengan nilai yang mungkin valid
    if (dbOptions.length === 0) {
      console.warn("No status values found in database, using fallback");
      // Coba nilai yang mungkin valid berdasarkan constraint
      return [
        { value: "selesai", label: "Selesai" }, // Dari console log sebelumnya, "selesai" terlihat valid
        { value: "konfirmasi", label: "Konfirmasi" },
        { value: "berlangsung", label: "Berlangsung" },
      ];
    }

    // Tambahkan opsi yang mungkin belum ada di database tapi valid
    // Hanya tambahkan jika belum ada
    const allValidStatuses = [
      { value: "menunggu", label: "Menunggu" },
      { value: "konfirmasi", label: "Konfirmasi" },
      { value: "berlangsung", label: "Berlangsung" },
      { value: "selesai", label: "Selesai" },
    ];

    const missingOptions = allValidStatuses.filter(
      (opt) => !dbOptions.some((dbOpt) => dbOpt.value === opt.value)
    );

    return [...dbOptions, ...missingOptions];
  }, [transaksiList]);

  const handleStatusUpdate = async (idTransaksi, newStatus) => {
    try {
      setUpdatingStatusId(idTransaksi);

      // Langsung gunakan nilai yang dipilih dari dropdown tanpa modifikasi
      const statusToUpdate = String(newStatus).trim();

      console.log("Updating status:", {
        idTransaksi,
        statusValue: statusToUpdate,
      });

      // Update langsung dengan nilai yang dipilih
      const { error } = await supabase
        .from("transaksi")
        .update({ status_transaksi: statusToUpdate })
        .eq("id_transaksi", idTransaksi);

      if (error) {
        console.error("Status update error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          statusValue: statusToUpdate,
          originalStatus: newStatus,
        });
        throw error;
      }

      setTransaksiList((prev) =>
        prev.map((transaksi) =>
          transaksi.id_transaksi === idTransaksi
            ? { ...transaksi, status_transaksi: statusToUpdate }
            : transaksi
        )
      );
      notify(
        `Status pemesanan diperbarui menjadi ${getStatusLabel(
          statusToUpdate
        )}.`,
        "success"
      );
      window.dispatchEvent(new Event(TRANSAKSI_UPDATED_EVENT));
    } catch (err) {
      console.error("Error updating status:", err);
      notify("Gagal memperbarui status: " + err.message, "error");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-primary/20 p-2 sm:p-3 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : transaksiList.length}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Total Transaksi
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading
              ? "..."
              : transaksiList.filter(
                  (t) => t.status_transaksi === STATUS.MENUNGGU
                ).length}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Menunggu Konfirmasi
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading
              ? "..."
              : transaksiList.filter(
                  (t) => t.status_transaksi === STATUS.BERLANGSUNG
                ).length}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Sedang Berlangsung
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-green-500/20 p-2 sm:p-3 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading
              ? "..."
              : transaksiList.filter(
                  (t) => t.status_transaksi === STATUS.SELESAI
                ).length}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Transaksi Selesai
          </p>
        </div>
      </div>

      <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-lg">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
          </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-1">
          {loading
            ? "..."
            : formatCurrency(calculateTotalRevenue()).replace("Rp", "Rp ")}
        </h3>
        <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
          Total Pendapatan
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
          Laporan Penyewaan Kendaraan
        </h3>
      </div>

      {/* Table */}
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
                transaksiList.map((transaksi) => {
                  const mobil = mobilList.find(
                    (m) => m.id_mobil === transaksi.id_mobil
                  );
                  const pelanggan = pelangganList.find(
                    (p) => p.id_pelanggan === transaksi.id_pelanggan
                  );
                  return (
                    <TableRow key={transaksi.id_transaksi}>
                      <TableCell className="text-sm">
                        {transaksi.id_transaksi}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {mobil?.nama_mobil || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pelanggan?.nama || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaksi.tanggal_sewa}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaksi.tanggal_kembali}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatCurrency(transaksi.total_harga).replace(
                          "Rp",
                          "Rp "
                        )}
                      </TableCell>
                      <TableCell>
                        <select
                          value={transaksi.status_transaksi}
                          onChange={(e) => {
                            // Gunakan nilai PERSIS dari option, jangan modifikasi
                            const selectedValue = e.target.value;
                            console.log(
                              "Selected status from dropdown:",
                              selectedValue
                            );
                            handleStatusUpdate(
                              transaksi.id_transaksi,
                              selectedValue
                            );
                          }}
                          className="bg-dark text-white border border-dark-light rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:border-primary w-full sm:w-auto"
                          disabled={updatingStatusId === transaksi.id_transaksi}
                        >
                          {statusOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value} // Nilai PERSIS dari database
                              disabled={option.disabled}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
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

export default Laporan;
