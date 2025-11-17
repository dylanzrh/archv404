import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------
// Constants / Config
// ---------------------------------
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

// ABOUT text as a single block paragraph
const ABOUT_TEXT: string =
  'ARCHIVE 404 IS A ZURICH-BASED EVENT LABEL CURATING CAREFULLY DESIGNED EXPERIENCES WHERE MUSIC, LIGHT AND SPACE COME TOGETHER. ITS NAME REINTERPRETS A DIGITAL ERROR AS AN INVITATION TO RECONNECT THROUGH PEOPLE AND SOUND. BY BRINGING TOGETHER SOUGHT-AFTER INTERNATIONAL ARTISTS AND SOME OF THE MOST PROMISING LOCAL TALENTS, ARCHIVE 404 CREATES AN ENERGY THAT FEELS CONTEMPORARY YET TIMELESS.';

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

// ---------------------------------
// Types
// ---------------------------------

type Page = 'home' | 'upcoming' | 'past' | 'artists' | 'about';

// ---------------------------------
// Main component
// ---------------------------------

export default function Preview() {
  const [page, setPage] = useState<Page>('home');

  // isEntering drives tag, nav, panel, footer
  const [isEntering, setIsEntering] = useState(true);
  // Separate key for logo so we can replay keyframe animation on every page switch
  const [logoAnimKey, setLogoAnimKey] = useState(0);
  // Background zoom factor for scroll effect
  const [bgZoom, setBgZoom] = useState(1);
  const scrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [rowVisible, setRowVisible] = useState<boolean[]>(() =>
    Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
  );
  const [artistVisible, setArtistVisible] = useState<boolean[]>(() =>
    ARTISTS.map(() => false)
  );

  // Newsletter state (UPCOMING page)
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

  // Helper: play the intro animation (tag/nav/panel/footer from bottom)
  const playIntro = () => {
    setIsEntering(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsEntering(false);
      });
    });
  };

  // Initial mount: run intro once
  useEffect(() => {
    playIntro();
  }, []);

  // Background zoom on scroll (subtle, smooth + eased)
  useEffect(() => {
    const maxZoom = 1.08; // slightly less aggressive for a refined look
    const maxScroll = 600; // more scroll distance for a slower zoom curve

    const calcZoom = (scrollY: number) => {
      const clamped = Math.min(Math.max(scrollY, 0), maxScroll);
      return 1 + (clamped / maxScroll) * (maxZoom - 1);
    };

    function tick() {
      const target = calcZoom(scrollYRef.current);

      setBgZoom((prev) => {
        // Easing factor – smaller = smoother and more "inertial"
        const eased = prev + (target - prev) * 0.08;

        // If we're extremely close to target, snap and stop the loop
        if (Math.abs(eased - target) < 0.001) {
          rafRef.current = null;
          return target;
        }

        rafRef.current = window.requestAnimationFrame(tick);
        return eased;
      });
    }

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      scrollYRef.current = scrollY;

      // Only start a new RAF loop if one isn't already running
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    // Initialize once on mount to match current scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Reveal past flyers row-by-row on scroll
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

    return () => {
      observer.disconnect();
    };
  }, [page]);

  // Reveal artists line-by-line on scroll
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

    return () => {
      observer.disconnect();
    };
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

      if (!res.ok) {
        throw new Error('Request failed');
      }

      setNewsletterMessage('YOU ARE IN. CHECK YOUR INBOX.');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterMessage('SOMETHING WENT WRONG. PLEASE TRY AGAIN.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const handleNavigate = (next: Page) => {
    if (next === page) return;

    // Reset scroll-based reveals when entering those pages
    if (next === 'past') {
      setRowVisible(
        Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
      );
    }
    if (next === 'artists') {
      setArtistVisible(ARTISTS.map(() => false));
    }

    setPage(next);
    setLogoAnimKey((k) => k + 1); // remount logo to replay its keyframe animation
    playIntro();

    // Always bring the user back to the top of the layout on page change
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const renderUpcoming = () => (
    <section className="section">
      <div className="upcoming">
        <p style={{ animationDelay: '0ms' }}>DEC 27 ST. MORITZ</p>
        <p className="tba" style={{ animationDelay: '40ms' }}>
          TBA
        </p>
        <div className="date-divider" aria-hidden="true" />
        <p style={{ animationDelay: '80ms' }}>FEB 27 ZURICH</p>
        <p className="tba" style={{ animationDelay: '120ms' }}>
          TBA
        </p>
      </div>

      {/* Newsletter signup – inline section, no popup */}
      <div className="newsletter">
        <p className="newsletter-label">FOR THOSE WHO KNOW.</p>
        
        <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            required
            placeholder="EMAIL"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
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

  // Animation classes – unified for initial load + all transitions (except logo, which uses keyframes)
  const tagClass = isEntering ? 'tag-hidden' : 'tag-visible';

  const navClass =
    page === 'home'
      ? isEntering
        ? 'fade-hidden'
        : 'fade-visible'
      : 'fade-hidden';

  const footerFadeClass = isEntering ? 'footer-hidden' : 'footer-visible';
  const panelClass = isEntering ? 'panel-intro' : 'panel-steady';

  return (
    <>
      <div className="root" style={{ fontFamily: FONT_STACK }}>
        {/* Fixed background image layer – content scrolls on top */}
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
          {/* Logo uses its own keyframe animation, restarted via key on every page transition */}
          <h1 key={logoAnimKey} className="logo-main logo-animate">
            {LOGO_TEXT}
          </h1>

          <p className={`tag ${tagClass}`}>MUSIC · ART · FASHION</p>

          {page === 'home' && (
            <nav aria-label="Primary" className={`nav ${navClass}`}>
              {nav.map(([label, key]) => (
                <button
                  key={label}
                  onClick={() => handleNavigate(key as Page)}
                  className="navbtn"
                >
                  {label}
                </button>
              ))}
            </nav>
          )}

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
                        <p
                          key={artist}
                          className={`artist-name ${
                            artistVisible[index] ? 'artist-name-visible' : ''
                          } ${isHighlight ? 'artist-name-highlight' : ''}`}
                          ref={(el) => {
                            artistRefs.current[index] = el;
                          }}
                        >
                          {artist}
                        </p>
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
:root {
  color-scheme: dark;
}
html, body {
  margin: 0;
  padding: 0;
  background: #000;
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
  padding-bottom: 64px; /* space so fixed footer doesn't cover content */
}

/* Fixed background image that stays in place while content scrolls */
.bg-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.26), rgba(0, 0, 0, 0.36)),
    url('https://res.cloudinary.com/dsas5i0fx/image/upload/v1763336289/IMG_5984_wjkvk6.jpg');
  background-position: center center, center 48%; /* chandelier slightly lower, closer to middle on desktop */
  background-size: cover, 115%; /* subtle base zoom-in on the photo */
  background-repeat: no-repeat, no-repeat;
  transform-origin: center center;
  transition: transform 0.18s ease-out;
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
.center-about {
  padding-top: 8vh;
}
.center-upcoming {
  padding-top: 14vh;
  padding-bottom: 4vh;
}

.logo-main {
  margin: 0 auto;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 700;
  letter-spacing: -0.082em;
  text-transform: uppercase;
  line-height: 0.86;
  font-size: clamp(36px, 12vw, 140px);
}
/* Keyframe-driven intro for the logo so it always glides smoothly from the top */
.logo-animate {
  animation: logo-intro 0.6s ease forwards;
  will-change: transform, opacity;
}

.tag {
  margin-top: 20px;
  margin-bottom: 40px; /* slightly less space under logo */
  letter-spacing: 0.28em;
  text-transform: uppercase;
  font-size: clamp(12px, 2.4vw, 16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.tag-hidden {
  opacity: 0;
  transform: translateY(32px);
}
.tag-visible {
  opacity: 0.95;
  transform: translateY(0);
}

.nav {
  position: relative;
  z-index: 30; /* nav above all layers */
  position: relative;
  z-index: 20;
    margin-top: 32px; /* more space between logo + buttons */
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
}

.navbtn {
  position: relative;
  z-index: 9999; /* ensure buttons sit above EVERYTHING */
  pointer-events: auto !important; /* first‑tap ALWAYS works */
  min-height: 48px;
  min-width: 160px;
  padding: 12px 18px;
  border-radius: 12px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  cursor: pointer;
  opacity: 0;
  transform: translateY(22px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease,
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

/* Buttons rise in from bottom when nav fades in (HOME only) */
.nav.fade-visible .navbtn {
  opacity: 1;
  transform: translateY(0);
}

.navbtn:hover {
  background: transparent;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 20px 6px rgba(255, 180, 90, 0.26);
  text-shadow: none;
  transform: translateY(-1px);
}

.panel {
  position: relative;
  z-index: 1; /* panel goes UNDER nav buttons to avoid blocking */
  position: relative;
  z-index: 5; /* ensure panel never covers nav */
  margin: 12px auto 0; /* slightly closer to logo/tag */
  padding: 0;
  max-width: 900px;
}
.panel-intro {
  opacity: 0;
  transform: translateY(32px);
}
.panel-steady {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section {
  text-align: left;
  margin: 18px auto 0; /* slightly reduced top margin */
  max-width: 900px;
}
.section-past {
  padding: 24px 20px 40px;
}

.about-section {
  padding-top: 0;
  padding-bottom: 24px; /* more breathing room so text and HOME button never overlap */
}

.about {
  max-width: 38ch; /* slightly wider for ultra‑even justification */
  margin: 0 auto;
  text-transform: uppercase;
}
.about-line {
  line-height: 1.45;
  font-size: 15px;
  opacity: 0;
  text-align: justify;
  transform: translateY(6px);
  animation: about-line-in 0.6s ease forwards;
}
.about-block {
  margin: 0 0 24px;
  line-height: 1.5;              /* slightly more air for smoother rhythm */
  font-size: 15px;
  opacity: 0.95;
  text-align: justify;
  text-align-last: justify;      /* last sentence also full width */
  text-justify: inter-word;
  word-spacing: normal;          /* let browser balance spacing */
  letter-spacing: 0.02em;        /* subtle tracking for all-caps */
  hyphens: none;                 /* no dashes */
  text-rendering: optimizeLegibility;
  display: block;
  width: 100%;
}

.upcoming {
  font-weight: 700; /* keep UPCOMING titles bold */ /* make UPCOMING titles bold */
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  line-height: 1.45;
  font-size: 16px;
  opacity: 0.95;
  margin-top: 10px;
}
.upcoming p,
.upcoming .tba {
  font-size: 14px;
  letter-spacing: 0.2em;
  opacity: 0;
  animation: line-in 0.45s ease forwards;
}

/* Make only the DATE + PLACE bold */
.upcoming p:not(.tba) {
  font-weight: 700;
}

/* TBA stays regular weight */
.upcoming .tba {
  font-weight: 400;
} line-in 0.45s ease forwards;
}
.tba {
  font-size: 14px;
  letter-spacing: 0.2em;
  opacity: 0.8;
  margin-top: 2px;
}
.date-divider {
  width: 64px;
  height: 1px;
  margin: 12px auto 10px;
  background: rgba(255, 255, 255, 0.35);
}

.newsletter {
  margin: 40px auto 0; /* more breathing room above email box */
  max-width: 420px;
  text-align: center;
}

.newsletter-label {
  font-size: 13px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.9;
  margin-bottom: 6px;
}

.newsletter-sub {
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.75;
  margin-bottom: 16px;
}

.newsletter-form {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.newsletter-input {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  letter-spacing: 0.12em;
  font-size: 11px;
  outline: none;
  transition: all 0.2s ease;

  /* REMOVE ALL AUTOFILL COLORS (browser default yellow/blue) */
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff !important;
}

/* Fully neutralize Chrome/Safari autofill for all inputs */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  box-shadow: 0 0 0px 1000px transparent inset !important;
  background: transparent !important;
  background-color: transparent !important;
  -webkit-text-fill-color: #fff !important;
  color: #fff !important;
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.newsletter-input:hover,
.newsletter-input:focus {
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 20px 6px rgba(255, 180, 90, 0.20);
}

.newsletter-input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.newsletter-btn {
  padding: 10px 18px;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.newsletter-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 20px 6px rgba(255, 180, 90, 0.26);
  transform: translateY(-1px);
}

.newsletter-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.newsletter-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 18px 4px rgba(255, 180, 90, 0.25);
  transform: translateY(-1px);
}

.newsletter-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.newsletter-message {
  margin-bottom: 26px; /* spacing before HOME button */
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.8;
}

.flyer-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 20px;
  margin-top: 0;
  padding: 0;
}
.flyer-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.flyer-row-visible {
  opacity: 1;
  transform: translateY(0);
}
.flyer-cell img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}

.artists-list {
  max-width: 76ch;
  margin: 8px auto 0;
  text-align: center;
}
.az-label {
  font-weight: 700; /* A–Z now bold */
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.22em;
  font-size: 16px;
  margin-bottom: 24px;
  text-transform: uppercase;
}
.artist-name {
  margin: 8px 0;
  font-size: 16px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0;
  line-height: 1.45;
  transform: translateY(6px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.artist-name-visible {
  opacity: 0.92;
  transform: translateY(0);
}
.artist-name-highlight {
  color: #fff;
}

.icons {
  display: flex;
  align-items: center;
  justify-content: center;
}
.iconlink {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  color: #fff;
  opacity: 0.96;
  text-decoration: none;
}
.iconlink:hover {
  opacity: 1;
}
.iconlink:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  border-radius: 6px;
}
.dot {
  display: inline-block;
  margin: 0 0.6rem;
  opacity: 0.75;
  line-height: 1;
}

.homebtn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 54px; /* more distance from mailbox or content */
}
.homebtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 14px;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.homebtn:hover {
  background: transparent;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 20px 6px rgba(255, 180, 90, 0.26);
  text-shadow: none;
  transform: translateY(-1px);
}

.footer {
  pointer-events: none; /* footer never intercepts taps */
  z-index: 0;
  pointer-events: none;
  z-index: 1; /* footer stays behind everything, no block on taps */
  width: 100%;
  padding: 14px 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;   /* always visible without scrolling */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
}
.footer-hidden {
  opacity: 0;
  transform: translateY(32px);
}
.footer-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-hidden {
  opacity: 0;
  /* REMOVE pointer-events none to prevent dead‑tap bug */
  pointer-events: auto;
}
}
.fade-visible {
  opacity: 1;
  pointer-events: auto !important; /* guarantee first-tap response */ /* ensure first‑tap works */
  pointer-events: auto; /* ensure buttons can be clicked immediately */
}

@media (max-width: 640px) {
  /* Mobile background framing */
  .bg-layer {
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.20), rgba(0, 0, 0, 0.30)),
      url('https://res.cloudinary.com/dsas5i0fx/image/upload/v1763336289/IMG_5984_wjkvk6.jpg');
    background-position: center center, center 55%;
    background-size: cover, 118%;
    background-repeat: no-repeat, no-repeat;
    transform-origin: center center;
  }

  .logo-main {
    font-size: clamp(36px, 16vw, 72px);
    white-space: nowrap;
  }

  /* HOME: logo upper third, buttons lower third, no excessive scroll */
  .center-home {
    padding-top: 18vh; /* bring logo slightly lower */
    padding-bottom: 38vh; /* push buttons further down */ /* move buttons further down */
    min-height: 100vh;
    justify-content: flex-start;
  }

  /* LANDING PAGES */
  .center-subpage,
  .center-about,
  .center-upcoming {
    padding-top: 12vh;
    padding-bottom: 10vh; /* reduced to prevent excessive scroll */
    min-height: 100vh;
    justify-content: flex-start;
  }

  .nav {
    margin-top: 32px;
    gap: 16px;
  }

  .panel {
    margin-top: 20px;
  }

  .newsletter {
    margin-top: 28px;
  }

  .newsletter-message {
    margin-bottom: 32px;
  }

  .homebtn-wrapper {
    margin-top: 40px;
  }

  .flyer-row {
    grid-template-columns: repeat(2, 1fr);
    max-width: 460px;
  }

  .flyer-cell img {
    width: 100%;
    height: auto;
  }

    /* About width tuned for most even phone spacing */
  .about {
    max-width: 34ch; /* sweet spot: not too narrow, not too wide on phone */
  }

  .about-section {
    padding-bottom: 40px; /* ensure no overlap with HOME button on ABOUT */
  }
}


@keyframes logo-intro {
  from {
    opacity: 0;
    transform: translateY(-32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes about-line-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes line-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
        `}</style>
      </div>
    </>
  );
}
