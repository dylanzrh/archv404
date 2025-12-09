import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------
// Constants / Config
// ---------------------------------
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

// Optimized background + upcoming flyer (Cloudinary transforms)
const BG_IMAGE_SRC =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_2400/v1763336289/IMG_5984_wjkvk6.jpg';

const UPCOMING_FLYER_SRC =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1600/v1765023902/AR4_Instagram-Post_251203_l5i1md.png';

// ABOUT text
const ABOUT_TEXT =
  'ARCHIVE 404 IS A ZURICH-BASED EVENT LABEL CRAFTING CAREFULLY DESIGNED EXPERIENCES WHERE MUSIC, LIGHT AND SPACE CREATE IMMERSIVE MOMENTS. ITS NAME REINTERPRETS A DIGITAL ERROR AS AN INVITATION TO RECONNECT THROUGH PEOPLE AND SOUND. BY BRINGING TOGETHER RESPECTED INTERNATIONAL ARTISTS AND SOME OF THE MOST PROMISING LOCAL TALENTS, ARCHIVE 404 CREATES A DISTINCT ENERGY THAT FEELS CONTEMPORARY YET TIMELESS.';

const PAST_FLYERS = [
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060268/archive404_251025_post_yus7xj.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060242/archive03102025_post_eptqbf.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060222/ARCHIVE404_06082025_Palm3_wjeh8o.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060209/ARCHIVE404_06082025_Soluna_zv1cfx.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060195/ARCHIVE404_04072025_POST_ptktcy.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060161/ARCHIVE404_02052025_POST01_ly44jq.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_1400/v1763060124/ARCHIVE404_280225_POST03_LOGO_nqcgah.jpg',
];

const ARTISTS = [
  'ANCHI',
  'ARWIN AZIZ',
  'AXEL NORD',
  'BOYSDONTCRY',
  'CALI:BER',
  'CAMILLO',
  'DARREN',
  'DE:AN',
  'DEBARRO',
  'DANGEL TWINS',
  'DYZEN',
  'FELIX DE LEON',
  'GIANNI',
  'HEUER',
  'HOMEOFFICE',
  'JOSEPH',
  'KASSETTE',
  'LOU COMBO',
  'PAUL ALMQVIST',
  'RUBEN SCORZA',
  'SAM MADI',
  'SEBASTIAN KONRAD',
  'TIM ENGELHARDT',
];

const HIGHLIGHT_ARTISTS = new Set([
  'DANGEL TWINS',
  'DYZEN',
  'SEBASTIAN KONRAD',
  'TIM ENGELHARDT',
]);

type Page = 'home' | 'upcoming' | 'past' | 'artists' | 'about';

export default function Preview() {
  const [page, setPage] = useState<Page>('home');
  const [isEntering, setIsEntering] = useState(true);
  const [logoAnimKey, setLogoAnimKey] = useState(0);
  const [bgZoom, setBgZoom] = useState(1);
  const scrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inputFocusedRef = useRef(false);

  const [rowVisible, setRowVisible] = useState(() =>
    Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
  );
  const [artistVisible, setArtistVisible] = useState(ARTISTS.map(() => false));

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artistRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // ---------------------------------
  // Helper: Smooth Reset Scroll (mobile-safe)
  // ---------------------------------
  const resetScrollToTop = () => {
    if (typeof window === 'undefined') return;

    // Run after layout updates (fixes mobile Safari)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // Hard reset for iOS Safari
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  // ---------------------------------
  // Page Transition Handler
  // ---------------------------------
  const handleNavigate = (next: Page) => {
    if (next === page) return;

    if (next === 'past') {
      setRowVisible(
        Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
      );
    }
    if (next === 'artists') {
      setArtistVisible(ARTISTS.map(() => false));
    }

    setPage(next);
    setLogoAnimKey((k) => k + 1);
    setIsEntering(true);

    requestAnimationFrame(() => {
      setIsEntering(false);
    });

    resetScrollToTop();
  };

  // ---------------------------------
  // Intro Animation
  // ---------------------------------
  useEffect(() => {
    setIsEntering(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsEntering(false));
    });
  }, []);

  // ---------------------------------
  // Background Parallax
  // ---------------------------------
  useEffect(() => {
    const maxScroll = 600;
    const maxZoom = 1.08;

    const calcZoom = (y: number) => {
      const clamped = Math.min(Math.max(y, 0), maxScroll);
      return 1 + (clamped / maxScroll) * (maxZoom - 1);
    };

    const tick = () => {
      const target = calcZoom(scrollYRef.current);

      setBgZoom((prev) => {
        const eased = prev + (target - prev) * 0.08;
        if (Math.abs(eased - target) < 0.001) {
          rafRef.current = null;
          return target;
        }
        rafRef.current = requestAnimationFrame(tick);
        return eased;
      });
    };

    const handleScroll = () => {
      if (inputFocusedRef.current) return;
      scrollYRef.current = window.scrollY || 0;

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ---------------------------------
  // Lazy reveal: Past flyers
  // ---------------------------------
  useEffect(() => {
    if (page !== 'past') return;

    const observer = new IntersectionObserver(
      (entries) => {
        setRowVisible((prev) => {
          const next = [...prev];
          let changed = false;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const idx = Number((entry.target as HTMLElement).dataset.rowIndex);
            if (!next[idx]) {
              next[idx] = true;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { threshold: 0.1 }
    );

    rowRefs.current.forEach((row, idx) => {
      if (!row) return;
      row.dataset.rowIndex = String(idx);
      observer.observe(row);
    });

    return () => observer.disconnect();
  }, [page]);

  // ---------------------------------
  // Lazy reveal: Artist list
  // ---------------------------------
  useEffect(() => {
    if (page !== 'artists') return;

    const observer = new IntersectionObserver(
      (entries) => {
        setArtistVisible((prev) => {
          const next = [...prev];
          let changed = false;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const idx = Number((entry.target as HTMLElement).dataset.artistIndex);
            if (!next[idx]) {
              next[idx] = true;
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      },
      { threshold: 0.1 }
    );

    artistRefs.current.forEach((el, idx) => {
      if (!el) return;
      el.dataset.artistIndex = String(idx);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [page]);

  // ---------------------------------
  // Newsletter Submit
  // ---------------------------------
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsSubmittingNewsletter(true);
    setNewsletterMessage(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });

      if (!res.ok) throw new Error();
      setNewsletterMessage('WELCOME TO THE ARCHIVE FAMILY.');
      setNewsletterEmail('');
    } catch {
      setNewsletterMessage('SOMETHING WENT WRONG. PLEASE TRY AGAIN.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  // ---------------------------------
  // Upcoming Render
  // ---------------------------------
  const renderUpcoming = () => (
    <section className="section">
      <div className="upcoming">
        <div className="upcoming-item">
          <p className="upcoming-title">DEC 27 ST. MORITZ</p>

          <div className="upcoming-actions">
            <button
              type="button"
              className="newsletter-btn upcoming-res-btn"
              onClick={() =>
                window.open('https://www.mrsamigo.com/samigo-fuel', '_blank')
              }
            >
              RESERVATIONS
            </button>
          </div>

          <div className="upcoming-flyer-wrapper">
            <img
              src={UPCOMING_FLYER_SRC}
              alt="ARCHIVE 404 · St. Moritz · 27 December"
              className="upcoming-flyer"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div className="date-divider" />
        <p>JAN 23 ZURICH</p>
        <p className="tba">TBA</p>

        <div className="date-divider" />
        <p>FEB 27 ZURICH</p>
        <p className="tba">TBA</p>
      </div>

      <div className="newsletter">
        <p className="newsletter-label">FOR THOSE WHO KNOW.</p>

        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            placeholder="EMAIL"
            required
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            onFocus={() => (inputFocusedRef.current = true)}
            onBlur={() => (inputFocusedRef.current = false)}
            className="newsletter-input"
          />

          <button type="submit" className="newsletter-btn" disabled={isSubmittingNewsletter}>
            {isSubmittingNewsletter ? 'SENDING…' : 'JOIN'}
          </button>
        </form>

        {newsletterMessage && <p className="newsletter-message">{newsletterMessage}</p>}
      </div>

      <div className="homebtn-wrapper">
        <button className="homebtn" onClick={() => handleNavigate('home')}>
          HOME
        </button>
      </div>
    </section>
  );

  // ---------------------------------
  // Past Render
  // ---------------------------------
  const renderPast = () => {
    const rows = [];
    for (let i = 0; i < PAST_FLYERS.length; i += 2) {
      rows.push(PAST_FLYERS.slice(i, i + 2));
    }

    return (
      <section className="section section-past">
        <div className="flyer-grid">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              ref={(el) => (rowRefs.current[rowIndex] = el)}
              data-row-index={rowIndex}
              className={`flyer-row ${rowVisible[rowIndex] ? 'flyer-row-visible' : ''}`}
              style={{ transitionDelay: `${rowIndex * 80}ms` }}
            >
              {row.map((src, i) => (
                <div className="flyer-cell" key={i}>
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="homebtn-wrapper">
          <button className="homebtn" onClick={() => handleNavigate('home')}>
            HOME
          </button>
        </div>
      </section>
    );
  };

  // ---------------------------------
  // Icon Bar
  // ---------------------------------
  const IconBar = () => (
    <div className="icons">
      <a href={WHATSAPP_URL} target="_blank" className="iconlink">
        <svg width="22" height="22" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="1.4" fill="none" />
        </svg>
      </a>
      <span className="dot">·</span>
      <a href={INSTAGRAM_URL} target="_blank" className="iconlink">
        <svg width="22" height="22" stroke="currentColor" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4.5" strokeWidth="1.4" />
        </svg>
      </a>
      <span className="dot">·</span>
      <a href={MAILTO_URL} target="_blank" className="iconlink">
        <svg width="22" height="22" stroke="currentColor" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.4" />
        </svg>
      </a>
    </div>
  );

  const tagClass = isEntering ? 'tag-hidden' : 'tag-visible';
  const navClass = page === 'home' ? (isEntering ? 'fade-hidden' : 'fade-visible') : 'fade-hidden';
  const footerFadeClass = isEntering ? 'footer-hidden' : 'footer-visible';
  const panelClass = isEntering ? 'panel-intro' : 'panel-steady';

  // ---------------------------------
  // JSX Return
  // ---------------------------------
  return (
    <>
      <div className="root" style={{ fontFamily: FONT_STACK }}>
        <div className="bg-layer" style={{ transform: `scale(${bgZoom})` }} />

        <div
          className={`center ${page === 'home' ? 'center-home' : 'center-subpage'} ${
            page === 'upcoming' ? 'center-upcoming' : ''
          } ${page === 'about' ? 'center-about' : ''}`}
        >
          <h1
            key={logoAnimKey}
            className="logo-main logo-animate"
            onClick={() => handleNavigate('home')}
          >
            {LOGO_TEXT}
          </h1>

          <p className={`tag ${tagClass}`}>THE ART OF SOUND</p>

          {page === 'home' && (
            <nav aria-label="Primary" className={`nav ${navClass}`}>
              <button className="navbtn" onClick={() => handleNavigate('upcoming')}>
                UPCOMING
              </button>
              <button className="navbtn" onClick={() => handleNavigate('past')}>
                PAST
              </button>
              <button className="navbtn" onClick={() => handleNavigate('artists')}>
                ARTISTS
              </button>
              <button className="navbtn" onClick={() => handleNavigate('about')}>
                ABOUT
              </button>
            </nav>
          )}

          <main className={`panel ${panelClass}`}>
            {page === 'about' && (
              <section className="section about-section">
                <article className="about">
                  <p className="about-block">{ABOUT_TEXT}</p>
                </article>
                <div className="homebtn-wrapper">
                  <button className="homebtn" onClick={() => handleNavigate('home')}>
                    HOME
                  </button>
                </div>
              </section>
            )}

            {page === 'upcoming' && renderUpcoming()}
            {page === 'past' && renderPast()}

            {page === 'artists' && (
              <section className="section">
                <div className="artists-list">
                  <p className="az-label">A–Z</p>
                  {ARTISTS.sort().map((artist, idx) => (
                    <div key={artist} className="artist-block">
                      <p
                        ref={(el) => (artistRefs.current[idx] = el)}
                        className={`artist-name ${
                          artistVisible[idx] ? 'artist-name-visible' : ''
                        } ${HIGHLIGHT_ARTISTS.has(artist) ? 'artist-name-highlight' : ''}`}
                      >
                        {artist}
                      </p>
                      {artist === 'BOYSDONTCRY' && <p className="artist-resident">RESIDENT</p>}
                    </div>
                  ))}
                </div>

                <div className="homebtn-wrapper">
                  <button className="homebtn" onClick={() => handleNavigate('home')}>
                    HOME
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className={`footer ${footerFadeClass}`}>
          <IconBar />
        </footer>

        {/* --- CSS stays unchanged except classes relevant to animation --- */}
        <style>{`
:root { color-scheme: dark; }
html, body {
  margin: 0;
  padding: 0;
  background: #000;
  scroll-behavior: smooth;
  overscroll-behavior: none;
}
.root { position: relative; min-height: 100vh; color: #fff; overflow: hidden; }

/* BG */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(0,0,0,0.34), rgba(0,0,0,0.44)),
    url('${BG_IMAGE_SRC}');
  background-size: cover;
  background-position: center;
  will-change: transform;
  transition: transform .18s ease-out;
}

/* Layout */
.center { max-width: 900px; padding: 6vh 24px 8vh; position: relative; z-index: 1; text-align: center; }

.logo-main { font-size: clamp(36px, 12vw, 140px); text-transform: uppercase; font-weight: 700; }

.logo-animate { animation: logo-intro .6s ease forwards; }

.tag { margin-top: 20px; margin-bottom: 40px; letter-spacing: .28em; text-transform: uppercase; transition: .6s ease; }
.tag-hidden { opacity: 0; transform: translateY(32px); }
.tag-visible { opacity: .95; transform: translateY(0); }

.panel-intro { opacity: 0; transform: translateY(32px); }
.panel-steady { opacity: 1; transform: translateY(0); transition: .6s ease; }

/* etc — existing styles unchanged */
@keyframes logo-intro {
  from { opacity: 0; transform: translateY(-32px); }
  to { opacity: 1; transform: translateY(0); }
}
        `}</style>
      </div>
    </>
  );
}
