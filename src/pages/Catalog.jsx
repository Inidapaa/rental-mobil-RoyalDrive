import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 8;

function Catalog() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    merk: "",
    search: "",
  });
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMobil = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("mobil")
          .select("*")
          .order("id_mobil", { ascending: false });

        if (error) throw error;
        setCars(data || []);
      } catch (err) {
        console.error("Error fetching mobil:", err);
        setError("Gagal memuat data mobil.");
      } finally {
        setLoading(false);
      }
    };

    fetchMobil();
  }, []);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesType = filters.type ? car.tipe === filters.type : true;
      const matchesMerk = filters.merk ? car.merk === filters.merk : true;
      const matchesSearch = filters.search
        ? `${car.nama_mobil} ${car.merk}`
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;

      return matchesType && matchesMerk && matchesSearch;
    });
  }, [cars, filters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, cars.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCars.length / ITEMS_PER_PAGE)
  );
  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCars.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCars, currentPage]);

  // Total halaman
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("ellipsis");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);

  return (
    <div className="min-h-screen bg-dark text-white pt-20 sm:pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
            CATALOG
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#a0a0a0]">
            CARI MOBIL KESUKAANMU
          </p>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-dark-light">
          <div className="flex-1 min-w-full sm:min-w-[240px]">
            <label className="block text-xs sm:text-sm font-medium mb-2 text-[#a0a0a0]">
              Cari Mobil
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Cari berdasarkan nama atau merk..."
              className="w-full bg-dark-light text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-dark-light focus:outline-none focus:border-primary transition-colors text-sm sm:text-base"
            />
          </div>
          <div className="min-w-full sm:min-w-[200px] flex-1 sm:flex-initial">
            <label className="block text-xs sm:text-sm font-medium mb-2 text-[#a0a0a0]">
              Tipe
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full bg-dark-light text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-dark-light focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm sm:text-base"
            >
              <option value="">Semua</option>
              {[...new Set(cars.map((car) => car.tipe).filter(Boolean))].map(
                (tipe) => (
                  <option key={tipe} value={tipe}>
                    {tipe}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="min-w-full sm:min-w-[200px] flex-1 sm:flex-initial">
            <label className="block text-xs sm:text-sm font-medium mb-2 text-[#a0a0a0]">
              Merk
            </label>
            <select
              value={filters.merk}
              onChange={(e) => setFilters({ ...filters, merk: e.target.value })}
              className="w-full bg-dark-light text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-dark-light focus:outline-none focus:border-primary transition-colors cursor-pointer text-sm sm:text-base"
            >
              <option value="">Semua</option>
              {[...new Set(cars.map((car) => car.merk).filter(Boolean))].map(
                (merk) => (
                  <option key={merk} value={merk}>
                    {merk}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-[#a0a0a0]">
            Memuat data mobil...
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20 text-[#a0a0a0]">
            Tidak ada mobil yang sesuai dengan filter.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedCars.map((car) => (
                <div
                  key={car.id_mobil}
                  className="bg-dark-light rounded-xl overflow-hidden hover:shadow-[0_8px_32px_rgba(163,230,53,0.1)] transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="relative h-48 bg-dark-lighter overflow-hidden">
                    <img
                      src={car.foto || "/placeholder-car.jpg"}
                      alt={car.nama_mobil}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="absolute top-4 left-4 bg-primary text-dark-lighter text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {car.status === "tersedia" ? "Tersedia" : "Disewa"}
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm uppercase text-primary font-semibold tracking-wide">
                        {car.merk}
                      </p>
                      <h3 className="text-2xl font-bold truncate">
                        {car.nama_mobil}
                      </h3>
                      <p className="text-sm text-[#a0a0a0]">{car.tahun}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {formatCurrency(car.harga_sewa_harian)}
                      </span>
                      <span className="text-sm text-[#a0a0a0]">/ hari</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[#a0a0a0]">
                      <div>
                        <p className="text-white font-medium">Transmisi</p>
                        <p>{car.transmisi}</p>
                      </div>
                      <div>
                        <p className="text-white font-medium">Mesin</p>
                        <p>{car.kapasitas_mesin}</p>
                      </div>
                      <div>
                        <p className="text-white font-medium">Tipe</p>
                        <p className="capitalize">{car.tipe}</p>
                      </div>
                      <div>
                        <p className="text-white font-medium">Status</p>
                        <p className="capitalize">{car.status}</p>
                      </div>
                    </div>
                    <button
                      disabled={car.status !== "tersedia"}
                      onClick={() => navigate(`/sewa/${car.id_mobil}`)}
                      className="w-full bg-primary text-dark-lighter py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors duration-300 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>
                        {car.status === "tersedia"
                          ? "SEWA SEKARANG"
                          : "SEDANG DISEWA"}
                      </span>
                      {car.status === "tersedia" && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8">
                <p className="text-xs sm:text-sm text-[#a0a0a0] text-center md:text-left">
                  Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredCars.length)}{" "}
                  dari {filteredCars.length} mobil
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#e0e0e0] text-[#333] text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#d0d0d0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#e0e0e0]"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((page, index) => {
                    if (page === "ellipsis") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-1 sm:px-2 text-[#333] text-xs sm:text-sm"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors ${
                          currentPage === page
                            ? "bg-[#333] text-white"
                            : "bg-[#e0e0e0] text-[#333] hover:bg-[#d0d0d0]"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#e0e0e0] text-[#333] text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#d0d0d0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#e0e0e0]"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Catalog;
