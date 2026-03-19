const SB_URL='https://cxkqkmakwynpgqpfzvtp.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4a3FrbWFrd3lucGdxcGZ6dnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1ODEwMDIsImV4cCI6MjA4ODE1NzAwMn0.biNsjhSH3HcuWG9q25XO5CRpiTkdmpF59iLAOCk8yUE';
const LEAGUES=['FX8OZB','OIU8IS','CHI2025','TSS7OR','J5JBYC','V55GGL','QZ81AN','7NW5J3'];
const ROUNDS=[{k:['1st Round','First Round','Round of 64'],id:0},{k:['2nd Round','Second Round','Round of 32'],id:1},{k:['Sweet 16'],id:2},{k:['Elite Eight'],id:3},{k:['Final Four'],id:4},{k:['National Championship','Championship'],id:5}];
function getRid(note){for(const r of ROUNDS){if(r.k.some(k=>note.includes(k)))return r.id;}return null;}
const sb=p=>fetch(SB_URL+'/rest/v1/'+p,{headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY}}).then(r=>r.json());
const post=(p,b)=>fetch(SB_URL+'/rest/v1/'+p,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(b)});
export default async function handler(req,res){
  try{
    const [owners,wins,er]=await Promise.all([sb('owners?select=id,name,teams,league_code'),sb('wins?select=owner_id,round_id,team_index'),fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=200')]);
    const ow=owners.filter(o=>LEAGUES.includes(o.league_code));
    const ed=await er.json();
    const done=(ed.events||[]).filter(g=>g.status?.type?.completed);
    let ins=0,log=[];
    for(const g of done){
      const note=g.competitions?.[0]?.notes?.[0]?.headline||'';
      const rid=getRid(note);if(rid===null)continue;
      const winner=(g.competitions?.[0]?.competitors||[]).find(c=>c.winner);if(!winner)continue;
      const espnName=winner.team?.displayName||'';
      for(const o of ow){
        if(!o.teams)continue;
        for(let i=0;i<o.teams.length;i++){
          const t=o.teams[i];const tn=typeof t==='string'?t:(t?.name||'');
          if(!tn)continue;
          if(tn!==espnName)continue;
          if(wins.some(x=>x.owner_id===o.id&&x.round_id===rid&&x.team_index===i))continue;
          const r=await post('wins',{league_code:o.league_code,owner_id:o.id,round_id:rid,team_index:i});
          if(r.ok||r.status===204){ins++;wins.push({owner_id:o.id,round_id:rid,team_index:i});log.push(o.league_code+' '+o.name+' '+tn);}
        }
      }
    }
    res.status(200).json({success:true,inserted:ins,log});
  }catch(e){res.status(500).json({success:false,error:e.message});}
}