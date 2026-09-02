import React, { useEffect, useRef, useState, useCallback } from 'react';

// Web Audio API Sound Effects Synthesizer (No external audio files needed)
class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio context error fallback
    }
  }

  playScore() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.28);
    } catch {
      // Audio context error fallback
    }
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Audio context error fallback
    }
  }
}

const sounds = new SoundFx();

export default function TRexGame({ onGameOverScore }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'GAMEOVER', 'PAUSED'
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('campusride_trex_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isMilestoneFlash, setIsMilestoneFlash] = useState(false);
  const [, setJumpCount] = useState(0);

  // Game internal variables (refs to avoid re-renders during 60fps loop)
  const gameRef = useRef({
    state: 'IDLE',
    score: 0,
    distance: 0,
    speed: 6,
    initialSpeed: 6,
    maxSpeed: 13,
    gravity: 0.65,
    jumpForce: -11.5,
    ducking: false,
    dino: {
      x: 50,
      y: 0,
      width: 44,
      height: 47,
      vy: 0,
      isGrounded: true,
      legStep: 0,
      legTimer: 0
    },
    obstacles: [],
    clouds: [],
    stars: [],
    groundX: 0,
    groundPebbles: [],
    nextObstacleTimer: 0,
    lastFrameTime: 0,
    flashScore: 0,
    flashTimer: 0,
    groundY: 150
  });

  const toggleMute = () => {
    sounds.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const g = gameRef.current;
    const rect = canvas.getBoundingClientRect();
    const groundY = rect.height - 35;
    g.groundY = groundY;
    g.state = 'PLAYING';
    g.score = 0;
    g.distance = 0;
    g.speed = g.initialSpeed;
    g.ducking = false;
    g.dino = {
      x: 50,
      y: groundY - 47,
      width: 44,
      height: 47,
      vy: 0,
      isGrounded: true,
      legStep: 0,
      legTimer: 0
    };
    g.obstacles = [];
    g.nextObstacleTimer = 60;
    g.lastFrameTime = performance.now();
    g.flashScore = 0;
    g.flashTimer = 0;

    // Seed ground pebbles
    g.groundPebbles = [];
    for (let i = 0; i < rect.width; i += 20) {
      g.groundPebbles.push({
        x: i + Math.random() * 15,
        y: groundY + 4 + Math.random() * 16,
        size: Math.random() > 0.6 ? 2 : 1
      });
    }

    // Seed initial clouds
    g.clouds = [
      { x: rect.width * 0.3, y: 25 + Math.random() * 25, speed: 0.8 },
      { x: rect.width * 0.7, y: 20 + Math.random() * 30, speed: 0.6 },
      { x: rect.width * 1.1, y: 35 + Math.random() * 20, speed: 0.9 }
    ];

    // Seed stars for dark theme
    g.stars = [];
    for (let i = 0; i < 30; i++) {
      g.stars.push({
        x: Math.random() * rect.width,
        y: Math.random() * (groundY - 40),
        size: Math.random() > 0.7 ? 2 : 1,
        blink: Math.random() * Math.PI
      });
    }

    setScore(0);
    setGameState('PLAYING');
  }, []);

  // Keyboard and Touch Action handlers
  const doJump = useCallback(() => {
    const g = gameRef.current;
    if (g.state === 'IDLE' || g.state === 'GAMEOVER') {
      startGame();
      return;
    }
    if (g.state === 'PLAYING' && g.dino.isGrounded && !g.ducking) {
      g.dino.vy = g.jumpForce;
      g.dino.isGrounded = false;
      sounds.playJump();
      setJumpCount(c => c + 1);
    }
  }, [startGame]);

  const doDuck = useCallback((isDucking) => {
    const g = gameRef.current;
    if (g.state !== 'PLAYING') return;
    g.ducking = isDucking;
    if (!g.dino.isGrounded && isDucking) {
      // Fast drop down if ducking mid-air
      g.dino.vy += 4;
    }
  }, []);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.state === 'PLAYING') {
      g.state = 'PAUSED';
      setGameState('PAUSED');
    } else if (g.state === 'PAUSED') {
      g.state = 'PLAYING';
      g.lastFrameTime = performance.now();
      setGameState('PLAYING');
    }
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        doJump();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        doDuck(true);
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        doDuck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [doJump, doDuck, togglePause]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas dimensions
    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gameRef.current.groundY = rect.height - 35;
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // Obstacle Generator Helper
    const spawnObstacle = (width, groundY, currentSpeed) => {
      let eligibleTypes = ['cactus_small', 'cactus_double', 'cactus_large', 'campus_cone'];
      if (gameRef.current.score >= 120) {
        eligibleTypes.push('pterodactyl');
      }

      const type = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)];

      if (type === 'cactus_small') {
        return {
          type,
          x: width + 20,
          y: groundY - 35,
          width: 17,
          height: 35
        };
      } else if (type === 'cactus_double') {
        return {
          type,
          x: width + 20,
          y: groundY - 35,
          width: 34,
          height: 35
        };
      } else if (type === 'cactus_large') {
        return {
          type,
          x: width + 20,
          y: groundY - 45,
          width: 25,
          height: 45
        };
      } else if (type === 'campus_cone') {
        return {
          type,
          x: width + 20,
          y: groundY - 30,
          width: 24,
          height: 30
        };
      } else {
        // Pterodactyl at 3 heights: low (jump over), mid (duck under), high (fly over)
        const heights = [groundY - 65, groundY - 42, groundY - 25];
        const flyY = heights[Math.floor(Math.random() * heights.length)];
        return {
          type: 'pterodactyl',
          x: width + 20,
          y: flyY,
          width: 42,
          height: 30,
          wingState: 0,
          wingTimer: 0,
          extraSpeed: currentSpeed * 0.15
        };
      }
    };

    // Collision Detection (Hitbox AABB with padding for fair gameplay)
    const checkCollision = (dino, obs, isDucking) => {
      const dWidth = isDucking ? 55 : 38;
      const dHeight = isDucking ? 28 : 42;
      const dX = dino.x + (isDucking ? 2 : 4);
      const dY = dino.y + (isDucking ? (47 - 28) : 2);

      const oInset = 4;
      const oX = obs.x + oInset;
      const oY = obs.y + oInset;
      const oWidth = obs.width - (oInset * 2);
      const oHeight = obs.height - (oInset * 2);

      return (
        dX < oX + oWidth &&
        dX + dWidth > oX &&
        dY < oY + oHeight &&
        dY + dHeight > oY
      );
    };

    // Drawing Helpers (Pixel / Vector Graphics)
    const drawDino = (x, y, isGrounded, ducking, legStep, isDead) => {
      ctx.save();
      ctx.fillStyle = isDead ? '#ef4444' : '#2185d5';

      if (ducking && isGrounded) {
        // Ducking Dino
        const duckY = y + 16;
        ctx.fillRect(x, duckY + 8, 48, 16);
        ctx.fillRect(x + 36, duckY + 2, 18, 12);
        ctx.fillStyle = '#f3f3f3';
        ctx.fillRect(x + 44, duckY + 4, 3, 3);
        ctx.fillStyle = isDead ? '#ef4444' : '#2185d5';
        ctx.fillRect(x - 6, duckY + 10, 8, 6);
        if (legStep === 0) {
          ctx.fillRect(x + 12, duckY + 24, 6, 6);
          ctx.fillRect(x + 28, duckY + 24, 6, 3);
        } else {
          ctx.fillRect(x + 12, duckY + 24, 6, 3);
          ctx.fillRect(x + 28, duckY + 24, 6, 6);
        }
      } else {
        // Standing / Jumping Dino
        ctx.fillRect(x + 8, y + 14, 22, 22);
        ctx.fillRect(x + 18, y, 22, 14);
        ctx.fillRect(x + 24, y + 2, 18, 10);
        ctx.fillStyle = isDead ? '#000000' : '#ffffff';
        ctx.fillRect(x + 28, y + 3, 3, 3);
        ctx.fillStyle = isDead ? '#ef4444' : '#2185d5';

        // Little Arms
        ctx.fillRect(x + 32, y + 18, 8, 3);
        ctx.fillRect(x + 37, y + 21, 3, 4);

        // Tail
        ctx.fillRect(x, y + 20, 8, 8);
        ctx.fillRect(x - 6, y + 24, 7, 5);

        // Legs
        if (!isGrounded) {
          ctx.fillRect(x + 12, y + 36, 5, 8);
          ctx.fillRect(x + 22, y + 36, 5, 8);
        } else {
          if (legStep === 0) {
            ctx.fillRect(x + 12, y + 36, 5, 11);
            ctx.fillRect(x + 12, y + 44, 8, 3);
            ctx.fillRect(x + 22, y + 36, 5, 6);
          } else {
            ctx.fillRect(x + 12, y + 36, 5, 6);
            ctx.fillRect(x + 22, y + 36, 5, 11);
            ctx.fillRect(x + 22, y + 44, 8, 3);
          }
        }
      }

      ctx.restore();
    };

    const drawCactus = (obs) => {
      ctx.save();
      ctx.fillStyle = '#38bdf8';

      if (obs.type === 'cactus_small') {
        ctx.fillRect(obs.x + 5, obs.y, 7, obs.height);
        ctx.fillRect(obs.x, obs.y + 10, 5, 4);
        ctx.fillRect(obs.x, obs.y + 6, 4, 8);
        ctx.fillRect(obs.x + 12, obs.y + 14, 5, 4);
        ctx.fillRect(obs.x + 13, obs.y + 8, 4, 10);
      } else if (obs.type === 'cactus_double') {
        ctx.fillRect(obs.x + 4, obs.y + 4, 6, obs.height - 4);
        ctx.fillRect(obs.x, obs.y + 12, 4, 4);
        ctx.fillRect(obs.x, obs.y + 8, 4, 8);
        ctx.fillRect(obs.x + 18, obs.y, 7, obs.height);
        ctx.fillRect(obs.x + 25, obs.y + 12, 5, 4);
        ctx.fillRect(obs.x + 26, obs.y + 7, 4, 9);
      } else if (obs.type === 'cactus_large') {
        ctx.fillRect(obs.x + 8, obs.y, 9, obs.height);
        ctx.fillRect(obs.x + 1, obs.y + 12, 7, 5);
        ctx.fillRect(obs.x + 1, obs.y + 6, 5, 11);
        ctx.fillRect(obs.x + 17, obs.y + 18, 7, 5);
        ctx.fillRect(obs.x + 19, obs.y + 10, 5, 13);
      }
      ctx.restore();
    };

    const drawCampusCone = (obs) => {
      ctx.save();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width, obs.y + obs.height - 4);
      ctx.lineTo(obs.x, obs.y + obs.height - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(obs.x + 6, obs.y + 10, obs.width - 12, 4);
      ctx.fillRect(obs.x + 4, obs.y + 18, obs.width - 8, 4);

      ctx.fillStyle = '#ea580c';
      ctx.fillRect(obs.x - 2, obs.y + obs.height - 4, obs.width + 4, 4);
      ctx.restore();
    };

    const drawPterodactyl = (obs) => {
      ctx.save();
      ctx.fillStyle = '#fbbf24';

      ctx.fillRect(obs.x + 12, obs.y + 10, 18, 7);
      ctx.fillRect(obs.x + 28, obs.y + 6, 12, 6);
      ctx.fillRect(obs.x + 38, obs.y + 8, 4, 3);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(obs.x + 32, obs.y + 7, 2, 2);
      ctx.fillStyle = '#fbbf24';

      if (obs.wingState === 0) {
        ctx.beginPath();
        ctx.moveTo(obs.x + 14, obs.y + 10);
        ctx.lineTo(obs.x + 6, obs.y - 4);
        ctx.lineTo(obs.x + 24, obs.y + 10);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(obs.x + 14, obs.y + 12);
        ctx.lineTo(obs.x + 6, obs.y + 24);
        ctx.lineTo(obs.x + 24, obs.y + 12);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const drawClouds = (clouds) => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 14, 0, Math.PI * 2);
        ctx.arc(cloud.x + 12, cloud.y - 6, 12, 0, Math.PI * 2);
        ctx.arc(cloud.x + 26, cloud.y, 14, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };

    const drawStars = (stars) => {
      ctx.save();
      stars.forEach(star => {
        const alpha = 0.3 + 0.4 * Math.sin(star.blink);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });
      ctx.restore();
    };

    const drawGround = (width, groundY, pebbles) => {
      ctx.save();
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
      pebbles.forEach(p => {
        ctx.fillRect(p.x, p.y, p.size * 2, p.size);
      });

      ctx.restore();
    };

    // Main animation loop
    const render = (time) => {
      const g = gameRef.current;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const groundY = g.groundY || height - 35;

      ctx.clearRect(0, 0, width, height);

      // Night mode stars animation
      g.stars.forEach(s => {
        s.blink += 0.04;
      });
      drawStars(g.stars);

      // Clouds movement
      g.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -60) {
          c.x = width + 40;
          c.y = 15 + Math.random() * 30;
        }
      });
      drawClouds(g.clouds);

      // Ground render & shift
      if (g.state === 'PLAYING') {
        g.groundPebbles.forEach(p => {
          p.x -= g.speed;
          if (p.x < -10) {
            p.x = width + Math.random() * 20;
            p.y = groundY + 4 + Math.random() * 16;
          }
        });
      }
      drawGround(width, groundY, g.groundPebbles);

      // State Handling
      if (g.state === 'PLAYING') {
        const delta = Math.min((time - (g.lastFrameTime || time)) / 16.66, 2.5);
        g.lastFrameTime = time;

        g.distance += g.speed * delta;
        const currentScore = Math.floor(g.distance / 10);

        if (currentScore > 0 && Math.floor(currentScore / 100) > Math.floor(g.score / 100)) {
          sounds.playScore();
          g.flashScore = Math.floor(currentScore / 100) * 100;
          setIsMilestoneFlash(true);
          setTimeout(() => setIsMilestoneFlash(false), 1000);
        }
        g.score = currentScore;
        setScore(currentScore);

        if (g.speed < g.maxSpeed) {
          g.speed += 0.0012 * delta;
        }

        // Dino Physics
        g.dino.y += g.dino.vy * delta;
        g.dino.vy += g.gravity * delta;

        if (g.dino.y >= groundY - g.dino.height) {
          g.dino.y = groundY - g.dino.height;
          g.dino.vy = 0;
          g.dino.isGrounded = true;
        }

        // Leg step animation
        g.dino.legTimer += delta;
        if (g.dino.legTimer > (g.speed > 9 ? 4 : 6)) {
          g.dino.legStep = (g.dino.legStep + 1) % 2;
          g.dino.legTimer = 0;
        }

        // Obstacles generation
        g.nextObstacleTimer -= delta;
        if (g.nextObstacleTimer <= 0) {
          g.obstacles.push(spawnObstacle(width, groundY, g.speed));
          const minGap = Math.max(50, 100 - (g.speed * 2.5));
          const maxGap = Math.max(90, 170 - (g.speed * 3));
          g.nextObstacleTimer = minGap + Math.random() * (maxGap - minGap);
        }

        // Obstacles update & collision
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          const obsSpeed = (g.speed + (obs.extraSpeed || 0)) * delta;
          obs.x -= obsSpeed;

          if (obs.type === 'pterodactyl') {
            obs.wingTimer = (obs.wingTimer || 0) + delta;
            if (obs.wingTimer > 8) {
              obs.wingState = (obs.wingState === 0 ? 1 : 0);
              obs.wingTimer = 0;
            }
          }

          if (checkCollision(g.dino, obs, g.ducking)) {
            g.state = 'GAMEOVER';
            sounds.playHit();
            setGameState('GAMEOVER');

            if (g.score > highScore) {
              setHighScore(g.score);
              try {
                localStorage.setItem('campusride_trex_highscore', g.score.toString());
              } catch {
                // Storage fallback
              }
            }
            if (onGameOverScore) {
              onGameOverScore(g.score);
            }
            break;
          }

          if (obs.x + obs.width < -30) {
            g.obstacles.splice(i, 1);
          }
        }
      }

      // Draw Obstacles
      g.obstacles.forEach(obs => {
        if (obs.type.startsWith('cactus')) {
          drawCactus(obs);
        } else if (obs.type === 'campus_cone') {
          drawCampusCone(obs);
        } else if (obs.type === 'pterodactyl') {
          drawPterodactyl(obs);
        }
      });

      // Draw Dino
      drawDino(
        g.dino.x,
        g.dino.y,
        g.dino.isGrounded,
        g.ducking,
        g.dino.legStep,
        g.state === 'GAMEOVER'
      );

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setupCanvas);
    };
  }, [highScore, onGameOverScore]);

  return (
    <div className="trex-container">
      {/* Game Header / HUD Bar */}
      <div className="trex-hud">
        <div className="trex-badge">
          <span className="trex-pulse-dot"></span>
          <span>CAMPUS RUNNER 404</span>
        </div>

        <div className="trex-scores">
          <span className="trex-hi-score">
            HI {highScore.toString().padStart(5, '0')}
          </span>
          <span className={`trex-current-score ${isMilestoneFlash ? 'milestone-flash' : ''}`}>
            {score.toString().padStart(5, '0')}
          </span>
        </div>

        <div className="trex-controls-top">
          <button
            className="trex-hud-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"/></svg>
            )}
          </button>
          {gameState === 'PLAYING' && (
            <button
              className="trex-hud-btn"
              onClick={togglePause}
              title="Pause Game (P)"
              aria-label="Pause"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Area with overlays */}
      <div className="trex-canvas-wrapper" onClick={doJump}>
        <canvas ref={canvasRef} className="trex-canvas" />

        {/* Start / Idle Overlay */}
        {gameState === 'IDLE' && (
          <div className="trex-overlay">
            <div className="trex-overlay-content">
              <div className="trex-play-icon">▶</div>
              <h3>Press <span className="kbd-badge">SPACE</span> or Tap to Start</h3>
              <p>Jump over campus cones &amp; cacti, duck under pterodactyls!</p>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {gameState === 'PAUSED' && (
          <div className="trex-overlay">
            <div className="trex-overlay-content">
              <h3>GAME PAUSED</h3>
              <p>Press <span className="kbd-badge">P</span> or tap anywhere to resume</p>
              <button
                className="btn btn-student"
                style={{ marginTop: '12px' }}
                onClick={(e) => { e.stopPropagation(); togglePause(); }}
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'GAMEOVER' && (
          <div className="trex-overlay gameover-overlay">
            <div className="trex-overlay-content">
              <div className="gameover-title">G A M E &nbsp; O V E R</div>
              <div className="gameover-score-detail">
                <span>Final Score: <strong>{score}</strong></span>
                {score >= highScore && score > 0 && (
                  <span className="new-high-badge">🏆 New High Score!</span>
                )}
              </div>
              <button
                className="trex-restart-btn"
                onClick={(e) => { e.stopPropagation(); startGame(); }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Play Again (Space)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interactive Controls for Mobile / Mouse */}
      <div className="trex-controls-bottom">
        <div className="trex-hint-text">
          <span className="key-hint"><kbd>Space</kbd> / <kbd>▲</kbd> Jump</span>
          <span className="key-hint"><kbd>▼</kbd> Duck</span>
          <span className="key-hint"><kbd>P</kbd> Pause</span>
        </div>

        <div className="trex-mobile-touch-buttons">
          <button
            type="button"
            className="touch-btn touch-btn-jump"
            onPointerDown={(e) => { e.preventDefault(); doJump(); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            <span>JUMP</span>
          </button>
          <button
            type="button"
            className="touch-btn touch-btn-duck"
            onPointerDown={(e) => { e.preventDefault(); doDuck(true); }}
            onPointerUp={(e) => { e.preventDefault(); doDuck(false); }}
            onPointerLeave={() => doDuck(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
            <span>DUCK</span>
          </button>
        </div>
      </div>
    </div>
  );
}
