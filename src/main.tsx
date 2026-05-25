import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// ── Minimal SPA Router ────────────────────────────────────────────────────────
// Parses the current URL and renders either the Order Detail page or the main App.

const path = window.location.pathname;
const orderMatch = path.match(/^\/orders\/([^/]+)/);

async function mount() {
  const rootEl = document.getElementById('root')!;

  if (orderMatch) {
    // Render standalone Order Detail page
    const orderId = orderMatch[1];
    const { default: OrderPage } = await import('./pages/OrderPage');
    createRoot(rootEl).render(
      <StrictMode>
        <OrderPage orderId={orderId} />
      </StrictMode>,
    );
  } else {
    // Render main storefront app
    const { default: App } = await import('./App');
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

mount();
