import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  Users,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Menu,
  X,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "./ui/sidebar";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/useAuth";
import { supabase } from "../lib/supabase";
import { STATUS } from "../lib/status";
import { TRANSAKSI_UPDATED_EVENT } from "../lib/events";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pendingAdminCount, setPendingAdminCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, user, signOut } = useAuth();

  const fetchPendingAdminCount = useCallback(async () => {
    if (userRole !== "admin") {
      setPendingAdminCount(0);
      return;
    }
    try {
      const { count, error } = await supabase
        .from("transaksi")
        .select("*", { count: "exact", head: true })
        .eq("status_transaksi", STATUS.KONFIRMASI);

      if (error) throw error;
      setPendingAdminCount(count || 0);
    } catch (err) {
      console.error("Error fetching pending transaksi:", err);
      setPendingAdminCount(0);
    }
  }, [userRole]);

  useEffect(() => {
    fetchPendingAdminCount();
  }, [fetchPendingAdminCount]);

  useEffect(() => {
    const handler = () => fetchPendingAdminCount();
    window.addEventListener(TRANSAKSI_UPDATED_EVENT, handler);
    return () => window.removeEventListener(TRANSAKSI_UPDATED_EVENT, handler);
  }, [fetchPendingAdminCount]);

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      window.location.href = "/";
    }
  };

  const menuItems =
    userRole === "admin"
      ? [
          {
            title: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            title: "Data Mobil",
            path: "/dashboard/mobil",
            icon: Car,
          },
          {
            title: "Data Pelanggan",
            path: "/dashboard/pelanggan-data",
            icon: Users,
          },
          {
            title: "Data Petugas",
            path: "/dashboard/user",
            icon: User,
          },
          {
            title: "Laporan",
            path: "/dashboard/laporan",
            icon: FileText,
            badge: pendingAdminCount,
          },
        ]
      : userRole === "petugas"
      ? [
          {
            title: "Dashboard",
            path: "/dashboard/petugas",
            icon: LayoutDashboard,
          },
          {
            title: "Data Mobil",
            path: "/dashboard/mobil",
            icon: Car,
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-dark text-white flex">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        className={cn(
          "bg-dark-lighter border-r border-dark-light transition-all duration-300 fixed h-screen z-50",
          sidebarOpen ? "w-64" : "w-20",
          "lg:translate-x-0",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarHeader>
          <div className="flex items-center justify-between w-full">
            {sidebarOpen && (
              <h1 className="text-xl lg:text-2xl font-bold text-primary tracking-wide">
                RoyalDrive
              </h1>
            )}
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#a0a0a0] hover:text-primary transition-colors p-2 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
              {/* Desktop toggle button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-[#a0a0a0] hover:text-primary transition-colors p-2 hidden lg:block"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    onClick={() => handleNavigation(item.path)}
                    isActive={isActive}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="w-5 h-5 shrink-0" />
                      {sidebarOpen && (
                        <span className="uppercase tracking-wide">
                          {item.title}
                        </span>
                      )}
                      {item.badge > 0 && (
                        <span
                          className={`text-xs font-bold rounded-full px-2 py-0.5 bg-primary/20 text-primary ml-auto ${
                            sidebarOpen ? "" : ""
                          }`}
                        >
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenuButton onClick={() => navigate("/")} className="w-full">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && (
              <span className="uppercase tracking-wide">Keluar</span>
            )}
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 w-full",
          "lg:ml-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Header */}
        <header className="bg-dark-lighter border-b border-dark-light sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile hamburger menu */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-[#a0a0a0] hover:text-primary transition-colors p-2 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-wide">
                  {menuItems.find((item) => item.path === location.pathname)
                    ?.title || "Dashboard"}
                </h2>
                <p className="text-xs sm:text-sm text-[#a0a0a0] mt-1">
                  {location.pathname === "/dashboard" ||
                  location.pathname === "/dashboard/petugas"
                    ? "Ringkasan data mobil dan penjualan"
                    : location.pathname === "/dashboard/mobil"
                    ? "Kelola data mobil rental"
                    : location.pathname === "/dashboard/pelanggan-data"
                    ? "Kelola data pelanggan"
                    : location.pathname === "/dashboard/laporan"
                    ? "Laporan penyewaan kendaraan"
                    : "Kelola data petugas"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  className="flex items-center gap-2 sm:gap-3 bg-dark border border-dark-light px-2 sm:px-4 py-2 rounded-lg hover:border-primary transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-dark-lighter font-bold shrink-0 text-sm sm:text-base">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs sm:text-sm font-medium">
                      {userRole === "admin"
                        ? "Admin"
                        : userRole === "petugas"
                        ? "Petugas"
                        : "Pelanggan"}
                    </p>
                    <p className="text-xs text-[#a0a0a0] hidden md:block">
                      {user?.email || "User"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-[#a0a0a0] hidden sm:block" />
                </button>

                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-60 bg-dark-lighter border border-dark-light rounded-lg shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-dark-light">
                        <p className="text-sm font-semibold">{user?.email}</p>
                        <p className="text-xs text-[#a0a0a0]">
                          {userRole === "admin"
                            ? "Administrator"
                            : userRole === "petugas"
                            ? "Petugas"
                            : "Pelanggan"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-dark hover:text-red-300 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
