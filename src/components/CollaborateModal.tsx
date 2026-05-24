import React, { useState } from "react";
import { X, CheckCircle2, Send, HelpCircle, Heart, Star } from "lucide-react";

interface CollaborateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CollaborateModal({ isOpen, onClose }: CollaborateModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [role, setRole] = useState("Influencer / Creator");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop overlay */}
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-brand-primary-dark/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto" 
          aria-hidden="true" 
        />

        {/* Trick to center modal content */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel card */}
        <div className="relative inline-block align-middle bg-brand-surface rounded-[4px] text-left overflow-hidden shadow-none transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-brand-accent/15">
          
          {/* Header Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-brand-bg text-[#C48A8F] hover:text-brand-primary transition cursor-pointer"
            title="Close Collaborate"
          >
            <X size={18} />
          </button>

          {isSubmitted ? (
            /* Submission success state */
            <div className="p-8 sm:p-12 text-center space-y-5 animate-fade-in animate-duration-300">
              <div className="flex justify-center">
                <div className="p-3 bg-brand-bg text-[#C48A8F] rounded-full">
                  <CheckCircle2 size={36} />
                </div>
              </div>
              <p className="text-brand-accent font-sans text-[10px] uppercase tracking-widest font-bold">Proposal Lodged</p>
              <h3 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold italic tracking-tighter leading-none">We’d love to collaborate!</h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-serif italic max-w-sm mx-auto">
                Thank you for reaching out, <strong>{name}</strong> representing <strong>{org || "yourself"}</strong>. A member of our community support team in Malang will reach out to your inbox (<strong>{email}</strong>) within 48 business hours to discuss supply chains, fair wages, or content sharing.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setName("");
                  setEmail("");
                  setOrg("");
                  setNotes("");
                  onClose();
                }}
                className="w-full bg-brand-primary hover:bg-brand-accent text-[#FDF8F5] py-4 rounded-[4px] text-xs tracking-widest uppercase font-sans font-bold transition cursor-pointer"
              >
                Back To Gallery
              </button>
            </div>
          ) : (
            /* Intake Form state */
            <div className="p-6 sm:p-10 space-y-6">
              
              <div className="space-y-2">
                <span className="text-brand-accent font-sans text-[9px] uppercase tracking-[0.2em] font-bold block">Consolidated Heritage Partnership</span>
                <h3 className="font-serif text-3xl sm:text-4xl text-brand-primary font-bold italic tracking-tighter leading-none" id="modal-title">
                  Collaborate with Kechally.
                </h3>
                <p className="text-brand-muted text-xs font-serif italic">
                  Are you a dynamic reseller, a slow-fashion designer, or an ethical photographer? We supply direct wholesale, organic linens, and artisan-crafted items worldwide.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sofia de Jong"
                    className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sofia@outlook.com"
                      className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                      Organization / Brand
                    </label>
                    <input
                      type="text"
                      value={org}
                      onChange={(e) => setOrg(e.target.value)}
                      placeholder="e.g. Utrecht Boutique"
                      className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                    Your Primary Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-brand-bg text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition cursor-pointer"
                  >
                    <option>Influencer / Creator</option>
                    <option>Boutique Retailer & Stockist</option>
                    <option>Sustainable Fashion Designer</option>
                    <option>Non-Governmental Organization (NGO)</option>
                    <option>Faith Community Coordinator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-sans uppercase tracking-[0.2em] font-bold text-brand-primary/80 mb-1.5">
                    Partnership Message & Ideas
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="We'd love to partner to host a workshop or promote Malang hand embroidery..."
                    className="w-full bg-brand-bg hover:bg-brand-bg/90 focus:bg-white text-xs px-4 py-3 rounded-[4px] border border-brand-accent/15 focus:outline-hidden focus:ring-1 focus:ring-brand-accent font-serif italic text-brand-primary transition resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-[#FDF8F5] hover:bg-brand-accent tracking-widest text-[#FDF8F5] text-xs font-sans font-bold py-4 uppercase rounded-[4px] transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Send size={12} />
                    <span>Send Collaboration Proposal</span>
                  </button>
                </div>
              </form>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
