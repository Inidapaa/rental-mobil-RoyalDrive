import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { supabase } from "../lib/supabase";
import { User, Save, ArrowLeft } from "lucide-react";
import { useNotification } from "../components/NotificationProvider";

function EditProfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notify = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    no_identitas: "",
    no_hp: "",
    alamat: "",
    email: "",
  });
  const [pelangganId, setPelangganId] = useState(null);
  const hasFetched = useRef(false);
  const currentEmail = useRef(null);

  useEffect(() => {
    const userEmail = user?.email;

    // Jika email berubah, reset flag
    if (currentEmail.current !== userEmail) {
      hasFetched.current = false;
      currentEmail.current = userEmail;
    }

    // Jika user belum ada, set loading false dan set email kosong
    if (!userEmail) {
      setLoading(false);
      setFormData({
        nama: "",
        no_identitas: "",
        no_hp: "",
        alamat: "",
        email: "",
      });
      return;
    }

    // Fetch data hanya sekali per email
    if (!hasFetched.current) {
      hasFetched.current = true;

      const fetchPelangganData = async () => {
        try {
          setLoading(true);
          // Cari data pelanggan berdasarkan email
          const { data, error } = await supabase
            .from("pelanggan")
            .select("*")
            .eq("email", userEmail)
            .maybeSingle();

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching pelanggan:", error);
            // Set email dari user meskipun ada error
            setFormData({
              nama: "",
              no_identitas: "",
              no_hp: "",
              alamat: "",
              email: userEmail || "",
            });
            setLoading(false);
            return;
          }

          if (data) {
            setPelangganId(data.id_pelanggan);
            setFormData({
              nama: data.nama || "",
              no_identitas: data.no_identitas || "",
              no_hp: data.no_hp || "",
              alamat: data.alamat || "",
              email: data.email || userEmail || "",
            });
          } else {
            // Jika belum ada data, set email dari user
            setFormData({
              nama: "",
              no_identitas: "",
              no_hp: "",
              alamat: "",
              email: userEmail || "",
            });
          }
        } catch (error) {
          console.error("Error:", error);
          // Set email dari user meskipun ada error
          setFormData({
            nama: "",
            no_identitas: "",
            no_hp: "",
            alamat: "",
            email: userEmail || "",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchPelangganData();
    }
  }, [user?.email]); // Hanya depend pada email, bukan seluruh user object

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (pelangganId) {
        // Update data pelanggan
        const { error } = await supabase
          .from("pelanggan")
          .update({
            nama: formData.nama,
            no_identitas: formData.no_identitas,
            no_hp: formData.no_hp,
            alamat: formData.alamat,
          })
          .eq("id_pelanggan", pelangganId);

        if (error) throw error;
        notify("Profil berhasil diupdate!", "success");
      } else {
        // Insert data pelanggan baru
        const { data, error } = await supabase
          .from("pelanggan")
          .insert([
            {
              nama: formData.nama,
              no_identitas: formData.no_identitas,
              no_hp: formData.no_hp,
              alamat: formData.alamat,
              email: formData.email,
              tanggal_daftar: new Date().toISOString().split("T")[0],
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Set pelangganId dari data yang baru diinsert
        if (data?.id_pelanggan) {
          setPelangganId(data.id_pelanggan);
        }

        notify("Profil berhasil disimpan!", "success");
      }
    } catch (error) {
      console.error("Error saving profil:", error);
      notify("Gagal menyimpan profil: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-dark-light rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">
              Edit Profil
            </h1>
            <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
              Perbarui informasi akun Anda
            </p>
          </div>
        </div>

        <div className="bg-dark-light rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {loading ? (
            <div className="text-center py-8 text-[#a0a0a0]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              Memuat data...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-[#e0e0e0]"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-[#a0a0a0] mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              <div>
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium mb-2 text-[#e0e0e0]"
                >
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label
                  htmlFor="no_identitas"
                  className="block text-sm font-medium mb-2 text-[#e0e0e0]"
                >
                  No. Identitas (KTP) *
                </label>
                <input
                  type="text"
                  id="no_identitas"
                  name="no_identitas"
                  value={formData.no_identitas}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  placeholder="Masukkan nomor KTP"
                />
              </div>

              <div>
                <label
                  htmlFor="no_hp"
                  className="block text-sm font-medium mb-2 text-[#e0e0e0]"
                >
                  No. HP *
                </label>
                <input
                  type="tel"
                  id="no_hp"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleChange}
                  required
                  className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  placeholder="Masukkan nomor HP"
                />
              </div>

              <div>
                <label
                  htmlFor="alamat"
                  className="block text-sm font-medium mb-2 text-[#e0e0e0]"
                >
                  Alamat *
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full bg-dark-lighter border border-dark-light rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-dark-lighter text-white py-3 rounded-lg font-semibold hover:bg-dark-light transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="flex-1 bg-primary text-dark-lighter py-3 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:shadow-[0_6px_30px_rgba(163,230,53,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProfil;
