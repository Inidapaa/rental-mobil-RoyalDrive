/**
 * Public routes - tidak memerlukan authentication
 */
export const publicRoutes = [
  {
    path: "/",
    component: "Landing",
  },
  {
    path: "/catalog",
    component: "Catalog",
  },
  {
    path: "/about",
    component: "About",
  },
  {
    path: "/login",
    component: "Login",
  },
  {
    path: "/register",
    component: "Register",
  },
];

/**
 * Protected routes untuk pelanggan
 */
export const pelangganRoutes = [
  {
    path: "/edit-profil",
    component: "EditProfil",
    loader: ["pelanggan"],
  },
  {
    path: "/pesanan",
    component: "Pesanan",
    loader: ["pelanggan"],
  },
  {
    path: "/sewa/:id",
    component: "Sewa",
    loader: ["pelanggan", "petugas"],
  },
];

/**
 * Protected routes untuk petugas
 */
export const petugasRoutes = [
  {
    path: "/pesanan-petugas",
    component: "PesananPetugas",
    loader: ["petugas"],
  },
];

/**
 * Dashboard routes untuk admin dan petugas
 */
export const dashboardRoutes = [
  {
    index: true,
    component: "DashboardHome",
    loader: ["admin"],
  },
  {
    path: "mobil",
    component: "MobilCRUD",
    loader: ["admin", "petugas"],
  },
  {
    path: "pelanggan-data",
    component: "PelangganCRUD",
    loader: ["admin"],
  },
  {
    path: "user",
    component: "EditUser",
    loader: ["admin"],
  },
  {
    path: "laporan",
    component: "Laporan",
    loader: ["admin"],
  },
  {
    path: "petugas",
    component: "DashboardPetugas",
    loader: ["petugas"],
  },
];
