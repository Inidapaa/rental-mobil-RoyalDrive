/**
 * Helper function to check and normalize status value according to database constraint
 * This function tries to query existing valid status values from the database
 * and normalizes the input status to match the constraint
 */

import { supabase } from "./supabase";

/**
 * Get valid status values from database by querying existing transactions
 * This helps us understand what values are actually accepted by the constraint
 */
export async function getValidStatusValues() {
  try {
    // Query distinct status values from existing transactions
    const { data, error } = await supabase
      .from("transaksi")
      .select("status_transaksi")
      .not("status_transaksi", "is", null);

    if (error) {
      console.error("Error fetching status values:", error);
      return null;
    }

    // Get unique status values
    const uniqueStatuses = [...new Set(data.map((t) => t.status_transaksi))];
    return uniqueStatuses;
  } catch (err) {
    console.error("Error in getValidStatusValues:", err);
    return null;
  }
}

/**
 * Normalize status value to match database constraint
 * This function tries different variations to find the correct format
 */
export function normalizeStatusValue(status) {
  if (!status) return null;

  // Trim whitespace
  status = status.trim().toLowerCase();

  // Map common variations to standard values
  const statusMap = {
    // Lowercase variations
    konfirmasi: "konfirmasi",
    berlangsung: "berlangsung",
    selesai: "selesai",
    batal: "batal",
    // Uppercase variations
    konfirmasi_upper: "Konfirmasi",
    berlangsung_upper: "Berlangsung",
    selesai_upper: "Selesai",
    batal_upper: "Batal",
    // Alternative names
    pending: "konfirmasi",
    menunggu: "konfirmasi",
    diproses: "berlangsung",
    completed: "selesai",
    cancelled: "batal",
  };

  // Try direct match first
  if (statusMap[status]) {
    return statusMap[status];
  }

  // Return original if no mapping found
  return status;
}

/**
 * Validate status value against known valid values
 */
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

