// Screenshots and engineering details supplied by the project owner.
export const tradeJournalGallery = [
  {
    image: "01-dashboard.png",
    title: "Performance, in perspective",
    caption: "Equity. Drawdown. Expectancy.",
    detail:
      "React and Recharts visualize equity, drawdown, win rate, profit factor, expectancy, and realized R from persisted trades. PHP backend calculations keep net P&L and risk metrics consistent across manual entries and imports.",
    alt: "Trade Journal Pro dashboard with equity curve and trading performance metrics.",
    width: 1585,
    height: 892,
    tone: "cream",
  },
  {
    image: "02-trades.png",
    title: "Every trade, recorded",
    caption: "One consistent trade history.",
    detail:
      "Trade CRUD runs through frontend service modules and a PHP REST API backed by MySQL. Account-based PIN authentication uses server-side sessions. TradingView CSV imports use validation, preview, and confirmation, FIFO execution matching for partial closes and reversals, and fingerprints to prevent duplicate imports.",
    alt: "Trade Journal Pro trade history and trade management workspace.",
    width: 1600,
    height: 900,
    tone: "cream",
  },
  {
    image: "03-trade-review.png",
    title: "Review beyond the result",
    caption: "Risk, rules, and context.",
    detail:
      "Structured trade reviews combine planned risk, reward, tags, rule checklists, notes, and chart screenshots. Net P&L, duration, planned risk-to-reward, and realized R are calculated on the backend.",
    alt: "Trade Journal Pro detailed trade review with risk parameters and journal fields.",
    width: 1600,
    height: 900,
    tone: "cream",
  },
  {
    image: "04-psychology-review.png",
    title: "Understand the decisions",
    caption: "Confidence. Discipline. Reflection.",
    detail:
      "Psychology ratings capture confidence, discipline, and stress alongside trade grades and reflective notes, preserving the decision-making context of each trade.",
    alt: "Trade Journal Pro psychology review with confidence, discipline, stress, and reflective notes.",
    width: 1600,
    height: 900,
    tone: "cream",
  },
  {
    image: "05-time-analysis.png",
    title: "Find your rhythm",
    caption: "Time and session analysis.",
    detail:
      "Timestamps are standardized in UTC and converted using IANA timezones for display, date filters, and trading-session classification. Verification scripts cover timezone handling alongside CRUD and CSV import behavior.",
    alt: "Trade Journal Pro time-based and trading-session performance analysis.",
    width: 1585,
    height: 892,
    tone: "cream",
  },
  {
    image: "06-market-breakdown.png",
    title: "See what drives performance",
    caption: "Break results down by market.",
    detail:
      "Analytics derive market and performance breakdowns from persisted trade records, connecting the results to the underlying trade history rather than disconnected dashboard samples.",
    alt: "Trade Journal Pro market performance breakdown and analytics.",
    width: 1600,
    height: 900,
    tone: "cream",
  },
];
