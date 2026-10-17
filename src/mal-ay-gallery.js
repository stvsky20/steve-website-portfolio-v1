// Technical descriptions supplied by the project owner; visible captions stay concise.
export const malAyGallery = [
  {
    image: "01-everyday-checkout.png",
    title: "Everyday checkout",
    caption: "Find it. Add it. Sell it.",
    detail:
      "React 19, TypeScript, Tailwind CSS 4, Vite 8, Lucide React. A tablet-first React checkout combines category browsing, name/barcode search, and large touch targets. Typed product models and shared store context connect the interface to a local repository.",
    alt: "Mal-Ay Store Assistant — Everyday selling, made simple",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "02-clear-shopping-cart.png",
    title: "A clearer cart",
    caption: "Every item. Every total.",
    detail:
      "React Context, TypeScript, integer-centavo currency calculations. Shared cart state drives quantity changes and derived totals. Money is represented in integer centavos, keeping price arithmetic separate from peso display formatting.",
    alt: "Mal-Ay Store Assistant — See every item. Know every total.",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "03-payment-options.png",
    title: "Cash or GCash",
    caption: "Two payment workflows.",
    detail:
      "React, TypeScript, Capacitor Camera, managed media storage. A step-based payment flow supports cash recording and GCash proof-photo capture. Media adapters use browser storage or native device capabilities. The current GCash QR is a placeholder, and payment verification is manual.",
    alt: "Mal-Ay Store Assistant — Give customers a choice",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "04-cash-and-change.png",
    title: "Change, calculated",
    caption: "Clear totals at the counter.",
    detail:
      "React, TypeScript, custom keypad, currency parsing and formatting utilities. Cash input is parsed into centavos, validated against the cart total, and used to calculate change. Completing a sale applies a domain operation through the repository transaction interface.",
    alt: "Mal-Ay Store Assistant — Clear totals. Confident change.",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "05-product-inventory.png",
    title: "Inventory, organized",
    caption: "Products and stock in view.",
    detail:
      "React, TypeScript, repository adapters, IndexedDB, Capacitor SQLite. Product forms and stock controls share typed domain models. The repository factory selects IndexedDB in browsers, SQLite on native Capacitor platforms, and an in-memory fallback when needed.",
    alt: "Mal-Ay Store Assistant — Your products, organized",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "06-low-stock-alerts.png",
    title: "Restock with confidence",
    caption: "Spot low and missing stock.",
    detail:
      "React, TypeScript, shared stock-state logic, memoized filtering. A shared stock-state function classifies products as available, low, or out of stock. The inventory view filters those states into a focused replenishment list.",
    alt: "Mal-Ay Store Assistant — Know what needs restocking",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "07-stock-movement-log.png",
    title: "Every stock movement",
    caption: "A traceable inventory history.",
    detail:
      "TypeScript domain operations, transactional persistence, React filters. Stock mutations produce movement records with quantities, before/after stock, timestamps, and employee context. The interface exposes a read-only log with product, employee, type, and date filters.",
    alt: "Mal-Ay Store Assistant — Keep stock changes in view",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "08-sales-overview.png",
    title: "The day, in numbers",
    caption: "Sales and payment summaries.",
    detail:
      "React, TypeScript, reporting repository, integer-centavo aggregation. Typed reporting queries aggregate sales, payment breakdowns, voids, and stock indicators. Manager access checks and date, employee, and shift filters support reconciliation and drill-down views.",
    alt: "Mal-Ay Store Assistant — Understand the day’s sales",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "09-employee-management.png",
    title: "Your store team",
    caption: "Manager and cashier access.",
    detail:
      "React, TypeScript, Web Crypto API, PBKDF2-SHA-256. Manager-only employee operations control roles, activation, and PIN replacement. Local PIN credentials use random salts and PBKDF2-SHA-256 with 210,000 iterations, with failed-attempt lockouts in the authentication domain.",
    alt: "Mal-Ay Store Assistant — Manage your store team",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
  {
    image: "10-end-of-shift.png",
    title: "Close the shift",
    caption: "Sign out. Keep the records.",
    detail:
      "React, TypeScript, session and shift domain logic, audit records. An explicit confirmation flow closes the active shift and signs out the operator through the store layer. Persisted shift and audit records preserve context for later reporting.",
    alt: "Mal-Ay Store Assistant — Finish the shift with clarity",
    width: 2880,
    height: 2000,
    tone: "cream",
  },
];
