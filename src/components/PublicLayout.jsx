import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PublicLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="App">
      {!isDashboard && <Navbar />}
      <Outlet />
      {!isDashboard && <Footer />}
    </div>
  );
}

export default PublicLayout;

