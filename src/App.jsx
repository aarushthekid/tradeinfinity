import { useState, useEffect, useRef } from "react";

// ─── 2-YEAR SIMULATED BACKTEST: April 2023 – March 2025 ───
// Strategy: Buy Nifty 100 stock when it hits 52-week high. Target +30%, SL -15%.
const backtestTrades = [
  { stock: "Trent Ltd", entry: 1485, target: 1931, sl: 1262, exitPrice: 1931, result: "Target Hit", returnPct: 30, date: "2023-04-12" },
  { stock: "Bajaj Auto", entry: 4580, target: 5954, sl: 3893, exitPrice: 5954, result: "Target Hit", returnPct: 30, date: "2023-05-03" },
  { stock: "Reliance Industries", entry: 2620, target: 3406, sl: 2227, exitPrice: 2227, result: "SL Hit", returnPct: -15, date: "2023-05-18" },
  { stock: "Bharat Electronics", entry: 118, target: 153, sl: 100, exitPrice: 153, result: "Target Hit", returnPct: 30, date: "2023-06-07" },
  { stock: "Coal India", entry: 238, target: 309, sl: 202, exitPrice: 309, result: "Target Hit", returnPct: 30, date: "2023-06-29" },
  { stock: "Cipla", entry: 1065, target: 1385, sl: 905, exitPrice: 905, result: "SL Hit", returnPct: -15, date: "2023-07-20" },
  { stock: "Adani Ports", entry: 785, target: 1021, sl: 667, exitPrice: 1021, result: "Target Hit", returnPct: 30, date: "2023-08-14" },
  { stock: "NTPC", entry: 198, target: 257, sl: 168, exitPrice: 257, result: "Target Hit", returnPct: 30, date: "2023-09-05" },
  { stock: "Power Grid Corp", entry: 245, target: 319, sl: 208, exitPrice: 319, result: "Target Hit", returnPct: 30, date: "2023-10-02" },
  { stock: "Shriram Finance", entry: 1920, target: 2496, sl: 1632, exitPrice: 1632, result: "SL Hit", returnPct: -15, date: "2023-10-25" },
  { stock: "M&M", entry: 1620, target: 2106, sl: 1377, exitPrice: 2106, result: "Target Hit", returnPct: 30, date: "2023-11-16" },
  { stock: "Eicher Motors", entry: 3780, target: 4914, sl: 3213, exitPrice: 4914, result: "Target Hit", returnPct: 30, date: "2023-12-04" },
  { stock: "HAL", entry: 2150, target: 2795, sl: 1828, exitPrice: 2795, result: "Target Hit", returnPct: 30, date: "2024-01-11" },
  { stock: "Grasim Industries", entry: 2080, target: 2704, sl: 1768, exitPrice: 1768, result: "SL Hit", returnPct: -15, date: "2024-01-30" },
  { stock: "SBI", entry: 645, target: 839, sl: 548, exitPrice: 839, result: "Target Hit", returnPct: 30, date: "2024-02-19" },
  { stock: "Indian Railway Finance", entry: 142, target: 185, sl: 121, exitPrice: 185, result: "Target Hit", returnPct: 30, date: "2024-03-08" },
  { stock: "Zomato", entry: 178, target: 231, sl: 151, exitPrice: 231, result: "Target Hit", returnPct: 30, date: "2024-04-15" },
  { stock: "Tata Motors", entry: 985, target: 1281, sl: 837, exitPrice: 837, result: "SL Hit", returnPct: -15, date: "2024-05-06" },
  { stock: "JSW Steel", entry: 870, target: 1131, sl: 740, exitPrice: 1131, result: "Target Hit", returnPct: 30, date: "2024-06-12" },
  { stock: "Bajaj Finance", entry: 7250, target: 9425, sl: 6163, exitPrice: 9425, result: "Target Hit", returnPct: 30, date: "2024-07-03" },
  { stock: "Apollo Hospitals", entry: 6120, target: 7956, sl: 5202, exitPrice: 7956, result: "Target Hit", returnPct: 30, date: "2024-08-09" },
  { stock: "LTIMindtree", entry: 5480, target: 7124, sl: 4658, exitPrice: 4658, result: "SL Hit", returnPct: -15, date: "2024-09-01" },
  { stock: "Bharti Airtel", entry: 1540, target: 2002, sl: 1309, exitPrice: 2002, result: "Target Hit", returnPct: 30, date: "2024-10-14" },
  { stock: "ICICI Bank", entry: 1180, target: 1534, sl: 1003, exitPrice: 1534, result: "Target Hit", returnPct: 30, date: "2024-11-06" },
  { stock: "Infosys", entry: 1890, target: 2457, sl: 1607, exitPrice: 1607, result: "SL Hit", returnPct: -15, date: "2024-12-03" },
  { stock: "Siemens", entry: 5650, target: 7345, sl: 4803, exitPrice: 7345, result: "Target Hit", returnPct: 30, date: "2025-01-15" },
  { stock: "ABB India", entry: 6840, target: 8892, sl: 5814, exitPrice: 8892, result: "Target Hit", returnPct: 30, date: "2025-02-10" },
  { stock: "Titan Company", entry: 3580, target: 4654, sl: 3043, exitPrice: 3043, result: "SL Hit", returnPct: -15, date: "2025-03-04" },
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
  const [riskResult, setRiskResult] = useState(null);
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimatedStats(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  const [riskForm, setRiskForm] = useState({ capital: "", riskPct: "", entry: "", sl: "", leverage: "1" });
  const calcRisk = () => {
    const c = parseFloat(riskForm.capital), r = parseFloat(riskForm.riskPct), e = parseFloat(riskForm.entry), s = parseFloat(riskForm.sl), l = parseFloat(riskForm.leverage);
    if (!c || !r || !e || !s || !l) return;
    const riskAmt = (c * r) / 100;
    const slPerShare = Math.abs(e - s);
    if (slPerShare === 0) return;
    const qty = Math.floor((riskAmt / slPerShare) * l);
    setRiskResult({ qty, riskAmt: riskAmt.toFixed(0), positionSize: (qty * e).toFixed(0), slPerShare: slPerShare.toFixed(2) });
  };

  const [stratForm, setStratForm] = useState({ name: "", email: "", phone: "", instrument: "Nifty 100", strategyName: "", description: "", entry_rule: "", sl_rule: "", target_rule: "", timeframe: "Swing (1-30 days)", meetPref: "WhatsApp" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleStratSubmit = (method) => {
    if (!stratForm.name || !stratForm.email || !stratForm.description) return;
    const msg = `*New Custom Strategy Request — Trade Infinity*%0A%0A👤 Name: ${stratForm.name}%0A📧 Email: ${stratForm.email}%0A📱 Phone: ${stratForm.phone || "Not provided"}%0A%0A📊 *Strategy Details*%0AStrategy Name: ${stratForm.strategyName || "Not named"}%0AInstrument: ${stratForm.instrument}%0ATimeframe: ${stratForm.timeframe}%0A%0A📝 Description:%0A${stratForm.description}%0A%0A🟢 Entry Rule: ${stratForm.entry_rule || "Not specified"}%0A🎯 Target Rule: ${stratForm.target_rule || "Not specified"}%0A🛡️ Stop Loss Rule: ${stratForm.sl_rule || "Not specified"}%0A%0A📞 Preferred Consultation: ${stratForm.meetPref}`;
    if (method === "whatsapp") {
      window.open(`https://wa.me/917869143383?text=${msg}`, "_blank");
    } else {
      const subject = encodeURIComponent(`Custom Strategy Request from ${stratForm.name}`);
      const body = encodeURIComponent(`New Custom Strategy Request — Trade Infinity\n\nName: ${stratForm.name}\nEmail: ${stratForm.email}\nPhone: ${stratForm.phone || "Not provided"}\n\nStrategy Details\nStrategy Name: ${stratForm.strategyName || "Not named"}\nInstrument: ${stratForm.instrument}\nTimeframe: ${stratForm.timeframe}\n\nDescription:\n${stratForm.description}\n\nEntry Rule: ${stratForm.entry_rule || "Not specified"}\nTarget Rule: ${stratForm.target_rule || "Not specified"}\nStop Loss Rule: ${stratForm.sl_rule || "Not specified"}\n\nPreferred Consultation: ${stratForm.meetPref}`);
      window.open(`mailto:tradeinfinity1410@gmail.com?subject=${subject}&body=${body}`, "_blank");
    }
    setFormSubmitted(true);
  };

  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) return;
    setIsLoggedIn(true);
    setUserName(loginTab === "signup" ? loginForm.name || "Trader" : "Trader");
    setTrialActive(true);
    setShowLogin(false);
  };

  const handlePayment = () => { setProPlan(true); alert("Demo: Payment successful via Cashfree! Pro plan activated."); };
  const canAccess = trialActive || proPlan;

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
        .btn-wa { background: #25D366; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 8px; justify-content: center; }
        .btn-wa:hover { background: #20bd5a; transform: translateY(-1px); }
        .btn-email-action { background: #4285f4; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; display: flex; align-items: center; gap: 8px; justify-content: center; }
        .btn-email-action:hover { background: #3574db; transform: translateY(-1px); }
        .tag { display: inline-block; background: #00e89d15; color: #00e89d; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Space Mono', monospace; }
        .input { background: #0d1017; border: 1.5px solid #1a2035; border-radius: 10px; padding: 12px 16px; color: #e8e6e1; font-size: 14px; width: 100%; font-family: 'DM Sans', sans-serif; outline: none; transition: border 0.2s; }
        .input:focus { border-color: #00e89d55; }
        select.input { appearance: auto; }
        textarea.input { resize: vertical; }
        .stat-num { font-family: 'Space Mono', monospace; font-size: 28px; font-weight: 700; color: #00e89d; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease-out both; }
        .section { padding: 80px 20px; max-width: 1100px; margin: 0 auto; }
        .win { color: #00e89d; } .loss { color: #ff4d6a; }
        @media (max-width: 768px) { .section { padding: 50px 16px; } .stat-num { font-size: 22px; } }
      `}</style>

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#06080dee", backdropFilter: "blur(20px)", borderBottom: "1px solid #151b28" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("home")}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00e89d, #00b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#06080d" }}>T∞</div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>Trade Infinity</span>
          </div>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            {[["Strategies","strategies"],["Backtest","backtest"],["Tools","tools"],["Pricing","pricing"],["Custom Strategy","custom"],["About","about"]].map(([l,id]) => (
              <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: 13, color: "#8a8f9c", cursor: "pointer", fontWeight: 500 }} onMouseEnter={e=>e.target.style.color="#00e89d"} onMouseLeave={e=>e.target.style.color="#8a8f9c"}>{l}</span>
            ))}
            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00e89d22", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e89d", fontWeight: 700, fontSize: 13 }}>{userName[0]}</div>
                <span style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: proPlan ? "#00e89d" : "#ffa726" }}>{proPlan ? "PRO" : "TRIAL"}</span>
              </div>
            ) : (
              <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 13 }} onClick={() => setShowLogin(true)}>Get Started</button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, #00e89d08 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="fade-up" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          <span className="tag" style={{ marginBottom: 24, display: "inline-block" }}>Built for Indian Retail Traders</span>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1.5 }}>
            Backtest. Automate.<br /><span className="glow" style={{ color: "#00e89d" }}>Trade Smarter.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#8a8f9c", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
            We take proven Indian stock market strategies, backtest them on real NSE data, and send you live trade alerts on Telegram — so you never miss an opportunity.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => isLoggedIn ? scrollTo("strategies") : setShowLogin(true)}>{isLoggedIn ? "View Strategies" : "Start 7-Day Free Trial"}</button>
            <button className="btn-outline" onClick={() => scrollTo("backtest")}>See 2-Year Backtest →</button>
          </div>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[["NSE • Nifty 100","Market"],["Swing Trading","Style"],["Telegram Alerts","Delivery"]].map(([v,l]) => (
              <div key={l}><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, color: "#00e89d" }}>{v}</div><div style={{ fontSize: 12, color: "#555d6e", marginTop: 2 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGY */}
      <section id="strategies" className="section">
        <span className="tag">Our Strategies</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>52-Week High Breakout Strategy</h2>
        <p style={{ color: "#8a8f9c", maxWidth: 660, marginBottom: 12, lineHeight: 1.7 }}>
          A momentum-based swing trading strategy for the <strong style={{ color: "#e8e6e1" }}>Indian stock market (NSE)</strong>. When any stock from the Nifty 100 index — that's the top 100 companies listed on the National Stock Exchange of India — hits its 52-week high, we enter a long position.
        </p>
        <p style={{ color: "#8a8f9c", maxWidth: 660, marginBottom: 40 }}>
          Target: <strong style={{ color: "#00e89d" }}>+30%</strong> from entry &nbsp;|&nbsp; Stop Loss: <strong style={{ color: "#ff4d6a" }}>-15%</strong> from entry &nbsp;|&nbsp; Risk-to-Reward: <strong style={{ color: "#e8e6e1" }}>1:2</strong>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[
            ["Entry Signal","Stock from Nifty 100 index hits its 52-week high on NSE","📈"],
            ["Target","+30% from entry price","🎯"],
            ["Stop Loss","-15% from entry price","🛡️"],
            ["Market","Indian Market — NSE Nifty 100 index stocks","🇮🇳"],
            ["Style","Swing Trading (holds days to weeks)","⏱️"],
            ["Alerts","Real-time via Telegram bot","📲"],
          ].map(([t,d,i]) => (
            <div key={t} className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{i}</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{t}</div>
              <div style={{ color: "#8a8f9c", fontSize: 14, lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 32, padding: 32, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #0d1017, #0f1420)" }}>
          <div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>🤖 Automate This Strategy</h3>
            <p style={{ color: "#8a8f9c", fontSize: 14, maxWidth: 500 }}>Get real-time Telegram alerts whenever this strategy triggers on any Nifty 100 stock — stock name, entry price, target, and stop loss delivered instantly.</p>
          </div>
          <button className="btn-primary" onClick={() => { if (!isLoggedIn) { setShowLogin(true); return; } if (!canAccess) { scrollTo("pricing"); return; } setShowTelegramSetup(true); }}>Connect Telegram →</button>
        </div>
      </section>

      {/* BACKTEST */}
      <section id="backtest" className="section">
        <span className="tag">Backtest Results</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>2-Year Performance Data</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 8 }}>
          Simulated backtest of the 52-Week High Breakout strategy on <strong style={{ color: "#e8e6e1" }}>Nifty 100 stocks (NSE)</strong> over <strong style={{ color: "#e8e6e1" }}>24 months: April 2023 to March 2025</strong>.
        </p>
        <div style={{ background: "#111520", border: "1px solid #1a2035", borderRadius: 10, padding: "14px 18px", fontSize: 12, color: "#555d6e", lineHeight: 1.6, marginBottom: 32, maxWidth: 700 }}>
          ⚠️ <strong style={{ color: "#8a8f9c" }}>Disclaimer:</strong> This is simulated backtest data for demonstration purposes. Past performance does not guarantee future results. Trade Infinity is not a SEBI registered investment advisor. For educational and demonstration purposes only.
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#8a8f9c", background: "#111520", padding: "8px 16px", borderRadius: 8, display: "inline-block" }}>
            📅 Apr 2023 — Mar 2025 &nbsp;•&nbsp; 24 Months &nbsp;•&nbsp; {totalTrades} Trades
          </span>
        </div>
        <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[[totalTrades,"Total Trades"],[wins,"Winners"],[losses,"Losers"],[winRate+"%","Win Rate"],[avgReturn+"%","Avg Return/Trade"],[totalReturn+"%","Total Return"],["1:2","Risk:Reward"]].map(([v,l]) => (
            <div key={l} className="card" style={{ padding: 18, textAlign: "center" }}>
              <div className="stat-num" style={{ opacity: animatedStats ? 1 : 0, transition: "opacity 0.8s" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#555d6e", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a2035" }}>
                {["#","Date","Stock","Entry ₹","Target ₹","SL ₹","Exit ₹","Result","Return"].map(h => (
                  <th key={h} style={{ padding: "14px 12px", textAlign: "left", color: "#555d6e", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backtestTrades.map((t, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #111520" }}>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#444" }}>{i+1}</td>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#8a8f9c", whiteSpace: "nowrap" }}>{t.date}</td>
                  <td style={{ padding: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>{t.stock}</td>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace" }}>₹{t.entry.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace" }}>₹{t.target.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace" }}>₹{t.sl.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace" }}>₹{t.exitPrice.toLocaleString("en-IN")}</td>
                  <td style={{ padding: "12px" }}><span className={t.result==="Target Hit"?"win":"loss"} style={{ fontWeight: 600, fontSize: 12 }}>{t.result}</span></td>
                  <td style={{ padding: "12px", fontFamily: "'Space Mono', monospace" }}><span className={t.returnPct>0?"win":"loss"}>{t.returnPct>0?"+":""}{t.returnPct}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* RISK CALCULATOR */}
      <section id="tools" className="section">
        <span className="tag">Free Tools</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Position Size Calculator</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 32 }}>Know exactly how many shares to buy based on your capital, risk tolerance, and stop loss. Works for NSE cash and F&O segments.</p>
        <div className="card" style={{ padding: 32, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[["Total Capital (₹)","capital","e.g. 100000"],["Risk per trade (%)","riskPct","e.g. 2"],["Entry Price (₹)","entry","e.g. 500"],["Stop Loss Price (₹)","sl","e.g. 470"],["Leverage (x)","leverage","1 for cash, 5 for F&O"]].map(([label,key,ph]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>{label}</label>
                <input className="input" placeholder={ph} value={riskForm[key]} onChange={e => setRiskForm({...riskForm,[key]:e.target.value})} />
              </div>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={calcRisk}>Calculate Position Size</button>
          {riskResult && (
            <div style={{ marginTop: 20, padding: 20, background: "#0a0d14", borderRadius: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Shares to Buy</div><div className="stat-num">{riskResult.qty}</div></div>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Risk Amount</div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, color: "#ff4d6a", fontWeight: 700 }}>₹{Number(riskResult.riskAmt).toLocaleString("en-IN")}</div></div>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Position Size</div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700 }}>₹{Number(riskResult.positionSize).toLocaleString("en-IN")}</div></div>
              <div><div style={{ fontSize: 12, color: "#555d6e" }}>Risk per Share</div><div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700 }}>₹{riskResult.slPerShare}</div></div>
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section">
        <span className="tag">Pricing</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Simple, Transparent Plans</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 40 }}>Start with a 7-day free trial. No payment required to start.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 700, margin: "0 auto" }}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 14, color: "#555d6e", fontWeight: 600, marginBottom: 8 }}>FREE TRIAL</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>₹0</div>
            <div style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>7 days • No card needed</div>
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 20 }}>
              {["View all backtest results","1 strategy — 52-Week High Breakout","Telegram alerts for 7 days","Position size calculator (always free)","Indian market strategies (NSE)"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 14, color: "#b0b5bf" }}><span style={{ color: "#00e89d" }}>✓</span>{f}</div>
              ))}
            </div>
            <button className="btn-outline" style={{ width: "100%", marginTop: 16 }} onClick={() => { if (!isLoggedIn) setShowLogin(true); }}>{trialActive ? "Trial Active ✓" : "Start Free Trial"}</button>
          </div>
          <div className="card" style={{ padding: 32, border: "1.5px solid #00e89d44", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20 }}><span className="tag" style={{ background: "#00e89d", color: "#06080d" }}>RECOMMENDED</span></div>
            <div style={{ fontSize: 14, color: "#555d6e", fontWeight: 600, marginBottom: 8 }}>PRO PLAN</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#00e89d" }}>₹499<span style={{ fontSize: 16, color: "#8a8f9c" }}>/mo</span></div>
            <div style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>Billed monthly • Cancel anytime</div>
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 20 }}>
              {["Everything in Free plan","Unlimited access to all strategies","Unlimited Telegram alerts","Priority WhatsApp support","Custom strategy consultation (1 free/month)","Early access to new strategies","All future Indian market strategies included"].map(f => (
                <div key={f} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 14, color: "#b0b5bf" }}><span style={{ color: "#00e89d" }}>✓</span>{f}</div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={() => { if (!isLoggedIn) { setShowLogin(true); return; } handlePayment(); }}>{proPlan ? "Pro Active ✓" : "Upgrade to Pro — ₹499/mo"}</button>
          </div>
        </div>
      </section>

      {/* CUSTOM STRATEGY */}
      <section id="custom" className="section">
        <span className="tag">Custom Strategy</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Get Your Strategy Automated</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 32, maxWidth: 620 }}>
          Have a trading strategy for the Indian market? Share it with us — we'll backtest it, automate it, and set up Telegram alerts personalized for you. We'll connect over WhatsApp or email.
        </p>
        {formSubmitted ? (
          <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>Strategy Submitted!</h3>
            <p style={{ color: "#8a8f9c", marginBottom: 16 }}>Your details have been sent. We'll reach out within 24 hours.</p>
            <p style={{ color: "#555d6e", fontSize: 13, marginBottom: 20 }}>You can also reach us directly:</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-wa" onClick={() => window.open("https://wa.me/917869143383","_blank")}>📱 WhatsApp Us</button>
              <button className="btn-email-action" onClick={() => window.open("mailto:tradeinfinity1410@gmail.com","_blank")}>📧 Email Us</button>
            </div>
            <button className="btn-outline" style={{ marginTop: 20 }} onClick={() => setFormSubmitted(false)}>Submit Another Strategy</button>
          </div>
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 600 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Your Name *</label><input className="input" value={stratForm.name} onChange={e => setStratForm({...stratForm, name: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Email *</label><input className="input" type="email" value={stratForm.email} onChange={e => setStratForm({...stratForm, email: e.target.value})} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>WhatsApp Number</label><input className="input" placeholder="+91 XXXXX XXXXX" value={stratForm.phone} onChange={e => setStratForm({...stratForm, phone: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Instrument / Index</label>
                  <select className="input" value={stratForm.instrument} onChange={e => setStratForm({...stratForm, instrument: e.target.value})}>
                    {["Nifty 100","Nifty 50","Nifty Next 50","Bank Nifty","Nifty Midcap 100","F&O Stocks","Specific Stocks"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Strategy Name</label><input className="input" placeholder="e.g. RSI Reversal, MACD Crossover" value={stratForm.strategyName} onChange={e => setStratForm({...stratForm, strategyName: e.target.value})} /></div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Describe Your Strategy *</label><textarea className="input" rows={4} placeholder="Explain your entry conditions, indicators used, timeframe..." value={stratForm.description} onChange={e => setStratForm({...stratForm, description: e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Entry Rule</label><input className="input" placeholder="e.g. Buy when RSI > 30" value={stratForm.entry_rule} onChange={e => setStratForm({...stratForm, entry_rule: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Target Rule</label><input className="input" placeholder="e.g. 20% from entry" value={stratForm.target_rule} onChange={e => setStratForm({...stratForm, target_rule: e.target.value})} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Stop Loss Rule</label><input className="input" placeholder="e.g. 10% below entry" value={stratForm.sl_rule} onChange={e => setStratForm({...stratForm, sl_rule: e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Timeframe</label>
                  <select className="input" value={stratForm.timeframe} onChange={e => setStratForm({...stratForm, timeframe: e.target.value})}>
                    {["Intraday","Swing (1-30 days)","Positional (1-6 months)","Long Term (6+ months)"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>How should we contact you?</label>
                <select className="input" value={stratForm.meetPref} onChange={e => setStratForm({...stratForm, meetPref: e.target.value})}>
                  {["WhatsApp","Email","Phone Call"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#555d6e", margin: "16px 0 4px" }}>Choose how to send your strategy to us:</p>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn-wa" style={{ flex: 1 }} onClick={() => handleStratSubmit("whatsapp")}>📱 Send via WhatsApp</button>
              <button className="btn-email-action" style={{ flex: 1 }} onClick={() => handleStratSubmit("email")}>📧 Send via Email</button>
            </div>
            <p style={{ fontSize: 11, color: "#555d6e", marginTop: 10, textAlign: "center" }}>Clicking will open WhatsApp or your email app with your strategy details pre-filled. We'll reach out within 24 hours.</p>
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="section">
        <span className="tag">About Us</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 24 }}>Built by Traders, for Traders</h2>
        <div className="card" style={{ padding: 32, maxWidth: 700 }}>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8, marginBottom: 16 }}>
            Trade Infinity was born from a simple frustration — retail traders in India deserve access to the same backtesting and automation tools that institutional players use. We're a team of young traders and tech enthusiasts from India, building affordable tools specifically for the Indian stock market.
          </p>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8, marginBottom: 16 }}>
            Our mission is to democratize algorithmic trading for NSE & BSE. We start by giving you backtested, proven strategies with real-time Telegram alerts. Next on our roadmap: full algo trading integration with Indian brokers like Zerodha, Angel One, and Upstox.
          </p>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8 }}>
            Whether you're a swing trader managing a small portfolio or someone with a unique strategy that needs automation — we've got you covered. We focus exclusively on the Indian markets, no crypto, no forex — just NSE and BSE.
          </p>
          <div style={{ marginTop: 24, padding: 20, background: "#0a0d14", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "#555d6e", marginBottom: 12, fontWeight: 600 }}>REACH US DIRECTLY</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>📱</span>
                <a href="https://wa.me/917869143383" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>+91 78691 43383</a>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>📧</span>
                <a href="mailto:tradeinfinity1410@gmail.com" style={{ color: "#4285f4", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>tradeinfinity1410@gmail.com</a>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
            <button className="btn-wa" onClick={() => window.open("https://wa.me/917869143383?text=Hi%20Trade%20Infinity!%20I%20have%20a%20question.","_blank")}>📱 Chat on WhatsApp</button>
            <button className="btn-outline" onClick={() => scrollTo("custom")}>Submit Your Strategy</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #151b28", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #00e89d, #00b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#06080d" }}>T∞</div>
          <span style={{ fontWeight: 700 }}>Trade Infinity</span>
        </div>
        <p style={{ color: "#555d6e", fontSize: 13 }}>Backtesting & Trading Alerts for the Indian Stock Market</p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 12 }}>
          <a href="https://wa.me/917869143383" target="_blank" rel="noopener noreferrer" style={{ color: "#8a8f9c", fontSize: 13, textDecoration: "none" }}>📱 WhatsApp</a>
          <a href="mailto:tradeinfinity1410@gmail.com" style={{ color: "#8a8f9c", fontSize: 13, textDecoration: "none" }}>📧 Email</a>
        </div>
        <p style={{ color: "#333844", fontSize: 11, marginTop: 16, maxWidth: 500, margin: "16px auto 0" }}>
          © 2026 Trade Infinity. All rights reserved. Not a SEBI registered investment advisor. Backtest data shown is simulated for demonstration purposes. Past performance does not guarantee future results. Trading involves risk of capital loss. Indian markets only.
        </p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowLogin(false); }}>
          <div className="card" style={{ padding: 32, maxWidth: 400, width: "100%", background: "#0d1017" }}>
            <div style={{ display: "flex", marginBottom: 24, borderRadius: 10, overflow: "hidden", border: "1px solid #1a2035" }}>
              {["login","signup"].map(tab => (
                <button key={tab} onClick={() => setLoginTab(tab)} style={{ flex: 1, padding: 12, background: loginTab===tab?"#00e89d15":"transparent", color: loginTab===tab?"#00e89d":"#555d6e", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
                  {tab==="login"?"Log In":"Sign Up"}
                </button>
              ))}
            </div>
            {loginTab==="signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Full Name</label>
                <input className="input" placeholder="Your name" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
            </div>
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleLogin}>{loginTab==="login"?"Log In":"Create Account & Start 7-Day Trial"}</button>
            <p style={{ fontSize: 12, color: "#555d6e", textAlign: "center", marginTop: 16 }}>{loginTab==="signup"?"7-day free trial. No payment needed.":"Don't have an account? Click Sign Up."}</p>
          </div>
        </div>
      )}

      {/* TELEGRAM MODAL */}
      {showTelegramSetup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000bb", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) setShowTelegramSetup(false); }}>
          <div className="card" style={{ padding: 32, maxWidth: 440, width: "100%", background: "#0d1017" }}>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>📲 Connect Telegram for Alerts</h3>
            <p style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>Get live trade alerts for Nifty 100 stocks:</p>
            {[["1","Open Telegram → search @TradeInfinityBot"],["2","Tap Start or send /start"],["3","Enter your registered email"],["4","Done! You'll get alerts with stock name, entry, target & SL"]].map(([n,t]) => (
              <div key={n} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00e89d22", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e89d", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n}</div>
                <div style={{ color: "#b0b5bf", fontSize: 14, paddingTop: 4 }}>{t}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 16, background: "#0a0d14", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#555d6e", marginBottom: 4 }}>Bot Username</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: "#00e89d" }}>@TradeInfinityBot</div>
            </div>
            <div style={{ marginTop: 12, padding: 14, background: "#111520", borderRadius: 10, fontSize: 12, color: "#8a8f9c", lineHeight: 1.6 }}>
              <strong>Sample alert:</strong><br/>
              🟢 <strong>BUY</strong> — Bajaj Auto<br/>
              Entry: ₹4,580 | Target: ₹5,954 | SL: ₹3,893<br/>
              Strategy: 52-Week High Breakout
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 20 }} onClick={() => { setTelegramConnected(true); setShowTelegramSetup(false); }}>I've Connected the Bot ✓</button>
            <p style={{ fontSize: 11, color: "#555d6e", textAlign: "center", marginTop: 10 }}>Need help? WhatsApp us at +91 78691 43383</p>
          </div>
        </div>
      )}
    </div>
  );
}
