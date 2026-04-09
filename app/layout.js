export const metadata = {
  title: "Trade Infinity — Backtest. Automate. Trade Smarter.",
  description: "India's smart trading platform. Backtested strategies, Telegram alerts, and automation tools for Indian stock market traders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
