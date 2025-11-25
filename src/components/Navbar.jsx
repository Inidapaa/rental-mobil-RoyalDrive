import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/useAuth";
import {
  User,
  LogOut,
  Settings,
  ShoppingBag,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { TRANSAKSI_UPDATED_EVENT } from "../lib/events";
import { STATUS } from "../lib/status";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingPesanan, setPendingPesanan] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userRole, user, username, signOut } = useAuth();

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchPendingPesanan = useCallback(async () => {
    if (!(isAuthenticated && userRole === "pelanggan" && user?.email)) {
      setPendingPesanan(0);
      return;
    }

    try {
      const { data: pelanggan, error } = await supabase
        .from("pelanggan")
        .select("id_pelanggan")
        .eq("email", user.email)
        .maybeSingle();

      if (error || !pelanggan?.id_pelanggan) {
        setPendingPesanan(0);
        return;
      }

      const { count, error: countError } = await supabase
        .from("transaksi")
        .select("*", { count: "exact", head: true })
        .eq("id_pelanggan", pelanggan.id_pelanggan)
        .eq("status_transaksi", STATUS.KONFIRMASI);

      if (countError) throw countError;
      setPendingPesanan(count || 0);
    } catch (err) {
      console.error("Error fetching pending pesanan:", err);
      setPendingPesanan(0);
    }
  }, [isAuthenticated, userRole, user?.email]);

  useEffect(() => {
    fetchPendingPesanan();
    const interval = setInterval(fetchPendingPesanan, 60000);
    const handler = () => fetchPendingPesanan();
    window.addEventListener(TRANSAKSI_UPDATED_EVENT, handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener(TRANSAKSI_UPDATED_EVENT, handler);
    };
  }, [fetchPendingPesanan]);

  const menuKey = `${location.pathname}-${isAuthenticated}-${userRole}-${
    user?.id || "none"
  }`;

  // Handle logout
  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("🔄 Logout button clicked in Navbar");
    setShowProfileMenu(false);

    try {
      console.log("🔄 Calling signOut from Navbar...");
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ Logout error in Navbar:", error);
      // Jika signOut gagal, tetap force refresh dan clear storage
      setShowProfileMenu(false);

      // Clear storage manual
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith("sb-") ||
          key.includes("supabase") ||
          key.includes("auth")
        ) {
          localStorage.removeItem(key);
        }
      });
      Object.keys(sessionStorage).forEach((key) => {
        if (
          key.startsWith("sb-") ||
          key.includes("supabase") ||
          key.includes("auth")
        ) {
          sessionStorage.removeItem(key);
        }
      });

      // Force refresh ke home
      window.location.replace(window.location.origin + "/");
    }
  };

  // Render berdasarkan state - sederhana dan langsung
  const isAdmin = isAuthenticated && userRole === "admin";
  const isPetugas = isAuthenticated && userRole === "petugas";
  const isStaff = isAdmin || isPetugas; // Admin atau Petugas

  const navLinkClass = (path) =>
    `text-white text-lg font-medium transition-colors duration-300 relative hover:text-primary md:text-base uppercase tracking-wide after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full ${
      location.pathname === path ? "text-primary after:w-full" : ""
    }`;

  const renderNavLinks = (onNavigate = () => {}, variant = "desktop") => (
    <div
      className={
        variant === "desktop"
          ? "flex gap-10 items-center md:gap-6"
          : "flex flex-col gap-4"
      }
    >
      <Link
        reloadDocument
        to="/"
        className={navLinkClass("/")}
        onClick={onNavigate}
      >
        HOME
      </Link>
      <Link
        reloadDocument
        to="/catalog"
        className={navLinkClass("/catalog")}
        onClick={onNavigate}
      >
        CATALOG
      </Link>
      <Link
        reloadDocument
        to="/about"
        className={navLinkClass("/about")}
        onClick={onNavigate}
      >
        ABOUT
      </Link>
    </div>
  );

  const renderDesktopAuth = () => {
    if (!(isAuthenticated && user)) {
      return (
        <Link
          reloadDocument
          to="/login"
          className="bg-white text-dark-lighter px-7 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-primary hover:text-dark-lighter hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(163,230,53,0.3)] md:px-5 md:py-2.5 md:text-base uppercase tracking-wide"
        >
          MASUK
        </Link>
      );
    }

    if (isStaff) {
      return (
        <div className="flex items-center gap-3">
          {isPetugas && (
            <Link
              reloadDocument
              to="/pesanan-petugas"
              className="flex items-center gap-2 bg-dark-lighter px-4 py-2 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-dark-light hover:-translate-y-0.5 md:text-base uppercase tracking-wide border border-dark-light relative"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {pendingPesanan > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-dark-lighter text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                    {pendingPesanan > 99 ? "99+" : pendingPesanan}
                  </span>
                )}
              </div>
              <span className="hidden md:block">PESANAN</span>
            </Link>
          )}
          <Link
            reloadDocument
            to={isAdmin ? "/dashboard" : "/dashboard/petugas"}
            className="flex items-center gap-2 bg-dark-lighter px-4 py-2 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-dark-light hover:-translate-y-0.5 md:text-base uppercase tracking-wide border border-dark-light"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden md:block">DASHBOARD</span>
          </Link>
          <div className="relative" key={`${menuKey}-staff`}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 bg-dark-lighter px-4 py-2 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-dark-light hover:-translate-y-0.5 md:text-base uppercase tracking-wide border border-dark-light"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark-lighter font-bold shrink-0">
                {username?.charAt(0).toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  "U"}
              </div>
              <span className="hidden md:block">
                {username || user.email?.split("@")[0] || "User"}
              </span>
              <User className="w-5 h-5" />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-dark-lighter border border-dark-light rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-dark-light">
                    <p className="text-sm font-medium text-white">
                      {user.email}
                    </p>
                    <p className="text-xs text-[#a0a0a0] mt-1">
                      {isAdmin ? "Admin" : "Petugas"}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        handleLogout(e);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-dark-light transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          reloadDocument
          to="/pesanan"
          className="flex items-center gap-2 bg-dark-lighter px-4 py-2 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-dark-light hover:-translate-y-0.5 md:text-base uppercase tracking-wide border border-dark-light relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {pendingPesanan > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-dark-lighter text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                {pendingPesanan > 99 ? "99+" : pendingPesanan}
              </span>
            )}
          </div>
          <span className="hidden md:block">PESANAN</span>
        </Link>
        <div className="relative" key={menuKey}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 bg-dark-lighter px-4 py-2 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-dark-light hover:-translate-y-0.5 md:text-base uppercase tracking-wide border border-dark-light"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark-lighter font-bold shrink-0">
              {username?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <span className="hidden md:block">
              {username || user.email?.split("@")[0] || "User"}
            </span>
            <User className="w-5 h-5" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-dark-lighter border border-dark-light rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-dark-light">
                  <p className="text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-[#a0a0a0] mt-1">Pelanggan</p>
                </div>
                <div className="py-1">
                  <Link
                    reloadDocument
                    to="/edit-profil"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white hover:bg-dark-light transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profil
                  </Link>
                </div>
                <div className="py-1 border-t border-dark-light">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleLogout(e);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-dark-light transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMobileAuth = (onNavigate = () => {}) => {
    if (!(isAuthenticated && user)) {
      return (
        <Link
          reloadDocument
          to="/login"
          onClick={onNavigate}
          className="w-full bg-primary text-dark px-4 py-3 rounded-lg font-semibold uppercase tracking-wide text-center"
        >
          Masuk
        </Link>
      );
    }

    if (isStaff) {
      return (
        <div className="space-y-3">
          {isPetugas && (
            <Link
              reloadDocument
              to="/pesanan-petugas"
              onClick={onNavigate}
              className="relative w-full flex items-center justify-center gap-2 bg-dark-lighter border border-dark-light px-4 py-3 rounded-lg font-semibold uppercase tracking-wide"
            >
              <ShoppingBag className="w-5 h-5" />
              Pesanan
              {pendingPesanan > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-dark-lighter text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                  {pendingPesanan > 99 ? "99+" : pendingPesanan}
                </span>
              )}
            </Link>
          )}
          <Link
            reloadDocument
            to={isAdmin ? "/dashboard" : "/dashboard/petugas"}
            onClick={onNavigate}
            className="w-full flex items-center justify-center gap-2 bg-dark-lighter border border-dark-light px-4 py-3 rounded-lg font-semibold uppercase tracking-wide"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={(e) => {
              handleLogout(e);
              onNavigate("/");
            }}
            className="w-full flex items-center justify-center gap-2 bg-dark-lighter border border-red-500/40 px-4 py-3 rounded-lg font-semibold text-red-300 uppercase tracking-wide"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Link
          reloadDocument
          to="/pesanan"
          onClick={onNavigate}
          className="relative w-full flex items-center justify-center gap-2 bg-dark-lighter border border-dark-light px-4 py-3 rounded-lg font-semibold uppercase tracking-wide"
        >
          <ShoppingBag className="w-5 h-5" />
          Pesanan
          {pendingPesanan > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-dark-lighter text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg">
              {pendingPesanan > 99 ? "99+" : pendingPesanan}
            </span>
          )}
        </Link>
        <Link
          reloadDocument
          to="/edit-profil"
          onClick={onNavigate}
          className="w-full flex items-center justify-center gap-2 bg-dark-lighter border border-dark-light px-4 py-3 rounded-lg font-semibold uppercase tracking-wide"
        >
          <Settings className="w-5 h-5" />
          Edit Profil
        </Link>
        <button
          type="button"
          onClick={(e) => {
            handleLogout(e);
            onNavigate("/");
          }}
          className="w-full flex items-center justify-center gap-2 bg-dark-lighter border border-red-500/40 px-4 py-3 rounded-lg font-semibold text-red-300 uppercase tracking-wide"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-1000 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-lighter backdrop-blur-[10px] py-5 shadow-lg"
          : "bg-transparent backdrop-blur-[10px] py-6"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-8 md:px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-dark-light text-white"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <Link
              reloadDocument
              to="/#"
              className="text-3xl font-bold text-primary tracking-wide"
            >
              RoyalDrive<span className="text-white text-xl">.com</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center">
            {renderNavLinks()}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {renderDesktopAuth()}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-6 border-t border-dark-light pt-4">
            {renderNavLinks(() => setMobileMenuOpen(false), "mobile")}
            {renderMobileAuth(() => setMobileMenuOpen(false))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
