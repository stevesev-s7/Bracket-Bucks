import React, { useState } from 'react';
import MarchMadnessApp from './MarchMadnessApp';
import WorldCupApp from './WorldCupApp';
import './App.css';

const SPORTS = [
  {
    id: 'worldcup',
    label: '2026 World Cup',
    icon: '⚽',
    sub: 'June 11 – July 19, 2026',
    color: '#0a5c36',
    accent: '#f4c430',
  },
  {
    id: 'marchmadness',
    label: '2026 March Madness',
    icon: '🏀',
    sub: 'NCAA Tournament',
    color: '#1a2440',
    accent: '#e84c3c',
  },
];

export default function App() {
  const [sport, setSport] = useState(null);

  if (sport === 'worldcup') return (
    <div>
      <SportBanner sport={SPORTS[0]} onSwitch={() => setSport(null)} />
      <WorldCupApp />
    </div>
  );

  if (sport === 'marchmadness') return (
    <div>
      <SportBanner sport={SPORTS[1]} onSwitch={() => setSport(null)} />
      <MarchMadnessApp />
    </div>
  );

  return <SportSelector onSelect={setSport} />;
}

function SportBanner({ sport, onSwitch }) {
  return (
    <div style={{
      background: sport.color,
      borderBottom: `3px solid ${sport.accent}`,
      padding: '8px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span style={{ color: sport.accent, fontFamily: 'Bebas Neue, sans-serif', letterSpacing: 2, fontSize: '1rem' }}>
        {sport.icon} {sport.label}
      </span>
      <button
        onClick={onSwitch}
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: `1px solid ${sport.accent}`,
          borderRadius: 6,
          color: sport.accent,
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 700,
          fontSize: '0.78rem',
          padding: '4px 12px',
          cursor: 'pointer',
          letterSpacing: 1,
        }}
      >
        ⇄ Switch Sport
      </button>
    </div>
  );
}

function SportSelector({ onSelect }) {
  return (
    <div className="sport-selector">
      <div className="sport-selector-header">
        <div className="ss-logo">
          <span className="ss-logo-icon">🏆</span>
          <div>
            <div className="ss-logo-title">BRACKET BUCKS</div>
            <div className="ss-logo-sub">CHICAGO LEAGUE</div>
          </div>
        </div>
        <p className="ss-tagline">Choose your tournament</p>
      </div>

      <div className="ss-cards">
        {SPORTS.map(sport => (
          <button
            key={sport.id}
            className="ss-card"
            style={{ '--accent': sport.accent, '--bg': sport.color }}
            onClick={() => onSelect(sport.id)}
          >
            <div className="ss-card-icon">{sport.icon}</div>
            <div className="ss-card-label">{sport.label}</div>
            <div className="ss-card-sub">{sport.sub}</div>
            <div className="ss-card-cta">Enter →</div>
          </button>
        ))}
      </div>

      <div className="ss-footer">bracket-bucks.com · Chicago League · CHI2025</div>
    </div>
  );
}
