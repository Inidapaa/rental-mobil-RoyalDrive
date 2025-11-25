import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import heroCar from "../assets/hero-car.jpg";
import { supabase } from "../lib/supabase";

function Landing() {
  const [stats, setStats] = useState({ totalMobil: 0, totalMerk: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total mobil
        const { data: mobilData, error: mobilError } = await supabase
          .from("mobil")
          .select("merk");

        if (mobilError) throw mobilError;

        const totalMobil = mobilData?.length || 0;
        const uniqueMerk = new Set(mobilData?.map((m) => m.merk) || []);
        const totalMerk = uniqueMerk.size;

        setStats({ totalMobil, totalMerk });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroCar}
            alt="Hero Car"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-br from-dark/85 via-[#141414]/75 to-dark/90 z-1"></div>
        </div>

        <div className="relative z-2 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full h-[calc(100vh-80px)] flex flex-col justify-between py-8 sm:py-12">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
            {/* Left Side - Title and Stats */}
            <div className="flex flex-col gap-6 sm:gap-8">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white m-0 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                  DRIVE EXCLUSIVE
                </h1>
              </div>

              <div className="flex gap-8 sm:gap-12 mt-2 sm:mt-4">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-none">
                    {stats.totalMobil}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide m-0">
                    Unit Mobil
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-none">
                    {stats.totalMerk}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#a0a0a0] uppercase tracking-wide m-0">
                    Merek
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Description */}
            <div className="flex items-end justify-start lg:justify-end h-full">
              <p className="text-base sm:text-lg lg:text-xl text-start lg:text-end leading-[1.8] text-[#e0e0e0] m-0 max-w-[500px] uppercase">
                Rasakan kemewahan berkendara tanpa batas. Kami menghadirkan
                armada eksklusif, layanan respons cepat, dan pengalaman sewa
                yang dirancang untuk kenyamanan serta kelas terbaik setiap
                perjalanan Anda.
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="bg-dark-light/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 w-full lg:w-auto">
              <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-primary uppercase tracking-wide">
                Alamat Kami
              </h3>

              <div className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm sm:text-base text-[#e0e0e0] m-0">
                    Jl. Ijen No. 45, Klojen, Kota Malang 65111
                  </p>
                  <p className="text-xs sm:text-sm text-[#a0a0a0] mt-1">
                    Senin - Minggu: 08:00 - 22:00
                  </p>
                </div>
              </div>
            </div>

            <Link
              reloadDocument
              to="/catalog"
              className="bg-primary text-dark-lighter px-8 sm:px-12 py-4 sm:py-5 rounded-xl text-lg sm:text-xl font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(163,230,53,0.3)] hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-[0_6px_30px_rgba(163,230,53,0.4)] w-full lg:w-auto text-center"
            >
              CATALOG
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
