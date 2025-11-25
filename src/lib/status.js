export const STATUS = {
  MENUNGGU: "menunggu", // Default untuk pelanggan dan petugas
  KONFIRMASI: "konfirmasi", // Untuk admin
  BERLANGSUNG: "berlangsung",
  SELESAI: "selesai",
  BATAL: "batal",
};

const ADMIN_LABELS = {
  [STATUS.KONFIRMASI]: "Konfirmasi",
  [STATUS.MENUNGGU]: "Menunggu",
  [STATUS.BERLANGSUNG]: "Berlangsung",
  [STATUS.SELESAI]: "Selesai",
  [STATUS.BATAL]: "Batal",
};

const CUSTOMER_LABELS = {
  [STATUS.KONFIRMASI]: "Menunggu",
  [STATUS.MENUNGGU]: "Menunggu",
  [STATUS.BERLANGSUNG]: "Sedang Berlangsung",
  [STATUS.SELESAI]: "Selesai",
  [STATUS.BATAL]: "Dibatalkan",
};

const STATUS_COLORS = {
  [STATUS.KONFIRMASI]: "bg-yellow-500/20 text-yellow-500",
  [STATUS.MENUNGGU]: "bg-yellow-500/20 text-yellow-500",
  [STATUS.BERLANGSUNG]: "bg-blue-500/20 text-blue-500",
  [STATUS.SELESAI]: "bg-green-500/20 text-green-500",
  [STATUS.BATAL]: "bg-red-500/20 text-red-500",
};

export const getStatusLabel = (status, audience = "admin") => {
  if (audience === "customer") {
    return CUSTOMER_LABELS[status] || status;
  }
  return ADMIN_LABELS[status] || status;
};

export const getStatusColor = (status) =>
  STATUS_COLORS[status] || "bg-gray-500/20 text-gray-400";

export const getStatusOptions = (includeBatal = true) => {
  const base = [
    { value: STATUS.KONFIRMASI, label: ADMIN_LABELS[STATUS.KONFIRMASI] },
    { value: STATUS.MENUNGGU, label: ADMIN_LABELS[STATUS.MENUNGGU] },
    { value: STATUS.BERLANGSUNG, label: ADMIN_LABELS[STATUS.BERLANGSUNG] },
    { value: STATUS.SELESAI, label: ADMIN_LABELS[STATUS.SELESAI] },
  ];
  if (includeBatal) {
    base.push({ value: STATUS.BATAL, label: ADMIN_LABELS[STATUS.BATAL] });
  }
  return base;
};

export const isCancelableStatus = (status) => 
  status === STATUS.KONFIRMASI || status === STATUS.MENUNGGU;

