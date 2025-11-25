import { Link } from "react-router-dom";
import { Home } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-screen bg-dark text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Halaman Tidak Ditemukan</h2>
        <p className="text-[#a0a0a0] mb-8">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link
          reloadDocument
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-dark-lighter px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300"
        >
          <Home className="w-5 h-5" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
