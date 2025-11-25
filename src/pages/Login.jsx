import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, userRole, isAuthenticated } = useAuth();

  // Redirect setelah login berhasil
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const timer = setTimeout(() => {
        if (userRole === "admin") {
          window.location.href = "/dashboard";
        } else if (userRole === "petugas") {
          window.location.href = "/dashboard/petugas";
        } else {
          window.location.href = "/";
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const result = await signIn(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || "Email atau password salah");
        setLoading(false);
        return;
      }

      // State akan ter-update via AuthContext, useEffect akan handle redirect
      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Terjadi kesalahan saat login");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-12">
      <div className="max-w-md mx-auto px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
            SELAMAT DATANG KEMBALI
          </h1>
          <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
            MASUK KE AKUN ANDA
          </p>
        </div>

        <div className="bg-dark-light rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2 text-[#e0e0e0]"
              >
                Alamat Email
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
                Kata Sandi
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                placeholder="Masukkan kata sandi Anda"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-dark-lighter py-3 rounded-lg font-bold hover:bg-primary-dark transition-all duration-300 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:shadow-[0_6px_30px_rgba(163,230,53,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "MASUK"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a0a0a0]">
              Belum punya akun?{" "}
              <Link
                reloadDocument
                to="/register"
                className="text-primary hover:text-primary-dark font-semibold transition-colors"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
