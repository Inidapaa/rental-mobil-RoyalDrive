import { createBrowserRouter } from "react-router-dom";
import { roleLoader } from "../middleware/roleLoader";

// Public Pages
import Landing from "../pages/Landing";
import Catalog from "../pages/Catalog";
import About from "../pages/About";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

// Protected Pages - Pelanggan
import EditProfil from "../pages/EditProfil";
import Pesanan from "../pages/Pesanan";
import Sewa from "../pages/Sewa";

// Protected Pages - Petugas
import PesananPetugas from "../pages/PesananPetugas";

// Protected Pages - Dashboard
import DashboardHome from "../pages/dashboard/DashboardHome";
import MobilCRUD from "../pages/dashboard/MobilCRUD";
import PelangganCRUD from "../pages/dashboard/PelangganCRUD";
import EditUser from "../pages/dashboard/EditUser";
import Laporan from "../pages/dashboard/Laporan";
import DashboardPetugas from "../pages/dashboard/DashboardPetugas";

// Layout
import DashboardLayout from "../components/DashboardLayout";
import PublicLayout from "../components/PublicLayout";

// Mapping
const components = {
  Landing,
  Catalog,
  About,
  Login,
  Register,
  NotFound,
  EditProfil,
  Pesanan,
  Sewa,
  PesananPetugas,
  DashboardHome,
  MobilCRUD,
  PelangganCRUD,
  EditUser,
  Laporan,
  DashboardPetugas,
};

// import route definitions
import {
  publicRoutes,
  pelangganRoutes,
  petugasRoutes,
  dashboardRoutes,
} from "./routeDefinitions";

/**
 * convert route definitions ke format react router
 */
function createRoutes(routeDefs) {
  return routeDefs
    .map((route) => {
      const Component = components[route.component];
      if (!Component) {
        console.error(`Component ${route.component} not found`);
        return null;
      }

      const routeConfig = {
        ...route,
        element: <Component />,
      };

      delete routeConfig.component;
      if (route.loader) {
        routeConfig.loader = roleLoader(route.loader);
      }

      return routeConfig;
    })
    .filter(Boolean);
}

/**
 * Konfigurasi router utama
 */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      // Public routes
      ...createRoutes(publicRoutes),
      // Protected routes untuk pelanggan
      ...createRoutes(pelangganRoutes),
      // Protected routes untuk petugas
      ...createRoutes(petugasRoutes),
      // Not found route
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  // Dashboard routes dengan layout
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    loader: roleLoader(["admin", "petugas"]),
    children: createRoutes(dashboardRoutes),
  },
]);
