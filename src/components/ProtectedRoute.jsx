import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/useAuth";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Timeout untuk loading - jika lebih dari 5 detik, anggap sudah selesai
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[#a0a0a0]">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika role null tapi sudah authenticated, default ke pelanggan
  const effectiveRole = userRole || "pelanggan";

  if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole)) {
    // Redirect berdasarkan role
    if (effectiveRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    } else if (effectiveRole === "petugas") {
      return <Navigate to="/dashboard/petugas" replace />;
    } else if (effectiveRole === "pelanggan") {
      // Pelanggan tidak diarahkan ke dashboard, tetap di halaman utama
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

