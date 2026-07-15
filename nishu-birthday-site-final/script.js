/* =============================================================
   1. FLOATING HEART PARTICLES
   ============================================================= */
(function () {
  const field = document.getElementById('particleField');
  const glyphs = ['♥', '❤', '♡'];
  const count = window.innerWidth < 700 ? 12 : 22;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'particle';
    el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const size = 12 + Math.random() * 20;
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = size + 'px';
    el.style.setProperty('--drift-x', (Math.random() * 80 - 40) + 'px');
    el.style.animationDuration = (10 + Math.random() * 12) + 's';
    el.style.animationDelay = (Math.random() * 14) + 's';
    field.appendChild(el);
  }
})();

/* =============================================================
   2. SCROLL-TRIGGERED REVEAL ANIMATIONS
   ============================================================= */
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(item => io.observe(item));
})();

/* =============================================================
   3. COUNTDOWN TIMER — front-page hero, counts to July 17 (next occurrence)
   ============================================================= */
(function () {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  const countdownBox = document.getElementById('countdown');
  if (!countdownBox) return;

  function nextBirthday() {
    const now = new Date();
    let target = new Date(now.getFullYear(), 6, 17, 0, 0, 0); // July = month index 6
    if (target < now) {
      const isToday = now.getMonth() === 6 && now.getDate() === 17;
      if (!isToday) target = new Date(now.getFullYear() + 1, 6, 17, 0, 0, 0);
    }
    return target;
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const now = new Date();
    const isBirthdayToday = now.getMonth() === 6 && now.getDate() === 17;
    if (isBirthdayToday) {
      countdownBox.innerHTML = '<div class="countdown-arrived">✨ Today is the day — happy birthday, Nishu! ✨</div>';
      clearInterval(timer);
      return;
    }
    const diff = nextBirthday() - now;
    daysEl.textContent = pad(Math.floor(diff / 86400000));
    hoursEl.textContent = pad(Math.floor((diff / 3600000) % 24));
    minsEl.textContent = pad(Math.floor((diff / 60000) % 60));
    secsEl.textContent = pad(Math.floor((diff / 1000) % 60));
  }
  tick();
  const timer = setInterval(tick, 1000);
})();

/* =============================================================
   4. SYNTHESIZED BACKGROUND MUSIC
   A soft instrumental rendition of "Happy Birthday to You" (the
   melody is public domain) played with warm sine/triangle tones —
   generated in-browser, so no external audio file is required.
   ============================================================= */
const BirthdayMusic = (function () {
  let ctx, masterGain, filter, playing = false, loopTimer;

  // note, duration in beats (quarter note = 1 beat)
  const NOTES = {
    G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46
  };
  const TEMPO = 96; // bpm, unhurried and soft
  const beat = 60 / TEMPO;

  const melody = [
    ['G4', 0.5], ['G4', 0.5], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', 0.5], ['G4', 0.5], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', 0.5], ['G4', 0.5], ['G4', 1], ['C5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
    ['F5', 0.5], ['F5', 0.5], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]
  ];

  function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.06; // gentle, background-level volume
      filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800; // warm, no harsh highs
      masterGain.connect(filter);
      filter.connect(ctx.destination);
    }
  }

  function playNote(freq, startTime, dur) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(1, startTime + 0.06);       // soft attack
    gain.gain.linearRampToValueAtTime(0.7, startTime + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, startTime + dur);         // smooth release
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur + 0.05);
  }

  function scheduleLoop() {
    const now = ctx.currentTime + 0.1;
    let t = now;
    melody.forEach(([note, beats]) => {
      const dur = beats * beat * 0.92; // slight gap between notes for clarity
      playNote(NOTES[note] || NOTES.C5, t, dur);
      t += beats * beat;
    });
    const totalDuration = t - now;
    loopTimer = setTimeout(scheduleLoop, totalDuration * 1000 + 900); // small pause between loops
  }

  return {
    start() {
      ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (playing) return;
      playing = true;
      scheduleLoop();
    },
    stop() {
      playing = false;
      clearTimeout(loopTimer);
      if (masterGain) masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      setTimeout(() => { if (ctx && !playing) ctx.suspend(); }, 200);
    },
    resumeVolume() {
      if (masterGain) masterGain.gain.setTargetAtTime(0.06, ctx.currentTime, 0.05);
    }
  };
})();

(function () {
  const btn = document.getElementById('musicToggle');
  const playIcon = document.getElementById('playIcon');
  let playing = false;

  function setPlaying(next) {
    playing = next;
    if (playing) {
      BirthdayMusic.resumeVolume();
      BirthdayMusic.start();
      btn.classList.add('playing');
      playIcon.style.display = 'none';
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Pause background music');
    } else {
      BirthdayMusic.stop();
      btn.classList.remove('playing');
      playIcon.style.display = 'block';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Play background music');
    }
  }

  btn.addEventListener('click', () => setPlaying(!playing));
  window.__startBgMusic = function () { setPlaying(true); };
})();

/* =============================================================
   5. CONFETTI (shared by gate + heart-release)
   ============================================================= */
const Confetti = (function () {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#FFB6C1', '#C98E88', '#5C1A2B', '#D8B589', '#FBD6DD'];

  function burst(originXRatio = 0.5, originYRatio = 0.5, amount = 140) {
    const pieces = [];
    const originX = canvas.width * originXRatio;
    const originY = canvas.height * originYRatio;
    for (let i = 0; i < amount; i++) {
      pieces.push({
        x: originX, y: originY,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 1.6) * 14,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12
      });
    }
    let frame = 0;
    const maxFrames = 160;
    function animate() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.vy += 0.35;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }
  return { burst };
})();

/* =============================================================
   6. HERO — falling petals, mic-only blow detection (requested
   automatically on page load, never by clicking), and the
   video + canvas celebration sequence.
   ============================================================= */

/* ---- falling gold confetti + rose petals ---- */
(function () {
  const field = document.getElementById('fallingField');
  if (!field) return;
  const petalGlyphs = ['❀', '✿'];
  const count = window.innerWidth < 700 ? 24 : 42;

  for (let i = 0; i < count; i++) {
    const kind = Math.random();
    const el = document.createElement(kind < 0.4 ? 'span' : 'div');
    el.style.left = Math.random() * 100 + '%';
    el.style.setProperty('--sway', (Math.random() * 80 - 40) + 'px');
    el.style.animationDuration = (8 + Math.random() * 10) + 's';
    el.style.animationDelay = (Math.random() * 12) + 's';

    if (kind < 0.4) {
      el.className = 'fall-piece petal';
      el.textContent = petalGlyphs[Math.floor(Math.random() * petalGlyphs.length)];
      el.style.fontSize = (12 + Math.random() * 14) + 'px';
    } else if (kind < 0.75) {
      el.className = 'fall-piece confetti';
      const w = 5 + Math.random() * 5, h = w * 2.2;
      el.style.width = w + 'px';
      el.style.height = h + 'px';
    } else {
      el.className = 'fall-piece sparkle';
      el.textContent = '✦';
      el.style.fontSize = (8 + Math.random() * 10) + 'px';
    }
    field.appendChild(el);
  }
})();

/* ---- mic-only blow detection + celebration ---- */
(function () {
  const gate = document.getElementById('enteringGate');
  const flames = document.querySelectorAll('.flame');
  const smokes = document.querySelectorAll('.smoke');
  const instruction = document.getElementById('candleInstruction');
  const proceedBtn = document.getElementById('proceedBtn');
  const micMeter = document.getElementById('heroMicMeter');
  const micMeterFill = document.getElementById('heroMicMeterFill');
  const retryBtn = document.getElementById('micRetryBtn');
  const video = document.getElementById('celebration-video');
  const canvas = document.getElementById('celebration-canvas');
  if (!flames.length || !canvas) return;
  const ctx = canvas.getContext('2d');

  document.body.classList.add('gate-active');

  let blown = false;
  let audioCtx, analyser, micStream, rafId;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function stopListening() {
    if (rafId) cancelAnimationFrame(rafId);
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
  }

  function extinguishAllAtOnce() {
    if (blown) return;
    blown = true;
    flames.forEach(f => f.classList.add('out'));
    document.querySelectorAll('.flame-glow').forEach(g => g.classList.add('out'));
    smokes.forEach(s => s.classList.add('rising'));
    stopListening();
    micMeter.classList.remove('active');
    retryBtn.hidden = true;
    celebrate();
  }

  function celebrate() {
    // try the video celebration first; canvas always runs as a guaranteed layer
    video.currentTime = 0;
    video.play().then(() => {
      video.classList.add('playing');
    }).catch(() => { });
    runCelebrationCanvas();
    window.__startBgMusic && window.__startBgMusic();

    const heroTitle = gate.querySelector('.hero-title');
    const heroSub = gate.querySelector('.hero-sub');

    // ── 1. Swap the big title ──────────────────────────────────────
    setTimeout(() => {
      heroTitle.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      heroTitle.style.opacity = '0';
      heroTitle.style.transform = 'scale(0.8) translateY(12px)';
      setTimeout(() => {
        heroTitle.innerHTML =
          '🎉 Happy Birthday,<br><span class="gold bday-name">Nishu!</span> 🎂';
        heroTitle.classList.add('bday-revealed');
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'scale(1) translateY(0)';
      }, 420);
    }, 150);

    // ── 2. Swap the subtitle ───────────────────────────────────────
    setTimeout(() => {
      heroSub.style.transition = 'opacity 0.4s ease';
      heroSub.style.opacity = '0';
      setTimeout(() => {
        heroSub.innerHTML =
          'Happy Birthday to the cutest Panda in the world 🐼🎉';
        heroSub.style.opacity = '1';
      }, 400);
    }, 350);

    // ── 3. Instruction line + proceed button ───────────────────────
    setTimeout(() => {
      instruction.style.opacity = 0;
      setTimeout(() => {
        instruction.textContent =
          "Many many Happy returns of the day 🎂 Your future is brighter than any flame. " +
          "I'm very happy on this day and wish you Happy Birthday, Panda 🐼💖";
        instruction.style.opacity = 1;
      }, 400);
      proceedBtn.classList.add('shown');
    }, 600);

    // ── 4. Staggered confetti bursts across the screen ─────────────
    setTimeout(() => Confetti.burst(0.15, 0.25, 80), 300);
    setTimeout(() => Confetti.burst(0.85, 0.25, 80), 600);
    setTimeout(() => Confetti.burst(0.50, 0.10, 100), 900);
    setTimeout(() => Confetti.burst(0.25, 0.50, 65), 1200);
    setTimeout(() => Confetti.burst(0.75, 0.50, 65), 1500);
  }

  async function startMicListening() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let loudFrames = 0;

      instruction.textContent = 'Nishu, close your eyes, make a beautiful wish, and blow gently into your mic.';
      micMeter.classList.add('active');

      function loop() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        micMeterFill.style.width = Math.min(100, (avg / 90) * 100) + '%';

        if (avg > 42) { // volume threshold tuned for a soft blow
          loudFrames++;
        } else {
          loudFrames = Math.max(0, loudFrames - 1);
        }
        if (loudFrames > 8) {
          extinguishAllAtOnce();
          return;
        }
        rafId = requestAnimationFrame(loop);
      }
      loop();
    } catch (err) {
      // mic denied, unsupported, or blocked — offer a retry, never a click-to-blow bypass
      instruction.textContent = "couldn't access your mic — check permissions and try again";
      retryBtn.hidden = false;
    }
  }

  retryBtn.addEventListener('click', () => {
    retryBtn.hidden = true;
    startMicListening();
  });

  proceedBtn.addEventListener('click', () => {
    gate.classList.add('gate-closing');
    document.body.classList.remove('gate-active');
    setTimeout(() => { gate.hidden = true; }, 1150);
  });

  // request microphone access automatically as the page loads — no click required
  startMicListening();

  /* ---- canvas sparkle/confetti explosion behind the hero text ---- */
  function runCelebrationCanvas() {
    const colors = ['#D4AF37', '#E8CD7A', '#A6294B', '#C9576F', '#FFF7E0'];
    const particles = [];
    const originX = canvas.width / 2;
    const originY = canvas.height * 0.55;

    for (let i = 0; i < 160; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: 70 + Math.random() * 50,
        trail: Math.random() < 0.3
      });
    }

    let frame = 0;
    const maxFrames = 150;

    function animate() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.vy += 0.06; // gentle gravity
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const fade = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        if (p.trail) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * fade, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }
})();

/* =============================================================
   7. THE BIG WISH — release the heart into the sky
   ============================================================= */
(function () {
  const btn = document.getElementById('releaseHeartBtn');
  const wishMade = document.getElementById('wishMade');
  const instruction = document.getElementById('heartInstruction');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (btn.classList.contains('released')) return;
    btn.classList.add('released');
    instruction.textContent = 'Wish sent';
    wishMade.textContent = 'Happy birthday, Nishu. I hope this one finds you exactly as happy as you make me.';
    Confetti.burst(0.5, 0.55, 130);
  });
})();
