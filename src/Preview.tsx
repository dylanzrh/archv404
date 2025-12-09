import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------
// Constants / Config
// ---------------------------------
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

// Upcoming flyer URL (original, stable)
const UPCOMING_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/v1765023902/AR4_Instagram-Post_251203_l5i1md.png';

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
  const [bgZoom, setBgZoom] = useState(1);
  const scrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);
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

  // Preload upcoming flyer so it’s ready when user taps UPCOMING
  useEffect(() => {
    const img = new Image();
    img.src = UPCOMING_FLYER_URL;
  }, []);

  useEffect(() => {
    const maxZoom = 1.08;
    const maxScroll = 600;

    const calcZoom = (scrollY: number) => {
      const clamped = Math.min(Math.max(scrollY, 0), maxScroll);
      return 1 + (clamped / maxScroll) * (maxZoom - 1);
    };

    function tick() {
      const target = calcZoom(scrollYRef.current);

      setBgZoom((prev) => {
        const eased = prev + (target - prev) * 0.08;

        if (Math.abs(eased - target) < 0.001) {
          rafRef.current = null;
          return target;
        }

        rafRef.current = window.requestAnimationFrame(tick);
        return eased;
      });
    }

    const handleScroll = () => {
      if (inputFocusedRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      scrollYRef.current = scrollY;

      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
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
