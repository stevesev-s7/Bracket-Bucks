// v2-league-management-2026
// eslint-disable-next-line
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "./lib/supabase";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ADMIN_PIN = "1234";
const LEAGUE_CODE = "CHI2025";

const GROUP_COLORS = {
  "Group A":"#e74c3c","Group B":"#e67e22","Group C":"#f1c40f","Group D":"#2ecc71",
  "Group E":"#1abc9c","Group F":"#3498db","Group G":"#9b59b6","Group H":"#e91e63",
  "Group I":"#ff5722","Group J":"#00bcd4","Group K":"#8bc34a","Group L":"#ff9800",
};

const DEFAULT_ROUND_VALUES = {
  "Pool Play": 0.50,
  "Round of 32": 1.00,
  "Round of 16": 1.50,
  "Round of 8": 2.00,
  "Round of 4": 2.50,
  "Championship": 3.00,
};

const ROUND_DEFS = [
  { id:"Pool Play",     short:"PP",  hasDraw:true  },
  { id:"Round of 32",  short:"R32", hasDraw:false },
  { id:"Round of 16",  short:"R16", hasDraw:false },
  { id:"Round of 8",   short:"QF",  hasDraw:false },
  { id:"Round of 4",   short:"SF",  hasDraw:false },
  { id:"Championship", short:"F",   hasDraw:false },
];

function getRounds(leagueSettings) {
  const rv = leagueSettings?.round_values || {};
  return ROUND_DEFS.map(r => ({ ...r, dmg: rv[r.id] ?? DEFAULT_ROUND_VALUES[r.id] }));
}

// Default ROUNDS for backward compat (replaced with getRounds(league?.settings) in component)
const ROUNDS = getRounds({});

const WC_TEAMS = [
  {name:"Mexico",group:"Group A",seed:4},{name:"South Africa",group:"Group A",seed:10},
  {name:"South Korea",group:"Group A",seed:9},{name:"Czechia",group:"Group A",seed:7},
  {name:"Canada",group:"Group B",seed:7},{name:"Bosnia-Herzegovina",group:"Group B",seed:8},
  {name:"Qatar",group:"Group B",seed:11},{name:"Switzerland",group:"Group B",seed:5},
  {name:"Brazil",group:"Group C",seed:1},{name:"Morocco",group:"Group C",seed:3},
  {name:"Haiti",group:"Group C",seed:12},{name:"Scotland",group:"Group C",seed:7},
  {name:"United States",group:"Group D",seed:4},{name:"Paraguay",group:"Group D",seed:6},
  {name:"Australia",group:"Group D",seed:9},{name:"Türkiye",group:"Group D",seed:5},
  {name:"Germany",group:"Group E",seed:2},{name:"Curaçao",group:"Group E",seed:12},
  {name:"Ivory Coast",group:"Group E",seed:7},{name:"Ecuador",group:"Group E",seed:5},
  {name:"Netherlands",group:"Group F",seed:2},{name:"Japan",group:"Group F",seed:4},
  {name:"Sweden",group:"Group F",seed:6},{name:"Tunisia",group:"Group F",seed:9},
  {name:"Belgium",group:"Group G",seed:3},{name:"Egypt",group:"Group G",seed:8},
  {name:"Iran",group:"Group G",seed:9},{name:"New Zealand",group:"Group G",seed:11},
  {name:"Spain",group:"Group H",seed:1},{name:"Cape Verde",group:"Group H",seed:12},
  {name:"Saudi Arabia",group:"Group H",seed:10},{name:"Uruguay",group:"Group H",seed:4},
  {name:"France",group:"Group I",seed:1},{name:"Senegal",group:"Group I",seed:6},
  {name:"Iraq",group:"Group I",seed:11},{name:"Norway",group:"Group I",seed:3},
  {name:"Argentina",group:"Group J",seed:2},{name:"Algeria",group:"Group J",seed:8},
  {name:"Austria",group:"Group J",seed:6},{name:"Jordan",group:"Group J",seed:12},
  {name:"Portugal",group:"Group K",seed:2},{name:"Congo DR",group:"Group K",seed:10},
  {name:"Uzbekistan",group:"Group K",seed:11},{name:"Colombia",group:"Group K",seed:3},
  {name:"England",group:"Group L",seed:1},{name:"Croatia",group:"Group L",seed:5},
  {name:"Ghana",group:"Group L",seed:8},{name:"Panama",group:"Group L",seed:10},
];

// Mapping from old names to ESPN names for backward compatibility
// Maps any alternate/old name -> exact ESPN displayName
const ESPN_NAME_MAP = {
  "Republic of Korea": "South Korea",
  "Czech Republic": "Czechia",
  "Bosnia and Herzegovina": "Bosnia-Herzegovina",
  "USA": "United States",
  "Côte d'Ivoire": "Ivory Coast",
  "DR Congo": "Congo DR",
  "Curacao": "Curaçao",
  "Turkey": "Türkiye",
  "South Korea": "South Korea",
};

const OWNER_COLORS = ["#e74c3c","#3498db","#2ecc71","#f39c12","#9b59b6","#1abc9c","#e67e22","#e91e63"];

const CHI2025_OWNERS = [
  {name:"Alex Jurich",    color:OWNER_COLORS[0]},
  {name:"Matt Sevenich",  color:OWNER_COLORS[1]},
  {name:"Stephen Sevenich",color:OWNER_COLORS[2]},
  {name:"Will Kelly",     color:OWNER_COLORS[3]},
  {name:"Connor Quicksell",color:OWNER_COLORS[4]},
  {name:"Josh Galati",    color:OWNER_COLORS[5]},
  {name:"Tony Barbato",   color:OWNER_COLORS[6]},
  {name:"Nick Johnson",   color:OWNER_COLORS[7]},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const S = {
  card:{ background:"#111827", border:"1px solid #1a2440", borderRadius:12, padding:"18px 20px", marginBottom:0 },
  btn:(bg="#1a3a28",color="#2ecc71")=>({ background:bg, color, border:"none", borderRadius:8, padding:"9px 18px",
    cursor:"pointer", fontWeight:700, fontFamily:"inherit", fontSize:13, transition:"opacity .15s" }),
};
const TH={ padding:"9px 12px", textAlign:"left", color:"#6677aa", fontSize:11, fontWeight:700,
  textTransform:"uppercase", letterSpacing:1, borderBottom:"1px solid #1a2440" };
const TD={ padding:"9px 12px", verticalAlign:"middle" };

function calcStats(owners, wins, draws, roundsArg) {
  const ROUNDS = roundsArg || getRounds({});
  const numOwners = owners.length || 1;
  const others = Math.max(numOwners - 1, 1);

  // Build team seed lookup: team_name -> seed
  // WC_TEAMS is the authoritative source; only fall back to an owner's
  // drafted-team seed if WC_TEAMS doesn't have an entry for that name.
  const seedOf = {};
  WC_TEAMS.forEach(t => { seedOf[t.name] = t.seed; });
  owners.forEach(o => {
    (o.teams||[]).forEach(t => {
      if (t.name && seedOf[t.name] == null && t.seed) seedOf[t.name] = t.seed;
    });
  });

  return owners.map(owner => {
    const myWins  = ROUNDS.map(r => wins.filter(w  => w.owner_id===owner.id && w.round_id===r.id));
    const myDraws = ROUNDS.map(r => draws.filter(d => d.owner_id===owner.id && d.round_id===r.id));
    const roundWins  = myWins.map(ws => ws.length);
    const roundDraws = myDraws.map(ds => ds.length);

    // Earned: for each of MY wins, payout = round_dmg × seed × (numOwners-1)
    const roundEarned = ROUNDS.map((r,i) => {
      const winAmt  = myWins[i].reduce((sum, w) => sum + r.dmg * (seedOf[w.team_name]||1) * others, 0);
      const drawAmt = r.hasDraw ? myDraws[i].reduce((sum, d) => sum + (r.dmg/2) * (seedOf[d.team_name]||1) * others, 0) : 0;
      return winAmt + drawAmt;
    });

    // Cost: for each OTHER owner's win, I pay round_dmg × seed (once)
    const otherWins  = ROUNDS.map(r => wins.filter(w  => w.owner_id!==owner.id && w.round_id===r.id));
    const otherDraws = ROUNDS.map(r => draws.filter(d => d.owner_id!==owner.id && d.round_id===r.id));
    const roundCost = ROUNDS.map((r,i) => {
      const wCost = otherWins[i].reduce((sum, w) => sum + r.dmg * (seedOf[w.team_name]||1), 0);
      const dCost = r.hasDraw ? otherDraws[i].reduce((sum, d) => sum + (r.dmg/2) * (seedOf[d.team_name]||1), 0) : 0;
      return wCost + dCost;
    });

    const totalEarned = roundEarned.reduce((a,b)=>a+b,0);
    const totalCost   = roundCost.reduce((a,b)=>a+b,0);
    const net = totalEarned - totalCost;
    let cum = 0;
    const cumByRound = roundEarned.map((e,i) => { cum += e - roundCost[i]; return cum; });
    return { ...owner, roundWins, roundDraws, roundEarned, roundCost, totalEarned, totalCost, net, cumByRound };
  }).sort((a,b) => b.net - a.net);
}

function Spinner() {
  return <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
    <div style={{ width:36,height:36,border:"3px solid #1a2440",borderTop:"3px solid #f4c430",
      borderRadius:"50%",animation:"spin 0.7s linear infinite" }} />
  </div>;
}
function Empty({text}) {
  return <div style={{ textAlign:"center",padding:"40px 20px",color:"#445",fontSize:14 }}>{text}</div>;
}
function SecTitle({children}) {
  return <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,
    color:"#f4c430",marginBottom:14 }}>{children}</div>;
}
function Fin({label,val,color,large}) {
  return <div style={{ textAlign:"center" }}>
    <div style={{ fontSize:10,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,marginBottom:3 }}>{label}</div>
    <div style={{ fontSize:large?18:14,fontWeight:800,color,fontFamily:"'DM Mono',monospace" }}>{val}</div>
  </div>;
}
function SeedBadge({seed}) {
  const hue = Math.round(115-(seed-1)*7);
  return <span style={{ background:`hsl(${hue},55%,22%)`,color:`hsl(${hue},65%,65%)`,
    borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:700,fontFamily:"'DM Mono',monospace",
    minWidth:22,textAlign:"center",display:"inline-block" }}>#{seed}</span>;
}
function Toast({msg,type}) {
  if (!msg) return null;
  const ok = type!=="error";
  return <div style={{ position:"fixed",top:20,right:20,zIndex:9999,
    background:ok?"#0a2a14":"#2a0a0a",border:`1px solid ${ok?"#27ae60":"#e74c3c"}`,
    color:ok?"#2ecc71":"#e74c3c",borderRadius:10,padding:"12px 20px",fontWeight:700,
    fontSize:14,boxShadow:"0 4px 24px rgba(0,0,0,0.5)",maxWidth:340 }}>{msg}</div>;
}

// ─── LIVE SCORES via FIFA/ESPN soccer API ─────────────────────────────────────
function LiveScores({ owners, wins, onRecordWin, adminUnlocked, setModal }) {
  const [games, setGames] = useState([]);
  const [status, setStatus] = useState("idle");
  const [lastSync, setLastSync] = useState(null);
  const [autoSync, setAutoSync] = useState(false);
  const timerRef = useRef(null);

  const fetchGames = useCallback(async () => {
    setStatus("loading");
    try {
      // FIFA World Cup 2026 on ESPN soccer API
      const dates = ["20260611","20260612","20260613","20260614","20260615","20260616",
        "20260617","20260618","20260619","20260620","20260621","20260622","20260623",
        "20260624","20260625","20260626","20260627","20260628","20260629","20260630",
        "20260701","20260702","20260703","20260704","20260705","20260706","20260707",
        "20260708","20260709","20260710","20260711","20260712","20260713","20260714",
        "20260715","20260716","20260717","20260718","20260719"];
      const today = new Date().toISOString().split("T")[0].replace(/-/g,"");
      // Fetch today and nearby dates
      const toFetch = dates.filter(d => Math.abs(parseInt(d)-parseInt(today)) < 3).slice(0,3);
      if (toFetch.length === 0) toFetch.push(today);

      const allGames = [];
      const seen = new Set();
      for (const date of toFetch) {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${date}`);
        if (!res.ok) continue;
        const data = await res.json();
        for (const ev of (data.events || [])) {
          if (seen.has(ev.id)) continue;
          seen.add(ev.id);
          const comp = ev.competitions[0];
          const competitors = comp.competitors.map(c => ({
            name: c.team.displayName,
            score: c.score,
            winner: c.winner,
            logo: c.team.logo,
          }));
          const note = comp.notes?.[0]?.headline || ev.name || "";
          allGames.push({
            id: ev.id, name: ev.name,
            status: comp.status.type.shortDetail,
            isLive: comp.status.type.state === "in",
            isFinal: comp.status.type.completed,
            note, competitors,
            date: ev.date,
          });
        }
      }
      setGames(allGames.sort((a,b) => new Date(a.date)-new Date(b.date)));
      setStatus("success");
      setLastSync(new Date());
    } catch(e) {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (autoSync) {
      fetchGames();
      timerRef.current = setInterval(fetchGames, 30000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [autoSync, fetchGames]);

  const findOwner = (teamName) => {
    const norm = s => (s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
    const tn = norm(teamName);
    for (const o of owners) {
      for (const t of (o.teams||[])) {
        const on = norm(t.name||"");
        if (on.length>2 && (tn.includes(on)||on.includes(tn))) return { owner:o, team:t };
      }
    }
    return null;
  };

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10 }}>
        <h2 style={{ margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>⚽ Live Scores</h2>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          <button onClick={()=>setAutoSync(a=>!a)} style={{
            ...S.btn(autoSync?"#0a2a14":"#1a2440", autoSync?"#2ecc71":"#6677aa"),
            border:"1px solid "+(autoSync?"#27ae60":"#2a3560"), fontSize:12,padding:"6px 14px"
          }}>{autoSync?"🔄 Auto-Sync ON":"Auto-Sync OFF"}</button>
          {lastSync&&<span style={{fontSize:11,color:"#6677aa",alignSelf:"center"}}>Synced: {lastSync.toLocaleTimeString()}</span>}
          <button onClick={fetchGames} style={S.btn()} disabled={status==="loading"}>
            {status==="loading"?"Loading…":"Fetch Scores"}
          </button>
        </div>
      </div>

      {status==="idle"&&!autoSync&&<Empty text='Click "Fetch Scores" to load live World Cup scores, or turn on Auto-Sync.' />}
      {status==="error"&&<div style={{...S.card,borderColor:"#e74c3c",color:"#e74c3c"}}>
        <strong>⚠ Could not reach ESPN soccer API.</strong>
        <p style={{fontSize:13,color:"#aaa",marginTop:8}}>Try again or use "Record Win" in Win Tracker to log results manually.</p>
      </div>}
      {status==="success"&&games.length===0&&<Empty text="No World Cup games active for today." />}

      {status==="success"&&games.map(game=>{
        const alreadyLogged = (teamName) => {
          const m = findOwner(teamName);
          return m && wins.some(w => w.owner_id===m.owner.id && w.team_name===teamName);
        };
        return (
          <div key={game.id} style={{ ...S.card, padding:"14px 18px", marginBottom:10,
            borderLeft:`3px solid ${game.isLive?"#e74c3c":game.isFinal?"#27ae60":"#1e2840"}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8 }}>
              <span style={{ fontWeight:600,fontSize:14 }}>{game.note||game.name}</span>
              <span style={{ fontSize:11,padding:"3px 10px",borderRadius:99,fontWeight:700,
                background:game.isLive?"#3a0a0a":game.isFinal?"#0a2a14":"#1a2440",
                color:game.isLive?"#e74c3c":game.isFinal?"#2ecc71":"#6677aa" }}>
                {game.isLive?"🔴 LIVE":game.status}
              </span>
            </div>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
              {game.competitors.map((c,i)=>{
                const match = findOwner(c.name);
                const logged = alreadyLogged(c.name);
                return (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8,flex:1,minWidth:140,
                    background:c.winner?"#0a2a14":"#0f1625",
                    border:`1px solid ${c.winner?"#27ae60":"#1a2440"}`,
                    borderRadius:8,padding:"8px 14px",flexWrap:"wrap" }}>
                    <span style={{ fontWeight:c.winner?700:400,flex:1 }}>{c.name}</span>
                    {match&&<span style={{ fontSize:11,color:"#6677aa",background:"#1a2440",borderRadius:4,padding:"2px 6px" }}>{match.owner.name}</span>}
                    <span style={{ fontWeight:800,fontSize:20,fontFamily:"'DM Mono',monospace",color:c.winner?"#2ecc71":"#dce4f5" }}>{c.score}</span>
                    {c.winner&&match&&!logged&&(
                      <button onClick={()=>{ if(!adminUnlocked){setModal("pin");return;} onRecordWin(match.owner,c.name,"win"); }}
                        style={{ background:"#0a3a1a",border:"1px solid #27ae60",borderRadius:6,color:"#2ecc71",
                          padding:"4px 10px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>
                        ✓ Record Win
                      </button>
                    )}
                    {c.winner&&logged&&<span style={{ fontSize:11,color:"#2ecc71",fontWeight:700 }}>✓ Logged</span>}
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

// ─── TOP TEAMS ────────────────────────────────────────────────────────────────
function TopTeams({ owners, wins, draws, eliminatedTeams = new Set() }) {
  const teamStats = WC_TEAMS.map(team => {
    const teamWins  = wins.filter(w  => w.team_name===team.name).length;
    const teamDraws = draws.filter(d => d.team_name===team.name).length;
    const owner = owners.find(o => (o.teams||[]).some(t=>t.name===team.name));
    let earned = 0;
    wins.filter(w=>w.team_name===team.name).forEach(w=>{
      const r = ROUNDS.find(r=>r.id===w.round_id);
      if(r) earned += r.dmg * (team.seed || 1);
    });
    draws.filter(d=>d.team_name===team.name).forEach(d=>{
      const r = ROUNDS.find(r=>r.id===d.round_id);
      if(r) earned += (r.dmg/2) * (team.seed || 1);
    });
    return { ...team, wins:teamWins, draws:teamDraws, earned, owner };
  }).filter(t=>t.wins>0||t.draws>0).sort((a,b)=>b.earned-a.earned).slice(0,10);

  return (
    <div>
      <h2 style={{ margin:"0 0 20px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>🏆 Top Teams</h2>
      {teamStats.length===0?<Empty text="No wins or draws recorded yet." />:(
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {teamStats.map((t,i)=>{
            const isOut = eliminatedTeams.has(t.name);
            return (
            <div key={t.name} style={{ ...S.card,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",
              borderLeft:`3px solid ${isOut?"#333":GROUP_COLORS[t.group]||"#555"}`,
              opacity:isOut?0.5:1 }}>
              <div style={{ fontSize:22,fontWeight:800,color:"#f4c430",minWidth:32 }}>{i+1}</div>
              <SeedBadge seed={t.seed} />
              <div style={{ flex:1,minWidth:120 }}>
                <div style={{ fontWeight:700,fontSize:15,textDecoration:isOut?"line-through":"none",color:isOut?"#555":"#dce4f5" }}>{t.name}</div>
                <div style={{ fontSize:11,color:isOut?"#333":GROUP_COLORS[t.group]||"#6677aa" }}>{t.group}{isOut?<span style={{color:"#e74c3c",marginLeft:6}}>Eliminated</span>:""}</div>
              </div>
              {t.owner&&<span style={{ fontSize:11,color:isOut?"#444":t.owner.color,background:"#1a2440",borderRadius:4,padding:"2px 8px",fontWeight:700 }}>{t.owner.name}</span>}
              <div style={{ display:"flex",gap:16 }}>
                <Fin label="Wins" val={t.wins} color="#2ecc71" />
                {t.draws>0&&<Fin label="Draws" val={t.draws} color="#f39c12" />}
                <Fin label="Points" val={`+$${t.earned.toFixed(2)}`} color="#f4c430" large />
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SCHEDULE TAB ─────────────────────────────────────────────────────────────
function ScheduleTab({ owners }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | upcoming | live | completed
  const [search, setSearch] = useState("");

  const findOwner = (teamName) => {
    if (!teamName) return null;
    const mapped = ESPN_NAME_MAP[teamName] || teamName;
    const n = mapped.toLowerCase().replace(/[^a-z0-9]/g,"");
    return owners.find(o=>(o.teams||[]).some(t=>{
      if (!t.name) return false;
      const tn = (ESPN_NAME_MAP[t.name]||t.name).toLowerCase().replace(/[^a-z0-9]/g,"");
      return tn === n;
    }));
  };

  useEffect(()=>{
    async function loadSchedule() {
      setLoading(true);
      try {
        // Fetch all WC 2026 dates
        const dates = [];
        for (let d = new Date("2026-06-11"); d <= new Date("2026-07-19"); d.setDate(d.getDate()+1)) {
          dates.push(d.toISOString().split("T")[0].replace(/-/g,""));
        }
        const base = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
        const seen = new Set(); const all = [];
        await Promise.all(dates.map(async d=>{
          try {
            const r = await fetch(`${base}?dates=${d}`);
            if (!r.ok) return;
            const data = await r.json();
            for (const ev of (data.events||[])) {
              if (seen.has(ev.id)) continue;
              seen.add(ev.id);
              const comp = ev.competitions?.[0];
              const status = comp?.status?.type;
              const venue = comp?.venue;
              const home = comp?.competitors?.find(c=>c.homeAway==="home");
              const away = comp?.competitors?.find(c=>c.homeAway==="away");
              all.push({
                id: ev.id,
                date: ev.date,
                name: ev.name,
                shortName: ev.shortName,
                round: comp?.notes?.[0]?.headline || "",
                status: status?.description || "",
                state: status?.state || "",
                completed: status?.completed || false,
                isLive: status?.state === "in",
                venue: venue?.fullName || "",
                city: venue?.address?.city || "",
                country: venue?.address?.country || "",
                home: { name: home?.team?.displayName, abbr: home?.team?.abbreviation, score: home?.score, winner: home?.winner, logo: home?.team?.logo },
                away: { name: away?.team?.displayName, abbr: away?.team?.abbreviation, score: away?.score, winner: away?.winner, logo: away?.team?.logo },
              });
            }
          } catch {}
        }));
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        all.sort((a,b)=>{
          const da = new Date(a.date), db = new Date(b.date);
          const aPast = da < todayStart, bPast = db < todayStart;
          if (aPast !== bPast) return aPast ? 1 : -1; // past games sort after current/upcoming
          if (aPast) return db - da; // within past: most recent first (closest to today first)
          return da - db; // within current/upcoming: soonest first
        });
        setGames(all);
      } catch(e) { console.error(e); }
      setLoading(false);
    }
    loadSchedule();
  },[]);

  const filtered = games.filter(g=>{
    if (filter==="live" && !g.isLive) return false;
    if (filter==="completed" && !g.completed) return false;
    if (filter==="upcoming" && (g.completed||g.isLive)) return false;
    if (search) {
      const s = search.toLowerCase();
      return g.home?.name?.toLowerCase().includes(s) || g.away?.name?.toLowerCase().includes(s) || g.venue?.toLowerCase().includes(s) || g.city?.toLowerCase().includes(s);
    }
    return true;
  });

  // Group by date
  const byDate = {};
  filtered.forEach(g=>{
    const d = new Date(g.date).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"});
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(g);
  });

  const inp = {background:"#0a0f1a",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",
    fontFamily:"inherit",fontSize:13,padding:"8px 12px",outline:"none",flex:1};

  return (
    <div>
      <h2 style={{margin:"0 0 4px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2}}>📅 Full Schedule</h2>
      <p style={{color:"#6677aa",fontSize:13,marginBottom:16}}>June 11 – July 19, 2026 · USA, Canada & Mexico</p>

      {/* Tournament Structure */}
      <div style={{...S.card,marginBottom:16,background:"linear-gradient(135deg,#0a1a2e,#111827)",border:"2px solid #f4c430"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
          {[["⚽ Pool Play","Jun 11 – Jul 2","48 teams"],
            ["🔄 Round of 32","Jul 4 – 9","32 teams"],
            ["🔄 Round of 16","Jul 11 – 14","16 teams"],
            ["🏆 QF / SF / Final","Jul 16 – 19","Champion Jul 19"]].map(([title,date,sub])=>(
            <div key={title} style={{background:"#0f1625",border:"1px solid #1a2440",borderRadius:10,padding:"10px 12px"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{title}</div>
              <div style={{fontSize:11,color:"#f4c430",marginBottom:2}}>{date}</div>
              <div style={{fontSize:11,color:"#6677aa"}}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search team or venue..." style={inp} />
        {["all","upcoming","live","completed"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{...S.btn(filter===f?"#1a2440":"transparent",filter===f?"#f4c430":"#6677aa"),
              border:`1px solid ${filter===f?"#f4c430":"#1a2440"}`,fontSize:12,padding:"7px 14px",
              textTransform:"capitalize",flexShrink:0}}>
            {f==="live"?"🔴 Live":f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {loading&&<div style={{textAlign:"center",padding:"40px",color:"#6677aa"}}>Loading schedule from ESPN...</div>}

      {!loading&&filtered.length===0&&<Empty text="No games match your filter." />}

      {/* Games grouped by date */}
      {Object.entries(byDate).map(([date,dayGames])=>(
        <div key={date} style={{marginBottom:20}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,
            color:"#f4c430",marginBottom:10,paddingBottom:6,borderBottom:"1px solid #1a2440"}}>
            {date}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {dayGames.map(g=>{
              const homeOwner = findOwner(g.home?.name);
              const awayOwner = findOwner(g.away?.name);
              const localTime = new Date(g.date).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZoneName:"short"});
              const statusColor = g.isLive?"#e74c3c":g.completed?"#2ecc71":"#6677aa";
              return (
                <div key={g.id} style={{...S.card,padding:"14px 16px",
                  borderLeft:`3px solid ${g.isLive?"#e74c3c":g.completed?"#2ecc71":"#1a2440"}`}}>
                  {/* Header row */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}>
                    <div style={{fontSize:11,color:"#6677aa"}}>{g.round}</div>
                    <div style={{display:"flex",gap:12,alignItems:"center"}}>
                      <span style={{fontSize:11,color:statusColor,fontWeight:700}}>{g.status}</span>
                      {!g.completed&&!g.isLive&&<span style={{fontSize:11,color:"#8899cc"}}>{localTime}</span>}
                    </div>
                  </div>
                  {/* Teams row */}
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {/* Away */}
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                      {awayOwner&&<div style={{width:6,height:24,borderRadius:3,background:awayOwner.color,flexShrink:0}}/>}
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                          color:g.completed&&g.away?.winner?"#2ecc71":g.completed&&!g.away?.winner?"#6677aa":"#dce4f5"}}>
                          {g.away?.name||"TBD"}
                        </div>
                        {awayOwner&&<div style={{fontSize:10,color:awayOwner.color}}>{awayOwner.name.split(" ")[0]}</div>}
                      </div>
                    </div>
                    {/* Score / VS */}
                    <div style={{textAlign:"center",minWidth:60,flexShrink:0}}>
                      {(g.completed||g.isLive)?(
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,fontWeight:800,
                          color:g.isLive?"#e74c3c":"#dce4f5"}}>
                          {g.away?.score} – {g.home?.score}
                        </div>
                      ):(
                        <div style={{fontSize:13,color:"#445",fontWeight:700}}>VS</div>
                      )}
                    </div>
                    {/* Home */}
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:8,justifyContent:"flex-end",minWidth:0}}>
                      <div style={{textAlign:"right",minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                          color:g.completed&&g.home?.winner?"#2ecc71":g.completed&&!g.home?.winner?"#6677aa":"#dce4f5"}}>
                          {g.home?.name||"TBD"}
                        </div>
                        {homeOwner&&<div style={{fontSize:10,color:homeOwner.color,textAlign:"right"}}>{homeOwner.name.split(" ")[0]}</div>}
                      </div>
                      {homeOwner&&<div style={{width:6,height:24,borderRadius:3,background:homeOwner.color,flexShrink:0}}/>}
                    </div>
                  </div>
                  {/* Venue */}
                  {(g.venue||g.city)&&(
                    <div style={{marginTop:8,fontSize:11,color:"#445",display:"flex",gap:6,alignItems:"center"}}>
                      <span>📍</span>
                      <span>{[g.venue,g.city,g.country].filter(Boolean).join(" · ")}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── GROUPS TAB ───────────────────────────────────────────────────────────────
function GroupsTab({ owners, eliminatedTeams = new Set() }) {
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ownerOf = useMemo(() => {
    const map = {};
    (owners||[]).forEach(o => {
      (o.teams||[]).forEach(t => {
        if (t.name) map[t.name.toLowerCase().replace(/[^a-z0-9]/g,"")] = o;
      });
    });
    return map;
  }, [owners]);

  function findOwner(teamName) {
    if (!teamName) return null;
    const key = (ESPN_NAME_MAP[teamName]||teamName).toLowerCase().replace(/[^a-z0-9]/g,"");
    if (ownerOf[key]) return ownerOf[key];
    return Object.entries(ownerOf).find(([k])=>k.includes(key)||key.includes(k))?.[1]||null;
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026");
        if (!res.ok) throw new Error("ESPN standings unavailable");
        const data = await res.json();

        const groups = {};
        for (const groupEntry of (data.children||[])) {
          const groupName = groupEntry.abbreviation || groupEntry.name || "";
          if (!groupName.toLowerCase().includes("group")) continue;
          const label = groupName.replace(/^.*?(Group [A-L]).*$/i,"$1");
          const rows = [];
          for (const entry of (groupEntry.standings?.entries||[])) {
            const teamName  = entry.team?.displayName || entry.team?.name || "";
            const logo      = entry.team?.logos?.[0]?.href || null;
            const abbr      = entry.team?.abbreviation || "";
            // ESPN uses abbreviations: P=points, F=goalsFor, A=goalsAgainst, GD=goalDiff, W=wins, D=draws, L=losses, GP=gamesPlayed, ADV=advanced
            const stats = {};
            (entry.stats||[]).forEach(s => {
              stats[s.abbreviation] = { value: s.value, display: s.displayValue };
            });
            const pts  = stats["P"]?.value   ?? 0;
            const w    = stats["W"]?.value   ?? 0;
            const d    = stats["D"]?.value   ?? 0;
            const l    = stats["L"]?.value   ?? 0;
            const gf   = stats["F"]?.value   ?? 0;
            const ga   = stats["A"]?.value   ?? 0;
            const gd   = stats["GD"]?.value  ?? (gf - ga);
            const gp   = stats["GP"]?.value  ?? (w+d+l);
            const record = stats["0"]?.display || `${w}-${d}-${l}`;
            // ESPN note color: #81D6AC = advanced, #FF7F84 = eliminated, yellow = 3rd place possible
            // BUT note.color is unreliable (can be stale) — prefer ADV stat value
            const noteColor = entry.note?.color || "";
            const noteDesc  = entry.note?.description || "";
            const advStat   = stats["ADV"]?.value ?? null;
            // ADV=1 means confirmed advanced, ADV=0 with gp=3 means eliminated
            // Fall back to note color only if ADV stat is missing
            const advanced    = advStat === 1 || (advStat === null && (noteColor === "81D6AC" || noteColor === "#81D6AC" || noteDesc.toLowerCase().includes("advance to round")));
            const eliminated  = (advStat === 0 && gp >= 3) || (advStat === null && (noteColor === "FF7F84" || noteColor === "#FF7F84" || noteDesc.toLowerCase().includes("eliminat")));
            const thirdChance = !advanced && !eliminated && (noteColor === "E8E077" || noteColor === "#E8E077" || noteDesc.toLowerCase().includes("third"));
            const inProgress  = gp > 0 && gp < 3;
            rows.push({ teamName, abbr, logo, pts, w, d, l, gf, ga, gd, gp, record, advanced, eliminated, thirdChance, inProgress, noteDesc });
          }
          rows.sort((a,b) => b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
          if (rows.length) groups[label] = rows;
        }

        if (!Object.keys(groups).length) throw new Error("No group data returned");
        setStandings(groups);
      } catch(e) {
        setError(e.message);
        const groups = {};
        ["A","B","C","D","E","F","G","H","I","J","K","L"].forEach(g => {
          groups[`Group ${g}`] = WC_TEAMS
            .filter(t=>t.group===`Group ${g}`)
            .map(t=>({teamName:t.name,abbr:"",logo:null,pts:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,gp:0,record:"0-0-0",advanced:false,eliminated:false,thirdChance:false,inProgress:false,noteDesc:""}));
        });
        setStandings(groups);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const TH = { padding:"5px 6px",textAlign:"center",fontSize:10,color:"#6677aa",fontWeight:700,textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid #1a2440",whiteSpace:"nowrap" };
  const TD = { padding:"6px 6px",textAlign:"center",fontSize:12,borderBottom:"1px solid #0a0f1a" };

  if (loading) return <div style={{textAlign:"center",padding:"40px",color:"#6677aa"}}>Loading group standings from ESPN...</div>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <h2 style={{margin:"0 0 4px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2}}>🌍 Group Standings</h2>
        <p style={{color:"#6677aa",fontSize:12,margin:0}}>
          Live from ESPN · <span style={{color:"#2ecc71"}}>■</span> Advanced &nbsp;
          <span style={{color:"#f39c12"}}>■</span> 3rd Place Contender &nbsp;
          <span style={{color:"#e74c3c"}}>■</span> Eliminated &nbsp;
          Owner dot = drafted by
        </p>
        {error&&<p style={{color:"#e74c3c",fontSize:11,marginTop:4}}>⚠ {error} — showing static team list.</p>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {Object.entries(standings).sort(([a],[b])=>a.localeCompare(b)).map(([groupName,rows])=>(
          <div key={groupName} style={{background:"#0f1625",border:"1px solid #1a2440",borderRadius:12,overflow:"hidden"}}>
            <div style={{background:"#141d38",padding:"9px 14px",display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:10,height:10,borderRadius:2,background:GROUP_COLORS[groupName]||"#6677aa",flexShrink:0}}/>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:1.5,color:"#dce4f5"}}>{groupName}</span>
            </div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:380}}>
              <thead>
                <tr style={{background:"#0a0f1a"}}>
                  <th style={{...TH,textAlign:"left",paddingLeft:8,width:"32%"}}>Team</th>
                  <th style={TH}>GP</th>
                  <th style={TH}>W</th>
                  <th style={TH}>D</th>
                  <th style={TH}>L</th>
                  <th style={TH}>GF</th>
                  <th style={TH}>GA</th>
                  <th style={TH}>GD</th>
                  <th style={{...TH,color:"#f4c430"}}>PTS</th>
                  <th style={TH}>Owner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row,i)=>{
                  const wcTeam = WC_TEAMS.find(t=>t.name===row.teamName||(ESPN_NAME_MAP[row.teamName]===t.name));
                  const owner  = findOwner(row.teamName);
                  const isOut  = row.eliminated || eliminatedTeams.has(row.teamName) || (wcTeam && eliminatedTeams.has(wcTeam.name));
                  const statusColor = row.advanced?"#27ae60":isOut?"#e74c3c":row.thirdChance?"#f39c12":"transparent";
                  return (
                    <tr key={row.teamName} style={{
                      background:i%2===0?"#0f1625":"#0a0f1a",
                      opacity:isOut?0.55:1,
                      borderLeft:`3px solid ${statusColor}`,
                    }}>
                      <td style={{...TD,textAlign:"left",paddingLeft:8,maxWidth:130}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          {row.logo
                            ? <img src={row.logo} alt="" style={{width:16,height:16,objectFit:"contain",flexShrink:0}}/>
                            : <div style={{width:16,height:16,borderRadius:2,background:"#1a2440",flexShrink:0}}/>
                          }
                          <div style={{minWidth:0}}>
                            <div style={{fontWeight:600,fontSize:11,color:row.advanced?"#2ecc71":isOut?"#666":"#dce4f5",lineHeight:1.2,
                              textDecoration:isOut?"line-through":"none",
                              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {row.teamName}
                            </div>
                            <div style={{fontSize:9,color:"#445",lineHeight:1,whiteSpace:"nowrap"}}>
                              {wcTeam?`#${wcTeam.seed}`:""}
                              {isOut?<span style={{color:"#e74c3c",marginLeft:3}}>Out</span>:""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{...TD,color:"#6677aa"}}>{row.gp}</td>
                      <td style={{...TD,color:"#2ecc71",fontWeight:row.w>0?700:400}}>{row.w}</td>
                      <td style={{...TD,color:"#f39c12"}}>{row.d}</td>
                      <td style={{...TD,color:"#e74c3c"}}>{row.l}</td>
                      <td style={TD}>{row.gf}</td>
                      <td style={TD}>{row.ga}</td>
                      <td style={{...TD,color:row.gd>0?"#2ecc71":row.gd<0?"#e74c3c":"#8899cc",fontWeight:600}}>
                        {row.gd>0?`+${row.gd}`:row.gd}
                      </td>
                      <td style={{...TD,color:"#f4c430",fontWeight:700,fontSize:14}}>{row.pts}</td>
                      <td style={TD}>
                        {owner
                          ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                              <div style={{width:7,height:7,borderRadius:"50%",background:owner.color,flexShrink:0}}/>
                              <span style={{fontSize:9,color:"#8899cc",whiteSpace:"nowrap"}}>{owner.name.split(" ")[0]}</span>
                            </div>
                          : <span style={{color:"#2a3560",fontSize:10}}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function DraftTab({ owners, setOwners, isAdmin, authUser, alert: showAlert, leagueCode, onRefresh, teamsPerOwner: tpo }) {
  const teamsPerOwner = tpo || 6;
  // Real-time draft updates via Supabase channel + 3s poll fallback
  useEffect(() => {
    if (!leagueCode) return;

    // Subscribe to owner changes via realtime
    const ch = supabase.channel(`draft-${leagueCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "owners" }, async () => {
        const { data } = await supabase.from("owners").select("*").eq("league_code", leagueCode).order("num");
        if (data) setOwners(data);
      })
      .subscribe();

    // 3s poll as fallback (handles cases where realtime misses events)
    const poll = setInterval(async () => {
      const { data } = await supabase.from("owners").select("*").eq("league_code", leagueCode).order("num");
      if (data) setOwners(prev => {
        // Only update if data actually changed (compare team picks)
        const changed = data.some((o, i) => {
          const prev_o = prev.find(p => p.id === o.id);
          return !prev_o || JSON.stringify(o.teams) !== JSON.stringify(prev_o.teams);
        });
        return changed ? data : prev;
      });
    }, 3000);

    return () => {
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [leagueCode]);
  const pickedNames = owners.flatMap(o=>(o.teams||[]).map(t=>(t.name||"").toLowerCase().trim()));
  const available = WC_TEAMS.filter(t=>!pickedNames.includes(t.name.toLowerCase().trim()));
  const totalPicks = owners.reduce((sum,o)=>sum+(o.teams||[]).filter(t=>t.name&&t.name.trim()).length,0);
  const numOwners = owners.length;
  const pickRound = Math.floor(totalPicks/Math.max(numOwners,1));
  const posInRound = totalPicks%Math.max(numOwners,1);
  const isEvenRound = pickRound%2===0;
  const sortedOwners = [...owners].sort((a,b)=>a.num-b.num);
  const currentPickerIdx = isEvenRound?posInRound:(numOwners-1-posInRound);
  const currentPicker = sortedOwners[currentPickerIdx]||null;
  const draftComplete = totalPicks>=numOwners*teamsPerOwner&&numOwners>0;

  async function draftPick(team) {
    if (!currentPicker) return;

    // Non-admins can only pick when it's their own turn
    if (!isAdmin) {
      const userName = (authUser?.user_metadata?.name || authUser?.email || "").toLowerCase().trim();
      const pickerName = (currentPicker.name || "").toLowerCase().trim();
      if (userName !== pickerName) {
        showAlert(`It's ${currentPicker.name}'s turn — wait for your pick!`, "error");
        return;
      }
    }

    const updatedTeams = [...(currentPicker.teams||[])];
    const emptyIdx = updatedTeams.findIndex(t=>!t.name||!t.name.trim());
    if (emptyIdx===-1) { showAlert(`This owner already has ${teamsPerOwner} teams.`,"error"); return; }
    updatedTeams[emptyIdx] = { seed:team.seed, name:team.name, group:team.group };
    const { error } = await supabase.from("owners").update({ teams:updatedTeams }).eq("id",currentPicker.id);
    if (error) { showAlert("Failed to save pick.","error"); return; }
    setOwners(prev=>prev.map(o=>o.id===currentPicker.id?{...o,teams:updatedTeams}:o));
    showAlert(`⚽ ${currentPicker.name} drafted ${team.name}!`);
  }

  async function resetDraft() {
    const blank = Array.from({length:teamsPerOwner},(_,i)=>({seed:i+1,name:"",group:""}));
    for (const o of owners) await supabase.from("owners").update({teams:blank}).eq("id",o.id);
    setOwners(prev=>prev.map(o=>({...o,teams:blank})));
    showAlert("Draft reset! All picks cleared.");
  }

  async function shuffleOrder() {
    const shuffled = [...owners].sort(()=>Math.random()-0.5);
    for (let i=0; i<shuffled.length; i++) {
      await supabase.from("owners").update({num:i+1}).eq("id",shuffled[i].id);
    }
    setOwners(prev=>{
      const map = Object.fromEntries(shuffled.map((o,i)=>[o.id,i+1]));
      return prev.map(o=>({...o,num:map[o.id]}));
    });
    showAlert("🎲 Draft order shuffled!");
  }

  const groupNames = [...new Set(WC_TEAMS.map(t=>t.group))].sort();

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2 style={{ margin:"0 0 4px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>🐍 Snake Draft</h2>
          <p style={{ margin:0,color:"#6677aa",fontSize:13 }}>
            {draftComplete?"✅ Draft complete! All teams assigned.":
              numOwners===0?"Add owners in Admin tab first.":
              `Round ${pickRound+1} · Pick ${posInRound+1} of ${numOwners} · ${available.length} teams remaining`}
          </p>
        </div>
        {isAdmin&&(
          <div style={{display:"flex",gap:8}}>
            <button onClick={shuffleOrder} disabled={draftComplete}
              style={{...S.btn("#1a2440","#f4c430"),border:"1px solid #f4c430",fontSize:12,opacity:draftComplete?0.5:1}}>
              🎲 Shuffle Order
            </button>
            <button onClick={resetDraft}
              style={{...S.btn("#1a2440","#e74c3c"),border:"1px solid #e74c3c",fontSize:12}}>
              🗑 Reset Draft
            </button>
          </div>
        )}
      </div>

      {/* Current Picker Banner */}
      {!draftComplete&&currentPicker&&(()=>{
        const userName = (authUser?.user_metadata?.name||authUser?.email||"").toLowerCase().trim();
        const pickerName = (currentPicker.name||"").toLowerCase().trim();
        const isMyTurn = isAdmin || (userName && userName === pickerName);
        return (
          <div style={{ background:isMyTurn?"linear-gradient(135deg,#0a2e1a,#142010)":"#0f1625",
            border:`2px solid ${isMyTurn?currentPicker.color:"#2a3550"}`,
            borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
            <div style={{ width:44,height:44,borderRadius:"50%",background:currentPicker.color,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#fff",flexShrink:0 }}>
              {currentPicker.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1.5,marginBottom:2 }}>
                {isMyTurn?"🟢 Your Turn — Pick a Team":"⏳ Waiting for Pick"}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:currentPicker.color }}>
                {currentPicker.name}
              </div>
            </div>
            <div style={{ marginLeft:"auto",textAlign:"right" }}>
              <div style={{ fontSize:11,color:"#6677aa" }}>Round {pickRound+1} · Pick {totalPicks+1}</div>
              <div style={{ fontSize:12,color:"#dce4f5" }}>{(currentPicker.teams||[]).filter(t=>t.name).length}/{teamsPerOwner} teams</div>
            </div>
          </div>
        );
      })()}

      {/* Draft Order */}
      {!draftComplete&&owners.length>0&&(
        <div style={{ marginBottom:16,background:"#080e1a",border:"1px solid #1e2d4a",borderRadius:10,padding:"12px 16px" }}>
          <div style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:"#6677aa",marginBottom:10 }}>Draft Order · Round {pickRound+1}</div>
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {sortedOwners.map(o=>{
              const isCurrent=currentPicker&&o.id===currentPicker.id;
              return (
                <div key={o.id} style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,
                  background:isCurrent?(o.color+"33"):"#0d1528",border:`1px solid ${isCurrent?o.color:"#1e2d4a"}` }}>
                  <span style={{ width:18,height:18,borderRadius:"50%",background:isCurrent?o.color:"#1e2d4a",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,
                    color:isCurrent?"#111":"#6677aa",flexShrink:0 }}>{o.num}</span>
                  <span style={{ fontSize:13,fontWeight:isCurrent?700:400,color:isCurrent?o.color:"#556" }}>{o.name}</span>
                  {isCurrent&&<span style={{ fontSize:9,color:o.color,fontWeight:800 }}>ON THE CLOCK</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {draftComplete&&(
        <div style={{ textAlign:"center",padding:32,background:"linear-gradient(135deg,#0a2e1a,#142010)",
          border:"2px solid #2ecc71",borderRadius:14,marginBottom:20 }}>
          <div style={{ fontSize:40,marginBottom:8 }}>🏆</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:"#2ecc71" }}>Draft Complete!</div>
          <div style={{ color:"#6677aa",fontSize:13,marginTop:6 }}>All {numOwners*teamsPerOwner} picks made. Let's play!</div>
        </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:"1fr 320px",gap:16,alignItems:"start" }}>
        {/* Available Teams by Group */}
        <div>
          <div style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10 }}>Available Teams ({available.length})</div>
          {groupNames.map(group=>{
            const groupTeams = available.filter(t=>t.group===group);
            if (!groupTeams.length) return null;
            const color = GROUP_COLORS[group]||"#555";
            return (
              <div key={group} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,color,marginBottom:6,display:"flex",alignItems:"center",gap:6 }}>
                  <span style={{ width:8,height:8,borderRadius:"50%",background:color,display:"inline-block" }}/>{group}
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
                  {groupTeams.map(team=>{
                    const userName = (authUser?.user_metadata?.name||authUser?.email||"").toLowerCase().trim();
                    const pickerName = (currentPicker?.name||"").toLowerCase().trim();
                    const isMyTurn = isAdmin || (userName && userName === pickerName);
                    const btnDisabled = draftComplete || !currentPicker || !isMyTurn;
                    return (
                      <button key={team.name} onClick={()=>draftPick(team)} disabled={btnDisabled}
                        title={!isMyTurn&&!draftComplete?`Wait for ${currentPicker?.name}'s pick`:""}
                        style={{ display:"flex",alignItems:"center",gap:8,background:"#0f1625",
                          border:`1px solid ${isMyTurn?color+"44":"#1a2440"}`,borderRadius:8,padding:"7px 10px",
                          cursor:btnDisabled?"not-allowed":"pointer",fontFamily:"inherit",textAlign:"left",
                          opacity:btnDisabled?0.35:1 }}>
                        <SeedBadge seed={team.seed} />
                        <span style={{ fontSize:12,fontWeight:600,color:isMyTurn?"#dce4f5":"#445",flex:1 }}>{team.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {available.length===0&&!draftComplete&&<Empty text="All teams have been drafted!" />}
        </div>

        {/* Draft Board */}
        <div style={{ overflowX:"auto" }}>
          <div style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:10 }}>Draft Board</div>
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <table style={{ width:"100%",borderCollapse:"collapse",background:"#0a0f1a",borderRadius:12,overflow:"hidden",minWidth:600 }}>
            <thead>
              <tr style={{ background:"#141d38" }}>
                <th style={{ padding:"10px 14px",textAlign:"left",fontSize:11,color:"#6677aa",
                  fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,
                  borderBottom:"2px solid #1a2440",width:60 }}>Rd</th>
                {sortedOwners.map(o=>(
                  <th key={o.id} style={{ padding:"10px 8px",textAlign:"center",
                    borderBottom:"2px solid #1a2440",borderLeft:"1px solid #1a2440" }}>
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:o.color,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,fontWeight:800,color:"#fff",flexShrink:0 }}>
                        {o.name.charAt(0)}
                      </div>
                      <div style={{ fontSize:11,fontWeight:700,color:o.color,
                        whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:72 }}>
                        {o.name.split(" ")[0]}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({length:teamsPerOwner},(_,round)=>{
                const isEvenR=round%2===0;
                return (
                  <tr key={round} style={{ background:round%2===0?"#0a0f1a":"#080d14" }}>
                    <td style={{ padding:"10px 14px",borderBottom:"1px solid #131929",
                      borderRight:"2px solid #1a2440" }}>
                      <div style={{ fontSize:12,fontWeight:700,color:"#6677aa" }}>Rd {round+1}</div>
                      <div style={{ fontSize:9,color:"#334",marginTop:1 }}>{isEvenR?"→":"←"}</div>
                    </td>
                    {sortedOwners.map((o,oi)=>{
                      const pick=(o.teams||[])[round];
                      const globalPick=round*numOwners+(isEvenR?oi:numOwners-1-oi);
                      const isCurrent=globalPick===totalPicks&&!draftComplete;
                      return (
                        <td key={o.id} style={{ padding:"8px 6px",textAlign:"center",
                          borderBottom:"1px solid #131929",borderLeft:"1px solid #1a2440",
                          background:isCurrent?o.color+"22":"transparent",
                          outline:isCurrent?`2px solid ${o.color}`:"none",
                          outlineOffset:"-2px" }}>
                          {pick?.name?(
                            <div>
                              <div style={{ fontSize:10,color:o.color,fontWeight:800,marginBottom:2 }}>
                                #{pick.seed}
                              </div>
                              <div style={{ fontSize:11,fontWeight:600,color:"#dce4f5",
                                lineHeight:1.3,whiteSpace:"nowrap",overflow:"hidden",
                                textOverflow:"ellipsis",maxWidth:80 }}>
                                {pick.name}
                              </div>
                              {pick.group&&<div style={{ fontSize:9,color:GROUP_COLORS[pick.group]||"#445",marginTop:2 }}>
                                {pick.group.replace("Group ","")}
                              </div>}
                            </div>
                          ):(
                            isCurrent?(
                              <div style={{ fontSize:10,color:o.color,fontWeight:700,animation:"pulse 1s infinite" }}>
                                ON THE<br/>CLOCK
                              </div>
                            ):(
                              <div style={{ width:20,height:2,background:"#1a2440",borderRadius:1,margin:"0 auto" }} />
                            )
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>

          {/* Teams Drafted per Owner */}
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:8 }}>Teams Drafted</div>
            {sortedOwners.map(o=>{
              const drafted=(o.teams||[]).filter(t=>t.name&&t.name.trim());
              return (
                <div key={o.id} style={{ marginBottom:8,background:"#0a0f1a",
                  border:`1px solid ${o.id===currentPicker?.id?o.color:"#1a2440"}`,borderRadius:10,padding:"10px 12px" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:o.color }} />
                    <span style={{ fontWeight:700,fontSize:13,color:o.id===currentPicker?.id?o.color:"#dce4f5" }}>{o.name}</span>
                    <span style={{ marginLeft:"auto",fontSize:11,color:"#445" }}>{drafted.length}/{teamsPerOwner}</span>
                  </div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>
                    {drafted.map((t,i)=>(
                      <span key={i} style={{ fontSize:10,background:"#1a2440",color:GROUP_COLORS[t.group]||"#dce4f5",
                        borderRadius:4,padding:"2px 6px",display:"flex",alignItems:"center",gap:3 }}>
                        <SeedBadge seed={t.seed} /><span>{t.name}</span>
                      </span>
                    ))}
                    {Array.from({length:teamsPerOwner-drafted.length}).map((_,i)=>(
                      <span key={`e${i}`} style={{ fontSize:10,background:"#111",color:"#333",borderRadius:4,padding:"2px 8px",border:"1px dashed #1a2440" }}>—</span>
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
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────


// ─── OWNER MANAGER COMPONENT ─────────────────────────────────────────────────
function OwnerManager({ owners, stats, leagueCode, onRefresh, alertFn, teamsPerOwner }) {
  const tpo = teamsPerOwner || 6;
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(OWNER_COLORS[0]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const inp = { background:"#0a0f1a", border:"1px solid #1a2440", borderRadius:8,
    color:"#dce4f5", fontFamily:"inherit", fontSize:13, padding:"7px 10px",
    outline:"none", width:"100%" };

  async function saveEdit(id) {
    if (!editName.trim()) return;
    const { error } = await supabase.from("owners")
      .update({ name: editName.trim(), color: editColor })
      .eq("id", id);
    if (error) { alertFn("Error: " + error.message, "error"); return; }
    alertFn("✅ Owner updated!");
    setEditingId(null);
    onRefresh();
  }

  async function addOwner() {
    if (!newName.trim()) return;
    if (owners.length >= 12) { alertFn("Max 12 owners per league.", "error"); return; }
    const blank = Array.from({length:tpo}, (_,i) => ({seed:i+1, name:"", group:""}));
    const { error } = await supabase.from("owners").insert({
      league_code: leagueCode,
      name: newName.trim(),
      color: newColor,
      num: owners.length + 1,
      teams: blank,
    });
    if (error) { alertFn("Error: " + error.message, "error"); return; }
    alertFn(`✅ ${newName.trim()} added!`);
    setNewName("");
    onRefresh();
  }

  async function deleteOwner(id, name) {
    // Also remove their wins and draws
    await supabase.from("wins").delete().eq("owner_id", id);
    await supabase.from("draws").delete().eq("owner_id", id);
    const { error } = await supabase.from("owners").delete().eq("id", id);
    if (error) { alertFn("Error: " + error.message, "error"); return; }
    alertFn(`✅ ${name} removed.`);
    setConfirmDelete(null);
    onRefresh();
  }

  async function loadDefaults() {
    for (let i = 0; i < CHI2025_OWNERS.length; i++) {
      const o = CHI2025_OWNERS[i];
      const blank = Array.from({length:tpo}, (_,j) => ({seed:j+1, name:"", group:""}));
      await supabase.from("owners").insert({
        league_code: leagueCode, name: o.name, color: o.color, num: i+1, teams: blank
      });
    }
    onRefresh();
    alertFn("✅ Default 8 owners loaded!");
  }

  return (
    <div style={S.card}>
      <SecTitle>👥 Manage Owners</SecTitle>

      {/* Owner list */}
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
        {owners.length === 0 && <Empty text="No owners yet." />}
        {owners.map(o => {
          const s = stats.find(x => x.id === o.id);
          const isEditing = editingId === o.id;
          return (
            <div key={o.id} style={{ background:"#0a0f1a", border:`1px solid ${o.color}44`,
              borderLeft:`3px solid ${o.color}`, borderRadius:10, padding:"10px 14px" }}>
              {isEditing ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input value={editColor} onChange={e => setEditColor(e.target.value)}
                      type="color" style={{ width:32, height:32, borderRadius:6, border:"none",
                        background:"none", cursor:"pointer", padding:0 }} />
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      placeholder="Owner name" style={{ ...inp, flex:1 }}
                      onKeyDown={e => e.key==="Enter" && saveEdit(o.id)} />
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => saveEdit(o.id)}
                      style={{ ...S.btn(), flex:1, fontSize:12, padding:"7px" }}>✓ Save</button>
                    <button onClick={() => setEditingId(null)}
                      style={{ ...S.btn("#1a2440","#6677aa"), flex:1, fontSize:12, padding:"7px" }}>Cancel</button>
                  </div>
                </div>
              ) : confirmDelete === o.id ? (
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                  <span style={{ flex:1, fontSize:13, color:"#e74c3c", fontWeight:700 }}>
                    Delete {o.name}? This removes all their wins/draws too.
                  </span>
                  <button onClick={() => deleteOwner(o.id, o.name)}
                    style={{ ...S.btn("#3a0a0a","#e74c3c"), border:"1px solid #e74c3c", fontSize:12, padding:"6px 12px" }}>
                    ✕ Delete
                  </button>
                  <button onClick={() => setConfirmDelete(null)}
                    style={{ ...S.btn("#1a2440","#6677aa"), fontSize:12, padding:"6px 12px" }}>Cancel</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:o.color, flexShrink:0 }} />
                  <span style={{ fontWeight:700, flex:1 }}>{o.name}</span>
                  <span style={{ fontSize:11, color:"#6677aa" }}>{(o.teams||[]).filter(t=>t.name).length}/{teamsPerOwner} teams</span>
                  {s && <span style={{ fontSize:12, fontFamily:"'DM Mono',monospace",
                    color:s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667" }}>
                    {s.net>=0?"+":""}${s.net.toFixed(2)}
                  </span>}
                  <button onClick={() => { setEditingId(o.id); setEditName(o.name); setEditColor(o.color); }}
                    style={{ ...S.btn("#1a2440","#f4c430"), fontSize:11, padding:"5px 10px" }}>✏ Edit</button>
                  <button onClick={() => setConfirmDelete(o.id)}
                    style={{ background:"none", border:"1px solid #3a1820", borderRadius:6,
                      color:"#e74c3c", padding:"5px 8px", cursor:"pointer", fontSize:12 }}>✕</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add new owner */}
      <div style={{ background:"#080e1a", border:"1px solid #1e2d4a", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
        <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:1.5,
          fontWeight:700, marginBottom:10 }}>+ Add Owner</div>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
          <input value={newColor} onChange={e => setNewColor(e.target.value)}
            type="color" style={{ width:36, height:36, borderRadius:8, border:"none",
              background:"none", cursor:"pointer", padding:0, flexShrink:0 }} />
          <input value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Owner name" style={{ ...inp, flex:1 }}
            onKeyDown={e => e.key==="Enter" && addOwner()} />
          <button onClick={addOwner} style={{ ...S.btn(), padding:"8px 16px", fontSize:13, flexShrink:0 }}>Add</button>
        </div>
        {/* Color presets */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {OWNER_COLORS.map(c => (
            <button key={c} onClick={() => setNewColor(c)}
              style={{ width:20, height:20, borderRadius:"50%", background:c, border:
                newColor===c?"2px solid #fff":"2px solid transparent", cursor:"pointer", padding:0 }} />
          ))}
        </div>
      </div>

      {/* Load defaults */}
      {owners.length === 0 && (
        <div>
          <button onClick={loadDefaults}
            style={{ ...S.btn("#1a2440","#f4c430"), border:"1px solid #f4c430", fontSize:13, padding:"10px 20px", width:"100%" }}>
            Load Default 8 Owners (CHI2025)
          </button>
          <p style={{ fontSize:11, color:"#445", marginTop:6, textAlign:"center" }}>Only use when table is empty.</p>
        </div>
      )}
    </div>
  );
}

function genCode() {
  return Math.random().toString(36).substring(2,8).toUpperCase();
}

export default function WorldCupApp() {
  const [tab, setTab] = useState(() => {
    // Restore active tab from URL hash (e.g. #worldcup/leaderboard)
    const hash = window.location.hash.replace('#','');
    const part = hash.split('/')[1];
    const valid = ["leaderboard","wins","livescores","groups","schedule","roster","topteams","payouts","draft","howtoplay","profile","admin"];
    return valid.includes(part) ? part : "leaderboard";
  });
  const [leagueCode, setLeagueCode] = useState(() => {
    // Restore league from localStorage on first load — no need to re-enter code
    try {
      // Check per-user key first (set after sign-in)
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.startsWith("wc_league_"));
      if (userKey) return localStorage.getItem(userKey) || LEAGUE_CODE;
      // Fall back to last active league
      const active = localStorage.getItem("wc_active_league");
      if (active) return active;
      // Fall back to first saved league
      const saved = JSON.parse(localStorage.getItem("wc_my_leagues") || "[]");
      if (saved.length > 0) return saved[saved.length - 1].code;
    } catch {}
    return LEAGUE_CODE;
  });
  const [owners, setOwners] = useState([]);
  const [wins, setWins] = useState([]);
  const [draws, setDraws] = useState([]);
  const [league, setLeague] = useState(null);
  const [teamsPerOwner, setTeamsPerOwner] = useState(6);
  const [eliminatedTeams, setEliminatedTeams] = useState(new Set()); // team names confirmed eliminated by ESPN

  const [rounds, setRounds] = useState(() => {
    // Try localStorage first as immediate fallback before Supabase loads
    try {
      const saved = localStorage.getItem(`wc_rounds_${leagueCode || LEAGUE_CODE}`);
      if (saved) return getRounds({ round_values: JSON.parse(saved) });
    } catch {}
    return getRounds({});
  });
  const [editingRounds, setEditingRounds] = useState(false);
  const [allLeagues, setAllLeagues] = useState([]);
  const [roundDraft, setRoundDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [authView, setAuthView] = useState("signin"); // signin | signup
  const [authError, setAuthError] = useState("");
  const [authWorking, setAuthWorking] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [stats, setStats] = useState([]);

  // Auto-sync ESPN
  const [autoSync, setAutoSync] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [syncLog, setSyncLog] = useState([]);

  // League management
  const [myLeagues, setMyLeagues] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wc_my_leagues") || "[]");
      // If they have a saved active league but it's not in myLeagues yet, add it
      const active = localStorage.getItem("wc_active_league");
      if (active && !saved.find(l => l.code === active)) {
        return [...saved, { code: active, name: active }];
      }
      return saved;
    } catch { return []; }
  });
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [newLeagueName, setNewLeagueName] = useState("");
  const [paymentStep, setPaymentStep] = useState("instructions"); // instructions | pending | approved | error
  const [venmoUsername, setVenmoUsername] = useState("");
  const [paymentVerifyErr, setPaymentVerifyErr] = useState("");

  // Admin modal fields
  const [pinInput, setPinInput] = useState("");
  const [winOwnerId, setWinOwnerId] = useState("");
  const [winTeamName, setWinTeamName] = useState("");
  const [winRound, setWinRound] = useState("Pool Play");
  const [winType, setWinType] = useState("win");

  // Auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authName, setAuthName] = useState("");

  const isAdmin = adminUnlocked;

  // Load all leagues when admin is unlocked
  useEffect(() => {
    if (!adminUnlocked) return;
    supabase.from("leagues").select("code,name,settings").order("name")
      .then(({data}) => { if (data) setAllLeagues(data); });
  }, [adminUnlocked]);

  // Fetch eliminated teams from ESPN standings + knockout round losers — refresh every 5 minutes
  useEffect(() => {
    const ESPN_ELIM_MAP = {
      "Türkiye": "Türkiye", "Curaçao": "Curaçao",
      "IR Iran": "Iran", "Korea Republic": "South Korea",
      "Republic of Korea": "South Korea", "USA": "United States",
    };
    const norm = n => n.toLowerCase().replace(/[^a-z0-9]/g,"");

    function addTeam(eliminated, espnName) {
      if (!espnName) return;
      eliminated.add(espnName);
      if (ESPN_ELIM_MAP[espnName]) eliminated.add(ESPN_ELIM_MAP[espnName]);
      const mapped = ESPN_NAME_MAP[espnName];
      if (mapped) eliminated.add(mapped);
      const en = norm(espnName);
      WC_TEAMS.forEach(t => {
        const tn = norm(t.name);
        if (tn === en || en.includes(tn) || tn.includes(en)) eliminated.add(t.name);
      });
    }

    async function fetchEliminated() {
      try {
        const eliminated = new Set();

        // 1. Group stage eliminations from standings (ADV=0, GP>=3)
        const sRes = await fetch("https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026");
        if (sRes.ok) {
          const sData = await sRes.json();
          for (const groupEntry of (sData.children||[])) {
            for (const entry of (groupEntry.standings?.entries||[])) {
              const espnName = entry.team?.displayName || entry.team?.name || "";
              if (!espnName) continue;
              const stats = {};
              (entry.stats||[]).forEach(s => { stats[s.abbreviation] = s.value; });
              const advStat = stats["ADV"];
              const gp = Number(stats["GP"] ?? 0);
              const noteColor = (entry.note?.color || "").replace("#","");
              const noteDesc  = (entry.note?.description || "").toLowerCase();
              const isEliminated = (advStat !== undefined && Number(advStat) === 0 && gp >= 3) ||
                (advStat === undefined && (noteColor === "FF7F84" || noteDesc.includes("eliminat")));
              if (isEliminated) addTeam(eliminated, espnName);
            }
          }
        }

        // 2. Knockout round losers from scoreboard (R32 June 28–July 3, R16 July 4–7, QF July 8–11, SF July 14–15)
        const knockoutDates = [];
        for (let d = new Date("2026-06-28"); d <= new Date("2026-07-15"); d.setDate(d.getDate()+1)) {
          knockoutDates.push(d.toISOString().slice(0,10).replace(/-/g,""));
        }
        await Promise.all(knockoutDates.map(async dateStr => {
          try {
            const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`);
            if (!r.ok) return;
            const d = await r.json();
            for (const ev of (d.events||[])) {
              const comp = ev.competitions?.[0];
              if (!comp?.status?.type?.completed) continue;
              const competitors = comp.competitors || [];
              const winner = competitors.find(c => c.winner);
              // In knockout rounds, non-winner = eliminated (draws go to extra time/pens, winner flag set after)
              if (!winner) return;
              const loser = competitors.find(c => !c.winner);
              if (loser) addTeam(eliminated, loser.team?.displayName || loser.team?.name);
            }
          } catch {}
        }));

        setEliminatedTeams(new Set(eliminated));
      } catch(e) { console.error("fetchEliminated error:", e); }
    }
    fetchEliminated();
    const interval = setInterval(fetchEliminated, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);


  function saveToMyLeagues(code, name) {
    setMyLeagues(prev => {
      const filtered = prev.filter(l => l.code !== code);
      const updated = [...filtered, { code, name }];
      localStorage.setItem("wc_my_leagues", JSON.stringify(updated));
      return updated;
    });
  }

  function removeFromMyLeagues(code) {
    setMyLeagues(prev => {
      const updated = prev.filter(l => l.code !== code);
      localStorage.setItem("wc_my_leagues", JSON.stringify(updated));
      return updated;
    });
  }

  async function switchLeague(code) {
    setLeagueCode(code);
    localStorage.setItem("wc_active_league", code);
    if (authUser) localStorage.setItem(`wc_league_${authUser.id}`, code);
    setTab("leaderboard");
    window.location.hash = "worldcup/leaderboard";
  }

  async function autoAddUserAsOwner(code) {
    if (!authUser) return;
    const userName = authUser.user_metadata?.name || authUser.email;
    const { data: existingOwners } = await supabase
      .from("owners").select("name,id").eq("league_code", code);
    const alreadyOwner = existingOwners?.some(o =>
      o.name.toLowerCase().trim() === userName.toLowerCase().trim()
    );
    if (!alreadyOwner) {
      const color = OWNER_COLORS[(existingOwners?.length || 0) % OWNER_COLORS.length];
      const num = (existingOwners?.length || 0) + 1;
      const blankTeams = Array.from({length:teamsPerOwner}, (_,i) => ({ seed:i+1, name:"", group:"" }));
      await supabase.from("owners").insert({
        league_code: code, name: userName, color, num, teams: blankTeams
      });
    }
  }

  async function joinLeague() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const { data, error } = await supabase.from("leagues").select("*").eq("code", code).single();
    if (error || !data) { setJoinErr("No league found with that code."); return; }
    saveToMyLeagues(code, data.name || code);
    await autoAddUserAsOwner(code);
    switchLeague(code);
    setJoinCode(""); setJoinErr("");
    setModal(null);
    alert(`✅ Joined league: ${data.name || code}!`);
  }

  async function createLeague() {
    if (!newLeagueName.trim()) return;
    const code = genCode();
    const blank = Array.from({length:6}, (_,i) => ({seed:i+1, name:"", group:""}));
    const { error: lgErr } = await supabase.from("leagues").insert({ code, name: newLeagueName.trim() });
    if (lgErr) { alert("Failed to create league: " + lgErr.message, "error"); return; }
    saveToMyLeagues(code, newLeagueName.trim());
    switchLeague(code);
    setNewLeagueName("");
    setPaymentStep("instructions");
    setModal(null);
    alert(`✅ League created! Invite code: ${code}`);
  }

  async function checkPaymentApproval() {
    const userEmail = authUser?.email;
    if (!userEmail) { setPaymentVerifyErr("Sign in first to verify payment."); return; }
    setPaymentStep("verifying");
    setPaymentVerifyErr("");
    try {
      const { data: existing } = await supabase.from("payments").select("id,status").eq("email", userEmail).maybeSingle();
      if (existing?.status === "approved") {
        setPaymentStep("approved");
      } else if (existing) {
        setPaymentStep("pending");
      } else {
        const { error: insErr } = await supabase.from("payments").insert({
          email: userEmail, status: "pending", venmo_username: venmoUsername.trim()
        });
        if (insErr) throw insErr;
        fetch("https://formsubmit.co/ajax/stephen.sevenich@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            subject: "[Bracket Bucks WC] New Payment Request",
            message: `Payment request from: ${userEmail}\nVenmo: ${venmoUsername.trim() || "(not provided)"}\nApprove at: https://bracket-bucks.com`
          })
        }).catch(() => {});
        setPaymentStep("pending");
      }
    } catch(e) {
      setPaymentStep("error");
      setPaymentVerifyErr("Something went wrong: " + e.message);
    }
  }

  function alert(msg, type="success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) { setAuthError("Please enter email and password."); return; }
    setAuthWorking(true); setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim() || !authName.trim()) { setAuthError("Please fill in all fields."); return; }
    setAuthWorking(true); setAuthError("");
    const { error } = await supabase.auth.signUp({ email: email.trim(), password, options:{ data:{ name: authName.trim() } } });
    setAuthWorking(false);
    if (error) setAuthError(error.message);
    else setAuthError("✅ Account created! Check your email to confirm, then sign in.");
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: lg }, { data: ow }, { data: wn }, { data: dr }] = await Promise.all([
      supabase.from("leagues").select("*").eq("code", leagueCode).single(),
      supabase.from("owners").select("*").eq("league_code", leagueCode).order("num"),
      supabase.from("wins").select("*").eq("league_code", leagueCode),
      supabase.from("draws").select("*").eq("league_code", leagueCode),
    ]);
    const ownersData = ow || [];
    const winsData   = wn || [];
    const drawsData  = dr || [];
    setLeague(lg);
    setOwners(ownersData);
    setWins(winsData);
    setDraws(drawsData);
    const lgData = lg || {};
    const computedRounds = getRounds(lgData?.settings);
    setRounds(computedRounds);
    // Cache round values in localStorage so they survive refresh even if Supabase column missing
    if (lgData?.settings?.round_values) {
      try { localStorage.setItem(`wc_rounds_${leagueCode}`, JSON.stringify(lgData.settings.round_values)); } catch {}
    }
    // Load teams per owner setting
    const tpo = lgData?.settings?.teams_per_owner || 6;
    setTeamsPerOwner(tpo);
    try { localStorage.setItem(`wc_tpo_${leagueCode}`, String(tpo)); } catch {}
    setStats(calcStats(ownersData, winsData, drawsData, computedRounds));
    setLoading(false);
  }, [leagueCode]);

  useEffect(() => {
    loadData();
    // On session load, restore last active league for this user
    supabase.auth.getSession().then(({data:{session}})=>{
      const user = session?.user||null;
      setAuthUser(user);
      if (user) {
        const saved = localStorage.getItem(`wc_league_${user.id}`) || localStorage.getItem("wc_active_league");
        if (saved) {
          setLeagueCode(saved);
          // Ensure it's in myLeagues state so gate doesn't show
          setMyLeagues(prev => {
            if (prev.find(l => l.code === saved)) return prev;
            const updated = [...prev, { code: saved, name: saved }];
            localStorage.setItem("wc_my_leagues", JSON.stringify(updated));
            // Try to get real name async
            supabase.from("leagues").select("name").eq("code", saved).single().then(({data}) => {
              if (data?.name) {
                setMyLeagues(p => p.map(l => l.code === saved ? {...l, name: data.name} : l));
              }
            });
            return updated;
          });
        }
      }
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      const user = session?.user||null;
      setAuthUser(user);
      if (user) {
        const saved = localStorage.getItem(`wc_league_${user.id}`) || localStorage.getItem("wc_active_league");
        if (saved) {
          setLeagueCode(saved);
          setMyLeagues(prev => {
            if (prev.find(l => l.code === saved)) return prev;
            const updated = [...prev, { code: saved, name: saved }];
            localStorage.setItem("wc_my_leagues", JSON.stringify(updated));
            return updated;
          });
        }
      }
    });
    const channel = supabase.channel("wc-realtime")
      .on("postgres_changes",{event:"*",schema:"public",table:"wins",filter:`league_code=eq.${leagueCode}`},loadData)
      .on("postgres_changes",{event:"*",schema:"public",table:"draws",filter:`league_code=eq.${leagueCode}`},loadData)
      .on("postgres_changes",{event:"*",schema:"public",table:"owners"},({new:row})=>{
        // Only reload if this change is for our league
        if (row?.league_code === leagueCode || !row?.league_code) loadData();
      })
      .subscribe();
    return () => { subscription.unsubscribe(); supabase.removeChannel(channel); };
  }, [loadData, leagueCode]);

  // Sync tab to URL hash so refresh stays on same tab
  function goTab(t) {
    setTab(t);
    window.location.hash = `worldcup/${t}`;
  }

  // ── ESPN World Cup Auto-Sync ──────────────────────────────────────────────
  // Round name → round_id mapping for FIFA World Cup 2026
  const ESPN_WC_ROUND_MAP = {
    "Group Stage":    "Pool Play",
    "Group Play":     "Pool Play",
    "Group A": "Pool Play", "Group B": "Pool Play", "Group C": "Pool Play",
    "Group D": "Pool Play", "Group E": "Pool Play", "Group F": "Pool Play",
    "Group G": "Pool Play", "Group H": "Pool Play", "Group I": "Pool Play",
    "Group J": "Pool Play", "Group K": "Pool Play", "Group L": "Pool Play",
    "Round of 32":    "Round of 32",
    "Round of 16":    "Round of 16",
    "Quarterfinals":  "Round of 8",
    "Quarterfinal":   "Round of 8",
    "Semifinals":     "Round of 4",
    "Semifinal":      "Round of 4",
    "Third Place":    null,
    "Final":          "Championship",
    "World Cup Final":"Championship",
  };

  const normTeamName = s => {
    // Normalize ESPN name variations for matching
    const mapped = ESPN_NAME_MAP[s] || s;
    return (mapped||"").toLowerCase().replace(/[^a-z0-9]/g,"");
  };

  async function fetchESPNGames() {
    // FIFA World Cup 2026 dates on ESPN soccer API
    const dates = [
      "20260611","20260612","20260613","20260614","20260615","20260616",
      "20260617","20260618","20260619","20260620","20260621","20260622",
      "20260623","20260624","20260625","20260626","20260627","20260628",
      "20260629","20260630","20260701","20260702","20260703","20260704",
      "20260705","20260706","20260707","20260708","20260709","20260710",
      "20260711","20260712","20260713","20260714","20260715","20260716",
      "20260717","20260718","20260719",
    ];
    const today = new Date();
    // Only fetch dates up to today + 1
    const todayStr = today.toISOString().split("T")[0].replace(/-/g,"");
    const toFetch = dates.filter(d => d <= String(parseInt(todayStr)+1));
    if (!toFetch.length) return [];

    const base = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
    const seen = new Set(); const allGames = [];
    await Promise.all(toFetch.map(async d => {
      try {
        const res = await fetch(`${base}?dates=${d}`);
        if (!res.ok) return;
        const data = await res.json();
        for (const ev of (data.events||[])) {
          if (seen.has(ev.id)) continue;
          seen.add(ev.id);
          const comp = ev.competitions?.[0];
          // Detect round from date since ESPN notes headline is often null
          const gameDate = ev.date ? ev.date.substring(0,10) : "";
          let detectedRound = comp?.notes?.[0]?.headline || "";
          if (!detectedRound) {
            // Determine round by date range (actual 2026 WC schedule)
            if      (gameDate >= "2026-06-11" && gameDate <= "2026-06-27") detectedRound = "Pool Play";
            else if (gameDate >= "2026-06-28" && gameDate <= "2026-07-03") detectedRound = "Round of 32";
            else if (gameDate >= "2026-07-04" && gameDate <= "2026-07-07") detectedRound = "Round of 16";
            else if (gameDate >= "2026-07-08" && gameDate <= "2026-07-11") detectedRound = "Round of 8";
            else if (gameDate >= "2026-07-14" && gameDate <= "2026-07-15") detectedRound = "Round of 4";
            else if (gameDate >= "2026-07-19") detectedRound = "Championship";
            else detectedRound = "Pool Play";
          }
          // If ESPN headline mentions a specific round, trust it over date-based guess
          if (detectedRound && /round of 32/i.test(detectedRound))  detectedRound = "Round of 32";
          else if (detectedRound && /round of 16/i.test(detectedRound))  detectedRound = "Round of 16";
          else if (detectedRound && /quarter/i.test(detectedRound))      detectedRound = "Round of 8";
          else if (detectedRound && /semi/i.test(detectedRound))         detectedRound = "Round of 4";
          else if (detectedRound && /final/i.test(detectedRound) && !/semi|quarter|third/i.test(detectedRound)) detectedRound = "Championship";
          else if (detectedRound && /group|pool/i.test(detectedRound))   detectedRound = "Pool Play";
          allGames.push({
            id: ev.id,
            completed: comp?.status?.type?.completed,
            isLive: comp?.status?.type?.state === "in",
            roundName: detectedRound,
            competitors: (comp?.competitors||[]).map(c=>({
              name: c.team?.displayName,
              score: c.score,
              winner: c.winner,
            })),
            date: ev.date,
          });
        }
      } catch {}
    }));
    return allGames;
  }

  async function autoSyncESPN() {
    const currentLeagueCode = leagueCode;
    if (!currentLeagueCode) return;
    try {
      // Always fetch fresh, league-scoped data — avoids stale closure state
      // from a previously-loaded league if the user switched leagues.
      const [{ data: freshOwners }, { data: freshWins }, { data: freshDraws }] = await Promise.all([
        supabase.from("owners").select("*").eq("league_code", currentLeagueCode).order("num"),
        supabase.from("wins").select("*").eq("league_code", currentLeagueCode),
        supabase.from("draws").select("*").eq("league_code", currentLeagueCode),
      ]);
      const syncOwners = freshOwners || [];
      const syncWins   = freshWins   || [];
      const syncDraws  = freshDraws  || [];
      if (!syncOwners.length) return;
      // Bail out entirely if the league has changed since this sync started
      if (currentLeagueCode !== leagueCode) return;

      const games = await fetchESPNGames();
      const completedGames = games.filter(g => g.completed);
      let inserted = 0;

      for (const game of completedGames) {
        // Map round
        const rl = game.roundName.toLowerCase();
        let roundId = null;
        for (const [key, val] of Object.entries(ESPN_WC_ROUND_MAP)) {
          if (rl.includes(key.toLowerCase())) { roundId = val; break; }
        }
        if (!roundId) {
          // Fallback: detect by round keywords
          if (rl.includes("group") || rl.includes("pool") || /^group [a-l]$/i.test(game.roundName.trim())) roundId = "Pool Play";
          else if (rl.includes("round of 32")) roundId = "Round of 32";
          else if (rl.includes("round of 16")) roundId = "Round of 16";
          else if (rl.includes("quarter")) roundId = "Round of 8";
          else if (rl.includes("semi")) roundId = "Round of 4";
          else if (rl.includes("final") && !rl.includes("semi") && !rl.includes("quarter") && !rl.includes("third")) roundId = "Championship";
          else roundId = null; // Unknown round — skip rather than misclassify as Pool Play
        }
        if (!roundId) continue;

        const winner = game.competitors.find(c => c.winner);
        const isDraw = !winner && game.competitors.length === 2 &&
          game.competitors[0]?.score === game.competitors[1]?.score;

        if (!winner && !isDraw) continue;

        // Match winning/drawing team(s) to owners
        const teamsToCheck = isDraw ? game.competitors : [winner];

        for (const comp of teamsToCheck) {
          const espnName = normTeamName(comp.name);

          for (const owner of syncOwners) {
            for (const team of (owner.teams||[])) {
              if (!team.name) continue;
              const tn = normTeamName(team.name);
              if (!tn) continue;

              // Exact match first (using normalization), then fuzzy
              const matched = espnName === tn ||
                espnName.includes(tn) || tn.includes(espnName);

              if (!matched) continue;

              if (isDraw && roundId === "Pool Play") {
                // Check this exact ESPN game hasn't already been logged for this owner/team
                const exists = syncDraws.some(d =>
                  d.owner_id === owner.id &&
                  normTeamName(d.team_name) === tn &&
                  d.espn_game_id === String(game.id)
                );
                if (exists) continue;
                const { error } = await supabase.from("draws").insert({
                  league_code: currentLeagueCode, owner_id: owner.id,
                  team_name: team.name, round_id: roundId,
                  espn_game_id: String(game.id),
                });
                if (!error) {
                  inserted++;
                  syncDraws.push({ owner_id: owner.id, team_name: team.name, espn_game_id: String(game.id) });
                  setSyncLog(prev => [{
                    time: new Date().toLocaleTimeString(),
                    msg: `🤝 Draw: ${owner.name} — ${team.name} (${roundId})`
                  }, ...prev.slice(0,19)]);
                }
              } else if (!isDraw) {
                // Check this exact ESPN game hasn't already been logged for this owner/team
                const exists = syncWins.some(w =>
                  w.owner_id === owner.id &&
                  normTeamName(w.team_name) === tn &&
                  w.espn_game_id === String(game.id)
                );
                if (exists) continue;
                const { error } = await supabase.from("wins").insert({
                  league_code: currentLeagueCode, owner_id: owner.id,
                  team_name: team.name, round_id: roundId,
                  espn_game_id: String(game.id),
                });
                if (!error) {
                  inserted++;
                  syncWins.push({ owner_id: owner.id, team_name: team.name, espn_game_id: String(game.id) });
                  setSyncLog(prev => [{
                    time: new Date().toLocaleTimeString(),
                    msg: `⚽ Win: ${owner.name} — ${team.name} (${roundId})`
                  }, ...prev.slice(0,19)]);
                }
              }
            }
          }
        }
      }

      setLastSync(new Date());
      if (inserted > 0) loadData();
    } catch(e) { console.error("WC autoSyncESPN error:", e); }
  }

  // Global sync — runs across ALL leagues so no league is missed regardless of who's viewing
  async function globalSyncAllLeagues() {
    try {
      setSyncLog(prev => [{ time: new Date().toLocaleTimeString(), msg: "🌍 Global sync started for all leagues..." }, ...prev.slice(0,19)]);
      const games = await fetchESPNGames();
      const completedGames = games.filter(g => g.completed);
      if (!completedGames.length) return;

      // Fetch all leagues
      const { data: leagues } = await supabase.from("leagues").select("code");
      if (!leagues?.length) return;

      let totalInserted = 0;

      for (const league of leagues) {
        const lc = league.code;
        const [{ data: freshOwners }, { data: freshWins }, { data: freshDraws }] = await Promise.all([
          supabase.from("owners").select("*").eq("league_code", lc).order("num"),
          supabase.from("wins").select("*").eq("league_code", lc),
          supabase.from("draws").select("*").eq("league_code", lc),
        ]);
        const syncOwners = freshOwners || [];
        const syncWins   = freshWins   || [];
        const syncDraws  = freshDraws  || [];
        if (!syncOwners.length) continue;

        for (const game of completedGames) {
          const rl = game.roundName.toLowerCase();
          let roundId = null;
          for (const [key, val] of Object.entries(ESPN_WC_ROUND_MAP)) {
            if (rl.includes(key.toLowerCase())) { roundId = val; break; }
          }
          if (!roundId) {
            if (rl.includes("group") || rl.includes("pool") || /^group [a-l]$/i.test(game.roundName.trim())) roundId = "Pool Play";
            else if (rl.includes("round of 32")) roundId = "Round of 32";
            else if (rl.includes("round of 16")) roundId = "Round of 16";
            else if (rl.includes("quarter")) roundId = "Round of 8";
            else if (rl.includes("semi")) roundId = "Round of 4";
            else if (rl.includes("final") && !rl.includes("semi") && !rl.includes("quarter") && !rl.includes("third")) roundId = "Championship";
            else roundId = null;
          }
          if (!roundId) continue;

          const winner = game.competitors.find(c => c.winner);
          const isDraw = !winner && game.competitors.length === 2 &&
            game.competitors[0]?.score === game.competitors[1]?.score;

          for (const comp of game.competitors) {
            if (!comp.winner && !isDraw) continue;
            const espnName = normTeamName(comp.name);

            for (const owner of syncOwners) {
              for (const team of (owner.teams||[])) {
                if (!team.name) continue;
                const tn = normTeamName(team.name);
                if (!tn) continue;
                const matched = espnName === tn || espnName.includes(tn) || tn.includes(espnName);
                if (!matched) continue;

                if (isDraw && roundId === "Pool Play") {
                  const exists = syncDraws.some(d =>
                    d.owner_id === owner.id &&
                    normTeamName(d.team_name) === tn &&
                    d.espn_game_id === String(game.id)
                  );
                  if (exists) continue;
                  const { error } = await supabase.from("draws").insert({
                    league_code: lc, owner_id: owner.id,
                    team_name: team.name, round_id: roundId,
                    espn_game_id: String(game.id),
                  });
                  if (!error) {
                    totalInserted++;
                    syncDraws.push({ owner_id: owner.id, team_name: team.name, espn_game_id: String(game.id) });
                    setSyncLog(prev => [{ time: new Date().toLocaleTimeString(), msg: `🤝 [${lc}] Draw: ${owner.name} — ${team.name} (${roundId})` }, ...prev.slice(0,19)]);
                  }
                } else if (!isDraw) {
                  const exists = syncWins.some(w =>
                    w.owner_id === owner.id &&
                    normTeamName(w.team_name) === tn &&
                    w.espn_game_id === String(game.id)
                  );
                  if (exists) continue;
                  const { error } = await supabase.from("wins").insert({
                    league_code: lc, owner_id: owner.id,
                    team_name: team.name, round_id: roundId,
                    espn_game_id: String(game.id),
                  });
                  if (!error) {
                    totalInserted++;
                    syncWins.push({ owner_id: owner.id, team_name: team.name, espn_game_id: String(game.id) });
                    setSyncLog(prev => [{ time: new Date().toLocaleTimeString(), msg: `⚽ [${lc}] Win: ${owner.name} — ${team.name} (${roundId})` }, ...prev.slice(0,19)]);
                  }
                }
              }
            }
          }
        }
      }

      setLastSync(new Date());
      setSyncLog(prev => [{ time: new Date().toLocaleTimeString(), msg: `✅ Global sync complete — ${totalInserted} new result(s) logged across all leagues` }, ...prev.slice(0,19)]);
      if (totalInserted > 0) loadData();
    } catch(e) { console.error("WC globalSyncAllLeagues error:", e); }
  }


  useEffect(() => {
    if (!autoSync || !leagueCode) return;
    // Run immediately on load/enable — global sync covers all leagues
    globalSyncAllLeagues();
    const interval = setInterval(globalSyncAllLeagues, 60000);
    return () => clearInterval(interval);
  }, [autoSync, leagueCode]);

  async function recordResult(ownerId, teamName, round, type) {
    const table = type==="draw" ? "draws" : "wins";
    const { error } = await supabase.from(table).insert({
      league_code: leagueCode, owner_id: ownerId, team_name: teamName, round_id: round,
    });
    if (error) { alert("Error: "+error.message, "error"); return; }
    alert(`✅ ${type==="draw"?"Draw":"Win"} recorded for ${teamName}!`);
    setModal(null);
    loadData();
  }

  async function removeResult(id, type) {
    const table = type==="draw"?"draws":"wins";
    await supabase.from(table).delete().eq("id", id);
    loadData();
  }

  const TABS = [
    {id:"leaderboard",label:"🏆 Leaderboard"},
    {id:"wins",       label:"📋 Win Tracker"},
    {id:"livescores", label:"⚽ Live Scores"},
    {id:"groups",     label:"🌍 Groups"},
    {id:"schedule",   label:"📅 Schedule"},
    {id:"roster",     label:"👥 Rosters"},
    {id:"topteams",   label:"⭐ Top Teams"},
    {id:"payouts",    label:"💰 Payouts"},
    {id:"draft",      label:"🐍 Draft"},
    {id:"howtoplay",  label:"📖 How to Play"},
    {id:"profile",    label:"👤 My Profile"},
    {id:"admin",      label:"🔒 Admin"},
  ];

  const totalWins  = wins.length;
  const totalDraws = draws.length;

  // ── AUTH GATE ──────────────────────────────────────────────────────────────
  if (!authUser) {
    const isSignUp = authView === "signup";
    const inp = { width:"100%", background:"#0f1625", border:"1px solid #1a2440", borderRadius:8,
      color:"#dce4f5", fontFamily:"inherit", fontSize:15, padding:"11px 14px", outline:"none",
      marginBottom:14, boxSizing:"border-box" };
    return (
      <div style={{ minHeight:"100vh", background:"#060d0b", fontFamily:"'DM Sans',sans-serif",
        color:"#dce4f5", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
        <Toast msg={toast?.msg} type={toast?.type} />
        <div style={{ maxWidth:420, width:"100%" }}>
          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:52, marginBottom:8 }}>⚽</div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:44, letterSpacing:4,
              color:"#f4c430", margin:0, textShadow:"0 0 30px rgba(244,196,48,0.4)" }}>BRACKET BUCKS</h1>
            <p style={{ color:"#6677aa", marginTop:8, fontSize:14 }}>2026 World Cup Edition</p>
          </div>
          {/* Card */}
          <div style={{ background:"#111827", border:"1px solid #1e2840", borderRadius:18, padding:28 }}>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:2,
              color:"#f4c430", margin:"0 0 22px" }}>
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>
            {isSignUp && (
              <input value={authName} onChange={e=>setAuthName(e.target.value)}
                placeholder="Your name" style={inp} onKeyDown={e=>e.key==="Enter"&&handleSignUp()} />
            )}
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="Email address" style={inp} onKeyDown={e=>e.key==="Enter"&&(isSignUp?handleSignUp():handleSignIn())} />
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="Password" style={{...inp, marginBottom:16}} onKeyDown={e=>e.key==="Enter"&&(isSignUp?handleSignUp():handleSignIn())} />
            {authError && (
              <div style={{ fontSize:13, marginBottom:14, padding:"10px 14px", borderRadius:8,
                background: authError.startsWith("✅") ? "#0a2a14" : "#2a1418",
                color: authError.startsWith("✅") ? "#2ecc71" : "#e74c3c",
                border: `1px solid ${authError.startsWith("✅") ? "#27ae60" : "#e74c3c"}` }}>
                {authError}
              </div>
            )}
            <button onClick={isSignUp ? handleSignUp : handleSignIn} disabled={authWorking}
              style={{ ...S.btn("#f4c430","#0a0a0a"), width:"100%", padding:"13px", fontSize:15,
                borderRadius:10, opacity:authWorking?0.7:1, fontWeight:800 }}>
              {authWorking ? "Please wait…" : isSignUp ? "Create Account" : "Sign In"}
            </button>
            <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:"#6677aa" }}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button onClick={()=>{ setAuthView(isSignUp?"signin":"signup"); setAuthError(""); }}
                style={{ background:"none", border:"none", color:"#f4c430", cursor:"pointer",
                  fontSize:13, fontWeight:700, fontFamily:"inherit" }}>
                {isSignUp ? "Sign In" : "Create one"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LEAGUE GATE ────────────────────────────────────────────────────────────
  // Skip league gate if user already has a saved league
  const hasStoredLeague = (() => {
    try {
      const keys = Object.keys(localStorage);
      const userKey = keys.find(k => k.startsWith("wc_league_"));
      if (userKey && localStorage.getItem(userKey)) return true;
      if (localStorage.getItem("wc_active_league")) return true;
      const saved = JSON.parse(localStorage.getItem("wc_my_leagues") || "[]");
      return saved.length > 0;
    } catch { return false; }
  })();

  // Show gate only if no league is saved anywhere
  if (myLeagues.length === 0 && !hasStoredLeague) {
    const inp = { width:"100%", background:"#0f1625", border:"1px solid #1a2440", borderRadius:8,
      color:"#dce4f5", fontFamily:"inherit", fontSize:15, padding:"11px 14px", outline:"none",
      marginBottom:14, boxSizing:"border-box" };
    let mmLeagues = [];
    try { mmLeagues = JSON.parse(localStorage.getItem("bb_my_leagues")||"[]"); } catch {}
    return (
      <div style={{ minHeight:"100vh", background:"#060d0b", fontFamily:"'DM Sans',sans-serif",
        color:"#dce4f5", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
        <Toast msg={toast?.msg} type={toast?.type} />
        <div style={{ maxWidth:460, width:"100%" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:32 }}>⚽</span>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:3, color:"#f4c430", lineHeight:1 }}>BRACKET BUCKS</div>
                <div style={{ fontSize:11, color:"#6677aa", letterSpacing:2 }}>2026 WORLD CUP</div>
              </div>
            </div>
            <button onClick={()=>supabase.auth.signOut()}
              style={{ ...S.btn("#1a1a2e","#6677aa"), border:"1px solid #1a2440", fontSize:12 }}>Sign Out</button>
          </div>

          {/* MM leagues to quickly join */}
          {mmLeagues.length > 0 && (
            <div style={{ background:"#111827", border:"1px solid #1e2840", borderRadius:14, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:11, color:"#6677aa", textTransform:"uppercase", letterSpacing:2, fontWeight:700, marginBottom:12 }}>
                🏀 Your March Madness Leagues
              </div>
              {mmLeagues.map(l=>(
                <div key={l.code} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:"#0f1625", border:"1px solid #1e2840", borderRadius:8, padding:"10px 14px", marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700 }}>{l.name||l.code}</div>
                    <div style={{ fontSize:11, color:"#f4c430", fontFamily:"'DM Mono',monospace" }}>{l.code}</div>
                  </div>
                  <button onClick={async()=>{
                    const {data,error}=await supabase.from("leagues").select("*").eq("code",l.code).single();
                    if(error||!data){alert("No World Cup league with code "+l.code+". Ask the creator to set it up.","error");return;}
                    saveToMyLeagues(l.code,data.name||l.name||l.code);
                    await autoAddUserAsOwner(l.code);
                    switchLeague(l.code);
                  }} style={{ ...S.btn("#0a2a14","#f4c430"), border:"1px solid #f4c430", fontSize:12, padding:"7px 14px", flexShrink:0 }}>
                    ⚽ Join
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Manual code entry */}
          <div style={{ background:"#111827", border:"1px solid #1e2840", borderRadius:14, padding:20 }}>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:2, color:"#f4c430", margin:"0 0 16px" }}>
              Enter League Code
            </h2>
            <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. CHI2025" style={inp}
              onKeyDown={e=>e.key==="Enter"&&joinLeague()} />
            {joinErr && <div style={{ color:"#e74c3c", fontSize:13, marginBottom:10 }}>{joinErr}</div>}
            <button onClick={joinLeague} style={{ ...S.btn("#f4c430","#0a0a0a"), width:"100%", padding:"13px", fontSize:15, borderRadius:10, fontWeight:800 }}>
              Join League
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN APP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:1280,margin:"0 auto",minHeight:"100vh",background:"#0d1f13",color:"#e8f0e9",fontFamily:"'DM Sans','Nunito',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} * {box-sizing:border-box}`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet" />
      <Toast msg={toast?.msg} type={toast?.type} />

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#063d24,#0a5c36)",borderBottom:"3px solid #f4c430",position:"sticky",top:0,zIndex:50 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px 6px" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:"1.8rem" }}>⚽</span>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"1.4rem",letterSpacing:3,color:"#f4c430",lineHeight:1 }}>BRACKET BUCKS</div>
              <div style={{ fontSize:"0.6rem",letterSpacing:2,color:"rgba(255,255,255,0.6)",textTransform:"uppercase" }}>2026 WORLD CUP</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setAutoSync(a=>!a)} style={{
              background:autoSync?"#0a2a14":"#1a2440",
              border:`1px solid ${autoSync?"#27ae60":"#2a3560"}`,
              borderRadius:6,color:autoSync?"#2ecc71":"#6677aa",
              fontFamily:"'Bebas Neue',sans-serif",fontSize:"0.75rem",letterSpacing:1.5,
              padding:"4px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:5
            }}>
              <span style={{fontSize:8,color:autoSync?"#2ecc71":"#445"}}>●</span>
              {autoSync?"LIVE":"AUTO-SYNC"}
            </button>
            <div style={{ background:"#f4c430",color:"#063d24",fontFamily:"'Bebas Neue',sans-serif",fontSize:"1rem",letterSpacing:2,padding:"4px 12px",borderRadius:6 }}>{leagueCode}</div>
          </div>
        </div>
        <div style={{ position:"relative" }}>
          <nav style={{ display:"flex",overflowX:"auto",gap:2,padding:"0 10px",
            scrollbarWidth:"thin",scrollbarColor:"#f4c430 #0a0f1a",
            WebkitOverflowScrolling:"touch" }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>goTab(t.id)} style={{
                background:"transparent",border:"none",color:tab===t.id?"#f4c430":"rgba(255,255,255,0.6)",
                fontFamily:"inherit",fontWeight:700,fontSize:"0.75rem",padding:"10px 12px",cursor:"pointer",
                borderBottom:tab===t.id?"3px solid #f4c430":"3px solid transparent",whiteSpace:"nowrap",
                letterSpacing:0.5,transition:"color .15s", flexShrink:0
              }}>{t.label}</button>
            ))}
          </nav>
        </div>
      </div>

      {/* Modals */}
      {modal==="pin"&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ ...S.card,width:320,padding:28 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,marginBottom:16 }}>🔒 Admin PIN</div>
            <input value={pinInput} onChange={e=>setPinInput(e.target.value)}
              type="password" placeholder="Enter PIN"
              style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,
                color:"#dce4f5",fontFamily:"inherit",fontSize:16,padding:"10px 14px",outline:"none",marginBottom:12 }}
              onKeyDown={e=>{ if(e.key==="Enter"){if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");}else alert("Wrong PIN","error"); }}} />
            <div style={{ display:"flex",gap:8 }}>
              <button onClick={()=>{ if(pinInput===ADMIN_PIN){setAdminUnlocked(true);setModal(null);setPinInput("");}else alert("Wrong PIN","error"); }}
                style={{ ...S.btn(),flex:1 }}>Unlock</button>
              <button onClick={()=>setModal(null)} style={{ ...S.btn("#1a2440","#6677aa"),flex:1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {modal==="addResult"&&(
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
          <div style={{ ...S.card,width:"100%",maxWidth:440,padding:28 }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,marginBottom:16 }}>⚽ Record Result</div>
            <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <div>
                <label style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4 }}>Owner</label>
                <select value={winOwnerId} onChange={e=>setWinOwnerId(e.target.value)}
                  style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none" }}>
                  <option value="">— Select Owner —</option>
                  {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4 }}>Team</label>
                <select value={winTeamName} onChange={e=>setWinTeamName(e.target.value)}
                  style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none" }}>
                  <option value="">— Select Team —</option>
                  {owners.find(o=>String(o.id)===String(winOwnerId))?.teams?.filter(t=>t.name).map(t=>(
                    <option key={t.name} value={t.name}>{t.name} (Seed #{t.seed})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4 }}>Round</label>
                <select value={winRound} onChange={e=>setWinRound(e.target.value)}
                  style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none" }}>
                  {rounds.map(r=><option key={r.id} value={r.id}>{r.id}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4 }}>Result</label>
                <div style={{ display:"flex",gap:8 }}>
                  {["win","draw"].map(type=>(
                    <button key={type} onClick={()=>setWinType(type)} style={{
                      flex:1,padding:"9px",borderRadius:8,fontWeight:700,fontFamily:"inherit",cursor:"pointer",fontSize:13,
                      background:winType===type?(type==="win"?"#0a2a14":"#2a1a00"):"#0f1625",
                      border:`1px solid ${winType===type?(type==="win"?"#27ae60":"#f39c12"):"#1a2440"}`,
                      color:winType===type?(type==="win"?"#2ecc71":"#f39c12"):"#6677aa"
                    }}>{type==="win"?"⚽ Win":"🤝 Draw"}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:16 }}>
              <button onClick={()=>{
                if(!winOwnerId||!winTeamName) { alert("Select owner and team","error"); return; }
                recordResult(winOwnerId,winTeamName,winRound,winType);
              }} style={{ ...S.btn(),flex:1 }}>Save Result</button>
              <button onClick={()=>setModal(null)} style={{ ...S.btn("#1a2440","#6677aa"),flex:1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ padding:"20px 16px 48px", overflowX:"hidden" }}>
        {loading?<Spinner />:(
          <>
            {/* LEADERBOARD */}
            {tab==="leaderboard"&&(
              <div>
                <h2 style={{ margin:"0 0 20px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>🏆 Leaderboard</h2>
                {stats.length===0?<Empty text="No owners yet. Add owners in Admin tab." />:(
                  <>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {stats.map((s,i)=>(
                        <div key={s.id} style={{ ...S.card,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",
                          background:i===0?"linear-gradient(135deg,#0a2e1a,#1a3828)":"#111827",
                          border:`1px solid ${i===0?"#2ecc71":"#1a2440"}` }}>
                          <div style={{ width:34,height:34,borderRadius:"50%",flexShrink:0,
                            background:i===0?"#f4c430":i===1?"#9aa":i===2?"#a87040":"#1e2840",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontWeight:800,fontSize:14,color:i<3?"#111":"#445" }}>{i+1}</div>
                          <div style={{ display:"flex",alignItems:"center",gap:8,minWidth:140 }}>
                            <div style={{ width:10,height:10,borderRadius:"50%",background:s.color }} />
                            <span style={{ fontWeight:700,fontSize:15 }}>{s.name}</span>
                          </div>
                          <div style={{ display:"flex",gap:5,flexWrap:"wrap",flex:1 }}>
                            {rounds.map((r,ri)=>(
                              <span key={ri} style={{ background:s.roundWins[ri]>0?"#1a3a28":"#131929",
                                border:`1px solid ${s.roundWins[ri]>0?"#27ae60":"#1e2840"}`,
                                borderRadius:6,padding:"3px 7px",fontSize:11,
                                color:s.roundWins[ri]>0?"#2ecc71":"#334" }}>
                                {r.short}: {s.roundWins[ri]}{s.roundDraws[ri]>0?`+${s.roundDraws[ri]}D`:""}
                              </span>
                            ))}
                          </div>
                          <div style={{ display:"flex",gap:18,marginLeft:"auto" }}>
                            <Fin label="Earned" val={`$${s.totalEarned.toFixed(2)}`} color="#2ecc71" />
                            <Fin label="Owed" val={`$${s.totalCost.toFixed(2)}`} color="#e74c3c" />
                            <Fin label="Net" val={`${s.net>=0?"+":""}$${s.net.toFixed(2)}`} color={s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667"} large />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cumulative Table */}
                    <div style={{ ...S.card,marginTop:24 }}>
                      <SecTitle>Cumulative by Round</SecTitle>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                          <thead>
                            <tr style={{ background:"#1a2040" }}>
                              <th style={TH}>Owner</th>
                              {rounds.map(r=><th key={r.id} style={TH}>{r.short}</th>)}
                              <th style={TH}>Net</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.map(s=>(
                              <tr key={s.id} style={{ borderBottom:"1px solid #1a2440" }}>
                                <td style={{ ...TD,fontWeight:600 }}>
                                  <span style={{ display:"inline-flex",alignItems:"center",gap:7 }}>
                                    <span style={{ width:8,height:8,borderRadius:"50%",background:s.color,display:"inline-block" }} />
                                    {s.name}
                                  </span>
                                </td>
                                {s.cumByRound.map((v,i)=>(
                                  <td key={i} style={{ ...TD,textAlign:"center",fontWeight:600,
                                    color:v>0?"#2ecc71":v<0?"#e74c3c":"#667",fontFamily:"'DM Mono',monospace" }}>
                                    {v>=0?"+":""}${v.toFixed(2)}
                                  </td>
                                ))}
                                <td style={{ ...TD,textAlign:"center",fontWeight:800,fontSize:15,
                                  color:s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667",fontFamily:"'DM Mono',monospace" }}>
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
            {tab==="wins"&&(
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10 }}>
                  <h2 style={{ margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>📋 Result Log</h2>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                    {lastSync&&<span style={{fontSize:11,color:"#6677aa"}}>Synced: {lastSync.toLocaleTimeString()}</span>}
                    <button onClick={()=>setAutoSync(a=>!a)} style={{
                      ...S.btn(autoSync?"#0a2a14":"#1a2440",autoSync?"#2ecc71":"#6677aa"),
                      border:`1px solid ${autoSync?"#27ae60":"#2a3560"}`,fontSize:12,padding:"7px 14px"
                    }}>{autoSync?"🔄 Auto-Sync ON":"Auto-Sync OFF"}</button>
                    <button onClick={globalSyncAllLeagues} style={{...S.btn(),fontSize:12,padding:"7px 14px"}}>⚽ Sync Now</button>
                    <button onClick={()=>{ if(!adminUnlocked){setModal("pin");return;} setModal("addResult"); }} style={S.btn()}>+ Manual Result</button>
                  </div>
                </div>
                {adminUnlocked&&syncLog.length>0&&(
                  <div style={{background:"#080e1a",border:"1px solid #1e2d4a",borderRadius:10,padding:"10px 14px",marginBottom:14}}>
                    <div style={{fontSize:10,color:"#6677aa",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:8}}>Auto-Sync Log</div>
                    {syncLog.slice(0,5).map((l,i)=>(
                      <div key={i} style={{fontSize:12,color:"#8899cc",padding:"3px 0",borderBottom:i<Math.min(syncLog.length,5)-1?"1px solid #131929":"none"}}>
                        <span style={{color:"#445",marginRight:8}}>{l.time}</span>{l.msg}
                      </div>
                    ))}
                  </div>
                )}
                {wins.length===0&&draws.length===0?<Empty text="No results recorded yet." />:(
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    {[...wins.map(w=>({...w,type:"win"})),...draws.map(d=>({...d,type:"draw"}))]
                      .sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))
                      .map(r=>{
                      const owner = owners.find(o=>o.id===r.owner_id);
                      const round = rounds.find(rd=>rd.id===r.round_id);
                      if (!owner||!round) return null;
                      const isOut = eliminatedTeams.has(r.team_name);
                      return (
                        <div key={`${r.type}-${r.id}`} style={{ background:"#111827",border:"1px solid #1a2440",
                          borderRadius:10,padding:"11px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",
                          borderLeft:`3px solid ${r.type==="win"?"#27ae60":"#f39c12"}`,opacity:isOut?0.6:1 }}>
                          <span style={{ fontWeight:700,fontSize:13,color:r.type==="win"?"#2ecc71":"#f39c12" }}>
                            {r.type==="win"?"⚽ WIN":"🤝 DRAW"}
                          </span>
                          <span style={{ fontWeight:600,flex:1,minWidth:120,textDecoration:isOut?"line-through":"none",color:isOut?"#555":"#dce4f5" }}>{r.team_name}</span>
                          <span style={{ fontSize:11,background:"#1a2440",color:"#8899cc",borderRadius:5,padding:"2px 8px" }}>{round.id}</span>
                          <span style={{ color:"#f4c430",fontWeight:700,fontFamily:"'DM Mono',monospace" }}>
                            +${((r.type==="draw"?round.dmg/2:round.dmg) * ((WC_TEAMS.find(t=>t.name===r.team_name)||{}).seed || 1)).toFixed(2)}/owner
                          </span>
                          <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                            <div style={{ width:7,height:7,borderRadius:"50%",background:owner.color }} />
                            <span style={{ fontSize:12,color:"#6677aa" }}>{owner.name}</span>
                          </div>
                          {adminUnlocked&&<button onClick={()=>removeResult(r.id,r.type)}
                            style={{ background:"none",border:"1px solid #3a1820",borderRadius:6,color:"#e74c3c",padding:"3px 8px",cursor:"pointer",fontSize:12 }}>✕</button>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* LIVE SCORES */}
            {tab==="livescores"&&(
              <LiveScores owners={owners} wins={wins}
                onRecordWin={(owner,teamName,type)=>{ setWinOwnerId(String(owner.id)); setWinTeamName(teamName); setWinType(type); setModal("addResult"); }}
                adminUnlocked={adminUnlocked} setModal={setModal} />
            )}

            {/* GROUPS */}
            {tab==="groups"&&<GroupsTab owners={owners} eliminatedTeams={eliminatedTeams} />}

            {/* SCHEDULE */}
            {tab==="schedule"&&<ScheduleTab owners={owners} />}

            {/* ROSTERS */}
            {tab==="roster"&&(
              <div>
                <h2 style={{ margin:"0 0 16px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>👥 Rosters</h2>
                {/* Group color legend */}
                <div style={{ display:"flex",gap:10,flexWrap:"wrap",marginBottom:16 }}>
                  {Object.entries(GROUP_COLORS).map(([g,c])=>(
                    <div key={g} style={{ display:"flex",alignItems:"center",gap:5,fontSize:12 }}>
                      <div style={{ width:10,height:10,borderRadius:2,background:c }} />
                      <span style={{ color:c,fontWeight:600 }}>{g}</span>
                    </div>
                  ))}
                </div>
                {owners.length===0?<Empty text="No owners yet." />:(
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
                    {owners.map(owner=>{
                      const s=stats.find(x=>x.id===owner.id);
                      return (
                        <div key={owner.id} style={{ ...S.card,borderTop:`3px solid ${owner.color}`,paddingTop:16 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                            <div style={{ width:10,height:10,borderRadius:"50%",background:owner.color }} />
                            <span style={{ fontWeight:700,fontSize:15 }}>{owner.name}</span>
                            {s&&<span style={{ marginLeft:"auto",fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace",
                              color:s.net>0?"#2ecc71":s.net<0?"#e74c3c":"#667" }}>
                              {s.net>=0?"+":""}${s.net.toFixed(2)}
                            </span>}
                          </div>
                          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
                            {(owner.teams||[]).map((team,i)=>{
                              const hasWin=wins.some(w=>w.owner_id===owner.id&&w.team_name===team.name);
                              const hasDraw=draws.some(d=>d.owner_id===owner.id&&d.team_name===team.name);
                              const isOut=eliminatedTeams.has(team.name);
                              return (
                                <div key={i} style={{ display:"flex",alignItems:"center",gap:8,
                                  background:isOut?"#0a0a0a":hasWin?"#1a2e1a":hasDraw?"#2a1e0a":"#0f1625",
                                  border:`1px solid ${isOut?"#222":hasWin?"#27ae60":hasDraw?"#f39c12":"#1a2440"}`,
                                  borderRadius:7,padding:"6px 10px",opacity:isOut?0.5:1 }}>
                                  <SeedBadge seed={team.seed||i+1} />
                                  <span style={{ fontSize:13,flex:1,color:isOut?"#444":GROUP_COLORS[team.group]||"#dce4f5",
                                    textDecoration:isOut?"line-through":"none" }}>{team.name||"TBD"}</span>
                                  {team.group&&<span style={{ fontSize:9,color:isOut?"#333":GROUP_COLORS[team.group]||"#555",fontWeight:700 }}>{team.group.replace("Group ","Grp ")}</span>}
                                  {isOut&&<span style={{ fontSize:10,color:"#e74c3c" }}>✗</span>}
                                  {!isOut&&hasWin&&<span style={{ fontSize:10,color:"#2ecc71" }}>⚽</span>}
                                  {!isOut&&hasDraw&&!hasWin&&<span style={{ fontSize:10,color:"#f39c12" }}>🤝</span>}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ marginTop:8,fontSize:11,color:"#445" }}>
                            Avg seed: {owner.teams?.length?( owner.teams.reduce((a,t)=>a+(t.seed||0),0)/owner.teams.length).toFixed(1):"—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TOP TEAMS */}
            {tab==="topteams"&&<TopTeams owners={owners} wins={wins} draws={draws} eliminatedTeams={eliminatedTeams} />}

            {/* PAYOUTS */}
            {tab==="payouts"&&(
              <div>
                <h2 style={{ margin:"0 0 6px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>💰 Payout Reference</h2>
                {(()=>{
                  const numOthers = owners.length > 1 ? owners.length - 1 : null;
                  return (
                    <>
                      <p style={{ color:"#6677aa",fontSize:13,marginBottom:4 }}>
                        Total payout formula: <strong style={{color:"#dce4f5"}}>Seed × Round Value × {numOthers??'(owners − 1)'} other players</strong>. Smaller number shows cost per owner.
                      </p>
                      <p style={{ color:"#6677aa",fontSize:12,marginBottom:20 }}>
                        Pool Play column shows Win / <span style={{color:"#f39c12"}}>Draw</span> totals. All other rounds are win-only.
                        {!numOthers&&<span style={{color:"#e74c3c",marginLeft:8}}>⚠ Add owners to see exact amounts.</span>}
                      </p>
                    </>
                  );
                })()}
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#141d38" }}>
                        <th style={TH}>Seed</th>
                        {rounds.map(r=>{
                          return (
                            <th key={r.id} style={{ ...TH, textAlign:"center" }}>
                              <div>{r.short}</div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({length:12},(_,i)=>i+1).map(seed=>(
                        <tr key={seed} style={{ borderBottom:"1px solid #131929" }}>
                          <td style={{ ...TD,fontWeight:700 }}><SeedBadge seed={seed} /></td>
                          {rounds.map(r=>{
                            const n = owners.length > 1 ? owners.length - 1 : 0;
                            const winTotal  = r.dmg * seed * n;
                            const winPer    = r.dmg * seed;
                            const drawTotal = r.hasDraw ? (r.dmg/2) * seed * n : null;
                            const drawPer   = r.hasDraw ? (r.dmg/2) * seed : null;
                            return (
                              <td key={r.id} style={{ ...TD, textAlign:"center", padding:"10px 8px",
                                WebkitUserSelect:"none", userSelect:"none",
                                WebkitTextSizeAdjust:"none" }}>
                                <div style={{ fontWeight:700,color:"#2ecc71",fontFamily:"'DM Mono',monospace",fontSize:14,
                                  textDecoration:"none",WebkitTextDecorationLine:"none",display:"block" }}>
                                  <span>&#36;</span>{winTotal.toFixed(2)}
                                </div>
                                <div style={{ fontSize:10,color:"#445",marginTop:1,textDecoration:"none" }}>
                                  <span>&#36;</span>{winPer.toFixed(2)}/owner
                                </div>
                                {drawTotal!==null&&(
                                  <div style={{ marginTop:5,borderTop:"1px solid #1a2440",paddingTop:4 }}>
                                    <div style={{ fontWeight:700,color:"#f39c12",fontFamily:"'DM Mono',monospace",fontSize:12,
                                      textDecoration:"none",WebkitTextDecorationLine:"none" }}>
                                      <span>&#36;</span>{drawTotal.toFixed(2)}
                                    </div>
                                    <div style={{ fontSize:10,color:"#445",textDecoration:"none" }}><span>&#36;</span>{drawPer.toFixed(2)}/owner draw</div>
                                  </div>
                                )}
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

            {/* DRAFT */}
            <div style={{display:tab==="draft"?"block":"none"}}><DraftTab owners={owners} setOwners={setOwners} isAdmin={isAdmin} authUser={authUser} alert={alert} leagueCode={leagueCode} onRefresh={loadData} teamsPerOwner={teamsPerOwner} /></div>

            {/* HOW TO PLAY */}
            {tab==="howtoplay"&&(()=>{
              const n = owners.length > 1 ? owners.length - 1 : owners.length;
              const nLabel = owners.length > 0 ? `${owners.length} players (${n} paying per win)` : "players in your league";
              const ppVal  = rounds.find(r=>r.id==="Pool Play")?.dmg ?? 0.50;
              const r32Val = rounds.find(r=>r.id==="Round of 32")?.dmg ?? 1.00;
              const r16Val = rounds.find(r=>r.id==="Round of 16")?.dmg ?? 1.50;
              const qfVal  = rounds.find(r=>r.id==="Round of 8")?.dmg ?? 2.00;
              const sfVal  = rounds.find(r=>r.id==="Round of 4")?.dmg ?? 2.50;
              const fVal   = rounds.find(r=>r.id==="Championship")?.dmg ?? 3.00;
              // Example: Seed 4, Pool Play win
              const exSeed = 4; const exWin = ppVal * exSeed * n;
              const exPer  = ppVal * exSeed;
              return (
              <div>
                <h2 style={{margin:"0 0 4px",fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2}}>📖 How to Play</h2>
                <p style={{color:"#6677aa",fontSize:13,marginBottom:20}}>
                  {league?.name||leagueCode} · {owners.length} owner{owners.length!==1?"s":""} · Code: <span style={{fontFamily:"'DM Mono',monospace",color:"#f4c430"}}>{leagueCode}</span>
                </p>

                {/* Overview */}
                <div style={{...S.card,marginBottom:16,background:"linear-gradient(135deg,#0a2e1a,#111827)",border:"2px solid #f4c430"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2,color:"#f4c430",marginBottom:10}}>🌍 What is Bracket Bucks?</div>
                  <p style={{color:"#dce4f5",fontSize:14,lineHeight:1.7}}>
                    Bracket Bucks is a fantasy-style game built around the 2026 FIFA World Cup. Each of the <strong>{owners.length||"?"} players</strong> drafts
                    a set of national teams via a snake draft. Every time one of your teams wins or draws, the other <strong>{n} players</strong> each
                    pay you <strong>Round Value × Seed #</strong>. The player with the highest net earnings at the end of the tournament wins!
                  </p>
                </div>

                {/* Round Values for this league */}
                <div style={{...S.card,marginBottom:16}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1.5,color:"#f4c430",marginBottom:12}}>⚙️ This League's Round Values</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
                    {rounds.map(r=>(
                      <div key={r.id} style={{background:"#0a0f1a",border:"1px solid #1a2440",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                        <div style={{fontSize:11,color:"#6677aa",marginBottom:4,fontWeight:700}}>{r.short}</div>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:800,color:"#f4c430"}}>${r.dmg.toFixed(2)}</div>
                        {r.hasDraw&&<div style={{fontSize:10,color:"#f39c12",marginTop:2}}>Draw: ${(r.dmg/2).toFixed(2)}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                {[
                  {
                    num:"1", icon:"👤", title:"Create an Account & Join",
                    color:"#3498db",
                    steps:[
                      `Sign up with your email and password. Your league code is: ${leagueCode}.`,
                      "Enter the league code once — you'll be automatically added as an owner and won't need to enter it again.",
                      "If you already have a March Madness account on this site, your leagues appear automatically — just tap ⚽ Join.",
                    ]
                  },
                  {
                    num:"2", icon:"🐍", title:"The Snake Draft",
                    color:"#2ecc71",
                    steps:[
                      `All ${owners.length||"?"} players participate in a snake draft before the tournament starts.`,
                      "The admin shuffles the draft order randomly. In a snake draft, the order reverses each round — 1st pick in Round 1 picks last in Round 2, then 1st again in Round 3.",
                      `Each player drafts ${teamsPerOwner} teams total across ${teamsPerOwner} rounds.`,
                      "Teams are organized by group (A–L) and seed (#1–#12). Seed #1 = strongest in the group, #12 = weakest.",
                      "High seeds (#10–12) pay more if they win, but are less likely to advance. Low seeds (#1–3) are safer but pay less.",
                      "Only the admin can make picks — when it's your turn, the admin selects your team on your behalf (or you can be present during the live draft).",
                    ]
                  },
                  {
                    num:"3", icon:"💰", title:"Scoring & Payouts",
                    color:"#f4c430",
                    steps:[
                      `Payout formula: Round Value × Seed # × ${n} other player${n!==1?"s":""}`,
                      `Example: A Seed #${exSeed} team wins in Pool Play ($${ppVal.toFixed(2)} round value). Each of the other ${n} players pays you $${exPer.toFixed(2)}. You collect $${exWin.toFixed(2)} total.`,
                      `Pool Play draws also count at half value. A Seed #${exSeed} draw = $${(ppVal/2*exSeed).toFixed(2)} per other player ($${(ppVal/2*exSeed*n).toFixed(2)} total).`,
                      `Round values for this league — PP: $${ppVal.toFixed(2)} · R32: $${r32Val.toFixed(2)} · R16: $${r16Val.toFixed(2)} · QF: $${qfVal.toFixed(2)} · SF: $${sfVal.toFixed(2)} · Final: $${fVal.toFixed(2)}`,
                      "Your NET = Total Earned − Total Owed. Positive is good!",
                    ]
                  },
                  {
                    num:"4", icon:"📅", title:"Tournament Structure",
                    color:"#9b59b6",
                    steps:[
                      "Pool Play (Jun 11 – Jul 2): 48 teams, 12 groups of 4. Each team plays 3 matches. Wins AND draws earn points.",
                      "Round of 32 (Jul 4–9): Top 2 from each group + 8 best 3rd-place teams (32 total). Single elimination. No draw payout.",
                      "Round of 16 (Jul 11–14): 16 teams remaining. Single elimination. Wins only.",
                      "Quarterfinals, Semifinals, Final (Jul 16–19): 8 → 4 → 2 → Champion. Final is July 19.",
                    ]
                  },
                  {
                    num:"5", icon:"⚽", title:"Live Scores & Auto-Sync",
                    color:"#e74c3c",
                    steps:[
                      "The ⚽ Live Scores tab shows live match scores pulled from ESPN every 30 seconds.",
                      "Turn on Auto-Sync in the 📋 Win Tracker tab — the app checks ESPN every 60 seconds and automatically logs wins and draws.",
                      "Hit ⚽ Sync Now for an immediate update.",
                      "Admins can always manually add or remove results.",
                    ]
                  },
                ].map(section=>(
                  <div key={section.num} style={{...S.card,marginBottom:14,borderLeft:`3px solid ${section.color}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:section.color,
                        display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                        {section.icon}
                      </div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1.5,color:section.color}}>
                        Step {section.num}: {section.title}
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {section.steps.map((step,i)=>(
                        <div key={i} style={{display:"flex",gap:10,fontSize:13,color:"#dce4f5",lineHeight:1.6}}>
                          <span style={{color:section.color,fontWeight:800,flexShrink:0}}>→</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tab guide */}
                <div style={{...S.card,marginBottom:14}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1.5,color:"#f4c430",marginBottom:14}}>🗂 What Each Tab Does</div>
                  {[
                    {icon:"🏆",name:"Leaderboard",desc:"Live standings — total earned, total owed, net P&L per player. Click any row to expand round-by-round breakdown."},
                    {icon:"📋",name:"Win Tracker",desc:"Full log of every win and draw recorded. Toggle Auto-Sync to pull ESPN results automatically every 60s, or add results manually."},
                    {icon:"⚽",name:"Live Scores",desc:"Live match scores from ESPN. Shows which owner drafted each team. Admins can record wins directly from this screen."},
                    {icon:"📅",name:"Schedule",desc:"All 12 groups with every team, seed, and owner assignment. Shows the full tournament bracket structure."},
                    {icon:"👥",name:"Rosters",desc:"Every owner's 6 drafted teams. Win/draw badges update in real-time as results come in."},
                    {icon:"⭐",name:"Top Teams",desc:"Teams ranked by total payout generated so far. Shows who has the best picks."},
                    {icon:"💰",name:"Payouts",desc:`Reference table: Seed × Round Value × ${n} other player${n!==1?"s":""}. Green = total you collect. Grey = cost per other player.`},
                    {icon:"🐍",name:"Draft",desc:"Live snake draft board. All players see picks update in real-time. The current picker is highlighted."},
                    {icon:"📖",name:"How to Play",desc:"This page — rules, scoring, and tab guide specific to your league's settings."},
                    {icon:"👤",name:"My Profile",desc:"Your personal stats, your teams, and league management. Switch between leagues or join new ones."},
                    {icon:"🔒",name:"Admin",desc:"PIN-protected controls for recording results, managing owners, and editing round values."},
                  ].map((t,i,arr)=>(
                    <div key={i} style={{display:"flex",gap:12,padding:"10px 0",
                      borderBottom:i<arr.length-1?"1px solid #1a2440":"none",alignItems:"flex-start"}}>
                      <div style={{fontSize:20,flexShrink:0,width:28,textAlign:"center"}}>{t.icon}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{t.name}</div>
                        <div style={{fontSize:12,color:"#6677aa",lineHeight:1.6}}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick tips using actual values */}
                <div style={{...S.card,background:"#080e1a",border:"1px solid #1e2d4a"}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:1.5,color:"#f4c430",marginBottom:12}}>💡 Quick Tips</div>
                  {[
                    `Seed #12 Pool Play win = $${(ppVal*12*n).toFixed(2)} total ($${(ppVal*12).toFixed(2)}/player). High risk, high reward!`,
                    `Pool Play draws add up fast — Seed #8 gets 3 draws = $${(ppVal/2*8*n*3).toFixed(2)} total over 3 games.`,
                    `The Final pays ${(fVal/ppVal).toFixed(0)}× more than Pool Play. Getting a team to the Final is the jackpot.`,
                    "Keep Auto-Sync ON on match days so wins are logged the moment the final whistle blows.",
                    "Check the Leaderboard after each round to see your standing and who's chasing you.",
                  ].map((tip,i)=>(
                    <div key={i} style={{display:"flex",gap:10,marginBottom:10,fontSize:13,color:"#dce4f5",lineHeight:1.6}}>
                      <span style={{color:"#f4c430",fontWeight:800,flexShrink:0}}>💡</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {/* PROFILE */}
            {tab==="profile"&&(()=>{
              const userName = authUser?.user_metadata?.name||authUser?.email||"Player";
              const myOwner = owners.find(o=>o.name.toLowerCase().replace(/\s/g,""===userName.toLowerCase().replace(/\s/g,"")));
              const myStats = myOwner?stats.find(s=>s.id===myOwner.id):null;
              const myWins  = myOwner?wins.filter(w=>w.owner_id===myOwner.id):[];
              const standing= myStats?stats.findIndex(s=>s.id===myOwner.id)+1:null;
              return (
                <div>
                  {/* Header */}
                  <div style={{ ...S.card,background:"linear-gradient(135deg,#111827,#1a2440)",display:"flex",alignItems:"center",gap:20,flexWrap:"wrap",marginBottom:20 }}>
                    <div style={{ width:64,height:64,borderRadius:"50%",background:myOwner?.color||"#f4c430",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,color:"#fff",flexShrink:0 }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#f4c430" }}>{userName}</div>
                      <div style={{ fontSize:12,color:"#6677aa",marginTop:2 }}>{authUser?.email}</div>
                    </div>
                    {authUser&&<button onClick={()=>supabase.auth.signOut()} style={{ ...S.btn("#1a1a2e","#e74c3c"),border:"1px solid #e74c3c",fontSize:12 }}>Sign Out</button>}
                  </div>

                  {/* Stats */}
                  {myStats?(
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:20 }}>
                      {[["Standing",`#${standing} of ${owners.length}`,standing===1?"#f4c430":"#dce4f5"],
                        ["Net P&L",`${myStats.net>=0?"+":""}$${myStats.net.toFixed(2)}`,myStats.net>=0?"#2ecc71":"#e74c3c"],
                        ["Total Earned",`$${myStats.totalEarned.toFixed(2)}`,"#2ecc71"],
                        ["Total Paid",`$${myStats.totalCost.toFixed(2)}`,"#e74c3c"],
                        ["Wins Logged",myWins.length,"#f4c430"],
                      ].map(([label,val,color])=>(
                        <div key={label} style={{ background:"#0f1625",border:"1px solid #1e2840",borderRadius:12,padding:"16px 18px" }}>
                          <div style={{ fontSize:10,color:"#445",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6 }}>{label}</div>
                          <div style={{ fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace",color }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  ):(
                    <div style={{ ...S.card,borderColor:"#2a3350",color:"#6677aa",fontSize:13,marginBottom:20 }}>
                      {!authUser?(
                        <div>
                          <strong style={{ color:"#f4c430" }}>Sign in to view your personal stats.</strong>
                          <div style={{ marginTop:16,display:"flex",flexDirection:"column",gap:10 }}>
                            <input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Your name"
                              style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none" }} />
                            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"
                              style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none" }} />
                            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password"
                              style={{ width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none" }} />
                            <div style={{ display:"flex",gap:8 }}>
                              <button onClick={async()=>{
                                const {error}=await supabase.auth.signInWithPassword({email,password});
                                if(error)alert(error.message,"error"); else alert("✅ Signed in!");
                              }} style={{ ...S.btn(),flex:1 }}>Sign In</button>
                              <button onClick={async()=>{
                                const {error}=await supabase.auth.signUp({email,password,options:{data:{name:authName}}});
                                if(error)alert(error.message,"error"); else alert("✅ Account created! Check email.");
                              }} style={{ ...S.btn("#1a2440","#f4c430"),border:"1px solid #f4c430",flex:1 }}>Sign Up</button>
                            </div>
                          </div>
                        </div>
                      ):(
                        <p><strong style={{ color:"#f4c430" }}>⚠ Not listed as an owner.</strong> Ask admin to add you or match your name exactly.</p>
                      )}
                    </div>
                  )}

                  {/* My Teams */}
                  {myOwner&&(
                    <div style={{ ...S.card,marginBottom:20 }}>
                      <SecTitle>My Teams → {league?.name||"CHI2025"}</SecTitle>
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8 }}>
                        {(myOwner.teams||[]).map((t,i)=>{
                          const teamWins=wins.filter(w=>w.owner_id===myOwner.id&&w.team_name===t.name);
                          const teamDraws=draws.filter(d=>d.owner_id===myOwner.id&&d.team_name===t.name);
                          return (
                            <div key={i} style={{ background:"#0a0f1a",border:`1px solid ${teamWins.length?"#27ae60":teamDraws.length?"#f39c12":"#1a2440"}`,
                              borderRadius:10,padding:"10px 14px",display:"flex",alignItems:"center",gap:10 }}>
                              <SeedBadge seed={t.seed||i+1} />
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:600,fontSize:13 }}>{t.name||"TBD"}</div>
                                {(teamWins.length>0||teamDraws.length>0)&&(
                                  <div style={{ fontSize:11,color:"#2ecc71",marginTop:2 }}>
                                    {teamWins.length}W {teamDraws.length}D
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Round Breakdown */}
                  {myStats&&(
                    <div style={{ ...S.card,marginBottom:20 }}>
                      <SecTitle>Round-by-Round Breakdown</SecTitle>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                          <thead>
                            <tr style={{ background:"#0f1625" }}>
                              {["Round","Wins","Draws","Earned","Paid","Net"].map(h=><th key={h} style={TH}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {rounds.map((r,i)=>{
                              const net=myStats.roundEarned[i]-myStats.roundCost[i];
                              return (
                                <tr key={r.id} style={{ borderBottom:"1px solid #131929" }}>
                                  <td style={TD}>{r.id}</td>
                                  <td style={TD}>{myStats.roundWins[i]}</td>
                                  <td style={TD}>{myStats.roundDraws[i]}</td>
                                  <td style={{ ...TD,color:"#2ecc71",fontFamily:"'DM Mono',monospace" }}>+${myStats.roundEarned[i].toFixed(2)}</td>
                                  <td style={{ ...TD,color:"#e74c3c",fontFamily:"'DM Mono',monospace" }}>-${myStats.roundCost[i].toFixed(2)}</td>
                                  <td style={{ ...TD,fontWeight:700,fontFamily:"'DM Mono',monospace",color:net>=0?"#2ecc71":"#e74c3c" }}>{net>=0?"+":""}${net.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* My Leagues */}
                  {(()=>{
                    // Detect March Madness leagues from localStorage to offer cross-join
                    let mmLeagues = [];
                    try { mmLeagues = JSON.parse(localStorage.getItem("bb_my_leagues")||"[]"); } catch {}
                    const wcCodes = new Set(myLeagues.map(l=>l.code));
                    const mmNotJoined = mmLeagues.filter(l=>!wcCodes.has(l.code));
                    return (
                      <div style={{ ...S.card,marginBottom:20 }}>
                        <SecTitle>🌍 My Leagues</SecTitle>

                        {/* MM leagues available to join */}
                        {mmNotJoined.length>0&&(
                          <div style={{background:"#0a1428",border:"1px solid #2a3560",borderRadius:10,padding:"12px 16px",marginBottom:14}}>
                            <div style={{fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:8}}>
                              🏀 From your March Madness profile
                            </div>
                            {mmNotJoined.map(l=>(
                              <div key={l.code} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                                background:"#0f1a30",border:"1px solid #1e2d4a",borderRadius:8,padding:"8px 12px",marginBottom:6}}>
                                <div>
                                  <div style={{fontWeight:700,fontSize:13}}>{l.name||l.code}</div>
                                  <div style={{fontSize:11,color:"#f4c430",fontFamily:"'DM Mono',monospace"}}>{l.code}</div>
                                </div>
                                <button onClick={async()=>{
                                  setJoinCode(l.code);
                                  const {data,error}=await supabase.from("leagues").select("*").eq("code",l.code).single();
                                  if(error||!data){alert("No World Cup league found with code "+l.code+". Ask the league creator to set it up.","error");return;}
                                  saveToMyLeagues(l.code,data.name||l.name||l.code);
                                  await autoAddUserAsOwner(l.code);
                                  switchLeague(l.code);
                                  alert("✅ Joined "+( data.name||l.code)+"!");
                                }} style={{...S.btn("#1a3a5a","#f4c430"),border:"1px solid #f4c430",fontSize:12,padding:"6px 14px",flexShrink:0}}>
                                  ⚽ Join WC
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {myLeagues.length===0&&mmNotJoined.length===0&&<p style={{color:"#445",fontSize:13,marginBottom:12}}>No leagues joined yet. Enter a league code below.</p>}

                        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
                          {[...myLeagues].reverse().map(l=>(
                            <div key={l.code} style={{background:l.code===leagueCode?"#0a2a14":"#0f1625",
                              border:`1px solid ${l.code===leagueCode?"#f4c430":"#1e2840"}`,
                              borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                              <button onClick={()=>switchLeague(l.code)}
                                style={{...S.btn("transparent","#dce4f5"),padding:0,flex:1,textAlign:"left",fontSize:14}}>
                                <div style={{fontWeight:700}}>{l.name}</div>
                                <div style={{fontSize:11,color:"#6677aa",marginTop:2}}>
                                  {l.code===leagueCode&&<span style={{color:"#2ecc71",marginRight:8}}>✓ Active</span>}
                                  Invite Code: <span style={{fontFamily:"'DM Mono',monospace",color:"#f4c430",fontSize:13}}>{l.code}</span>
                                </div>
                              </button>
                              <button onClick={()=>{
                                navigator.clipboard?.writeText(l.code).catch(()=>{});
                                alert("📋 Code "+l.code+" copied!");
                              }} style={{...S.btn("#1a2440","#6677aa"),fontSize:11,padding:"5px 10px",flexShrink:0}}>
                                📋 Copy
                              </button>
                              {l.code!==leagueCode&&<button onClick={()=>switchLeague(l.code)}
                                style={{...S.btn("#0a2a14","#f4c430"),border:"1px solid #f4c430",fontSize:11,padding:"5px 10px",flexShrink:0}}>
                                Switch →
                              </button>}
                            </div>
                          ))}
                        </div>

                        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                          <button onClick={()=>setModal("joinLeague")} style={{...S.btn("#1a2440","#f4c430"),border:"1px solid #f4c430",fontSize:13,padding:"9px 18px"}}>
                            + Join a League
                          </button>
                          <button onClick={()=>{setPaymentStep("instructions");setModal("createLeague");}} style={{...S.btn("#0a2a14","#2ecc71"),border:"1px solid #27ae60",fontSize:13,padding:"9px 18px"}}>
                            + Create a League
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              );
            })()}

            {/* JOIN LEAGUE MODAL */}
            {modal==="joinLeague"&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div style={{...S.card,width:"100%",maxWidth:400,padding:28}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,marginBottom:20}}>🌍 Join a League</div>
                  <label style={{fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>Invite Code</label>
                  <input value={joinCode} onChange={e=>{setJoinCode(e.target.value);setJoinErr("");}}
                    placeholder="e.g. CHI2025" onKeyDown={e=>e.key==="Enter"&&joinLeague()}
                    style={{width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:16,padding:"10px 14px",outline:"none",marginBottom:8}} />
                  {joinErr&&<p style={{color:"#e74c3c",fontSize:13,marginBottom:8}}>{joinErr}</p>}
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    <button onClick={joinLeague} style={{...S.btn(),flex:1,padding:"11px"}}>Join</button>
                    <button onClick={()=>setModal(null)} style={{...S.btn("#1a2440","#6677aa"),flex:1,padding:"11px"}}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* CREATE LEAGUE MODAL */}
            {modal==="createLeague"&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                <div style={{...S.card,width:"100%",maxWidth:460,padding:28}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,marginBottom:20}}>🏆 Create a League</div>

                  {/* Admin skips payment */}
                  {isAdmin?(
                    <div>
                      <div style={{background:"#0a2a14",border:"1px solid #27ae60",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#2ecc71"}}>
                        ✓ Admin — no payment required
                      </div>
                      <label style={{fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>League Name</label>
                      <input value={newLeagueName} onChange={e=>setNewLeagueName(e.target.value)}
                        placeholder="e.g. Office World Cup 2026" onKeyDown={e=>e.key==="Enter"&&createLeague()}
                        style={{width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:15,padding:"10px 14px",outline:"none",marginBottom:12}} />
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={createLeague} style={{...S.btn(),flex:1,padding:"11px",fontSize:15}}>Create League</button>
                        <button onClick={()=>setModal(null)} style={{...S.btn("#1a2440","#6677aa"),flex:1,padding:"11px"}}>Cancel</button>
                      </div>
                    </div>

                  ) : paymentStep==="approved"?(
                    /* Payment approved — name the league */
                    <div>
                      <div style={{background:"#0a2a14",border:"1px solid #27ae60",borderRadius:8,padding:"12px 16px",marginBottom:16,color:"#2ecc71",fontWeight:700}}>
                        ✅ Payment approved! Name your league below.
                      </div>
                      <label style={{fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>League Name</label>
                      <input value={newLeagueName} onChange={e=>setNewLeagueName(e.target.value)}
                        placeholder="e.g. Office World Cup 2026" onKeyDown={e=>e.key==="Enter"&&createLeague()}
                        style={{width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:15,padding:"10px 14px",outline:"none",marginBottom:12}} />
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={createLeague} style={{...S.btn(),flex:1,padding:"11px",fontSize:15}}>Create League</button>
                        <button onClick={()=>setModal(null)} style={{...S.btn("#1a2440","#6677aa"),flex:1,padding:"11px"}}>Cancel</button>
                      </div>
                    </div>

                  ) : paymentStep==="pending"?(
                    /* Awaiting admin approval */
                    <div style={{textAlign:"center",padding:"20px 0"}}>
                      <div style={{fontSize:40,marginBottom:12}}>⏳</div>
                      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:"#f4c430",marginBottom:8}}>Payment Under Review</div>
                      <p style={{color:"#6677aa",fontSize:13}}>Your payment request has been submitted. Stephen will approve it shortly — check back soon!</p>
                      <button onClick={checkPaymentApproval} style={{...S.btn(),marginTop:16,padding:"10px 24px"}}>🔄 Check Again</button>
                      <button onClick={()=>setModal(null)} style={{...S.btn("#1a2440","#6677aa"),marginTop:8,display:"block",width:"100%",padding:"10px"}}>Close</button>
                    </div>

                  ) : (
                    /* Step 1: Payment instructions */
                    <div>
                      <div style={{background:"#0a1428",border:"1px solid #1e3a5a",borderRadius:10,padding:"16px 18px",marginBottom:18}}>
                        <div style={{fontWeight:700,color:"#f4c430",marginBottom:8}}>💳 Payment Required</div>
                        <p style={{fontSize:13,color:"#8899cc",margin:"0 0 10px"}}>Send <strong style={{color:"#fff"}}>$10</strong> to <strong style={{color:"#f4c430"}}>@bracket-bucks-app</strong> on Venmo with your email in the note.</p>
                        <a href="https://venmo.com/u/bracket-bucks-app" target="_blank" rel="noreferrer"
                          style={{display:"inline-block",background:"#3d95ce",color:"#fff",fontWeight:700,padding:"9px 20px",borderRadius:8,textDecoration:"none",fontSize:14}}>
                          Open Venmo →
                        </a>
                      </div>
                      <label style={{fontSize:11,color:"#6677aa",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>Your Venmo Username</label>
                      <input value={venmoUsername} onChange={e=>setVenmoUsername(e.target.value)}
                        placeholder="@yourname"
                        style={{width:"100%",background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,color:"#dce4f5",fontFamily:"inherit",fontSize:14,padding:"9px 12px",outline:"none",marginBottom:12}} />
                      {!authUser&&(
                        <p style={{color:"#e74c3c",fontSize:13,marginBottom:12}}>⚠ Sign in first (My Profile tab) so we can match your payment.</p>
                      )}
                      {paymentVerifyErr&&<p style={{color:"#e74c3c",fontSize:13,marginBottom:8}}>{paymentVerifyErr}</p>}
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={checkPaymentApproval} disabled={!authUser||paymentStep==="verifying"}
                          style={{...S.btn("#f4c430","#0a0a0a"),flex:1,padding:"11px",fontSize:14,opacity:(!authUser||paymentStep==="verifying")?0.5:1}}>
                          {paymentStep==="verifying"?"Checking…":"✓ I Sent It — Verify"}
                        </button>
                        <button onClick={()=>setModal(null)} style={{...S.btn("#1a2440","#6677aa"),flex:1,padding:"11px"}}>Cancel</button>
                      </div>
                      <p style={{fontSize:11,color:"#445",marginTop:10,textAlign:"center"}}>A 6-character invite code is generated automatically after approval.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ADMIN */}
            {tab==="admin"&&(
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                  <h2 style={{ margin:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2 }}>🔒 Administration</h2>
                  {!adminUnlocked?(
                    <button onClick={()=>setModal("pin")} style={S.btn()}>Unlock Admin</button>
                  ):(
                    <button onClick={()=>setAdminUnlocked(false)} style={{ ...S.btn("#1a1a2e","#e74c3c"),border:"1px solid #e74c3c",fontSize:12 }}>Lock Admin</button>
                  )}
                </div>

                {!adminUnlocked?(
                  <div style={{ ...S.card,textAlign:"center",color:"#6677aa" }}>
                    <div style={{ fontSize:40,marginBottom:8 }}>🔒</div>
                    <p>Click "Unlock Admin" and enter PIN to access admin controls.</p>
                  </div>
                ):(
                  <div style={{ display:"flex",flexDirection:"column",gap:16 }}>

                    {/* Admin League Switcher */}
                    <div style={S.card}>
                      <SecTitle>🌍 All Leagues</SecTitle>
                      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                        {allLeagues.map(l=>(
                          <button key={l.code} onClick={()=>switchLeague(l.code)}
                            style={{...S.btn(l.code===leagueCode?"#0a2a14":"#0a0f1a","#dce4f5"),
                              border:`1px solid ${l.code===leagueCode?"#f4c430":"#1a2440"}`,
                              borderRadius:8,padding:"10px 14px",textAlign:"left",
                              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div>
                              <div style={{fontWeight:700,fontSize:13}}>{l.name||l.code}</div>
                              <div style={{fontSize:11,color:"#6677aa",marginTop:2,fontFamily:"'DM Mono',monospace"}}>
                                {l.code}
                                {l.settings?.teams_per_owner&&<span style={{color:"#445",marginLeft:8}}>{l.settings.teams_per_owner} teams/owner</span>}
                              </div>
                            </div>
                            {l.code===leagueCode
                              ? <span style={{color:"#2ecc71",fontSize:11,fontWeight:700}}>✓ Active</span>
                              : <span style={{color:"#f4c430",fontSize:12}}>Switch →</span>
                            }
                          </button>
                        ))}
                        {allLeagues.length===0&&<div style={{color:"#445",fontSize:13}}>Loading leagues...</div>}
                      </div>
                    </div>

                    {/* League Info */}
                    <div style={S.card}>
                      <SecTitle>League Info</SecTitle>
                      <div style={{ display:"flex",gap:24,flexWrap:"wrap" }}>
                        {[["Name",league?.name||leagueCode],["Code",<span style={{ fontFamily:"'DM Mono',monospace",color:"#f4c430",background:"#1a2440",padding:"2px 10px",borderRadius:4 }}>{leagueCode}</span>],
                          ["Owners",`${owners.length} joined`],["Wins Logged",totalWins],["Draws Logged",totalDraws]].map(([l,v])=>(
                          <div key={l}>
                            <div style={{ fontSize:10,color:"#445",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>{l}</div>
                            <div style={{ fontWeight:600 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* League Settings Editor */}
                    <div style={S.card}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8 }}>
                        <SecTitle style={{margin:0}}>⚙️ League Settings</SecTitle>
                        {!editingRounds?(
                          <button onClick={()=>{ setRoundDraft(Object.fromEntries(rounds.map(r=>[r.id,r.dmg]))); setEditingRounds(true); }}
                            style={{ ...S.btn("#1a2440","#f4c430"),border:"1px solid #f4c430",fontSize:12,padding:"6px 14px" }}>✏ Edit</button>
                        ):(
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={async()=>{
                              // Ensure values are valid numbers
                              const cleanDraft = {};
                              ROUND_DEFS.forEach(r => {
                                const v = parseFloat(roundDraft[r.id]);
                                cleanDraft[r.id] = isNaN(v) ? DEFAULT_ROUND_VALUES[r.id] : v;
                              });
                              const newTpo = roundDraft.__tpo ? parseInt(roundDraft.__tpo) : teamsPerOwner;
                              const existingSettings = league?.settings || {};
                              const newSettings = { ...existingSettings, round_values: cleanDraft, teams_per_owner: newTpo };
                              // Save to Supabase
                              const { error } = await supabase.from("leagues")
                                .update({ settings: newSettings })
                                .eq("code", leagueCode);
                              if (error) {
                                alert("Save error: " + error.message, "error");
                                return;
                              }
                              // Also save to localStorage as persistent fallback
                              try { localStorage.setItem(`wc_rounds_${leagueCode}`, JSON.stringify(cleanDraft)); } catch {}
                              // Apply immediately
                              const newRounds = getRounds({ round_values: cleanDraft });
                              setRounds(newRounds);
                              setTeamsPerOwner(newTpo);
                              try { localStorage.setItem(`wc_tpo_${leagueCode}`, String(newTpo)); } catch {}
                              setStats(calcStats(owners, wins, draws, newRounds));
                              setLeague(prev => ({ ...(prev||{}), settings: newSettings }));
                              setEditingRounds(false);
                              alert("✅ Settings saved!");
                            }} style={{ ...S.btn(),fontSize:12,padding:"6px 14px" }}>✓ Save</button>
                            <button onClick={()=>setEditingRounds(false)}
                              style={{ ...S.btn("#1a2440","#6677aa"),fontSize:12,padding:"6px 14px" }}>Cancel</button>
                          </div>
                        )}
                      </div>
                      {/* Teams per owner */}
                      <div style={{background:"#0a0f1a",border:"1px solid #1a2440",borderRadius:8,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                        <div>
                          <div style={{fontSize:11,color:"#6677aa",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Teams Per Owner</div>
                          <div style={{fontSize:11,color:"#445"}}>How many teams each player drafts</div>
                        </div>
                        {editingRounds?(
                          <input type="number" min="1" max="12" step="1"
                            defaultValue={teamsPerOwner}
                            onChange={e=>setRoundDraft(prev=>({...prev,__tpo:parseInt(e.target.value)||6}))}
                            style={{background:"#111827",border:"1px solid #f4c430",borderRadius:6,color:"#f4c430",
                              fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,
                              padding:"5px 10px",width:70,outline:"none",marginLeft:"auto"}}
                          />
                        ):(
                          <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:700,color:"#f4c430",marginLeft:"auto"}}>{teamsPerOwner}</div>
                        )}
                      </div>

                      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10 }}>
                        {rounds.map(r=>(
                          <div key={r.id} style={{ background:"#0a0f1a",border:"1px solid #1a2440",borderRadius:8,padding:"10px 12px" }}>
                            <div style={{ fontSize:11,color:"#6677aa",marginBottom:6,fontWeight:700 }}>{r.short} — {r.id}</div>
                            {editingRounds?(
                              <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                                <span style={{ color:"#f4c430",fontSize:13 }}>$</span>
                                <input
                                  type="number" step="0.25" min="0.25"
                                  value={roundDraft[r.id]??r.dmg}
                                  onChange={e=>setRoundDraft(prev=>({...prev,[r.id]:parseFloat(e.target.value)||r.dmg}))}
                                  style={{ background:"#111827",border:"1px solid #f4c430",borderRadius:6,color:"#f4c430",
                                    fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,padding:"5px 8px",width:"80px",outline:"none" }}
                                />
                              </div>
                            ):(
                              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:18,fontWeight:700,color:"#f4c430" }}>${r.dmg.toFixed(2)}</div>
                            )}
                            {r.hasDraw&&<div style={{ fontSize:10,color:"#f39c12",marginTop:4 }}>Draw: ${((editingRounds?(roundDraft[r.id]??r.dmg):r.dmg)/2).toFixed(2)}</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Record Result */}
                    <div style={S.card}>
                      <SecTitle>⚽ Record Result</SecTitle>
                      <button onClick={()=>setModal("addResult")} style={{ ...S.btn(),width:"100%",padding:"12px" }}>
                        + Record Win / Draw
                      </button>
                    </div>

                    {/* Manage Owners */}
                    <OwnerManager
                      owners={owners}
                      stats={stats}
                      leagueCode={leagueCode}
                      onRefresh={loadData}
                      alertFn={alert}
                      teamsPerOwner={teamsPerOwner}
                    />

                    {/* Result Log */}
                    <div style={S.card}>
                      <SecTitle>📋 Recent Results</SecTitle>
                      <div style={{ display:"flex",flexDirection:"column",gap:5,maxHeight:300,overflowY:"auto" }}>
                        {[...wins.map(w=>({...w,type:"win"})),...draws.map(d=>({...d,type:"draw"}))].slice(-30).reverse().map(r=>{
                          const o=owners.find(x=>x.id===r.owner_id);
                          return (
                            <div key={`${r.type}-${r.id}`} style={{ display:"flex",alignItems:"center",gap:10,
                              background:"#0f1625",border:"1px solid #1a2440",borderRadius:8,padding:"8px 12px",fontSize:13 }}>
                              <span style={{ color:r.type==="win"?"#2ecc71":"#f39c12",fontWeight:700,minWidth:40 }}>{r.type==="win"?"WIN":"DRAW"}</span>
                              <span style={{ flex:1,fontWeight:600 }}>{r.team_name}</span>
                              <span style={{ color:"#6677aa",fontSize:11 }}>{r.round_id}</span>
                              <span style={{ color:"#445",fontSize:11 }}>{o?.name}</span>
                              <button onClick={()=>removeResult(r.id,r.type)}
                                style={{ background:"none",border:"1px solid #3a1820",borderRadius:5,color:"#e74c3c",padding:"2px 7px",cursor:"pointer",fontSize:11 }}>✕</button>
                            </div>
                          );
                        })}
                        {wins.length===0&&draws.length===0&&<Empty text="No results yet." />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
