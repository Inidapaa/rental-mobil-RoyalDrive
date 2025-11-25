import { create } from "zustand";
import { supabase } from "../lib/supabase";

const projectRef = "zzcwgvulpnrgtkvcnijy";

const getRoleFlags = (role) => ({
  isAdmin: role === "admin",
  isPetugas: role === "petugas",
  isPelanggan: role === "pelanggan",
});

const clearSupabaseStorage = (forceFull = false) => {
  if (typeof window === "undefined") return;

  if (forceFull) {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
    return;
  }

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;
    const lowerKey = key.toLowerCase();
    if (
      key.startsWith("sb-") ||
      key.includes("supabase") ||
      key.includes("auth") ||
      lowerKey.includes("access") ||
      lowerKey.includes("token") ||
      lowerKey.includes("refresh") ||
      lowerKey.includes("session")
    ) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing localStorage key:", key, error);
      }
    }
  }

  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (!key) continue;
    const lowerKey = key.toLowerCase();
    if (
      key.startsWith("sb-") ||
      key.includes("supabase") ||
      key.includes("auth") ||
      lowerKey.includes("access") ||
      lowerKey.includes("token") ||
      lowerKey.includes("refresh") ||
      lowerKey.includes("session")
    ) {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error("Error removing sessionStorage key:", key, error);
      }
    }
  }

  [
    `sb-${projectRef}-auth-token`,
    `sb-${projectRef}-auth-token-code-verifier`,
    `sb-${projectRef}-auth-token-code-challenge`,
    `supabase.auth.token`,
    `supabase.${projectRef}.auth.token`,
  ].forEach((key) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
};

export const useAuthStore = create((set, get) => ({
  user: null,
  userRole: null,
  username: null,
  loading: true,
  isAuthenticated: false,
  ...getRoleFlags(null),
  setLoading: (loading) => set({ loading }),
  resetAuthState: () =>
    set({
      user: null,
      userRole: null,
      username: null,
      isAuthenticated: false,
      ...getRoleFlags(null),
    }),
  fetchUserData: async (authUser) => {
    if (!authUser?.email) {
      const role = "pelanggan";
      set({ userRole: role, username: null, ...getRoleFlags(role) });
      return { role, username: null };
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("role, username")
        .eq("email", authUser.email)
        .maybeSingle();

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching user data:", userError);
        const role = authUser.user_metadata?.role || "pelanggan";
        set({ userRole: role, username: null, ...getRoleFlags(role) });
        return { role, username: null };
      }

      if (userData?.role) {
        const role = userData.role;
        if (role === "pelanggan") {
          const { data: pelangganData, error: pelangganError } = await supabase
            .from("pelanggan")
            .select("nama")
            .eq("email", authUser.email)
            .maybeSingle();

          if (pelangganError && pelangganError.code !== "PGRST116") {
            console.error("Error fetching pelanggan data:", pelangganError);
          }

          const name = pelangganData?.nama || userData?.username || null;
          set({ userRole: role, username: name, ...getRoleFlags(role) });
          return { role, username: name };
        } else {
          const name = userData?.username || null;
          set({ userRole: role, username: name, ...getRoleFlags(role) });
          return { role, username: name };
        }
      }

      const fallbackRole = authUser.user_metadata?.role || "pelanggan";
      set({ userRole: fallbackRole, username: null, ...getRoleFlags(fallbackRole) });
      return { role: fallbackRole, username: null };
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      const fallbackRole = authUser.user_metadata?.role || "pelanggan";
      set({ userRole: fallbackRole, username: null, ...getRoleFlags(fallbackRole) });
      return { role: fallbackRole, username: null };
    }
  },
  initAuth: async () => {
    set({ loading: true });
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        get().resetAuthState();
        clearSupabaseStorage();
        return;
      }

      if (session?.user && session?.access_token) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchUserData(session.user);
      } else {
        get().resetAuthState();
        clearSupabaseStorage();
        setTimeout(() => clearSupabaseStorage(), 50);
      }
    } catch (error) {
      console.error("Error in initAuth:", error);
      get().resetAuthState();
    } finally {
      set({ loading: false });
    }
  },
  subscribeToAuthChanges: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        get().resetAuthState();
        set({ loading: false });
        clearSupabaseStorage();
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        set({ user: session.user, isAuthenticated: true, loading: false });
        await get().fetchUserData(session.user);
        return;
      }

      if (event === "USER_UPDATED" && session?.user) {
        set({ user: session.user, isAuthenticated: true });
        await get().fetchUserData(session.user);
        return;
      }

      if (event === "TOKEN_REFRESHED" && session?.user) {
        set((state) =>
          state.user?.id === session.user.id
            ? state
            : { ...state, user: session.user, isAuthenticated: true }
        );
      }
    });

    return () => subscription.unsubscribe();
  },
  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        set({ user: data.user, isAuthenticated: true });
        await get().fetchUserData(data.user);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message };
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password, role = "pelanggan") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("user").insert([
          {
            email,
            role,
            created_at: new Date().toISOString().split("T")[0],
          },
        ]);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: error.message };
    }
  },
  signOut: async () => {
    try {
      set({ loading: true });
      get().resetAuthState();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearSupabaseStorage();
      set({ loading: false });
    } catch (error) {
      console.error("Sign out error:", error);
      get().resetAuthState();
      set({ loading: false });
      clearSupabaseStorage(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (typeof window !== "undefined") {
        const refreshUrl = window.location.origin + "/?logout=" + Date.now();
        window.location.href = refreshUrl;
      }
    }
  },
}));

