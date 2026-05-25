import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { computeScoreboard, ROUND_ORDER, ROUND_MULTIPLIERS, formatCurrency } from './lib/scoring';
import './App.css';

const ADMIN_USERNAME = 'chi2025admin';
const ADMIN_PIN = '1234';
const LEAGUE_CODE = 'CHI2025';

// ─────────────────────────────────────────────
// TOP-LEVEL APP
// ─────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('home'); // home | leaderboard | bracket | myteams | admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [leagueUnlocked, setLeagueUnlocked] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [playerTeams, setPlayerTeams] = useState([]);
  const [gameResults, setGameResults] = useState([]);
  const [scoreboard, setScoreboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: pData }, { data: tData }, { data: ptData }, { data: grData }] = await Promise.all([
      supabase.from('players').select('*').order('name'),
      supabase.from('teams').select('*').order('group_name').order('seed'),
      supabase.from('player_teams').select('*'),
      supabase.from('game_results').select('*').order('created_at', { ascending: false }),
    ]);
    const p = pData || [], t = tData || [], pt = ptData || [], gr = grData || [];
    setPlayers(p);
    setTeams(t);
    setPlayerTeams(pt);
    setGameResults(gr);
    setScoreboard(computeScoreboard(gr, pt, p));
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleNav = (v) => setView(v);

  return (
    <div className="app">
      <Header view={view} onNav={handleNav} isAdmin={isAdmin} />

      {loading ? (
        <div className="loader-wrap"><div className="loader" /></div>
      ) : (
        <>
          {view === 'home' && (
            <HomeView
              scoreboard={scoreboard}
              leagueUnlocked={leagueUnlocked}
              setLeagueUnlocked={setLeagueUnlocked}
              onNav={handleNav}
              players={players}
              setSelectedPlayer={setSelectedPlayer}
            />
          )}
          {view === 'leaderboard' && (
            <LeaderboardView scoreboard={scoreboard} players={players} gameResults={gameResults} />
          )}
          {view === 'bracket' && (
            <BracketView teams={teams} playerTeams={playerTeams} players={players} gameResults={gameResults} />
          )}
          {view === 'myteams' && (
            <MyTeamsView
              players={players}
              teams={teams}
              playerTeams={playerTeams}
              gameResults={gameResults}
              scoreboard={scoreboard}
              selectedPlayer={selectedPlayer}
              setSelectedPlayer={setSelectedPlayer}
            />
          )}
          {view === 'admin' && (
            <AdminView
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              players={players}
              teams={teams}
              playerTeams={playerTeams}
              gameResults={gameResults}
              onRefresh={loadData}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────
function Header({ view, onNav, isAdmin }) {
  const navItems = [
    { id: 'home', label: '🏠 Home' },
    { id: 'leaderboard', label: '🏆 Standings' },
    { id: 'bracket', label: '🌍 Bracket' },
    { id: 'myteams', label: '⚽ My Teams' },
    { id: 'admin', label: isAdmin ? '🔓 Admin' : '🔒 Admin' },
  ];
  return (
    <header className="header">
      <div className="header-top">
        <div className="header-logo">
          <span className="logo-icon">⚽</span>
          <div>
            <div className="logo-title">BRACKET BUCKS</div>
            <div className="logo-sub">2026 WORLD CUP EDITION</div>
          </div>
        </div>
        <div className="header-badge">CHI2025</div>
      </div>
      <nav className="nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-btn ${view === item.id ? 'active' : ''}`}
            onClick={() => onNav(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────
// HOME VIEW
// ─────────────────────────────────────────────
function HomeView({ scoreboard, leagueUnlocked, setLeagueUnlocked, onNav, players, setSelectedPlayer }) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleCodeSubmit = () => {
    if (code.toUpperCase() === LEAGUE_CODE) {
      setLeagueUnlocked(true);
      setCodeError('');
    } else {
      setCodeError('Invalid league code. Try again.');
    }
  };

  const top3 = scoreboard.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="view home-view">
      <div className="home-hero">
        <div className="hero-title">2026 FIFA WORLD CUP</div>
        <div className="hero-sub">Bracket Bucks — Chicago League</div>
        <div className="hero-dates">June 11 – July 19, 2026 · USA · Canada · Mexico</div>
      </div>

      {!leagueUnlocked ? (
        <div className="card league-gate">
          <h2>🔐 Enter League Code</h2>
          <p>Enter your league code to access standings and picks.</p>
          <div className="code-input-row">
            <input
              className="input"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="League Code"
              onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
            />
            <button className="btn btn-primary" onClick={handleCodeSubmit}>Enter</button>
          </div>
          {codeError && <div className="error-msg">{codeError}</div>}
        </div>
      ) : (
        <>
          <div className="podium-section">
            <h2 className="section-title">🏆 Current Leaders</h2>
            <div className="podium">
              {top3.map((p, i) => (
                <div key={p.playerId} className={`podium-slot place-${i + 1}`}>
                  <div className="podium-medal">{medals[i]}</div>
                  <div className="podium-name">{p.playerName}</div>
                  <div className="podium-amount">{formatCurrency(p.totalWinnings)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-links">
            <button className="quick-card" onClick={() => onNav('leaderboard')}>
              <span className="quick-icon">📊</span>
              <span>Full Standings</span>
            </button>
            <button className="quick-card" onClick={() => onNav('bracket')}>
              <span className="quick-icon">🗺️</span>
              <span>View Bracket</span>
            </button>
            <button className="quick-card" onClick={() => onNav('myteams')}>
              <span className="quick-icon">⚽</span>
              <span>My Teams</span>
            </button>
          </div>

          <div className="card scoring-card">
            <h3>📋 Scoring Rules</h3>
            <table className="scoring-table">
              <thead>
                <tr><th>Round</th><th>Win</th><th>Draw</th></tr>
              </thead>
              <tbody>
                {ROUND_ORDER.map(round => (
                  <tr key={round}>
                    <td>{round}</td>
                    <td className="pts">{ROUND_MULTIPLIERS[round].win} pts</td>
                    <td className="pts">
                      {ROUND_MULTIPLIERS[round].draw !== null ? `${ROUND_MULTIPLIERS[round].draw} pts` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LEADERBOARD VIEW
// ─────────────────────────────────────────────
function LeaderboardView({ scoreboard, players, gameResults }) {
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="view">
      <h2 className="section-title">🏆 Full Standings</h2>
      <div className="leaderboard">
        {scoreboard.map((p, i) => (
          <div key={p.playerId} className={`lb-row ${expandedPlayer === p.playerId ? 'expanded' : ''}`}>
            <div className="lb-main" onClick={() => setExpandedPlayer(expandedPlayer === p.playerId ? null : p.playerId)}>
              <div className="lb-rank">{medals[i] || `#${i + 1}`}</div>
              <div className="lb-name">{p.playerName}</div>
              <div className="lb-total">{formatCurrency(p.totalWinnings)}</div>
              <div className="lb-chevron">{expandedPlayer === p.playerId ? '▲' : '▼'}</div>
            </div>
            {expandedPlayer === p.playerId && (
              <div className="lb-detail">
                <table className="detail-table">
                  <thead>
                    <tr><th>Round</th><th>Wins</th><th>Draws</th><th>Payout</th><th>Cumulative</th></tr>
                  </thead>
                  <tbody>
                    {p.rounds.map(r => (
                      <tr key={r.round} className={r.payout > 0 ? 'has-points' : ''}>
                        <td>{r.round}</td>
                        <td>{r.wins}</td>
                        <td>{r.draws}</td>
                        <td>{formatCurrency(r.payout)}</td>
                        <td>{formatCurrency(r.cumulative)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card mt-2">
        <h3>📈 Round-by-Round Breakdown</h3>
        <div className="round-grid">
          {ROUND_ORDER.map(round => {
            const roundData = scoreboard.map(p => ({
              name: p.playerName,
              payout: p.rounds.find(r => r.round === round)?.payout || 0,
            })).sort((a, b) => b.payout - a.payout);
            const hasActivity = roundData.some(r => r.payout > 0);
            return (
              <div key={round} className={`round-card ${hasActivity ? 'active' : 'inactive'}`}>
                <div className="round-card-title">{round}</div>
                {roundData.map((r, i) => (
                  <div key={r.name} className="round-card-row">
                    <span className="round-card-name">{r.name}</span>
                    <span className="round-card-amt">{formatCurrency(r.payout)}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BRACKET VIEW
// ─────────────────────────────────────────────
function BracketView({ teams, playerTeams, players, gameResults }) {
  const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  // Map teamId -> playerName
  const teamOwner = {};
  playerTeams.forEach(pt => {
    const player = players.find(p => p.id === pt.player_id);
    if (player) teamOwner[pt.team_id] = player.name;
  });

  // Map teamId -> results
  const teamResults = {};
  gameResults.forEach(gr => {
    if (!teamResults[gr.team_id]) teamResults[gr.team_id] = [];
    teamResults[gr.team_id].push(gr);
  });

  const getTeamResult = (teamId) => {
    const results = teamResults[teamId] || [];
    const wins = results.filter(r => r.result === 'win').length;
    const draws = results.filter(r => r.result === 'draw').length;
    return { wins, draws };
  };

  const playerColors = [
    '#e74c3c','#3498db','#2ecc71','#f39c12',
    '#9b59b6','#1abc9c','#e67e22','#e91e63',
  ];
  const playerColorMap = {};
  players.forEach((p, i) => { playerColorMap[p.name] = playerColors[i % playerColors.length]; });

  return (
    <div className="view">
      <h2 className="section-title">🌍 Group Stage Bracket</h2>
      <div className="player-legend">
        {players.map(p => (
          <div key={p.id} className="legend-item">
            <div className="legend-dot" style={{ background: playerColorMap[p.name] }} />
            <span>{p.name}</span>
          </div>
        ))}
      </div>
      <div className="groups-grid">
        {groups.map(g => {
          const groupTeams = teams.filter(t => t.group_name === `Group ${g}`);
          return (
            <div key={g} className="group-card">
              <div className="group-title">Group {g}</div>
              {groupTeams.map(team => {
                const owner = teamOwner[team.id];
                const { wins, draws } = getTeamResult(team.id);
                const color = owner ? playerColorMap[owner] : '#555';
                return (
                  <div key={team.id} className="team-row" style={{ borderLeft: `4px solid ${color}` }}>
                    <div className="team-seed">#{team.seed}</div>
                    <div className="team-name">{team.name}</div>
                    <div className="team-owner" style={{ color }}>{owner ? owner.split(' ')[0] : '—'}</div>
                    {(wins > 0 || draws > 0) && (
                      <div className="team-record">{wins}W {draws}D</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MY TEAMS VIEW
// ─────────────────────────────────────────────
function MyTeamsView({ players, teams, playerTeams, gameResults, scoreboard, selectedPlayer, setSelectedPlayer }) {
  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  const resultsByTeam = {};
  gameResults.forEach(gr => {
    if (!resultsByTeam[gr.team_id]) resultsByTeam[gr.team_id] = [];
    resultsByTeam[gr.team_id].push(gr);
  });

  const getMyTeams = (playerId) =>
    playerTeams.filter(pt => pt.player_id === playerId).map(pt => teamMap[pt.team_id]).filter(Boolean);

  const getMyScore = (playerId) =>
    scoreboard.find(s => s.playerId === playerId);

  return (
    <div className="view">
      <h2 className="section-title">⚽ Player Team Rosters</h2>
      <div className="player-selector">
        {players.map(p => (
          <button
            key={p.id}
            className={`player-pill ${selectedPlayer === p.id ? 'active' : ''}`}
            onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {selectedPlayer ? (
        <PlayerDetail
          player={players.find(p => p.id === selectedPlayer)}
          myTeams={getMyTeams(selectedPlayer)}
          resultsByTeam={resultsByTeam}
          scoreData={getMyScore(selectedPlayer)}
        />
      ) : (
        <div className="all-players-grid">
          {players.map(p => {
            const myTeams = getMyTeams(p.id);
            const score = getMyScore(p.id);
            return (
              <div key={p.id} className="player-card" onClick={() => setSelectedPlayer(p.id)}>
                <div className="player-card-name">{p.name}</div>
                <div className="player-card-total">{formatCurrency(score?.totalWinnings || 0)}</div>
                <div className="player-card-teams">
                  {myTeams.length > 0 ? (
                    <div className="team-chips">
                      {myTeams.map(t => (
                        <span key={t.id} className="team-chip">{t.name}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="no-teams">No teams assigned yet</span>
                  )}
                </div>
                <div className="player-card-cta">View Details →</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlayerDetail({ player, myTeams, resultsByTeam, scoreData }) {
  if (!player || !scoreData) return null;

  return (
    <div className="player-detail">
      <div className="player-detail-header">
        <div className="player-detail-name">{player.name}</div>
        <div className="player-detail-total">{formatCurrency(scoreData.totalWinnings)}</div>
      </div>

      <div className="detail-sections">
        <div className="card">
          <h3>Round-by-Round Earnings</h3>
          <table className="detail-table">
            <thead>
              <tr><th>Round</th><th>Wins</th><th>Draws</th><th>Payout</th><th>Cumulative</th></tr>
            </thead>
            <tbody>
              {scoreData.rounds.map(r => (
                <tr key={r.round} className={r.payout > 0 ? 'has-points' : ''}>
                  <td>{r.round}</td>
                  <td>{r.wins}</td>
                  <td>{r.draws}</td>
                  <td>{formatCurrency(r.payout)}</td>
                  <td>{formatCurrency(r.cumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>My Teams ({myTeams.length})</h3>
          <div className="my-teams-list">
            {myTeams.length === 0 && <p className="muted">No teams assigned yet.</p>}
            {myTeams.map(team => {
              const results = resultsByTeam[team.id] || [];
              const wins = results.filter(r => r.result === 'win').length;
              const draws = results.filter(r => r.result === 'draw').length;
              const losses = results.filter(r => r.result === 'loss').length;
              return (
                <div key={team.id} className="my-team-row">
                  <div className="my-team-info">
                    <span className="my-team-name">{team.name}</span>
                    <span className="my-team-group">{team.group_name} · Seed #{team.seed}</span>
                  </div>
                  <div className="my-team-record">
                    {results.length > 0 ? `${wins}W ${draws}D ${losses}L` : 'No results yet'}
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

// ─────────────────────────────────────────────
// ADMIN VIEW
// ─────────────────────────────────────────────
function AdminView({ isAdmin, setIsAdmin, players, teams, playerTeams, gameResults, onRefresh }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminTab, setAdminTab] = useState('results'); // results | assign | manage
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  // Add result form
  const [resultTeam, setResultTeam] = useState('');
  const [resultRound, setResultRound] = useState('Pool Play');
  const [resultOutcome, setResultOutcome] = useState('win');
  const [resultDate, setResultDate] = useState(new Date().toISOString().split('T')[0]);

  // Assign team form
  const [assignPlayer, setAssignPlayer] = useState('');
  const [assignTeam, setAssignTeam] = useState('');

  const showMsg = (text, type = 'success') => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && pin === ADMIN_PIN) {
      setIsAdmin(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or PIN.');
    }
  };

  const handleAddResult = async () => {
    if (!resultTeam) return showMsg('Please select a team.', 'error');
    const { error } = await supabase.from('game_results').insert({
      round: resultRound,
      team_id: parseInt(resultTeam),
      result: resultOutcome,
      match_date: resultDate,
    });
    if (error) {
      showMsg('Error saving result: ' + error.message, 'error');
    } else {
      showMsg('✅ Result saved!');
      setResultTeam('');
      onRefresh();
    }
  };

  const handleDeleteResult = async (id) => {
    const { error } = await supabase.from('game_results').delete().eq('id', id);
    if (error) {
      showMsg('Error deleting: ' + error.message, 'error');
    } else {
      showMsg('✅ Deleted.');
      onRefresh();
    }
  };

  const handleAssignTeam = async () => {
    if (!assignPlayer || !assignTeam) return showMsg('Select player and team.', 'error');
    const { error } = await supabase.from('player_teams').insert({
      player_id: parseInt(assignPlayer),
      team_id: parseInt(assignTeam),
    });
    if (error) {
      showMsg('Error: ' + error.message, 'error');
    } else {
      showMsg('✅ Team assigned!');
      setAssignTeam('');
      onRefresh();
    }
  };

  const handleRemoveAssignment = async (playerId, teamId) => {
    await supabase.from('player_teams').delete()
      .eq('player_id', playerId).eq('team_id', teamId);
    onRefresh();
  };

  // Build a map for display
  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });
  const playerMap = {};
  players.forEach(p => { playerMap[p.id] = p; });

  // Assigned teams per player
  const assignmentsByPlayer = {};
  players.forEach(p => { assignmentsByPlayer[p.id] = []; });
  playerTeams.forEach(pt => {
    if (assignmentsByPlayer[pt.player_id]) {
      assignmentsByPlayer[pt.player_id].push(pt.team_id);
    }
  });

  if (!isAdmin) {
    return (
      <div className="view">
        <div className="card admin-login">
          <h2>🔒 Admin Login</h2>
          <div className="form-group">
            <label>Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          </div>
          <div className="form-group">
            <label>PIN</label>
            <input className="input" type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          {loginError && <div className="error-msg">{loginError}</div>}
          <button className="btn btn-primary" onClick={handleLogin}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="admin-header">
        <h2>🔓 Admin Panel</h2>
        <button className="btn btn-ghost" onClick={() => setIsAdmin(false)}>Logout</button>
      </div>

      {msg && <div className={`flash-msg ${msgType}`}>{msg}</div>}

      <div className="admin-tabs">
        {[['results','⚽ Enter Results'],['assign','📋 Assign Teams'],['manage','🗂 Manage']].map(([id, label]) => (
          <button key={id} className={`admin-tab ${adminTab === id ? 'active' : ''}`} onClick={() => setAdminTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {adminTab === 'results' && (
        <div className="card">
          <h3>Enter Game Result</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Round</label>
              <select className="input" value={resultRound} onChange={e => setResultRound(e.target.value)}>
                {ROUND_ORDER.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Team</label>
              <select className="input" value={resultTeam} onChange={e => setResultTeam(e.target.value)}>
                <option value="">— Select Team —</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.group_name}: {t.name} (#{t.seed})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Result</label>
              <select className="input" value={resultOutcome} onChange={e => setResultOutcome(e.target.value)}>
                <option value="win">Win</option>
                <option value="draw">Draw</option>
                <option value="loss">Loss</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input className="input" type="date" value={resultDate} onChange={e => setResultDate(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAddResult}>Add Result</button>

          <h3 className="mt-2">Recent Results ({gameResults.length})</h3>
          <div className="results-list">
            {gameResults.slice(0, 30).map(gr => {
              const team = teamMap[gr.team_id];
              return (
                <div key={gr.id} className="result-row">
                  <span className="result-round">{gr.round}</span>
                  <span className="result-team">{team?.name || 'Unknown'}</span>
                  <span className={`result-outcome ${gr.result}`}>{gr.result.toUpperCase()}</span>
                  <span className="result-date">{gr.match_date}</span>
                  <button className="btn-delete" onClick={() => handleDeleteResult(gr.id)}>✕</button>
                </div>
              );
            })}
            {gameResults.length === 0 && <p className="muted">No results entered yet.</p>}
          </div>
        </div>
      )}

      {adminTab === 'assign' && (
        <div className="card">
          <h3>Assign Team to Player</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Player</label>
              <select className="input" value={assignPlayer} onChange={e => setAssignPlayer(e.target.value)}>
                <option value="">— Select Player —</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Team</label>
              <select className="input" value={assignTeam} onChange={e => setAssignTeam(e.target.value)}>
                <option value="">— Select Team —</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.group_name}: {t.name}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAssignTeam}>Assign</button>

          <h3 className="mt-2">Current Assignments</h3>
          {players.map(p => (
            <div key={p.id} className="assignment-block">
              <div className="assignment-player">{p.name} ({assignmentsByPlayer[p.id]?.length || 0} teams)</div>
              <div className="assignment-teams">
                {(assignmentsByPlayer[p.id] || []).map(teamId => {
                  const t = teamMap[teamId];
                  return t ? (
                    <div key={teamId} className="assignment-chip">
                      {t.name}
                      <button className="chip-remove" onClick={() => handleRemoveAssignment(p.id, teamId)}>✕</button>
                    </div>
                  ) : null;
                })}
                {assignmentsByPlayer[p.id]?.length === 0 && <span className="muted">None</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'manage' && (
        <div className="card">
          <h3>📊 League Summary</h3>
          <div className="manage-stats">
            <div className="stat-box"><div className="stat-val">{teams.length}</div><div className="stat-lbl">Total Teams</div></div>
            <div className="stat-box"><div className="stat-val">{players.length}</div><div className="stat-lbl">Players</div></div>
            <div className="stat-box"><div className="stat-val">{gameResults.length}</div><div className="stat-lbl">Results Entered</div></div>
            <div className="stat-box"><div className="stat-val">{playerTeams.length}</div><div className="stat-lbl">Team Assignments</div></div>
          </div>
          <h3 className="mt-2">Unassigned Teams</h3>
          <div className="unassigned-list">
            {teams.filter(t => !playerTeams.find(pt => pt.team_id === t.id)).map(t => (
              <span key={t.id} className="unassigned-chip">{t.name}</span>
            ))}
            {teams.filter(t => !playerTeams.find(pt => pt.team_id === t.id)).length === 0 && (
              <p className="muted">✅ All teams assigned!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
