// v1773286522751
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
const _APP_BUILD = "1773204216116";

//  Fonts
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
);

//  Constants


const REGION_COLORS = { South:'#f0c040', Midwest:'#9b59b6', East:'#ffffff', West:'#4a9eff' };
const REGION_MAP = {"Duke Blue Devils":"East","Arizona Wildcats":"West","Michigan Wolverines":"Midwest","Florida Gators":"South","UConn Huskies":"East","Purdue Boilermakers":"West","Iowa State Cyclones":"Midwest","Houston Cougars":"South","Michigan State Spartans":"East","Gonzaga Bulldogs":"West","Virginia Cavaliers":"Midwest","Illinois Fighting Illini":"South","Kansas Jayhawks":"East","Arkansas Razorbacks":"West","Alabama Crimson Tide":"Midwest","Nebraska Cornhuskers":"South","St. John's Red Storm":"East","Wisconsin Badgers":"West","Texas Tech Red Raiders":"Midwest","Vanderbilt Commodores":"South","Louisville Cardinals":"East","BYU Cougars":"West","Tennessee Volunteers":"Midwest","North Carolina Tar Heels":"South","UCLA Bruins":"East","Miami Hurricanes":"West","Kentucky Wildcats":"Midwest","Saint Mary's Gaels":"South","Ohio State Buckeyes":"East","Villanova Wildcats":"West","Georgia Bulldogs":"Midwest","Clemson Tigers":"South","TCU Horned Frogs":"East","Utah State Aggies":"West","Saint Louis Billikens":"Midwest","Troy Trojans":"South","UCF Knights":"East","Missouri Tigers":"West","Howard Bison":"Midwest","VCU Rams":"South","South Florida Bulls":"East","High Point Panthers":"West","Hofstra Pride":"Midwest","Idaho Vandals":"South","California Baptist Lancers":"East","Kennesaw State Owls":"West","Tennessee State Tigers":"Midwest","Prairie View A&M Panthers":"South","Siena Saints":"East","Queens University Royals":"West","Wright State Raiders":"Midwest","McNeese Cowboys":"South","North Dakota State Bison":"East","Hawai'i Rainbow Warriors":"West","Santa Clara Broncos":"Midwest","Texas A&M Aggies":"South","Northern Iowa Panthers":"East","Long Island University Sharks":"West","Akron Zips":"Midwest","Iowa Hawkeyes":"South","Furman Paladins":"East","NC State Wolfpack":"West","Penn Quakers":"South","Texas Longhorns":"West","SMU Mustangs":"Midwest","Lehigh Mountain Hawks":"South","UMBC Retrievers":"Midwest","Miami (Ohio) RedHawks":"Midwest"};
const DEFAULT_ROUNDS = [
  { id: 0, label: "Round 1",      short: "R1",  dmg: 0.50 },
  { id: 1, label: "Round of 32",  short: "R32", dmg: 1.00 },
  { id: 2, label: "Sweet 16",     short: "S16", dmg: 1.50 },
  { id: 3, label: "Elite Eight",  short: "E8",  dmg: 2.00 },
  { id: 4, label: "Final Four",   short: "FF",  dmg: 2.50 },
  { id: 5, label: "Championship", short: "NCG", dmg: 3.00 },
];


//  2026 NCAA Tournament Teams (editable each Selection Sunday) 
const NCAA_2026_TEAMS = [
  // SOUTH REGION  No. 1 seed: Florida
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
  // EAST REGION  No. 1 seed: Duke
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
  // WEST REGION  No. 1 seed: Arizona
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
  // MIDWEST REGION  No. 1 seed: Michigan
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

//  2025 NCAA Tournament Bracket Data 
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



//  Scoring engine (identical to spreadsheet logic)
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

//  Styles
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

//  Tiny components
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
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#667", fontSize:22, cursor:"pointer" }}>X</button>
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
      <div style={{ fontSize:30, marginBottom:10 }}>-</div>
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
      <div style={{ fontSize:30, marginBottom:12, animation:"spin 1s linear infinite", display:"inline-block" }}></div>
      <p style={{ margin:0 }}>Loading</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}



//  Main App 

//  2026 Bracket Tab Component 
function Bracket2026Tab({ owners }) {
  const [games, setGames] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const [activeRegion, setActiveRegion] = React.useState("All");

  const REGION_COLORS = { South:"#e74c3c", East:"#3498db", West:"#2ecc71", Midwest:"#f39c12" };

  const load = () => {
      const mapEv = (ev) => {
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
        let region = "Unknown";
        ["South","East","West","Midwest"].forEach(r => { if(note.includes(r)) region=r; });
        let round = "First Round";
        if(note.includes("First Four")) round="First Four";
        else if(note.includes("1st Round")) round="First Round";
        else if(note.includes("2nd Round")) round="Second Round";
        else if(note.includes("Sweet 16")) round="Sweet 16";
        else if(note.includes("Elite 8")||note.includes("Elite Eight")||note.includes("Regional")) round="Elite Eight";
        else if(note.includes("Final Four")) round="Final Four";
        else if(note.includes("National Championship")||note.includes("Championship")) round="Championship";
        return {
          id: ev.id, name: ev.name, date: ev.date,
          status: comp.status?.type?.description || "Scheduled",
          statusDetail: comp.status?.type?.detail || "",
          completed: comp.status?.type?.completed || false,
          isLive: comp.status?.type?.state==="in",
          venue: comp.venue?.fullName || "",
          broadcast: comp.broadcasts?.[0]?.names?.[0] || "",
          teams, region, round, note,
        };
      };
      const base='https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200';
      const dates=['20260318','20260319','20260320','20260321','20260322','20260326','20260327','20260328','20260329','20260404','20260406'];
      Promise.all(dates.map(dt=>fetch(base+'&dates='+dt).then(r=>r.json()).catch(()=>({events:[]}))))
      .then(results=>{
        const seen=new Set();
        const mapped=[];
        results.forEach(data=>{(data.events||[]).forEach(ev=>{if(!seen.has(ev.id)){seen.add(ev.id);mapped.push(mapEv(ev));}});});
        setGames(mapped);
        setLoading(false);
        setLastUpdated(new Date());
      }).catch(e=>{setError("Failed to load bracket data");setLoading(false);});
  };
  React.useEffect(() => {
    load();
    const draftPoll = setInterval(load, 5000);
    return () => clearInterval(draftPoll);
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
  const roundOrderAsc=["First Four","First Round","Second Round","Sweet 16","Elite Eight","Final Four","Championship"];
  // Group 1: rounds with live or scheduled games (earliest round first)
  const activeRounds=roundOrderAsc.filter(r=>grouped[r]&&grouped[r].some(g=>!g.completed));
  // Group 2: rounds fully completed (most recently completed round first)
  const doneRounds=[...roundOrderAsc].reverse().filter(r=>grouped[r]&&grouped[r].every(g=>g.completed));
  // Group 3: future rounds with no games yet (earliest first)
  const futureRounds=roundOrderAsc.filter(r=>!grouped[r]);
  const sortedRounds=[...activeRounds,...doneRounds,...futureRounds];

  if(loading) return (
    <div style={{textAlign:"center",padding:60,color:"#6677aa"}}>
      <div style={{fontSize:32,marginBottom:12}}></div>
      <div>Loading 2026 bracket data...</div>
    </div>
  );
  if(error) return <div style={{color:"#e74c3c",padding:20}}>{error}</div>;

  return (
    <div>
      <div style={{marginBottom:20}}>
        <h2 style={{margin:"0 0 4px",fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:1}}>2026 NCAA Tournament Bracket</h2>
        <p style={{color:"#6677aa",fontSize:13,margin:0}}>Live data via ESPN  {games.length} games{lastUpdated?"  Updated "+lastUpdated.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})+" ":""}</p>
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
      {sortedRounds.map(round => {
        const rGames = grouped[round];
        if (!rGames) return null;
        return (
          <div key={round} style={{marginBottom:28}}>
            <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:2,
              color:"#d4af37",marginBottom:10,paddingBottom:4,borderBottom:"1px solid #1e2d4a"}}>
              {round}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[...rGames].sort((a,b)=>a.completed-b.completed).map(game => {
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
                        {game.broadcast&&<span style={{color:"#6677aa",fontSize:11}}> {game.broadcast}</span>}
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{color:game.completed?"#2ecc71":game.status==="In Progress"?"#f39c12":"#6677aa",fontSize:11}}>
                          {game.completed?"Final":game.isLive?"LIVE - "+game.statusDetail:dateStr}
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
                            {(game.completed||game.isLive)&&<span style={{fontSize:15,fontWeight:800,minWidth:24,textAlign:"right",
                              color:team.winner?"#2ecc71":game.isLive?"#f0c040":"#556"}}>
                              {team.score}
                            </span>}
                          </div>
                        );
                      })}
                    </div>
                    {/* Venue */}
                    {game.venue&&<div style={{marginTop:6,fontSize:11,color:"#445"}}> {game.venue}</div>}
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


//  Payment Approvals Component 
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
         PAYMENT APPROVALS
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
                   Approve
                </button>
                <button onClick={()=>deny(p.id)} style={{background:"#c0392b",color:"#fff",border:"none",borderRadius:6,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                   Deny
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
                  <div style={{color:"#27ae60",fontSize:11}}> Approved</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

















function TopTeams({owners,leagueCode,rounds}){
  const RV=[0.50,1.00,1.50,2.00,2.50,3.00];
  const [wins,setWins]=React.useState([]);
  const [lastUpdate,setLastUpdate]=React.useState('');
  React.useEffect(()=>{
    function fetchWins(){
      if(!leagueCode) return;
      fetch('https://cxkqkmakwynpgqpfzvtp.supabase.co/rest/v1/wins?league_code=eq.'+leagueCode,{headers:{'apikey':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3FrbWFrd3lucGdxcGZ6dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODEwMDIsImV4cCI6MjA4ODE1NzAwMn0.biNsjhSH3HcuWG9q25XO5CRpiTkdmpF59iLAOCk8yUE','Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3FrbWFrd3lucGdxcGZ6dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODEwMDIsImV4cCI6MjA4ODE1NzAwMn0.biNsjhSH3HcuWG9q25XO5CRpiTkdmpF59iLAOCk8yUE'}})
        .then(r=>r.json()).then(w=>{if(Array.isArray(w)){setWins(w);setLastUpdate(new Date().toLocaleTimeString());}}).catch(()=>{});
    }
    fetchWins();
    const t=setInterval(fetchWins,60000);
    return()=>clearInterval(t);
  },[leagueCode]);
  const ownerMap={};
  owners.forEach(o=>ownerMap[o.id]=o);
  const numOwners=owners.length||1;

  // Build profit per team
  const teamMap={};
  wins.forEach(w=>{
    const owner=ownerMap[w.owner_id];
    if(!owner) return;
    const team=owner.teams[w.team_index];
    if(!team) return;
    const rv=RV[w.round_id]||0;
    const profit=team.seed*rv*(numOwners-1);
    const key=owner.id+'-'+w.team_index;
    if(!teamMap[key]) teamMap[key]={name:team.name,seed:team.seed,teamIndex:w.team_index,ownerNum:owner.num,owner:owner.name,profit:0,wins:0};
    teamMap[key].profit+=profit;
    teamMap[key].wins++;
  });

  const sorted=Object.values(teamMap).sort((a,b)=>b.profit-a.profit).slice(0,5);

  const RC={South:'#f0c040',Midwest:'#9b59b6',East:'#ffffff',West:'#4a9eff'};
  const REGION_MAP={
    'Duke Blue Devils':'East','Siena Saints':'East','Ohio State Buckeyes':'East','TCU Horned Frogs':'East',"St. John's Red Storm":'East','Northern Iowa Panthers':'East','Kansas Jayhawks':'East','California Baptist Lancers':'East','Louisville Cardinals':'East','South Florida Bulls':'East','Michigan State Spartans':'East','North Dakota State Bison':'East','UCLA Bruins':'East','UCF Knights':'East','UConn Huskies':'East','Furman Paladins':'East',
    'Arizona Wildcats':'West','Long Island University Sharks':'West','Villanova Wildcats':'West','Utah State Aggies':'West','Wisconsin Badgers':'West','High Point Panthers':'West','Arkansas Razorbacks':'West',"Hawai'i Rainbow Warriors":'West','BYU Cougars':'West','Texas Longhorns':'West','Gonzaga Bulldogs':'West','Kennesaw State Owls':'West','Miami Hurricanes':'West','Missouri Tigers':'West','Purdue Boilermakers':'West','Queens University Royals':'West',
    'Florida Gators':'South','Prairie View A&M Panthers':'South','Clemson Tigers':'South','Iowa Hawkeyes':'South','Vanderbilt Commodores':'South','McNeese Cowboys':'South','Nebraska Cornhuskers':'South','Troy Trojans':'South','North Carolina Tar Heels':'South','VCU Rams':'South','Illinois Fighting Illini':'South','Pennsylvania Quakers':'South',"Saint Mary's Gaels":'South','Texas A&M Aggies':'South','Houston Cougars':'South','Idaho Vandals':'South',
    'Michigan Wolverines':'Midwest','Howard Bison':'Midwest','Georgia Bulldogs':'Midwest','Saint Louis Billikens':'Midwest','Texas Tech Red Raiders':'Midwest','Akron Zips':'Midwest','Alabama Crimson Tide':'Midwest','Hofstra Pride':'Midwest','Tennessee Volunteers':'Midwest','Miami (OH) RedHawks':'Midwest','Virginia Cavaliers':'Midwest','Wright State Raiders':'Midwest','Kentucky Wildcats':'Midwest','Santa Clara Broncos':'Midwest','Iowa State Cyclones':'Midwest','Tennessee State Tigers':'Midwest'
  };

  const medals=['1st','2nd','3rd','4th','5th'];
  const medalColors=['#f0c040','#aab4c8','#cd7f32','#6677aa','#6677aa'];

  if(!owners.length) return React.createElement('div',{style:{textAlign:'center',padding:40,color:'#556'}},'No league data loaded.');
  if(!sorted.length) return React.createElement('div',{style:{textAlign:'center',padding:40,color:'#556'}},'No wins recorded yet.');

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2}}>Top Teams</h2>{lastUpdate&&<span style={{fontSize:11,color:'#445'}}>Updated {lastUpdate}</span>}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {sorted.map((t,i)=>{
          const region=REGION_MAP[t.name]||'East';
          const rc=RC[region]||'#ccd';
          return (
            <div key={i} style={{background:'#0f1625',border:'1px solid #1e2840',borderRadius:10,padding:'16px 20px',display:'flex',alignItems:'center',gap:16}}>
              <div style={{fontSize:22,fontWeight:900,fontFamily:"'Bebas Neue',sans-serif",color:medalColors[i],minWidth:40,textAlign:'center'}}>{medals[i]}</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:700,background:'#1a2440',color:'#6677aa',borderRadius:4,padding:'2px 7px',flexShrink:0}}>Seed {t.seed}</span>
                  <span style={{fontSize:16,fontWeight:700,color:rc}}>{t.name}</span>
                  <span style={{fontSize:12,color:'#556',marginLeft:4}}>{region}</span>
                </div>
                <div style={{display:'flex',gap:16,flexWrap:'wrap',fontSize:12,color:'#778'}}>
                  <span>Owner: <span style={{color:'#dce4f5',fontWeight:600}}>{t.owner}</span></span>
                  <span>Draft: <span style={{color:'#dce4f5',fontWeight:600}}>{(()=>{const rd=t.teamIndex+1;const pick=rd%2===1?t.ownerNum:numOwners-t.ownerNum+1;return 'Rd '+rd+', Pick '+pick;})()}</span></span>
                  <span>Wins: <span style={{color:'#2ecc71',fontWeight:600}}>{t.wins}</span></span>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:24,fontWeight:900,fontFamily:"'DM Mono',monospace",color:'#2ecc71'}}>${t.profit.toFixed(2)}</div>
                <div style={{fontSize:10,color:'#445'}}>earned</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveBracket(){
  const RC={South:'#f0c040',Midwest:'#9b59b6',East:'#ffffff',West:'#4a9eff'};
  // Bracket seed order: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
  // R2 slot 0 = winners of matches 0+1 (seeds 1,16,8,9)
  // R2 slot 1 = winners of matches 2+3 (seeds 5,12,4,13)
  // R2 slot 2 = winners of matches 4+5 (seeds 6,11,3,14)
  // R2 slot 3 = winners of matches 6+7 (seeds 7,10,2,15)
  const R2P=[[1,16,8,9],[5,12,4,13],[6,11,3,14],[7,10,2,15]];
  const S16P=[[1,16,8,9,5,12,4,13],[6,11,3,14,7,10,2,15]];
  const E8P=[[1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15]];
  const PAIRS=[[1,16],[8,9],[5,12],[4,13],[6,11],[3,14],[7,10],[2,15]];
  const BRACKET={East:[{t:{s:1,n:'Duke Blue Devils'},b:{s:16,n:'Siena Saints'}},{t:{s:8,n:'Ohio State Buckeyes'},b:{s:9,n:'TCU Horned Frogs'}},{t:{s:5,n:"St. John's Red Storm"},b:{s:12,n:'Northern Iowa Panthers'}},{t:{s:4,n:'Kansas Jayhawks'},b:{s:13,n:'California Baptist Lancers'}},{t:{s:6,n:'Louisville Cardinals'},b:{s:11,n:'South Florida Bulls'}},{t:{s:3,n:'Michigan State Spartans'},b:{s:14,n:'North Dakota State Bison'}},{t:{s:7,n:'UCLA Bruins'},b:{s:10,n:'UCF Knights'}},{t:{s:2,n:'UConn Huskies'},b:{s:15,n:'Furman Paladins'}}],West:[{t:{s:1,n:'Arizona Wildcats'},b:{s:16,n:'Long Island University Sharks'}},{t:{s:8,n:'Villanova Wildcats'},b:{s:9,n:'Utah State Aggies'}},{t:{s:5,n:'Wisconsin Badgers'},b:{s:12,n:'High Point Panthers'}},{t:{s:4,n:'Arkansas Razorbacks'},b:{s:13,n:"Hawai'i Rainbow Warriors"}},{t:{s:6,n:'BYU Cougars'},b:{s:11,n:'Texas Longhorns'}},{t:{s:3,n:'Gonzaga Bulldogs'},b:{s:14,n:'Kennesaw State Owls'}},{t:{s:7,n:'Miami Hurricanes'},b:{s:10,n:'Missouri Tigers'}},{t:{s:2,n:'Purdue Boilermakers'},b:{s:15,n:'Queens University Royals'}}],South:[{t:{s:1,n:'Florida Gators'},b:{s:16,n:'Prairie View A&M Panthers'}},{t:{s:8,n:'Clemson Tigers'},b:{s:9,n:'Iowa Hawkeyes'}},{t:{s:5,n:'Vanderbilt Commodores'},b:{s:12,n:'McNeese Cowboys'}},{t:{s:4,n:'Nebraska Cornhuskers'},b:{s:13,n:'Troy Trojans'}},{t:{s:6,n:'North Carolina Tar Heels'},b:{s:11,n:'VCU Rams'}},{t:{s:3,n:'Illinois Fighting Illini'},b:{s:14,n:'Pennsylvania Quakers'}},{t:{s:7,n:"Saint Mary's Gaels"},b:{s:10,n:'Texas A&M Aggies'}},{t:{s:2,n:'Houston Cougars'},b:{s:15,n:'Idaho Vandals'}}],Midwest:[{t:{s:1,n:'Michigan Wolverines'},b:{s:16,n:'Howard Bison'}},{t:{s:8,n:'Georgia Bulldogs'},b:{s:9,n:'Saint Louis Billikens'}},{t:{s:5,n:'Texas Tech Red Raiders'},b:{s:12,n:'Akron Zips'}},{t:{s:4,n:'Alabama Crimson Tide'},b:{s:13,n:'Hofstra Pride'}},{t:{s:6,n:'Tennessee Volunteers'},b:{s:11,n:'Miami (OH) RedHawks'}},{t:{s:3,n:'Virginia Cavaliers'},b:{s:14,n:'Wright State Raiders'}},{t:{s:7,n:'Kentucky Wildcats'},b:{s:10,n:'Santa Clara Broncos'}},{t:{s:2,n:'Iowa State Cyclones'},b:{s:15,n:'Tennessee State Tigers'}}]};

  const gRef=React.useRef({});
  const [tick,setTick]=React.useState(0);
  const [lastUpdate,setLastUpdate]=React.useState('');
  const BW=148,GH=43,GP=5,TH=8*(GH+GP)-GP;

  function fetchGames(){
    const base='https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200';
    Promise.all(['20260319','20260320','20260321','20260322','20260326','20260327','20260328','20260329','20260404','20260406'].map(dt=>
      fetch(base+'&dates='+dt).then(r=>r.json()).catch(()=>({events:[]}))
    )).then(results=>{
      const map={};
      results.forEach(data=>{
        (data.events||[]).forEach(g=>{
          const note=g.competitions?.[0]?.notes?.[0]?.headline||'';
          const parts=note.split(' - ');
          let region='',round='';
          parts.forEach(p=>{
            if(/^(East|West|Midwest|South) Region$/.test(p)) region=p.split(' ')[0];
            if(p==='1st Round') round='1st Round';
            else if(p==='2nd Round') round='2nd Round';
            else if(p==='Sweet 16') round='Sweet 16';
            else if(p==='Elite 8') round='Elite 8';
            else if(p==='Final Four') round='Final Four';
            else if(p==='National Championship') round='National Championship';
          });
          if(!round) return;
          const comps=g.competitions?.[0]?.competitors||[];
          const ss=[...comps].sort((a,b)=>(a.curatedRank?.current||99)-(b.curatedRank?.current||99));
          const s0=ss[0]||{},s1=ss[1]||{};
          const key=region+'|'+round+'|'+(s0.curatedRank?.current||'X')+'v'+(s1.curatedRank?.current||'X');
          const done=!!g.status?.type?.completed,live=g.status?.type?.state==='in';
          if(!map[key]||done||live){
            map[key]={t:{s:s0.curatedRank?.current,n:s0.team?.displayName||'',sc:s0.score||'',w:!!s0.winner},b:{s:s1.curatedRank?.current,n:s1.team?.displayName||'',sc:s1.score||'',w:!!s1.winner},done,live,region,round};
          }
        });
      });
      gRef.current=map;
      const nd=Object.values(map).filter(g=>g.done).length;
      console.log('LiveBracket:',Object.keys(map).length,'games',nd,'done. R1 sample:',Object.entries(map).filter(([,g])=>g.done&&g.round==='1st Round').slice(0,3).map(([k,g])=>'['+k+'=>'+(g.t.w?g.t.n:g.b.n)+']').join(' '));
      setLastUpdate(new Date().toLocaleTimeString());
      setTick(t=>t+1);
    });
  }

  React.useEffect(()=>{fetchGames();const t=setInterval(fetchGames,60000);return()=>clearInterval(t);},[]);

  const G=gRef.current;

  // Find R1 game by exact seed pair
  const getR1=(region,s1,s2)=>Object.values(G).find(g=>
    g.region===region&&g.round==='1st Round'&&
    ((g.t.s===s1&&g.b.s===s2)||(g.t.s===s2&&g.b.s===s1))
  )||null;

  // Find game in a round where at least one team's seed is in the given pool
  const getByPool=(region,round,pool)=>Object.values(G).find(g=>
    g.region===region&&g.round===round&&(pool.includes(g.t.s)||pool.includes(g.b.s))
  )||null;

  const getLatRound=round=>Object.values(G).filter(g=>g.round===round);

  function TR({name,seed,lg,done,live,rc}){
    const w=done&&lg&&lg.w,l=done&&lg&&!lg.w,nc=l?'#333':(rc||'#ccd'),disp=lg?.n||name;
    return <div style={{display:'flex',alignItems:'center',gap:3,height:18}}>
      <span style={{fontSize:8,color:'#556',width:12,textAlign:'right',flexShrink:0,fontWeight:700}}>{seed}</span>
      <span style={{fontSize:9,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:nc,fontWeight:w?700:400,textDecoration:l?'line-through':'none'}}>{disp}</span>
      {(done||live)&&<span style={{fontSize:9,fontWeight:700,minWidth:22,textAlign:'right',flexShrink:0,color:live?'#f0c040':l?'#444':(rc||'#ccd')}}>{lg?.sc}</span>}
    </div>;
  }

  function GB({base,liveG,rc}){
    const c=rc||'#ccd',g=liveG,bdr=g?.live?'#e74c3c55':g?.done?'#2ecc7122':'#1e2a3a';
    return <div style={{width:BW,background:'#0f1625',border:'1px solid '+bdr,borderRadius:4,padding:'4px 6px',position:'relative'}}>
      {g?.live&&<div style={{position:'absolute',top:-7,right:2,background:'#e74c3c',color:'#fff',fontSize:6,fontWeight:700,padding:'0 2px',borderRadius:1}}>LIVE</div>}
      {g?.done&&<div style={{position:'absolute',top:-7,right:2,background:'#1a3a1a',color:'#2ecc71',fontSize:6,fontWeight:700,padding:'0 2px',borderRadius:1}}>F</div>}
      {base
        ?<><TR name={base.t.n} seed={base.t.s} lg={g?.t||null} done={!!g?.done} live={!!g?.live} rc={c}/><div style={{height:1,background:'#1e2a3a',margin:'2px 0'}}/><TR name={base.b.n} seed={base.b.s} lg={g?.b||null} done={!!g?.done} live={!!g?.live} rc={c}/></>
        :g
          ?<><TR name={g.t.n} seed={g.t.s} lg={g.t} done={g.done} live={g.live} rc={c}/><div style={{height:1,background:'#1e2a3a',margin:'2px 0'}}/><TR name={g.b.n} seed={g.b.s} lg={g.b} done={g.done} live={g.live} rc={c}/></>
          :<><div style={{height:18,display:'flex',alignItems:'center'}}><span style={{fontSize:8,color:'#1e2a3a',marginLeft:14}}>TBD</span></div><div style={{height:1,background:'#1e2a3a',margin:'2px 0'}}/><div style={{height:18,display:'flex',alignItems:'center'}}><span style={{fontSize:8,color:'#1e2a3a',marginLeft:14}}>TBD</span></div></>
      }
    </div>;
  }

  function Lbl({t,dt}){return <div style={{fontSize:7.5,textAlign:'center',marginBottom:4,lineHeight:1.4}}><span style={{color:'#778',fontWeight:600}}>{t}</span><br/><span style={{color:'#445',fontSize:6.5}}>{dt}</span></div>;}

  function SlotCol({region,round,pools,n,rc}){
    const h=Math.floor((TH+GP)/n)-GP;
    return <div style={{height:TH,display:'flex',flexDirection:'column'}}>
      {Array.from({length:n}).map((_,i)=>(
        <div key={i} style={{height:h+GP,display:'flex',alignItems:'center'}}>
          <GB liveG={getByPool(region,round,pools[i]||[])} rc={rc}/>
        </div>
      ))}
    </div>;
  }

  function RL({name}){
    const c=RC[name];
    return <div style={{display:'flex',flexDirection:'column'}}>
      <div style={{fontSize:11,fontWeight:700,color:c,textTransform:'uppercase',letterSpacing:2,marginBottom:5}}>{name}</div>
      <div style={{display:'flex',gap:3,alignItems:'flex-start'}}>
        <div><Lbl t="First Round" dt="Mar 19-20"/><div>{PAIRS.map(([s1,s2],i)=><div key={i} style={{marginBottom:GP}}><GB base={BRACKET[name][i]} liveG={getR1(name,s1,s2)} rc={c}/></div>)}</div></div>
        <div><Lbl t="2nd Round" dt="Mar 21-22"/><SlotCol region={name} round="2nd Round" pools={R2P} n={4} rc={c}/></div>
        <div><Lbl t="Sweet 16" dt="Mar 26-27"/><SlotCol region={name} round="Sweet 16" pools={S16P} n={2} rc={c}/></div>
        <div><Lbl t="Elite 8" dt="Mar 28-29"/><SlotCol region={name} round="Elite 8" pools={E8P} n={1} rc={c}/></div>
      </div>
    </div>;
  }

  function RR({name}){
    const c=RC[name];
    return <div style={{display:'flex',flexDirection:'column'}}>
      <div style={{fontSize:11,fontWeight:700,color:c,textTransform:'uppercase',letterSpacing:2,marginBottom:5,textAlign:'right'}}>{name}</div>
      <div style={{display:'flex',gap:3,alignItems:'flex-start'}}>
        <div><Lbl t="Elite 8" dt="Mar 28-29"/><SlotCol region={name} round="Elite 8" pools={E8P} n={1} rc={c}/></div>
        <div><Lbl t="Sweet 16" dt="Mar 26-27"/><SlotCol region={name} round="Sweet 16" pools={S16P} n={2} rc={c}/></div>
        <div><Lbl t="2nd Round" dt="Mar 21-22"/><SlotCol region={name} round="2nd Round" pools={R2P} n={4} rc={c}/></div>
        <div><Lbl t="First Round" dt="Mar 19-20"/><div>{PAIRS.map(([s1,s2],i)=><div key={i} style={{marginBottom:GP}}><GB base={BRACKET[name][i]} liveG={getR1(name,s1,s2)} rc={c}/></div>)}</div></div>
      </div>
    </div>;
  }

  const ff=getLatRound('Final Four'),ch=getLatRound('National Championship');
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
      <h2 style={{margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2}}>Live Bracket</h2>
      <div style={{display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
        {Object.entries(RC).map(([r,c])=><div key={r} style={{display:'flex',alignItems:'center',gap:5,fontSize:11}}><div style={{width:9,height:9,borderRadius:2,background:c}}/><span style={{color:c,fontWeight:600}}>{r}</span></div>)}
        <span style={{fontSize:10,color:'#445'}}>Auto-updates every 60s{lastUpdate?' | '+lastUpdate:''}</span>
        <button onClick={fetchGames} style={{fontSize:11,background:'#1a2440',border:'1px solid #2a3a5a',color:'#8899cc',borderRadius:5,padding:'4px 12px',cursor:'pointer'}}>Refresh</button>
      </div>
    </div>
    <div style={{overflowX:'auto'}}>
      <div style={{display:'flex',gap:6,alignItems:'flex-start',minWidth:1400}}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}><RL name="East"/><RL name="South"/></div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:160,paddingTop:20,gap:8}}>
          <div style={{fontSize:8,color:'#556',textTransform:'uppercase',letterSpacing:1,textAlign:'center'}}>Final Four<br/><span style={{fontSize:7,color:'#334'}}>April 4</span></div>
          <GB liveG={ff[0]||null}/><div style={{height:4}}/><GB liveG={ff[1]||null}/>
          <div style={{height:8}}/>
          <div style={{fontSize:8,color:'#556',textTransform:'uppercase',letterSpacing:1,textAlign:'center'}}>Championship<br/><span style={{fontSize:7,color:'#334'}}>April 6</span></div>
          <GB liveG={ch[0]||null}/>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}><RR name="West"/><RR name="Midwest"/></div>
      </div>
    </div>
  </div>;
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
  const [autoSync, setAutoSync]     = useState(false);
  const [eliminatedTeams, setEliminatedTeams] = useState(new Set());
  const [lastSync, setLastSync]       = useState(null);
  const [syncLog, setSyncLog]         = useState([]);

  // Bracket
  const [bracketData, setBracketData]     = useState(null);
  const [bracketStatus, setBracketStatus] = useState("idle");

  // Draft state
  const [pickTimer, setPickTimer]         = useState(15);    // seconds left for current pick
  const [draftLive, setDraftLive]         = useState(false);

  function alert(msg, type="success") {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3200);
  }

  //  Auth init 
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

  //  Load league from Supabase 
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



  


  //  Real-time subscription 
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

  //  League ops 
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

  //  Seed CHI2025 if clicked directly 
  async function loadCHI2025() {
    setLoading(true);
    // Try to load  if it doesn't exist, create it and seed owners
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

  //  Add owner 
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

  //  Record win 
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
    alert(` ${team?.name} win recorded for ${owner?.name}`);
    setWinTeamIdx("");
    setModal(null);
  }

  //  Remove win 
  async function removeWin(winId) {
    const { error } = await supabase.from("wins").delete().eq("id", winId);
    if (error) alert("Failed to remove win.");
    else alert("Win removed.");
  }

  //  Edit teams 
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

  //  Bracket 
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
          status: e.status?.type?.description || "",
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

  //  ESPN 
  async function fetchESPN() {
    setEspnStatus("loading");
    try {
      const res = await fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEspnGames((data.events||[]).map(e=>({
        id:e.id, name:e.name,
        status:e.status?.type?.description||"",
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


  //  ESPN round mapping 
  const ESPN_ROUND_MAP = {
    "1st Round": 0,
    "First Round": 0,
    "2nd Round": 1,
    "Second Round": 1,
    "Sweet 16": 2,
    "Elite 8": 3,
    "Elite Eight": 3,
    "Final Four": 4,
    "National Championship": 5,
    "First Four": null,
  };

  //  Auto-sync ESPN wins 
  async function autoSyncESPN() {
    if (!leagueCode || !owners.length) return;
    try {
      const _base="https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200";
      const _dates=["20260318","20260319","20260320","20260321","20260322","20260326","20260327","20260328","20260329","20260404","20260406"];
      const _results=await Promise.all(_dates.map(dt=>fetch(_base+"&dates="+dt).then(r=>r.json()).catch(()=>({events:[]}))));
      const _seen=new Set();const games=[];_results.forEach(d=>(d.events||[]).forEach(ev=>{if(!_seen.has(ev.id)){_seen.add(ev.id);games.push(ev);}}));


      for (const game of games) {
        if (!game.status?.type?.completed) continue;
        const roundName = game.competitions?.[0]?.notes?.[0]?.headline || "";
      const lastPart=roundName.split(" - ").pop().trim();const roundId=ESPN_ROUND_MAP.hasOwnProperty(lastPart)?ESPN_ROUND_MAP[lastPart]:undefined;
        if (roundId===null||roundId===undefined) continue;

    if (roundId===5 && new Date()<new Date("2026-04-06T00:00:00")) continue; // skip First Four or unknown rounds

        const competitors = game.competitions?.[0]?.competitors || [];
        const winner = competitors.find(c => c.winner);
        if (!winner) continue;
        const winnerName = winner.team?.displayName?.toLowerCase().trim();

        // Check each owner's roster for this winner
        for (const owner of owners) {
          if (!owner.teams) continue;
          owner.teams.forEach((team, teamIdx) => {
            const teamName = (typeof team === 'string' ? team : team?.name || '').toLowerCase().trim();
            if (!teamName) return;
            // Fuzzy match - check if ESPN name contains team name or vice versa
            if (winnerName === teamName) {

              newWins.push({owner, teamIdx, roundId, teamName, winnerName, roundName});
            }
          });
        }
      }

      // Insert wins that don't already exist
      let inserted = 0;
      for (const w of newWins) {
        const alreadyExists = wins.some(existing =>
          existing.owner_id === w.owner.id &&
          existing.round_id === w.roundId &&
          existing.team_index === w.teamIdx
        );
        if (alreadyExists) continue;

    // Date gate: cap auto-sync round based on tournament calendar
    const _today=new Date();
    const _maxRound=_today<new Date('2026-04-04')?3:_today<new Date('2026-04-06')?4:5;
    if(w.roundId>_maxRound){console.log('Auto-sync blocked: roundId',w.roundId,'> max',_maxRound,'for',winnerName);continue;}
        const { error } = await supabase.from("wins").insert({
          league_code: leagueCode,
          owner_id: w.owner.id,
          round_id: w.roundId,
          team_index: w.teamIdx,
        });
        if (!error) {
          inserted++;
          setSyncLog(prev => [{
            time: new Date().toLocaleTimeString(),
            msg: w.owner.name + " - " + w.winnerName + " (" + w.roundName + ")"
          }, ...prev.slice(0, 19)]);
        }
      }

      setLastSync(new Date());
      if (inserted > 0) {
        // Reload wins
        const { data: newWinsData } = await supabase.from("wins").select("*").eq("league_code", leagueCode);
        if (newWinsData) setWins(newWinsData);
      }
    } catch(e) { console.error("autoSyncESPN error:", e); }
  }

  //  Auto-sync interval 
  React.useEffect(() => {


    if (!autoSync || !leagueCode) return;
    autoSyncESPN(); // run immediately
    const interval = setInterval(autoSyncESPN, 60000);
    return () => clearInterval(interval);
  }, [autoSync, leagueCode, owners, wins]);

  // Fetch eliminated teams from ESPN
  React.useEffect(() => {
    function fetchElim() {
      const base='https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200';
          const dates=['20260318','20260319','20260320','20260321','20260322','20260326','20260327','20260328','20260329','20260404','20260406'];
          Promise.all(dates.map(dt=>fetch(base+'&dates='+dt).then(r=>r.json()).catch(()=>({events:[]}))))
          .then(results=>{
            const elim=new Set();
            results.forEach(data=>{(data.events||[]).forEach(g=>{
              if(!g.status?.type?.completed) return;
              const loser=(g.competitions?.[0]?.competitors||[]).find(c=>!c.winner);
              if(loser?.team?.displayName){
              elim.add(loser.team.displayName);
              // Add aliases for teams stored with shortened names in DB
              const aliases={"Long Island University Sharks":"LIU Sharks","Queens University Royals":"Queens Royals","Miami (OH) RedHawks":"Miami (OH) RedHawks","Pennsylvania Quakers":"Penn Quakers"};
              if(aliases[loser.team.displayName]) elim.add(aliases[loser.team.displayName]);
            }
            });});
            setEliminatedTeams(elim);
          }).catch(()=>{});
    }
    fetchElim();
    const t = setInterval(fetchElim, 60000);
    return () => clearInterval(t);
  }, []);

  const stats = calcStats(owners, wins, rounds);
  const totalWins = wins.length;

  const TABS = [
    {id:"leaderboard", icon:"", label:"Leaderboard"},
    {id:"wins",        icon:"", label:"Win Tracker"},
    {id:"espn",        icon:"", label:"Live Scores"},
    {id:"livebracket", icon:"", label:"Live Bracket"},
    {id:"bracket2026", icon:"", label:"Schedule"},
    {id:"roster",      icon:"", label:"Rosters"},
    {id:"topteams",    icon:"", label:"Top Teams"},
    {id:"payouts",     icon:"", label:"Payout Table"},
    {id:"bracket2025", icon:"", label:"2025 Bracket"},
    {id:"draft",       icon:"", label:"Draft"},
    {id:"profile",     icon:"", label:"My Profile"},
    {id:"admin",       icon:"", label:"Admin"},
  ];

  //  Auth screen 
  if (authLoading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0c1120", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <FontLink />
        <div style={{ color:"#6677aa", fontSize:16 }}>Loading</div>
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
            <div style={{ fontSize:52, marginBottom:12 }}></div>
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
                placeholder={isSignUp?"At least 6 characters":""} style={S.input}
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
              {authWorking ? "Please wait" : isSignUp ? "Create Account" : "Sign In"}
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
            <button onClick={()=>{window.open('','_blank','width=600,height=700').document.write('<html><head><title>How to Play</title><style>body{background:#131929;color:#dce4f5;font-family:DM Sans,sans-serif;padding:28px;} h2{color:#f0c040;font-family:Bebas Neue,sans-serif;letter-spacing:2px;} .section{background:#0f1625;border:1px solid #1e2840;border-radius:10px;padding:14px 16px;margin-bottom:12px;} .label{color:#f0c040;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;} .green{color:#2ecc71;font-weight:700;} .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1a2440;font-size:13px;} .tip{background:#0a1a2e;border:1px solid #1e3a5a;border-radius:10px;padding:14px 16px;}</style></head><body><h2>How to Play</h2><div class=section><div class=label>Overview</div><p>Bracket Bucks is a snake draft pool where each player drafts 8 NCAA tournament teams. Every time your team wins, the other owners pay you based on the seed and round.</p><p>Higher seed = bigger upset = more money. A 16-seed run is worth a fortune! However, it is highly unlikely. A low-seeded team earns the Owner less than a high-seeded team, but the chances are the high-seeded team is less likely to win!</p></div><div class=section><div class=label>How the Draft Works</div><p>Owner 1 picks first in Round 1, each Owner selects their first team to add to their Roster, then the order reverses. So, the order is as follows: 1-8, then 8-1, and so on.</p><p>Each owner picks 8 teams total. Click any available team to draft them.</p></div><div class=section><div class=label>How Payouts Work</div><p>Each time your team wins, every other owner pays you: Seed # x Round Multiplier = $ per player</p><div class=row><span>Round 1</span><span style=color:#f0c040>$0.50 x seed</span></div><div class=row><span>Round of 32</span><span style=color:#f0c040>$1.00 x seed</span></div><div class=row><span>Sweet 16</span><span style=color:#f0c040>$1.50 x seed</span></div><div class=row><span>Elite Eight</span><span style=color:#f0c040>$2.00 x seed</span></div><div class=row><span>Final Four</span><span style=color:#f0c040>$2.50 x seed</span></div><div class=row style=border:none><span>Championship</span><span style=color:#f0c040>$3.00 x seed</span></div></div><div class=section><div class=label>Example Payout</div><p>#12 seed McNeese wins in Round 1:</p><p class=green>12 x $0.50 = $6.00 per owner x 7 other owners = $42.00 total collected</p><p>#12 seed McNeese then wins in Round 2 (Round of 32):</p><p class=green>12 x $1.00 = $12.00 per owner x 7 other owners = $84.00 total collected</p><p style=color:#8899cc;font-size:12px>Each other owner owes you the amount per win, settled however your group prefers.</p></div><div class=tip><div class=label style=color:#3498db>Strategy Tips</div><p>High seeds earn more but go out earlier. Balance your 8 picks.</p><p>Mix strong low seeds (1s and 2s) with high seeds (10s-12s) who can upset.</p><p>Championship pays 3x - a 5-seed winning it all pays $15 per owner per win!</p></div></body></html>')}} style={{
              background:"none", border:"none", color:"#6677aa",
              fontSize:12, cursor:"pointer", textDecoration:"underline", fontFamily:"inherit"
            }}> How to Play</button>
            <button onClick={()=>setModal("adminLogin")} style={{
              background:"none", border:"none", color:"#2a3560",
              fontSize:11, cursor:"pointer", textDecoration:"underline", fontFamily:"inherit"
            }}>Admin Login</button>
          </div>
        </div>

        {/* How to Play modal */}
        

        {/* Admin login modal on auth screen */}
        
        <Modal open={modal==="adminLogin"} onClose={()=>{setModal(null);setAdminPassInput("");setAdminPassError("");}} title=" Admin Login">
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

  //  Landing screen (no league loaded) 
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
            <div style={{ fontSize:52, marginBottom:12 }}></div>
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
               Join a League
              <div style={{ fontSize:11, fontWeight:400, color:"#6677aa", marginTop:3 }}>
                Enter your invite code
              </div>
            </button>

            <button onClick={()=>{ setModal("create"); setPaymentConfirmed(false); }} style={{
              ...S.btn("#131929","#dce4f5"), padding:"14px 20px", fontSize:15, borderRadius:12,
              border:"1px solid #2a3350",
            }}>
               Create New League
              <div style={{ fontSize:11, fontWeight:400, color:"#6677aa", marginTop:3 }}>
                Set up a fresh pool for your group
              </div>
            </button>
          </div>

          {loading && <div style={{ marginTop:20, textAlign:"center", color:"#6677aa" }}>Loading</div>}

          {/* Admin login / My Leagues */}
          {!isAdmin ? (
            <div style={{ marginTop:28, textAlign:"center" }}>
              <button onClick={()=>setModal("adminLogin")} style={{
                background:"none", border:"none", color:"#2a3560",
                fontSize:12, cursor:"pointer", textDecoration:"underline"
              }}>Admin Login</button>
              <button onClick={()=>{window.open('','_blank','width=600,height=700').document.write('<html><head><title>How to Play</title><style>body{background:#131929;color:#dce4f5;font-family:DM Sans,sans-serif;padding:28px;} h2{color:#f0c040;font-family:Bebas Neue,sans-serif;letter-spacing:2px;} .section{background:#0f1625;border:1px solid #1e2840;border-radius:10px;padding:14px 16px;margin-bottom:12px;} .label{color:#f0c040;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;} .green{color:#2ecc71;font-weight:700;} .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1a2440;font-size:13px;} .tip{background:#0a1a2e;border:1px solid #1e3a5a;border-radius:10px;padding:14px 16px;}</style></head><body><h2>How to Play</h2><div class=section><div class=label>Overview</div><p>Bracket Bucks is a snake draft pool where each player drafts 8 NCAA tournament teams. Every time your team wins, the other owners pay you based on the seed and round.</p><p>Higher seed = bigger upset = more money. A 16-seed run is worth a fortune! However, it is highly unlikely. A low-seeded team earns the Owner less than a high-seeded team, but the chances are the high-seeded team is less likely to win!</p></div><div class=section><div class=label>How the Draft Works</div><p>Owner 1 picks first in Round 1, each Owner selects their first team to add to their Roster, then the order reverses. So, the order is as follows: 1-8, then 8-1, and so on.</p><p>Each owner picks 8 teams total. Click any available team to draft them.</p></div><div class=section><div class=label>How Payouts Work</div><p>Each time your team wins, every other owner pays you: Seed # x Round Multiplier = $ per player</p><div class=row><span>Round 1</span><span style=color:#f0c040>$0.50 x seed</span></div><div class=row><span>Round of 32</span><span style=color:#f0c040>$1.00 x seed</span></div><div class=row><span>Sweet 16</span><span style=color:#f0c040>$1.50 x seed</span></div><div class=row><span>Elite Eight</span><span style=color:#f0c040>$2.00 x seed</span></div><div class=row><span>Final Four</span><span style=color:#f0c040>$2.50 x seed</span></div><div class=row style=border:none><span>Championship</span><span style=color:#f0c040>$3.00 x seed</span></div></div><div class=section><div class=label>Example Payout</div><p>#12 seed McNeese wins in Round 1:</p><p class=green>12 x $0.50 = $6.00 per owner x 7 other owners = $42.00 total collected</p><p>#12 seed McNeese then wins in Round 2 (Round of 32):</p><p class=green>12 x $1.00 = $12.00 per owner x 7 other owners = $84.00 total collected</p><p style=color:#8899cc;font-size:12px>Each other owner owes you the amount per win, settled however your group prefers.</p></div><div class=tip><div class=label style=color:#3498db>Strategy Tips</div><p>High seeds earn more but go out earlier. Balance your 8 picks.</p><p>Mix strong low seeds (1s and 2s) with high seeds (10s-12s) who can upset.</p><p>Championship pays 3x - a 5-seed winning it all pays $15 per owner per win!</p></div></body></html>')}} style={{ background:"none", border:"none", color:"#6677aa", fontSize:12, cursor:"pointer", marginTop:8, textDecoration:"underline" }}>? How to Play</button>
            </div>
          ) : (
            <div style={{ marginTop:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:2, fontWeight:700 }}>
                   My Leagues
                </div>
                <button onClick={()=>{ sessionStorage.removeItem("bb_is_admin"); setIsAdmin(false); }}
                  style={{ background:"none", border:"none", color:"#445", fontSize:11, cursor:"pointer", textDecoration:"underline" }}>
                  Log out
                </button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[...myLeagues].reverse().filter(l => l.code && !["EE0CH3","36V848"].includes(l.code)).map(l => (
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
                    <span style={{ color:"#f0c040" }}>&#8594;</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal open={modal==="adminLogin"} onClose={()=>{setModal(null);setAdminPassInput("");setAdminPassError("");}} title=" Admin Login">
          <p style={{ color:"#6677aa", fontSize:13, marginBottom:16 }}>Enter your admin password to access all leagues.</p>
          <input type="password" value={adminPassInput} onChange={e=>setAdminPassInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"){ if(adminPassInput===ADMIN_PASSWORD){setIsAdmin(true);sessionStorage.setItem("bb_is_admin","true");setModal(null);setAdminPassInput("");setAdminPassError("");}else{setAdminPassError("Incorrect password.");}}}}
            placeholder="Password" style={{ ...S.input, letterSpacing:4, fontSize:18, textAlign:"center", marginBottom:8 }} autoFocus />
          {adminPassError && <div style={{ color:"#e74c3c", fontSize:12, marginBottom:8 }}>{adminPassError}</div>}
          <button onClick={()=>{ if(adminPassInput===ADMIN_PASSWORD){setIsAdmin(true);sessionStorage.setItem("bb_is_admin","true");setModal(null);setAdminPassInput("");setAdminPassError("");}else{setAdminPassError("Incorrect password.");}}}
            style={{ ...S.btn(), width:"100%", marginTop:4 }}>Login</button>
        </Modal>

        <Modal open={modal==="profile"} onClose={()=>setModal(null)} title=" My Profile">
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
                    <span style={{ color:"#f0c040" }}></span>
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
              <div style={{ fontSize:36, marginBottom:12 }}></div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2, color:"#f0c040" }}>
                Verifying Payment
              </div>
              <p style={{ color:"#6677aa", fontSize:13, marginTop:8 }}>Confirming your Venmo payment, just a moment.</p>
            </div>

          ) : isAdmin ? (
            /* Admins skip payment */
            <div>
              <div style={{ background:"#0a2a14", border:"1px solid #27ae60", borderRadius:8,
                padding:"10px 14px", marginBottom:14, fontSize:13, color:"#2ecc71" }}>
                 Admin  no payment required
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
                    {paymentStep === 'verifying' ? ' Checking payment...' : ' I sent it  Verify Payment'}
                  </button>
                  {venmoVerifyError && <p style={{color:'#ff6b6b', fontSize: 13, margin: '8px 0 0'}}>{venmoVerifyError}</p>}

              <p style={{ fontSize:11, color:"#445", textAlign:"center", marginTop:10 }}>
                Send $10 to @bracket-bucks-app on Venmo with your email in the note, then click 'I sent it' above.
              </p>
            </div>

          ) : paymentConfirmed ? (
            /* Step 2: Payment confirmed  name the league */
            <div>
              <div style={{ background:"#0a2a14", border:"1px solid #27ae60", borderRadius:8,
                padding:"12px 14px", marginBottom:16, fontSize:13, color:"#2ecc71",
                display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:"#f0c040", fontSize:18 }}>&#8594;</span>
                <span>Payment confirmed  you're good to go!</span>
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
               {venmoVerifyError}
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
             Send $10 on Venmo
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
            {paymentStep === "verifying" ? " Checking..." : paymentStep === "pending" ? " Request submitted!" : " I sent it  Verify Payment"}
          </button>
          <p style={{fontSize:11,color:"#445",textAlign:"center",marginTop:8}}>Include your email ({authUser?.email}) in the Venmo note.</p>
        </div>
          )}
        </Modal>
        <style>{`select option { background: #131929; } * { box-sizing: border-box; }`}</style>
        </div>
    );
  }

  //  Main app (league loaded) 
  return (
    <div style={{ minHeight:"100vh", background:"#0c1120", fontFamily:"'DM Sans',sans-serif", color:"#dce4f5" }}>
      <FontLink />
      <Toast {...(toast||{msg:null})} />

      {/* Header */}
      <header style={{ background:"linear-gradient(135deg,#090e1a 0%,#141d38 100%)",
        borderBottom:"2px solid #f0c040", padding:"14px 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28 }}></span>
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
          <button onClick={()=>setTab("profile")} style={{ ...S.btn("#1a2440","#dce4f5"), border:"1px solid #2a3560", fontSize:12 }}> Profile</button>
          <button onClick={()=>{window.open('','_blank','width=600,height=700').document.write('<html><head><title>How to Play</title><style>body{background:#131929;color:#dce4f5;font-family:DM Sans,sans-serif;padding:28px;} h2{color:#f0c040;font-family:Bebas Neue,sans-serif;letter-spacing:2px;} .section{background:#0f1625;border:1px solid #1e2840;border-radius:10px;padding:14px 16px;margin-bottom:12px;} .label{color:#f0c040;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;} .green{color:#2ecc71;font-weight:700;} .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #1a2440;font-size:13px;} .tip{background:#0a1a2e;border:1px solid #1e3a5a;border-radius:10px;padding:14px 16px;}</style></head><body><h2>How to Play</h2><div class=section><div class=label>Overview</div><p>Bracket Bucks is a snake draft pool where each player drafts 8 NCAA tournament teams. Every time your team wins, the other owners pay you based on the seed and round.</p><p>Higher seed = bigger upset = more money. A 16-seed run is worth a fortune! However, it is highly unlikely. A low-seeded team earns the Owner less than a high-seeded team, but the chances are the high-seeded team is less likely to win!</p></div><div class=section><div class=label>How the Draft Works</div><p>Owner 1 picks first in Round 1, each Owner selects their first team to add to their Roster, then the order reverses. So, the order is as follows: 1-8, then 8-1, and so on.</p><p>Each owner picks 8 teams total. Click any available team to draft them.</p></div><div class=section><div class=label>How Payouts Work</div><p>Each time your team wins, every other owner pays you: Seed # x Round Multiplier = $ per player</p><div class=row><span>Round 1</span><span style=color:#f0c040>$0.50 x seed</span></div><div class=row><span>Round of 32</span><span style=color:#f0c040>$1.00 x seed</span></div><div class=row><span>Sweet 16</span><span style=color:#f0c040>$1.50 x seed</span></div><div class=row><span>Elite Eight</span><span style=color:#f0c040>$2.00 x seed</span></div><div class=row><span>Final Four</span><span style=color:#f0c040>$2.50 x seed</span></div><div class=row style=border:none><span>Championship</span><span style=color:#f0c040>$3.00 x seed</span></div></div><div class=section><div class=label>Example Payout</div><p>#12 seed McNeese wins in Round 1:</p><p class=green>12 x $0.50 = $6.00 per owner x 7 other owners = $42.00 total collected</p><p>#12 seed McNeese then wins in Round 2 (Round of 32):</p><p class=green>12 x $1.00 = $12.00 per owner x 7 other owners = $84.00 total collected</p><p style=color:#8899cc;font-size:12px>Each other owner owes you the amount per win, settled however your group prefers.</p></div><div class=tip><div class=label style=color:#3498db>Strategy Tips</div><p>High seeds earn more but go out earlier. Balance your 8 picks.</p><p>Mix strong low seeds (1s and 2s) with high seeds (10s-12s) who can upset.</p><p>Championship pays 3x - a 5-seed winning it all pays $15 per owner per win!</p></div></body></html>')}} style={{ ...S.btn("#1a2440","#6677aa"), border:"1px solid #2a3560", fontSize:12 }}>? How to Play</button>
          <button onClick={()=>{setLeagueCode(null);setLeague(null);setOwners([]);setWins([]);}}
            style={S.btn("#1e2840","#dce4f5")}> Switch League</button>
          {league && <button onClick={()=>setModal("addWin")} style={S.btn()}> Record Win</button>}
        </div>
      </header>

      {/* Stats bar */}
      <div style={{ background:"#0f1625", borderBottom:"1px solid #1a2440",
        padding:"7px 24px", display:"flex", gap:24, alignItems:"center", flexWrap:"wrap", fontSize:12 }}>
        <span style={{ color:"#6677aa" }}>{owners.length} owners</span>
        <span style={{ color:"#6677aa" }}>{totalWins} wins logged</span>
        <span style={{ color:"#6677aa" }}> Live  updates automatically</span>
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
                    ${stats.reduce((a,s)=>a+s.net,0).toFixed(2)}  zero-sum
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
              <button onClick={()=>setModal("addWin")} style={S.btn()}> Record Win</button>
            </div>
            {wins.length===0 ? <Empty text="No wins recorded yet." /> : (
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[...wins].reverse().map(w=>{
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
                      <span style={{ fontWeight:600, flex:1, minWidth:120, color:(REGION_COLORS[REGION_MAP[team.name]]||'#dce4f5') }}>{team.name}</span>
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
                        padding:"3px 8px", cursor:"pointer", fontSize:12 }}></button>
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
            <div style={{ display:"flex", gap:16, marginBottom:16, flexWrap:"wrap" }}>
              {[['South','#f0c040'],['Midwest','#9b59b6'],['East','#ffffff'],['West','#4a9eff']].map(([region,color])=>(
                <div key={region} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
                  <div style={{ width:12,height:12,borderRadius:2,background:color }}></div>
                  <span style={{ color:color,fontWeight:600 }}>{region}</span>
                </div>
              ))}
            </div>
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
                              <span style={{ fontSize:13, flex:1, textDecoration:eliminatedTeams.has(team.name)?'line-through':'none', color:eliminatedTeams.has(team.name)?'#e74c3c':(REGION_COLORS[REGION_MAP[team.name]]||'#dce4f5') }}>{team.name}</span>
                              {hasWin&&<span style={{ fontSize:10, color:"#2ecc71" }}></span>}
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
              Total payout formula: <strong>Seed  Round Value  {owners.length-1} owners</strong>.
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
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <h2 style={{ margin:0, fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Live Scores</h2>
                <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
                  <button onClick={()=>setAutoSync(a=>!a)} style={{
                    ...S.btn(autoSync?"#0a2a14":"#1a2440", autoSync?"#2ecc71":"#6677aa"),
                    border:"1px solid "+(autoSync?"#27ae60":"#2a3560"),
                    fontSize:12, padding:"6px 14px"
                  }}>
                    {autoSync ? "Auto-Sync ON" : "Auto-Sync OFF"}
                  </button>
                  {lastSync && <span style={{fontSize:11,color:"#6677aa"}}>Last sync: {lastSync.toLocaleTimeString()}</span>}
                </div>
              </div>
              <button onClick={fetchESPN} style={S.btn()} disabled={espnStatus==="loading"}>
                {espnStatus==="loading"?" Loading":" Fetch from ESPN"}
              </button>
            </div>
            {owners.length>0 && espnStatus==="success" && (
              <div style={{ background:"#0a1428", border:"1px solid #1e2840", borderRadius:10,
                padding:"10px 14px", marginBottom:16, fontSize:12, color:"#6677aa" }}>
                 <strong style={{ color:"#f0c040" }}>1-click recording:</strong> When a game is final, click <strong style={{ color:"#2ecc71" }}> Record Win</strong> next to the winning team to instantly log it. You'll be prompted to select the round.
              </div>
            )}
            {espnStatus==="idle"&&!autoSync&&<Empty text='Click "Fetch from ESPN" to load live tournament scores, or turn on Auto-Sync.' />}
              {syncLog.length > 0 && (
                <div style={{background:"#0a1a2e",border:"1px solid #1e3a5a",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
                  <div style={{fontSize:11,color:"#3498db",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>Auto-Sync Log</div>
                  {syncLog.map((l,i) => (
                    <div key={i} style={{fontSize:12,color:"#dce4f5",padding:"3px 0",borderBottom:"1px solid #1a2440"}}>
                      <span style={{color:"#6677aa"}}>{l.time}</span>  {l.msg}
                    </div>
                  ))}
                </div>
              )}
            {espnStatus==="error"&&(
              <div style={{ ...S.card, borderColor:"#e74c3c", color:"#e74c3c" }}>
                <strong> Could not reach ESPN API</strong>
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
                    {game.isLive?" LIVE":game.status}
                  </span>
                </div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {game.competitors.map((c,i)=>{
                    // Find matching owner+team for this competitor
                    const teamNameNorm = (c.name||"").toLowerCase().replace(/[^a-z0-9]/g,"");
                    const match = (() => {
                      for (const owner of owners) {
                        const idx = owner.teams.findIndex(t => (t.name||"").toLowerCase().replace(/[^a-z0-9]/g,"")===teamNameNorm);
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
                             Record Win
                          </button>
                        )}
                        {c.winner && alreadyWon && (
                          <span style={{ fontSize:11, color:"#2ecc71", fontWeight:700 }}> Logged</span>
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

        
{/*  2026 BRACKET TAB  */}
{tab==="bracket2026" && (
  <Bracket2026Tab owners={owners} />
)}

{/* LIVE BRACKET */}
        {!loading && tab==="bracket2025" && (
          <div>
            <h2 style={{ margin:"0 0 4px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}>Live Bracket  2025 NCAA Tournament</h2>
            <p style={{ color:"#6677aa", fontSize:13, marginBottom:20 }}> Champion: <strong style={{ color:"#f0c040" }}>Florida</strong>  Final: Florida 65, Houston 63</p>

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
                        {t.name===game.winner && <span style={{ color:"#2ecc71", fontSize:12 }}></span>}
                      </div>
                    ))}
                  </div>
                );
              };

              const ROUND_LABELS = { r64:"Round of 64", r32:"Round of 32", s16:"Sweet 16", e8:"Elite Eight" };

              return (
                <div>
                  {/* Championship  top of page */}
                  <div style={{ marginBottom:28, background:"linear-gradient(135deg,#1a2010,#141d30)",
                    border:"2px solid #f0c040", borderRadius:14, padding:"18px 20px" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2,
                      color:"#f0c040", marginBottom:12 }}>
                       National Championship  April 7, 2025
                    </div>
                    <div style={{ maxWidth:340 }}>
                      <GameCard game={BRACKET_2025.championship} label="Florida 65  Houston 63" />
                    </div>
                  </div>

                  {/* Final Four */}
                  <div style={{ marginBottom:28, background:"#111827", border:"1px solid #2a3350",
                    borderRadius:14, padding:"18px 20px" }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:2,
                      color:"#f0c040", marginBottom:12 }}>
                       Final Four  San Antonio, TX
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
                     Regional Results 
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
        
        {!loading && tab==="topteams" && (
          <TopTeams owners={owners} leagueCode={leagueCode} rounds={rounds}/>
        )}

        {!loading && tab==="livebracket" && (
          <LiveBracket />
        )}
        {!loading && tab==="draft" && (()=>{
          //  Draft helpers 
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


          //  Draft a team 
          async function draftPick(team) {
            if (!currentPicker) return;
            if (!authUser) { alert("Please sign in to draft a team."); return; }
            const updatedTeams = [...currentPicker.teams];
            if(!isAdmin&&currentPicker){var m=owners.find(function(o){return o.user_id===authUser.id;});if(!m||m.num!==currentPicker.num){alert("It's not your turn!");return;}}
            const emptyIdx = updatedTeams.findIndex(t => !t.name || !t.name.trim());
            if (emptyIdx === -1) { alert("This owner already has 8 teams."); return; }
            updatedTeams[emptyIdx] = { seed: team.seed, name: team.name };
            const { error } = await supabase.from("owners").update({ teams: updatedTeams }).eq("id", currentPicker.id);
            if (error) { alert("Failed to save pick."); return; }
            setOwners(prev => prev.map(o => o.id === currentPicker.id ? { ...o, teams: updatedTeams } : o));
            alert(` ${currentPicker.name} drafted ${team.name}!`);
          }


          //  Reset draft 
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

          //  Save draft start time 

          
const regionColors = { South:"#f0c040", East:"#ffffff", Midwest:"#9b59b6", West:"#4a9eff" };


          return (
            <div>
              {/* Header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h2 style={{ margin:"0 0 4px", fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2 }}> Snake Draft</h2>
                  <p style={{ margin:0, color:"#6677aa", fontSize:13 }}>
                    {draftComplete ? " Draft complete! All teams assigned." :
                      numOwners === 0 ? "Add owners in Admin tab first." :
                      `Round ${pickRound + 1}  Pick ${posInRound + 1} of ${numOwners}  ${available.length} teams remaining`}
                  </p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {isAdmin && <button onClick={shuffleDraftOrder} style={{ ...S.btn("#1a2440","#d4af37"), border:"1px solid #d4af37", fontSize:13, padding:"8px 16px" }}> Shuffle Order</button>}
                  <button onClick={resetDraft} style={{ ...S.btn("#1a2440","#e74c3c"), border:"1px solid #e74c3c", fontSize:12 }}>
                     Reset Draft
                  </button>
                </div>
              </div>


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
                        <div style={{ fontSize:11, color:"#6677aa", marginBottom:2 }}>Round {pickRound + 1}  Pick {totalPicks + 1}</div>
                        <div style={{ fontSize:12, color:"#dce4f5" }}>{currentPicker.teams.filter(t=>t.name).length}/8 teams drafted</div>
                      </div>
                    </div>
                  )}

                  
        {/*  Draft Order Queue  */}
        {!draftComplete && owners.length > 0 && (
          <div style={{marginBottom:16,background:"#080e1a",border:"1px solid #1e2d4a",borderRadius:10,padding:"12px 16px"}}>
            <div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"#6677aa",marginBottom:10}}>
              Draft Order  Round {pickRound+1}
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
                      <div style={{ fontSize:40, marginBottom:8 }}></div>
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
                                  disabled={draftComplete || !currentPicker}
                                  style={{ display:"flex", alignItems:"center", gap:8,
                                    background:"#0f1625",
                                    border:`1px solid ${regionColors[region]}44`,
                                    borderRadius:8, padding:"8px 10px", cursor:"pointer",
                                    fontFamily:"inherit", textAlign:"left",
                                    opacity: draftComplete ? 0.45 : 1, cursor: "pointer" }}
                                  onMouseEnter={e => { e.currentTarget.style.background="#1a2e1a"; e.currentTarget.style.borderColor=regionColors[region]; }}
                                  onMouseLeave={e => { e.currentTarget.style.background="#0f1625"; e.currentTarget.style.borderColor=regionColors[region]+"44"; }}>
                                  <SeedBadge seed={team.seed} />
                <span style={{ fontSize:12, fontWeight:600, color:(regionColors[REGION_MAP[team.name]]||"#dce4f5"), flex:1 }}>{PLAY_IN_OPPONENTS[team.name] ? `${team.name} / ${team.seed} ${PLAY_IN_OPPONENTS[team.name]}` : team.name}</span>
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
                                <span style={{ fontSize:9, color:"#333" }}>{isEvenR?"":""}</span>
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
                                        <div style={{ fontSize:9, color:(regionColors[REGION_MAP[pick?.name]]||(regionColors[REGION_MAP[pick?.name]]||"#dce4f5")), lineHeight:1.2,
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
              <div style={{ display:"flex", gap:14, marginBottom:10, flexWrap:"wrap" }}>
                {[["South","#f0c040"],["Midwest","#9b59b6"],["East","#ffffff"],["West","#4a9eff"]].map(function(e,i){return <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}><div style={{width:10,height:10,borderRadius:2,background:e[1]}}></div><span style={{color:e[1],fontWeight:600}}>{e[0]}</span></div>;})}
              </div>
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
                                  <span key={i} style={{ fontSize:10, background:"#1a2440", color:(regionColors[REGION_MAP[t.name]]||"#dce4f5"),
                                    borderRadius:4, padding:"2px 6px", display:"flex", alignItems:"center", gap:3 }}>
                                    <SeedBadge seed={t.seed} />
                                    <span>{t.name}</span>
                                  </span>
                                ))}
                                {Array.from({length: 8 - drafted.length}).map((_,i) => (
                                  <span key={`empty-${i}`} style={{ fontSize:10, background:"#111", color:"#333",
                                    borderRadius:4, padding:"2px 8px", border:"1px dashed #1a2440" }}></span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
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
                    ["Avg Seed", myOwner ? (myOwner.teams.reduce((a,t)=>a+t.seed,0)/myOwner.teams.length).toFixed(1) : "", "#6677aa"],
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
                  <strong style={{ color:"#f0c040" }}> You're not listed as an owner in this league.</strong>
                  <p style={{ margin:"8px 0 0" }}>Your profile name <strong>"{userName}"</strong> doesn't match any owner in {league?.name}. Ask your admin to add you, or make sure your profile name matches exactly.</p>
                </div>
              )}

              {/* My Teams This Year */}
              {myOwner && (
                <div style={{ ...S.card, marginBottom:20 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:"#f0c040", marginBottom:14 }}>
                My Teams &#8594; {league?.name}
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
                                {teamWins.length} win{teamWins.length!==1?"s":""}  +${earned.toFixed(2)}
                              </div>
                            )}
                          </div>
                          {teamWins.length > 0 && <span style={{ color:"#2ecc71" }}></span>}
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
                     Round-by-Round Breakdown
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
                   My Leagues
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
                            {l.code===leagueCode && <span style={{ color:"#2ecc71", marginLeft:8 }}> Active</span>}
                          </div>
                        </div>
                        <span style={{ color:"#f0c040" }}></span>
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
                  <strong style={{ color:"#f0c040" }}> Share this invite code with your league:</strong>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:28, fontWeight:800,
                    color:"#fff", letterSpacing:6, marginTop:8 }}>{leagueCode}</div>
                  <div style={{ color:"#6677aa", fontSize:12, marginTop:4 }}>
                    They visit the site  "Join a League"  enter this code  instant access
                  </div>
                </div>
              </div>

              {/* Venmo Payments */}
              <div style={S.card}>
                <SecTitle> Venmo Payments</SecTitle>
                <p style={{ fontSize:13, color:"#6677aa", marginTop:0, marginBottom:12 }}>
                  Non-admin users pay $10 via Venmo to @bracket-bucks-app before creating a league.
                </p>
                <a href="https://venmo.com/u/bracket-bucks-app" target="_blank" rel="noreferrer"
                  style={{ display:"inline-block", textDecoration:"none" }}>
                  <div style={{ background:"#1a2440", border:"1px solid #635BFF", borderRadius:8,
                    padding:"10px 16px", fontSize:13, color:"#635BFF", cursor:"pointer",
                    display:"inline-flex", alignItems:"center", gap:8 }}>
                     View Payments in Venmo 
                  </div>
                </a>
              </div>


        
        {/* Payment Approvals */}
        {isAdmin && (
          <PaymentApprovals supabase={supabase} />
        )}

        {/* League Management */}
        <div style={{background:"#0d1528",border:"1px solid #1e2d4a",borderRadius:10,padding:"20px 24px",marginBottom:20}}>
          <div style={{color:"#d4af37",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1,marginBottom:12}}> LEAGUE MANAGEMENT</div>
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
              {/* Setup Wizard  add all 8 owners at once */}
              {owners.length === 0 && (
                <div style={S.card}>
                  <SecTitle> League Setup  Add All 8 Owners</SecTitle>
                  <p style={{ fontSize:13, color:"#6677aa", marginTop:0, marginBottom:16 }}>
                    Fill in each owner's name and their 8 teams below, then click Save All Owners.
                  </p>
                  {setupOwners.map((owner, oi) => (
                    <div key={oi} style={{ marginBottom:8, border:"1px solid #1e2840", borderRadius:10, overflow:"hidden" }}>
                      {/* Owner header  click to expand */}
                      <div onClick={()=>setSetupStep(setupStep===oi?-1:oi)} style={{
                        display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
                        background: setupStep===oi ? "#1a2440" : "#0f1625", cursor:"pointer"
                      }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:OWNER_COLORS[oi%8],flexShrink:0 }} />
                        <span style={{ fontWeight:600, flex:1, color: owner.name?"#dce4f5":"#445" }}>
                          {owner.name || `Owner ${oi+1}  click to expand`}
                        </span>
                        <span style={{ color:"#445", fontSize:12 }}>
                          {owner.teams.filter(t=>t.name).length}/8 teams
                        </span>
                        <span style={{ color:"#f0c040" }}>{setupStep===oi?"":""}</span>
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
                            Next Owner 
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
                    alert(`${filled.length} owners saved! `);
                  }} style={{ ...S.btn(), width:"100%", marginTop:8, padding:"13px", fontSize:15 }}>
                     Save All Owners to League
                  </button>
                </div>
              )}

              {/* Payout Settings */}
              <div style={S.card}>
                <SecTitle> Payout Settings</SecTitle>
                <p style={{ fontSize:13, color:"#6677aa", margin:"0 0 14px" }}>
                  Set the dollar amount per seed point for each round. Formula: Seed  Amount  (Owners  1)
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
                        placeholder="Add owner name" style={{ ...S.input, flex:1 }}
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
                              title="Edit name"></button>
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
                          }}></button>
                          <button onClick={()=>adminUnlocked?openTeamEditor(o):setModal("pin")} style={{
                            background:"#1a2440", border:"1px solid #2a3560",
                            borderRadius:6, color:"#f0c040", padding:"4px 12px",
                            cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit"
                          }}> Edit Teams</button>
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

      {/*  Modals  */}
      
        
        <Modal open={modal==="addWin"} onClose={()=>setModal(null)} title="Record a Win">
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={S.label}>Owner</label>
            <select value={winOwnerId} onChange={e=>{setWinOwnerId(e.target.value);setWinTeamIdx("");}} style={S.input}>
              <option value=""> Select owner </option>
              {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Round</label>
            <select value={winRoundId} onChange={e=>setWinRoundId(parseInt(e.target.value))} style={S.input}>
              {rounds.map(r=><option key={r.id} value={r.id}>{r.label} (${r.dmg}  seed)</option>)}
            </select>
          </div>
          {winOwnerId&&(
            <div>
              <label style={S.label}>Winning Team</label>
              <select value={winTeamIdx} onChange={e=>setWinTeamIdx(e.target.value)} style={S.input}>
                <option value=""> Select team </option>
                {owners.find(o=>o.id===parseInt(winOwnerId))?.teams.map((t,i)=>(
                  <option key={i} value={i}>#{t.seed} {t.name}</option>
                ))}
              </select>
            
          {isAdmin && (
            <button onClick={shuffleDraftOrder}
              style={{marginTop:20,padding:"10px 28px",background:"#d4af37",color:"#111",border:"none",borderRadius:8,fontSize:15,fontWeight:800,cursor:"pointer",letterSpacing:1}}>
               Randomize Draft Order
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
                <div>Seed <strong>#{team?.seed}</strong>  ${round.dmg} =
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
      <Modal open={modal==="pin"} onClose={()=>{setModal(null);setPinInput("");setPinError("");}} title=" Admin Access">
        <p style={{ color:"#6677aa", fontSize:13, marginBottom:16 }}>Enter your admin PIN to make changes.</p>
        <input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"){ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");setPinError("");alert("Admin unlocked ");}else{setPinError("Incorrect PIN.");}}}}
          placeholder="Enter PIN" style={{ ...S.input, letterSpacing:6, fontSize:20, textAlign:"center", marginBottom:8 }} autoFocus />
        {pinError && <div style={{ color:"#e74c3c", fontSize:12, marginBottom:8 }}>{pinError}</div>}
        <button onClick={()=>{ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");setPinError("");alert("Admin unlocked ");}else{setPinError("Incorrect PIN.");}}}
          style={{ ...S.btn(), width:"100%" }}>Unlock</button>
      </Modal>

      {/* Edit Teams Modal */}
      <Modal open={modal==="editTeams"} onClose={()=>setModal(null)} title={`Edit Teams  ${editingOwner?.name}`}>
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
          Left box = seed number (116)  Right box = team name
        </div>
        <button onClick={saveTeams} style={{ ...S.btn(), width:"100%" }}> Save Teams</button>
      </Modal>

      
      <style>{`select option{background:#131929;} *{box-sizing:border-box;}`}</style>
    </div>
  );
}
// build: 1773441631501
