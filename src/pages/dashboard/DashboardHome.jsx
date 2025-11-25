import { useState, useEffect, useCallback } from "react";
import { Car, CheckCircle2, Receipt, Calendar } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { STATUS, getStatusColor, getStatusLabel } from "../../lib/status";
import { useNotification } from "../../contexts/NotificationContext";

function DashboardHome() {
  const [stats, setStats] = useState({
    totalMobil: 0,
    mobilTersedia: 0,
    mobilDisewa: 0,
    totalTransaksi: 0,
    transaksiBulanIni: 0,
    totalPelanggan: 0,
    konfirmasiCount: 0,
    berlangsungCount: 0,
  });
  const [recentMobil, setRecentMobil] = useState([]);
  const [recentTransaksi, setRecentTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = useNotification();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch mobil
      const { data: mobilData, error: mobilError } = await supabase
        .from("mobil")
        .select("*");

      if (mobilError) throw mobilError;

      // Fetch transaksi
      const { data: transaksiData, error: transaksiError } = await supabase
        .from("transaksi")
        .select("*");

      if (transaksiError) throw transaksiError;

      // Fetch pelanggan
      const { data: pelangganData, error: pelangganError } = await supabase
        .from("pelanggan")
        .select("id_pelanggan");

      if (pelangganError) throw pelangganError;

      // Calculate stats
      const totalMobil = mobilData?.length || 0;
      const mobilTersedia =
        mobilData?.filter((m) => m.status === "tersedia").length || 0;
      const mobilDisewa =
        mobilData?.filter((m) => m.status === "disewa").length || 0;
      const totalTransaksi = transaksiData?.length || 0;

      // Transaksi bulan ini
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transaksiBulanIni =
        transaksiData?.filter(
          (t) => new Date(t.tanggal_sewa) >= firstDayOfMonth
        ).length || 0;

      const totalPelanggan = pelangganData?.length || 0;
      const konfirmasiCount =
        transaksiData?.filter(
          (t) => t.status_transaksi === STATUS.KONFIRMASI
        ).length || 0;
      const berlangsungCount =
        transaksiData?.filter(
          (t) => t.status_transaksi === STATUS.BERLANGSUNG
        ).length || 0;

      setStats({
        totalMobil,
        mobilTersedia,
        mobilDisewa,
        totalTransaksi,
        transaksiBulanIni,
        totalPelanggan,
        konfirmasiCount,
        berlangsungCount,
      });

      // Mobil terbaru ditambahkan (5 terbaru)
      const recentMobilList =
        mobilData?.sort((a, b) => b.id_mobil - a.id_mobil).slice(0, 5) || [];
      setRecentMobil(recentMobilList);

      // Transaksi terbaru (5 terbaru)
      const recentTransaksiList =
        transaksiData
          ?.sort((a, b) => b.id_transaksi - a.id_transaksi)
          .slice(0, 5) || [];
      setRecentTransaksi(recentTransaksiList);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      notify("Gagal memuat data dashboard: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Mobil */}
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-primary/20 p-2 sm:p-3 rounded-lg">
              <Car className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalMobil}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Total Mobil
          </p>
        </div>

        {/* Mobil Tersedia */}
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-green-500/20 p-2 sm:p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.mobilTersedia}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Mobil Tersedia
          </p>
        </div>

        {/* Total Transaksi */}
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalTransaksi}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Total Transaksi
          </p>
        </div>

        {/* Total Pelanggan */}
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.totalPelanggan}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Total Pelanggan
          </p>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-yellow-500/20 p-2 sm:p-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.konfirmasiCount}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Menunggu Konfirmasi
          </p>
        </div>

        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.berlangsungCount}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Sedang Berlangsung
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-pink-500/20 p-2 sm:p-3 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">
            {loading ? "..." : stats.transaksiBulanIni}
          </h3>
          <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide">
            Transaksi Bulan Ini
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase tracking-wide">
            Transaksi Terbaru
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="text-center py-4 text-[#a0a0a0]">
                Memuat data...
              </div>
            ) : recentTransaksi.length === 0 ? (
              <div className="text-center py-4 text-[#a0a0a0]">
                Tidak ada transaksi
              </div>
            ) : (
              recentTransaksi.map((transaksi) => (
                <div
                  key={transaksi.id_transaksi}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-dark-light rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm sm:text-base font-medium">
                      Transaksi #{transaksi.id_transaksi}
                    </p>
                    <p className="text-xs sm:text-sm text-[#a0a0a0]">
                      {formatDate(transaksi.tanggal_sewa)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-sm sm:text-base font-bold text-primary">
                      {formatCurrency(transaksi.total_harga).replace(
                        "Rp",
                        "Rp "
                      )}
                    </p>
                    <span
                      className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        transaksi.status_transaksi
                      )}`}
                    >
                      {getStatusLabel(transaksi.status_transaksi)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobil Terbaru Ditambahkan */}
        <div className="bg-dark-lighter rounded-xl p-4 sm:p-6 border border-dark-light">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 uppercase tracking-wide">
            Mobil Terbaru Ditambahkan
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <div className="text-center py-4 text-[#a0a0a0]">
                Memuat data...
              </div>
            ) : recentMobil.length === 0 ? (
              <div className="text-center py-4 text-[#a0a0a0]">
                Tidak ada mobil
              </div>
            ) : (
              recentMobil.map((mobil, index) => (
                <div
                  key={mobil.id_mobil}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 sm:p-4 bg-dark-light rounded-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium">{mobil.nama_mobil}</p>
                      <p className="text-xs sm:text-sm text-[#a0a0a0]">
                        {mobil.merk} - {mobil.tipe}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-xs sm:text-sm font-medium text-primary">
                      {formatCurrency(mobil.harga_sewa_harian).replace(
                        "Rp",
                        "Rp "
                      )}
                    </p>
                    <p className="text-xs text-[#a0a0a0]">
                      {mobil.status === "tersedia" ? "Tersedia" : "Disewa"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
