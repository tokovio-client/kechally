import { useState, useEffect } from "react";
import { Share2, MessageCircle, Copy, Check, MessageSquare } from "lucide-react";

export default function FloatingShareButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#whatsapp-fab-container")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const shareText = `Check out Kechally Store for premium handmade mukenas: ${window.location.href}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const whatsappChatUrl = "https://wa.me/6289613796071";

  return (
    <div id="whatsapp-fab-container" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Menu Options */}
      {isOpen && (
        <div 
          className="mb-3 flex flex-col items-end space-y-2.5 animate-fade-in-up origin-bottom"
          style={{
            animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Option: Chat on WhatsApp */}
          <div className="flex items-center space-x-2.5 group">
            <span className="bg-[#FAF0F0]/90 backdrop-blur-md border border-[#C48A8F]/20 text-[#5A3A3A] px-3 py-1.5 rounded-[4px] text-[10px] tracking-widest uppercase font-sans font-bold shadow-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:pointer-events-auto">
              Chat with Us
            </span>
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-[#FAF0F0] flex items-center justify-center shadow-md border border-emerald-500/30 transition-all duration-250 hover:scale-105 active:scale-95"
              title="Chat with Us"
            >
              <MessageSquare size={16} />
            </a>
          </div>

          {/* Option: Share Website on WhatsApp */}
          <div className="flex items-center space-x-2.5 group">
            <span className="bg-[#FAF0F0]/90 backdrop-blur-md border border-[#C48A8F]/20 text-[#5A3A3A] px-3 py-1.5 rounded-[4px] text-[10px] tracking-widest uppercase font-sans font-bold shadow-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:pointer-events-auto">
              Share on WhatsApp
            </span>
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-[#FAF0F0] flex items-center justify-center shadow-md border border-green-400/30 transition-all duration-250 hover:scale-105 active:scale-95"
              title="Share on WhatsApp"
            >
              {/* WhatsApp custom SVG logo */}
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.062 5.248 5.308 0 11.773 0c3.133.001 6.08 1.22 8.293 3.435 2.213 2.214 3.43 5.162 3.43 8.294 0 6.523-5.246 11.77-11.71 11.77-2.007 0-3.98-.51-5.733-1.48L0 24zm6.49-5.32c1.676.995 3.518 1.52 5.4 1.52 5.372 0 9.743-4.372 9.745-9.746.002-2.6-1.01-5.047-2.846-6.883-1.835-1.835-4.282-2.848-6.883-2.848-5.377 0-9.749 4.376-9.752 9.753-.001 1.956.51 3.865 1.48 5.54L2.83 21.17l5.717-1.49zm10.124-4.52c-.272-.137-1.61-.795-1.86-.885-.25-.09-.432-.136-.613.137-.18.273-.7 1.09-.858 1.272-.16.182-.317.205-.59.068-2.65-1.32-3.793-2.285-5.307-4.887-.272-.465.272-.432.78-1.442.08-.163.04-.306-.02-.442-.06-.137-.614-1.48-.84-2.027-.22-.53-.443-.458-.613-.466-.16-.008-.34-.01-.522-.01-.18 0-.476.067-.725.34-.25.272-.953.93-.953 2.27 0 1.338.975 2.628 1.11 2.81 1.34 1.76 2.053 2.69 3.864 3.407.973.385 1.733.612 2.324.8.98.31 1.875.266 2.58.16.788-.117 2.41-.986 2.75-1.94.34-.954.34-1.773.238-1.94-.1-.167-.363-.254-.636-.39z" />
              </svg>
            </a>
          </div>

          {/* Option: Copy Store Link */}
          <div className="flex items-center space-x-2.5 group">
            <span className="bg-[#FAF0F0]/90 backdrop-blur-md border border-[#C48A8F]/20 text-[#5A3A3A] px-3 py-1.5 rounded-[4px] text-[10px] tracking-widest uppercase font-sans font-bold shadow-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:pointer-events-auto">
              {copied ? "Copied!" : "Copy Link"}
            </span>
            <button
              onClick={handleCopyLink}
              className="w-10 h-10 rounded-full bg-[#5A3A3A] hover:bg-[#462d2d] text-[#FAF0F0] flex items-center justify-center shadow-md border border-[#FAF0F0]/10 transition-all duration-250 hover:scale-105 active:scale-95 cursor-pointer"
              title="Copy Link"
            >
              {copied ? <Check size={16} className="text-brand-pink" /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
          isOpen
            ? "bg-[#5A3A3A] text-[#FAF0F0] border border-[#C48A8F]/40 rotate-90"
            : "bg-[#FAF0F0]/90 backdrop-blur-md text-[#5A3A3A] border border-[#C48A8F]/30 hover:border-[#C48A8F]/60"
        }`}
        aria-label="Share options"
      >
        <Share2 size={22} className={isOpen ? "rotate-45 transition-transform duration-300" : "transition-transform duration-300"} />
      </button>
    </div>
  );
}
