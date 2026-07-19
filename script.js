// ============================================================
// DIVYA SHAKTI DARBAR — interactions
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header scroll state ---------- */
  const header = document.getElementById('siteHeader');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close the mobile menu when clicking anywhere outside it
  document.addEventListener('click', (e) => {
    const isOpen = mainNav.classList.contains('open');
    const clickedInsideNav = mainNav.contains(e.target);
    const clickedHamburger = hamburger.contains(e.target);
    if (isOpen && !clickedInsideNav && !clickedHamburger) {
      mainNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close the mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- Hero video: graceful fallback ---------- */
  // If the background video fails to load (e.g. src not reachable),
  // swap to the CSS flame-particle field so the header still feels alive.
  const heroSection = document.getElementById('home');
  const heroVideo = document.getElementById('heroVideo');

  if (heroSection) {
    const useFallback = () => heroSection.classList.add('no-video');

    if (heroVideo) {
      heroVideo.addEventListener('error', useFallback, true);
      // Some browsers block autoplay entirely; watch canplay/stalled too.
      let videoStarted = false;
      heroVideo.addEventListener('playing', () => { videoStarted = true; });
      setTimeout(() => {
        if (!videoStarted && heroVideo.readyState < 2) useFallback();
      }, 3500);
    } else {
      useFallback();
    }
  }

  /* ---------- Flame particle fields (hero + darshan) ---------- */
  function seedFlames(container, count) {
    if (!container) return;
    for (let i = 0; i < count; i++) {
      const flame = document.createElement('span');
      const left = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = 6 + Math.random() * 6;
      const drift = (Math.random() * 60 - 30) + 'px';
      flame.style.left = left + '%';
      flame.style.animationDelay = delay + 's';
      flame.style.animationDuration = duration + 's';
      flame.style.setProperty('--drift', drift);
      container.appendChild(flame);
    }
  }
  seedFlames(document.getElementById('flameField'), 26);
  seedFlames(document.getElementById('flameFieldSmall'), 14);

  /* ---------- Ambient ember canvas ---------- */
  const canvas = document.getElementById('emberCanvas');
  const ctx = canvas.getContext('2d');
  let embers = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makeEmber() {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 100,
      r: 1 + Math.random() * 2.2,
      speed: .3 + Math.random() * .6,
      drift: (Math.random() - .5) * .4,
      alpha: 0
    };
  }
  const EMBER_COUNT = window.innerWidth < 720 ? 18 : 34;
  for (let i = 0; i < EMBER_COUNT; i++) {
    const e = makeEmber();
    e.y = Math.random() * h;
    embers.push(e);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tick() {
    ctx.clearRect(0, 0, w, h);
    embers.forEach(e => {
      e.y -= e.speed;
      e.x += e.drift;
      e.alpha = Math.min(1, e.alpha + 0.01) * (e.y / h);
      if (e.y < -20) Object.assign(e, makeEmber());

      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
      grad.addColorStop(0, `rgba(240,207,110,${0.55 * e.alpha})`);
      grad.addColorStop(1, 'rgba(240,207,110,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!prefersReduced) requestAnimationFrame(tick);
  }
  if (!prefersReduced) requestAnimationFrame(tick);
  else ctx.clearRect(0, 0, w, h);

  /* ---------- Count-up stats on scroll into view ---------- */
  const stats = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1600;
      const start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target.toLocaleString('en-IN');
      }
      requestAnimationFrame(update);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  stats.forEach(s => statObserver.observe(s));

  /* ---------- Booking form (booking.html) ---------- */
  const form = document.getElementById('bookingForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = 'Kripya sabhi zaroori fields sahi tarah bharein.';
        status.style.color = '#ff8f8f';
        return;
      }
      const name = form.name.value.trim();
      status.style.color = 'var(--gold-bright)';
      status.textContent = `Dhanyavaad, ${name}! Aapka sankalp darj ho gaya hai — hamare acharya jald hi sampark karenge.`;
      form.reset();
    });
  }

  /* ---------- Contact form (contact.html) ---------- */
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');
  if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactStatus.textContent = 'Kripya sabhi zaroori fields sahi tarah bharein.';
        contactStatus.style.color = '#ff8f8f';
        return;
      }
      const name = contactForm.cname.value.trim();
      contactStatus.style.color = 'var(--gold-bright)';
      contactStatus.textContent = `Dhanyavaad, ${name}! Aapka sandesh mil gaya hai — hum jald hi sampark karenge.`;
      contactForm.reset();
    });
  }

  /* ---------- Gallery filter tabs + lightbox (gallery.html) ---------- */
  const galleryTabs = document.getElementById('galleryTabs');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (galleryTabs && galleryItems.length) {
    galleryTabs.querySelectorAll('.gallery-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        galleryTabs.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        galleryItems.forEach(item => {
          const match = filter === 'all' || item.dataset.cat === filter;
          item.classList.toggle('hidden', !match);
        });
      });
    });

    const lightbox = document.getElementById('lightbox');
    const lightboxIcon = document.getElementById('lightboxIcon');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const icon = item.querySelector('.gi-icon')?.textContent || '🕉️';
        const caption = item.querySelector('figcaption')?.textContent || '';
        lightboxIcon.textContent = icon;
        lightboxCaption.textContent = caption;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
    };
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

});
