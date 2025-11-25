import { useCallback, useMemo, useState } from "react";
import { NotificationContext } from "../contexts/NotificationContext";

const typeStyles = {
  success: "border-green-500/40 bg-green-500/10 text-green-200",
  error: "border-red-500/40 bg-red-500/10 text-red-200",
  warning: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200",
  info: "border-blue-500/40 bg-blue-500/10 text-blue-200",
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      if (!message) return;
      const id =
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2));
      setNotifications((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeNotification(id), 4000);
    },
    [removeNotification]
  );

  const value = useMemo(
    () => ({
      notify,
    }),
    [notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-6 right-6 flex flex-col gap-3 z-[2000] max-w-sm">
        {notifications.map(({ id, type, message }) => (
          <div
            key={id}
            className={`rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md bg-dark-lighter ${
              typeStyles[type] ?? typeStyles.info
            }`}
          >
            <p className="text-xs uppercase tracking-wide font-semibold mb-1">
              {type}
            </p>
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
