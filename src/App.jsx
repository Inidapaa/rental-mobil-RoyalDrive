import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { router } from "./routes/router";
import "./App.css";
import { NotificationProvider } from "./components/NotificationProvider";

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
