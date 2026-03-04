import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ── Fonts
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
);

// ── Constants
const DEFAULT_ROUNDS = [
  { id: 0, label: "Round 1",      short: "R1",  dmg: 0.50 },
  { id: 1, label: "Round of 32",  short: "R32", dmg: 1.00 },
  { id: 2, label: "Sweet 16",     short: "S16", dmg: 1.50 },
  { id: 3, label: "Elite Eight",  short: "E8",  dmg: 2.00 },
  { id: 4, label: "Final Four",   short: "FF",  dmg: 2.50 },
  { id: 5, label: "Championship", short: "NCG", dmg: 3.00 },
];

const OWNER_COLORS = [
  "#e05c3a","#3a9be0","#2ecc71","#f0c040",
  "#9b59b6","#1abc9c","#e67e22","#e91e63"
];

const CHI2025_OWNERS = [
  { name:"Stephen Sevenich", color:"#e05c3a", num:2, teams:[
    {seed:4,name:"Texas A&M"},{seed:8,name:"UConn"},{seed:7,name:"Marquette"},
    {seed:11,name:"Xavier"},{seed:2,name:"Tennessee"},{seed:13,name:"Yale"},
    {seed:13,name:"Akron"},{seed:15,name:"Bryant"}]},
  { name:"Tim Miley", color:"#3a9be0", num:9, teams:[
    {seed:11,name:"VCU"},{seed:5,name:"Memphis"},{seed:8,name:"Mississippi State"},
    {seed:1,name:"Duke"},{seed:9,name:"Creighton"},{seed:10,name:"Vanderbilt"},
    {seed:13,name:"High Point"},{seed:15,name:"Omaha"}]},
  { name:"Tony Barbato", color:"#2ecc71", num:3, teams:[
    {seed:3,name:"Wisconsin"},{seed:4,name:"Arizona"},{seed:6,name:"Ole Miss"},
    {seed:1,name:"Auburn"},{seed:6,name:"Illinois"},{seed:9,name:"Baylor"},
    {seed:14,name:"UNC Wilmington"},{seed:15,name:"Wofford"}]},
  { name:"Dave Bettenburg", color:"#f0c040", num:4, teams:[
    {seed:5,name:"Clemson"},{seed:5,name:"Michigan"},{seed:3,name:"Kentucky"},
    {seed:4,name:"Purdue"},{seed:1,name:"Houston"},{seed:13,name:"Grand Canyon"},
    {seed:14,name:"Troy"},{seed:15,name:"Robert Morris"}]},
  { name:"Josh Galati", color:"#9b59b6", num:1, teams:[
    {seed:4,name:"Maryland"},{seed:11,name:"Drake"},{seed:2,name:"Alabama"},
    {seed:12,name:"McNeese"},{seed:2,name:"Michigan State"},{seed:10,name:"Arkansas"},
    {seed:11,name:"UNC"},{seed:16,name:"Norfolk State"}]},
  { name:"Nick Johnson", color:"#1abc9c", num:7, teams:[
    {seed:12,name:"Colorado State"},{seed:3,name:"Texas Tech"},{seed:10,name:"Utah State"},
    {seed:12,name:"Liberty"},{seed:6,name:"BYU"},{seed:12,name:"UC San Diego"},
    {seed:9,name:"Oklahoma"},{seed:16,name:"Alabama State or St. Francis"}]},
  { name:"Alex Jurich", color:"#e67e22", num:6, teams:[
    {seed:6,name:"Missouri"},{seed:3,name:"Iowa State"},{seed:7,name:"UCLA"},
    {seed:2,name:"St. John's"},{seed:7,name:"Saint Mary's"},{seed:9,name:"Georgia"},
    {seed:14,name:"Montana"},{seed:16,name:"Southern IL Evansville"}]},
  { name:"Matt Sevenich", color:"#e91e63", num:5, teams:[
    {seed:8,name:"Louisville"},{seed:8,name:"Gonzaga"},{seed:5,name:"Oregon"},
    {seed:7,name:"Kansas"},{seed:1,name:"Florida"},{seed:10,name:"New Mexico"},
    {seed:14,name:"Lipscomb"},{seed:16,name:"American / Mount St. Mary's"}]},
];

function genCode() {
  return Math.random().toString(36).substring(2,8).toUpperCase();
}

// ── Scoring engine (identical to spreadsheet logic)
function calcStats(owners, wins, rounds) {
  const N = owners.length;
  const map = {};
  owners.forEach(o => {
    map[o.id] = {
      id: o.id, name: o.name, color: o.color,
      roundWins: Array(6).fill(0),
      roundEarned: Array(6).fill(0),
      roundCost: Array(6).fill(0),
    };
  });

  wins.forEach(w => {
    const owner = owners.find(o => o.id === w.owner_id);
    if (!owner) return;
    const team = owner.teams[w.team_index];
    if (!team) return;
    const round = rounds[w.round_id];
    const perOwner = team.seed * round.dmg;
    map[w.owner_id].roundWins[w.round_id]++;
    map[w.owner_id].roundEarned[w.round_id] += perOwner * (N - 1);
    owners.forEach(o => {
      if (o.id !== w.owner_id) map[o.id].roundCost[w.round_id] += perOwner;
    });
  });

  return owners.map(o => {
    const s = map[o.id];
    const totalEarned = s.roundEarned.reduce((a,b)=>a+b,0);
    const totalCost   = s.roundCost.reduce((a,b)=>a+b,0);
    const net = totalEarned - totalCost;
    let cum = 0;
    const cumByRound = s.roundEarned.map((e,i)=>{ cum += e - s.roundCost[i]; return cum; });
    return { ...s, totalEarned, totalCost, net, cumByRound };
  }).sort((a,b)=>b.net - a.net);
}

// ── Styles
const S = {
  btn: (bg="#f0c040", color="#111") => ({
    background:bg, color, border:"none", borderRadius:8,
    padding:"9px 18px", fontWeight:700, fontSize:13,
    cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
  }),
  input: {
    background:"#1c2233", border:"1px solid #2a3350", borderRadius:8,
    color:"#e0e6f0", padding:"10px 14px", fontSize:14, outline:"none",
    width:"100%", boxSizing:"border-box", fontFamily:"inherit",
  },
  label: {
    fontSize:11, color:"#6677aa", textTransform:"uppercase",
    letterSpacing:1.2, fontWeight:600, display:"block", marginBottom:6,
  },
  card: {
    background:"#131929", border:"1px solid #1e2840",
    borderRadius:14, padding:"20px 24px", marginBottom:16,
  },
};
const TH = { padding:"10px 14px", textAlign:"left", color:"#6677aa", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a2440" };
const TD = { padding:"10px 14px", verticalAlign:"middle" };

// ── Tiny components
function SeedBadge({ seed }) {
  const hue = Math.round(115 - (seed-1)*7);
  return (
    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
      width:22, height:22, borderRadius:"50%", fontSize:10, fontWeight:800,
      color:"#fff", background:`hsl(${hue},65%,32%)`, flexShrink:0 }}>{seed}</span>
  );
}
function Toast({ msg, type }) {
  if (!msg) return null;
  const ok = type !== "error";
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:9999,
      background: ok ? "#142a1e" : "#2a1418",
      border:`1px solid ${ok?"#27ae60":"#e74c3c"}`,
      borderRadius:10, padding:"12px 20px", fontSize:14,
      color: ok ? "#2ecc71" : "#e74c3c",
      boxShadow:"0 6px 24px rgba(0,0,0,0.5)", fontFamily:"inherit", fontWeight:600 }}>
      {msg}
    </div>
  );
}
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}>
      <div style={{ background:"#131929", border:"1px solid #2a3350", borderRadius:18,
        padding:28, maxWidth:560, width:"100%", maxHeight:"90vh", overflowY:"auto" }}
        onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ margin:0, fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, color:"#f0c040" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#667", fontSize:22, cursor:"pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Empty({ text }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px",
      background:"#111827", border:"1px dashed #1a2440",
      borderRadius:14, color:"#334" }}>
      <div style={{ fontSize:30, marginBottom:10 }}>🏀</div>
      <p style={{ margin:0, fontSize:14 }}>{text}</p>
    </div>
  );
}
function Fin({ label, val, color, large }) {
  return (
    <div style={{ textAlign:"right" }}>
      <div style={{ fontSize:10, color:"#445", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{label}</div>
      <div style={{ color, fontWeight: large?800:700, fontSize: large?17:13, fontFamily:"'DM Mono',monospace" }}>{val}</div>
    </div>
  );
}
function SecTitle({ children }) {
  return <h3 style={{ margin:"0 0 14px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2, color:"#f0c040", fontSize:18 }}>{children}</h3>;
}
function Spinner() {
  return (
    <div style={{ textAlign:"center", padding:"60px 24px", color:"#445" }}>
      <div style={{ fontSize:30, marginBottom:12, animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</div>
      <p style={{ margin:0 }}>Loading…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // League state
  const [leagueCode, setLeagueCode] = useState(null);
  const [league, setLeague]         = useState(null);
  const [owners, setOwners]         = useState([]);
  const [wins, setWins]             = useState([]);
  const [loading, setLoading]       = useState(false);

  // UI state
  const [tab, setTab]               = useState("leaderboard");
  const [modal, setModal]           = useState(null);
  const [toast, setToast]           = useState(null);

  // Form values
  const [newLeagueName, setNewLeagueName] = useState("");
  const [joinCode, setJoinCode]           = useState("");
  const [joinErr, setJoinErr]             = useState("");
  const [newOwnerName, setNewOwnerName]   = useState("");
  const [winOwnerId, setWinOwnerId]       = useState("");
  const [winRoundId, setWinRoundId]       = useState(0);
  const [winTeamIdx, setWinTeamIdx]       = useState("");

  // Team editor
  const [editingOwner, setEditingOwner]   = useState(null);
  const [editTeams, setEditTeams]         = useState([]);

  // Setup wizard
  const BLANK_ROSTER = () => Array.from({length:8}, (_,i) => ({ seed: i+1, name: "" }));
  const [setupOwners, setSetupOwners] = useState(() => Array.from({length:8}, (_,i) => ({ name:"", color:OWNER_COLORS[i%8], teams:Array.from({length:8},(_,j)=>({seed:j+1,name:""})) })));
  const [setupStep, setSetupStep]     = useState(0);

  // My Leagues (persisted in localStorage)
  const [myLeagues, setMyLeagues] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bb_my_leagues") || "[]"); }
    catch { return []; }
  });

  function saveToMyLeagues(code, name) {
    setMyLeagues(prev => {
      const exists = prev.find(l => l.code === code);
      const updated = exists
        ? prev.map(l => l.code === code ? { ...l, name } : l)
        : [...prev, { code, name, createdAt: Date.now() }];
      localStorage.setItem("bb_my_leagues", JSON.stringify(updated));
      return updated;
    });
  }

  // Round payouts (editable per league)
  const [rounds, setRounds] = useState(() => {
    const saved = sessionStorage.getItem("bb_rounds");
    return saved ? JSON.parse(saved) : DEFAULT_ROUNDS;
  });

  // Admin PIN
  const ADMIN_PIN = "1234"; // Change this to your desired PIN
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pinInput, setPinInput]           = useState("");
  const [pinError, setPinError]           = useState("");

  // ESPN
  const [espnGames, setEspnGames]   = useState([]);
  const [espnStatus, setEspnStatus] = useState("idle");

  function notify(msg, type="success") {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3200);
  }

  // ── Auto-load saved league on startup ──────────────────────────────────
  useEffect(() => {
    const saved = sessionStorage.getItem("bb_league_code");
    if (saved) loadLeague(saved);
  // eslint-disable-next-line
  }, []);

  // ── Load league from Supabase ────────────────────────────────────────────
  const loadLeague = useCallback(async (code) => {
    setLoading(true);
    try {
      // Load league info
      const { data: lg, error: lgErr } = await supabase
        .from("leagues").select("*").eq("code", code).single();
      if (lgErr || !lg) { notify("League not found.", "error"); setLoading(false); return false; }

      // Load owners
      const { data: ownersData } = await supabase
        .from("owners").select("*").eq("league_code", code).order("num");

      // Load wins
      const { data: winsData } = await supabase
        .from("wins").select("*").eq("league_code", code);

      setLeague(lg);
      setOwners(ownersData || []);
      setWins(winsData || []);
      setLeagueCode(code);
      sessionStorage.setItem("bb_league_code", code);
      // Load per-league round settings if stored
      const savedRounds = sessionStorage.getItem(`bb_rounds_${code}`);
      if (savedRounds) setRounds(JSON.parse(savedRounds));
      else setRounds(DEFAULT_ROUNDS);
      setLoading(false);
      return true;
    } catch {
      notify("Failed to load league.", "error");
      setLoading(false);
      return false;
    }
  }, []);

  // ── Real-time subscription ───────────────────────────────────────────────
  useEffect(() => {
    if (!leagueCode) return;
    const channel = supabase.channel(`league_${leagueCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "wins", filter: `league_code=eq.${leagueCode}` },
        () => supabase.from("wins").select("*").eq("league_code", leagueCode).then(({ data }) => data && setWins(data)))
      .on("postgres_changes", { event: "*", schema: "public", table: "owners", filter: `league_code=eq.${leagueCode}` },
        () => supabase.from("owners").select("*").eq("league_code", leagueCode).order("num").then(({ data }) => data && setOwners(data)))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [leagueCode]);

  // ── League ops ───────────────────────────────────────────────────────────
  async function createLeague() {
    if (!newLeagueName.trim()) return;
    const code = genCode();
    setLoading(true);

    const { error } = await supabase.from("leagues").insert({ code, name: newLeagueName.trim() });
    if (error) { notify("Failed to create league.", "error"); setLoading(false); return; }

    // If it's the CHI2025 template, seed owners
    const ok = await loadLeague(code);
    if (ok) {
      saveToMyLeagues(code, newLeagueName.trim());
      setNewLeagueName("");
      setModal(null);
      notify(`League created! Invite code: ${code}`);
    }
  }

  async function joinLeague() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const ok = await loadLeague(code);
    if (ok) {
      setJoinCode(""); setJoinErr("");
      setModal(null);
      notify(`Joined league: ${league?.name || code}`);
    } else {
      setJoinErr("No league found with that code.");
    }
  }

  // ── Seed CHI2025 if clicked directly ────────────────────────────────────
  async function loadCHI2025() {
    setLoading(true);
    // Try to load — if it doesn't exist, create it and seed owners
    const { data: existing } = await supabase.from("leagues").select("code").eq("code","CHI2025").single();
    if (!existing) {
      await supabase.from("leagues").insert({ code:"CHI2025", name:"CHI 2025 Upset Pool" });
      // Seed owners
      for (let i = 0; i < CHI2025_OWNERS.length; i++) {
        const o = CHI2025_OWNERS[i];
        await supabase.from("owners").insert({
          league_code:"CHI2025", name:o.name, color:o.color, num:i+1, teams:o.teams
        });
      }
    }
    await loadLeague("CHI2025");
    saveToMyLeagues("CHI2025", "CHI 2025 Upset Pool");
  }

  // ── Add owner ────────────────────────────────────────────────────────────
  async function addOwner() {
    if (!newOwnerName.trim() || !leagueCode) return;
    if (owners.length >= 8) { notify("Max 8 owners per league.", "error"); return; }
    const color = OWNER_COLORS[owners.length % OWNER_COLORS.length];
    const defaultTeams = Array.from({length:8}, (_,i)=>({ seed:i+1, name:`Team ${i+1}` }));
    const { error } = await supabase.from("owners").insert({
      league_code: leagueCode, name: newOwnerName.trim(),
      color, num: owners.length + 1, teams: defaultTeams,
    });
    if (error) { notify("Failed to add owner.", "error"); return; }
    setNewOwnerName("");
    notify(`${newOwnerName.trim()} added!`);
  }

  // ── Record win ───────────────────────────────────────────────────────────
  async function recordWin() {
    if (!winOwnerId || winTeamIdx === "") return;
    const { error } = await supabase.from("wins").insert({
      league_code: leagueCode,
      owner_id: parseInt(winOwnerId),
      round_id: winRoundId,
      team_index: parseInt(winTeamIdx),
    });
    if (error) {
      notify(error.code === "23505" ? "Win already recorded." : "Failed to record win.", "error");
      return;
    }
    const owner = owners.find(o=>o.id===parseInt(winOwnerId));
    const team = owner?.teams[parseInt(winTeamIdx)];
    notify(`✓ ${team?.name} win recorded for ${owner?.name}`);
    setWinTeamIdx("");
    setModal(null);
  }

  // ── Remove win ───────────────────────────────────────────────────────────
  async function removeWin(winId) {
    const { error } = await supabase.from("wins").delete().eq("id", winId);
    if (error) notify("Failed to remove win.", "error");
    else notify("Win removed.");
  }

  // ── Edit teams ───────────────────────────────────────────────────────────
  function openTeamEditor(owner) {
    setEditingOwner(owner);
    setEditTeams(owner.teams.map(t => ({ ...t })));
    setModal("editTeams");
  }

  async function saveTeams() {
    if (!editingOwner) return;
    const { error } = await supabase
      .from("owners")
      .update({ teams: editTeams })
      .eq("id", editingOwner.id);
    if (error) { notify("Failed to save teams.", "error"); return; }
    setOwners(prev => prev.map(o => o.id === editingOwner.id ? { ...o, teams: editTeams } : o));
    setModal(null);
    setEditingOwner(null);
    notify(`${editingOwner.name}'s teams updated!`);
  }

  // ── ESPN ─────────────────────────────────────────────────────────────────
  async function fetchESPN() {
    setEspnStatus("loading");
    try {
      const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEspnGames((data.events||[]).map(e=>({
        id:e.id, name:e.name,
        status:e.status?.type?.description||"—",
        isLive:e.status?.type?.state==="in",
        isFinal:e.status?.type?.completed,
        competitors:(e.competitions?.[0]?.competitors||[]).map(c=>({
          name:c.team?.displayName, score:c.score, winner:c.winner,
          seed:c.curatedRank?.current,
        }))
      })));
      setEspnStatus("success");
    } catch { setEspnStatus("error"); }
  }

  const stats = calcStats(owners, wins, rounds);
  const totalWins = wins.length;

  const TABS = [
    {id:"leaderboard", icon:"🏆", label:"Leaderboard"},
    {id:"wins",        icon:"📋", label:"Win Tracker"},
    {id:"roster",      icon:"👥", label:"Rosters"},
    {id:"payouts",     icon:"💰", label:"Payout Table"},
    {id:"espn",        icon:"📡", label:"Live Scores"},
    {id:"admin",       icon:"⚙️",  label:"Admin"},
  ];

  // ── Landing screen (no league loaded) ───────────────────────────────────
  if (!leagueCode) {
    return (
      <div style={{ minHeight:"100vh", background:"#0c1120", fontFamily:"'DM Sans',sans-serif",
        color:"#dce4f5", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <FontLink />
        <Toast {...(toast||{msg:null})} />
        <div style={{ maxWidth:460, width:"100%", padding:24 }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🏀</div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:44, letterSpacing:4,
              color:"#f0c040", margin:0, textShadow:"0 0 30px rgba(240,192,64,0.4)" }}>
              BRACKET BUCKS
            </h1>
            <p style={{ color:"#6677aa", marginTop:8, fontSize:14 }}>March Madness Upset Pool Tracker</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <button onClick={loadCHI2025} style={{
              ...S.btn("#f0c040","#111"), padding:"14px 20px", fontSize:15,
              borderRadius:12, textAlign:"left",
            }}>
              🗂 Load CHI 2025 Upset Pool
              <div style={{ fontSize:11, fontWeight:400, color:"#555", marginTop:3 }}>
                Code: CHI2025 · 8 owners · Pre-loaded teams
              </div>
            </button>

            <button onClick={()=>setModal("join")} style={{
              ...S.btn("#1e2840","#dce4f5"), padding:"14px 20px", fontSize:15, borderRadius:12,
            }}>
              🔑 Join a League
              <div style={{ fontSize:11, fontWeight:400, color:"#6677aa", marginTop:3 }}>
                Enter your invite code
              </div>
            </button>

            <button onClick={()=>setModal("create")} style={{
              ...S.btn("#131929","#dce4f5"), padding:"14px 20px", fontSize:15, borderRadius:12,
              border:"1px solid #2a3350",
            }}>
              ＋ Create New League
              <div style={{ fontSize:11, fontWeight:400, color:"#6677aa", marginTop:3 }}>
                Set up a fresh pool for your group
              </div>
            </button>
          </div>

          {loading && <div style={{ marginTop:20, textAlign:"center", color:"#6677aa" }}>Loading…</div>}

          {/* My Leagues */}
          {myLeagues.length > 0 && (
            <div style={{ marginTop:28 }}>
              <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase",
                letterSpacing:2, fontWeight:700, marginBottom:10 }}>My Leagues</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...myLeagues].reverse().map(l => (
                  <button key={l.code} onClick={()=>loadLeague(l.code)} style={{
                    ...S.btn("#0f1625","#dce4f5"), padding:"12px 16px", fontSize:14,
                    borderRadius:10, textAlign:"left", border:"1px solid #1e2840",
                    display:"flex", alignItems:"center", justifyContent:"space-between"
                  }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{l.name}</div>
                      <div style={{ fontSize:11, color:"#6677aa", marginTop:2 }}>
                        Code: <span style={{ fontFamily:"'DM Mono',monospace", color:"#f0c040" }}>{l.code}</span>
                      </div>
                    </div>
                    <span style={{ color:"#f0c040", fontSize:18 }}>→</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>{
                localStorage.removeItem("bb_my_leagues");
                setMyLeagues([]);
              }} style={{ fontSize:11, color:"#445", background:"none", border:"none",
                cursor:"pointer", marginTop:8, textDecoration:"underline" }}>
                Clear history
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal open={modal==="join"} onClose={()=>setModal(null)} title="Join a League">
          <label style={S.label}>Invite Code</label>
          <input value={joinCode} onChange={e=>{setJoinCode(e.target.value);setJoinErr("");}}
            placeholder="e.g. CHI2025" style={S.input}
            onKeyDown={e=>e.key==="Enter"&&joinLeague()} />
          {joinErr && <p style={{ color:"#e74c3c", fontSize:13, marginTop:6 }}>{joinErr}</p>}
          <button onClick={joinLeague} style={{ ...S.btn(), marginTop:14, width:"100%" }}>Join</button>
        </Modal>

        <Modal open={modal==="create"} onClose={()=>setModal(null)} title="Create New League">
          <label style={S.label}>League Name</label>
          <input value={newLeagueName} onChange={e=>setNewLeagueName(e.target.value)}
            placeholder="e.g. Office Bracket 2026" style={S.input}
            onKeyDown={e=>e.key==="Enter"&&createLeague()} />
          <p style={{ fontSize:12, color:"#445", marginTop:8 }}>
            A 6-character invite code is generated automatically. Share it with your league.
          </p>
          <button onClick={createLeague} style={{ ...S.btn(), marginTop:12, width:"100%" }}>
            Create League
          </button>
        </Modal>
        <style>{`select option { background: #131929; } * { box-sizing: border-box; }`}</style>
      </div>
    );
  }

  // ── Main app (league loaded) ─────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0c1120", fontFamily:"'DM Sans',sans-serif", color:"#dce4f5" }}>
      <FontLink />
      <Toast {...(toast||{msg:null})} />

      {/* Header */}
      <header style={{ background:"linear-gradient(135deg,#090e1a 0%,#141d38 100%)",
        borderBottom:"2px solid #f0c040", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28 }}>🏀</span>
          <div>
            <h1 style={{ margin:0, fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:3,
              color:"#f0c040", textShadow:"0 0 20px rgba(240,192,64,0.35)" }}>BRACKET BUCKS</h1>
            <div style={{ fontSize:10, color:"#6677aa", letterSpacing:2, textTransform:"uppercase" }}>
              {league?.name}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ background:"#1a2440", borderRadius:8, padding:"7px 14px", fontSize:12 }}>
            Code: <span style={{ fontFamily:"'DM Mono',monospace", color:"#f0c040", fontWeight:700 }}>{leagueCode}</span>
          </div>
          <button onClick={()=>{setLeagueCode(null);setLeague(null);setOwners([]);setWins([]);}}
            style={S.btn("#1e2840","#dce4f5")}>⬅ Switch League</button>
          {league && <button onClick={()=>setModal("addWin")} style={S.btn()}>＋ Record Win</button>}
        </div>
      </header>

      {/* Stats bar */}
      <div style={{ background:"#0f1625", borderBottom:"1px solid #1a2440",
        padding:"7px 24px", display:"flex", gap:24, alignItems:"center", flexWrap:"wrap", fontSize:12 }}>
        <span style={{ color:"#6677aa" }}>{owners.length} owners</span>
        <span style={{ color:"#6677aa" }}>{totalWins} wins logged</span>
        <span style={{ color:"#6677aa" }}>🔴 Live — updates automatically</span>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, padding:"14px 24px 0", borderBottom:"1px solid #1a2440", overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background: tab===t.id ? "#f0c040" : "transparent",
            color: tab===t.id ? "#111" : "#6677aa",
            border:"none", borderRadius:"8px 8px 0 0", padding:"9px 16px", fontSize:13,
            fontWeight:600, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      <main style={{ padding:"24px", maxWidth:1140, margin:"0 auto" }}>
        {loading && <Spinner />}

        {/* LEADERBOARD */}
        {!loading && tab==="leaderboard" && (
          <div>
            <h2 style={{ margin:"0 0 20px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Standings</h2>
            {stats.length===0 ? <Empty text="No owners yet. Add owners in Admin tab." /> : (
              <>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {stats.map((s,i)=>(
                    <div key={s.id} style={{
                      background: i===0 ? "linear-gradient(135deg,#1a2010,#2a3820)" : "linear-gradient(135deg,#111827,#141d30)",
                      border:`1px solid ${i===0?"#2ecc71":"#1a2440"}`,
                      borderRadius:12, padding:"14px 20px",
                      display:"flex", alignItems:"center", gap:14, flexWrap:"wrap",
                    }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0,
                        background: i===0?"#f0c040":i===1?"#9aa":i===2?"#a87040":"#1e2840",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:800, fontSize:14, color:i<3?"#111":"#445" }}>{i+1}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:140 }}>
                        <div style={{ width:10, height:10, borderRadius:"50%", background:s.color }} />
                        <span style={{ fontWeight:700, fontSize:15 }}>{s.name}</span>
                      </div>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap", flex:1 }}>
                        {rounds.map((r,ri)=>(
                          <span key={ri} style={{
                            background: s.roundWins[ri]>0?"#1a3a28":"#131929",
                            border:`1px solid ${s.roundWins[ri]>0?"#27ae60":"#1e2840"}`,
                            borderRadius:6, padding:"3px 8px", fontSize:11,
                            color:s.roundWins[ri]>0?"#2ecc71":"#334",
                          }}>{r.short}: {s.roundWins[ri]}</span>
                        ))}
                      </div>
                      <div style={{ display:"flex", gap:18, marginLeft:"auto" }}>
                        <Fin label="Earned" val={`$${s.totalEarned.toFixed(2)}`} color="#2ecc71" />
                        <Fin label="Owed" val={`$${s.totalCost.toFixed(2)}`} color="#e74c3c" />
                        <Fin label="Net" val={`${s.net>=0?"+":""}$${s.net.toFixed(2)}`}
                          color={s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667"} large />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:10, textAlign:"right", fontSize:12, color:"#445" }}>
                  League net: <span style={{ color:"#2ecc71", fontWeight:700 }}>
                    ${stats.reduce((a,s)=>a+s.net,0).toFixed(2)} ✓ zero-sum
                  </span>
                </div>

                {/* Cumulative table */}
                <div style={{ ...S.card, marginTop:24 }}>
                  <SecTitle>Cumulative by Round</SecTitle>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                      <thead>
                        <tr style={{ background:"#1a2040" }}>
                          <th style={TH}>Owner</th>
                          {rounds.map(r=><th key={r.id} style={TH}>{r.short}</th>)}
                          <th style={TH}>Final Net</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.map(s=>(
                          <tr key={s.id} style={{ borderBottom:"1px solid #1a2440" }}>
                            <td style={{ ...TD, fontWeight:600 }}>
                              <span style={{ display:"inline-flex", alignItems:"center", gap:7 }}>
                                <span style={{ width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block" }} />
                                {s.name}
                              </span>
                            </td>
                            {s.cumByRound.map((v,i)=>(
                              <td key={i} style={{ ...TD, textAlign:"center", fontWeight:600,
                                color:v>0?"#2ecc71":v<0?"#e74c3c":"#667",
                                fontFamily:"'DM Mono',monospace" }}>
                                {v>=0?"+":""}${v.toFixed(2)}
                              </td>
                            ))}
                            <td style={{ ...TD, textAlign:"center", fontWeight:800, fontSize:15,
                              color:s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667",
                              fontFamily:"'DM Mono',monospace" }}>
                              {s.net>=0?"+":""}${s.net.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* WIN TRACKER */}
        {!loading && tab==="wins" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Win Log</h2>
              <button onClick={()=>setModal("addWin")} style={S.btn()}>＋ Record Win</button>
            </div>
            {wins.length===0 ? <Empty text="No wins recorded yet." /> : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {wins.map(w=>{
                  const owner = owners.find(o=>o.id===w.owner_id);
                  const team = owner?.teams[w.team_index];
                  if (!owner||!team) return null;
                  const round = rounds[w.round_id];
                  const perOwner = team.seed * round.dmg;
                  const total = perOwner * (owners.length-1);
                  return (
                    <div key={w.id} style={{ background:"#111827", border:"1px solid #1a2440",
                      borderRadius:10, padding:"11px 16px",
                      display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                      <SeedBadge seed={team.seed} />
                      <span style={{ fontWeight:600, flex:1, minWidth:120 }}>{team.name}</span>
                      <span style={{ fontSize:11, background:"#1a2440", color:"#8899cc",
                        borderRadius:5, padding:"2px 8px" }}>{round.label}</span>
                      <span style={{ color:"#f0c040", fontWeight:700, fontFamily:"'DM Mono',monospace" }}>
                        ${perOwner.toFixed(2)}/owner
                      </span>
                      <span style={{ color:"#2ecc71", fontWeight:700, fontFamily:"'DM Mono',monospace" }}>
                        Total: ${total.toFixed(2)}
                      </span>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:7,height:7,borderRadius:"50%",background:owner.color }} />
                        <span style={{ fontSize:12, color:"#6677aa" }}>{owner.name}</span>
                      </div>
                      <button onClick={()=>removeWin(w.id)} style={{ background:"none",
                        border:"1px solid #3a1820", borderRadius:6, color:"#e74c3c",
                        padding:"3px 8px", cursor:"pointer", fontSize:12 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ROSTERS */}
        {!loading && tab==="roster" && (
          <div>
            <h2 style={{ margin:"0 0 20px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Rosters</h2>
            {owners.length===0 ? <Empty text="No owners yet." /> : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
                {owners.map(owner=>{
                  const s = stats.find(x=>x.id===owner.id);
                  return (
                    <div key={owner.id} style={{ ...S.card, borderTop:`3px solid ${owner.color}`, paddingTop:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:owner.color }} />
                        <span style={{ fontWeight:700, fontSize:15 }}>{owner.name}</span>
                        {s&&<span style={{ marginLeft:"auto", fontSize:12, fontWeight:700,
                          fontFamily:"'DM Mono',monospace",
                          color:s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667" }}>
                          {s.net>=0?"+":""}${s.net.toFixed(2)}
                        </span>}
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                        {owner.teams.map((team,i)=>{
                          const hasWin = wins.some(w=>w.owner_id===owner.id&&w.team_index===i);
                          return (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                              background:hasWin?"#1a2e1a":"#0f1625",
                              border:`1px solid ${hasWin?"#27ae60":"#1a2440"}`,
                              borderRadius:7, padding:"6px 10px" }}>
                              <SeedBadge seed={team.seed} />
                              <span style={{ fontSize:13, flex:1 }}>{team.name}</span>
                              {hasWin&&<span style={{ fontSize:10, color:"#2ecc71" }}>✓</span>}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ marginTop:8, fontSize:11, color:"#445" }}>
                        Avg seed: {(owner.teams.reduce((a,t)=>a+t.seed,0)/owner.teams.length).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAYOUT TABLE */}
        {!loading && tab==="payouts" && (
          <div>
            <h2 style={{ margin:"0 0 6px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Payout Reference</h2>
            <p style={{ color:"#6677aa", fontSize:13, marginBottom:20 }}>
              Per-owner payout formula: <strong>Seed × Round Value</strong>.
              Winning owner collects from {owners.length-1} others.
            </p>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#141d38" }}>
                    <th style={TH}>Seed</th>
                    {rounds.map(r=>(
                      <th key={r.id} style={TH}>
                        {r.short}
                        <div style={{ fontSize:10, color:"#f0c040", fontWeight:400, marginTop:2 }}>${r.dmg}/win</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:16},(_,i)=>i+1).map(seed=>(
                    <tr key={seed} style={{ borderBottom:"1px solid #131929" }}>
                      <td style={{ ...TD, fontWeight:700 }}><SeedBadge seed={seed} /></td>
                      {rounds.map(r=>{
                        const pp = seed*r.dmg;
                        const tot = pp*(owners.length-1||7);
                        const heat = Math.min(pp/48,1);
                        return (
                          <td key={r.id} style={{ ...TD, textAlign:"center" }}>
                            <div style={{ fontWeight:700, color:`hsl(${Math.round(120-heat*120)},65%,55%)`,
                              fontFamily:"'DM Mono',monospace" }}>${pp.toFixed(2)}</div>
                            <div style={{ fontSize:10, color:"#445" }}>→ ${tot.toFixed(2)}</div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ESPN */}
        {!loading && tab==="espn" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <h2 style={{ margin:0, fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Live Scores</h2>
              <button onClick={fetchESPN} style={S.btn()} disabled={espnStatus==="loading"}>
                {espnStatus==="loading"?"⟳ Loading…":"🔄 Fetch from ESPN"}
              </button>
            </div>
            {owners.length>0 && espnStatus==="success" && (
              <div style={{ background:"#0a1428", border:"1px solid #1e2840", borderRadius:10,
                padding:"10px 14px", marginBottom:16, fontSize:12, color:"#6677aa" }}>
                💡 <strong style={{ color:"#f0c040" }}>1-click recording:</strong> When a game is final, click <strong style={{ color:"#2ecc71" }}>✓ Record Win</strong> next to the winning team to instantly log it. You'll be prompted to select the round.
              </div>
            )}
            {espnStatus==="idle"&&<Empty text='Click "Fetch from ESPN" to load live tournament scores.' />}
            {espnStatus==="error"&&(
              <div style={{ ...S.card, borderColor:"#e74c3c", color:"#e74c3c" }}>
                <strong>⚠️ Could not reach ESPN API</strong>
                <p style={{ fontSize:13, marginTop:8, color:"#aaa" }}>
                  Common during off-season or due to CORS. Use "+ Record Win" to log results manually.
                </p>
              </div>
            )}
            {espnStatus==="success"&&espnGames.length===0&&<Empty text="No tournament games active right now." />}
            {espnStatus==="success"&&espnGames.map(game=>(
              <div key={game.id} style={{ ...S.card, padding:"14px 18px", marginBottom:8,
                borderLeft:`3px solid ${game.isLive?"#e74c3c":game.isFinal?"#27ae60":"#1e2840"}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontWeight:600 }}>{game.name}</span>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:99, fontWeight:700,
                    background:game.isLive?"#3a0a0a":game.isFinal?"#0a2a14":"#1a2440",
                    color:game.isLive?"#e74c3c":game.isFinal?"#2ecc71":"#6677aa" }}>
                    {game.isLive?"🔴 LIVE":game.status}
                  </span>
                </div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {game.competitors.map((c,i)=>{
                    // Find matching owner+team for this competitor
                    const teamNameNorm = (c.name||"").toLowerCase().replace(/[^a-z0-9]/g,"");
                    const match = (() => {
                      for (const owner of owners) {
                        const idx = owner.teams.findIndex(t =>
                          (t.name||"").toLowerCase().replace(/[^a-z0-9]/g,"").includes(teamNameNorm.slice(0,6)) ||
                          teamNameNorm.includes((t.name||"").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,6))
                        );
                        if (idx >= 0) return { owner, teamIdx: idx, team: owner.teams[idx] };
                      }
                      return null;
                    })();
                    const alreadyWon = match && wins.some(w => w.owner_id===match.owner.id && w.team_index===match.teamIdx);
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8,
                        background:c.winner?"#0a2a14":"#0f1625",
                        border:`1px solid ${c.winner?"#27ae60":"#1a2440"}`,
                        borderRadius:8, padding:"8px 14px", flex:1, minWidth:140, flexWrap:"wrap" }}>
                        {c.seed&&<SeedBadge seed={c.seed} />}
                        <span style={{ fontWeight:c.winner?700:400, flex:1 }}>{c.name}</span>
                        {match && (
                          <span style={{ fontSize:11, color:"#6677aa", background:"#1a2440",
                            borderRadius:4, padding:"2px 6px" }}>
                            {match.owner.name}
                          </span>
                        )}
                        <span style={{ fontWeight:800, fontSize:20, fontFamily:"'DM Mono',monospace",
                          color:c.winner?"#2ecc71":"#dce4f5" }}>{c.score}</span>
                        {c.winner && match && !alreadyWon && (
                          <button onClick={()=>{
                            if (!adminUnlocked) { setModal("pin"); return; }
                            setWinOwnerId(String(match.owner.id));
                            setWinTeamIdx(String(match.teamIdx));
                            setModal("addWin");
                          }} style={{ background:"#0a3a1a", border:"1px solid #27ae60",
                            borderRadius:6, color:"#2ecc71", padding:"4px 10px",
                            cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit",
                            whiteSpace:"nowrap" }}>
                            ✓ Record Win
                          </button>
                        )}
                        {c.winner && alreadyWon && (
                          <span style={{ fontSize:11, color:"#2ecc71", fontWeight:700 }}>✓ Logged</span>
                        )}
                        {c.winner && !match && (
                          <button onClick={()=>{
                            if (!adminUnlocked) { setModal("pin"); return; }
                            setModal("addWin");
                          }} style={{ background:"#1a2440", border:"1px solid #2a3560",
                            borderRadius:6, color:"#f0c040", padding:"4px 10px",
                            cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
                            whiteSpace:"nowrap" }}>
                            + Log Win
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN */}
        {!loading && tab==="admin" && (
          <div>
            <h2 style={{ margin:"0 0 20px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Administration</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* League Info */}
              <div style={S.card}>
                <SecTitle>League Info</SecTitle>
                <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                  {[["Name",league?.name],["Code",<span style={{ fontFamily:"'DM Mono',monospace",
                    color:"#f0c040",background:"#1a2440",padding:"2px 10px",borderRadius:4 }}>{leagueCode}</span>],
                    ["Owners",`${owners.length}/8`],["Wins Logged",totalWins]]
                    .map(([l,v])=>(
                      <div key={l}>
                        <div style={{ fontSize:10,color:"#445",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{l}</div>
                        <div style={{ fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                </div>
                <div style={{ marginTop:16, padding:14, background:"#0f1625", borderRadius:10,
                  border:"1px solid #1a2440", fontSize:13 }}>
                  <strong style={{ color:"#f0c040" }}>📣 Share this invite code with your league:</strong>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:800,
                    color:"#fff", letterSpacing:6, marginTop:8 }}>{leagueCode}</div>
                  <div style={{ color:"#6677aa", fontSize:12, marginTop:4 }}>
                    They visit the site → "Join a League" → enter this code → instant access
                  </div>
                </div>
              </div>

              {/* Setup Wizard — add all 8 owners at once */}
              {owners.length === 0 && (
                <div style={S.card}>
                  <SecTitle>🏀 League Setup — Add All 8 Owners</SecTitle>
                  <p style={{ fontSize:13, color:"#6677aa", marginTop:0, marginBottom:16 }}>
                    Fill in each owner's name and their 8 teams below, then click Save All Owners.
                  </p>
                  {setupOwners.map((owner, oi) => (
                    <div key={oi} style={{ marginBottom:8, border:"1px solid #1e2840", borderRadius:10, overflow:"hidden" }}>
                      {/* Owner header — click to expand */}
                      <div onClick={()=>setSetupStep(setupStep===oi?-1:oi)} style={{
                        display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
                        background: setupStep===oi ? "#1a2440" : "#0f1625", cursor:"pointer"
                      }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:OWNER_COLORS[oi%8],flexShrink:0 }} />
                        <span style={{ fontWeight:600, flex:1, color: owner.name?"#dce4f5":"#445" }}>
                          {owner.name || `Owner ${oi+1} — click to expand`}
                        </span>
                        <span style={{ color:"#445", fontSize:12 }}>
                          {owner.teams.filter(t=>t.name).length}/8 teams
                        </span>
                        <span style={{ color:"#f0c040" }}>{setupStep===oi?"▲":"▼"}</span>
                      </div>
                      {setupStep===oi && (
                        <div style={{ padding:"14px 16px", background:"#0a0f1a", display:"flex", flexDirection:"column", gap:10 }}>
                          <div>
                            <label style={S.label}>Owner Name</label>
                            <input value={owner.name}
                              onChange={e=>setSetupOwners(prev=>prev.map((o,i)=>i===oi?{...o,name:e.target.value}:o))}
                              placeholder="e.g. Stephen Sevenich"
                              style={S.input} />
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                            {owner.teams.map((team, ti) => (
                              <div key={ti} style={{ display:"flex", gap:6, alignItems:"center" }}>
                                <input type="number" min="1" max="16" value={team.seed}
                                  onChange={e=>setSetupOwners(prev=>prev.map((o,i)=>i===oi?{...o,teams:o.teams.map((t,j)=>j===ti?{...t,seed:parseInt(e.target.value)||1}:t)}:o))}
                                  style={{ ...S.input, width:50, padding:"7px 6px", textAlign:"center", flexShrink:0 }} />
                                <input value={team.name}
                                  onChange={e=>setSetupOwners(prev=>prev.map((o,i)=>i===oi?{...o,teams:o.teams.map((t,j)=>j===ti?{...t,name:e.target.value}:t)}:o))}
                                  placeholder={`Team ${ti+1}`}
                                  style={{ ...S.input, padding:"7px 10px" }} />
                              </div>
                            ))}
                          </div>
                          <button onClick={()=>setSetupStep(oi+1<8?oi+1:-1)}
                            style={{ ...S.btn("#1a2e1a","#2ecc71"), border:"1px solid #27ae60", alignSelf:"flex-end" }}>
                            Next Owner ▶
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button onClick={async()=>{
                    const filled = setupOwners.filter(o=>o.name.trim());
                    if (!filled.length) { notify("Enter at least one owner name.","error"); return; }
                    setLoading(true);
                    for (let i=0; i<filled.length; i++) {
                      const o = filled[i];
                      await supabase.from("owners").insert({
                        league_code: leagueCode, name: o.name.trim(),
                        color: OWNER_COLORS[i%8], num: i+1, teams: o.teams
                      });
                    }
                    const { data } = await supabase.from("owners").select("*").eq("league_code", leagueCode).order("num");
                    setOwners(data||[]);
                    setLoading(false);
                    notify(`${filled.length} owners saved! 🎉`);
                  }} style={{ ...S.btn(), width:"100%", marginTop:8, padding:"13px", fontSize:15 }}>
                    💾 Save All Owners to League
                  </button>
                </div>
              )}

              {/* Payout Settings */}
              <div style={S.card}>
                <SecTitle>💰 Payout Settings</SecTitle>
                <p style={{ fontSize:13, color:"#6677aa", margin:"0 0 14px" }}>
                  Set the dollar amount per seed point for each round. Formula: Seed × Amount × (Owners − 1)
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
                  {rounds.map((r, i) => (
                    <div key={r.id} style={{ background:"#0f1625", borderRadius:10, padding:"12px 14px",
                      border:"1px solid #1e2840" }}>
                      <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase",
                        letterSpacing:1, marginBottom:6 }}>{r.label}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ color:"#f0c040", fontWeight:700 }}>$</span>
                        <input type="number" min="0" step="0.25" value={r.dmg}
                          onChange={e => {
                            if (!adminUnlocked) { setModal("pin"); return; }
                            const val = parseFloat(e.target.value) || 0;
                            const updated = rounds.map((x,j) => j===i ? {...x, dmg:val} : x);
                            setRounds(updated);
                            sessionStorage.setItem(`bb_rounds_${leagueCode}`, JSON.stringify(updated));
                          }}
                          style={{ ...S.input, width:"100%", padding:"7px 10px", fontFamily:"'DM Mono',monospace",
                            fontWeight:700, fontSize:16 }} />
                        <span style={{ color:"#445", fontSize:12, whiteSpace:"nowrap" }}>/ seed pt</span>
                      </div>
                      <div style={{ fontSize:11, color:"#2ecc71", marginTop:6 }}>
                        Seed 5 win = ${(5 * r.dmg * Math.max(owners.length-1,1)).toFixed(2)} total
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={()=>{
                  setRounds(DEFAULT_ROUNDS);
                  sessionStorage.removeItem(`bb_rounds_${leagueCode}`);
                  notify("Payouts reset to defaults.");
                }} style={{ ...S.btn("#1a2440","#6677aa"), border:"1px solid #2a3560", marginTop:12, fontSize:12 }}>
                  Reset to Defaults
                </button>
              </div>

              {/* Per-owner edit (shown once owners exist) */}
              {owners.length > 0 && (
                <div style={S.card}>
                  <SecTitle>Owners ({owners.length}/8)</SecTitle>
                  {owners.length < 8 && (
                    <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                      <input value={newOwnerName} onChange={e=>setNewOwnerName(e.target.value)}
                        placeholder="Add owner name…" style={{ ...S.input, flex:1 }}
                        onKeyDown={e=>e.key==="Enter"&&(adminUnlocked?addOwner():setModal("pin"))} />
                      <button onClick={()=>adminUnlocked?addOwner():setModal("pin")} style={S.btn()}>Add</button>
                    </div>
                  )}
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {owners.map(o=>(
                      <div key={o.id} style={{ display:"flex", alignItems:"center", gap:10,
                        background:"#0f1625", borderRadius:8, padding:"8px 12px", flexWrap:"wrap" }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:o.color }} />
                        <span style={{ fontWeight:600, flex:1 }}>{o.name}</span>
                        <span style={{ fontSize:12, color:"#445" }}>
                          Seeds: {o.teams.map(t=>t.seed).join(", ")}
                        </span>
                        <button onClick={()=>adminUnlocked?openTeamEditor(o):setModal("pin")} style={{
                          background:"#1a2440", border:"1px solid #2a3560",
                          borderRadius:6, color:"#f0c040", padding:"4px 12px",
                          cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit"
                        }}>✏️ Edit Teams</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      <Modal open={modal==="addWin"} onClose={()=>setModal(null)} title="Record a Win">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={S.label}>Owner</label>
            <select value={winOwnerId} onChange={e=>{setWinOwnerId(e.target.value);setWinTeamIdx("");}} style={S.input}>
              <option value="">— Select owner —</option>
              {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Round</label>
            <select value={winRoundId} onChange={e=>setWinRoundId(parseInt(e.target.value))} style={S.input}>
              {rounds.map(r=><option key={r.id} value={r.id}>{r.label} (${r.dmg} × seed)</option>)}
            </select>
          </div>
          {winOwnerId&&(
            <div>
              <label style={S.label}>Winning Team</label>
              <select value={winTeamIdx} onChange={e=>setWinTeamIdx(e.target.value)} style={S.input}>
                <option value="">— Select team —</option>
                {owners.find(o=>o.id===parseInt(winOwnerId))?.teams.map((t,i)=>(
                  <option key={i} value={i}>#{t.seed} {t.name}</option>
                ))}
              </select>
            </div>
          )}
          {winOwnerId&&winTeamIdx!==""&&(()=>{
            const owner=owners.find(o=>o.id===parseInt(winOwnerId));
            const team=owner?.teams[parseInt(winTeamIdx)];
            const round=rounds[winRoundId];
            const pp=team?team.seed*round.dmg:0;
            const tot=pp*(owners.length-1);
            return (
              <div style={{ background:"#0f1625", border:"1px solid #1a2440",
                borderRadius:10, padding:14, fontSize:13 }}>
                <div style={{ color:"#6677aa", marginBottom:8, fontWeight:600,
                  textTransform:"uppercase", fontSize:11, letterSpacing:1 }}>Payout Preview</div>
                <div>Seed <strong>#{team?.seed}</strong> × ${round.dmg} =
                  <strong style={{ color:"#f0c040" }}> ${pp.toFixed(2)}</strong>/owner</div>
                <div style={{ marginTop:4 }}>
                  {owner?.name} collects:{" "}
                  <strong style={{ color:"#2ecc71", fontSize:16 }}>${tot.toFixed(2)} total</strong>
                </div>
              </div>
            );
          })()}
          <button onClick={recordWin} style={{ ...S.btn(), width:"100%" }}>Record Win</button>
        </div>
      </Modal>

      {/* PIN Modal */}
      <Modal open={modal==="pin"} onClose={()=>{setModal(null);setPinInput("");setPinError("");}} title="🔒 Admin Access">
        <p style={{ color:"#6677aa", fontSize:13, marginBottom:16 }}>Enter your admin PIN to make changes.</p>
        <input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"){ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");setPinError("");notify("Admin unlocked ✓");}else{setPinError("Incorrect PIN.");}}}}
          placeholder="Enter PIN" style={{ ...S.input, letterSpacing:6, fontSize:20, textAlign:"center", marginBottom:8 }} autoFocus />
        {pinError && <div style={{ color:"#e74c3c", fontSize:12, marginBottom:8 }}>{pinError}</div>}
        <button onClick={()=>{ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");setPinError("");notify("Admin unlocked ✓");}else{setPinError("Incorrect PIN.");}}}
          style={{ ...S.btn(), width:"100%" }}>Unlock</button>
      </Modal>

      {/* Edit Teams Modal */}
      <Modal open={modal==="editTeams"} onClose={()=>setModal(null)} title={`Edit Teams — ${editingOwner?.name}`}>
        <div style={{ display:"flex", flexDirection:"column", gap:10, maxHeight:"60vh", overflowY:"auto", marginBottom:16 }}>
          {editTeams.map((team, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:"#6677aa", width:20, textAlign:"right", flexShrink:0 }}>#{i+1}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6, flex:1 }}>
                {/* Seed input */}
                <input
                  type="number"
                  min="1" max="16"
                  value={team.seed}
                  onChange={e => setEditTeams(prev => prev.map((t,j) => j===i ? {...t, seed: parseInt(e.target.value)||1} : t))}
                  style={{ ...S.input, width:54, padding:"8px 8px", textAlign:"center", flexShrink:0 }}
                />
                {/* Team name input */}
                <input
                  value={team.name}
                  onChange={e => setEditTeams(prev => prev.map((t,j) => j===i ? {...t, name: e.target.value} : t))}
                  placeholder={`Team ${i+1} name`}
                  style={{ ...S.input, flex:1, padding:"8px 12px" }}
                />
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#6677aa", marginBottom:12 }}>
          Left box = seed number (1–16) · Right box = team name
        </div>
        <button onClick={saveTeams} style={{ ...S.btn(), width:"100%" }}>💾 Save Teams</button>
      </Modal>

      <style>{`select option{background:#131929;} *{box-sizing:border-box;}`}</style>
    </div>
  );
}
