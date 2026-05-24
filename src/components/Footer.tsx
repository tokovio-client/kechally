import { Mail, MapPin, Instagram, MessageCircle, Phone } from "lucide-react";

interface FooterProps {
  setActiveTab: (tab: "story" | "products" | "values" | "bag") => void;
  onSelectProduct: (productId: string) => void;
}

export default function Footer({ setActiveTab, onSelectProduct }: FooterProps) {
  return (
    <footer id="editorial-footer" className="bg-[#5A3A3A] text-[#FAF0F0]/85 pt-20 pb-12 border-t border-brand-pink/15 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top area: 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1 (brand) */}
          <div className="space-y-4">
            <h3 className="font-serif text-3xl font-bold italic tracking-wide text-[#FAF0F0]">
              Kechally
            </h3>
            <p className="text-[#E8B4B8]/75 text-xs font-sans font-medium leading-relaxed max-w-xs">
              Premium Handmade Mukena — Crafted By The Locals.
            </p>
          </div>

          {/* Column 2 "Collection" */}
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#E8B4B8]/80 mb-6 font-sans">
              COLLECTION
            </h4>
            <ul className="space-y-3 text-xs font-serif italic text-left">
              {[
                { id: "syadza", name: "Mukena Syadza" },
                { id: "nujum", name: "Mukena Nujum" },
                { id: "padi", name: "Mukena Padi" },
                { id: "shibori", name: "Mukena Shibori" },
                { id: "terompah", name: "Mukena Terompah" },
                { id: "travel", name: "Mukena Travel" }
              ].map((item) => (
                <li key={item.id}>
                  <button 
                    onClick={() => {
                      onSelectProduct(item.id);
                      setActiveTab("products");
                    }}
                    className="text-[#FAF0F0]/75 hover:text-white transition-colors duration-300 text-left cursor-pointer"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 "Company" */}
          <div>
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#E8B4B8]/80 mb-6 font-sans">
              COMPANY
            </h4>
            <ul className="space-y-3 text-xs font-serif italic text-left">
              <li>
                <button 
                  onClick={() => setActiveTab("story")}
                  className="text-[#FAF0F0]/75 hover:text-white transition-colors duration-300 text-left cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab("values")}
                  className="text-[#FAF0F0]/75 hover:text-white transition-colors duration-300 text-left cursor-pointer"
                >
                  Artisan Program
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveTab("story");
                    setTimeout(() => {
                      const element = document.getElementById("collaboration-cta-section");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-[#FAF0F0]/75 hover:text-white transition-colors duration-300 text-left cursor-pointer"
                >
                  Reseller Open
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setActiveTab("story");
                    setTimeout(() => {
                      const element = document.getElementById("collaboration-cta-section");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  className="text-[#FAF0F0]/75 hover:text-white transition-colors duration-300 text-left cursor-pointer"
                >
                  Dropshipper
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 "Contact" */}
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#E8B4B8]/80 mb-6 font-sans">
              CONTACT
            </h4>
            <ul className="space-y-3 text-xs text-[#FAF0F0]/75 font-sans font-medium">
              <li className="flex items-start space-x-2">
                <MapPin className="text-[#E8B4B8] mt-0.5 shrink-0" size={14} />
                <span>Malang, East Java, Indonesia</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="text-[#E8B4B8] shrink-0" size={14} />
                <a href="mailto:kechally.official@gmail.com" className="hover:text-white transition-colors duration-300">
                  kechally.official@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="text-[#E8B4B8] shrink-0" size={14} />
                <a href="tel:+6289613796071" className="hover:text-white transition-colors duration-300">
                  (+62) 896-1379-6071
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram className="text-[#E8B4B8] shrink-0" size={14} />
                <a href="https://instagram.com/kechally" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300">
                  @kechally
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Thin 1px rose divider line between top and bottom */}
        <div className="h-[1px] bg-brand-pink/20 my-8 w-full" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-[#E8B4B8]/65 font-sans space-y-4 sm:space-y-0">
          <div>
            <p>© 2026 Kechally</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Instagram social button */}
            <a 
              href="https://instagram.com/kechally"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-brand-pink/40 flex items-center justify-center text-[#FAF0F0] hover:text-white hover:bg-brand-pink/10 transition-all duration-300"
              aria-label="Instagram"
            >
              <Instagram size={14} />
            </a>
            
            {/* WhatsApp social button */}
            <a 
              href="https://wa.me/6289613796071"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full border border-brand-pink/40 flex items-center justify-center text-[#FAF0F0] hover:text-white hover:bg-brand-pink/10 transition-all duration-300"
              aria-label="WhatsApp"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

