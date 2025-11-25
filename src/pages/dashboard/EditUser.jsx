import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { supabase } from "../../lib/supabase";
import { useNotification } from "../../contexts/NotificationContext";

function EditUser() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "petugas",
  });
  const notify = useNotification();

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch users
      const { data, error } = await supabase
        .from("user")
        .select("*")
        .in("role", ["petugas", "admin"])
        .order("id", { ascending: false });

      if (error) {
        notify("Gagal memuat data petugas: " + error.message, "error");
        setUsers([]);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      notify("Gagal memuat data petugas: " + error.message, "error");
      setUsers([]);
    }
  }, [notify]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    loadUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      notify("Password tidak cocok!", "warning");
      return;
    }

    try {
      setLoading(true);

      if (editingUser) {
        // Update user
        const { error } = await supabase
          .from("user")
          .update({
            role: formData.role,
          })
          .eq("id", editingUser.id);

        if (error) throw error;
        notify("User berhasil diupdate!", "success");
      } else {
        // Simpan session admin
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !currentSession) {
          throw new Error("Tidak ada session aktif. Silakan login ulang.");
        }

        // Simpan informasi session admin
        const adminAccessToken = currentSession.access_token;
        const adminRefreshToken = currentSession.refresh_token;
        const adminUserEmail = currentSession.user.email;

        // Create user
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: formData.role,
            },
          },
        });

        if (authError) {
          throw authError;
        }

        // Simpan user
        const { error: userError } = await supabase
          .from("user")
          .insert([
            {
              email: formData.email,
              role: formData.role,
              created_at: new Date().toISOString().split("T")[0],
            },
          ])
          .select();
        if (userError) {
          if (userError.code !== "23505") {
            throw new Error(
              "Gagal menyimpan ke tabel user: " + userError.message
            );
          } else {
            console.log("User already exists in table, continuing...");
          }
        } else {
          await supabase.auth.signOut();
          await new Promise((resolve) => setTimeout(resolve, 200));
          try {
            const restorePromise = supabase.auth.setSession({
              access_token: adminAccessToken,
              refresh_token: adminRefreshToken,
            });
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(
                () =>
                  reject(new Error("Timeout: Session restore took too long")),
                3000
              )
            );
            const result = await Promise.race([restorePromise, timeoutPromise]);
            if (result.error) {
              throw result.error;
            }
            console.log("Session restored successfully");
            const {
              data: { session: verifySession },
            } = await supabase.auth.getSession();
            if (!verifySession || verifySession.user.email !== adminUserEmail) {
              throw new Error("Session verification failed");
            }
            console.log("✅ Session verified, admin still logged in");
          } catch (restoreErr) {
            console.error("Error restoring session:", restoreErr);
            setLoading(false);
            notify("User berhasil dibuat! Memuat ulang halaman...", "success");
            setTimeout(() => {
              window.location.reload();
            }, 800);
            return;
          }
          console.log(" All done, user created and admin session restored");
          notify(
            "User berhasil dibuat! Data tersimpan di tabel user.",
            "success"
          );
        }
      }

      // Refresh daftar user setelah berhasil
      console.log("🔄 Refreshing user list...");
      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      notify("Gagal menyimpan user: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role || "petugas",
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("user").delete().eq("id", id);

      if (error) throw error;
      notify("User berhasil dihapus!", "success");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      notify("Gagal menghapus user: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      role: "petugas",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
          Daftar Petugas
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-dark-lighter px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:shadow-[0_6px_30px_rgba(163,230,53,0.4)] flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Tambah Petugas</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {loading && !users.length && (
        <div className="text-center py-8 text-[#a0a0a0]">Memuat data...</div>
      )}

      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-dark-light hover:bg-dark-light">
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-[#a0a0a0]"
                  >
                    {loading ? "Memuat data..." : "Tidak ada data petugas."}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-sm">{user.id}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-primary/20 text-primary"
                            : user.role === "petugas"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.created_at || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary hover:text-primary-dark transition-colors p-2"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-lighter rounded-xl border border-dark-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-dark-light">
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
                {editingUser ? "Edit Petugas" : "Tambah Petugas Baru"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUser}
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="admin">Admin</option>
                    <option value="petugas">Petugas</option>
                  </select>
                </div>
                {!editingUser && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                        Konfirmasi Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 sm:px-6 py-2 border border-dark-light rounded-lg hover:bg-dark-light transition-colors text-sm sm:text-base"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary text-dark-lighter px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : editingUser ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditUser;
