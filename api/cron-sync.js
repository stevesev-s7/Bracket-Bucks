// Vercel Cron - ESPN Auto-Sync
const SB_URL='https://cxkqkmakwynpgqpfzvtp.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3FrbWFrd3lucGdxcGZ6dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODEwMDIsImV4cCI6MjA4ODE1NzAwMn0.biNsjhSH3HcuWG9q25XO5CRpiTkdmpF59iLAOCk8yUE';
const LEAGUES=['FX8OZB','OIU8IS','CHI2025','TSS7OR','J5JBYC','V55GGL','QZ81AN','7NW5J3'];
const ROUNDS=[
  {keys:['1st Round','First Round','Round of 64'],id:'r1'},
  {keys:['2nd Round','Second Round','Round of 32'],id:'r2'},
  {keys:['Sweet 16','Sweet Sixteen'],id:'r3'},
  {keys:['Elite Eight','Elite 8'],id:'r4'},
  {keys:['Final Four'],id:'r5'},
  {keys:['National Championship','Championship'],id:'r6'},
];
function getRoundId(note){for(const r of ROUNDS){if(r.keys.some(k=>note.includes(k)))return r.id;}return null;}
const sb=(p)=>fetch(SB_URL+'/rest/v1/'+p,{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}}).then(r=>r.json());
const sbPost=(p,b)=>fetch(SB_URL+'/rest/v1/'+p,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(b)});
export default async function handler(req,res){
  const log=[];
  try{
    const [owners,wins]=await Promise.all([sb('owners?select=id,name,teams,league_code'),sb('wins?select=owner_id,round_id,team_index')]);
    const ow=owners.filter(o=>LEAGUES.includes(o.league_code));
    log.push('owners:'+ow.length+' wins:'+wins.length);
    const er=await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200');
    const ed=await er.json();
    const done=(ed.events||[]).filter(g=>g.status?.type?.completed);
    log.push('games:'+done.length);
    let ins=0;
    for(const g of done){
      const rn=g.competitions?.[0]?.notes?.[0]?.headline||'';
      const rid=getRoundId(rn);
      if(!rid)continue;
      const w=(g.competitions?.[0]?.competitors||[]).find(c=>c.winner);
      if(!w)continue;
      const wn=(w.team?.displayName||'').toLowerCase().trim();
      for(const o of ow){
        if(!o.teams||!Array.isArray(o.teams))continue;
        for(let i=0;i<o.teams.length;i++){
          const t=o.teams[i];
          const tn=(typeof t==='string'?t:t?.name||'').toLowerCase().trim();
          if(!tn)continue;
          if(!wn.includes(tn)&&!tn.includes(wn)&&!wn.split(' ').some(x=>x.length>3&&tn.includes(x)))continue;
          if(wins.some(x=>x.owner_id===o.id&&x.round_id===rid&&x.team_index===i))continue;
          const r=await sbPost('wins',{league_code:o.league_code,owner_id:o.id,round_id:rid,team_index:i});
          if(r.ok||r.status===201||r.status===204){ins++;wins.push({owner_id:o.id,round_id:rid,team_index:i});log.push('WIN:['+o.league_code+']'+o.name+'-'+(typeof t==='string'?t:t?.name)+'('+rn+')');}
        }
      }
    }
    log.push('inserted:'+ins);
    res.status(200).json({success:true,inserted:ins,log});
  }catch(e){res.status(500).json({success:false,error:e.message,log});}
}