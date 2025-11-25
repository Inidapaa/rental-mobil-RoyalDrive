import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-dark-lighter border-t border-dark-light">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4 tracking-wide">
              RoyalDrive
            </h3>
            <p className="text-[#a0a0a0] mb-4 leading-relaxed">
              Layanan sewa mobil premium terpercaya dengan armada lengkap dan
              harga terjangkau.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-[#a0a0a0] hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-[#a0a0a0] hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-[#a0a0a0] hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-wide">
              Tautan Cepat
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  reloadDocument
                  to="/"
                  className="text-[#a0a0a0] hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  reloadDocument
                  to="/catalog"
                  className="text-[#a0a0a0] hover:text-primary transition-colors"
                >
                  Catalog
                </Link>
              </li>
              <li>
                <Link
                  reloadDocument
                  to="/about"
                  className="text-[#a0a0a0] hover:text-primary transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  reloadDocument
                  to="/login"
                  className="text-[#a0a0a0] hover:text-primary transition-colors"
                >
                  Masuk
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-wide">
              Kontak
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-[#a0a0a0]">
                  Jl. Ijen No. 45, Klojen, Kota Malang 65111
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <p href="tel:+6281234567890" className="text-[#a0a0a0]">
                  +62 812-3456-7890
                </p>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="mailto:royaldrive@help.com"
                  className="text-[#a0a0a0] hover:text-primary transition-colors"
                >
                  royaldrive@help.com
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4 uppercase tracking-wide">
              Jam Operasional
            </h4>
            <ul className="space-y-2 text-[#a0a0a0]">
              <li>Senin - Jumat: 08:00 - 20:00</li>
              <li>Sabtu: 09:00 - 18:00</li>
              <li>Minggu: 10:00 - 16:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-light pt-8 text-center">
          <p className="text-[#a0a0a0]">© 2024 All right reserved</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
