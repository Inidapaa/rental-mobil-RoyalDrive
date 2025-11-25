import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../components/NotificationProvider";

function PelangganCRUD() {
  const [pelangganList, setPelangganList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const notify = useNotification();

  useEffect(() => {
    fetchPelanggan();
  }, []);

  const fetchPelanggan = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pelanggan")
        .select("*")
        .order("id_pelanggan", { ascending: false });

      if (error) throw error;
      setPelangganList(data || []);
    } catch (error) {
      console.error("Error fetching pelanggan:", error);
      notify("Gagal memuat data pelanggan: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pelanggan) => {
    const confirmed = window.confirm(
      `Hapus akun pelanggan ${pelanggan.nama}? Tindakan ini tidak dapat dibatalkan.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(pelanggan.id_pelanggan);

      const { error: pelangganError } = await supabase
        .from("pelanggan")
        .delete()
        .eq("id_pelanggan", pelanggan.id_pelanggan);

      if (pelangganError) throw pelangganError;

      // Hapus juga dari tabel user agar akun tidak bisa login lagi
      if (pelanggan.email) {
        const { error: userError } = await supabase
          .from("user")
          .delete()
          .eq("email", pelanggan.email);

        if (userError) {
          console.warn("Gagal menghapus dari tabel user:", userError.message);
        }
      }

      await fetchPelanggan();
      notify("Akun pelanggan berhasil dihapus.", "success");
    } catch (error) {
      console.error("Error deleting pelanggan:", error);
      notify("Gagal menghapus akun pelanggan: " + error.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {loading && !pelangganList.length && (
        <div className="text-center py-8 text-[#a0a0a0]">Memuat data...</div>
      )}

      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-dark-light hover:bg-dark-light">
              <TableHead>ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>No. Identitas</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pelangganList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-[#a0a0a0]"
                >
                  {loading ? "Memuat data..." : "Tidak ada data pelanggan"}
                </TableCell>
              </TableRow>
            ) : (
              pelangganList.map((pelanggan) => (
                <TableRow key={pelanggan.id_pelanggan}>
                  <TableCell className="text-sm">
                    {pelanggan.id_pelanggan}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {pelanggan.nama}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pelanggan.no_identitas}
                  </TableCell>
                  <TableCell className="text-sm">{pelanggan.no_hp}</TableCell>
                  <TableCell className="text-sm">{pelanggan.email}</TableCell>
                  <TableCell className="text-sm max-w-xs truncate">
                    {pelanggan.alamat}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pelanggan.tanggal_daftar}
                  </TableCell>
                  <TableCell className="text-sm">
                    <button
                      type="button"
                      onClick={() => handleDelete(pelanggan)}
                      disabled={deletingId === pelanggan.id_pelanggan}
                      className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold uppercase tracking-wide hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === pelanggan.id_pelanggan
                        ? "Menghapus..."
                        : "Hapus Akun"}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}

export default PelangganCRUD;
