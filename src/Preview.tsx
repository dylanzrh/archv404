import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------
// Constants / Config
// ---------------------------------
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

// Tickets + upcoming flyer
const TICKET_URL = 'https://supermarket.li/events/archive-404-6/';
const UPCOMING_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1774627082/AR402_Instagram-Post_SH_260227_01_Instapost_Grau_tcxhpc.jpg';

// Background zoom tuning
const BASE_ZOOM = 1.02;
const MAX_ZOOM = 1.1;

// St. Moritz flyer (was UPCOMING, now moved to PAST)
const ST_MORITZ_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1765023902/AR4_Instagram-Post_251203_l5i1md.png';

// Jan 30 Zurich flyer (moved to PAST)
const ZURICH_JAN30_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1769005674/AR402_Instagram-Post_SH_260121-08_qxhube.png';

// FEB 27 Zurich flyer (moved from UPCOMING -> PAST)
const FEB27_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1770251160/IMG_1687_wvmczm.png';

// ABOUT text as a single block paragraph
const ABOUT_TEXT =
  'ARCHIVE 404 IS A ZURICH-BASED EVENT LABEL CRAFTING CAREFULLY DESIGNED EXPERIENCES WHERE MUSIC, LIGHT AND SPACE CREATE IMMERSIVE MOMENTS. ITS NAME REINTERPRETS A DIGITAL ERROR AS AN INVITATION TO RECONNECT THROUGH PEOPLE AND SOUND. BY BRINGING TOGETHER RESPECTED INTERNATIONAL ARTISTS AND SOME OF THE MOST PROMISING LOCAL TALENTS, ARCHIVE 404 CREATES A DISTINCT ENERGY THAT FEELS CONTEMPORARY YET TIMELESS.';

const PAST_FLYERS: string[] = [
  FEB27_FLYER_URL,
  ZURICH_JAN30_FLYER_URL,
  ST_MORITZ_FLYER_URL,
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060268/archive404_251025_post_yus7xj.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060242/archive03102025_post_eptqbf.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060222/ARCHIVE404_06082025_Palm3_wjeh8o.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060209/ARCHIVE404_06082025_Soluna_zv1cfx.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060195/ARCHIVE404_04072025_POST_ptktcy.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060161/ARCHIVE404_02052025_POST01_ly44jq.jpg',
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060124/ARCHIVE404_280225_POST03_LOGO_nqcgah.jpg',
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
  'JULIA LINKOGEL',
  'KASSETTE',
  'LOU COMBO',
  'MICHELLE VANJA',
  'ORSAY',
  'PAUL ALMQVIST',
  'RUBEN SCORZA',
  'SAM MADI',
  'SEBASTIAN KONRAD',
  'SOLIQUE',
  'TIM ENGELHARDT',
  'YENI:SAM',
  '2M',
];

const HIGHLIGHT_ARTISTS = new Set<string>([
  'DANGEL TWINS',
  'DYZEN',
  'SEBASTIAN KONRAD',
  'TIM ENGELHARDT',
]);

type Page = 'home' | 'upcoming' | 'past' | 'artists' | 'about';

/* ---------------------------------
   Page titles for document.title
---------------------------------- */
const PAGE_TITLES: Record<Page, string> = {
  home: 'ARCHIVE 404 — The Art of Sound',
  upcoming: 'Upcoming Events — ARCHIVE 404',
  past: 'Past Events — ARCHIVE 404',
  artists: 'Artists — ARCHIVE 404',
  about: 'About — ARCHIVE 404',
};

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
   Preconnect / resource hints
   Rendered once at mount in <head>
---------------------------------- */
function useResourceHints() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const hints = [
      { rel: 'preconnect', href: 'https://res.cloudinary.com' },
      { rel: 'dns-prefetch', href: 'https://res.cloudinary.com' },
    ];

    const added: HTMLLinkElement[] = [];

    hints.forEach(({ rel, href }) => {
      if (!document.querySelector(`link[rel="${rel}"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (rel === 'preconnect') link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
        added.push(link);
      }
    });

    return () => {
      added.forEach((el) => el.remove());
    };
  }, []);
}

/* ---------------------------------
   Reduced motion hook
---------------------------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

/* ---------------------------------
   Main component
---------------------------------- */
export default function Preview() {
  const [page, setPage] = useState<Page>('home');
  const [isEntering, setIsEntering] = useState(true);
  const [logoAnimKey, setLogoAnimKey] = useState(0);
  const [bgZoom, setBgZoom] = useState(BASE_ZOOM);

  const scrollYRef = useRef(0);
  const inputFocusedRef = useRef(false);
  const lastTouchActivateTsRef = useRef<number>(0);
  const mainRef = useRef<HTMLElement>(null);
  const [navLocked, setNavLocked] = useState(false);
  const TOUCH_DEDUPE_MS = 800;

  const prefersReducedMotion = usePrefersReducedMotion();
  useResourceHints();

  const SORTED_ARTISTS = useMemo(() => [...ARTISTS], []);

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

  // Live region ref for route changes
  const announceRef = useRef<HTMLDivElement>(null);

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

  /* Touch deduplication helpers */
  const onTouchActivate = useCallback(
    (e: React.PointerEvent | React.MouseEvent, action: () => void) => {
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
    },
    []
  );

  const onClickActivate = useCallback(
    (e: React.MouseEvent, action: () => void) => {
      if (Date.now() - lastTouchActivateTsRef.current < TOUCH_DEDUPE_MS) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      action();
    },
    []
  );

  const playIntro = useCallback(() => {
    if (prefersReducedMotion) {
      setIsEntering(false);
      return;
    }
    setIsEntering(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsEntering(false);
      });
    });
  }, [prefersReducedMotion]);

  /* Announce page changes to screen readers */
  const announcePageChange = useCallback((p: Page) => {
    if (announceRef.current) {
      announceRef.current.textContent = `Navigated to ${PAGE_TITLES[p]}`;
    }
  }, []);

  /* Update document title */
  const updateDocTitle = useCallback((p: Page) => {
    if (typeof document !== 'undefined') {
      document.title = PAGE_TITLES[p];
    }
  }, []);

  // Sync initial page from URL + handle back/forward
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
      updateDocTitle(next);
    };

    applyFromUrl();
    window.addEventListener('popstate', applyFromUrl);
    return () => window.removeEventListener('popstate', applyFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    playIntro();
  }, [playIntro]);

  // Preload the upcoming flyer (high priority), defer the rest
  useEffect(() => {
    // Only preload the upcoming flyer eagerly
    const highPriority = new Image();
    highPriority.decoding = 'async';
    highPriority.fetchPriority = 'high';
    highPriority.src = UPCOMING_FLYER_URL;

    // Defer other flyers until idle
    const idleCallback =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 200);

    idleCallback(() => {
      [ST_MORITZ_FLYER_URL, ZURICH_JAN30_FLYER_URL, FEB27_FLYER_URL].forEach((url) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
      });
    });
  }, []);

  // Smooth background zoom on scroll (RAF) — skipped if reduced motion
  useEffect(() => {
    if (prefersReducedMotion) {
      setBgZoom(BASE_ZOOM);
      return;
    }

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
  }, [prefersReducedMotion]);

  // Intersection observer for past flyer rows
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
      { threshold: 0.1, rootMargin: '200px 0px' }
    );

    rowRefs.current.forEach((row, index) => {
      if (row) {
        (row as HTMLElement).dataset.rowIndex = String(index);
        observer.observe(row);
      }
    });

    return () => observer.disconnect();
  }, [page]);

  // Intersection observer for artist names
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
      { threshold: 0.1, rootMargin: '200px 0px' }
    );

    artistRefs.current.forEach((el, index) => {
      if (el) {
        (el as HTMLElement).dataset.artistIndex = String(index);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [page, SORTED_ARTISTS]);

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

  const resetScrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }, []);

  const pushUrlForPage = useCallback((next: Page, replace = false) => {
    if (typeof window === 'undefined') return;
    const target = pageToPath(next);
    const current = window.location.pathname;
    if (current === target) return;

    const fn = replace ? 'replaceState' : 'pushState';
    window.history[fn]({}, '', target);
  }, []);

  const handleNavigate = useCallback(
    (next: Page) => {
      if (next === page) return;

      // Block all pointer events on content during transition
      // so stray clicks can't activate links on the new page
      setNavLocked(true);
      setTimeout(() => setNavLocked(false), 600);

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
      updateDocTitle(next);
      announcePageChange(next);


    },
    [page, SORTED_ARTISTS, playIntro, resetScrollToTop, pushUrlForPage, updateDocTitle, announcePageChange]
  );

  /* Handle keyboard — only needed for elements with role="link" that aren't native <button>/<a> */
  const handleLinkKeyDown = useCallback(
    (e: React.KeyboardEvent, target: Page) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNavigate(target);
      }
    },
    [handleNavigate]
  );

  /* ---------------------------------
     Skip to content link
  ---------------------------------- */
  const handleSkipToContent = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    mainRef.current?.focus({ preventScroll: true });
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ---------------------------------
     UPCOMING PAGE
  ---------------------------------- */
  const renderUpcoming = () => (
    <section className="section upcoming-section" aria-labelledby="upcoming-heading">
      <h2 id="upcoming-heading" className="sr-only">
        Upcoming Events
      </h2>

      <div className="upcoming upcoming-updated">
        <p className="upcoming-head" style={{ animationDelay: '0ms' }}>
          APR 17 SUPERMARKET CLUB
        </p>

        <div className="ticket-btn-wrap">
          <a
            href={TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ticket-btn"
            aria-label="Buy first release tickets for April 17 at Supermarket Club"
          >
            <span>FIRST RELEASE TICKETS</span>
          </a>
        </div>

        <div className="upcoming-flyer-wrap">
          <a
            href={TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="upcoming-flyer-link"
            aria-label="View event details and buy tickets for April 17"
          >
            <img
              src={UPCOMING_FLYER_URL}
              alt="Flyer for ARCHIVE 404 event on April 17 at Supermarket Club"
              className="upcoming-flyer"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width={900}
              height={900}
            />
          </a>
        </div>

        <div className="upcoming-next">
          <p className="upcoming-head">MAY 8</p>
          <p className="upcoming-sub">TBA</p>
        </div>
      </div>

      <div className="newsletter upcoming-newsletter" role="region" aria-labelledby="newsletter-label">
        <p className="newsletter-label" id="newsletter-label">
          FOR THOSE WHO KNOW.
        </p>

        <form
          className="newsletter-form"
          onSubmit={handleNewsletterSubmit}
          aria-label="Newsletter signup"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="EMAIL"
            autoComplete="email"
            inputMode="email"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            onFocus={() => {
              inputFocusedRef.current = true;
            }}
            onBlur={() => {
              inputFocusedRef.current = false;
            }}
            className="newsletter-input"
            aria-describedby={newsletterMessage ? 'newsletter-status' : undefined}
          />
          <button
            type="submit"
            className="newsletter-btn"
            disabled={isSubmittingNewsletter}
            aria-busy={isSubmittingNewsletter}
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
        {newsletterMessage && (
          <p
            id="newsletter-status"
            className="newsletter-message"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {newsletterMessage}
          </p>
        )}
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
    for (let i = 0; i < PAST_FLYERS.length; i += 2) {
      rows.push(PAST_FLYERS.slice(i, i + 2));
    }

    return (
      <section className="section section-past" aria-labelledby="past-heading">
        <h2 id="past-heading" className="sr-only">
          Past Events
        </h2>

        <div className="flyer-grid" role="list" aria-label="Past event flyers">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flyer-row ${rowVisible[rowIndex] ? 'flyer-row-visible' : ''}`}
              ref={(el) => {
                rowRefs.current[rowIndex] = el;
              }}
              data-row-index={rowIndex}
              style={{
                transitionDelay: prefersReducedMotion ? '0ms' : `${rowIndex * 80}ms`,
              }}
              role="listitem"
            >
              {row.map((src, index) => (
                <div className="flyer-cell" key={index}>
                  <img
                    src={src}
                    alt={`ARCHIVE 404 past event ${rowIndex * 2 + index + 1}`}
                    decoding="async"
                    loading="lazy"
                    width={450}
                    height={450}
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
    <div className="icons" role="group" aria-label="Social media links">
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
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          role="img"
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
      <span className="dot" aria-hidden="true">
        ·
      </span>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Archive 404 on Instagram"
        className="iconlink"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          role="img"
        >
          <rect x="4" y="4" width="16" height="16" rx="4.5" ry="4.5" />
          <circle cx="12" cy="12" r="3.25" />
          <circle cx="17.2" cy="6.8" r="0.9" />
        </svg>
      </a>
      <span className="dot" aria-hidden="true">
        ·
      </span>
      <a
        href={MAILTO_URL}
        aria-label="Email Archive 404 at info@archv404.com"
        className="iconlink"
        style={{ lineHeight: 0 }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          role="img"
        >
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
          <path d="M5 8.5 12 13l7-4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );

  const tagClass = isEntering ? 'tag-hidden' : 'tag-visible';
  const navClass =
    page === 'home' ? (isEntering ? 'fade-hidden' : 'fade-visible') : 'fade-hidden';
  const navOffHomeClass = page === 'home' ? '' : 'nav-offhome';
  const footerFadeClass = isEntering ? 'footer-hidden' : 'footer-visible';
  const panelClass = isEntering ? 'panel-intro' : 'panel-steady';

  return (
    <>
      {/* Screen reader: live region for page navigation announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      <div className="root" style={{ fontFamily: FONT_STACK }}>
        {/* Skip to content link */}
        <a
          href="#main-content"
          className="skip-link"
          onClick={handleSkipToContent}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSkipToContent(e);
          }}
        >
          Skip to content
        </a>

        <div
          className="bg-layer"
          aria-hidden="true"
          style={{
            transform: prefersReducedMotion
              ? `translateZ(0) scale(${BASE_ZOOM})`
              : `translateZ(0) scale(${bgZoom})`,
          }}
        />

        <div
          className={`center ${page === 'home' ? 'center-home' : 'center-subpage'} ${
            page === 'upcoming' ? 'center-upcoming' : ''
          } ${page === 'about' ? 'center-about' : ''}`}
        >
          {/* Header with logo */}
          <header>
            <h1
              key={logoAnimKey}
              className={`logo-main ${prefersReducedMotion ? '' : 'logo-animate'}`}
              onPointerUp={(e) => onTouchActivate(e, () => handleNavigate('home'))}
              onClick={(e) => onClickActivate(e, () => handleNavigate('home'))}
              onKeyDown={(e) => handleLinkKeyDown(e, 'home')}
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              role="link"
              aria-label="Archive 404 — go to home page"
            >
              {LOGO_TEXT}
            </h1>
          </header>

          <p className={`tag ${tagClass}`} aria-hidden="true">
            THE ART OF SOUND
          </p>

          <nav
            aria-label="Main navigation"
            className={`nav ${navClass} ${navOffHomeClass}`}
            style={{ pointerEvents: page === 'home' ? 'auto' : 'none' }}
          >
            {nav.map(([label, key]) => (
              <button
                key={label}
                className="navbtn"
                tabIndex={page === 'home' ? 0 : -1}
                aria-hidden={page !== 'home'}
                onPointerUp={(e) =>
                  onTouchActivate(e, () => handleNavigate(key as Page))
                }
                onClick={(e) =>
                  onClickActivate(e, () => handleNavigate(key as Page))
                }
                >
                {label}
              </button>
            ))}
          </nav>

          <main
            id="main-content"
            ref={mainRef}
            className={`panel ${panelClass}`}
            tabIndex={-1}
            style={{ outline: 'none', pointerEvents: navLocked ? 'none' : 'auto' }}
          >
            {page === 'about' && (
              <section
                className="section about-section"
                aria-labelledby="about-heading"
              >
                <h2 id="about-heading" className="sr-only">
                  About Archive 404
                </h2>
                <article className="about">
                  <p className="about-block">{ABOUT_TEXT}</p>
                </article>
                <div className="homebtn-wrapper" style={{ marginTop: '40px' }}>
                  <button
                    className="homebtn"
                    onPointerUp={(e) =>
                      onTouchActivate(e, () => handleNavigate('home'))
                    }
                    onClick={(e) =>
                      onClickActivate(e, () => handleNavigate('home'))
                    }
        
                  >
                    HOME
                  </button>
                </div>
              </section>
            )}

            {page === 'upcoming' && renderUpcoming()}
            {page === 'past' && renderPast()}

            {page === 'artists' && (
              <section className="section" aria-labelledby="artists-heading">
                <h2 id="artists-heading" className="sr-only">
                  Artists
                </h2>

                <div className="artists-list" role="list" aria-label="Artist roster A to Z">
                  <p className="az-label" aria-hidden="true">
                    A–Z
                  </p>

                  {SORTED_ARTISTS.map((artist, index) => {
                    const isHighlight = HIGHLIGHT_ARTISTS.has(artist);
                    return (
                      <div key={artist} className="artist-block" role="listitem">
                        <p
                          className={`artist-name ${
                            artistVisible[index] ? 'artist-name-visible' : ''
                          } ${isHighlight ? 'artist-name-highlight' : ''}`}
                          ref={(el) => {
                            artistRefs.current[index] = el;
                            if (el)
                              (el as HTMLElement).dataset.artistIndex = String(index);
                          }}
                        >
                          {artist}
                        </p>
                        {artist === 'BOYSDONTCRY' && (
                          <p className="artist-resident" aria-label="Resident artist">
                            RESIDENT
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="homebtn-wrapper">
                  <button
                    className="homebtn"
                    onPointerUp={(e) =>
                      onTouchActivate(e, () => handleNavigate('home'))
                    }
                    onClick={(e) =>
                      onClickActivate(e, () => handleNavigate('home'))
                    }
        
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
/* ---------------------------------
   Screen reader only utility
---------------------------------- */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---------------------------------
   Skip to content link
---------------------------------- */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  color: #000;
  padding: 12px 24px;
  z-index: 10000;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  border-radius: 0 0 8px 8px;
  transition: top 0.15s ease;
}
.skip-link:focus {
  top: 0;
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* ---------------------------------
   Base / resets
---------------------------------- */
:root { color-scheme: dark; }
html, body {
  margin: 0;
  padding: 0;
  background: #000;
  font-family: ${FONT_STACK};
}

/* ---------------------------------
   Reduced motion: disable all animations/transitions
---------------------------------- */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .logo-animate {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .tag-hidden, .tag-visible {
    opacity: 0.95 !important;
    transform: none !important;
    transition: none !important;
  }
  .panel-intro, .panel-steady {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .footer-hidden, .footer-visible {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .fade-hidden, .fade-visible {
    transition: none !important;
  }
  .flyer-row {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .artist-name {
    opacity: 0.92 !important;
    transform: none !important;
    transition: none !important;
  }
  .navbtn {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
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
    url('https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto/v1763336289/IMG_5984_wjkvk6.jpg');
  background-position: center center, center 48%;
  background-size: cover, 115%;
  background-repeat: no-repeat, no-repeat;
  transform-origin: center center;
  transition: none;
  will-change: transform;
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

/* Header reset */
header {
  display: contents;
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
.logo-animate {
  animation: logo-intro 0.6s ease forwards;
  will-change: transform, opacity;
}

/* Focus visible indicator for logo */
.logo-main:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 8px;
  border-radius: 4px;
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

.nav-offhome {
  position: absolute !important;
  left: 0 !important;
  right: 0 !important;
  top: -9999px !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 0 !important;
  overflow: hidden !important;
}

/* ---------------------------------
   Shared glass buttons
---------------------------------- */
.navbtn,
.newsletter-btn,
.homebtn,
.ticket-btn {
  position: relative;
  pointer-events: auto;

  background: rgba(255, 255, 255, 0.008);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);

  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.06);
  outline: 1px solid rgba(255, 255, 255, 0.015);

  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  cursor: pointer;

  transition:
    opacity 0.6s ease,
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.25s ease;

  touch-action: manipulation;
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0.12);
  -webkit-user-select: none;
  user-select: none;
}

/* Focus visible indicators for all interactive glass buttons */
.navbtn:focus-visible,
.newsletter-btn:focus-visible,
.homebtn:focus-visible,
.ticket-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 3px;
}

.navbtn {
  z-index: 9999;
  min-height: 48px;
  min-width: 160px;
  padding: 12px 18px;
  border-radius: 10px;
  opacity: 0;
  transform: translateY(22px);
}

.nav.fade-visible .navbtn {
  opacity: 1;
  transform: translateY(0);
}

.newsletter-btn,
.homebtn {
  padding: 10px 18px;
  border-radius: 10px;
  min-height: 44px;
}

.homebtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

/* UPCOMING */
.upcoming {
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  line-height: 1.45;
  font-size: 16px;
  opacity: 0.95;
  margin-top: 10px;
}
.upcoming p { margin: 0; font-weight: 700; }

.upcoming-updated {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.upcoming-head { margin: 0; font-weight: 700; }
.ticket-btn-wrap { display: flex; justify-content: center; margin: 0; }
.upcoming-flyer-wrap { display: flex; justify-content: center; margin: 0; }
.upcoming-flyer-link {
  display: block;
  text-decoration: none;
  max-width: 320px;
  width: 100%;
}
.upcoming-flyer {
  display: block;
  width: 100%;
  height: auto;
  border: 0;
  border-radius: 0;
  content-visibility: auto;
  background-color: rgba(255, 255, 255, 0.03);
}
.upcoming-next {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}
.upcoming-sub {
  margin-top: -6px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.22em;
  font-size: 12px;
}

.ticket-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: auto;
  min-width: 240px;
  padding: 6px 18px;
  min-height: 30px;
  line-height: 1;

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;

  border-radius: 12px;
  text-decoration: none;

  border: 1px solid rgba(255, 255, 255, 0.10);
  outline: 1px solid rgba(255, 255, 255, 0.015);

  background: rgba(255, 255, 255, 0.010);

  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);

  overflow: hidden;
  transform: translateZ(0);
  will-change: transform;
  isolation: isolate;
}

.ticket-btn > * { position: relative; z-index: 2; }
.ticket-btn::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
  pointer-events: none;
  z-index: 1;
}

.ticket-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -70%;
  width: 60%;
  height: 200%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
  transform: rotate(18deg);
  opacity: 0;
  pointer-events: none;
  z-index: 3;
}

@media (hover: hover) and (pointer: fine) {
  .navbtn:hover,
  .newsletter-btn:hover:not(:disabled),
  .homebtn:hover,
  .ticket-btn:hover {
    background: rgba(255, 255, 255, 0.018);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 180, 90, 0.06);
    transform: translateY(-1px);
  }
  .ticket-btn:hover::after {
    opacity: 1;
    left: 130%;
    transition: left 0.65s ease, opacity 0.2s ease;
  }
  .iconlink:hover { opacity: 1; }
}

.newsletter-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.panel {
  position: relative;
  z-index: 1;
  margin: 12px auto 0;
  padding: 0;
  max-width: 900px;
}
.panel-intro { opacity: 0; transform: translateY(32px); }
.panel-steady {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.section {
  text-align: left;
  margin: 18px auto 0;
  max-width: 900px;
}
.section-past { padding: 24px 20px 40px; }

.about-section { padding-top: 0; padding-bottom: 24px; }

.about {
  max-width: 38ch;
  margin: 0 auto;
  text-transform: uppercase;
}
.about-block {
  margin: 0 0 24px;
  line-height: 1.5;
  font-size: 15px;
  opacity: 0.95;
  text-align: justify;
  text-align-last: justify;
  text-justify: inter-word;
  letter-spacing: 0.02em;
}

.upcoming-section {
  display: flex;
  flex-direction: column;
  min-height: 72vh;
}
.upcoming-section .upcoming {
  margin-top: 34px;
}
.upcoming-newsletter {
  margin-top: auto;
  padding-top: 18px;
}
.upcoming-homebtn {
  margin-top: 28px;
}

/* Newsletter */
.newsletter {
  margin: 40px auto 0;
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

.newsletter-form {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.newsletter-input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  letter-spacing: 0.12em;
  font-size: 11px;
  outline: none;
  min-height: 44px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  -webkit-text-fill-color: #fff !important;
  caret-color: #fff !important;
}

/* Focus visible for input */
.newsletter-input:focus-visible {
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
  box-shadow: 0 0 0px 1000px transparent inset !important;
  background: transparent !important;
  -webkit-text-fill-color: #fff !important;
}

.newsletter-input::placeholder { color: rgba(255, 255, 255, 0.45); }

.newsletter-input:hover,
.newsletter-input:focus {
  border-color: rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 20px 6px rgba(255, 180, 90, 0.20);
}

.newsletter-message {
  margin-bottom: 26px;
  margin-top: 10px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  opacity: 0.8;
}

/* PAST */
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
.flyer-row-visible { opacity: 1; transform: translateY(0); }
.flyer-cell img {
  display: block;
  width: 100%;
  height: auto;
  content-visibility: auto;
  background-color: rgba(255, 255, 255, 0.03);
}

/* ARTISTS */
.artists-list {
  max-width: 76ch;
  margin: 8px auto 0;
  text-align: center;
}
.az-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.22em;
  font-size: 16px;
  margin-bottom: 24px;
  text-transform: uppercase;
}
.artist-block { display: flex; flex-direction: column; align-items: center; }
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
.artist-name-visible { opacity: 0.92; transform: translateY(0); }
.artist-name-highlight { color: #fff; }
.artist-resident {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.22em;
  font-size: 10px;
  margin-top: -10px;
  text-transform: uppercase;
}

/* FOOTER / ICONS */
.icons { display: flex; align-items: center; justify-content: center; }
.iconlink {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  color: #fff;
  opacity: 0.96;
  text-decoration: none;
  /* Minimum 44x44 touch target */
  min-width: 44px;
  min-height: 44px;
}
.iconlink:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 3px;
  border-radius: 4px;
}
.dot { display: inline-block; margin: 0 0.6rem; opacity: 0.75; }

.homebtn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 54px;
  margin-bottom: 80px;
}

.footer {
  pointer-events: none;
  width: 100%;
  padding: 14px 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
}
.footer-hidden { opacity: 0; transform: translateY(32px); }
.footer-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-hidden { opacity: 0; }
.fade-visible { opacity: 1; }

@media (max-width: 640px) {
  .bg-layer {
    background-image:
      linear-gradient(rgba(0, 0, 0, 0.30), rgba(0, 0, 0, 0.40)),
      url('https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto/v1763336289/IMG_5984_wjkvk6.jpg');
    background-position: center center, center 55%;
    background-size: cover, 118%;
  }

  .logo-main {
    font-size: clamp(36px, 16vw, 72px);
    white-space: nowrap;
  }

  .center-home {
    padding-top: 16vh;
    padding-bottom: 2vh;
    min-height: 96vh;
    justify-content: flex-start;
  }

  .center-subpage {
    padding-top: 12vh;
    padding-bottom: 8vh;
    min-height: 96vh;
    justify-content: flex-start;
  }

  .center-upcoming {
    padding-top: 10vh;
    padding-bottom: 2vh;
    min-height: 96vh;
    justify-content: flex-start;
  }

  .center-about {
    padding-top: 10vh;
    padding-bottom: 2vh;
    min-height: 96vh;
    justify-content: flex-start;
  }

  .about { max-width: 34ch; }

  .nav { margin-top: 32px; gap: 16px; }
  .center-home .nav { margin-top: 96px; }

  .upcoming-section { min-height: 76vh; }
  .upcoming-section .upcoming { margin-top: 26px; }
  .upcoming-homebtn { margin-bottom: 80px; }
  .upcoming-flyer-link { max-width: 300px; }

  .upcoming-updated { gap: 12px; }
  .upcoming-next { margin-top: 18px; }

  .ticket-btn {
    min-width: 232px;
    padding: 6px 16px;
    min-height: 29px;
    border-radius: 11px;
    font-size: 11.5px;
  }
  .ticket-btn::before {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.032);
  }
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
