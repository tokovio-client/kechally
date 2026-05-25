import React from "react";
import { Flower } from "lucide-react";
import OrderView from "../components/OrderView";

interface OrderPageProps {
  orderId: string;
}

export default function OrderPage({ orderId }: OrderPageProps) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">

      {/* Minimal branded header */}
      <header className="sticky top-0 z-50 w-full bg-brand-bg/90 backdrop-blur-md border-b border-brand-pink/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center h-16">
          <a
            href="/"
            className="flex items-center space-x-2.5 group"
            aria-label="Back to Kechally"
          >
            <Flower
              size={14}
              className="text-brand-pink fill-brand-pink/20 transition-transform duration-500 group-hover:rotate-12"
            />
            <span className="font-serif text-xl tracking-[0.2em] text-brand-primary font-bold italic transition group-hover:text-brand-accent">
              Kechally
            </span>
          </a>
        </div>
      </header>

      {/* Order Detail */}
      <main className="flex-grow">
        <OrderView
          orderId={orderId}
          currency="IDR"
          onBack={() => { window.location.href = "/"; }}
        />
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-brand-primary/10 py-6 text-center">
        <p className="text-xs text-brand-text/40 font-sans tracking-widest uppercase">
          &copy; {new Date().getFullYear()} Kechally · All rights reserved
        </p>
      </footer>
    </div>
  );
}
