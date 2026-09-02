import React from 'react';

export default function Footer() {
  const developers = [
    {
      name: 'Aarav',
      role: 'Full Stack Dev',
      initials: 'AA',
      bio: 'Passionate full-stack developer focusing on scalable web applications, real-time UI components, and modern frontend architecture.',
      linkedin: 'https://www.linkedin.com/in/aaravsaxena26/',
      github: 'https://github.com/Aarav1226/',
      color: '#38bdf8'
    },
    {
      name: 'Sahaj',
      role: 'DevOps & Backend',
      initials: 'SA',
      bio: 'Specializing in cloud infrastructure, CI/CD automation pipelines, containerization, and high-availability server operations.',
      linkedin: 'https://www.linkedin.com/in/sahaj-parikh-abz/',
      github: 'https://github.com/Sahaj9238/',
      color: '#34d399'
    },
    {
      name: 'Shantanu',
      role: 'Frontend & UI/UX',
      initials: 'SH',
      bio: 'Crafting modern responsive user interfaces, interactive campus transit mapping systems, and seamless design experiences.',
      linkedin: 'https://www.linkedin.com/in/shantanupathak29/',
      github: 'https://github.com/shantanupathak29/',
      color: '#a855f7'
    }
  ];

  return (
    <footer className="app-footer" role="contentinfo" aria-label="Site footer">
      <div className="footer-glow-bar" />
      <div className="footer-container">

        {/* Left: Brand Logo & Copyright */}
        <div className="footer-left">
          <div className="footer-brand-badge">
            <img
              src="/campusride-logo.png"
              alt="CampusRide Logo"
              className="footer-logo-img"
            />
          </div>

          <div className="footer-divider-dot" aria-hidden="true">•</div>

          <p className="footer-copy">
            &copy; 2026 <span className="highlight-text">CampusRide</span>. All rights reserved.
          </p>
        </div>

        {/* Right: Developers & Interactive Popover */}
        <div className="footer-right">
          <span className="developed-by-label">
            Developed by
          </span>

          <div className="dev-chips-container">
            {developers.map((dev) => (
              <div key={dev.name} className="dev-chip-wrapper">
                <div className="dev-chip">
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

                  <svg
                    className="info-icon"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ opacity: 0.6, marginLeft: '2px' }}
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>

                {/* Popover on Hover */}
                <div className="dev-popover">
                  <div className="dev-popover-header">
                    <span
                      className="dev-popover-avatar"
                      style={{
                        backgroundColor: `${dev.color}25`,
                        color: dev.color,
                        borderColor: `${dev.color}60`
                      }}
                    >
                      {dev.initials}
                    </span>
                    <div>
                      <h4 className="dev-popover-name">{dev.name}</h4>
                      <span className="dev-popover-role" style={{ color: dev.color }}>{dev.role}</span>
                    </div>
                  </div>

                  <p className="dev-popover-bio">{dev.bio}</p>

                  <div className="dev-popover-links">
                    <a
                      href={dev.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dev-social-link linkedin"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      LinkedIn
                    </a>

                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dev-social-link github"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
