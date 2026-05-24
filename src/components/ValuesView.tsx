import { Sparkles, User, Heart } from "lucide-react";
import { ARTISANS } from "../data";

export default function ValuesView() {

  return (
    <div className="w-full bg-brand-bg py-16 transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Introduction */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="text-brand-primary/60 font-mono text-[10px] uppercase tracking-[0.35em] font-bold">
            Honest Heritage
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-brand-primary-dark font-black italic tracking-tighter leading-none">
            Our heart & values.
          </h1>
          <div className="h-[1px] bg-brand-primary/15 w-24 mx-auto" />
          <p className="text-stone-600 text-xs sm:text-sm font-serif leading-relaxed max-w-lg mx-auto italic">
            Preserving centuries of manual embroidery skills, ensuring secure maternal healthcare, and exporting Malang's cultural heritage with utmost global integrity.
          </p>
        </div>

        {/* Brand Values Asymmetric 3-Column Grid */}
        <div className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Column 1 (wider, dark rose-brown card #5A3A3A) */}
            <div className="lg:col-span-6 bg-[#5A3A3A] text-[#FDF8F5] p-8 sm:p-10 rounded-[8px] flex flex-col justify-between min-h-[250px] border border-brand-primary/10 transition-transform duration-300 hover:scale-[1.01]">
              <div className="space-y-4">
                <span className="text-[9px] uppercase font-mono tracking-[0.25em] text-[#E9E5DE]/70 font-bold block">
                  BRAND STATEMENT
                </span>
                <p className="font-serif text-xl sm:text-2xl md:text-[26px] leading-[1.3] italic font-medium tracking-tight text-[#FAF0F0]">
                  "Kenyamanan dan keanggunan yang tak mengorbankan nilai syariat — itulah Kechally."
                </p>
              </div>
              <p className="text-[10px] sm:text-xs uppercase font-mono tracking-widest text-[#FAF0F0]/60 mt-8">
                — Brand Philosophy
              </p>
            </div>

            {/* Column 2 (soft blush pink card) */}
            <div className="lg:col-span-3 bg-[#FAF0F0] text-[#5A3A3A] p-8 sm:p-10 rounded-[8px] flex flex-col justify-between min-h-[250px] border border-brand-accent/10 transition-transform duration-300 hover:scale-[1.01]">
              <div className="space-y-4">
                {/* Location/Heart motif icon in small circular element */}
                <div className="w-10 h-10 rounded-full bg-[#FAF0F0] border border-brand-accent/15 flex items-center justify-center text-brand-primary">
                  <Heart size={18} className="text-brand-accent fill-brand-accent/10" />
                </div>
                <h3 className="font-serif text-2xl font-bold italic tracking-tight text-brand-primary">
                  Nyaman
                </h3>
                <p className="text-brand-muted text-xs sm:text-sm leading-relaxed font-serif italic text-justify">
                  Lightweight fabrics for all-day ibadah comfort.
                </p>
              </div>
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-brand-muted/75 font-bold mt-4">
                Comfort First
              </span>
            </div>

            {/* Column 3 (nude card #E6CFC8) */}
            <div className="lg:col-span-3 bg-[#E6CFC8] text-[#5A3A3A] p-8 sm:p-10 rounded-[8px] flex flex-col justify-between min-h-[250px] border border-[#d6b9b1] transition-transform duration-300 hover:scale-[1.01]">
              <div className="space-y-4">
                {/* Star/Sparkle motif icon in small circular element */}
                <div className="w-10 h-10 rounded-full bg-[#FDF8F5] border border-brand-accent/15 flex items-center justify-center text-brand-primary">
                  <Sparkles size={18} className="text-brand-accent" />
                </div>
                <h3 className="font-serif text-2xl font-bold italic tracking-tight text-brand-primary">
                  Elegan & Syar'i
                </h3>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-serif italic text-justify">
                  Trendsetting designs that remain fully sharia-compliant.
                </p>
              </div>
              <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-stone-600/75 font-bold mt-4">
                Pure Integrity
              </span>
            </div>

          </div>
        </div>

        {/* Section divider and title for stories below */}
        <div className="border-t border-brand-accent/15 pt-16 mb-16 text-left max-w-xl">
          <span className="text-brand-accent font-mono text-[10px] uppercase tracking-[0.25em] font-bold block mb-2">
            CHAPTERS OF DEVELOPMENT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-normal tracking-tight">
            Our Handcrafted Journey
          </h2>
        </div>

        {/* Dynamic Story Stack Layout - Screen 4 */}
        <div className="space-y-24">
          {ARTISANS.map((val, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center ${
                idx % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Image box */}
              <div 
                className={`lg:col-span-6 overflow-hidden rounded-[4px] bg-brand-surface border border-brand-accent/15 relative ${
                  idx % 2 === 1 ? "lg:order-last" : ""
                }`}
              >
                <div className="aspect-16/10 sm:aspect-[4/3] w-full">
                  <img
                    src={val.image}
                    alt={val.title}
                    className="w-full h-full object-cover hover:scale-[1.02] transition duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute top-4 right-4 bg-brand-primary text-[#FDF8F5] px-3 py-1 text-[9px] font-mono tracking-widest uppercase rounded-[4px]">
                  Malang Workshop
                </div>
              </div>

              {/* Text content */}
              <div className="lg:col-span-6 space-y-5">
                <span className="text-[10px] font-mono tracking-widest text-brand-accent font-bold uppercase">
                  Chapter {idx + 1}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold italic tracking-tighter leading-none">
                  {val.title}
                </h2>
                <div className="h-[1px] bg-brand-accent/20 w-24" />
                <p className="text-brand-muted text-xs sm:text-sm leading-relaxed font-serif text-justify whitespace-pre-line italic">
                  {val.description}
                </p>
                
                <div className="flex gap-4 pt-4">
                  <div className="flex items-center space-x-2 text-brand-muted text-xs font-serif italic">
                    <User size={14} className="text-brand-primary" />
                    <span>30+ Mothers Direct Income</span>
                  </div>
                  <div className="flex items-center space-x-2 text-brand-muted text-xs font-serif italic">
                    <Heart size={14} className="text-brand-primary" />
                    <span>100% Ethical Sewing</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* New Global Reach Section with editorial country strip layout */}
        <section id="global-reach-section" className="mt-28 py-20 bg-[#FDF8F5] select-none border-t border-brand-accent/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
            
            {/* Section Header */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Eyebrow Label */}
              <p className="text-brand-accent font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
                GLOBAL REACH
              </p>
              {/* Headline */}
              <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-primary leading-[1.2] font-normal tracking-tight">
                Handmade in Malang, <br />
                <span className="font-serif italic font-bold text-brand-accent">worn around the world</span>
              </h3>
              <div className="h-[1px] bg-brand-accent/20 w-16 mx-auto mt-4" />
            </div>

            {/* 5-column Horizontal Country Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border border-brand-accent/15 rounded-[12px] overflow-hidden bg-white shadow-[0_4px_24px_-4px_rgba(196,138,143,0.06)]">
              
              {/* Column 1: Indonesia */}
              <div className="group flex flex-col items-center justify-between p-8 min-h-[190px] bg-white transition-all duration-300 hover:bg-[#FAF0F0]/60 border-b lg:border-b-0 border-r border-brand-accent/15">
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                  🇮🇩
                </span>
                <div className="my-4 text-center">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-brand-muted/80">
                    Indonesia
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#5A3A3A] italic leading-none mt-2">
                    43%
                  </p>
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#5A3A3A]/40">
                  Primary Base
                </span>
              </div>

              {/* Column 2: Malaysia */}
              <div className="group flex flex-col items-center justify-between p-8 min-h-[190px] bg-[#FAF0F0]/20 transition-all duration-300 hover:bg-[#FAF0F0]/60 border-b lg:border-b-0 border-r border-brand-accent/15">
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                  🇲🇾
                </span>
                <div className="my-4 text-center">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-brand-muted/80">
                    Malaysia
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#5A3A3A] italic leading-none mt-2">
                    45%
                  </p>
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#5A3A3A]/40">
                  Regional Hub
                </span>
              </div>

              {/* Column 3: UAE */}
              <div className="group flex flex-col items-center justify-between p-8 min-h-[190px] bg-white transition-all duration-300 hover:bg-[#FAF0F0]/60 border-b lg:border-b-0 border-r border-brand-accent/15">
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                  🇦🇪
                </span>
                <div className="my-4 text-center">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-brand-muted/80">
                    UAE
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#5A3A3A] italic leading-none mt-2">
                    5%
                  </p>
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#5A3A3A]/40">
                  Middle East
                </span>
              </div>

              {/* Column 4: Saudi Arabia */}
              <div className="group flex flex-col items-center justify-between p-8 min-h-[190px] bg-[#FAF0F0]/20 transition-all duration-300 hover:bg-[#FAF0F0]/60 border-b lg:border-b-0 border-r border-brand-accent/15">
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                  🇸🇦
                </span>
                <div className="my-4 text-center">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-brand-muted/80">
                    Saudi Arabia
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#5A3A3A] italic leading-none mt-2">
                    3%
                  </p>
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#5A3A3A]/40">
                  Gulf Region
                </span>
              </div>

              {/* Column 5: Netherlands */}
              <div className="group flex flex-col items-center justify-between p-8 min-h-[190px] bg-white transition-all duration-300 hover:bg-[#FAF0F0]/60 border-b lg:border-b-0">
                <span className="text-4xl sm:text-5xl filter drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                  🇳🇱
                </span>
                <div className="my-4 text-center">
                  <p className="text-[10px] font-sans font-bold uppercase tracking-[0.15em] text-brand-muted/80">
                    Netherlands
                  </p>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-[#5A3A3A] italic leading-none mt-2">
                    1%
                  </p>
                </div>
                <span className="text-[8px] font-mono uppercase tracking-widest text-[#5A3A3A]/40">
                  European Outpost
                </span>
              </div>

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
