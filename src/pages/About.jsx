import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Shield,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function About() {
  const [stats, setStats] = useState({
    jenisKendaraan: 0,
    totalPengguna: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch jenis kendaraan (unique tipe from mobil)
        const { data: mobilData, error: mobilError } = await supabase
          .from("mobil")
          .select("tipe");

        if (mobilError) throw mobilError;

        const uniqueTipe = new Set(mobilData?.map((m) => m.tipe) || []);
        const jenisKendaraan = uniqueTipe.size;

        // Fetch total pengguna (from pelanggan table)
        const { count: totalPengguna, error: pelangganError } = await supabase
          .from("pelanggan")
          .select("*", { count: "exact", head: true });

        if (pelangganError) throw pelangganError;

        setStats({
          jenisKendaraan,
          totalPengguna: totalPengguna || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white pt-24">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">TENTANG KAMI</h1>
          <p className="text-xl text-[#a0a0a0] max-w-2xl mx-auto">
            MITRA TERPERCAYA ANDA UNTUK LAYANAN SEWA MOBIL PREMIUM
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-primary uppercase tracking-wide">
              CERITA KAMI
            </h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-4">
              Didirikan dengan visi untuk merevolusi pengalaman sewa mobil, kami
              telah melayani ribuan pelanggan dengan armada kendaraan premium
              yang luas. Dari mobil ekonomi hingga mobil sport mewah, kami
              memiliki sesuatu untuk semua orang.
            </p>
            <p className="text-lg text-[#e0e0e0] leading-relaxed">
              Komitmen kami terhadap keunggulan dan kepuasan pelanggan telah
              menjadikan kami nama terkemuka di industri sewa mobil. Kami
              percaya dalam membuat sewa mobil menjadi sederhana, terjangkau,
              dan bebas stres.
            </p>
          </div>

          <div className="bg-dark-light rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-primary uppercase tracking-wide">
              MENGAPA PILIH KAMI
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">
                    PILIHAN LUAS
                  </h3>
                  <p className="text-[#a0a0a0]">
                    Pilih dari 100+ jenis kendaraan yang sesuai dengan kebutuhan
                    Anda
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">
                    AMAN & TERPERCAYA
                  </h3>
                  <p className="text-[#a0a0a0]">
                    Semua kendaraan kami dirawat secara rutin dan diasuransikan
                    penuh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">
                    DUKUNGAN 24/7
                  </h3>
                  <p className="text-[#a0a0a0]">
                    Tim layanan pelanggan kami tersedia sepanjang waktu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">
                    HARGA TERBAIK
                  </h3>
                  <p className="text-[#a0a0a0]">
                    Harga kompetitif tanpa biaya tersembunyi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-dark-light rounded-xl p-8 text-center">
            <h3 className="text-5xl font-bold text-primary mb-2">
              {stats.jenisKendaraan}
            </h3>
            <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
              JENIS KENDARAAN
            </p>
          </div>
          <div className="bg-dark-light rounded-xl p-8 text-center">
            <h3 className="text-5xl font-bold text-primary mb-2">
              {stats.totalPengguna}
            </h3>
            <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
              TOTAL PENGGUNA
            </p>
          </div>
          <div className="bg-dark-light rounded-xl p-8 text-center">
            <h3 className="text-5xl font-bold text-primary mb-2">10+</h3>
            <p className="text-lg text-[#a0a0a0] uppercase tracking-wide">
              TAHUN PENGALAMAN
            </p>
          </div>
        </div>

        {/* Contact & Address Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-dark-light rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-primary uppercase tracking-wide">
              HUBUNGI KAMI
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 uppercase tracking-wide">
                    Alamat
                  </h3>
                  <p className="text-[#a0a0a0]">
                    Jl. Ijen No. 45, Klojen, Kota Malang 65111
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 uppercase tracking-wide">
                    Telepon
                  </h3>
                  <a
                    href="tel:+6281234567890"
                    className="text-[#a0a0a0] hover:text-primary transition-colors"
                  >
                    +62 812-3456-7890
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 uppercase tracking-wide">
                    Email
                  </h3>
                  <a
                    href="mailto:royaldrive@help.com"
                    className="text-[#a0a0a0] hover:text-primary transition-colors"
                  >
                    royaldrive@help.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-light rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-primary uppercase tracking-wide">
              JAM OPERASIONAL
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-dark-lighter">
                <span className="text-lg font-medium text-[#e0e0e0]">
                  Senin - Jumat
                </span>
                <span className="text-[#a0a0a0]">08:00 - 20:00</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-dark-lighter">
                <span className="text-lg font-medium text-[#e0e0e0]">
                  Sabtu
                </span>
                <span className="text-[#a0a0a0]">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-[#e0e0e0]">
                  Minggu
                </span>
                <span className="text-[#a0a0a0]">10:00 - 16:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-dark-light to-dark-lighter rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6 uppercase tracking-wide">
            MISI KAMI
          </h2>
          <p className="text-xl text-[#e0e0e0] max-w-3xl mx-auto leading-relaxed">
            Untuk menyediakan layanan sewa mobil yang luar biasa yang melebihi
            harapan pelanggan, membuat setiap perjalanan nyaman, aman, dan
            berkesan. Kami berusaha menjadi perusahaan sewa mobil yang paling
            dipercaya dan dipilih di industri ini.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
