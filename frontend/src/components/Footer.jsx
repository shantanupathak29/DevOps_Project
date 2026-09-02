import React from 'react';

export default function Footer({ onNavigate404, currentView }) {
  const developers = [
    {
      name: 'Aarav',
      role: 'Full Stack Dev',
      initials: 'AA',
      linkedin: 'https://www.linkedin.com/in/aaravsaxena26/',
      color: '#38bdf8' // Cyan
    },
    {
      name: 'Sahaj',
      role: 'DevOps & Backend',
      initials: 'SA',
      linkedin: 'https://www.linkedin.com/in/sahaj-parikh-abz/',
      color: '#38bdf8' // Cyan
    },
    {
      name: 'Shantanu',
      role: 'Frontend & UI/UX',
      initials: 'SH',
      linkedin: 'https://www.linkedin.com/in/shantanupathak29/',
      color: '#38bdf8' // Cyan
    }
  ];

  return (
    <footer className="app-footer" role="contentinfo" aria-label="Site footer">
      <div className="footer-glow-bar" />
      <div className="footer-container">

        {/* Left: Brand & Copyright */}
        <div className="footer-left">
          <div className="footer-brand-badge">
            <svg
              className="footer-logo-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 4v4h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span className="footer-brand-title">CampusRide</span>
          </div>

          <div className="footer-divider-dot" aria-hidden="true">•</div>

          <p className="footer-copy">
            &copy; 2026 <span className="highlight-text">CampusRide</span>. All rights reserved.
          </p>

          {onNavigate404 && (
            <>
              <div className="footer-divider-dot" aria-hidden="true">•</div>
              <button
                type="button"
                className="footer-404-link"
                onClick={onNavigate404}
                title="Test 404 Page & T-Rex Game"
              >
                🎮 {currentView === '404' ? '404 Active' : '404 Game'}
              </button>
            </>
          )}
        </div>

        {/* Right: Developers & LinkedIn Links */}
        <div className="footer-right">
          <span className="developed-by-label">
            Developed by
          </span>

          <div className="dev-chips-container">
            {developers.map((dev) => (
              <a
                key={dev.name}
                href={dev.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="dev-chip"
                title={`Connect with ${dev.name} on LinkedIn`}
                aria-label={`${dev.name}'s LinkedIn Profile`}
              >
                <span
                  className="dev-avatar"
                  style={{
                    backgroundColor: `${dev.color}20`,
                    color: dev.color,
                    borderColor: `${dev.color}50`
                  }}
                >
                  {dev.initials}
                </span>

                <span className="dev-name">{dev.name}</span>

                {/* LinkedIn Icon */}
                <svg
                  className="linkedin-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
