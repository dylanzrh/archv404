import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------
// Constants / Config
// ---------------------------------
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

// Ticket link + Upcoming flyer
const TICKET_URL = 'https://supermarket.li/events/archive-404-5/';
const UPCOMING_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1770251160/IMG_1687_wvmczm.png';

// Background zoom tuning
const BASE_ZOOM = 1.02;
const MAX_ZOOM = 1.1;

// St. Moritz flyer (PAST)
const ST_MORITZ_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1765023902/AR4_Instagram-Post_251203_l5i1md.png';

// Jan 30 Zurich flyer (PAST)
const ZURICH_JAN30_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1769005674/AR402_Instagram-Post_SH_260121-08_qxhube.png';

// ABOUT text
const ABOUT_TEXT =
  'ARCHIVE 404 IS A ZURICH-BASED EVENT LABEL CRAFTING CAREFULLY DESIGNED EXPERIENCES WHERE MUSIC, LIGHT AND SPACE CREATE IMMERSIVE MOMENTS. ITS NAME REINTERPRETS A DIGITAL ERROR AS AN INVITATION TO RECONNECT THROUGH PEOPLE AND SOUND. BY BRINGING TOGETHER RESPECTED INTERNATIONAL ARTISTS AND SOME OF THE MOST PROMISING LOCAL TALENTS, ARCHIVE 404 CREATES A DISTINCT ENERGY THAT FEELS CONTEMPORARY YET TIMELESS.';

const PAST_FLYERS: string[] = [
  ZURICH_JAN30_FLYER_URL,
  ST_MORITZ_FLYER_URL,
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060268/archive404_251025_post_yus7xj.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060242/archive03102025_post_eptqbf.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060222/ARCHIVE404_06082025_Palm3_wjeh8o.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060209/ARCHIVE404_06082025_Soluna_zv1cfx.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060195/ARCHIVE404_04072025_POST_ptktcy.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060161/ARCHIVE404_02052025_POST01_ly44jq.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1763060124/ARCHIVE404_280225_POST03_LOGO_nqcgah.jpg',
];

// ✅ Artists (we will sort with “special/number/colon” names LAST)
const ARTISTS: string[] = [
  '2M',
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
  'JULIA LINKOGEL',
  'KASSETTE',
  'LOU COMBO',
  'PAUL ALMQVIST',
  'RUBEN SCORZA',
  'SAM MADI',
  'SEBASTIAN KONRAD',
  'SOLIQUE',
  'TIM ENGELHARDT',
  'YENI:SAM',
];

const HIGHLIGHT_ARTISTS = new Set<string>([
  'DANGEL TWINS',
  'DYZEN',
  'SEBASTIAN KONRAD',
  'TIM ENGELHARDT',
]);

type Page = 'home' | 'upcoming' | 'past' | 'artists' | 'about';

/* ---------------------------------
   Lightweight URL routing (SPA)
---------------------------------- */
const pageToPath = (p: Page) => {
  switch (p) {
    case 'home':
      return '/';
    case 'upcoming':
      return '/upcoming';
    case 'past':
      return '/past';
    case 'artists':
      return '/artists';
    case 'about':
      return '/about';
    default:
      return '/';
  }
};

const pathToPage = (pathname: string): Page => {
  const clean =
    (pathname || '/').split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  if (clean === '/') return 'home';
  if (clean === '/upcoming') return 'upcoming';
  if (clean === '/past') return 'past';
  if (clean === '/artists') return 'artists';
  if (clean === '/about') return 'about';
  return 'home';
};

/* ---------------------------------
   Artist sort: A–Z first, then “special”
   Special = contains digits or ":" (you can extend)
---------------------------------- */
const isSpecialArtist = (name: string) => /[0-9:]/.test(name);

const sortArtistsAtoZThenSpecialLast = (names: string[]) => {
  const normal = names.filter((n) => !isSpecialArtist(n));
  const special = names.filter((n) => isSpecialArtist(n));

  const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
  normal.sort((a, b) => collator.compare(a, b));
  special.sort((a, b) => collator.compare(a, b));

  return [...normal, ...special];
};

export default function Preview() {
  const [page, setPage] = useState<Page>('home');

  const [isEntering, setIsEntering] = useState(true);
  const [logoAnimKey, setLogoAnimKey] = useState(0);

  const [bgZoom, setBgZoom] = useState(BASE_ZOOM);

  const scrollYRef = useRef(0);
  const inputFocusedRef = useRef(false);

  const lastTouchActivateTsRef = useRef<number>(0);
  const TOUCH_DEDUPE_MS = 800;

  // ✅ Special names last
  const SORTED_ARTISTS = useMemo(
    () => sortArtistsAtoZThenSpecialLast(ARTISTS),
    []
  );

  const [rowVisible, setRowVisible] = useState<boolean[]>(() =>
    Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
  );
  const [artistVisible, setArtistVisible] = useState<boolean[]>(() =>
    SORTED_ARTISTS.map(() => false)
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

  const onTouchActivate = (
    e: React.PointerEvent | React.MouseEvent,
    action: () => void
  ) => {
    if ('pointerType' in e) {
      const pe = e as React.PointerEvent;
      if (pe.pointerType === 'touch') {
        pe.preventDefault();
        pe.stopPropagation();
        lastTouchActivateTsRef.current = Date.now();
        (pe.currentTarget as HTMLElement).blur?.();
        action();
        return;
      }
    }
  };

  const onClickActivate = (e: React.MouseEvent, action: () => void) => {
    if (Date.now() - lastTouchActivateTsRef.current < TOUCH_DEDUPE_MS) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    action();
  };

  const playIntro = () => {
    setIsEntering(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsEntering(false);
      });
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyFromUrl = () => {
      const next = pathToPage(window.location.pathname);

      if (next === 'past') {
        setRowVisible(
          Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
        );
      }
      if (next === 'artists') {
        setArtistVisible(SORTED_ARTISTS.map(() => false));
      }

      setPage((prev) => (prev === next ? prev : next));
      setLogoAnimKey((k) => k + 1);
      playIntro();
      setBgZoom(BASE_ZOOM);
    };

    applyFromUrl();
    window.addEventListener('popstate', applyFromUrl);
    return () => window.removeEventListener('popstate', applyFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    playIntro();
  }, []);

  useEffect(() => {
    const img1 = new Image();
    img1.src = ST_MORITZ_FLYER_URL;
    const img2 = new Image();
    img2.src = ZURICH_JAN30_FLYER_URL;
    const img3 = new Image();
    img3.src = UPCOMING_FLYER_URL;
  }, []);

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

      if (Math.abs(target - next) > 0.0005) rafId = window.requestAnimationFrame(animate);
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

  const resetScrollToTop = () => {
    if (typeof window === 'undefined') return;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  const pushUrlForPage = (next: Page, replace = false) => {
    if (typeof window === 'undefined') return;
    const target = pageToPath(next);
    const current = window.location.pathname;
    if (current === target) return;

    const fn = replace ? 'replaceState' : 'pushState';
    window.history[fn]({}, '', target);
  };

  const handleNavigate = (next: Page) => {
    if (next === page) return;

    if (next === 'past') {
      setRowVisible(
        Array.from({ length: Math.ceil(PAST_FLYERS.length / 2) }, (_, i) => i === 0)
      );
    }
    if (next === 'artists') {
      setArtistVisible(SORTED_ARTISTS.map(() => false));
    }

    setPage(next);
    setLogoAnimKey((k) => k + 1);
    playIntro();

    setBgZoom(BASE_ZOOM);
    resetScrollToTop();
    pushUrlForPage(next);
  };

  // UPCOMING: measure line width; flyer = line width; button narrower
  const upcomingLineRef = useRef<HTMLSpanElement | null>(null);
  const [upcomingWidth, setUpcomingWidth] = useState<number>(0);

  useEffect(() => {
    if (page !== 'upcoming') return;
    if (typeof window === 'undefined') return;

    const measure = () => {
      const w = upcomingLineRef.current?.getBoundingClientRect().width ?? 0;
      if (w > 0) setUpcomingWidth(w);
    };

    requestAnimationFrame(() => measure());
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [page]);

  const flyerPx = upcomingWidth ? Math.round(upcomingWidth) : 0;

  // ✅ make ticket button EVEN LESS wide (72% of flyer), with a sane min/max
  const buttonPx =
    flyerPx > 0 ? Math.max(170, Math.min(Math.round(flyerPx * 0.72), flyerPx - 40)) : 0;

  const renderUpcoming = () => (
    <section className="section upcoming-section">
      <div className="upcoming">
        <div className="upcoming-wrap">
          <p className="upcoming-line">
            <span ref={upcomingLineRef} className="upcoming-line-measure">
              FEB 27 SUPERMARKET CLUB
            </span>
          </p>

          <div className="upcoming-cta">
            <a
              className="ticket-btn"
              href={TICKET_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: buttonPx ? `${buttonPx}px` : undefined }}
            >
              GET YOUR TICKET
            </a>
          </div>

          <a
            href={TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="upcoming-flyer-link"
            aria-label="Open tickets"
            style={{ width: flyerPx ? `${flyerPx}px` : undefined }}
          >
            <img
              className="upcoming-flyer"
              src={UPCOMING_FLYER_URL}
              alt="ARCHIVE 404 · FEB 27"
              decoding="async"
              loading="eager"
            />
          </a>
        </div>
      </div>

      <div className="newsletter upcoming-newsletter">
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
            onPointerUp={(e) =>
              onTouchActivate(e, () => {
                (e.currentTarget as HTMLButtonElement).form?.requestSubmit?.();
              })
            }
            onClick={(e) => onClickActivate(e, () => {})}
          >
            {isSubmittingNewsletter ? 'SENDING…' : 'JOIN'}
          </button>
        </form>

        {newsletterMessage && <p className="newsletter-message">{newsletterMessage}</p>}
      </div>

      <div className="homebtn-wrapper upcoming-homebtn">
        <button
          className="homebtn"
          onPointerUp={(e) => onTouchActivate(e, () => handleNavigate('home'))}
          onClick={(e) => onClickActivate(e, () => handleNavigate('home'))}
        >
          HOME
        </button>
      </div>
    </section>
  );

  const renderPast = () => {
    const rows: string[][] = [];
    for (let i = 0; i < PAST_FLYERS.length; i += 2) rows.push(PAST_FLYERS.slice(i, i + 2));

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
          <button
            className="homebtn"
            onPointerUp={(e) => onTouchActivate(e, () => handleNavigate('home'))}
            onClick={(e) => onClickActivate(e, () => handleNavigate('home'))}
          >
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
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
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
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Open Instagram" className="iconlink">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
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
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
          <path d="M5 8.5 12 13l7-4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );

  const tagClass = isEntering ? 'tag-hidden' : 'tag-visible';
  const navClass = page === 'home' ? (isEntering ? 'fade-hidden' : 'fade-visible') : 'fade-hidden';
  const navOffHomeClass = page === 'home' ? '' : 'nav-offhome';
  const footerFadeClass = isEntering ? 'footer-hidden' : 'footer-visible';
  const panelClass = isEntering ? 'panel-intro' : 'panel-steady';

  return (
    <>
      <div className="root" style={{ fontFamily: FONT_STACK }}>
        <div className="bg-layer" aria-hidden="true" style={{ transform: `translateZ(0) scale(${bgZoom})` }} />

        <div
          className={`center ${page === 'home' ? 'center-home' : 'center-subpage'} ${
            page === 'upcoming' ? 'center-upcoming' : ''
          } ${page === 'about' ? 'center-about' : ''}`}
        >
          <h1
            key={logoAnimKey}
            className="logo-main logo-animate"
            onPointerUp={(e) => onTouchActivate(e, () => handleNavigate('home'))}
            onClick={(e) => onClickActivate(e, () => handleNavigate('home'))}
            style={{ cursor: 'pointer' }}
          >
            {LOGO_TEXT}
          </h1>

          <p className={`tag ${tagClass}`}>THE ART OF SOUND</p>

          <nav
            aria-label="Primary"
            className={`nav ${navClass} ${navOffHomeClass}`}
            style={{ pointerEvents: page === 'home' ? 'auto' : 'none' }}
          >
            {nav.map(([label, key]) => (
              <button
                key={label}
                className="navbtn"
                tabIndex={page === 'home' ? 0 : -1}
                aria-hidden={page !== 'home'}
                onPointerUp={(e) => onTouchActivate(e, () => handleNavigate(key as Page))}
                onClick={(e) => onClickActivate(e, () => handleNavigate(key as Page))}
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
                    onPointerUp={(e) => onTouchActivate(e, () => handleNavigate('home'))}
                    onClick={(e) => onClickActivate(e, () => handleNavigate('home'))}
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

                  {SORTED_ARTISTS.map((artist, index) => {
                    const isHighlight = HIGHLIGHT_ARTISTS.has(artist);
                    return (
                      <div key={artist} className="artist-block">
                        <p
                          className={`artist-name ${artistVisible[index] ? 'artist-name-visible' : ''} ${
                            isHighlight ? 'artist-name-highlight' : ''
                          }`}
                          ref={(el) => {
                            artistRefs.current[index] = el;
                            if (el) (el as HTMLElement).dataset.artistIndex = String(index);
                          }}
                        >
                          {artist}
                        </p>
                        {artist === 'BOYSDONTCRY' && <p className="artist-resident">RESIDENT</p>}
                      </div>
                    );
                  })}
                </div>

                <div className="homebtn-wrapper">
                  <button
                    className="homebtn"
                    onPointerUp={(e) => onTouchActivate(e, () => handleNavigate('home'))}
                    onClick={(e) => onClickActivate(e, () => handleNavigate('home'))}
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
/* (styles unchanged from your last version; only logic changes above) */
:root { color-scheme: dark; }
html, body { margin: 0; padding: 0; background: #000; font-family: ${FONT_STACK}; }
.root { position: relative; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; color: #fff; overflow: hidden; padding-bottom: 0; }

.bg-layer {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: linear-gradient(rgba(0,0,0,0.34), rgba(0,0,0,0.44)),
    url('https://res.cloudinary.com/dsas5i0fx/image/upload/v1763336289/IMG_5984_wjkvk6.jpg');
  background-position: center center, center 48%;
  background-size: cover, 115%;
  background-repeat: no-repeat, no-repeat;
  transform-origin: center center;
  transition: none;
  will-change: transform;
}

.center {
  text-align: center; max-width: 900px; padding: 6vh 24px 8vh;
  display: flex; flex-direction: column; justify-content: center;
  min-height: 80vh; opacity: 1; transition: opacity 0.32s ease; position: relative; z-index: 1;
}
.center-subpage { justify-content: flex-start; padding-top: 4vh; padding-bottom: 6vh; min-height: auto; }
.center-about { padding-top: 8vh; }
.center-upcoming { padding-top: 14vh; padding-bottom: 4vh; }

.logo-main {
  margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 700; letter-spacing: -0.082em; text-transform: uppercase;
  line-height: 0.86; font-size: clamp(36px, 12vw, 140px);
}
.logo-animate { animation: logo-intro 0.6s ease forwards; will-change: transform, opacity; }

.tag {
  margin-top: 20px; margin-bottom: 40px;
  letter-spacing: 0.28em; text-transform: uppercase;
  font-size: clamp(12px, 2.4vw, 16px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.tag-hidden { opacity: 0; transform: translateY(32px); }
.tag-visible { opacity: 0.95; transform: translateY(0); }

.nav { position: relative; z-index: 10; margin-top: 32px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
.nav-offhome { position: absolute !important; left: 0 !important; right: 0 !important; top: -9999px !important; margin: 0 !important; padding: 0 !important; height: 0 !important; overflow: hidden !important; }

.navbtn, .newsletter-btn, .homebtn, .ticket-btn {
  position: relative;
  pointer-events: auto;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.008);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.06);
  outline: 1px solid rgba(255, 255, 255, 0.015);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.6s ease, transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0.12);
  -webkit-user-select: none;
  user-select: none;
}

.navbtn { z-index: 9999; min-height: 48px; min-width: 160px; padding: 12px 18px; opacity: 0; transform: translateY(22px); font-size: 11px; }
.nav.fade-visible .navbtn { opacity: 1; transform: translateY(0); }

.homebtn { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 10px 18px; font-size: 11px; }

.ticket-btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 6px 18px;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.18em;
  background: rgba(255, 255, 255, 0.014);
  border: 1px solid rgba(255, 255, 255, 0.18);
  outline: 1px solid rgba(255, 255, 255, 0.028);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.38), 0 0 14px rgba(255, 255, 255, 0.03);
}

@media (hover: hover) and (pointer: fine) {
  .navbtn:hover, .newsletter-btn:hover:not(:disabled), .homebtn:hover, .ticket-btn:hover {
    background: rgba(255, 255, 255, 0.022);
    border-color: rgba(255, 255, 255, 0.24);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.46), 0 0 20px rgba(255, 180, 90, 0.10);
    transform: translateY(-1px);
  }
  .iconlink:hover { opacity: 1; }
}

.newsletter-btn:disabled { opacity: 0.6; cursor: default; }

.panel { position: relative; z-index: 1; margin: 12px auto 0; padding: 0; max-width: 900px; }
.panel-intro { opacity: 0; transform: translateY(32px); }
.panel-steady { opacity: 1; transform: translateY(0); transition: opacity 0.6s ease, transform 0.6s ease; }

.section { text-align: left; margin: 18px auto 0; max-width: 900px; }
.section-past { padding: 24px 20px 40px; }

.about-section { padding-top: 0; padding-bottom: 24px; }
.about { max-width: 38ch; margin: 0 auto; text-transform: uppercase; }
.about-block { margin: 0 0 24px; line-height: 1.5; font-size: 15px; opacity: 0.95; text-align: justify; text-align-last: justify; text-justify: inter-word; letter-spacing: 0.02em; }

/* UPCOMING */
.upcoming { text-align: center; text-transform: uppercase; letter-spacing: 0.2em; line-height: 1.45; font-size: 16px; opacity: 0.95; margin-top: 10px; }
.upcoming p { margin: 0; font-weight: 700; }
.upcoming-wrap{ display: inline-block; text-align: center; margin: 0 auto; }
.upcoming-line{ display: block; }
.upcoming-line-measure{ display: inline-block; }
.upcoming-cta { margin-top: 16px; display: flex; justify-content: center; }
.upcoming-flyer-link{ display: block; margin: 20px auto 0; text-decoration: none; }
.upcoming-flyer{
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
  border-radius: 0;
  border: 1px solid rgba(255,255,255,0.06);
  outline: 1px solid rgba(255,255,255,0.015);
}

.upcoming-section { display: flex; flex-direction: column; min-height: 72vh; }
.upcoming-section .upcoming { margin-top: 34px; }
.upcoming-newsletter { margin-top: auto; padding-top: 18px; }
.upcoming-homebtn { margin-top: 28px; }

/* Newsletter */
.newsletter { margin: 40px auto 0; max-width: 420px; text-align: center; }
.newsletter-label { font-size: 13px; letter-spacing: 0.26em; text-transform: uppercase; opacity: 0.9; margin-bottom: 6px; }
.newsletter-form { display: flex; gap: 12px; justify-content: center; align-items: center; margin-top: 10px; }
.newsletter-btn{ padding: 10px 18px; border-radius: 10px; font-size: 11px; letter-spacing: 0.12em; }

.newsletter-input {
  flex: 1; padding: 10px 14px; border-radius: 8px; background: transparent; color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  letter-spacing: 0.12em; font-size: 11px; outline: none; transition: all 0.2s ease;
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff !important;
}
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  box-shadow: 0 0 0px 1000px transparent inset !important;
  background: transparent !important;
  -webkit-text-fill-color: #fff !important;
}
.newsletter-input::placeholder { color: rgba(255, 255, 255, 0.45); }
.newsletter-input:hover, .newsletter-input:focus { border-color: rgba(255, 255, 255, 0.32); box-shadow: 0 0 20px 6px rgba(255, 180, 90, 0.20); }
.newsletter-message { margin-bottom: 26px; margin-top: 10px; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.8; }

/* PAST */
.flyer-grid { display: flex; flex-direction: column; align-items: center; row-gap: 20px; margin-top: 0; padding: 0; }
.flyer-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; width: 100%; max-width: 520px; margin: 0 auto; opacity: 0; transform: translateY(10px); transition: opacity 0.6s ease, transform 0.6s ease; }
.flyer-row-visible { opacity: 1; transform: translateY(0); }
.flyer-cell img { display: block; width: 100%; height: auto; }

/* ARTISTS */
.artists-list { max-width: 76ch; margin: 8px auto 0; text-align: center; }
.az-label { font-weight: 700; color: rgba(255, 255, 255, 0.55); letter-spacing: 0.22em; font-size: 16px; margin-bottom: 24px; text-transform: uppercase; }
.artist-block { display: flex; flex-direction: column; align-items: center; }
.artist-name { margin: 8px 0; font-size: 16px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0; line-height: 1.45; transform: translateY(6px); transition: opacity 0.4s ease, transform 0.4s ease; }
.artist-name-visible { opacity: 0.92; transform: translateY(0); }
.artist-name-highlight { color: #fff; }
.artist-resident { font-weight: 700; color: rgba(255, 255, 255, 0.55); letter-spacing: 0.22em; font-size: 10px; margin-top: -10px; text-transform: uppercase; }

/* FOOTER / ICONS */
.icons { display: flex; align-items: center; justify-content: center; }
.iconlink { pointer-events: auto; display: inline-flex; align-items: center; justify-content: center; line-height: 0; color: #fff; opacity: 0.96; text-decoration: none; }
.dot { display: inline-block; margin: 0 0.6rem; opacity: 0.75; }

.homebtn-wrapper { display: flex; justify-content: center; margin-top: 54px; margin-bottom: 80px; }

.footer { pointer-events: none; width: 100%; padding: 14px 0 18px; display: flex; align-items: center; justify-content: center; position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; }
.footer-hidden { opacity: 0; transform: translateY(32px); }
.footer-visible { opacity: 1; transform: translateY(0); transition: opacity 0.6s ease, transform 0.6s ease; }

.fade-hidden { opacity: 0; }
.fade-visible { opacity: 1; }

@media (max-width: 640px) {
  .bg-layer {
    background-image: linear-gradient(rgba(0,0,0,0.30), rgba(0,0,0,0.40)),
      url('https://res.cloudinary.com/dsas5i0fx/image/upload/v1763336289/IMG_5984_wjkvk6.jpg');
    background-position: center center, center 55%;
    background-size: cover, 118%;
  }

  .logo-main { font-size: clamp(36px, 16vw, 72px); white-space: nowrap; }
  .center-home { padding-top: 16vh; padding-bottom: 2vh; min-height: 96vh; justify-content: flex-start; }
  .center-subpage { padding-top: 12vh; padding-bottom: 8vh; min-height: 96vh; justify-content: flex-start; }
  .center-upcoming { padding-top: 10vh; padding-bottom: 2vh; min-height: 96vh; justify-content: flex-start; }
  .center-about { padding-top: 10vh; padding-bottom: 2vh; min-height: 96vh; justify-content: flex-start; }

  .about { max-width: 34ch; }
  .nav { margin-top: 32px; gap: 16px; }
  .center-home .nav { margin-top: 96px; }

  .upcoming-section { min-height: 76vh; }
  .upcoming-section .upcoming { margin-top: 26px; }
  .upcoming-homebtn { margin-bottom: 80px; }
}

@keyframes logo-intro {
  from { opacity: 0; transform: translateY(-32px); }
  to { opacity: 1; transform: translateY(0); }
}
        `}</style>
      </div>
    </>
  );
}
