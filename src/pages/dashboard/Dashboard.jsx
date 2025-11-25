import DashboardHome from "./DashboardHome";
import MobilCRUD from "./MobilCRUD";
import TransaksiCRUD from "./TransaksiCRUD";
import PelangganCRUD from "./PelangganCRUD";
import EditUser from "./EditUser";
import DashboardPetugas from "./DashboardPetugas";
import Laporan from "./Laporan";
import { useLocation } from "react-router-dom";

function Dashboard() {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case "/dashboard":
        return <DashboardHome />;
      case "/dashboard/mobil":
        return <MobilCRUD />;
      case "/dashboard/transaksi":
        return <TransaksiCRUD />;
      case "/dashboard/pelanggan-data":
        return <PelangganCRUD />;
      case "/dashboard/user":
        return <EditUser />;
      case "/dashboard/laporan":
        return <Laporan />;
      case "/dashboard/petugas":
        return <DashboardPetugas />;
      default:
        return <DashboardHome />;
    }
  };

  return renderContent();
}

export default Dashboard;
