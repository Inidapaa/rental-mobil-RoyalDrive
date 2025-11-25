import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
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

function MobilCRUD() {
  const [mobilList, setMobilList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMobil, setEditingMobil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nama_mobil: "",
    tipe: "",
    merk: "",
    tahun: "",
    harga_sewa_harian: "",
    transmisi: "",
    kapasitas_mesin: "",
    status: "tersedia",
    foto: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const notify = useNotification();

  useEffect(() => {
    fetchMobil();
  }, []);

  const fetchMobil = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("mobil")
        .select("*")
        .order("id_mobil", { ascending: false });

      if (error) throw error;
      setMobilList(data || []);
    } catch (error) {
      console.error("Error fetching mobil:", error);
      notify("Gagal memuat data mobil: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file, id_mobil) => {
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${id_mobil}_${Date.now()}.${fileExt}`;
      const filePath = `assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("assets").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      let fotoUrl = formData.foto;

      // Upload gambar jika ada file baru
      if (imageFile) {
        if (editingMobil) {
          // Hapus gambar lama jika ada
          if (editingMobil.foto) {
            const oldFileName = editingMobil.foto.split("/").pop();
            await supabase.storage
              .from("assets")
              .remove([`assets/${oldFileName}`]);
          }
        }
        fotoUrl = await uploadImage(
          imageFile,
          editingMobil?.id_mobil || Date.now()
        );
      }

      const mobilData = {
        nama_mobil: formData.nama_mobil,
        tipe: formData.tipe,
        merk: formData.merk,
        tahun: parseInt(formData.tahun),
        harga_sewa_harian: parseInt(formData.harga_sewa_harian),
        transmisi: formData.transmisi,
        kapasitas_mesin: formData.kapasitas_mesin,
        status: formData.status,
        foto: fotoUrl,
      };

      if (editingMobil) {
        // Update mobil
        const { error } = await supabase
          .from("mobil")
          .update(mobilData)
          .eq("id_mobil", editingMobil.id_mobil);

        if (error) throw error;
        notify("Mobil berhasil diupdate!", "success");
      } else {
        // Create mobil
        const { error } = await supabase.from("mobil").insert([mobilData]);

        if (error) throw error;
        notify("Mobil berhasil ditambahkan!", "success");
      }

      fetchMobil();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving mobil:", error);
      notify("Gagal menyimpan mobil: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mobil) => {
    setEditingMobil(mobil);
    setFormData({
      nama_mobil: mobil.nama_mobil,
      tipe: mobil.tipe,
      merk: mobil.merk,
      tahun: mobil.tahun.toString(),
      harga_sewa_harian: mobil.harga_sewa_harian.toString(),
      transmisi: mobil.transmisi,
      kapasitas_mesin: mobil.kapasitas_mesin,
      status: mobil.status,
      foto: mobil.foto || "",
    });
    setImageFile(null);
    setImagePreview(mobil.foto || null);
    setShowModal(true);
  };

  const handleDelete = async (id, foto) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus mobil ini?")) {
      return;
    }

    try {
      setLoading(true);

      // Hapus gambar dari storage jika ada
      if (foto) {
        try {
          const fileName = foto.split("/").pop();
          await supabase.storage.from("assets").remove([`assets/${fileName}`]);
        } catch (storageError) {
          console.error("Error deleting image:", storageError);
        }
      }

      // Hapus data dari database
      const { error } = await supabase
        .from("mobil")
        .delete()
        .eq("id_mobil", id);

      if (error) throw error;
      notify("Mobil berhasil dihapus!", "success");
      fetchMobil();
    } catch (error) {
      console.error("Error deleting mobil:", error);
      notify("Gagal menghapus mobil: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMobil(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      nama_mobil: "",
      tipe: "",
      merk: "",
      tahun: "",
      harga_sewa_harian: "",
      transmisi: "",
      kapasitas_mesin: "",
      status: "tersedia",
      foto: "",
    });
  };

  const filteredMobil = mobilList.filter(
    (mobil) =>
      mobil.nama_mobil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobil.merk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobil.tipe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input
            type="text"
            placeholder="Cari mobil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-dark-lighter border border-dark-light rounded-lg px-4 py-2 pl-10 text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors w-full sm:w-64 text-sm sm:text-base"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-dark-lighter px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:shadow-[0_6px_30px_rgba(163,230,53,0.4)] flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Tambah Mobil</span>
          <span className="sm:hidden">Tambah</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && !mobilList.length && (
        <div className="text-center py-8 text-[#a0a0a0]">Memuat data...</div>
      )}

      {/* Table */}
      <div className="bg-dark-lighter rounded-xl border border-dark-light overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-dark-light hover:bg-dark-light">
                <TableHead>ID</TableHead>
                <TableHead>Foto</TableHead>
                <TableHead>Nama Mobil</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tahun</TableHead>
                <TableHead>Harga/Hari</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMobil.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-[#a0a0a0]"
                  >
                    {loading ? "Memuat data..." : "Tidak ada data mobil"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMobil.map((mobil) => (
                  <TableRow key={mobil.id_mobil}>
                    <TableCell className="text-sm">{mobil.id_mobil}</TableCell>
                    <TableCell>
                      {mobil.foto ? (
                        <img
                          src={mobil.foto}
                          alt={mobil.nama_mobil}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-dark-light rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-[#666]" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {mobil.nama_mobil}
                    </TableCell>
                    <TableCell className="text-sm">{mobil.merk}</TableCell>
                    <TableCell className="text-sm">{mobil.tipe}</TableCell>
                    <TableCell className="text-sm">{mobil.tahun}</TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(mobil.harga_sewa_harian).replace(
                        "Rp",
                        "Rp "
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mobil.status === "tersedia"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-orange-500/20 text-orange-500"
                        }`}
                      >
                        {mobil.status === "tersedia" ? "Tersedia" : "Disewa"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(mobil)}
                          className="text-primary hover:text-primary-dark transition-colors p-2"
                          title="Edit"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(mobil.id_mobil, mobil.foto)
                          }
                          className="text-red-500 hover:text-red-600 transition-colors p-2"
                          title="Hapus"
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-lighter rounded-xl border border-dark-light w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-dark-light">
              <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
                {editingMobil ? "Edit Mobil" : "Tambah Mobil Baru"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                  Foto Mobil
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border border-dark-light"
                    />
                  )}
                  <div className="flex-1 w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-dark-light rounded-lg cursor-pointer bg-dark-light hover:bg-dark-lighter transition-colors">
                      <div className="flex flex-col items-center justify-center pt-3 sm:pt-5 pb-4 sm:pb-6 px-2">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-[#a0a0a0]" />
                        <p className="mb-2 text-xs sm:text-sm text-[#a0a0a0] text-center">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>
                        </p>
                        <p className="text-xs text-[#666]">
                          PNG, JPG, GIF (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
                {uploading && (
                  <p className="text-sm text-primary mt-2">
                    Mengupload gambar...
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Nama Mobil *
                  </label>
                  <input
                    type="text"
                    name="nama_mobil"
                    value={formData.nama_mobil}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Merk *
                  </label>
                  <input
                    type="text"
                    name="merk"
                    value={formData.merk}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Tipe *
                  </label>
                  <select
                    name="tipe"
                    value={formData.tipe}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Pilih Tipe</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="MPV">MPV</option>
                    <option value="SUV">SUV</option>
                    <option value="Sport">Sport</option>
                    <option value="Supercar">Supercar</option>
                    <option value="Hypercar">Hypercar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Tahun *
                  </label>
                  <input
                    type="number"
                    name="tahun"
                    value={formData.tahun}
                    onChange={handleInputChange}
                    required
                    min="2000"
                    max="2024"
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Harga Sewa Harian (Rp) *
                  </label>
                  <input
                    type="number"
                    name="harga_sewa_harian"
                    value={formData.harga_sewa_harian}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Transmisi *
                  </label>
                  <select
                    name="transmisi"
                    value={formData.transmisi}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Pilih Transmisi</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Kapasitas Mesin *
                  </label>
                  <input
                    type="text"
                    name="kapasitas_mesin"
                    value={formData.kapasitas_mesin}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: 3200cc"
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-[#666] focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-[#e0e0e0]">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-light border border-dark-light rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="disewa">Disewa</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 sm:px-6 py-2 border border-dark-light rounded-lg hover:bg-dark-light transition-colors text-sm sm:text-base"
                  disabled={loading || uploading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-primary text-dark-lighter px-4 sm:px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={loading || uploading}
                >
                  {loading || uploading
                    ? "Menyimpan..."
                    : editingMobil
                    ? "Update"
                    : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobilCRUD;
