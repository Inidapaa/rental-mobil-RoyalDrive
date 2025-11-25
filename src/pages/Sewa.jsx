import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { supabase } from "../lib/supabase";
import { useNotification } from "../components/NotificationProvider";
import { TRANSAKSI_UPDATED_EVENT } from "../lib/events";
import { STATUS } from "../lib/status";
import { User } from "lucide-react";

function Sewa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, username, userRole } = useAuth();
  const notify = useNotification();
  const isPetugas = userRole === "petugas";
  const [mobil, setMobil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tanggalSewa, setTanggalSewa] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [noIdentitas, setNoIdentitas] = useState("");
  const [pelangganId, setPelangganId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data pelanggan untuk petugas
  const [formDataPelanggan, setFormDataPelanggan] = useState({
    nama: "",
    no_identitas: "",
    no_hp: "",
    email: "",
  });

  useEffect(() => {
    const fetchMobil = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("mobil")
          .select("*")
          .eq("id_mobil", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setError("Mobil tidak ditemukan.");
          return;
        }
        setMobil(data);
      } catch (err) {
        console.error("Error fetching mobil:", err);
        setError("Gagal memuat data mobil.");
      } finally {
        setLoading(false);
      }
    };

    fetchMobil();
  }, [id]);

  useEffect(() => {
    // Hanya fetch data pelanggan jika bukan petugas
    if (isPetugas) {
      return;
    }

    const fetchPelangganInfo = async () => {
      if (!user?.email) {
        return;
      }
      try {
        const { data, error } = await supabase
          .from("pelanggan")
          .select("id_pelanggan, no_identitas")
          .eq("email", user.email)
          .maybeSingle();

        if (error) throw error;
        setNoIdentitas(data?.no_identitas || "");
        setPelangganId(data?.id_pelanggan || null);
      } catch (err) {
        console.error("Error fetching pelanggan info:", err);
      }
    };

    fetchPelangganInfo();
  }, [user?.email, isPetugas]);

  const totalHari = useMemo(() => {
    if (!tanggalSewa || !tanggalKembali) return 0;
    const start = new Date(tanggalSewa);
    const end = new Date(tanggalKembali);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  }, [tanggalSewa, tanggalKembali]);

  const totalHarga = useMemo(() => {
    if (!mobil || totalHari <= 0) return 0;
    return totalHari * (mobil.harga_sewa_harian || 0);
  }, [mobil, totalHari]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(
        "/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }
    if (!tanggalSewa || !tanggalKembali) {
      notify("Mohon lengkapi tanggal sewa dan kembali.", "warning");
      return;
    }
    if (totalHari <= 0) {
      notify("Tanggal kembali harus setelah tanggal sewa.", "warning");
      return;
    }

    try {
      setSubmitting(true);

      let finalPelangganId = pelangganId;

      // Jika petugas, handle data pelanggan manual
      if (isPetugas) {
        // Validasi form pelanggan
        if (
          !formDataPelanggan.nama ||
          !formDataPelanggan.no_identitas ||
          !formDataPelanggan.no_hp ||
          !formDataPelanggan.email
        ) {
          notify("Mohon lengkapi semua data pelanggan.", "warning");
          setSubmitting(false);
          return;
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formDataPelanggan.email)) {
          notify("Format email tidak valid.", "warning");
          setSubmitting(false);
          return;
        }

        // Cek apakah pelanggan sudah ada berdasarkan email
        const { data: existingPelanggan, error: checkError } = await supabase
          .from("pelanggan")
          .select("id_pelanggan")
          .eq("email", formDataPelanggan.email)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingPelanggan) {
          // Update data pelanggan yang sudah ada
          finalPelangganId = existingPelanggan.id_pelanggan;
          const { error: updateError } = await supabase
            .from("pelanggan")
            .update({
              nama: formDataPelanggan.nama,
              no_identitas: formDataPelanggan.no_identitas,
              no_hp: formDataPelanggan.no_hp,
            })
            .eq("id_pelanggan", finalPelangganId);

          if (updateError) throw updateError;
        } else {
          // Insert pelanggan baru
          const { data: newPelanggan, error: insertError } = await supabase
            .from("pelanggan")
            .insert([
              {
                nama: formDataPelanggan.nama,
                no_identitas: formDataPelanggan.no_identitas,
                no_hp: formDataPelanggan.no_hp,
                email: formDataPelanggan.email,
                tanggal_daftar: new Date().toISOString().split("T")[0],
              },
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          finalPelangganId = newPelanggan.id_pelanggan;
        }
      } else {
        // Untuk pelanggan biasa, validasi seperti sebelumnya
        if (!pelangganId) {
          notify(
            "Data pelanggan belum lengkap. Harap lengkapi profil sebelum memesan.",
            "error"
          );
          setSubmitting(false);
          return;
        }
        if (!noIdentitas) {
          notify(
            "Nomor identitas belum tersedia. Lengkapi profil Anda terlebih dahulu.",
            "error"
          );
          setSubmitting(false);
          return;
        }
      }

      // Buat transaksi - Default status: "menunggu" untuk pelanggan dan petugas
      // Value yang valid: menunggu, konfirmasi, berlangsung, selesai
      const statusValue = "menunggu"; // Default untuk pelanggan dan petugas

      console.log("Final status value to insert:", statusValue);

      // Log data yang akan di-insert untuk debugging
      const transaksiData = {
        id_mobil: mobil.id_mobil,
        id_pelanggan: finalPelangganId,
        tanggal_sewa: tanggalSewa,
        tanggal_kembali: tanggalKembali,
        total_harga: totalHarga,
        status_transaksi: statusValue,
      };

      console.log("Inserting transaksi with data:", transaksiData);

      const { error: transaksiError } = await supabase
        .from("transaksi")
        .insert(transaksiData);

      if (transaksiError) {
        // Log error detail untuk debugging
        console.error("Error creating transaksi:", {
          code: transaksiError.code,
          message: transaksiError.message,
          details: transaksiError.details,
          hint: transaksiError.hint,
          statusValue: statusValue,
          transaksiData: transaksiData,
        });
        throw transaksiError;
      }

      notify(
        "Permintaan sewa berhasil dibuat! Silakan cek halaman pesanan.",
        "success"
      );
      window.dispatchEvent(new Event(TRANSAKSI_UPDATED_EVENT));
      navigate(isPetugas ? "/pesanan-petugas" : "/pesanan");
    } catch (err) {
      console.error("Error creating transaksi:", err);

      // Handle check constraint error dengan pesan yang lebih jelas
      if (err.code === "23514") {
        notify(
          "Status transaksi tidak valid. Silakan coba lagi atau hubungi administrator.",
          "error"
        );
        console.error(
          "Check constraint violation - Status value:",
          STATUS.KONFIRMASI
        );
      } else {
        notify("Gagal membuat transaksi: " + err.message, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        Memuat data mobil...
      </div>
    );
  }

  if (error || !mobil) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        {error || "Mobil tidak ditemukan."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <button
          onClick={() => navigate(-1)}
          className="text-[#a0a0a0] hover:text-primary transition-colors text-sm uppercase tracking-wide"
        >
          ← Kembali ke katalog
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
            <img
              src={mobil.foto || "/placeholder-car.jpg"}
              alt={mobil.nama_mobil}
              className="w-full h-72 object-cover"
            />
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm uppercase text-primary font-semibold tracking-wide">
                  {mobil.merk}
                </p>
                <h1 className="text-3xl font-bold">{mobil.nama_mobil}</h1>
                <p className="text-[#a0a0a0] text-sm">{mobil.tahun}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {formatCurrency(mobil.harga_sewa_harian)}
                </span>
                <span className="text-sm text-[#a0a0a0]">/ hari</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-[#a0a0a0]">
                <div>
                  <p className="text-white font-medium">Tipe</p>
                  <p className="capitalize">{mobil.tipe}</p>
                </div>
                <div>
                  <p className="text-white font-medium">Transmisi</p>
                  <p>{mobil.transmisi}</p>
                </div>
                <div>
                  <p className="text-white font-medium">Mesin</p>
                  <p>{mobil.kapasitas_mesin}</p>
                </div>
                <div>
                  <p className="text-white font-medium">Status</p>
                  <p className="capitalize">{mobil.status}</p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-dark-lighter rounded-xl border border-dark-light p-6 space-y-5"
          >
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-4">
              Detail Penyewaan
            </h2>

            {/* Form untuk Petugas - Input Manual Data Pelanggan */}
            {isPetugas ? (
              <>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-light">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold uppercase tracking-wide">
                    Data Pelanggan
                  </h3>
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">
                    Nama Lengkap Pelanggan *
                  </label>
                  <input
                    type="text"
                    value={formDataPelanggan.nama}
                    onChange={(e) =>
                      setFormDataPelanggan({
                        ...formDataPelanggan,
                        nama: e.target.value,
                      })
                    }
                    className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">
                    Nomor Identitas / KTP *
                  </label>
                  <input
                    type="text"
                    value={formDataPelanggan.no_identitas}
                    onChange={(e) =>
                      setFormDataPelanggan({
                        ...formDataPelanggan,
                        no_identitas: e.target.value,
                      })
                    }
                    className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">
                    No. HP *
                  </label>
                  <input
                    type="tel"
                    value={formDataPelanggan.no_hp}
                    onChange={(e) =>
                      setFormDataPelanggan({
                        ...formDataPelanggan,
                        no_hp: e.target.value,
                      })
                    }
                    className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formDataPelanggan.email}
                    onChange={(e) =>
                      setFormDataPelanggan({
                        ...formDataPelanggan,
                        email: e.target.value,
                      })
                    }
                    className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Form untuk Pelanggan - Read Only */}
                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={username || ""}
                    readOnly
                    className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-[#a0a0a0] mt-1">
                    Nama diambil dari akun pelanggan.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-[#a0a0a0] mb-2">
                    Nomor Identitas / KTP
                  </label>
                  <input
                    type="text"
                    value={noIdentitas || ""}
                    readOnly
                    className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-[#a0a0a0] mt-1">
                    Nomor identitas diambil dari akun dan tidak dapat diubah di
                    sini.
                    {(!noIdentitas || !pelangganId) &&
                      " Lengkapi data di halaman Edit Profil sebelum memesan."}
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-[#a0a0a0] mb-2">
                Tanggal Sewa
              </label>
              <input
                type="date"
                value={tanggalSewa}
                onChange={(e) => setTanggalSewa(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-[#a0a0a0] mb-2">
                Tanggal Kembali
              </label>
              <input
                type="date"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                min={tanggalSewa || new Date().toISOString().split("T")[0]}
                className="w-full bg-dark text-white border border-dark-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
              <div className="bg-dark rounded-lg p-4 border border-dark-light">
                <p className="text-sm text-[#a0a0a0]">Durasi</p>
                <p className="text-xl sm:text-2xl font-bold whitespace-nowrap">
                  {totalHari} Hari
                </p>
              </div>
              <div className="bg-dark rounded-lg p-4 border border-dark-light">
                <p className="text-sm text-[#a0a0a0]">Total Harga</p>
                <p className="text-xl sm:text-2xl font-bold text-primary break-all sm:break-normal leading-tight">
                  {formatCurrency(totalHarga)}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || mobil.status !== "tersedia"}
              className="w-full bg-primary text-dark-lighter py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors duration-300 flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Memproses..." : "KIRIM PERMINTAAN SEWA"}
            </button>
            {mobil.status !== "tersedia" && (
              <p className="text-center text-sm text-[#a0a0a0]">
                Mobil ini sedang disewa. Silakan pilih mobil lain.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Sewa;
