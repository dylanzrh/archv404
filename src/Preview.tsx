import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------
// Constants / Config
// ---------------------------------
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

// Background zoom tuning
const BASE_ZOOM = 1.02;
const MAX_ZOOM = 1.1;

// Optimised upcoming flyer (same image, Cloudinary smart format + quality + width)
const UPCOMING_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1765023902/AR4_Instagram-Post_251203_l5i1md.png';

// ABOUT text as a single block paragraph
const ABOUT_TEXT: string =
  'ARCHIVE 404 IS A ZURICH-BASED EVENT LABEL CRAFTING CAREFULLY DESIGNED EXPERIENCES WHERE MUSIC, LIGHT AND SPACE CREATE IMMERSIVE MOMENTS. ITS NAME REINTERPRETS A DIGITAL ERROR AS AN INVITATION TO RECONNECT THROUGH PEOPLE AND SOUND. BY BRINGING TOGETHER RESPECTED INTERNATIONAL ARTISTS AND SOME OF THE MOST PROMISING LOCAL TALENTS, ARCHIVE 404 CREATES A DISTINCT ENERGY THAT FEELS CONTEMPORARY YET TIMELESS.';

const PAST_FLYERS: string[] = [
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060268/archive404_251025_post_yus7xj.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060242/archive03102025_post_eptqbf.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060222/ARCHIVE404_06082025_Palm3_wjeh8o.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060209/ARCHIVE404_06082025_Soluna_zv1cfx.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060195/ARCHIVE404_04072025_POST_ptktcy.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060161/ARCHIVE404_02052025_POST01_ly44jq.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060124/ARCHIVE404_280225_POST03_LOGO_nqcgah.jpg',
];

const ARTISTS: string[] = [
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

const HIGHLIGHT_ARTISTS = new Set<string>([
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

  // Background zoom (smooth)
  const [bgZoom, setBgZoom] = useState(BASE_ZOOM);

  const scrollYRef = useRef(0);
  const inputFocusedRef = useRef(false);

  const [rowVisible, setRowVisible] = useState<boolean[]>(() =>
    Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
  );
  const [artistVisible, setArtistVisible] = useState<boolean[]>(() =>
    ARTISTS.map(() => false)
  );

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artistRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const nav = useMemo(
    () =>
      [
        ['UPCOMING', 'upcoming'],
        ['PAST', 'past'],
        ['ARTISTS', 'artists'],
        ['ABOUT', 'about'],
      ] as const,
    []
  );

  const playIntro = () => {
    setIsEntering(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsEntering(false);
      });
    });
  };

  useEffect(() => {
    playIntro();
  }, []);

  // Preload upcoming flyer
  useEffect(() => {
    const img = new Image();
    img.src = UPCOMING_FLYER_URL;
  }, []);

  // Smooth background zoom on scroll (single smoothing system: RAF)
  useEffect(() => {
    const maxScroll = 600;

    const calcZoom = (scrollY: number) => {
      const clamped = Math.min(Math.max(scrollY, 0), maxScroll);
      return BASE_ZOOM + (clamped / maxScroll) * (MAX_ZOOM - BASE_ZOOM);
    };

    const currentZoomRef = { current: BASE_ZOOM };
    const targetZoomRef = { current: BASE_ZOOM };
    let rafId: number | null = null;

    const animate = () => {
      rafId = null;

      const current = currentZoomRef.current;
      const target = targetZoomRef.current;

      const next = current + (target - current) * 0.09;

      currentZoomRef.current = next;
      setBgZoom(next);

      if (Math.abs(target - next) > 0.0005) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    const requestAnimate = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      if (inputFocusedRef.current) return;

      const y = window.scrollY || window.pageYOffset || 0;
      scrollYRef.current = y;

      targetZoomRef.current = calcZoom(y);
      requestAnimate();
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (page !== 'past') return;
    if (!rowRefs.current.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setRowVisible((prev) => {
          const next = [...prev];
          let changed = false;

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idxAttr = (entry.target as HTMLElement).dataset.rowIndex;
            const idx = idxAttr ? parseInt(idxAttr, 10) : -1;
            if (idx >= 0 && !next[idx]) {
              next[idx] = true;
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      },
      { threshold: 0.1 }
    );

    rowRefs.current.forEach((row, index) => {
      if (row) {
        (row as HTMLElement).dataset.rowIndex = String(index);
        observer.observe(row);
      }
    });

    return () => observer.disconnect();
  }, [page]);

  useEffect(() => {
    if (page !== 'artists') return;
    if (!artistRefs.current.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setArtistVisible((prev) => {
          const next = [...prev];
          let changed = false;

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idxAttr = (entry.target as HTMLElement).dataset.artistIndex;
            const idx = idxAttr ? parseInt(idxAttr, 10) : -1;
            if (idx >= 0 && !next[idx]) {
              next[idx] = true;
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      },
      { threshold: 0.1 }
    );

    artistRefs.current.forEach((el, index) => {
      if (el) {
        (el as HTMLElement).dataset.artistIndex = String(index);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [page]);

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

      if (!res.ok) throw new Error('Request failed');

      setNewsletterMessage('WELCOME TO THE ARCHIVE FAMILY.');
      setNewsletterEmail('');
    } catch {
      setNewsletterMessage('SOMETHING WENT WRONG. PLEASE TRY AGAIN.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  // Mobile-safe scroll reset for each page (no layout change)
  const resetScrollToTop = () => {
    if (typeof window === 'undefined') return;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

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
    playIntro();

    setBgZoom(BASE_ZOOM);
    resetScrollToTop();
  };

  const renderUpcoming = () => (
    <section className="section">
      <div className="upcoming">
        {/* ST. MORITZ BLOCK */}
        <div className="upcoming-item">
          <p className="upcoming-title" style={{ animationDelay: '0ms' }}>
            DEC 27 ST. MORITZ
          </p>

          <div className="upcoming-actions">
            <button
              type="button"
              className="newsletter-btn upcoming-res-btn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(
                    'https://www.mrsamigo.com/samigo-fuel',
                    '_blank',
                    'noopener,noreferrer'
                  );
                }
              }}
            >
              RESERVATIONS
            </button>
          </div>

          {/* Flyer below RESERVATIONS, fixed width 25ch */}
          <div className="upcoming-flyer-wrapper">
            <img
              src={UPCOMING_FLYER_URL}
              alt="ARCHIVE 404 · St. Moritz · 27 December"
              className="upcoming-flyer"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="date-divider" aria-hidden="true" />

        <p style={{ animationDelay: '80ms' }}>JAN 23 ZURICH</p>
        <p className="tba" style={{ animationDelay: '120ms' }}>
          TBA
        </p>

        <div className="date-divider" aria-hidden="true" />

        <p style={{ animationDelay: '160ms' }}>FEB 27 ZURICH</p>
        <p className="tba" style={{ animationDelay: '200ms' }}>
          TBA
        </p>
      </div>

      <div className="newsletter">
        <p className="newsletter-label">FOR THOSE WHO KNOW.</p>

        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            required
            placeholder="EMAIL"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            onFocus={() => {
              inputFocusedRef.current = true;
            }}
            onBlur={() => {
              inputFocusedRef.current = false;
            }}
            className="newsletter-input"
          />
          <button
            type="submit"
            className="newsletter-btn"
            disabled={isSubmittingNewsletter}
          >
            {isSubmittingNewsletter ? 'SENDING…' : 'JOIN'}
          </button>
        </form>
        {newsletterMessage && (
          <p className="newsletter-message">{newsletterMessage}</p>
        )}
      </div>

      <div className="homebtn-wrapper">
        <button className="homebtn" onClick={() => handleNavigate('home')}>
          HOME
        </button>
      </div>
    </section>
  );

  const renderPast = () => {
    const rows: string[][] = [];
    for (let i = 0; i < PAST_FLYERS.length; i += 2) {
      rows.push(PAST_FLYERS.slice(i, i + 2));
    }

    return (
      <section className="section section-past">
        <div className="flyer-grid">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flyer-row ${rowVisible[rowIndex] ? 'flyer-row-visible' : ''}`}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              data-row-index={rowIndex}
              style={{ transitionDelay: `${rowIndex * 80}ms` }}
            >
              {row.map((src, index) => (
                <div className="flyer-cell" key={index}>
                  <img
                    src={src}
                    alt={`ARCHIVE 404 PAST EVENT ${rowIndex * 2 + index + 1}`}
                    decoding="async"
                    loading="lazy"
                  />
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

  const IconBar = () => (
    <div className="icons">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join WhatsApp Community"
        className="iconlink"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path
            d="M12 2.75C7.17 2.75 3.25 6.67 3.25 11.5c0 1.86.53 3.57 1.52 5.03L4 21l4.62-.78A8.6 8.6 0 0 0 12 20.25c4.83 0 8.75-3.92 8.75-8.75S16.83 2.75 12 2.75Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.05 8.7c.1-.24.16-.39.16-.39.08-.18.14-.27.33-.3.2-.03.33-.01.48.2.15.2.63.77.69.83.06.07.1.16.03.3-.07.13-.11.2-.21.32-.1.12-.21.26-.3.35-.1.1-.2.21-.09.4.12.2.52.86 1.21 1.39.84.66 1.54.86 1.77.96.23.1.37.08.5-.06.15-.16.52-.6.7-.81.18-.22.35-.18.58-.1.24.07 1.51.71 1.51.71.22.09.37.15.4.24.05.14.05.81-.19 1.28-.24.47-.72.96-1.23 1.01-.51.05-1.37.01-2.29-.38-.92-.39-1.79-1.06-2.61-1.9-.82-.84-1.38-1.73-1.74-2.44-.36-.71-.53-1.32-.58-1.62-.05-.3-.05-.48-.05-.61 0-.13.05-.3.15-.54Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <span className="dot">·</span>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Instagram"
        className="iconlink"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <rect x="4" y="4" width="16" height="16" rx="4.5" ry="4.5" />
          <circle cx="12" cy="12" r="3.25" />
          <circle cx="17.2" cy="6.8" r="0.9" />
        </svg>
      </a>
      <span className="dot">·</span>
      <a
        href={MAILTO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Email Archive 404"
        className="iconlink"
        style={{ lineHeight: 0 }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
          <path
            d="M5 8.5 12 13l7-4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );

  const tagClass = isEntering ? 'tag-hidden' : 'tag-visible';

  // NAV: fade logic (HOME only), but keep it mounted. Off-home it's removed from flow (no layout change, fixes first-tap)
  const navClass =
    page === 'home'
      ? isEntering
        ? 'fade-hidden'
        : 'fade-visible'
      : 'fade-hidden';

  const navOffHomeClass = page === 'home' ? '' : 'nav-offhome';

  const footerFadeClass = isEntering ? 'footer-hidden' : 'footer-visible';
  const panelClass = isEntering ? 'panel-intro' : 'panel-steady';

  return (
    <>
      <div className="root" style={{ fontFamily: FONT_STACK }}>
        <div
          className="bg-layer"
          aria-hidden="true"
          style={{ transform: `scale(${bgZoom})` }}
        />

        <div
          className={`center ${page === 'home' ? 'center-home' : 'center-subpage'} ${
            page === 'upcoming' ? 'center-upcoming' : ''
          } ${page === 'about' ? 'center-about' : ''}`}
        >
          <h1
            key={logoAnimKey}
            className="logo-main logo-animate"
            onClick={() => handleNavigate('home')}
            style={{ cursor: 'pointer' }}
          >
            {LOGO_TEXT}
          </h1>

          <p className={`tag ${tagClass}`}>THE ART OF SOUND</p>

          {/* NAV kept mounted for smooth return to HOME; off-home removed from flow to match original layout */}
          <nav
            aria-label="Primary"
            className={`nav ${navClass} ${navOffHomeClass}`}
            style={{ pointerEvents: page === 'home' ? 'auto' : 'none' }}
          >
            {nav.map(([label, key]) => (
              <button
                key={label}
                onClick={() => handleNavigate(key as Page)}
                className="navbtn"
                tabIndex={page === 'home' ? 0 : -1}
                aria-hidden={page !== 'home'}
              >
                {label}
              </button>
            ))}
          </nav>

          <main className={`panel ${panelClass}`}>
            {page === 'about' && (
              <section className="section about-section">
                <article className="about">
                  <p className="about-block">{ABOUT_TEXT}</p>
                </article>
                <div className="homebtn-wrapper" style={{ marginTop: '40px' }}>
                  <button
                    className="homebtn"
                    onClick={() => handleNavigate('home')}
                  >
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
                  {ARTISTS.slice()
                    .sort()
                    .map((artist, index) => {
                      const isHighlight = HIGHLIGHT_ARTISTS.has(artist);
                      return (
                        <div key={artist} className="artist-block">
                          <p
                            className={`artist-name ${
                              artistVisible[index] ? 'artist-name-visible' : ''
                            } ${isHighlight ? 'artist-name-highlight' : ''}`}
                            ref={(el) => {
                              artistRefs.current[index] = el;
                            }}
                          >
                            {artist}
                          </p>
                          {artist === 'BOYSDONTCRY' && (
                            <p className="artist-resident">RESIDENT</p>
                          )}
                        </div>
                      );
                    })}
                </div>
                <div className="homebtn-wrapper">
                  <button
                    className="homebtn"
                    onClick={() => handleNavigate('home')}
                  >
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

        <style>{`
:root { color-scheme: dark; }
html, body {
  margin: 0;
  padding: 0;
  background: #000;
  font-family: ${FONT_STACK};
}
.root {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: #fff;
  overflow: hidden;
  padding-bottom: 0;
}

/* Fixed background image */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.44)),
    url('https://res.cloudinary.com/dsas5i0fx/image/upload/v1763336289/IMG_5984_wjkvk6.jpg');
  background-position: center center, center 48%;
  background-size: cover, 115%;
  background-repeat: no-repeat, no-repeat;
  transform-origin: center center;

  /* IMPORTANT: remove CSS transition; RAF handles smoothing */
  transition: none;

  /* helps smoothness */
  will-change: transform;
  transform: translateZ(0);
}

.center {
  text-align: center;
  max-width: 900px;
  padding: 6vh 24px 8vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80vh;
  opacity: 1;
  transition: opacity 0.32s ease;
  position: relative;
  z-index: 1;
}

.center-subpage {
  justify-content: flex-start;
  padding-top: 4vh;
  padding-bottom: 6vh;
  min-height: auto;
}
.center-about { padding-top: 8vh; }
.center-upcoming { padding-top: 14vh; padding-bottom: 4vh; }

.logo-main {
  margin: 0 auto;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 700;
  letter-spacing: -0.082em;
  text-transform: uppercase;
  line-height: 0.86;
  font-size: clamp(36px, 12vw, 140px);
}
.logo-animate {
  animation: logo-intro 0.6s ease forwards;
  will-change: transform, opacity;
}

.tag {
  margin-top: 20px;
  margin-bottom: 40px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-size: clamp(12px, 2.4vw, 16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.tag-hidden { opacity: 0; transform: translateY(32px); }
.tag-visible { opacity: 0.95; transform: translateY(0); }

.nav {
  position: relative;
  z-index: 10;
  margin-top: 32px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

/* Off-home: nav must take ZERO space (same as original conditional render),
   but stay mounted to avoid “pop” when returning home and to fix first-tap */
.nav-offhome {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: -9999px !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 0 !important;
  overflow: hidden

