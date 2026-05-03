import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-24 pb-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center space-x-4 mb-8 group">
              <div className="w-16 h-16 p-1">
                <img src="/assets/logo.png" alt="Roots Clear Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter font-sans text-white leading-none">
                  LUCAS AGRO <span className="text-secondary">& NATURALS</span>
                </span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              Experience the true roots of natural healing. We bring the pure essence of Ayurveda to your modern lifestyle with standardized, chemical-free formulas.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-xl font-bold mb-8 italic text-secondary">Useful Links</h4>
            <ul className="space-y-4">
              {['Home', 'About Us', 'Shop', 'Our Blog', 'Contact'].map((link) => (
                <li key={link}>
                  <Link to={`/${link.toLowerCase().replace(' ', '')}`} className="text-sm text-white/60 hover:text-secondary flex items-center group">
                    <ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-8 italic text-secondary">Contact Info</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="text-secondary mt-1 flex-shrink-0" size={20} />
                <span className="text-sm text-white/60">chennai, TamilNadu, India</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="text-secondary flex-shrink-0" size={20} />
                <span className="text-sm text-white/60">9841310443</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="text-secondary flex-shrink-0" size={20} />
                <span className="text-sm text-white/60">lucasagronaturalsmedia@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-12 flex flex-col justify-center items-center gap-6">
          <p className="text-xs text-white/40">Copyright © 2026. All Right Reserved. Lucas Agro & Naturals</p>
        </div>
        
        <div className="mt-12 text-center">
           <p className="text-[10px] text-white/20 italic max-w-4xl mx-auto">
             "These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before use."
           </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
