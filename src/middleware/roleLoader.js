import { redirect } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * Middleware untuk role-based access control
 * @param {string[]} allowedRoles - Array role yang diizinkan mengakses route
 * @returns {Function} Loader function untuk React Router
 */
export function roleLoader(allowedRoles) {
  return async ({ request }) => {
    const { data } = await supabase.auth.getSession();
    
    // Jika tidak ada session, redirect ke login
    if (!data?.session) {
      const url = new URL(request.url);
      return redirect(`/login?redirect=${encodeURIComponent(url.pathname)}`);
    }

    // Fetch role dari database
    try {
      const { data: userData, error } = await supabase
        .from("user")
        .select("role")
        .eq("email", data.session.user.email)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching role:", error);
        return redirect("/login");
      }

      const userRole = userData?.role || data.session.user.user_metadata?.role || "pelanggan";

      // Jika role tidak diizinkan, redirect berdasarkan role
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        if (userRole === "admin") {
          return redirect("/dashboard");
        } else if (userRole === "petugas") {
          return redirect("/dashboard/petugas");
        } else {
          return redirect("/");
        }
      }

      return null;
    } catch (error) {
      console.error("Error in roleLoader:", error);
      return redirect("/login");
    }
  };
}

