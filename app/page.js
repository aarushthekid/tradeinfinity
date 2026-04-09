"use client";
import { useState, useEffect, useRef } from "react";

// ─── Backtest data for 52-week high strategy ───
// Period: April 2023 – March 2025 (24 months)
// Universe: Nifty 100 stocks (Top 100 NSE-listed Indian companies)
// Note: This is demo data for prototype. Replace with real backtest from Chartink/Screener.
const BACKTEST_PERIOD = "Apr 2023 – Mar 2025 (24 Months)";
const backtestTrades = [
  { stock: "Reliance Industries", entry: 2450, target: 3185, sl: 2082.5, exitPrice: 3185, result: "Target Hit", returnPct: 30, date: "2023-04-12" },
  { stock: "TCS", entry: 3380, target: 4394, sl: 2873, exitPrice: 4394, result: "Target Hit", returnPct: 30, date: "2023-05-22" },
  { stock: "HDFC Bank", entry: 1680, target: 2184, sl: 1428, exitPrice: 1428, result: "SL Hit", returnPct: -15, date: "2023-06-18" },
  { stock: "Infosys", entry: 1520, target: 1976, sl: 1292, exitPrice: 1976, result: "Target Hit", returnPct: 30, date: "2023-07-09" },
  { stock: "Bajaj Finance", entry: 7200, target: 9360, sl: 6120, exitPrice: 9360, result: "Target Hit", returnPct: 30, date: "2023-08-14" },
  { stock: "Larsen & Toubro", entry: 2680, target: 3484, sl: 2278, exitPrice: 3484, result: "Target Hit", returnPct: 30, date: "2023-09-25" },
  { stock: "ITC", entry: 470, target: 611, sl: 399.5, exitPrice: 399.5, result: "SL Hit", returnPct: -15, date: "2023-10-11" },
  { stock: "Bharti Airtel", entry: 920, target: 1196, sl: 782, exitPrice: 1196, result: "Target Hit", returnPct: 30, date: "2023-11-03" },
  { stock: "SBI", entry: 630, target: 819, sl: 535.5, exitPrice: 819, result: "Target Hit", returnPct: 30, date: "2023-12-19" },
  { stock: "Axis Bank", entry: 1080, target: 1404, sl: 918, exitPrice: 918, result: "SL Hit", returnPct: -15, date: "2024-01-22" },
  { stock: "Tata Motors", entry: 740, target: 962, sl: 629, exitPrice: 962, result: "Target Hit", returnPct: 30, date: "2024-02-28" },
  { stock: "Maruti Suzuki", entry: 10800, target: 14040, sl: 9180, exitPrice: 14040, result: "Target Hit", returnPct: 30, date: "2024-04-15" },
  { stock: "HUL", entry: 2580, target: 3354, sl: 2193, exitPrice: 2193, result: "SL Hit", returnPct: -15, date: "2024-05-20" },
  { stock: "Sun Pharma", entry: 1540, target: 2002, sl: 1309, exitPrice: 2002, result: "Target Hit", returnPct: 30, date: "2024-07-08" },
  { stock: "Kotak Mahindra Bank", entry: 1820, target: 2366, sl: 1547, exitPrice: 1547, result: "SL Hit", returnPct: -15, date: "2024-08-12" },
  { stock: "Titan Company", entry: 3450, target: 4485, sl: 2932.5, exitPrice: 4485, result: "Target Hit", returnPct: 30, date: "2024-09-30" },
  { stock: "Power Grid Corp", entry: 310, target: 403, sl: 263.5, exitPrice: 403, result: "Target Hit", returnPct: 30, date: "2024-11-14" },
  { stock: "NTPC", entry: 380, target: 494, sl: 323, exitPrice: 494, result: "Target Hit", returnPct: 30, date: "2025-01-06" },
  { stock: "Adani Ports", entry: 1350, target: 1755, sl: 1147.5, exitPrice: 1147.5, result: "SL Hit", returnPct: -15, date: "2025-02-10" },
  { stock: "Bajaj Finserv", entry: 1680, target: 2184, sl: 1428, exitPrice: 2184, result: "Target Hit", returnPct: 30, date: "2025-03-18" },
];

const totalTrades = backtestTrades.length;
const wins = backtestTrades.filter(t => t.result === "Target Hit").length;
const losses = totalTrades - wins;
const winRate = ((wins / totalTrades) * 100).toFixed(1);
const avgReturn = (backtestTrades.reduce((a, b) => a + b.returnPct, 0) / totalTrades).toFixed(1);
const totalReturn = backtestTrades.reduce((a, b) => a + b.returnPct, 0).toFixed(1);

const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');`;

export default function TradeInfinity() {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [loginTab, setLoginTab] = useState("login");
  const [trialActive, setTrialActive] = useState(false);
  const [proPlan, setProPlan] = useState(false);
  const [showTelegramSetup, setShowTelegramSetup] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [riskResult, setRiskResult] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimatedStats(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  // Risk calculator
  const [riskForm, setRiskForm] = useState({ capital: "", riskPct: "", entry: "", sl: "", leverage: "1" });
  const calcRisk = () => {
    const { capital, riskPct, entry, sl, leverage } = riskForm;
    const c = parseFloat(capital), r = parseFloat(riskPct), e = parseFloat(entry), s = parseFloat(sl), l = parseFloat(leverage);
    if (!c || !r || !e || !s || !l) return;
    const riskAmt = (c * r) / 100;
    const slPerShare = Math.abs(e - s);
    if (slPerShare === 0) return;
    const qty = Math.floor((riskAmt / slPerShare) * l);
    const positionSize = qty * e;
    setRiskResult({ qty, riskAmt: riskAmt.toFixed(0), positionSize: positionSize.toFixed(0), slPerShare: slPerShare.toFixed(2) });
  };

  // Custom strategy form
  const [stratForm, setStratForm] = useState({ name: "", email: "", phone: "", instrument: "Nifty 100", strategyName: "", description: "", entry_rule: "", sl_rule: "", target_rule: "", timeframe: "Swing (1-30 days)", meetPref: "WhatsApp" });
  const handleStratSubmit = () => {
    if (!stratForm.name || !stratForm.email || !stratForm.description) return;
    setFormSubmitted(true);
  };

  // Login
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) return;
    setIsLoggedIn(true);
    setUserName(loginTab === "signup" ? loginForm.name || "Trader" : "Trader");
    setTrialActive(true);
    setShowLogin(false);
  };

  const handlePayment = () => {
    setProPlan(true);
    alert("Demo: Payment successful via Cashfree! Pro plan activated.");
  };

  const canAccess = trialActive || proPlan;

  const navLinks = [["Strategies", "strategies"], ["Backtest", "backtest"], ["Tools", "tools"], ["Pricing", "pricing"], ["Custom Strategy", "custom"], ["About", "about"]];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#06080d", color: "#e8e6e1", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{fonts}{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #00e89d33; color: #00e89d; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0d14; }
        ::-webkit-scrollbar-thumb { background: #1a2035; border-radius: 3px; }
        .glow { text-shadow: 0 0 40px #00e89d44; }
        .card { background: #0d1017; border: 1px solid #151b28; border-radius: 16px; transition: all 0.3s; }
        .card:hover { border-color: #00e89d33; transform: translateY(-2px); box-shadow: 0 8px 32px #00e89d11; }
        .btn-primary { background: #00e89d; color: #06080d; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-primary:hover { background: #00ffa8; transform: translateY(-1px); box-shadow: 0 4px 20px #00e89d44; }
        .btn-outline { background: transparent; color: #00e89d; border: 1.5px solid #00e89d44; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
        .btn-outline:hover { background: #00e89d11; border-color: #00e89d; }
        .tag { display: inline-block; background: #00e89d15; color: #00e89d; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Space Mono', monospace; }
        .input { background: #0d1017; border: 1.5px solid #1a2035; border-radius: 10px; padding: 12px 16px; color: #e8e6e1; font-size: 14px; width: 100%; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; }
        .input:focus { border-color: #00e89d55; }
        .stat-num { font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 700; color: #00e89d; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .section { padding: 80px 20px; max-width: 1100px; margin: 0 auto; }
        .win { color: #00e89d; } .loss { color: #ff4d6a; }
        .mobile-nav { display: none; }
        @media (max-width: 768px) {
          .section { padding: 50px 16px; }
          .stat-num { font-size: 24px; }
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .mobile-nav { display: flex; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#06080dee", backdropFilter: "blur(20px)", borderBottom: "1px solid #151b28" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("home")}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00e89d, #00b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#06080d" }}>T∞</div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>Trade Infinity</span>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="desktop-nav">
            {navLinks.map(([label, id]) => (
              <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: 14, color: "#8a8f9c", cursor: "pointer", fontWeight: 500, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "#00e89d"} onMouseLeave={e => e.target.style.color = "#8a8f9c"}>{label}</span>
            ))}
            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00e89d22", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e89d", fontWeight: 700, fontSize: 13 }}>{userName[0]}</div>
                <span style={{ fontSize: 13, color: "#00e89d" }}>{proPlan ? "PRO" : trialActive ? "TRIAL" : ""}</span>
              </div>
            ) : (
              <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }} onClick={() => setShowLogin(true)}>Get Started</button>
            )}
          </div>
          <div style={{ display: "none", cursor: "pointer", fontSize: 24, color: "#e8e6e1" }} className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)}>☰</div>
        </div>
        {/* Mobile menu */}
        {mobileMenu && (
          <div className="mobile-nav" style={{ flexDirection: "column", padding: "16px 20px", gap: 16, borderTop: "1px solid #151b28", background: "#06080dee" }}>
            {navLinks.map(([label, id]) => (
              <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: 15, color: "#8a8f9c", cursor: "pointer", fontWeight: 500 }}>{label}</span>
            ))}
            {!isLoggedIn && <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 14 }} onClick={() => { setShowLogin(true); setMobileMenu(false); }}>Get Started</button>}
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section id="home" style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, #00e89d08 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          <span className="tag" style={{ marginBottom: 24, display: "inline-block" }}>India&#39;s Smart Trading Platform</span>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1.5 }}>
            Backtest. Automate.<br /><span className="glow" style={{ color: "#00e89d" }}>Trade Smarter.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#8a8f9c", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
            We take proven trading strategies, backtest them on real Indian market data, and send you live alerts on Telegram — so you never miss a trade.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => isLoggedIn ? scrollTo("strategies") : setShowLogin(true)}>
              {isLoggedIn ? "View Strategies" : "Start 7-Day Free Trial"}
            </button>
            <button className="btn-outline" onClick={() => scrollTo("backtest")}>See Backtest Results</button>
          </div>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[["NSE India", "Market"], ["Swing Trading", "Style"], ["Telegram", "Alerts"]].map(([val, lbl]) => (
              <div key={lbl}><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: "#00e89d" }}>{val}</div><div style={{ fontSize: 12, color: "#555d6e", marginTop: 2 }}>{lbl}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STRATEGY OVERVIEW ─── */}
      <section id="strategies" className="section">
        <span className="tag">Our Strategies</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>52-Week High Breakout Strategy</h2>
        <p style={{ color: "#8a8f9c", maxWidth: 640, marginBottom: 40, lineHeight: 1.7 }}>
          When any stock from the Nifty 100 index (top 100 companies listed on NSE India) hits its 52-week high, we enter the trade. Target: +30% from entry. Stop Loss: -15% from entry. Simple, systematic, and built for Indian markets.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            ["Entry Signal", "Stock hits 52-week high", "📈"],
            ["Target", "+30% from entry price", "🎯"],
            ["Stop Loss", "-15% from entry price", "🛡️"],
            ["Universe", "Nifty 100 — Top 100 NSE-listed Indian companies", "🏢"],
            ["Style", "Swing Trading", "⏱️"],
            ["Alerts", "Real-time on Telegram", "📲"],
          ].map(([title, desc, icon]) => (
            <div key={title} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ color: "#8a8f9c", fontSize: 14, lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 32, padding: 32, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #0d1017, #0f1420)" }}>
          <div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>🤖 Automate This Strategy</h3>
            <p style={{ color: "#8a8f9c", fontSize: 14, maxWidth: 500 }}>Get real-time Telegram alerts whenever this strategy triggers — stock name, entry price, target, and stop loss delivered instantly.</p>
          </div>
          <button className="btn-primary" onClick={() => {
            if (!isLoggedIn) { setShowLogin(true); return; }
            if (!canAccess) { scrollTo("pricing"); return; }
            setShowTelegramSetup(true);
          }}>Connect Telegram →</button>
        </div>
      </section>

      {/* ─── BACKTEST RESULTS ─── */}
      <section id="backtest" className="section">
        <span className="tag">Backtest Results</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Performance Data</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 32 }}>
          <p style={{ color: "#8a8f9c", margin: 0 }}>52-Week High strategy on Nifty 100 (NSE India)</p>
          <span style={{ background: "#00e89d15", color: "#00e89d", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>{BACKTEST_PERIOD}</span>
        </div>
        <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            [totalTrades, "Total Trades"],
            [wins, "Winners"],
            [winRate + "%", "Win Rate"],
            [avgReturn + "%", "Avg Return/Trade"],
            [totalReturn + "%", "Total Return"],
            ["2.0", "Reward:Risk"],
          ].map(([val, label]) => (
            <div key={label} className="card" style={{ padding: 20, textAlign: "center" }}>
              <div className="stat-num" style={{ opacity: animatedStats ? 1 : 0, transition: "opacity 0.8s" }}>{val}</div>
              <div style={{ fontSize: 12, color: "#555d6e", marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a2035" }}>
                {["Date", "Stock", "Entry ₹", "Target ₹", "SL ₹", "Result", "Return"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#555d6e", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backtestTrades.map((t, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #111520" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#8a8f9c" }}>{t.date}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{t.stock}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace" }}>₹{t.entry.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace" }}>₹{t.target.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace" }}>₹{t.sl.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px" }}><span className={t.result === "Target Hit" ? "win" : "loss"} style={{ fontWeight: 600 }}>{t.result}</span></td>
                  <td style={{ padding: "12px 16px", fontFamily: "'Space Mono', monospace" }}><span className={t.returnPct > 0 ? "win" : "loss"}>{t.returnPct > 0 ? "+" : ""}{t.returnPct}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─── RISK CALCULATOR ─── */}
      <section id="tools" className="section">
        <span className="tag">Free Tools</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Position Size Calculator</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 32 }}>Know exactly how many shares to buy based on your risk management rules.</p>
        <div className="card" style={{ padding: 32, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              ["Capital (₹)", "capital", "e.g. 100000"],
              ["Risk per trade (%)", "riskPct", "e.g. 2"],
              ["Entry Price (₹)", "entry", "e.g. 500"],
              ["Stop Loss (₹)", "sl", "e.g. 470"],
              ["Leverage (x)", "leverage", "e.g. 1"],
            ].map(([label, key, ph]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>{label}</label>
                <input className="input" placeholder={ph} value={riskForm[key]} onChange={e => setRiskForm({ ...riskForm, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={calcRisk}>Calculate Position Size</button>
          {riskResult && (
            <div style={{ marginTop: 20, padding: 20, background: "#0a0d14", borderRadius: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Shares to Buy</div><div className="stat-num" style={{ fontSize: 28 }}>{riskResult.qty}</div></div>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Risk Amount</div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, color: "#ff4d6a", fontWeight: 700 }}>₹{riskResult.riskAmt}</div></div>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Position Size</div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700 }}>₹{riskResult.positionSize}</div></div>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Risk/Share</div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700 }}>₹{riskResult.slPerShare}</div></div>
            </div>
          )}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="section">
        <span className="tag">Pricing</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Simple, Transparent Plans</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 40 }}>Start with a 7-day free trial. Upgrade when you&#39;re ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 700, margin: "0 auto" }}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 14, color: "#555d6e", fontWeight: 600, marginBottom: 8 }}>FREE TRIAL</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>₹0</div>
            <div style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>7 days • No credit card needed</div>
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 20 }}>
              {["View all backtest results", "1 strategy access", "Telegram alerts (7 days)", "Position size calculator"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, fontSize: 14, color: "#b0b5bf" }}>
                  <span style={{ color: "#00e89d" }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button className="btn-outline" style={{ width: "100%", marginTop: 16 }} onClick={() => { if (!isLoggedIn) setShowLogin(true); else setTrialActive(true); }}>
              {trialActive ? "Trial Active ✓" : "Start Free Trial"}
            </button>
          </div>
          <div className="card" style={{ padding: 32, border: "1.5px solid #00e89d44", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20 }}><span className="tag" style={{ background: "#00e89d", color: "#06080d" }}>POPULAR</span></div>
            <div style={{ fontSize: 14, color: "#555d6e", fontWeight: 600, marginBottom: 8 }}>PRO PLAN</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#00e89d" }}>₹499<span style={{ fontSize: 16, color: "#8a8f9c" }}>/mo</span></div>
            <div style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>Billed monthly • Cancel anytime</div>
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 20 }}>
              {["Everything in Free", "Unlimited strategy access", "Unlimited Telegram alerts", "Priority support", "Custom strategy consultation", "Early access to new strategies"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, fontSize: 14, color: "#b0b5bf" }}>
                  <span style={{ color: "#00e89d" }}>✓</span>{f}
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={() => { if (!isLoggedIn) { setShowLogin(true); return; } handlePayment(); }}>
              {proPlan ? "Pro Active ✓" : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </section>

      {/* ─── CUSTOM STRATEGY ─── */}
      <section id="custom" className="section">
        <span className="tag">Custom Strategy</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Get Your Strategy Automated</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 32, maxWidth: 600 }}>Share your strategy with us. We&#39;ll backtest it, automate it, and set up Telegram alerts — all personalized for you.</p>
        {formSubmitted ? (
          <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>Strategy Submitted!</h3>
            <p style={{ color: "#8a8f9c", marginBottom: 20 }}>Our team will review your strategy and reach out within 24 hours via WhatsApp or Email.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-outline" onClick={() => window.open("https://wa.me/917869143383?text=Hi%20Trade%20Infinity%2C%20I%20just%20submitted%20my%20custom%20strategy%20on%20your%20website.", "_blank")}>Chat on WhatsApp</button>
              <button className="btn-outline" onClick={() => setFormSubmitted(false)}>Submit Another</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 600 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Your Name *</label><input className="input" value={stratForm.name} onChange={e => setStratForm({ ...stratForm, name: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Email *</label><input className="input" type="email" value={stratForm.email} onChange={e => setStratForm({ ...stratForm, email: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Phone Number</label><input className="input" value={stratForm.phone} onChange={e => setStratForm({ ...stratForm, phone: e.target.value })} /></div>
                <div>
                  <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Instrument</label>
                  <select className="input" value={stratForm.instrument} onChange={e => setStratForm({ ...stratForm, instrument: e.target.value })}>
                    {["Nifty 100", "Nifty 50", "Bank Nifty", "Nifty Next 50", "F&O Stocks", "BSE Sensex", "Mid-cap Stocks", "Other NSE/BSE"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Strategy Name</label><input className="input" placeholder="e.g. RSI Reversal Strategy" value={stratForm.strategyName} onChange={e => setStratForm({ ...stratForm, strategyName: e.target.value })} /></div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Strategy Description *</label><textarea className="input" rows={4} placeholder="Describe your entry rules, conditions, indicators used..." value={stratForm.description} onChange={e => setStratForm({ ...stratForm, description: e.target.value })} style={{ resize: "vertical" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Entry Rule</label><input className="input" placeholder="e.g. Buy when RSI crosses above 30" value={stratForm.entry_rule} onChange={e => setStratForm({ ...stratForm, entry_rule: e.target.value })} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Target Rule</label><input className="input" placeholder="e.g. 20% from entry" value={stratForm.target_rule} onChange={e => setStratForm({ ...stratForm, target_rule: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Stop Loss Rule</label><input className="input" placeholder="e.g. 10% below entry" value={stratForm.sl_rule} onChange={e => setStratForm({ ...stratForm, sl_rule: e.target.value })} /></div>
                <div>
                  <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Preferred Consultation</label>
                  <select className="input" value={stratForm.meetPref} onChange={e => setStratForm({ ...stratForm, meetPref: e.target.value })}>
                    {["WhatsApp", "Email"].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 24 }} onClick={handleStratSubmit}>Submit Strategy for Review</button>
            <p style={{ fontSize: 12, color: "#555d6e", marginTop: 12, textAlign: "center" }}>We&#39;ll contact you within 24 hours via WhatsApp (+91 7869143383) or Email (tradeinfinity1410@gmail.com).</p>
          </div>
        )}
      </section>

      {/* ─── ABOUT ─── */}
      <section id="about" className="section">
        <span className="tag">About Us</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 24 }}>Built by Traders, for Traders</h2>
        <div className="card" style={{ padding: 32, maxWidth: 700 }}>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8, marginBottom: 16 }}>
            Trade Infinity was born from a simple frustration — retail traders in India deserve access to the same backtesting and automation tools that institutional players use. We&#39;re a team of young traders and tech enthusiasts building affordable, no-nonsense trading tools exclusively for the Indian stock market.
          </p>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8, marginBottom: 16 }}>
            Our mission is to democratize algorithmic trading for Indian retail traders. We start by giving you backtested, proven strategies on NSE-listed stocks with real-time Telegram alerts. Next, we&#39;ll offer full algo trading integration with Indian brokers — completely hands-free execution.
          </p>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8 }}>
            Whether you&#39;re a swing trader managing a small portfolio or someone with a unique strategy that needs automation — we&#39;ve got you covered. Our focus is 100% on Indian equities — NSE, BSE, Nifty indices, and F&O stocks.
          </p>
          <div style={{ marginTop: 24, padding: 20, background: "#0a0d14", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "#555d6e", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Get in Touch</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <a href="https://wa.me/917869143383" target="_blank" rel="noopener noreferrer" style={{ color: "#00e89d", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>📱 WhatsApp: +91 7869143383</a>
              <a href="mailto:tradeinfinity1410@gmail.com" style={{ color: "#00e89d", textDecoration: "none", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>📧 tradeinfinity1410@gmail.com</a>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={() => scrollTo("custom")}>Submit Your Strategy</button>
            <button className="btn-primary" onClick={() => window.open("https://wa.me/917869143383?text=Hi%20Trade%20Infinity!", "_blank")}>WhatsApp Us →</button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: "1px solid #151b28", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #00e89d, #00b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#06080d" }}>T∞</div>
          <span style={{ fontWeight: 700 }}>Trade Infinity</span>
        </div>
        <p style={{ color: "#555d6e", fontSize: 13 }}>Backtesting & Trading Alerts for the Indian Stock Market</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
          <a href="https://wa.me/917869143383" target="_blank" rel="noopener noreferrer" style={{ color: "#8a8f9c", textDecoration: "none", fontSize: 13 }}>WhatsApp</a>
          <a href="mailto:tradeinfinity1410@gmail.com" style={{ color: "#8a8f9c", textDecoration: "none", fontSize: 13 }}>Email</a>
          <span style={{ color: "#8a8f9c", fontSize: 13 }}>Telegram: @TradeInfinityBot</span>
        </div>
        <p style={{ color: "#333844", fontSize: 12, marginTop: 16 }}>© 2026 Trade Infinity. All rights reserved. Not SEBI registered. For educational purposes only.</p>
      </footer>

      {/* ─── LOGIN MODAL ─── */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div className="card" style={{ padding: 32, maxWidth: 400, width: "100%", background: "#0d1017" }}>
            <div style={{ display: "flex", gap: 0, marginBottom: 24, borderRadius: 10, overflow: "hidden", border: "1px solid #1a2035" }}>
              {["login", "signup"].map(tab => (
                <button key={tab} onClick={() => setLoginTab(tab)} style={{ flex: 1, padding: 12, background: loginTab === tab ? "#00e89d15" : "transparent", color: loginTab === tab ? "#00e89d" : "#555d6e", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                  {tab === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>
            {loginTab === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Full Name</label>
                <input className="input" placeholder="Your name" value={loginForm.name} onChange={e => setLoginForm({ ...loginForm, name: e.target.value })} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            </div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleLogin}>
              {loginTab === "login" ? "Log In" : "Create Account & Start Trial"}
            </button>
            <p style={{ fontSize: 12, color: "#555d6e", textAlign: "center", marginTop: 16 }}>
              {loginTab === "signup" ? "7-day free trial included. No payment needed." : "Don't have an account? Click Sign Up above."}
            </p>
          </div>
        </div>
      )}

      {/* ─── TELEGRAM SETUP MODAL ─── */}
      {showTelegramSetup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowTelegramSetup(false); }}>
          <div className="card" style={{ padding: 32, maxWidth: 440, width: "100%", background: "#0d1017" }}>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>📲 Connect Telegram</h3>
            <p style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Follow these steps to receive trade alerts:</p>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                ["1", "Open Telegram and search for @TradeInfinityBot"],
                ["2", "Send /start to the bot"],
                ["3", "The bot will ask for your registered email — enter it"],
                ["4", "You'll receive a confirmation message once linked"],
              ].map(([num, text]) => (
                <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00e89d22", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e89d", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{num}</div>
                  <div style={{ color: "#b0b5bf", fontSize: 14, paddingTop: 4 }}>{text}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 16, background: "#0a0d14", borderRadius: 10 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: "#00e89d", textAlign: "center" }}>@TradeInfinityBot</div>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={() => { setTelegramConnected(true); setShowTelegramSetup(false); }}>
              I&#39;ve Connected the Bot ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
