import { supabase } from "./supabase";

export async function getValidStatusValues() {
  try {
    const { data, error } = await supabase
      .from("transaksi")
      .select("status_transaksi")
      .not("status_transaksi", "is", null);

    if (error) {
      console.error("Error fetching status values:", error);
      return null;
    }

    const uniqueStatuses = [...new Set(data.map((t) => t.status_transaksi))];
    return uniqueStatuses;
  } catch (err) {
    console.error("Error in getValidStatusValues:", err);
    return null;
  }
}

export function normalizeStatusValue(status) {
  if (!status) return null;

  status = status.trim().toLowerCase();

  const statusMap = {
    konfirmasi: "konfirmasi",
    berlangsung: "berlangsung",
    selesai: "selesai",
    batal: "batal",
    konfirmasi_upper: "Konfirmasi",
    berlangsung_upper: "Berlangsung",
    selesai_upper: "Selesai",
    batal_upper: "Batal",
    pending: "konfirmasi",
    menunggu: "konfirmasi",
    diproses: "berlangsung",
    completed: "selesai",
    cancelled: "batal",
  };

  if (statusMap[status]) {
    return statusMap[status];
  }

  return status;
}

export function isValidStatus(status) {
  const validStatuses = [
    "konfirmasi",
    "berlangsung",
    "selesai",
    "batal",
    "Konfirmasi",
    "Berlangsung",
    "Selesai",
    "Batal",
    "KONFIRMASI",
    "BERLANGSUNG",
    "SELESAI",
    "BATAL",
  ];

  return validStatuses.includes(status);
}
