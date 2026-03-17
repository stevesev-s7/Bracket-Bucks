// v1773286522751
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
const _APP_BUILD = "1773204216116";

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


// ── 2026 NCAA Tournament Teams (editable each Selection Sunday) ──────────
const NCAA_2026_TEAMS = [
  // SOUTH REGION — No. 1 seed: Florida
  { seed:1,  name:"Florida",          region:"South" },  // vs 16
  { seed:16, name:"Prairie View A&M", region:"South" },
  { seed:8,  name:"Clemson",          region:"South" },  // vs 9
  { seed:9,  name:"Iowa",             region:"South" },
  { seed:5,  name:"Vanderbilt",       region:"South" },  // vs 12
  { seed:12, name:"McNeese",          region:"South" },
  { seed:4,  name:"Nebraska",         region:"South" },  // vs 13
  { seed:13, name:"Troy",             region:"South" },
  { seed:6,  name:"North Carolina",   region:"South" },  // vs 11
  { seed:11, name:"VCU",              region:"South" },
  { seed:3,  name:"Illinois",         region:"South" },  // vs 14
  { seed:14, name:"Penn",             region:"South" },
  { seed:7,  name:"Saint Mary's",     region:"South" },  // vs 10
  { seed:10, name:"Texas A&M",        region:"South" },
  { seed:2,  name:"Houston",          region:"South" },  // vs 15
  { seed:15, name:"Idaho",            region:"South" },
  // EAST REGION — No. 1 seed: Duke
  { seed:1,  name:"Duke",             region:"East" },   // vs 16
  { seed:16, name:"Siena",            region:"East" },
  { seed:8,  name:"Ohio State",       region:"East" },   // vs 9
  { seed:9,  name:"TCU",              region:"East" },
  { seed:5,  name:"St. John's",       region:"East" },   // vs 12
  { seed:12, name:"Northern Iowa",    region:"East" },
  { seed:4,  name:"Kansas",           region:"East" },   // vs 13
  { seed:13, name:"Cal Baptist",      region:"East" },
  { seed:6,  name:"Louisville",       region:"East" },   // vs 11
  { seed:11, name:"South Florida",    region:"East" },
  { seed:3,  name:"Michigan State",   region:"East" },   // vs 14
  { seed:14, name:"North Dakota St",  region:"East" },
  { seed:7,  name:"UCLA",             region:"East" },   // vs 10
  { seed:10, name:"UCF",              region:"East" },
  { seed:2,  name:"UConn",            region:"East" },   // vs 15
  { seed:15, name:"Furman",           region:"East" },
  // WEST REGION — No. 1 seed: Arizona
  { seed:1,  name:"Arizona",          region:"West" },   // vs 16
  { seed:16, name:"LIU",              region:"West" },
  { seed:8,  name:"Villanova",        region:"West" },   // vs 9
  { seed:9,  name:"Utah State",       region:"West" },
  { seed:5,  name:"Wisconsin",        region:"West" },   // vs 12
  { seed:12, name:"High Point",       region:"West" },
  { seed:4,  name:"Arkansas",         region:"West" },   // vs 13
  { seed:13, name:"Hawaii",           region:"West" },
  { seed:6,  name:"BYU",              region:"West" },   // vs 11
  { seed:11, name:"Texas",            region:"West" },
  { seed:3,  name:"Gonzaga",          region:"West" },   // vs 14
  { seed:14, name:"Kennesaw State",   region:"West" },
  { seed:7,  name:"Miami (FL)",       region:"West" },   // vs 10
  { seed:10, name:"Missouri",         region:"West" },
  { seed:2,  name:"Purdue",           region:"West" },   // vs 15
  { seed:15, name:"Queens",           region:"West" },
  // MIDWEST REGION — No. 1 seed: Michigan
  { seed:1,  name:"Michigan",         region:"Midwest" }, // vs 16
  { seed:16, name:"UMBC",             region:"Midwest" },
  { seed:8,  name:"Georgia",          region:"Midwest" }, // vs 9
  { seed:9,  name:"Saint Louis",      region:"Midwest" },
  { seed:5,  name:"Texas Tech",       region:"Midwest" }, // vs 12
  { seed:12, name:"Akron",            region:"Midwest" },
  { seed:4,  name:"Alabama",          region:"Midwest" }, // vs 13
  { seed:13, name:"Hofstra",          region:"Midwest" },
  { seed:6,  name:"Tennessee",        region:"Midwest" }, // vs 11
  { seed:11, name:"SMU",              region:"Midwest" },
  { seed:3,  name:"Virginia",         region:"Midwest" }, // vs 14
  { seed:14, name:"Wright State",     region:"Midwest" },
  { seed:7,  name:"Kentucky",         region:"Midwest" }, // vs 10
  { seed:10, name:"Santa Clara",      region:"Midwest" },
  { seed:2,  name:"Iowa State",       region:"Midwest" }, // vs 15
  { seed:15, name:"Tennessee State",  region:"Midwest" }
]

// ── 2025 NCAA Tournament Bracket Data ───────────────────────────────────
const BRACKET_2025 = {
  regions: [
    {
      name: "South", seed1: "Auburn",
      games: {
        r64: [
          {top:{seed:1,name:"Auburn",score:83},bot:{seed:16,name:"Alabama State",score:63},winner:"Auburn"},
          {top:{seed:8,name:"Louisville",score:75},bot:{seed:9,name:"Creighton",score:89},winner:"Creighton"},
          {top:{seed:5,name:"Michigan",score:68},bot:{seed:12,name:"UC San Diego",score:65},winner:"Michigan"},
          {top:{seed:4,name:"Texas A&M",score:80},bot:{seed:13,name:"Yale",score:71},winner:"Texas A&M"},
          {top:{seed:6,name:"Ole Miss",score:71},bot:{seed:11,name:"N Carolina",score:64},winner:"Ole Miss"},
          {top:{seed:3,name:"Iowa State",score:82},bot:{seed:14,name:"Lipscomb",score:55},winner:"Iowa State"},
          {top:{seed:7,name:"Marquette",score:66},bot:{seed:10,name:"New Mexico",score:75},winner:"New Mexico"},
          {top:{seed:2,name:"Michigan St",score:87},bot:{seed:15,name:"Bryant",score:62},winner:"Michigan St"},
        ],
        r32: [
          {top:{seed:1,name:"Auburn",score:82},bot:{seed:9,name:"Creighton",score:70},winner:"Auburn"},
          {top:{seed:5,name:"Michigan",score:91},bot:{seed:4,name:"Texas A&M",score:79},winner:"Michigan"},
          {top:{seed:6,name:"Ole Miss",score:91},bot:{seed:3,name:"Iowa State",score:78},winner:"Ole Miss"},
          {top:{seed:10,name:"New Mexico",score:63},bot:{seed:2,name:"Michigan St",score:71},winner:"Michigan St"},
        ],
        s16: [
          {top:{seed:1,name:"Auburn",score:78},bot:{seed:5,name:"Michigan",score:65},winner:"Auburn"},
          {top:{seed:6,name:"Ole Miss",score:70},bot:{seed:2,name:"Michigan St",score:73},winner:"Michigan St"},
        ],
        e8: [
          {top:{seed:1,name:"Auburn",score:70},bot:{seed:2,name:"Michigan St",score:64},winner:"Auburn"},
        ],
      }
    },
    {
      name: "East", seed1: "Duke",
      games: {
        r64: [
          {top:{seed:1,name:"Duke",score:93},bot:{seed:16,name:"Mount St Mary's",score:49},winner:"Duke"},
          {top:{seed:8,name:"Mississippi St",score:72},bot:{seed:9,name:"Baylor",score:75},winner:"Baylor"},
          {top:{seed:5,name:"Oregon",score:81},bot:{seed:12,name:"Liberty",score:52},winner:"Oregon"},
          {top:{seed:4,name:"Arizona",score:93},bot:{seed:13,name:"Akron",score:65},winner:"Arizona"},
          {top:{seed:6,name:"BYU",score:80},bot:{seed:11,name:"VCU",score:71},winner:"BYU"},
          {top:{seed:3,name:"Wisconsin",score:85},bot:{seed:14,name:"Montana",score:66},winner:"Wisconsin"},
          {top:{seed:7,name:"Saint Mary's",score:59},bot:{seed:10,name:"Vanderbilt",score:56},winner:"Saint Mary's"},
          {top:{seed:2,name:"Alabama",score:90},bot:{seed:15,name:"Robert Morris",score:81},winner:"Alabama"},
        ],
        r32: [
          {top:{seed:1,name:"Duke",score:89},bot:{seed:9,name:"Baylor",score:66},winner:"Duke"},
          {top:{seed:5,name:"Oregon",score:83},bot:{seed:4,name:"Arizona",score:87},winner:"Arizona"},
          {top:{seed:6,name:"BYU",score:91},bot:{seed:3,name:"Wisconsin",score:89},winner:"BYU"},
          {top:{seed:7,name:"Saint Mary's",score:66},bot:{seed:2,name:"Alabama",score:80},winner:"Alabama"},
        ],
        s16: [
          {top:{seed:1,name:"Duke",score:100},bot:{seed:4,name:"Arizona",score:93},winner:"Duke"},
          {top:{seed:6,name:"BYU",score:88},bot:{seed:2,name:"Alabama",score:113},winner:"Alabama"},
        ],
        e8: [
          {top:{seed:1,name:"Duke",score:85},bot:{seed:2,name:"Alabama",score:65},winner:"Duke"},
        ],
      }
    },
    {
      name: "Midwest", seed1: "Houston",
      games: {
        r64: [
          {top:{seed:1,name:"Houston",score:78},bot:{seed:16,name:"SIU Edwardsville",score:40},winner:"Houston"},
          {top:{seed:8,name:"Gonzaga",score:89},bot:{seed:9,name:"Georgia",score:68},winner:"Gonzaga"},
          {top:{seed:5,name:"Clemson",score:67},bot:{seed:12,name:"McNeese",score:69},winner:"McNeese"},
          {top:{seed:4,name:"Purdue",score:75},bot:{seed:13,name:"High Point",score:63},winner:"Purdue"},
          {top:{seed:6,name:"Illinois",score:86},bot:{seed:11,name:"Xavier",score:73},winner:"Illinois"},
          {top:{seed:3,name:"Kentucky",score:76},bot:{seed:14,name:"Troy",score:57},winner:"Kentucky"},
          {top:{seed:7,name:"UCLA",score:72},bot:{seed:10,name:"Utah St",score:47},winner:"UCLA"},
          {top:{seed:2,name:"Tennessee",score:77},bot:{seed:15,name:"Wofford",score:62},winner:"Tennessee"},
        ],
        r32: [
          {top:{seed:1,name:"Houston",score:81},bot:{seed:8,name:"Gonzaga",score:76},winner:"Houston"},
          {top:{seed:12,name:"McNeese",score:62},bot:{seed:4,name:"Purdue",score:76},winner:"Purdue"},
          {top:{seed:6,name:"Illinois",score:75},bot:{seed:3,name:"Kentucky",score:84},winner:"Kentucky"},
          {top:{seed:7,name:"UCLA",score:58},bot:{seed:2,name:"Tennessee",score:67},winner:"Tennessee"},
        ],
        s16: [
          {top:{seed:1,name:"Houston",score:62},bot:{seed:4,name:"Purdue",score:60},winner:"Houston"},
          {top:{seed:3,name:"Kentucky",score:65},bot:{seed:2,name:"Tennessee",score:78},winner:"Tennessee"},
        ],
        e8: [
          {top:{seed:1,name:"Houston",score:69},bot:{seed:2,name:"Tennessee",score:50},winner:"Houston"},
        ],
      }
    },
    {
      name: "West", seed1: "Florida",
      games: {
        r64: [
          {top:{seed:1,name:"Florida",score:95},bot:{seed:16,name:"Norfolk St",score:69},winner:"Florida"},
          {top:{seed:8,name:"UConn",score:67},bot:{seed:9,name:"Oklahoma",score:59},winner:"UConn"},
          {top:{seed:5,name:"Memphis",score:70},bot:{seed:12,name:"Colorado St",score:78},winner:"Colorado St"},
          {top:{seed:4,name:"Maryland",score:81},bot:{seed:13,name:"Grand Canyon",score:49},winner:"Maryland"},
          {top:{seed:6,name:"Missouri",score:57},bot:{seed:11,name:"Drake",score:67},winner:"Drake"},
          {top:{seed:3,name:"Texas Tech",score:82},bot:{seed:14,name:"UNCW",score:72},winner:"Texas Tech"},
          {top:{seed:7,name:"Kansas",score:72},bot:{seed:10,name:"Arkansas",score:79},winner:"Arkansas"},
          {top:{seed:2,name:"St John's",score:83},bot:{seed:15,name:"Omaha",score:53},winner:"St John's"},
        ],
        r32: [
          {top:{seed:1,name:"Florida",score:77},bot:{seed:8,name:"UConn",score:75},winner:"Florida"},
          {top:{seed:12,name:"Colorado St",score:71},bot:{seed:4,name:"Maryland",score:72},winner:"Maryland"},
          {top:{seed:11,name:"Drake",score:64},bot:{seed:3,name:"Texas Tech",score:77},winner:"Texas Tech"},
          {top:{seed:10,name:"Arkansas",score:75},bot:{seed:2,name:"St John's",score:66},winner:"Arkansas"},
        ],
        s16: [
          {top:{seed:1,name:"Florida",score:77},bot:{seed:4,name:"Maryland",score:62},winner:"Florida"},
          {top:{seed:3,name:"Texas Tech",score:85},bot:{seed:10,name:"Arkansas",score:83},winner:"Texas Tech"},
        ],
        e8: [
          {top:{seed:1,name:"Florida",score:84},bot:{seed:3,name:"Texas Tech",score:79},winner:"Florida"},
        ],
      }
    },
  ],
  finalFour: [
    {top:{seed:1,name:"Auburn",region:"South",score:67},bot:{seed:1,name:"Florida",region:"West",score:79},winner:"Florida"},
    {top:{seed:1,name:"Houston",region:"Midwest",score:65},bot:{seed:1,name:"Duke",region:"East",score:64},winner:"Houston"},
  ],
  championship: {top:{seed:1,name:"Florida",score:65},bot:{seed:1,name:"Houston",score:63},winner:"Florida"},
};

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

// ── Draft Countdown Banner (live ticking) ──────────────────────────────
function DraftCountdownBanner({ secondsLeft }) {
  const [secs, setSecs] = React.useState(secondsLeft);
  // Handle Venmo redirect back after payment

  React.useEffect(() => {
    setSecs(secondsLeft);
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, background:"#1a2440",
      border:"1px solid #2a3560", borderRadius:8, padding:"6px 12px", fontSize:13 }}>
      <span style={{ color:"#6677aa" }}>Starts in:</span>
      <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:800, color:"#f0c040", fontSize:15 }}>
        {parts.join(" ")}
      </span>
    </div>
  );
}


// ── Main App ─────────────────────────────────────────────────────────────────

// ── 2026 Bracket Tab Component ─────────────────────────────────────────────
function Bracket2026Tab({ owners }) {
  const [games, setGames] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const [activeRegion, setActiveRegion] = React.useState("All");

  const REGION_COLORS = { South:"#e74c3c", East:"#3498db", West:"#2ecc71", Midwest:"#f39c12" };

  const load = () => {
    fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=20260317-20260407")
      .then(r => r.json())
      .then(d => {
        const mapped = (d.events||[]).map(ev => {
          const comp = ev.competitions[0];
          const teams = comp.competitors.map(c => ({
            name: c.team.displayName,
            abbr: c.team.abbreviation,
            seed: c.curatedRank?.current || null,
            score: c.score,
            winner: c.winner,
            logo: c.team.logo,
          }));
          const note = comp.notes?.[0]?.headline || "";
          // Parse region from note
          let region = "Unknown";
          ["South","East","West","Midwest"].forEach(r => { if(note.includes(r)) region=r; });
          let round = "First Round";
          if(note.includes("First Four")) round="First Four";
          else if(note.includes("1st Round")) round="First Round";
          else if(note.includes("2nd Round")) round="Second Round";
          else if(note.includes("Sweet 16")||note.includes("Sweet 16")) round="Sweet 16";
          else if(note.includes("Elite 8")||note.includes("Elite Eight")||note.includes("Regional")) round="Elite Eight";
          else if(note.includes("Final Four")) round="Final Four";
          else if(note.includes("National Championship")||note.includes("Championship")) round="Championship";
          return {
            id: ev.id,
            name: ev.name,
            date: ev.date,
            status: comp.status?.type?.description || "Scheduled",
            statusDetail: comp.status?.type?.detail || "",
            completed: comp.status?.type?.completed || false,
            venue: comp.venue?.fullName || "",
            broadcast: comp.broadcasts?.[0]?.names?.[0] || "",
            teams,
            region,
            round,
            note,
          };
        });
        setGames(mapped);
        setLoading(false);
        setLastUpdated(new Date());
      })
      .catch(e => { setError("Failed to load bracket data"); setLoading(false); });
  };
  React.useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const findOwner = (teamName) => {
    if (!owners||!teamName) return null;
    for (const o of owners) {
      if ((o.teams||[]).some(t => (t.name||"").toLowerCase() === teamName.toLowerCase())) return o;
    }
    return null;
  };

  const regions = ["All","South","East","West","Midwest"];
  const rounds = ["First Four","First Round","Second Round","Sweet 16","Elite Eight","Final Four","Championship"];

  const filteredGames = activeRegion==="All" ? games : games.filter(g=>g.region===activeRegion);
  const grouped = {};
  rounds.forEach(r => {
    const rg = filteredGames.filter(g=>g.round===r);
    if(rg.length>0) grouped[r]=rg;
  });

  if(loading) return (
    <div style={{textAlign:"center",padding:60,color:"#6677aa"}}>
      <div style={{fontSize:32,marginBottom:12}}>🏀</div>
      <div>Loading 2026 bracket data...</div>
    </div>
  );
  if(error) return <div style={{color:"#e74c3c",padding:20}}>{error}</div>;

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{margin:"0 0 4px",fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:1}}>2026 NCAA Tournament Bracket</h2>
        <p style={{color:"#6677aa",fontSize:13,margin:0}}>Live data via ESPN · {games.length} games{lastUpdated?" · Updated "+lastUpdated.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+" 🔄":""}</p>
      </div>

      {/* Region filter */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {regions.map(r=>(
          <button key={r} onClick={()=>setActiveRegion(r)}
            style={{padding:"6px 16px",borderRadius:20,border:"1px solid "+(r==="All"?"#d4af37":REGION_COLORS[r]||"#445"),
              background:activeRegion===r?(r==="All"?"#d4af37":REGION_COLORS[r]||"#445"):"transparent",
              color:activeRegion===r?"#111":"#dce4f5",cursor:"pointer",fontSize:13,fontWeight:600}}>
            {r}
          </button>
        ))}
      </div>

      {/* Games by round */}
      {rounds.map(round => {
        const rGames = grouped[round];
        if (!rGames) return null;
        return (
          <div key={round} style={{marginBottom:28}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2,
              color:"#d4af37",marginBottom:10,paddingBottom:4,borderBottom:"1px solid #1e2d4a"}}>
              {round}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {rGames.map(game => {
                const [t1,t2]=game.teams;
                const rc=REGION_COLORS[game.region]||"#445";
                const isTBD=game.statusDetail&&game.statusDetail.includes("TBD");
                const dateStr=isTBD?"TBD":game.date?new Date(game.date).toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}):"TBD";
                return (
                  <div key={game.id} style={{background:"#0d1528",border:"1px solid #1e2d4a",borderRadius:10,padding:"12px 16px",
                    borderLeft:"3px solid "+rc}}>
                    {/* Header row */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{background:rc+"22",color:rc,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,border:"1px solid "+rc+"44"}}>
                          {game.region!=="Unknown"?game.region:""}
                        </span>
                        {game.broadcast&&<span style={{color:"#6677aa",fontSize:11}}>📺 {game.broadcast}</span>}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:game.completed?"#2ecc71":game.status==="In Progress"?"#f39c12":"#6677aa",fontSize:11}}>
                          {game.completed?"Final":game.status==="In Progress"?"🔴 LIVE":dateStr}
                        </span>
                      </div>
                    </div>
                    {/* Teams */}
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {[t1,t2].filter(Boolean).map((team,ti)=>{
                        const owner=findOwner(team.name);
                        return (
                          <div key={ti} style={{display:"flex",alignItems:"center",gap:10,
                            background:team.winner?"#0d2a1a":game.completed&&!team.winner?"#1a0d0d":"transparent",
                            borderRadius:6,padding:"6px 8px",transition:"background 0.2s"}}>
                            {team.seed&&<span style={{minWidth:22,height:22,borderRadius:5,background:"#1e2d4a",
                              display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:11,fontWeight:800,color:"#d4af37"}}>{team.seed}</span>}
                            {team.logo&&<img src={team.logo} alt="" style={{width:22,height:22,objectFit:"contain"}}/>}
                            <span style={{flex:1,fontSize:14,fontWeight:600,
                              color:team.winner?"#2ecc71":game.completed&&!team.winner?"#556":"#dce4f5"}}>
                              {team.name}
                            </span>
                            {owner&&<span style={{fontSize:11,color:owner.color||"#d4af37",
                              background:(owner.color||"#d4af37")+"22",padding:"1px 8px",borderRadius:10,
                              border:"1px solid "+(owner.color||"#d4af37")+"44"}}>
                              {owner.name}
                            </span>}
                            {game.completed&&<span style={{fontSize:15,fontWeight:800,minWidth:24,textAlign:"right",
                              color:team.winner?"#2ecc71":"#556"}}>
                              {team.score}
                            </span>}
                          </div>
                        );
                      })}
                    </div>
                    {/* Venue */}
                    {game.venue&&<div style={{marginTop:6,fontSize:11,color:"#445"}}>📍 {game.venue}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ── Payment Approvals Component ─────────────────────────────────────────────
function PaymentApprovals({ supabase }) {
  const [payments, setPayments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    setPayments(data || []);
    setLoading(false);
  }, [supabase]);

  React.useEffect(() => { load(); }, [load]);

  const approve = async (id, email) => {
    await supabase.from("payments").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "approved" } : p));
    alert("Approved! " + email + " can now create a league.");
  };

  const deny = async (id) => {
    await supabase.from("payments").delete().eq("id", id);
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const pending = payments.filter(p => p.status === "pending");
  const approved = payments.filter(p => p.status === "approved");

  return (
    <div style={{background:"#0d1528",border:"1px solid #1e2d4a",borderRadius:10,padding:"20px 24px",marginBottom:20}}>
      <div style={{color:"#d4af37",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,marginBottom:12}}>
        💳 PAYMENT APPROVALS
        <span style={{fontSize:12,fontWeight:400,color:"#6677aa",marginLeft:10,fontFamily:"inherit",letterSpacing:0}}>
          Venmo @bracket-bucks-app
        </span>
      </div>
      {loading ? <div style={{color:"#445",fontSize:13}}>Loading...</div> : (
        <>
          {pending.length === 0 && <div style={{color:"#445",fontSize:13,marginBottom:8}}>No pending payments.</div>}
          {pending.map(p => (
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#131929",borderRadius:8,padding:"10px 14px",marginBottom:8,border:"1px solid #f39c1244"}}>
              <div>
                <div style={{color:"#f39c12",fontWeight:600,fontSize:14}}>{p.email}</div>
                <div style={{color:"#3498db",fontSize:12,marginTop:1}}>Venmo: {p.venmo_username||"(not provided)"}</div>
                <div style={{color:"#445",fontSize:11,marginTop:2}}>{new Date(p.created_at).toLocaleString()}</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>approve(p.id,p.email)} style={{background:"#27ae60",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  ✓ Approve
                </button>
                <button onClick={()=>deny(p.id)} style={{background:"#c0392b",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  ✗ Deny
                </button>
              </div>
            </div>
          ))}
          {approved.length > 0 && (
            <div style={{marginTop:12}}>
              <div style={{fontSize:11,color:"#445",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Recently Approved</div>
              {approved.slice(0,5).map(p => (
                <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0a2a14",borderRadius:8,padding:"8px 14px",marginBottom:6,border:"1px solid #27ae6033"}}>
                  <div style={{color:"#2ecc71",fontSize:13}}>{p.email}</div>
                  <div style={{color:"#27ae60",fontSize:11}}>✓ Approved</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

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
  const [paymentConfirmed, setPaymentConfirmed]   = useState(false);
  const [venmoLoading, setVenmoLoading]         = useState(false);
  const [paymentStep, setPaymentStep] = useState('instructions');
  const [venmoVerifyError, setVenmoVerifyError] = useState('');
  const [venmoUsername, setVenmoUsername] = useState('');
  const [joinCode, setJoinCode]           = useState("");
  const [joinErr, setJoinErr]             = useState("");
  const [newOwnerName, setNewOwnerName]   = useState("");
  const [winOwnerId, setWinOwnerId]       = useState("");
  const [winRoundId, setWinRoundId]       = useState(0);
  const [winTeamIdx, setWinTeamIdx]       = useState("");

  // Team editor
  const [editingOwner, setEditingOwner]   = useState(null);
  const [editTeams, setEditTeams]         = useState([]);
  const [editingOwnerNameId, setEditingOwnerNameId] = useState(null);
  const [editOwnerNameVal, setEditOwnerNameVal]     = useState("");

  // Setup wizard
  const BLANK_ROSTER = () => Array.from({length:8}, (_,i) => ({ seed: i+1, name: "" }));
  const [setupOwners, setSetupOwners] = useState(() => Array.from({length:8}, (_,i) => ({ name:"", color:OWNER_COLORS[i%8], teams:Array.from({length:8},(_,j)=>({seed:j+1,name:""})) })));
  const [setupStep, setSetupStep]     = useState(0);

  // Admin mode
  const ADMIN_PASSWORD = "chi2025admin"; // Change this to your desired password
  const [isAdmin, setIsAdmin]           = useState(() => sessionStorage.getItem("bb_is_admin") === "true");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminPassError, setAdminPassError] = useState("");

  // Auth state
  const [authUser, setAuthUser]         = useState(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [authView, setAuthView]         = useState("signin"); // "signin" | "signup"
  const [authEmail, setAuthEmail]       = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName]         = useState("");
  const [authError, setAuthError]       = useState("");
  const [authWorking, setAuthWorking]   = useState(false);

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

  function removeFromMyLeagues(code) {
    setMyLeagues(prev => {
      const updated = prev.filter(l => l.code !== code);
      localStorage.setItem("bb_my_leagues", JSON.stringify(updated));
      return updated;
    });
  }

  // Validate stored leagues against DB - remove any that no longer exist
  useEffect(() => {
    if (myLeagues.length === 0) return;
    const codes = myLeagues.map(l => l.code);
    supabase.from("leagues").select("code").in("code", codes)
      .then(({ data }) => {
        if (!data) return;
        const existing = new Set(data.map(l => l.code));
        const valid = myLeagues.filter(l => existing.has(l.code));
        if (valid.length !== myLeagues.length) {
          setMyLeagues(valid);
          localStorage.setItem("bb_my_leagues", JSON.stringify(valid));
        }
      });
  }, []);

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

  // Bracket
  const [bracketData, setBracketData]     = useState(null);
  const [bracketStatus, setBracketStatus] = useState("idle");

  // Draft state
  const [draftScheduled, setDraftScheduled] = useState(null); // ISO string from league.draft_start
  const [tick, setTick] = useState(0);
  const [draftStartInput, setDraftStartInput] = useState("");
  const [draftCountdown, setDraftCountdown] = useState(null); // seconds until draft starts
  const [pickTimer, setPickTimer]         = useState(15);    // seconds left for current pick
  const [draftLive, setDraftLive]         = useState(false);

  function alert(msg, type="success") {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3200);
  }

  // ── Auth init ────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
      if (session?.user) autoLoadUserLeague(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) autoLoadUserLeague(session.user);
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line
  }, []);

  async function autoLoadUserLeague(user) {
    // Load user's leagues from their metadata
    const userLeagues = user.user_metadata?.leagues || [];
    setMyLeagues(userLeagues);
    // Auto-load last visited league for this user
    const saved = localStorage.getItem(`bb_league_${user.id}`);
    if (saved) loadLeague(saved);
  }

  async function handleSignUp() {
    if (!authEmail || !authPassword || !authName) { setAuthError("Please fill in all fields."); return; }
    if (authPassword.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    setAuthWorking(true); setAuthError("");
    const { error } = await supabase.auth.signUp({
      email: authEmail, password: authPassword,
      options: { data: { name: authName, leagues: [] } }
    });
    if (error) { setAuthError(error.message); setAuthWorking(false); }
    else { setAuthError(""); setAuthWorking(false); setAuthView("signin");
      setAuthError("Account created! Please sign in."); }
  }

  async function handleSignIn() {
    if (!authEmail || !authPassword) { setAuthError("Please enter email and password."); return; }
    setAuthWorking(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) { setAuthError(error.message); setAuthWorking(false); }
    else { setAuthWorking(false); }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setLeagueCode(null); setLeague(null); setOwners([]); setWins([]);
    setMyLeagues([]);
  }

  async function saveLeagueToUser(code, name) {
    if (!authUser) return;
    const existing = authUser.user_metadata?.leagues || [];
    const alreadyIn = existing.find(l => l.code === code);
    const updated = alreadyIn
      ? existing.map(l => l.code === code ? { ...l, name } : l)
      : [...existing, { code, name, createdAt: Date.now() }];
    await supabase.auth.updateUser({ data: { leagues: updated } });
    setMyLeagues(updated);
    // Remember last league for this user
    localStorage.setItem(`bb_league_${authUser.id}`, code);
  }

  // ── Load league from Supabase ────────────────────────────────────────────
  const loadLeague = useCallback(async (code) => {
    setLoading(true);
    try {
      // Load league info
      const { data: lg, error: lgErr } = await supabase
        .from("leagues").select("*").eq("code", code).single();
      if (lgErr || !lg) { alert("League not found."); setLoading(false); return false; }

      // Load owners
      const { data: ownersData } = await supabase
        .from("owners").select("*").eq("league_code", code).order("num");

      // Load wins
      const { data: winsData } = await supabase
        .from("wins").select("*").eq("league_code", code);

      setLeague(lg);
      if (lg && lg.draft_start) setDraftScheduled(lg.draft_start);
      setOwners(ownersData || []);
      setWins(winsData || []);
      setLeagueCode(code);
      sessionStorage.setItem("bb_league_code", code);
    if (authUser) localStorage.setItem(`bb_league_${authUser.id}`, code);
      // Load per-league round settings if stored
      const savedRounds = sessionStorage.getItem(`bb_rounds_${code}`);
      if (savedRounds) setRounds(JSON.parse(savedRounds));
      else setRounds(DEFAULT_ROUNDS);
      setLoading(false);
      return true;
    } catch {
      alert("Failed to load league.");
      setLoading(false);
      return false;
    }
  }, []);


  // ── Draft pick timer + auto-pick ────────────────────────────────────
  useEffect(() => {
    const t = null; // disabled: setInterval(() => setTick(n => (n+1) % 1000), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return; // auto-pick timer disabled
    // Only run after admin clicks Start Draft
    if (!league?.pick_timer_start || !leagueCode) return;
    const pickTimerStart = new Date(league.pick_timer_start);

    const tick = setInterval(async () => {
      const now = new Date();
      const elapsed = Math.floor((now - pickTimerStart) / 1000);
      const timeLeft = 30 - elapsed;

      if (timeLeft <= 0) {
        // Auto-pick: fetch fresh data to avoid stale closure
        const { data: latestOwners } = await supabase.from("owners").select("*").eq("league_code", leagueCode).order("num");
        const ownersArr = latestOwners || [];
        const picked = ownersArr.flatMap(o => o.teams.map(t => t.name?.toLowerCase().trim()).filter(Boolean));
        const avail = NCAA_2026_TEAMS.filter(t => !picked.includes(t.name.toLowerCase().trim()));
        if (!avail.length) { clearInterval(tick); return; }

        const totalPks = ownersArr.reduce((sum, o) => sum + o.teams.filter(t => t.name && t.name.trim()).length, 0);
        const nOwners = ownersArr.length;
        if (totalPks >= nOwners * 8) { clearInterval(tick); return; }

        const rd = Math.floor(totalPks / Math.max(nOwners, 1));
        const pos = totalPks % Math.max(nOwners, 1);
        const sorted = [...ownersArr].sort((a, b) => a.num - b.num);
        const pickerIdx = rd % 2 === 0 ? pos : (nOwners - 1 - pos);
        const picker = sorted[pickerIdx];
        if (!picker) return;

        const best = [...avail].sort((a, b) => (a.seed || 99) - (b.seed || 99))[0];
        const updatedTeams = [...picker.teams];
        const emptyIdx = updatedTeams.findIndex(t => !t.name || !t.name.trim());
        if (emptyIdx === -1) return;
        updatedTeams[emptyIdx] = { seed: best.seed, name: best.name };
        await supabase.from("owners").update({ teams: updatedTeams }).eq("id", picker.id);
        await supabase.from("leagues").update({ pick_timer_start: new Date().toISOString() }).eq("code", leagueCode);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [league?.pick_timer_start, leagueCode]);


  // ── Real-time subscription ───────────────────────────────────────────────
  useEffect(() => {
    if (!leagueCode) return;
    const channel = supabase.channel(`league_${leagueCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "wins", filter: `league_code=eq.${leagueCode}` },
        () => supabase.from("wins").select("*").eq("league_code", leagueCode).then(({ data }) => data && setWins(data)))
      .on("postgres_changes", { event: "*", schema: "public", table: "owners", filter: `league_code=eq.${leagueCode}` },
        () => supabase.from("owners").select("*").eq("league_code", leagueCode).order("num").then(({ data }) => data && setOwners(data)))
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "leagues", filter: `code=eq.${leagueCode}` },
        ({ new: updated }) => updated && setLeague(updated))
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [leagueCode]);

  // ── League ops ───────────────────────────────────────────────────────────
  async function autoAddUserAsOwner(code) {
    if (!authUser) return;
    const userName = authUser.user_metadata?.name || authUser.email;
    const { data: existingOwners } = await supabase
      .from("owners").select("name").eq("league_code", code);
    const alreadyOwner = existingOwners?.some(o =>
      o.name.toLowerCase().trim() === userName.toLowerCase().trim()
    );
    if (!alreadyOwner) {
      const color = OWNER_COLORS[(existingOwners?.length || 0) % OWNER_COLORS.length];
      const num = (existingOwners?.length || 0) + 1;
      const blankTeams = Array.from({length:8}, (_,i) => ({ seed: i+1, name: "" }));
      await supabase.from("owners").insert({
        league_code: code, name: userName, color, num, teams: blankTeams
      });
    }
  }

  async function createLeague() {
    if (!newLeagueName.trim()) return;
    const code = genCode();
    setLoading(true);

    const { error } = await supabase.from("leagues").insert({ code, name: newLeagueName.trim(), draft_start: null });
    if (error) { alert("Failed to create league."); setLoading(false); return; }

    const ok = await loadLeague(code);
    if (ok) {
      await autoAddUserAsOwner(code);
      saveToMyLeagues(code, newLeagueName.trim());
      saveLeagueToUser(code, newLeagueName.trim());
      setNewLeagueName("");
      setModal(null);
      alert(`League created! Invite code: ${code}`);
    }
  }

  async function deleteLeague(code) {
    if (!window.confirm("Delete league " + code + "? This cannot be undone.")) return;
    await supabase.from("owners").delete().eq("league_code", code);
    await supabase.from("wins").delete().eq("league_code", code);
    const { error } = await supabase.from("leagues").delete().eq("code", code);
    if (error) { alert("Delete failed: " + error.message); return; }
    alert("League " + code + " deleted!");
    removeFromMyLeagues(code);
    // Also clear bb_league_<userId> keys pointing to this league
    Object.keys(localStorage).forEach(function(k){
      if(k.startsWith("bb_league_") && localStorage.getItem(k)===code) localStorage.removeItem(k);
    });
    window.location.reload();
  }

  async function joinLeague() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const ok = await loadLeague(code);
    if (ok) {
      saveLeagueToUser(code, league?.name || code);

      // Auto-add the user as an owner if they're not already in the league
      await autoAddUserAsOwner(code);
      alert(`Joined league: ${league?.name || code}`);

      setJoinCode(""); setJoinErr("");
      setModal(null);
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
    if (owners.length >= 8) { alert("Max 8 owners per league."); return; }
    const color = OWNER_COLORS[owners.length % OWNER_COLORS.length];
    const defaultTeams = Array.from({length:8}, (_,i)=>({ seed:i+1, name:`Team ${i+1}` }));
    const { error } = await supabase.from("owners").insert({
      league_code: leagueCode, name: newOwnerName.trim(),
      color, num: owners.length + 1, teams: defaultTeams,
    });
    if (error) { alert("Failed to add owner."); return; }
    setNewOwnerName("");
    alert(`${newOwnerName.trim()} added!`);
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
      alert(error.code === "23505" ? "Win already recorded." : "Failed to record win.", "error");
      return;
    }
    const owner = owners.find(o=>o.id===parseInt(winOwnerId));
    const team = owner?.teams[parseInt(winTeamIdx)];
    alert(`✓ ${team?.name} win recorded for ${owner?.name}`);
    setWinTeamIdx("");
    setModal(null);
  }

  // ── Remove win ───────────────────────────────────────────────────────────
  async function removeWin(winId) {
    const { error } = await supabase.from("wins").delete().eq("id", winId);
    if (error) alert("Failed to remove win.");
    else alert("Win removed.");
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
    if (error) { alert("Failed to save teams."); return; }
    setOwners(prev => prev.map(o => o.id === editingOwner.id ? { ...o, teams: editTeams } : o));
    setModal(null);
    setEditingOwner(null);
    alert(`${editingOwner.name}'s teams updated!`);
  }

  // ── Bracket ──────────────────────────────────────────────────────────────
  async function fetchBracket() {
    setBracketStatus("loading");
    try {
      const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const games = (data.events || []).map(e => {
        const comp = e.competitions?.[0];
        const teams = (comp?.competitors || []).map(c => ({
          name: c.team?.shortDisplayName || c.team?.displayName || "TBD",
          fullName: c.team?.displayName || "",
          seed: c.curatedRank?.current || null,
          score: c.score || "0",
          winner: c.winner || false,
          logo: c.team?.logo || null,
        }));
        return {
          id: e.id,
          name: e.name,
          status: e.status?.type?.description || "—",
          isLive: e.status?.type?.state === "in",
          isFinal: e.status?.type?.completed || false,
          period: e.status?.displayClock || "",
          teams,
          round: comp?.series?.title || e.season?.slug || "",
          date: e.date,
          venue: comp?.venue?.fullName || "",
        };
      });
      // Group by round name
      const byRound = {};
      games.forEach(g => {
        const r = g.round || "Other";
        if (!byRound[r]) byRound[r] = [];
        byRound[r].push(g);
      });
      setBracketData(byRound);
      setBracketStatus("success");
    } catch { setBracketStatus("error"); }
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
    {id:"espn",        icon:"📡", label:"Live Scores"},
    {id:"roster",      icon:"👥", label:"Rosters"},
    {id:"payouts",     icon:"💰", label:"Payout Table"},
    {id:"bracket2025", icon:"🏆", label:"2025 Bracket"},
    {id:"bracket2026", icon:"🗓️", label:"2026 Bracket"},
    {id:"draft",       icon:"🎯", label:"Draft"},
    {id:"profile",     icon:"👤", label:"My Profile"},
    {id:"admin",       icon:"⚙️",  label:"Admin"},
  ];

  // ── Auth screen ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0c1120", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <FontLink />
        <div style={{ color:"#6677aa", fontSize:16 }}>Loading…</div>
      </div>
    );
  }

  if (!authUser) {
    const isSignUp = authView === "signup";
    return (
      <div style={{ minHeight:"100vh", background:"#0c1120", fontFamily:"'DM Sans',sans-serif",
        color:"#dce4f5", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <FontLink />
        <div style={{ maxWidth:420, width:"100%", padding:24 }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🏀</div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:44, letterSpacing:4,
              color:"#f0c040", margin:0, textShadow:"0 0 30px rgba(240,192,64,0.4)" }}>
              BRACKET BUCKS
            </h1>
            <p style={{ color:"#6677aa", marginTop:8, fontSize:14 }}>March Madness Upset Pool Tracker</p>
          </div>

          {/* Auth card */}
          <div style={{ background:"#131929", border:"1px solid #1e2840", borderRadius:18, padding:28 }}>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:2,
              color:"#f0c040", margin:"0 0 20px" }}>
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            {isSignUp && (
              <div style={{ marginBottom:14 }}>
                <label style={S.label}>Your Name</label>
                <input value={authName} onChange={e=>setAuthName(e.target.value)}
                  placeholder="e.g. Joe Smith" style={S.input}
                  onKeyDown={e=>e.key==="Enter"&&handleSignUp()} />
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Email</label>
              <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}
                placeholder="you@email.com" style={S.input}
                onKeyDown={e=>e.key==="Enter"&&(isSignUp?handleSignUp():handleSignIn())} />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={S.label}>Password</label>
              <input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)}
                placeholder={isSignUp?"At least 6 characters":"••••••••"} style={S.input}
                onKeyDown={e=>e.key==="Enter"&&(isSignUp?handleSignUp():handleSignIn())} />
            </div>

            {authError && (
              <div style={{ fontSize:13, marginBottom:14, padding:"10px 14px", borderRadius:8,
                background: authError.includes("created") ? "#0a2a14" : "#2a1418",
                color: authError.includes("created") ? "#2ecc71" : "#e74c3c",
                border: `1px solid ${authError.includes("created") ? "#27ae60" : "#e74c3c"}` }}>
                {authError}
              </div>
            )}

            <button onClick={isSignUp ? handleSignUp : handleSignIn}
              disabled={authWorking}
              style={{ ...S.btn(), width:"100%", padding:"13px", fontSize:15, borderRadius:10,
                opacity: authWorking ? 0.7 : 1 }}>
              {authWorking ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
            </button>

            <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:"#6677aa" }}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button onClick={()=>{ setAuthView(isSignUp?"signin":"signup"); setAuthError(""); }}
                style={{ background:"none", border:"none", color:"#f0c040", cursor:"pointer",
                  fontSize:13, fontWeight:600, fontFamily:"inherit" }}>
                {isSignUp ? "Sign In" : "Create one"}
              </button>
            </div>
          </div>

          <div style={{ textAlign:"center", marginTop:16, display:"flex", justifyContent:"center", gap:20, alignItems:"center" }}>
            <button onClick={()=>setModal("howToPlay")} style={{
              background:"none", border:"none", color:"#6677aa",
              fontSize:12, cursor:"pointer", textDecoration:"underline", fontFamily:"inherit"
            }}>❓ How to Play</button>
            <button onClick={()=>setModal("adminLogin")} style={{
              background:"none", border:"none", color:"#2a3560",
              fontSize:11, cursor:"pointer", textDecoration:"underline", fontFamily:"inherit"
            }}>Admin Login</button>
          </div>
        </div>

        {/* How to Play modal */}
        <Modal open={modal==="howToPlay"} onClose={()=>setModal(null)} title="How to Play">
          <div style={{fontSize:13,color:"#aab",lineHeight:1.8,maxHeight:"72vh",overflowY:"auto",paddingRight:4}}>
            <p style={{margin:"0 0 14px",color:"#dce4f5",fontSize:15,fontWeight:600}}>Welcome to Bracket Bucks - the March Madness Upset Pool!</p>
            <div style={{background:"#0f1625",border:"1px solid #1e2840",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:700,color:"#f0c040",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>OVERVIEW</div>
              <p style={{margin:"0 0 8px"}}>Bracket Bucks is a <strong style={{color:"#fff"}}>snake draft pool</strong> where each player drafts <strong style={{color:"#f0c040"}}>8 NCAA tournament teams</strong>. Every time your team wins, the other owners pay you based on the seed and round.</p>
              <p style={{margin:0}}>Higher seed = bigger upset = more money. A 16-seed run is worth a fortune!</p>
            </div>
            <div style={{background:"#0f1625",border:"1px solid #1e2840",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:700,color:"#f0c040",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>HOW THE DRAFT WORKS</div>
              <p style={{margin:"0 0 8px"}}>The admin sets a draft time. When it arrives, the <strong style={{color:"#fff"}}>snake draft</strong> begins. Owner 1 picks first in Round 1, then the order reverses each round.</p>
              <p style={{margin:"0 0 6px"}}>Each owner picks <strong style={{color:"#f0c040"}}>8 teams</strong> total. You have <strong style={{color:"#f0c040"}}>30 seconds</strong> per pick. Time up means the best available team is auto-selected.</p>
              <p style={{margin:0}}>The admin can shuffle the draft order randomly before the draft begins.</p>
            </div>
            <div style={{background:"#0f1625",border:"1px solid #1e2840",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:700,color:"#f0c040",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>FIRST FOUR PLAY-IN GAMES</div>
              <p style={{margin:0}}>Four teams play in the <strong style={{color:"#fff"}}>First Four</strong> before the main bracket. They appear as a pair in the draft list (e.g. SMU / 11 Miami OH) until a winner is decided. If your team wins the play-in, they advance and keep earning wins.</p>
            </div>
            <div style={{background:"#0f1625",border:"1px solid #1e2840",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:700,color:"#f0c040",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>HOW PAYOUTS WORK</div>
              <p style={{margin:"0 0 10px"}}>Each time your team wins, every other owner pays you: <strong style={{color:"#2ecc71"}}>Seed # x Round Multiplier = $ per player</strong></p>
              {DEFAULT_ROUNDS.map(function(rnd){return (
                <div key={rnd.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1a2440",fontSize:13}}>
                  <span style={{color:"#dce4f5"}}>{rnd.label}</span>
                  <span style={{color:"#f0c040"}}>${rnd.dmg.toFixed(2)} x seed</span>
                </div>
              );})}
            </div>
            <div style={{background:"#0f1625",border:"1px solid #1e2840",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:700,color:"#f0c040",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>EXAMPLE PAYOUT</div>
              <p style={{margin:"0 0 6px"}}>#10 seed Gonzaga wins in the Sweet 16 with 8 owners:</p>
              <p style={{margin:"0 0 4px",color:"#2ecc71",fontWeight:700}}>10 x $1.50 = $15.00 per owner = $105.00 total collected</p>
              <p style={{margin:0,color:"#8899cc",fontSize:12}}>Each other owner owes you $15, settled however your group prefers.</p>
            </div>
            <div style={{background:"#0f1625",border:"1px solid #1e2840",borderRadius:10,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontWeight:700,color:"#f0c040",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>TABS GUIDE</div>
              <p style={{margin:"0 0 6px"}}><strong style={{color:"#dce4f5"}}>Leaderboard</strong> - live net standings, auto-updated from ESPN within 60 seconds of each game ending.</p>
              <p style={{margin:"0 0 6px"}}><strong style={{color:"#dce4f5"}}>Rosters</strong> - each owner's 8 teams. Eliminated teams show with strikethrough and a red OUT badge.</p>
              <p style={{margin:0}}><strong style={{color:"#dce4f5"}}>Win Tracker</strong> - detailed log of all wins and dollar amounts owed.</p>
            </div>
            <div style={{background:"#0a1a2e",border:"1px solid #1e3a5a",borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontWeight:700,color:"#3498db",marginBottom:8,fontSize:12,textTransform:"uppercase",letterSpacing:1}}>STRATEGY TIPS</div>
              <p style={{margin:"0 0 6px"}}><strong style={{color:"#dce4f5"}}>High seeds earn more</strong> but go out earlier. Balance your 8 picks.</p>
              <p style={{margin:"0 0 6px"}}><strong style={{color:"#dce4f5"}}>Mix strong low seeds</strong> (1s and 2s) with high seeds (10s-12s) who can upset.</p>
              <p style={{margin:0}}><strong style={{color:"#dce4f5"}}>Championship pays 3x</strong> - a 5-seed winning it all pays $15 per owner per win!</p>
            </div>
          </div>
        </Modal>

        {/* Admin login modal on auth screen */}
        <Modal open={modal==="adminLogin"} onClose={()=>{setModal(null);setAdminPassInput("");setAdminPassError("");}} title="🔐 Admin Login">
          <p style={{ color:"#6677aa", fontSize:13, marginBottom:16 }}>Enter your admin password to access all leagues.</p>
          <input type="password" value={adminPassInput} onChange={e=>setAdminPassInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"){ if(adminPassInput===ADMIN_PASSWORD){setIsAdmin(true);sessionStorage.setItem("bb_is_admin","true");setModal(null);setAdminPassInput("");setAdminPassError("");}else{setAdminPassError("Incorrect password.");}}}}
            placeholder="Password" style={{ ...S.input, letterSpacing:4, fontSize:18, textAlign:"center", marginBottom:8 }} autoFocus />
          {adminPassError && <div style={{ color:"#e74c3c", fontSize:12, marginBottom:8 }}>{adminPassError}</div>}
          <button onClick={()=>{ if(adminPassInput===ADMIN_PASSWORD){setIsAdmin(true);sessionStorage.setItem("bb_is_admin","true");setModal(null);setAdminPassInput("");setAdminPassError("");}else{setAdminPassError("Incorrect password.");}}}
            style={{ ...S.btn(), width:"100%", marginTop:4 }}>Login</button>
        </Modal>
        <Toast {...(toast||{msg:null})} />
      </div>
    );
  }

  // ── Landing screen (no league loaded) ───────────────────────────────────
  if (!leagueCode) {
    return (
      <div style={{ minHeight:"100vh", background:"#0c1120", fontFamily:"'DM Sans',sans-serif",
        color:"#dce4f5", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <FontLink />
        <Toast {...(toast||{msg:null})} />
        <div style={{ maxWidth:460, width:"100%", padding:24 }}>
          {authUser && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <button onClick={()=>setModal("profile")} style={{
                display:"flex", alignItems:"center", gap:10, background:"#131929",
                border:"1px solid #1e2840", borderRadius:12, padding:"10px 16px",
                cursor:"pointer", fontFamily:"inherit", flex:1, marginRight:8
              }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:"#f0c040",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:800, color:"#111", flexShrink:0 }}>
                  {(authUser.user_metadata?.name || authUser.email).charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#dce4f5" }}>
                    {authUser.user_metadata?.name || authUser.email}
                  </div>
                  <div style={{ fontSize:11, color:"#6677aa" }}>View Profile</div>
                </div>
              </button>
              <button onClick={handleSignOut} style={{ ...S.btn("#1a1a2e","#6677aa"),
                border:"1px solid #2a3350", fontSize:12, padding:"10px 14px" }}>
                Sign Out
              </button>
            </div>
          )}
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:52, marginBottom:12 }}>🏀</div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:44, letterSpacing:4,
              color:"#f0c040", margin:0, textShadow:"0 0 30px rgba(240,192,64,0.4)" }}>
              BRACKET BUCKS
            </h1>
            <p style={{ color:"#6677aa", marginTop:8, fontSize:14 }}>March Madness Upset Pool Tracker</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
<button onClick={()=>setModal("join")} style={{
              ...S.btn("#1e2840","#dce4f5"), padding:"14px 20px", fontSize:15, borderRadius:12,
            }}>
              🔑 Join a League
              <div style={{ fontSize:11, fontWeight:400, color:"#6677aa", marginTop:3 }}>
                Enter your invite code
              </div>
            </button>

            <button onClick={()=>{ setModal("create"); setPaymentConfirmed(false); }} style={{
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

          {/* Admin login / My Leagues */}
          {!isAdmin ? (
            <div style={{ marginTop:28, textAlign:"center" }}>
              <button onClick={()=>setModal("adminLogin")} style={{
                background:"none", border:"none", color:"#2a3560",
                fontSize:12, cursor:"pointer", textDecoration:"underline"
              }}>Admin Login</button>
            </div>
          ) : (
            <div style={{ marginTop:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:2, fontWeight:700 }}>
                  🔓 My Leagues
                </div>
                <button onClick={()=>{ sessionStorage.removeItem("bb_is_admin"); setIsAdmin(false); }}
                  style={{ background:"none", border:"none", color:"#445", fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
                  Log out
                </button>
              </div>
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
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal open={modal==="adminLogin"} onClose={()=>{setModal(null);setAdminPassInput("");setAdminPassError("");}} title="🔐 Admin Login">
          <p style={{ color:"#6677aa", fontSize:13, marginBottom:16 }}>Enter your admin password to access all leagues.</p>
          <input type="password" value={adminPassInput} onChange={e=>setAdminPassInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"){ if(adminPassInput===ADMIN_PASSWORD){setIsAdmin(true);sessionStorage.setItem("bb_is_admin","true");setModal(null);setAdminPassInput("");setAdminPassError("");}else{setAdminPassError("Incorrect password.");}}}}
            placeholder="Password" style={{ ...S.input, letterSpacing:4, fontSize:18, textAlign:"center", marginBottom:8 }} autoFocus />
          {adminPassError && <div style={{ color:"#e74c3c", fontSize:12, marginBottom:8 }}>{adminPassError}</div>}
          <button onClick={()=>{ if(adminPassInput===ADMIN_PASSWORD){setIsAdmin(true);sessionStorage.setItem("bb_is_admin","true");setModal(null);setAdminPassInput("");setAdminPassError("");}else{setAdminPassError("Incorrect password.");}}}
            style={{ ...S.btn(), width:"100%", marginTop:4 }}>Login</button>
        </Modal>

        <Modal open={modal==="profile"} onClose={()=>setModal(null)} title="👤 My Profile">
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20,
            background:"#0f1625", borderRadius:12, padding:"14px 18px" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"#f0c040",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:800, color:"#111" }}>
              {(authUser?.user_metadata?.name || authUser?.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{authUser?.user_metadata?.name || authUser?.email}</div>
              <div style={{ fontSize:12, color:"#6677aa", marginTop:2 }}>{authUser?.email}</div>
            </div>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:1.5, marginBottom:10 }}>My Leagues</div>
            {(authUser?.user_metadata?.leagues || []).length === 0 ? (
              <div style={{ color:"#445", fontSize:13 }}>No leagues joined yet. Join or create a league to get started!</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...(authUser?.user_metadata?.leagues || [])].reverse().map(l => (
                  <button key={l.code} onClick={()=>{ loadLeague(l.code); setModal(null); }}
                    style={{ ...S.btn("#0f1625","#dce4f5"), padding:"12px 16px", fontSize:14,
                      borderRadius:10, textAlign:"left", border:"1px solid #1e2840",
                      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{l.name}</div>
                      <div style={{ fontSize:11, color:"#6677aa", marginTop:2, fontFamily:"'DM Mono',monospace" }}>{l.code}</div>
                    </div>
                    <span style={{ color:"#f0c040" }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSignOut} style={{ ...S.btn("#1a1a2e","#e74c3c"),
            border:"1px solid #e74c3c", width:"100%", marginTop:8 }}>Sign Out</button>
        </Modal>

        <Modal open={modal==="join"} onClose={()=>setModal(null)} title="Join a League">
          <label style={S.label}>Invite Code</label>
          <input value={joinCode} onChange={e=>{setJoinCode(e.target.value);setJoinErr("");}}
            placeholder="e.g. CHI2025" style={S.input}
            onKeyDown={e=>e.key==="Enter"&&joinLeague()} />
          {joinErr && <p style={{ color:"#e74c3c", fontSize:13, marginTop:6 }}>{joinErr}</p>}
          <button onClick={joinLeague} style={{ ...S.btn(), marginTop:14, width:"100%" }}>Join</button>
        </Modal>

        <Modal open={modal==="create"} onClose={()=>{ setModal(null); setPaymentConfirmed(false); setNewLeagueName(""); }} title="Create New League">
          {venmoLoading ? (
            /* Verifying payment with Venmo */
            <div style={{ textAlign:"center", padding:"30px 0" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>⏳</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, color:"#f0c040" }}>
                Verifying Payment…
              </div>
              <p style={{ color:"#6677aa", fontSize:13, marginTop:8 }}>Confirming your Venmo payment, just a moment.</p>
            </div>

          ) : isAdmin ? (
            /* Admins skip payment */
            <div>
              <div style={{ background:"#0a2a14", border:"1px solid #27ae60", borderRadius:8,
                padding:"10px 14px", marginBottom:14, fontSize:13, color:"#2ecc71" }}>
                🔓 Admin — no payment required
              </div>
              <label style={S.label}>League Name</label>
              <input value={newLeagueName} onChange={e=>setNewLeagueName(e.target.value)}
                placeholder="e.g. Office Bracket 2026" style={S.input}
                onKeyDown={e=>e.key==="Enter"&&createLeague()} />
              <p style={{ fontSize:12, color:"#445", marginTop:8 }}>
                A 6-character invite code is generated automatically.
              </p>
              <button onClick={createLeague} style={{ ...S.btn(), marginTop:12, width:"100%", fontSize:15 }}>
                Create League
              </button>
              <button
                    onClick={async () => {
                      setPaymentStep('verifying');
                      setVenmoVerifyError('');
              try {
                const email = authUser ? authUser.email : (session&&session.user?session.user.email:"");
                if (!email) { setPaymentStep("error"); setVenmoVerifyError("Could not detect your email. Please sign in again."); return; }
                // Check if already approved
                const {data:existing} = await supabase.from("payments").select("id,status").eq("email",email).maybeSingle();
                if (existing && existing.status === "approved") {
                  setPaymentConfirmed(true); setPaymentStep("instructions"); setVenmoVerifyError("");
                } else if (existing) {
                  // Already submitted, still pending
                  setPaymentStep("pending");
                } else {
                  // Submit new payment request
                  const {error:insErr} = await supabase.from("payments").insert({email, status:"pending", venmo_username: venmoUsername.trim()});
                  if (insErr) throw insErr;
                  // Notify admin via email
                  fetch("https://formsubmit.co/ajax/stephen.sevenich@gmail.com",{
                    method:"POST",
                    headers:{"Content-Type":"application/json","Accept":"application/json"},
                    body:JSON.stringify({
                      subject:"[Bracket Bucks] New Payment Request",
                      message:"Payment request from: "+email+"\nVenmo username: "+(venmoUsername.trim()||"(not provided)")+"\n\nLog in as admin to approve: https://bracket-bucks.com"
                    })
                  }).catch(()=>{}); // fire and forget
                  setPaymentStep("pending");
                }
              } catch(e) {
                setPaymentStep("error");
                setVenmoVerifyError("Something went wrong: "+e.message);
              }
                    }}
                    disabled={paymentStep === 'verifying'}
                    style={{
                      background: '#f7b731',
                      color: '#1a1a2e',
                      border: 'none',
                      borderRadius: 8,
                      padding: '14px 24px',
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: paymentStep === 'verifying' ? 'not-allowed' : 'pointer',
                      width: '100%',
                      opacity: paymentStep === 'verifying' ? 0.7 : 1,
                      marginTop: 12
                    }}
                  >
                    {paymentStep === 'verifying' ? '⏳ Checking payment...' : '✅ I sent it — Verify Payment'}
                  </button>
                  {venmoVerifyError && <p style={{color:'#ff6b6b', fontSize: 13, margin: '8px 0 0'}}>{venmoVerifyError}</p>}

              <p style={{ fontSize:11, color:"#445", textAlign:"center", marginTop:10 }}>
                Send $10 to @bracket-bucks-app on Venmo with your email in the note, then click 'I sent it' above.
              </p>
            </div>

          ) : paymentConfirmed ? (
            /* Step 2: Payment confirmed — name the league */
            <div>
              <div style={{ background:"#0a2a14", border:"1px solid #27ae60", borderRadius:8,
                padding:"12px 14px", marginBottom:16, fontSize:13, color:"#2ecc71",
                display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:18 }}>✅</span>
                <span>Payment confirmed — you're good to go!</span>
              </div>
              <label style={S.label}>League Name</label>
              <input value={newLeagueName} onChange={e=>setNewLeagueName(e.target.value)}
                placeholder="e.g. Office Bracket 2026" style={S.input}
                onKeyDown={e=>e.key==="Enter"&&createLeague()} autoFocus />
              <p style={{ fontSize:12, color:"#445", marginTop:8 }}>
                A 6-character invite code is generated automatically. Share it with your league.
              </p>
              <button onClick={createLeague} style={{ ...S.btn(), marginTop:12, width:"100%", fontSize:15 }}>
                Create League
              </button>
            </div>
        ) : (
        /* Step 1: Pay and verify */
        <div>
          {paymentStep === "error" && venmoVerifyError && (
            <div style={{background:"#2a0a0a",border:"1px solid #e74c3c",borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#e74c3c"}}>
              ⚠️ {venmoVerifyError}
            </div>
          )}
          <div style={{background:"#0a1a2a",border:"1px solid #1e3a5a",borderRadius:8,padding:"14px",marginBottom:14,fontSize:13,color:"#6677aa",lineHeight:1.6}}>
            <div style={{color:"#d4af37",fontWeight:700,marginBottom:6}}>How to create a league:</div>
            <div>1. Send <strong style={{color:"#fff"}}>$10</strong> to <strong style={{color:"#1db954"}}>@bracket-bucks-app</strong> on Venmo</div>
            <div style={{marginTop:4}}>2. Include your email <strong style={{color:"#fff"}}>({authUser?.email})</strong> in the Venmo note</div>
            <div style={{marginTop:4}}>3. Click the button below to verify</div>
          </div>
          <div style={{marginBottom:10}}>
            <label style={{fontSize:12,color:"#6677aa",display:"block",marginBottom:4}}>Your Venmo Username (so we can confirm)</label>
            <input value={venmoUsername} onChange={e=>setVenmoUsername(e.target.value)}
              placeholder="e.g. john-smith-42"
              style={{width:"100%",background:"#0d1528",border:"1px solid #1e2d4a",borderRadius:6,padding:"8px 12px",color:"#dce4f5",fontSize:13,boxSizing:"border-box"}}/>
          </div>
          <a href="https://venmo.com/u/bracket-bucks-app" target="_blank" rel="noreferrer"
            style={{display:"block",textAlign:"center",background:"#3d95ce",color:"#fff",borderRadius:8,padding:"12px",marginBottom:10,fontWeight:700,fontSize:14,textDecoration:"none"}}>
            💳 Send $10 on Venmo
          </a>
          <button
            onClick={async () => {
              setPaymentStep("verifying");
              setVenmoVerifyError("");
            try {
              const email = authUser ? authUser.email : (session&&session.user?session.user.email:"");
              if (!email) { setPaymentStep("error"); setVenmoVerifyError("Could not detect your email. Please sign in again."); return; }
              const {data:existing} = await supabase.from("payments").select("id,status").eq("email",email).maybeSingle();
              if (existing && existing.status === "approved") {
                setPaymentConfirmed(true); setPaymentStep("instructions"); setVenmoVerifyError("");
              } else if (existing) {
                setPaymentStep("pending");
              } else {
                const {error:insErr} = await supabase.from("payments").insert({email, status:"pending", venmo_username: venmoUsername.trim()});
                if (insErr) throw insErr;
                setPaymentStep("pending");
              }
            } catch(e) {
              setPaymentStep("error");
              setVenmoVerifyError("Something went wrong: "+e.message);
            }
            }}
            disabled={paymentStep === "verifying"}
            style={{width:"100%",background:paymentStep==="verifying"?"#333":"#f7b731",color:"#1a1a2e",border:"none",borderRadius:8,padding:"13px",fontSize:15,fontWeight:700,cursor:paymentStep==="verifying"?"not-allowed":"pointer",opacity:paymentStep==="verifying"?0.7:1}}>
            {paymentStep === "verifying" ? "⏳ Checking..." : paymentStep === "pending" ? "✅ Request submitted!" : "✅ I sent it — Verify Payment"}
          </button>
          <p style={{fontSize:11,color:"#445",textAlign:"center",marginTop:8}}>Include your email ({authUser?.email}) in the Venmo note.</p>
        </div>
          )}
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
          <button onClick={()=>setTab("profile")} style={{ ...S.btn("#1a2440","#dce4f5"), border:"1px solid #2a3560", fontSize:12 }}>👤 Profile</button>
          <button onClick={()=>setModal("howToPlay")} style={{ ...S.btn("#1a2440","#6677aa"), border:"1px solid #2a3560", fontSize:12 }}>? How to Play</button>
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
              Total payout formula: <strong>Seed × Round Value × {owners.length-1} owners</strong>.
              Smaller number shows cost per owner.
            </p>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#141d38" }}>
                    <th style={TH}>Seed</th>
                    {rounds.map(r=>(
                      <th key={r.id} style={TH}>
                        {r.short}
                        <div style={{ fontSize:10, color:"#f0c040", fontWeight:400, marginTop:2 }}>${(r.dmg*(owners.length-1||7)).toFixed(2)} per win</div>
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
                              fontFamily:"'DM Mono',monospace" }}>${tot.toFixed(2)}</div>
                            <div style={{ fontSize:10, color:"#445" }}>${pp.toFixed(2)}/owner</div>
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

        
{/* ── 2026 BRACKET TAB ── */}
{tab==="bracket2026" && (
  <Bracket2026Tab owners={owners} />
)}

{/* LIVE BRACKET */}
        {!loading && tab==="bracket2025" && (
          <div>
            <h2 style={{ margin:"0 0 4px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Live Bracket — 2025 NCAA Tournament</h2>
            <p style={{ color:"#6677aa", fontSize:13, marginBottom:20 }}>🏆 Champion: <strong style={{ color:"#f0c040" }}>Florida</strong> · Final: Florida 65, Houston 63</p>

            {/* Helper to find owner of a team */}
            {(() => {
              const findOwner = (teamName) => {
                const norm = s => (s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
                const tn = norm(teamName);
                for (const owner of owners) {
                  for (const t of owner.teams) {
                    const on = norm(t.name);
                    if (on.length > 3 && (tn.includes(on) || on.includes(tn))) return owner;
                  }
                }
                return null;
              };

              const GameCard = ({ game, label }) => {
                const o1 = findOwner(game.top.name);
                const o2 = findOwner(game.bot.name);
                return (
                  <div style={{ background:"#0f1625", border:"1px solid #1e2840", borderRadius:10,
                    padding:"10px 12px", marginBottom:6, minWidth:220 }}>
                    {label && <div style={{ fontSize:10, color:"#f0c040", fontWeight:700,
                      textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>{label}</div>}
                    {[game.top, game.bot].map((t,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6,
                        padding:"5px 8px", borderRadius:7, marginBottom:i===0?4:0,
                        background: t.name===game.winner?"#0a2a14":"transparent",
                        border:`1px solid ${t.name===game.winner?"#27ae60":"transparent"}`,
                        opacity: game.winner && t.name!==game.winner ? 0.45 : 1 }}>
                        <SeedBadge seed={t.seed} />
                        <span style={{ flex:1, fontWeight: t.name===game.winner?700:400, fontSize:13 }}>{t.name}</span>
                        {(i===0?o1:o2) && (
                          <span style={{ fontSize:10, background:"#1a2440",
                            color:(i===0?o1:o2).color, borderRadius:4, padding:"1px 6px", fontWeight:700 }}>
                            {(i===0?o1:o2).name}
                          </span>
                        )}
                        {t.score != null && (
                          <span style={{ fontFamily:"'DM Mono',monospace", fontWeight:800, fontSize:14,
                            color: t.name===game.winner?"#2ecc71":"#6677aa", minWidth:24, textAlign:"right" }}>
                            {t.score}
                          </span>
                        )}
                        {t.name===game.winner && <span style={{ color:"#2ecc71", fontSize:12 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                );
              };

              const ROUND_LABELS = { r64:"Round of 64", r32:"Round of 32", s16:"Sweet 16", e8:"Elite Eight" };

              return (
                <div>
                  {/* Championship — top of page */}
                  <div style={{ marginBottom:28, background:"linear-gradient(135deg,#1a2010,#141d30)",
                    border:"2px solid #f0c040", borderRadius:14, padding:"18px 20px" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2,
                      color:"#f0c040", marginBottom:12 }}>
                      🏆 National Championship — April 7, 2025
                    </div>
                    <div style={{ maxWidth:340 }}>
                      <GameCard game={BRACKET_2025.championship} label="Florida 65 · Houston 63" />
                    </div>
                  </div>

                  {/* Final Four */}
                  <div style={{ marginBottom:28, background:"#111827", border:"1px solid #2a3350",
                    borderRadius:14, padding:"18px 20px" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2,
                      color:"#f0c040", marginBottom:12 }}>
                      🏀 Final Four — San Antonio, TX
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:8 }}>
                      {BRACKET_2025.finalFour.map((g,i) => (
                        <GameCard key={i} game={g} label={i===0?"South vs West":"Midwest vs East"} />
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ fontSize:11, color:"#445", textTransform:"uppercase", letterSpacing:2,
                    fontWeight:700, marginBottom:20, paddingTop:4 }}>
                    ── Regional Results ──
                  </div>

                  {/* Regions */}
                  {BRACKET_2025.regions.map(region => (
                    <div key={region.name} style={{ marginBottom:28, background:"#0f1420",
                      border:"1px solid #1a2440", borderRadius:14, padding:"16px 18px" }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2,
                        color:"#f0c040", marginBottom:12, paddingBottom:6, borderBottom:"1px solid #1e2840" }}>
                        {region.name} Region
                      </div>
                      {Object.entries(region.games).map(([roundKey, games]) => (
                        <div key={roundKey} style={{ marginBottom:16 }}>
                          <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase",
                            letterSpacing:1.5, fontWeight:700, marginBottom:8 }}>
                            {ROUND_LABELS[roundKey]}
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:8 }}>
                            {games.map((g,i) => <GameCard key={i} game={g} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}


        {/* DRAFT */}
        {!loading && tab==="draft" && (()=>{
          // ── Draft helpers ──────────────────────────────────────────────
          const pickedNames = owners.flatMap(o => o.teams.map(t => (t.name||"").toLowerCase().trim()));
          const available = NCAA_2026_TEAMS.filter(t => !pickedNames.includes(t.name.toLowerCase().trim()));
          const totalPicks = owners.reduce((sum, o) => sum + o.teams.filter(t => t.name && t.name.trim()).length, 0);
          // Play-in game opponent lookup
          const PLAY_IN_OPPONENTS = {
            "UMBC": "Howard",
            "Texas": "NC State",
            "Prairie View A&M": "Lehigh",
            "SMU": "Miami (OH)",
          };

          const numOwners = owners.length;
          const pickRound = Math.floor(totalPicks / Math.max(numOwners,1));
          const posInRound = totalPicks % Math.max(numOwners,1);
          const isEvenRound = pickRound % 2 === 0;
          const sortedOwners = [...owners].sort((a,b) => a.num - b.num);
          const currentPickerIdx = isEvenRound ? posInRound : (numOwners - 1 - posInRound);
          const currentPicker = sortedOwners[currentPickerIdx] || null;
          const draftComplete = totalPicks >= numOwners * 8 && numOwners > 0;

          // ── Draft scheduled time ───────────────────────────────────────
          const draftStart = league?.draft_start ? new Date(league.draft_start) : null;
          const now = new Date(); void tick; // tick forces re-render every second
          const secondsUntilDraft = draftStart ? Math.ceil((draftStart - now) / 1000) : null;
          const draftHasStarted = true;

          // ── Draft a team ───────────────────────────────────────────────
          async function draftPick(team, fromAutoPick = false) {
            if (!currentPicker) return;
            if (!fromAutoPick && !authUser) { alert("Please sign in to draft a team."); return; }
            const updatedTeams = [...currentPicker.teams];
            if(!isAdmin&&currentPicker){var m=owners.find(function(o){return o.user_id===authUser.id;});if(!m||m.num!==currentPicker.num){alert("It's not your turn!");return;}}
            const emptyIdx = updatedTeams.findIndex(t => !t.name || !t.name.trim());
            if (emptyIdx === -1) { alert("This owner already has 8 teams."); return; }
            updatedTeams[emptyIdx] = { seed: team.seed, name: team.name };
            const { error } = await supabase.from("owners").update({ teams: updatedTeams }).eq("id", currentPicker.id);
            if (error) { alert("Failed to save pick."); return; }
            setOwners(prev => prev.map(o => o.id === currentPicker.id ? { ...o, teams: updatedTeams } : o));
            // Reset pick timer in league
            await supabase.from("leagues").update({ pick_timer_start: new Date().toISOString() }).eq("code", leagueCode);
            if (fromAutoPick) alert(`⏱ Auto-picked ${team.name} for ${currentPicker.name}`);
            else alert(`✓ ${currentPicker.name} drafted ${team.name}!`);
          }

          async function clearDraftStart() {
    if (!window.confirm("Clear the scheduled draft time?")) return;
    await supabase.from("leagues").update({ draft_start: null }).eq("code", leagueCode);
    setDraftScheduled(null);
    setDraftStartInput("");
    alert("Draft time cleared.");
  }

  // ── Start Draft ───────────────────────────────────────────────
  async function startDraft() {
    if (!leagueCode) return;
    const ts = new Date().toISOString();
    const { error } = await supabase.from("leagues").update({ pick_timer_start: ts }).eq("code", leagueCode);
    if (error) { alert("Failed to start draft: " + error.message); return; }
    // Also update local state immediately in case realtime is slow
    setLeague(prev => prev ? { ...prev, pick_timer_start: ts } : prev);
  }

    // ── Auto-pick (highest available seed = lowest seed number) ───
          async function autoPick() {
            if (!available.length || !currentPicker) return;
            const best = [...available].sort((a,b)=>(a.seed||99)-(b.seed||99))[0];
            await draftPick(best, true);
          }

          // ── Reset draft ────────────────────────────────────────────────
          async function shuffleDraftOrder() {
    if (!window.confirm("Randomly shuffle the draft order for all owners?")) return;
    const shuffled = [...owners];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    await Promise.all(shuffled.map((o, idx) =>
      supabase.from("owners").update({ num: idx + 1 }).eq("id", o.id)
    ));
    setOwners(shuffled.map((o, i) => ({ ...o, num: i + 1 })));
    alert("Draft order shuffled! New order: " + shuffled.map(o=>o.name).join(", "));
  }

  async function resetDraft() {
            if (!adminUnlocked) { setModal("pin"); return; }
            const blank = Array.from({length:8}, (_,i) => ({ seed: i+1, name: "" }));
            for (const o of owners) {
              await supabase.from("owners").update({ teams: blank }).eq("id", o.id);
            }
            setOwners(prev => prev.map(o => ({ ...o, teams: blank })));
            alert("Draft reset! All picks cleared.");
          }

          // ── Save draft start time ──────────────────────────────────────
          async function saveDraftStart() {
            if (!draftStartInput) { alert("Please select a date and time first."); return; }
            // Treat the input as CST (America/Chicago)
        const cstDate = new Date(draftStartInput + ":00");
        // Get the UTC offset for America/Chicago at that moment
        const cstFormatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Chicago", hour: "numeric", timeZoneName: "short"
        });
        const parts = cstFormatter.formatToParts(cstDate);
        const tzName = (parts.find(p=>p.type==="timeZoneName")||{}).value||"CST";
        const offset = tzName.includes("CDT") ? "-05:00" : "-06:00";
        const pd = new Date(draftStartInput + ":00" + offset);
            if (isNaN(pd.getTime())) { alert("Invalid date/time."); return; }
            supabase.from("leagues").update({ draft_start: pd.toISOString() }).eq("code", leagueCode)
              .then(({ error }) => {
                if (error) { alert("Save error: " + error.message); return; }
                setDraftStartInput(pd.toISOString());
                setDraftScheduled(pd.toISOString());
                alert("Draft time saved!");
              }).catch(e => alert("Error: " + e.message));
          }

          
  // ── Timezone-aware date formatting ─────────────────────────────────────
  const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const TZ_LABELS = {
    "America/Chicago":"CST", "America/New_York":"EST", "America/Los_Angeles":"PST",
    "America/Denver":"MT", "America/Phoenix":"MT", "America/Anchorage":"AKT",
    "Pacific/Honolulu":"HST"
  };
  const tzLabel = TZ_LABELS[userTZ] || new Date().toLocaleTimeString("en-US",{timeZoneName:"short"}).split(" ").pop();
  function fmtDraftTime(date) {
    if (!date) return "";
    return date.toLocaleString("en-US",{
      weekday:"short", month:"short", day:"numeric",
      hour:"numeric", minute:"2-digit", timeZone:userTZ
    }) + " " + tzLabel;
  }
  function fmtDraftTimeShort(date) {
    if (!date) return "";
    return date.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:userTZ}) + " " + tzLabel;
  }

const regionColors = { South:"#e05c3a", East:"#3a9be0", Midwest:"#2ecc71", West:"#9b59b6" };


          return (
            <div>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h2 style={{ margin:"0 0 4px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>🎯 Snake Draft</h2>
                  <p style={{ margin:0, color:"#6677aa", fontSize:13 }}>
                    {draftComplete ? "✅ Draft complete! All teams assigned." :
                      numOwners === 0 ? "Add owners in Admin tab first." :
                      !draftHasStarted && draftStart ? `⏳ Draft starts ${fmtDraftTime(draftStart)}` :
                      `Round ${pickRound + 1} · Pick ${posInRound + 1} of ${numOwners} · ${available.length} teams remaining`}
                  </p>
                </div>
                {draftScheduled && (
                  <div style={{background:"rgba(212,175,55,0.12)",border:"1px solid rgba(212,175,55,0.4)",borderRadius:8,padding:"10px 18px",marginTop:10,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:18}}>📅</span>
                    <div>
                      <div style={{color:"#d4af37",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Draft Scheduled</div>
                      <div style={{color:"#fff",fontSize:15,fontWeight:600,marginTop:2}}>{fmtDraftTime(new Date(draftScheduled))}</div>
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  {isAdmin && <button onClick={shuffleDraftOrder} style={{ ...S.btn("#1a2440","#d4af37"), border:"1px solid #d4af37", fontSize:13, padding:"8px 16px" }}>🔀 Shuffle Order</button>}
          <button onClick={shuffleDraftOrder} style={{ ...S.btn("#1a2440","#f7b731"), border:"1px solid #f7b731", fontSize:12 }}>🔀 Shuffle Order</button>
                  <button onClick={resetDraft} style={{ ...S.btn("#1a2440","#e74c3c"), border:"1px solid #e74c3c", fontSize:12 }}>
                    🔄 Reset Draft
                  </button>
                </div>
              </div>

              {/* ── Schedule Section ── */}
              <div style={{ ...S.card, marginBottom:20, background:"#0f1420" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:16, letterSpacing:2, color:"#f0c040", marginBottom:12 }}>
                  📅 Draft Schedule
                </div>
                <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:220 }}>
                    <label style={S.label}>Draft Start Date & Time</label>
                    <input type="datetime-local" value={draftStartInput}
                      disabled={draftLive && !adminUnlocked}
                      onChange={e => setDraftStartInput(e.target.value)}
                      style={{ ...S.input, fontFamily:"'DM Mono',monospace" }} />
                  </div>
                  <button onClick={saveDraftStart} style={{opacity:(draftLive&&!adminUnlocked)?0.4:1,cursor:(draftLive&&!adminUnlocked)?"not-allowed":"pointer"}} style={{ ...S.btn(), padding:"10px 20px", marginBottom:0 }}>
                    💾 Set Draft Time
                  </button>
                {draftScheduled && isAdmin && (
                  <button onClick={clearDraftStart} style={{...S.btn("#1a2440","#e74c3c"),padding:"10px 16px",fontSize:13}}>
                    ✕ Clear Time
                  </button>
                )}
                </div>
                {draftStart && (
                  <div style={{ marginTop:12, display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
                    <div style={{ fontSize:13 }}>
                      <span style={{ color:"#6677aa" }}>Scheduled: </span>
                      <span style={{ color:"#dce4f5", fontWeight:600, fontFamily:"'DM Mono',monospace" }}>
                        {draftStart.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric",timeZone:userTZ})}
                        {" at "}
                        {fmtDraftTimeShort(draftStart)}
                      </span>
                    </div>
                    {!draftHasStarted && secondsUntilDraft !== null && (
                      <DraftCountdownBanner secondsLeft={secondsUntilDraft} />
                    )}
                    {draftHasStarted && !draftComplete && (
                      <span style={{ fontSize:12, background:"#0a2a14", color:"#2ecc71",
                        border:"1px solid #27ae60", borderRadius:6, padding:"4px 10px", fontWeight:700 }}>
                        🟢 DRAFT LIVE
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ── Countdown / Not started yet ── */}
              {!draftHasStarted && (
                <div style={{ textAlign:"center", padding:"40px 24px", background:"#0f1420",
                  border:"1px solid #1a2440", borderRadius:14, marginBottom:20 }}>
                  <div style={{ fontSize:44, marginBottom:8 }}>⏳</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:3, color:"#f0c040", marginBottom:4 }}>
                    Draft Hasn't Started Yet
                  </div>
                  <div style={{ color:"#6677aa", fontSize:14 }}>
                    {draftStart ? "Come back at " + fmtDraftTime(draftStart) : "Set a draft time below to get started."}
                  </div>
                </div>
              )}

              {/* ── Live Draft UI ── */}
                <>
            {/* ── Start Draft Banner ── */}
            {false && (
              <div style={{ textAlign:"center", padding:"20px 24px", background:"#0f1420",
                border:"2px solid #d4af37", borderRadius:12, marginBottom:16 }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:3,
                  color:"#d4af37", marginBottom:10 }}>🏀 DRAFT TIME — SELECT YOUR TEAMS BELOW</div>
                {authUser ? (
                  <button onClick={startDraft} style={{
                    background:"#d4af37", color:"#1a1a2e", border:"none", borderRadius:8,
                    padding:"12px 40px", fontSize:16, fontWeight:900, cursor:"pointer",
                    fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2
                  }}>🚀 START DRAFT — BEGIN 30s TIMER</button>
                ) : (
                  <div style={{ color:"#f0c040", fontSize:13 }}>Sign in to start the draft.</div>
                )}
              </div>
            )}

                  )}

                  {/* Current Pick Banner */}
                  {!draftComplete && currentPicker && (
                    <div style={{ background:"linear-gradient(135deg,#1a2e10,#142010)", border:`2px solid ${currentPicker.color}`,
                      borderRadius:14, padding:"14px 20px", marginBottom:20,
                      display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                      <div style={{ width:44, height:44, borderRadius:"50%", background:currentPicker.color,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:20, fontWeight:800, color:"#fff", flexShrink:0 }}>
                        {currentPicker.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:1.5, marginBottom:2 }}>Now Picking</div>
                        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, color:currentPicker.color }}>
                          {currentPicker.name}
                        </div>
                      </div>
                      <div style={{ marginLeft:"auto", textAlign:"right" }}>
                        <div style={{ fontSize:11, color:"#6677aa", marginBottom:2 }}>Round {pickRound + 1} · Pick {totalPicks + 1}</div>
                        <div style={{ fontSize:12, color:"#dce4f5" }}>{currentPicker.teams.filter(t=>t.name).length}/8 teams drafted</div>
                      </div>
                    </div>
                  )}

                  
        {/* ── Draft Order Queue ── */}
        {!draftComplete && owners.length > 0 && (
          <div style={{marginBottom:16,background:"#080e1a",border:"1px solid #1e2d4a",borderRadius:10,padding:"12px 16px"}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"#6677aa",marginBottom:10}}>
              Draft Order — Round {pickRound+1}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
              {[...owners].sort((a,b)=>a.num-b.num).map((owner)=>{
                const isCurrent=currentPicker&&owner.id===currentPicker.id;
                const isNext=!isCurrent&&currentPicker&&(
                  isEvenRound?owner.num===currentPicker.num+1:owner.num===currentPicker.num-1
                );
                return (
                  <div key={owner.id} style={{
                    display:"flex",alignItems:"center",gap:6,
                    padding:"6px 12px",borderRadius:8,
                    background:isCurrent?(owner.color||"#d4af37")+"33":"#0d1528",
                    border:"1px solid "+(isCurrent?(owner.color||"#d4af37"):isNext?"#334":"#1e2d4a"),
                  }}>
                    <span style={{
                      width:20,height:20,borderRadius:"50%",
                      background:isCurrent?(owner.color||"#d4af37"):"#1e2d4a",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:10,fontWeight:800,
                      color:isCurrent?"#111":"#6677aa",flexShrink:0
                    }}>{owner.num}</span>
                    <span style={{
                      fontSize:13,fontWeight:isCurrent?700:400,
                      color:isCurrent?(owner.color||"#d4af37"):isNext?"#aab":"#556"
                    }}>{owner.name}</span>
                    {isCurrent&&<span style={{fontSize:10,color:owner.color||"#d4af37",fontWeight:800}}>ON THE CLOCK</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {draftComplete && (
                    <div style={{ textAlign:"center", padding:"32px", background:"linear-gradient(135deg,#1a2e10,#142010)",
                      border:"2px solid #2ecc71", borderRadius:14, marginBottom:20 }}>
                      <div style={{ fontSize:40, marginBottom:8 }}>🏆</div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:3, color:"#2ecc71" }}>
                        Draft Complete!
                      </div>
                      <div style={{ color:"#6677aa", fontSize:13, marginTop:6 }}>All {numOwners * 8} picks have been made. Good luck!</div>
                    </div>
                  )}

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>
                    {/* Available Teams */}
                    <div>
                      <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:10 }}>
                        Available Teams ({available.length})
                      </div>
                      {["South","East","Midwest","West"].map(region => {
                        const regionTeams = available.filter(t => t.region === region);
                        if (!regionTeams.length) return null;
                        return (
                          <div key={region} style={{ marginBottom:14 }}>
                            <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1.5,
                              color:regionColors[region], marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                              <span style={{ width:8, height:8, borderRadius:"50%", background:regionColors[region], display:"inline-block" }} />
                              {region} Region
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                              {regionTeams.map(team => (
                                <button key={team.region+team.seed} onClick={()=>draftPick(team)}
                                  disabled={draftComplete || !currentPicker || (!draftHasStarted && !!draftStart)}
                                  style={{ display:"flex", alignItems:"center", gap:8,
                                    background:"#0f1625",
                                    border:`1px solid ${regionColors[region]}44`,
                                    borderRadius:8, padding:"8px 10px", cursor:"pointer",
                                    fontFamily:"inherit", textAlign:"left",
                                    opacity: (draftComplete || !league?.pick_timer_start) ? 0.45 : 1, cursor: !league?.pick_timer_start ? "not-allowed" : "pointer" }}
                                  onMouseEnter={e => { e.currentTarget.style.background="#1a2e1a"; e.currentTarget.style.borderColor=regionColors[region]; }}
                                  onMouseLeave={e => { e.currentTarget.style.background="#0f1625"; e.currentTarget.style.borderColor=regionColors[region]+"44"; }}>
                                  <SeedBadge seed={team.seed} />
                <span style={{ fontSize:12, fontWeight:600, color:"#dce4f5", flex:1 }}>{PLAY_IN_OPPONENTS[team.name] ? `${team.name} / ${team.seed} ${PLAY_IN_OPPONENTS[team.name]}` : team.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {available.length === 0 && !draftComplete && <Empty text="All teams have been drafted!" />}
                    </div>

                    {/* Draft Board */}
                    <div>
                      <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:10 }}>
                        Draft Board
                      </div>
                      <div style={{ background:"#0f1420", border:"1px solid #1a2440", borderRadius:12, overflow:"hidden" }}>
                        <div style={{ display:"grid", gridTemplateColumns:`70px repeat(${numOwners}, 1fr)`,
                          background:"#141d38", borderBottom:"1px solid #1a2440", padding:"6px 8px" }}>
                          <div style={{ fontSize:10, color:"#445", textTransform:"uppercase", letterSpacing:1 }}>Rd</div>
                          {sortedOwners.map(o => (
                            <div key={o.id} style={{ fontSize:10, color:o.color, fontWeight:700,
                              textAlign:"center", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                              {o.name.split(" ")[0]}
                            </div>
                          ))}
                        </div>
                        {Array.from({length:8}, (_,round) => {
                          const isEvenR = round % 2 === 0;
                          return (
                            <div key={round} style={{ display:"grid",
                              gridTemplateColumns:`70px repeat(${numOwners}, 1fr)`,
                              borderBottom:"1px solid #111", padding:"4px 8px",
                              background: round % 2 === 0 ? "#0f1420" : "#0a0f1a" }}>
                              <div style={{ fontSize:11, color:"#445", display:"flex", alignItems:"center", gap:4 }}>
                                <span>Rd {round+1}</span>
                                <span style={{ fontSize:9, color:"#333" }}>{isEvenR?"→":"←"}</span>
                              </div>
                              {sortedOwners.map((o, oi) => {
                                const pick = o.teams[round];
                                const globalPickNum = round * numOwners + (isEvenR ? oi : numOwners - 1 - oi);
                                const isCurrent = globalPickNum === totalPicks && !draftComplete;
                                return (
                                  <div key={o.id} style={{ padding:"3px 4px", borderRadius:5, textAlign:"center",
                                    background: isCurrent ? o.color+"33" : "transparent",
                                    border: isCurrent ? `1px solid ${o.color}` : "1px solid transparent",
                                    minHeight:28, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                    {pick?.name ? (
                                      <div>
                                        <div style={{ fontSize:9, color:o.color, fontWeight:700 }}>#{pick.seed}</div>
                                        <div style={{ fontSize:9, color:"#dce4f5", lineHeight:1.2,
                                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:50 }}>
                                          {pick.name.split(" ").slice(-1)[0]}
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ width:20, height:2, background: isCurrent ? o.color : "#1a2440", borderRadius:1 }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {/* Owner picks summary */}
                      <div style={{ marginTop:14 }}>
                        <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:1.5, fontWeight:700, marginBottom:8 }}>
                          Teams Drafted
                        </div>
                        {sortedOwners.map(o => {
                          const drafted = o.teams.filter(t => t.name && t.name.trim());
                          return (
                            <div key={o.id} style={{ marginBottom:8, background:"#0a0f1a",
                              border:`1px solid ${o.id === currentPicker?.id ? o.color : "#1a2440"}`,
                              borderRadius:10, padding:"10px 12px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                                <div style={{ width:8, height:8, borderRadius:"50%", background:o.color }} />
                                <span style={{ fontWeight:700, fontSize:13, color:o.id===currentPicker?.id?o.color:"#dce4f5" }}>{o.name}</span>
                                <span style={{ marginLeft:"auto", fontSize:11, color:"#445" }}>{drafted.length}/8</span>
                              </div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                                {drafted.map((t,i) => (
                                  <span key={i} style={{ fontSize:10, background:"#1a2440", color:"#dce4f5",
                                    borderRadius:4, padding:"2px 6px", display:"flex", alignItems:"center", gap:3 }}>
                                    <SeedBadge seed={t.seed} />
                                    <span>{t.name}</span>
                                  </span>
                                ))}
                                {Array.from({length: 8 - drafted.length}).map((_,i) => (
                                  <span key={`empty-${i}`} style={{ fontSize:10, background:"#111", color:"#333",
                                    borderRadius:4, padding:"2px 8px", border:"1px dashed #1a2440" }}>—</span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
            </div>
          );
        })()}

        {/* PROFILE */}
        {!loading && tab==="profile" && (()=>{
          const userName = authUser?.user_metadata?.name || authUser?.email || "Player";
          const userLeagues = authUser?.user_metadata?.leagues || [];

          // Find this user's owner entry in current league by matching name
          const myOwner = owners.find(o =>
            o.name.toLowerCase().replace(/\s/g,"") === userName.toLowerCase().replace(/\s/g,"")
          );
          const myStats = myOwner ? stats.find(s => s.id === myOwner.id) : null;

          // All-time: aggregate across saved leagues (current league data only for now)
          const allTimeWins = myOwner ? wins.filter(w => w.owner_id === myOwner.id).length : 0;
          const standing = myStats ? stats.findIndex(s => s.id === myOwner.id) + 1 : null;

          return (
            <div>
              {/* Profile Header */}
              <div style={{ ...S.card, background:"linear-gradient(135deg,#111827,#1a2440)",
                display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", marginBottom:20 }}>
                <div style={{ width:64, height:64, borderRadius:"50%",
                  background: myOwner?.color || "#f0c040",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:28, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:2, color:"#f0c040" }}>
                    {userName}
                  </div>
                  <div style={{ fontSize:12, color:"#6677aa", marginTop:2 }}>{authUser?.email}</div>
                  <div style={{ fontSize:12, color:"#445", marginTop:4 }}>
                    Member of {userLeagues.length} league{userLeagues.length!==1?"s":""}
                  </div>
                </div>
                <button onClick={handleSignOut} style={{ ...S.btn("#1a1a2e","#e74c3c"), border:"1px solid #e74c3c", fontSize:12 }}>
                  Sign Out
                </button>
              </div>

              {/* Current League Stats */}
              {myStats ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:12, marginBottom:20 }}>
                  {[
                    ["Standing", `#${standing} of ${owners.length}`, standing===1?"#f0c040":"#dce4f5"],
                    ["Net P&L", `${myStats.net>=0?"+":""}$${myStats.net.toFixed(2)}`, myStats.net>=0?"#2ecc71":"#e74c3c"],
                    ["Total Earned", `$${myStats.totalEarned.toFixed(2)}`, "#2ecc71"],
                    ["Total Paid", `$${myStats.totalCost.toFixed(2)}`, "#e74c3c"],
                    ["Wins This Year", allTimeWins, "#f0c040"],
                    ["Avg Seed", myOwner ? (myOwner.teams.reduce((a,t)=>a+t.seed,0)/myOwner.teams.length).toFixed(1) : "—", "#6677aa"],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ background:"#0f1625", border:"1px solid #1e2840",
                      borderRadius:12, padding:"16px 18px" }}>
                      <div style={{ fontSize:10, color:"#445", textTransform:"uppercase", letterSpacing:1.5, marginBottom:6 }}>{label}</div>
                      <div style={{ fontSize:24, fontWeight:800, fontFamily:"'DM Mono',monospace", color }}>{val}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ ...S.card, borderColor:"#2a3350", color:"#6677aa", fontSize:13, marginBottom:20 }}>
                  <strong style={{ color:"#f0c040" }}>👋 You're not listed as an owner in this league.</strong>
                  <p style={{ margin:"8px 0 0" }}>Your profile name <strong>"{userName}"</strong> doesn't match any owner in {league?.name}. Ask your admin to add you, or make sure your profile name matches exactly.</p>
                </div>
              )}

              {/* My Teams This Year */}
              {myOwner && (
                <div style={{ ...S.card, marginBottom:20 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:"#f0c040", marginBottom:14 }}>
                    🏀 My Teams — {league?.name}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
                    {myOwner.teams.map((t, i) => {
                      const teamWins = wins.filter(w => w.owner_id===myOwner.id && w.team_index===i);
                      const earned = teamWins.reduce((sum, w) => {
                        const r = rounds[w.round_id];
                        return sum + (t.seed * r.dmg * (owners.length - 1));
                      }, 0);
                      return (
                        <div key={i} style={{ background:"#0a0f1a", border:`1px solid ${teamWins.length?"#27ae60":"#1a2440"}`,
                          borderRadius:10, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                          <SeedBadge seed={t.seed} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600, fontSize:13 }}>{t.name || "TBD"}</div>
                            {teamWins.length > 0 && (
                              <div style={{ fontSize:11, color:"#2ecc71", marginTop:2 }}>
                                {teamWins.length} win{teamWins.length!==1?"s":""} · +${earned.toFixed(2)}
                              </div>
                            )}
                          </div>
                          {teamWins.length > 0 && <span style={{ color:"#2ecc71" }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Round-by-Round Breakdown */}
              {myStats && (
                <div style={{ ...S.card, marginBottom:20 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:"#f0c040", marginBottom:14 }}>
                    📊 Round-by-Round Breakdown
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                      <thead>
                        <tr style={{ background:"#0f1625" }}>
                          {["Round","Wins","Earned","Paid Out","Net"].map(h=>(
                            <th key={h} style={TH}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rounds.map((r,i) => {
                          const net = myStats.roundEarned[i] - myStats.roundCost[i];
                          return (
                            <tr key={r.id} style={{ borderBottom:"1px solid #131929" }}>
                              <td style={TD}>{r.short}</td>
                              <td style={TD}>{myStats.roundWins[i]}</td>
                              <td style={{ ...TD, color:"#2ecc71", fontFamily:"'DM Mono',monospace" }}>+${myStats.roundEarned[i].toFixed(2)}</td>
                              <td style={{ ...TD, color:"#e74c3c", fontFamily:"'DM Mono',monospace" }}>-${myStats.roundCost[i].toFixed(2)}</td>
                              <td style={{ ...TD, fontWeight:700, fontFamily:"'DM Mono',monospace",
                                color: net>=0?"#2ecc71":"#e74c3c" }}>{net>=0?"+":""}{net.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                        <tr style={{ background:"#0f1625", fontWeight:700 }}>
                          <td style={TD}>TOTAL</td>
                          <td style={TD}>{allTimeWins}</td>
                          <td style={{ ...TD, color:"#2ecc71", fontFamily:"'DM Mono',monospace" }}>+${myStats.totalEarned.toFixed(2)}</td>
                          <td style={{ ...TD, color:"#e74c3c", fontFamily:"'DM Mono',monospace" }}>-${myStats.totalCost.toFixed(2)}</td>
                          <td style={{ ...TD, fontWeight:800, fontFamily:"'DM Mono',monospace",
                            color: myStats.net>=0?"#2ecc71":"#e74c3c", fontSize:15 }}>
                            {myStats.net>=0?"+":""}{myStats.net.toFixed(2)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* My Leagues History */}
              <div style={S.card}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:"#f0c040", marginBottom:14 }}>
                  🏆 My Leagues
                </div>
                {userLeagues.length === 0 ? (
                  <div style={{ color:"#445", fontSize:13 }}>No leagues joined yet.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[...userLeagues].reverse().map(l => (
                      <button key={l.code} onClick={()=>{ loadLeague(l.code); setTab("leaderboard"); }}
                        style={{ ...S.btn("#0f1625","#dce4f5"), padding:"12px 16px", fontSize:14,
                          borderRadius:10, textAlign:"left", border:`1px solid ${l.code===leagueCode?"#f0c040":"#1e2840"}`,
                          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <div style={{ fontWeight:700 }}>{l.name}</div>
                          <div style={{ fontSize:11, color:"#6677aa", marginTop:2 }}>
                            Code: <span style={{ fontFamily:"'DM Mono',monospace", color:"#f0c040" }}>{l.code}</span>
                            {l.code===leagueCode && <span style={{ color:"#2ecc71", marginLeft:8 }}>● Active</span>}
                          </div>
                        </div>
                        <span style={{ color:"#f0c040" }}>→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

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

              {/* Venmo Payments */}
              <div style={S.card}>
                <SecTitle>💳 Venmo Payments</SecTitle>
                <p style={{ fontSize:13, color:"#6677aa", marginTop:0, marginBottom:12 }}>
                  Non-admin users pay $10 via Venmo to @bracket-bucks-app before creating a league.
                </p>
                <a href="https://venmo.com/u/bracket-bucks-app" target="_blank" rel="noreferrer"
                  style={{ display:"inline-block", textDecoration:"none" }}>
                  <div style={{ background:"#1a2440", border:"1px solid #635BFF", borderRadius:8,
                    padding:"10px 16px", fontSize:13, color:"#635BFF", cursor:"pointer",
                    display:"inline-flex", alignItems:"center", gap:8 }}>
                    💳 View Payments in Venmo ↗
                  </div>
                </a>
              </div>


        
        {/* Payment Approvals */}
        {isAdmin && (
          <PaymentApprovals supabase={supabase} />
        )}

        {/* League Management */}
        <div style={{background:"#0d1528",border:"1px solid #1e2d4a",borderRadius:10,padding:"20px 24px",marginBottom:20}}>
          <div style={{color:"#d4af37",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,marginBottom:12}}>🗑️ LEAGUE MANAGEMENT</div>
          <p style={{fontSize:13,color:"#6677aa",marginBottom:16}}>Delete a league and all its data permanently.</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {owners.length===0 ? <p style={{color:"#445",fontSize:13}}>No leagues found.</p>
              : [...new Set(owners.map(o=>o.league_code))].map(code=>(
                <div key={code} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#131929",borderRadius:8,padding:"10px 14px"}}>
                  <span style={{color:"#dce4f5",fontSize:14}}>{code}</span>
                  <button onClick={()=>deleteLeague(code)} style={{background:"#c0392b",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Delete</button>
                </div>
              ))}
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
                    if (!filled.length) { alert("Enter at least one owner name."); return; }
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
                    alert(`${filled.length} owners saved! 🎉`);
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
                        <input type="number" min="0" step="0.25" value={r.dmg} disabled={draftLive && !adminUnlocked} style={{opacity:(draftLive&&!adminUnlocked)?0.5:1}}
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
                  alert("Payouts reset to defaults.");
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
                        <div style={{ width:10,height:10,borderRadius:"50%",background:o.color,flexShrink:0 }} />

                        {/* Inline name editor */}
                        {editingOwnerNameId === o.id ? (
                          <div style={{ display:"flex", gap:6, flex:1, alignItems:"center", minWidth:160 }}>
                            <input
                              value={editOwnerNameVal}
                              onChange={e => setEditOwnerNameVal(e.target.value)}
                              onKeyDown={async e => {
                                if (e.key === "Enter") {
                                  if (!editOwnerNameVal.trim()) return;
                                  const { error } = await supabase.from("owners").update({ name: editOwnerNameVal.trim() }).eq("id", o.id);
                                  if (error) { alert("Failed to save name."); return; }
                                  setOwners(prev => prev.map(x => x.id === o.id ? { ...x, name: editOwnerNameVal.trim() } : x));
                                  setEditingOwnerNameId(null);
                                  alert(`Name updated to ${editOwnerNameVal.trim()}`);
                                } else if (e.key === "Escape") {
                                  setEditingOwnerNameId(null);
                                }
                              }}
                              autoFocus
                              style={{ ...S.input, padding:"5px 10px", fontSize:13, flex:1 }}
                            />
                            <button onClick={async () => {
                              if (!editOwnerNameVal.trim()) return;
                              const { error } = await supabase.from("owners").update({ name: editOwnerNameVal.trim() }).eq("id", o.id);
                              if (error) { alert("Failed to save name."); return; }
                              setOwners(prev => prev.map(x => x.id === o.id ? { ...x, name: editOwnerNameVal.trim() } : x));
                              setEditingOwnerNameId(null);
                              alert(`Name updated to ${editOwnerNameVal.trim()}`);
                            }} style={{ ...S.btn(), padding:"5px 12px", fontSize:12 }}>Save</button>
                            <button onClick={() => setEditingOwnerNameId(null)}
                              style={{ background:"none", border:"1px solid #2a3560", borderRadius:6,
                                color:"#6677aa", padding:"5px 10px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, minWidth:120 }}>
                            <span style={{ fontWeight:600 }}>{o.name}</span>
                            <button onClick={() => {
                              if (!adminUnlocked) { setModal("pin"); return; }
                              setEditingOwnerNameId(o.id);
                              setEditOwnerNameVal(o.name);
                            }} style={{ background:"none", border:"none", color:"#445", cursor:"pointer",
                              fontSize:12, padding:"2px 4px", fontFamily:"inherit", lineHeight:1 }}
                              title="Edit name">✎</button>
                          </div>
                        )}

                        {editingOwnerNameId !== o.id && (
                          <span style={{ fontSize:12, color:"#445" }}>
                            Seeds: {o.teams.map(t=>t.seed).join(", ")}
                          </span>
                        )}
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>{ if(!adminUnlocked){setModal("pin");return;} supabase.from("owners").delete().eq("id",o.id).then(({error})=>{ if(error){alert("Failed to delete owner.");return;} setOwners(prev=>prev.filter(x=>x.id!==o.id)); alert(`${o.name} removed.`); }); }} style={{
                            background:"#2a1418", border:"1px solid #3a1820",
                            borderRadius:6, color:"#e74c3c", padding:"4px 10px",
                            cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit"
                          }}>🗑</button>
                          <button onClick={()=>adminUnlocked?openTeamEditor(o):setModal("pin")} style={{
                            background:"#1a2440", border:"1px solid #2a3560",
                            borderRadius:6, color:"#f0c040", padding:"4px 12px",
                            cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit"
                          }}>✏️ Edit Teams</button>
                        </div>
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
            
          {isAdmin && (
            <button onClick={shuffleDraftOrder}
              style={{marginTop:20,padding:"10px 28px",background:"#d4af37",color:"#111",border:"none",borderRadius:8,fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:1}}>
              🔀 Randomize Draft Order
            </button>
          )}</div>
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
          onKeyDown={e=>{ if(e.key==="Enter"){ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");setPinError("");alert("Admin unlocked ✓");}else{setPinError("Incorrect PIN.");}}}}
          placeholder="Enter PIN" style={{ ...S.input, letterSpacing:6, fontSize:20, textAlign:"center", marginBottom:8 }} autoFocus />
        {pinError && <div style={{ color:"#e74c3c", fontSize:12, marginBottom:8 }}>{pinError}</div>}
        <button onClick={()=>{ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");setPinError("");alert("Admin unlocked ✓");}else{setPinError("Incorrect PIN.");}}}
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
// build: 1773441631501
