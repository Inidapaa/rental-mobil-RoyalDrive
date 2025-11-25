import { useEffect } from "react";
import { useAuthStore } from "../stores/useAuthStore";

export const AuthProvider = ({ children }) => {
  const initAuth = useAuthStore((state) => state.initAuth);
  const subscribeToAuthChanges = useAuthStore(
    (state) => state.subscribeToAuthChanges
  );

  useEffect(() => {
    let unsubscribe;
    let mounted = true;

    const bootstrap = async () => {
      await initAuth();
      if (!mounted) return;
      unsubscribe = subscribeToAuthChanges();
    };

    bootstrap();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initAuth, subscribeToAuthChanges]);

  return children;
};
