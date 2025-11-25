import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useNotification } from "../contexts/NotificationContext";

function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nama: "",
    no_identitas: "",
    no_hp: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const notify = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["no_identitas", "no_hp"];
    const newValue = numericFields.includes(name)
      ? value.replace(/\D/g, "")
      : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter!");
      return;
    }

    try {
      setLoading(true);
      // Import supabase
      const { supabase } = await import("../lib/supabase");
      const result = await signUp(
        formData.email,
        formData.password,
        "pelanggan"
      );

      if (!result.success) {
        setError(result.error || "Gagal mendaftar");
        setLoading(false);
        return;
      }

      const { error: pelangganError } = await supabase
        .from("pelanggan")
        .insert([
          {
            nama: formData.nama,
            no_identitas: formData.no_identitas,
            no_hp: formData.no_hp,
            alamat: formData.alamat,
            email: formData.email,
            tanggal_daftar: new Date().toISOString().split("T")[0],
          },
        ])
        .select();

      if (pelangganError) {
        notify(
          "Registrasi berhasil, tapi ada masalah menyimpan data pelanggan. Silakan login dan lengkapi profil Anda.",
          "warning"
        );
      } else {
        notify("Registrasi berhasil! Silakan login.", "success");
      }

      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-12">
      <div className="max-w-md mx-auto px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
            DAFTAR AKUN
          </h1>
          <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
            BUAT AKUN BARU UNTUK MEMULAI
          </p>
        </div>

        <div className="bg-dark-light rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                Nama Lengkap *
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <label
                htmlFor="no_identitas"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                No. Identitas (KTP) *
              </label>
              <input
                type="text"
                id="no_identitas"
                name="no_identitas"
                value={formData.no_identitas}
                onChange={handleChange}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan nomor KTP"
              />
            </div>

            <div>
              <label
                htmlFor="no_hp"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                No. HP *
              </label>
              <input
                type="text"
                id="no_hp"
                name="no_hp"
                value={formData.no_hp}
                onChange={handleChange}
                required
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan nomor HP"
              />
            </div>

            <div>
              <label
                htmlFor="alamat"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                Alamat *
              </label>
              <textarea
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                required
                rows="3"
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Masukkan alamat lengkap"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                Alamat Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan email Anda"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                Kata Sandi *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                Konfirmasi Kata Sandi *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Ulangi kata sandi"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-dark-lighter py-3 rounded-lg font-bold hover:bg-primary-dark transition-all duration-300 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:shadow-[0_6px_30px_rgba(163,230,53,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Mendaftar..." : "DAFTAR"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a0a0a0]">
              Sudah punya akun?{" "}
              <Link
                reloadDocument
                to="/login"
                className="text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
