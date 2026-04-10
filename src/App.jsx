import { useState, useEffect, useRef } from "react";

// ============================================
// ⚠️ IMPORTANT: Replace these with YOUR Supabase credentials
// Get them from: supabase.com → Your Project → Settings → API
// ============================================
const SUPABASE_URL = "https://nccnkjnexzoghustkxrr.supabase.co";  // ← REPLACE THIS
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY25ram5leHpvZ2h1c3RreHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDYwMTUsImV4cCI6MjA5MTMyMjAxNX0.Bvs6hAdVMin0SzwQ0FeTLOsAjmBnnoFp9vb9bciy9-U";                // ← REPLACE THIS
const BOT_API_URL = "https://trade-infinity-bot-production.up.railway.app"; // ← REPLACE THIS (your Railway bot URL)

// ─── Simple Supabase client (no npm package needed) ───
async function supabaseCall(table, method, options = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : "return=representation",
  };

  if (options.filters) {
    Object.entries(options.filters).forEach(([key, val]) => {
      url.searchParams.append(key, `eq.${val}`);
    });
  }
  if (options.select) url.searchParams.append("select", options.select);
  if (options.limit) url.searchParams.append("limit", options.limit);
  if (options.order) url.searchParams.append("order", options.order);

  const fetchOptions = { method, headers };
  if (options.body) fetchOptions.body = JSON.stringify(options.body);

  const res = await fetch(url.toString(), fetchOptions);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.msg || `Error ${res.status}`);
  }
  return res.json();
}

// ─── 2-YEAR SIMULATED BACKTEST DATA ───
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
  { stock: "IRFC", entry: 142, target: 185, sl: 121, exitPrice: 185, result: "Target Hit", returnPct: 30, date: "2024-03-08" },
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
  // ─── Auth State ───
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginTab, setLoginTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "", name: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ─── Plan State ───
  const [userPlan, setUserPlan] = useState("free"); // free, trial, pro
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  // ─── UI State ───
  const [showTelegramSetup, setShowTelegramSetup] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentPrice, setPaymentPrice] = useState(499);
  const [proDaysLeft, setProDaysLeft] = useState(0);
  const [riskResult, setRiskResult] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [animatedStats, setAnimatedStats] = useState(false);
  const statsRef = useRef(null);

  // ─── Check if user is already logged in (from browser storage) ───
  useEffect(() => {
    const saved = null;
    try {
      const s = window.sessionStorage || {};
      // We use React state only, no localStorage per artifact rules
    } catch (e) {}
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimatedStats(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // ─── SIGNUP — Creates real account in Supabase ───
  const handleSignup = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const email = loginForm.email.trim().toLowerCase();
      const password = loginForm.password;
      const name = loginForm.name.trim() || "Trader";

      if (!email || !password) { setAuthError("Please fill in email and password"); setAuthLoading(false); return; }
      if (password.length < 6) { setAuthError("Password must be at least 6 characters"); setAuthLoading(false); return; }
      if (!email.includes("@")) { setAuthError("Please enter a valid email"); setAuthLoading(false); return; }

      // Check if email already exists
      const existing = await supabaseCall("users", "GET", {
        filters: { email },
        select: "id",
        limit: "1",
      });

      if (existing && existing.length > 0) {
        setAuthError("This email is already registered. Try logging in instead.");
        setAuthLoading(false);
        return;
      }

      // Create the user with 7-day trial
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 7);

      const result = await supabaseCall("users", "POST", {
        body: {
          email,
          name,
          password_hash: password,
          plan: "trial",
          trial_start: now.toISOString(),
          trial_end: trialEnd.toISOString(),
        },
      });

      if (result && result.length > 0) {
        const user = result[0];
        setCurrentUser(user);
        setIsLoggedIn(true);
        setUserPlan("trial");
        setTrialDaysLeft(7);
        setShowLogin(false);
        setLoginForm({ email: "", password: "", name: "" });
      }
    } catch (err) {
      console.error("Signup error:", err);
      if (err.message.includes("duplicate") || err.message.includes("23505")) {
        setAuthError("This email is already registered. Try logging in.");
      } else {
        setAuthError("Signup failed: " + err.message);
      }
    }
    setAuthLoading(false);
  };

  // ─── LOGIN — Checks Supabase for existing account ───
  const handleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const email = loginForm.email.trim().toLowerCase();
      const password = loginForm.password;

      if (!email || !password) { setAuthError("Please fill in email and password"); setAuthLoading(false); return; }

      const users = await supabaseCall("users", "GET", {
        filters: { email, password_hash: password },
        select: "*",
        limit: "1",
      });

      if (!users || users.length === 0) {
        setAuthError("Wrong email or password. Check and try again.");
        setAuthLoading(false);
        return;
      }

      const user = users[0];

      // Check trial expiry
      let plan = user.plan;
      let daysLeft = 0;

      if (plan === "trial" && user.trial_end) {
        const trialEnd = new Date(user.trial_end);
        const now = new Date();
        daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
        if (daysLeft <= 0) {
          plan = "free";
          // Update in database
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, {
              method: "PATCH",
              headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ plan: "free" }),
            });
          } catch (e) {}
        }
      }

      if (plan === "pro") {
        if (user.pro_end) {
          const proEnd = new Date(user.pro_end);
          const pDays = Math.max(0, Math.ceil((proEnd - now) / (1000 * 60 * 60 * 24)));
          if (pDays <= 0) { plan = "free"; try { await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`, { method: "PATCH", headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ plan: "free" }) }); } catch(e){} }
          else daysLeft = pDays;
        } else daysLeft = 30;
      }

      setCurrentUser(user);
      setIsLoggedIn(true);
      setUserPlan(plan);
      setTrialDaysLeft(plan === "trial" ? daysLeft : 0);
      setProDaysLeft(plan === "pro" ? daysLeft : 0);
      setShowLogin(false);
      setLoginForm({ email: "", password: "", name: "" });
    } catch (err) {
      console.error("Login error:", err);
      setAuthError("Login failed. Please check your internet connection and try again.");
    }
    setAuthLoading(false);
  };

  // ─── LOGOUT ───
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserPlan("free");
    setTrialDaysLeft(0);
  };

  // ─── VALIDATE COUPON ───
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponResult(null);
    try {
      const res = await fetch(`${BOT_API_URL}/api/validate-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });
      const data = await res.json();
      setCouponResult(data);
      if (data.valid) setPaymentPrice(data.final_price);
      else setPaymentPrice(499);
    } catch (err) {
      setCouponResult({ valid: false, message: "Error checking coupon. Try again." });
    }
    setCouponLoading(false);
  };

  // ─── PAYMENT — Opens Cashfree checkout ───
  const handlePayment = async () => {
    if (!currentUser) return;
    setShowPaymentModal(true);
  };

  const startCashfreePayment = async () => {
    setPaymentLoading(true);
    try {
      // Step 1: Create order on our server
      const res = await fetch(`${BOT_API_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          coupon_code: couponResult?.valid ? couponCode.trim() : null,
        }),
      });
      const data = await res.json();

      if (!data.success || !data.payment_session_id) {
        alert("Error creating payment: " + (data.error || "Unknown error"));
        setPaymentLoading(false);
        return;
      }

      // Step 2: Open Cashfree checkout
      const cashfree = window.Cashfree({ mode: data.environment === "PROD" ? "production" : "sandbox" });
      const result = await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_modal" });

      // Step 3: After payment, verify it
      if (result.error) {
        console.log("Payment error:", result.error);
        alert("Payment was cancelled or failed. No money was charged.");
      } else {
        // Verify payment with our server
        const verifyRes = await fetch(`${BOT_API_URL}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: data.order_id }),
        });
        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          setUserPlan("pro");
          setProDaysLeft(30);
          setShowPaymentModal(false);
          setCouponCode("");
          setCouponResult(null);
          setPaymentPrice(499);
          alert("✅ Pro plan activated for 30 days! You now have unlimited access to all strategies and Telegram alerts.");
        } else {
          alert("Payment verification pending. If money was deducted, it will be refunded. Contact us: +91 78691 43383");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error. Please try again or WhatsApp us: +91 78691 43383");
    }
    setPaymentLoading(false);
  };

  const canAccess = (userPlan === "trial" && trialDaysLeft > 0) || userPlan === "pro";

  // ─── Risk Calculator ───
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

  // ─── Custom Strategy Form ───
  const [stratForm, setStratForm] = useState({ name: "", email: "", phone: "", instrument: "Nifty 100", strategyName: "", description: "", entry_rule: "", sl_rule: "", target_rule: "", timeframe: "Swing (1-30 days)", meetPref: "WhatsApp" });

  const handleStratSubmit = (method) => {
    if (!stratForm.name || !stratForm.email || !stratForm.description) return;
    const msg = `*Custom Strategy Request — Trade Infinity*%0A%0A👤 Name: ${stratForm.name}%0A📧 Email: ${stratForm.email}%0A📱 Phone: ${stratForm.phone || "N/A"}%0A%0AStrategy: ${stratForm.strategyName || "Unnamed"}%0AInstrument: ${stratForm.instrument}%0ATimeframe: ${stratForm.timeframe}%0A%0ADescription:%0A${stratForm.description}%0A%0AEntry: ${stratForm.entry_rule || "N/A"}%0ATarget: ${stratForm.target_rule || "N/A"}%0ASL: ${stratForm.sl_rule || "N/A"}%0A%0AContact via: ${stratForm.meetPref}`;
    if (method === "whatsapp") window.open(`https://wa.me/917869143383?text=${msg}`, "_blank");
    else {
      const subj = encodeURIComponent(`Strategy Request from ${stratForm.name}`);
      const body = encodeURIComponent(`Name: ${stratForm.name}\nEmail: ${stratForm.email}\nPhone: ${stratForm.phone}\nStrategy: ${stratForm.strategyName}\nInstrument: ${stratForm.instrument}\nTimeframe: ${stratForm.timeframe}\n\nDescription:\n${stratForm.description}\n\nEntry: ${stratForm.entry_rule}\nTarget: ${stratForm.target_rule}\nSL: ${stratForm.sl_rule}\nContact: ${stratForm.meetPref}`);
      window.open(`mailto:tradeinfinity1410@gmail.com?subject=${subj}&body=${body}`, "_blank");
    }
    setFormSubmitted(true);
  };

  // ─── Plan Badge ───
  const PlanBadge = () => {
    if (!isLoggedIn) return null;
    let bg = "#555", text = "FREE", color = "#fff";
    if (userPlan === "pro") { bg = "#00e89d"; text = proDaysLeft > 0 ? `PRO · ${proDaysLeft}d` : "PRO"; color = "#06080d"; }
    else if (userPlan === "trial" && trialDaysLeft > 0) { bg = "#ffa726"; text = `TRIAL · ${trialDaysLeft}d`; color = "#06080d"; }
    else if (userPlan === "trial" && trialDaysLeft <= 0) { bg = "#ff4d6a"; text = "EXPIRED"; color = "#fff"; }
    return <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", background: bg, color, padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>{text}</span>;
  };

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
        .bp { background: #00e89d; color: #06080d; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans',sans-serif; }
        .bp:hover { background: #00ffa8; transform: translateY(-1px); box-shadow: 0 4px 20px #00e89d44; }
        .bp:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .bo { background: transparent; color: #00e89d; border: 1.5px solid #00e89d44; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans',sans-serif; }
        .bo:hover { background: #00e89d11; border-color: #00e89d; }
        .bw { background: #25D366; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans',sans-serif; display: flex; align-items: center; gap: 8px; justify-content: center; }
        .be { background: #4285f4; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'DM Sans',sans-serif; display: flex; align-items: center; gap: 8px; justify-content: center; }
        .tag { display: inline-block; background: #00e89d15; color: #00e89d; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; font-family: 'Space Mono',monospace; }
        .inp { background: #0d1017; border: 1.5px solid #1a2035; border-radius: 10px; padding: 12px 16px; color: #e8e6e1; font-size: 14px; width: 100%; font-family: 'DM Sans',sans-serif; outline: none; }
        .inp:focus { border-color: #00e89d55; }
        select.inp { appearance: auto; }
        textarea.inp { resize: vertical; }
        .sn { font-family: 'Space Mono',monospace; font-size: 28px; font-weight: 700; color: #00e89d; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fu { animation: fadeUp 0.7s ease-out both; }
        .sec { padding: 80px 20px; max-width: 1100px; margin: 0 auto; }
        .win { color: #00e89d; } .loss { color: #ff4d6a; }
        .err { background: #ff4d6a22; border: 1px solid #ff4d6a44; color: #ff8a9e; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .trial-banner { background: linear-gradient(90deg, #ffa72622, #ffa72608); border: 1px solid #ffa72633; padding: 10px 20px; text-align: center; font-size: 13px; color: #ffa726; }
        .expired-banner { background: linear-gradient(90deg, #ff4d6a22, #ff4d6a08); border: 1px solid #ff4d6a33; padding: 10px 20px; text-align: center; font-size: 13px; color: #ff4d6a; }
        @media (max-width: 768px) { .sec { padding: 50px 16px; } .sn { font-size: 22px; } }
      `}</style>

      {/* Trial/Expired Banner */}
      {isLoggedIn && userPlan === "trial" && trialDaysLeft > 0 && (
        <div className="trial-banner" style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99 }}>
          🟡 Free trial: <strong>{trialDaysLeft} days remaining</strong> · <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => scrollTo("pricing")}>Upgrade to Pro →</span>
        </div>
      )}
      {isLoggedIn && (userPlan === "free" || (userPlan === "trial" && trialDaysLeft <= 0)) && (
        <div className="expired-banner" style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 99 }}>
          🔴 {userPlan === "free" ? "Free plan — upgrade for alerts" : "Trial expired"} · <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => scrollTo("pricing")}>Get Pro for ₹499/mo →</span>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#06080dee", backdropFilter: "blur(20px)", borderBottom: "1px solid #151b28" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("home")}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00e89d, #00b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#06080d" }}>T∞</div>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>Trade Infinity</span>
          </div>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            {[["Strategies","strategies"],["Backtest","backtest"],["Tools","tools"],["Pricing","pricing"],["Custom","custom"],["About","about"]].map(([l,id]) => (
              <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: 13, color: "#8a8f9c", cursor: "pointer", fontWeight: 500 }} onMouseEnter={e=>e.target.style.color="#00e89d"} onMouseLeave={e=>e.target.style.color="#8a8f9c"}>{l}</span>
            ))}
            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#00e89d22", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e89d", fontWeight: 700, fontSize: 13 }}>{(currentUser?.name || "T")[0]}</div>
                <PlanBadge />
                <span onClick={handleLogout} style={{ fontSize: 12, color: "#555d6e", cursor: "pointer", textDecoration: "underline" }}>Logout</span>
              </div>
            ) : (
              <button className="bp" style={{ padding: "8px 20px", fontSize: 13 }} onClick={() => setShowLogin(true)}>Get Started</button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, #00e89d08 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="fu" style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px" }}>
          <span className="tag" style={{ marginBottom: 24, display: "inline-block" }}>Built for Indian Retail Traders</span>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: -1.5 }}>
            Backtest. Automate.<br /><span className="glow" style={{ color: "#00e89d" }}>Trade Smarter.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#8a8f9c", maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
            We take proven Indian stock market strategies, backtest them on real NSE data, and send you live trade alerts on Telegram — so you never miss an opportunity.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="bp" onClick={() => isLoggedIn ? scrollTo("strategies") : setShowLogin(true)}>{isLoggedIn ? "View Strategies" : "Start 7-Day Free Trial"}</button>
            <button className="bo" onClick={() => scrollTo("backtest")}>See 2-Year Backtest →</button>
          </div>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
            {[["NSE • Nifty 100","Market"],["Swing Trading","Style"],["Telegram Alerts","Delivery"]].map(([v,l]) => (
              <div key={l}><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color: "#00e89d" }}>{v}</div><div style={{ fontSize: 12, color: "#555d6e", marginTop: 2 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGY */}
      <section id="strategies" className="sec">
        <span className="tag">Our Strategies</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>52-Week High Breakout Strategy</h2>
        <p style={{ color: "#8a8f9c", maxWidth: 660, marginBottom: 12, lineHeight: 1.7 }}>A momentum swing trading strategy for the <strong style={{ color: "#e8e6e1" }}>Indian stock market (NSE)</strong>. When any Nifty 100 stock hits its 52-week high, we enter long.</p>
        <p style={{ color: "#8a8f9c", maxWidth: 660, marginBottom: 40 }}>Target: <strong style={{ color: "#00e89d" }}>+30%</strong> | Stop Loss: <strong style={{ color: "#ff4d6a" }}>-15%</strong> | Risk:Reward: <strong style={{ color: "#e8e6e1" }}>1:2</strong></p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {[["Entry Signal","Nifty 100 stock hits 52-week high on NSE","📈"],["Target","+30% from entry","🎯"],["Stop Loss","-15% from entry","🛡️"],["Market","Indian Market — NSE Nifty 100","🇮🇳"],["Style","Swing Trading (days to weeks)","⏱️"],["Alerts","Real-time Telegram bot","📲"]].map(([t,d,i]) => (
            <div key={t} className="card" style={{ padding: 24 }}><div style={{ fontSize: 28, marginBottom: 12 }}>{i}</div><div style={{ fontWeight: 700, marginBottom: 6 }}>{t}</div><div style={{ color: "#8a8f9c", fontSize: 14, lineHeight: 1.5 }}>{d}</div></div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 32, padding: 32, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg, #0d1017, #0f1420)" }}>
          <div><h3 style={{ fontSize: 22, marginBottom: 8 }}>🤖 Automate This Strategy</h3><p style={{ color: "#8a8f9c", fontSize: 14, maxWidth: 500 }}>Get Telegram alerts when this strategy triggers — stock name, entry, target, and SL delivered instantly.</p></div>
          <button className="bp" onClick={() => { if (!isLoggedIn) { setShowLogin(true); return; } if (!canAccess) { scrollTo("pricing"); return; } setShowTelegramSetup(true); }}>Connect Telegram →</button>
        </div>
      </section>

      {/* BACKTEST */}
      <section id="backtest" className="sec">
        <span className="tag">Backtest Results</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 8 }}>2-Year Performance Data</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 8 }}>Simulated backtest on <strong style={{ color: "#e8e6e1" }}>Nifty 100 (NSE)</strong> over <strong style={{ color: "#e8e6e1" }}>24 months: April 2023 – March 2025</strong>.</p>
        <div style={{ background: "#111520", border: "1px solid #1a2035", borderRadius: 10, padding: "14px 18px", fontSize: 12, color: "#555d6e", lineHeight: 1.6, marginBottom: 32, maxWidth: 700 }}>⚠️ <strong style={{ color: "#8a8f9c" }}>Disclaimer:</strong> Simulated data for demo. Past performance ≠ future results. Not SEBI registered.</div>
        <div style={{ marginBottom: 16 }}><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#8a8f9c", background: "#111520", padding: "8px 16px", borderRadius: 8 }}>📅 Apr 2023 — Mar 2025 • 24 Months • {totalTrades} Trades</span></div>
        <div ref={statsRef} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[[totalTrades,"Total Trades"],[wins,"Winners"],[losses,"Losers"],[winRate+"%","Win Rate"],[avgReturn+"%","Avg/Trade"],[totalReturn+"%","Total Return"],["1:2","Risk:Reward"]].map(([v,l]) => (
            <div key={l} className="card" style={{ padding: 18, textAlign: "center" }}><div className="sn" style={{ opacity: animatedStats?1:0, transition: "opacity 0.8s" }}>{v}</div><div style={{ fontSize: 11, color: "#555d6e", marginTop: 6 }}>{l}</div></div>
          ))}
        </div>
        <div className="card" style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: "1px solid #1a2035" }}>{["#","Date","Stock","Entry ₹","Target ₹","SL ₹","Result","Return"].map(h => <th key={h} style={{ padding: "14px 12px", textAlign: "left", color: "#555d6e", fontWeight: 600, fontSize: 11, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
            <tbody>{backtestTrades.map((t,i) => (
              <tr key={i} style={{ borderBottom: "1px solid #111520" }}>
                <td style={{ padding: "12px", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#444" }}>{i+1}</td>
                <td style={{ padding: "12px", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#8a8f9c", whiteSpace: "nowrap" }}>{t.date}</td>
                <td style={{ padding: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>{t.stock}</td>
                <td style={{ padding: "12px", fontFamily: "'Space Mono',monospace" }}>₹{t.entry.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px", fontFamily: "'Space Mono',monospace" }}>₹{t.target.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px", fontFamily: "'Space Mono',monospace" }}>₹{t.sl.toLocaleString("en-IN")}</td>
                <td style={{ padding: "12px" }}><span className={t.result==="Target Hit"?"win":"loss"} style={{ fontWeight: 600, fontSize: 12 }}>{t.result}</span></td>
                <td style={{ padding: "12px", fontFamily: "'Space Mono',monospace" }}><span className={t.returnPct>0?"win":"loss"}>{t.returnPct>0?"+":""}{t.returnPct}%</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      {/* RISK CALCULATOR */}
      <section id="tools" className="sec">
        <span className="tag">Free Tools</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Position Size Calculator</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 32 }}>Calculate shares to buy based on your risk. Works for NSE cash and F&O.</p>
        <div className="card" style={{ padding: 32, maxWidth: 600 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[["Capital (₹)","capital","100000"],["Risk (%)","riskPct","2"],["Entry (₹)","entry","500"],["Stop Loss (₹)","sl","470"],["Leverage (x)","leverage","1"]].map(([l,k,p]) => (
              <div key={k}><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>{l}</label><input className="inp" placeholder={p} value={riskForm[k]} onChange={e=>setRiskForm({...riskForm,[k]:e.target.value})} /></div>
            ))}
          </div>
          <button className="bp" style={{ marginTop: 20, width: "100%" }} onClick={calcRisk}>Calculate</button>
          {riskResult && <div style={{ marginTop: 20, padding: 20, background: "#0a0d14", borderRadius: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><div style={{ fontSize: 12, color: "#555d6e" }}>Shares to Buy</div><div className="sn">{riskResult.qty}</div></div>
            <div><div style={{ fontSize: 12, color: "#555d6e" }}>Risk Amount</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, color: "#ff4d6a", fontWeight: 700 }}>₹{Number(riskResult.riskAmt).toLocaleString("en-IN")}</div></div>
            <div><div style={{ fontSize: 12, color: "#555d6e" }}>Position Size</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700 }}>₹{Number(riskResult.positionSize).toLocaleString("en-IN")}</div></div>
            <div><div style={{ fontSize: 12, color: "#555d6e" }}>Risk/Share</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, fontWeight: 700 }}>₹{riskResult.slPerShare}</div></div>
          </div>}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sec">
        <span className="tag">Pricing</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Simple Plans</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 40 }}>Start free. Upgrade when ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, maxWidth: 700, margin: "0 auto" }}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 14, color: "#555d6e", fontWeight: 600, marginBottom: 8 }}>FREE TRIAL</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono',monospace" }}>₹0</div>
            <div style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>7 days • No card needed</div>
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 20 }}>
              {["View all backtest results","1 strategy access","Telegram alerts (7 days)","Position size calculator","Indian markets (NSE)"].map(f => <div key={f} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 14, color: "#b0b5bf" }}><span style={{ color: "#00e89d" }}>✓</span>{f}</div>)}
            </div>
            <button className="bo" style={{ width: "100%", marginTop: 16 }} onClick={() => { if (!isLoggedIn) { setLoginTab("signup"); setShowLogin(true); } }}>
              {isLoggedIn && canAccess ? "Trial Active ✓" : "Start Free Trial"}
            </button>
          </div>
          <div className="card" style={{ padding: 32, border: "1.5px solid #00e89d44", position: "relative" }}>
            <div style={{ position: "absolute", top: -12, right: 20 }}><span className="tag" style={{ background: "#00e89d", color: "#06080d" }}>RECOMMENDED</span></div>
            <div style={{ fontSize: 14, color: "#555d6e", fontWeight: 600, marginBottom: 8 }}>PRO PLAN</div>
            <div style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: "#00e89d" }}>₹499<span style={{ fontSize: 16, color: "#8a8f9c" }}>/mo</span></div>
            <div style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>Monthly • Cancel anytime</div>
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 20 }}>
              {["Everything in Free","Unlimited strategies","Unlimited Telegram alerts","Priority WhatsApp support","1 free strategy consultation/mo","All future strategies included"].map(f => <div key={f} style={{ display: "flex", gap: 10, marginBottom: 12, fontSize: 14, color: "#b0b5bf" }}><span style={{ color: "#00e89d" }}>✓</span>{f}</div>)}
            </div>
            <button className="bp" style={{ width: "100%", marginTop: 16 }} onClick={() => { if (!isLoggedIn) { setShowLogin(true); return; } handlePayment(); }}>
              {userPlan === "pro" ? "Pro Active ✓" : "Upgrade — ₹499/mo"}
            </button>
          </div>
        </div>
      </section>

      {/* CUSTOM STRATEGY */}
      <section id="custom" className="sec">
        <span className="tag">Custom Strategy</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Get Your Strategy Automated</h2>
        <p style={{ color: "#8a8f9c", marginBottom: 32, maxWidth: 620 }}>Share your Indian market trading strategy. We'll backtest it, automate it, and set up Telegram alerts for you.</p>
        {formSubmitted ? (
          <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 500 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div><h3 style={{ fontSize: 22, marginBottom: 8 }}>Submitted!</h3><p style={{ color: "#8a8f9c", marginBottom: 16 }}>We'll reach out within 24 hours.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="bw" onClick={()=>window.open("https://wa.me/917869143383","_blank")}>📱 WhatsApp</button>
              <button className="be" onClick={()=>window.open("mailto:tradeinfinity1410@gmail.com","_blank")}>📧 Email</button>
            </div>
            <button className="bo" style={{ marginTop: 20 }} onClick={()=>setFormSubmitted(false)}>Submit Another</button>
          </div>
        ) : (
          <div className="card" style={{ padding: 32, maxWidth: 600 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Name *</label><input className="inp" value={stratForm.name} onChange={e=>setStratForm({...stratForm,name:e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Email *</label><input className="inp" value={stratForm.email} onChange={e=>setStratForm({...stratForm,email:e.target.value})} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>WhatsApp</label><input className="inp" placeholder="+91" value={stratForm.phone} onChange={e=>setStratForm({...stratForm,phone:e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Instrument</label><select className="inp" value={stratForm.instrument} onChange={e=>setStratForm({...stratForm,instrument:e.target.value})}>{["Nifty 100","Nifty 50","Bank Nifty","F&O Stocks","Specific Stocks"].map(o=><option key={o}>{o}</option>)}</select></div>
              </div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Strategy Name</label><input className="inp" placeholder="e.g. RSI Reversal" value={stratForm.strategyName} onChange={e=>setStratForm({...stratForm,strategyName:e.target.value})} /></div>
              <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Describe Strategy *</label><textarea className="inp" rows={4} placeholder="Entry conditions, indicators..." value={stratForm.description} onChange={e=>setStratForm({...stratForm,description:e.target.value})} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Entry Rule</label><input className="inp" value={stratForm.entry_rule} onChange={e=>setStratForm({...stratForm,entry_rule:e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Target Rule</label><input className="inp" value={stratForm.target_rule} onChange={e=>setStratForm({...stratForm,target_rule:e.target.value})} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>SL Rule</label><input className="inp" value={stratForm.sl_rule} onChange={e=>setStratForm({...stratForm,sl_rule:e.target.value})} /></div>
                <div><label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Contact via</label><select className="inp" value={stratForm.meetPref} onChange={e=>setStratForm({...stratForm,meetPref:e.target.value})}>{["WhatsApp","Email","Phone Call"].map(o=><option key={o}>{o}</option>)}</select></div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="bw" style={{ flex: 1 }} onClick={()=>handleStratSubmit("whatsapp")}>📱 WhatsApp</button>
              <button className="be" style={{ flex: 1 }} onClick={()=>handleStratSubmit("email")}>📧 Email</button>
            </div>
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section id="about" className="sec">
        <span className="tag">About Us</span>
        <h2 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 24 }}>Built by Traders, for Traders</h2>
        <div className="card" style={{ padding: 32, maxWidth: 700 }}>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8, marginBottom: 16 }}>Trade Infinity makes backtesting and automation accessible to every Indian retail trader. We focus exclusively on NSE & BSE — no crypto, no forex.</p>
          <p style={{ color: "#b0b5bf", lineHeight: 1.8, marginBottom: 16 }}>Our roadmap: broker integration with Zerodha, Angel One, and Upstox for completely hands-free algo trading.</p>
          <div style={{ marginTop: 24, padding: 20, background: "#0a0d14", borderRadius: 12 }}>
            <div style={{ fontSize: 13, color: "#555d6e", marginBottom: 12, fontWeight: 600 }}>CONTACT</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <a href="https://wa.me/917869143383" target="_blank" rel="noopener noreferrer" style={{ color: "#25D366", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>📱 +91 78691 43383</a>
              <a href="mailto:tradeinfinity1410@gmail.com" style={{ color: "#4285f4", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>📧 tradeinfinity1410@gmail.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #151b28", padding: "40px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #00e89d, #00b87a)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#06080d" }}>T∞</div>
          <span style={{ fontWeight: 700 }}>Trade Infinity</span>
        </div>
        <p style={{ color: "#333844", fontSize: 11, maxWidth: 500, margin: "8px auto 0" }}>© 2026 Trade Infinity. Not SEBI registered. Simulated data for demo. Trading involves risk. Indian markets only.</p>
      </footer>

      {/* LOGIN / SIGNUP MODAL */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e=>{ if(e.target===e.currentTarget) { setShowLogin(false); setAuthError(""); }}}>
          <div className="card" style={{ padding: 32, maxWidth: 420, width: "100%", background: "#0d1017" }}>
            <div style={{ display: "flex", marginBottom: 24, borderRadius: 10, overflow: "hidden", border: "1px solid #1a2035" }}>
              {["login","signup"].map(tab => (
                <button key={tab} onClick={()=>{ setLoginTab(tab); setAuthError(""); }} style={{ flex: 1, padding: 12, background: loginTab===tab?"#00e89d15":"transparent", color: loginTab===tab?"#00e89d":"#555d6e", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}>
                  {tab==="login"?"Log In":"Sign Up"}
                </button>
              ))}
            </div>

            {authError && <div className="err">{authError}</div>}

            {loginTab === "signup" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Full Name</label>
                <input className="inp" placeholder="Your name" value={loginForm.name} onChange={e=>setLoginForm({...loginForm,name:e.target.value})} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Email</label>
              <input className="inp" type="email" placeholder="you@example.com" value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Password</label>
              <input className="inp" type="password" placeholder="Min 6 characters" value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} />
            </div>
            <button className="bp" style={{ width: "100%" }} disabled={authLoading} onClick={loginTab==="login"?handleLogin:handleSignup}>
              {authLoading ? "Please wait..." : loginTab==="login" ? "Log In" : "Create Account & Start Trial"}
            </button>
            <p style={{ fontSize: 12, color: "#555d6e", textAlign: "center", marginTop: 16 }}>
              {loginTab==="signup" ? "✅ 7-day free trial. No payment needed. Account saved permanently." : "Don't have an account? Click Sign Up above."}
            </p>
          </div>
        </div>
      )}

      {/* TELEGRAM MODAL */}
      {showTelegramSetup && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e=>{ if(e.target===e.currentTarget) setShowTelegramSetup(false); }}>
          <div className="card" style={{ padding: 32, maxWidth: 440, width: "100%", background: "#0d1017" }}>
            <h3 style={{ fontSize: 22, marginBottom: 16 }}>📲 Connect Telegram</h3>
            {[["1","Open Telegram → search @TradeInfinityBot"],["2","Send /start to the bot"],["3",`Type: /link ${currentUser?.email || "your@email.com"}`],["4","Done! You'll receive alerts automatically"]].map(([n,t]) => (
              <div key={n} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00e89d22", display: "flex", alignItems: "center", justifyContent: "center", color: "#00e89d", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n}</div>
                <div style={{ color: "#b0b5bf", fontSize: 14, paddingTop: 4 }}>{t}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 14, background: "#111520", borderRadius: 10, fontSize: 12, color: "#8a8f9c", lineHeight: 1.6 }}>
              <strong>Sample alert you'll get:</strong><br/>🟢 <strong>BUY</strong> — Bajaj Auto<br/>Entry: ₹4,580 | Target: ₹5,954 | SL: ₹3,893
            </div>
            <button className="bp" style={{ width: "100%", marginTop: 20 }} onClick={()=>setShowTelegramSetup(false)}>Got it ✓</button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e=>{ if(e.target===e.currentTarget && !paymentLoading) { setShowPaymentModal(false); setCouponCode(""); setCouponResult(null); setPaymentPrice(499); }}}>
          <div className="card" style={{ padding: 32, maxWidth: 440, width: "100%", background: "#0d1017" }}>
            <h3 style={{ fontSize: 22, marginBottom: 6 }}>✨ Upgrade to Pro</h3>
            <p style={{ color: "#8a8f9c", fontSize: 14, marginBottom: 24 }}>Unlimited strategies, alerts & support for 30 days.</p>

            {/* Price display */}
            <div style={{ background: "#0a0d14", borderRadius: 12, padding: 20, marginBottom: 20, textAlign: "center" }}>
              {couponResult?.valid && (
                <div style={{ fontSize: 14, color: "#555d6e", textDecoration: "line-through", marginBottom: 4 }}>₹499/month</div>
              )}
              <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Space Mono',monospace", color: "#00e89d" }}>
                ₹{paymentPrice}
              </div>
              <div style={{ fontSize: 13, color: "#8a8f9c", marginTop: 4 }}>for 30 days</div>
              {couponResult?.valid && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#00e89d", background: "#00e89d15", padding: "4px 12px", borderRadius: 6, display: "inline-block" }}>
                  🎉 You save ₹{couponResult.discount}!
                </div>
              )}
            </div>

            {/* Coupon code */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: "#555d6e", display: "block", marginBottom: 6 }}>Have a coupon code?</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="inp"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setPaymentPrice(499); }}
                  style={{ flex: 1, textTransform: "uppercase", letterSpacing: 1 }}
                />
                <button
                  className="bo"
                  style={{ padding: "10px 16px", fontSize: 13, whiteSpace: "nowrap" }}
                  onClick={handleValidateCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponResult && !couponResult.valid && (
                <div style={{ fontSize: 12, color: "#ff4d6a", marginTop: 6 }}>{couponResult.message}</div>
              )}
              {couponResult?.valid && (
                <div style={{ fontSize: 12, color: "#00e89d", marginTop: 6 }}>✅ {couponResult.message}</div>
              )}
            </div>

            {/* What you get */}
            <div style={{ borderTop: "1px solid #1a2035", paddingTop: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#555d6e", marginBottom: 10, fontWeight: 600 }}>WHAT YOU GET:</div>
              {["Unlimited access to all strategies", "Unlimited Telegram alerts (30 days)", "Priority WhatsApp support", "1 free strategy consultation"].map(f => (
                <div key={f} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#b0b5bf" }}>
                  <span style={{ color: "#00e89d" }}>✓</span>{f}
                </div>
              ))}
            </div>

            {/* Pay button */}
            <button
              className="bp"
              style={{ width: "100%", fontSize: 16, padding: 14 }}
              onClick={startCashfreePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Processing payment..." : `Pay ₹${paymentPrice} — Activate Pro`}
            </button>

            <p style={{ fontSize: 11, color: "#555d6e", textAlign: "center", marginTop: 12 }}>
              Secure payment via Cashfree. UPI, cards, netbanking accepted.
            </p>

            {!paymentLoading && (
              <button
                style={{ background: "none", border: "none", color: "#555d6e", fontSize: 12, cursor: "pointer", width: "100%", marginTop: 8, fontFamily: "'DM Sans',sans-serif" }}
                onClick={() => { setShowPaymentModal(false); setCouponCode(""); setCouponResult(null); setPaymentPrice(499); }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
