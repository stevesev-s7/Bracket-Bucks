// ============================================================
// Bracket Bucks 2026 World Cup - Scoring Engine
// Mirrors the Excel formulas exactly
// ============================================================

export const ROUND_MULTIPLIERS = {
  'Pool Play':     { win: 0.5,  draw: 0.25 },
  'Round of 32':   { win: 1.0,  draw: null },
  'Round of 16':   { win: 1.5,  draw: null },
  'Round of 8':    { win: 2.0,  draw: null },
  'Round of 4':    { win: 2.5,  draw: null },
  'Championship':  { win: 3.0,  draw: null },
};

export const ROUND_ORDER = [
  'Pool Play',
  'Round of 32',
  'Round of 16',
  'Round of 8',
  'Round of 4',
  'Championship',
];

/**
 * Given game results and player-team assignments, compute full scoreboard.
 * @param {Array} gameResults  - rows from game_results table
 * @param {Array} playerTeams  - rows from player_teams (with team info joined)
 * @param {Array} players      - rows from players table
 * @returns {Array}  scoreboard sorted by cumulative winnings desc
 */
export function computeScoreboard(gameResults, playerTeams, players) {
  // Build a map: teamId -> playerId
  const teamToPlayer = {};
  playerTeams.forEach(pt => {
    teamToPlayer[pt.team_id] = pt.player_id;
  });

  // Build a map: playerId -> playerName
  const playerMap = {};
  players.forEach(p => {
    playerMap[p.id] = p.name;
  });

  // Initialize per-player, per-round stats
  const stats = {};
  players.forEach(p => {
    stats[p.id] = {
      playerId: p.id,
      playerName: p.name,
      rounds: {},
      cumulativeWinnings: 0,
    };
    ROUND_ORDER.forEach(round => {
      stats[p.id].rounds[round] = { wins: 0, draws: 0, payout: 0 };
    });
  });

  // Process each game result
  gameResults.forEach(gr => {
    const playerId = teamToPlayer[gr.team_id];
    if (!playerId || !stats[playerId]) return;

    const mult = ROUND_MULTIPLIERS[gr.round];
    if (!mult) return;

    const roundStats = stats[playerId].rounds[gr.round];

    if (gr.result === 'win') {
      roundStats.wins += 1;
      roundStats.payout += mult.win;
    } else if (gr.result === 'draw' && mult.draw !== null) {
      roundStats.draws += 1;
      roundStats.payout += mult.draw;
    }
  });

  // Compute cumulative winnings across rounds
  const scoreboard = Object.values(stats).map(playerStats => {
    let cumulative = 0;
    const roundSummary = ROUND_ORDER.map(round => {
      const r = playerStats.rounds[round];
      cumulative += r.payout;
      return {
        round,
        wins: r.wins,
        draws: r.draws,
        payout: r.payout,
        cumulative,
      };
    });

    return {
      playerId: playerStats.playerId,
      playerName: playerStats.playerName,
      rounds: roundSummary,
      totalWinnings: cumulative,
    };
  });

  // Sort by total winnings descending
  return scoreboard.sort((a, b) => b.totalWinnings - a.totalWinnings);
}

/**
 * Get teams owned by a specific player with their results
 */
export function getPlayerTeamResults(playerId, playerTeams, gameResults, teams) {
  const myTeamIds = playerTeams
    .filter(pt => pt.player_id === playerId)
    .map(pt => pt.team_id);

  const teamMap = {};
  teams.forEach(t => { teamMap[t.id] = t; });

  return myTeamIds.map(teamId => {
    const team = teamMap[teamId];
    const results = gameResults.filter(gr => gr.team_id === teamId);
    return { team, results };
  });
}

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
