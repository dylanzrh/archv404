import React, { useEffect, useMemo, useRef, useState } from 'react';

/* ---------------------------------
   CONSTANTS
---------------------------------- */
const LOGO_TEXT = 'ARCHIVE 404';
const FONT_STACK = 'Helvetica Neue, Helvetica, Arial, sans-serif';

const INSTAGRAM_URL = 'https://instagram.com/archv404';
const MAILTO_URL = 'mailto:info@archv404.com';
const WHATSAPP_URL = 'https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN';

const TICKET_URL = 'https://supermarket.li/events/archive-404-5/';
const UPCOMING_FLYER_URL =
  'https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1770251160/IMG_1687_wvmczm.png';

/* ---------------------------------
   ARTISTS
---------------------------------- */
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

/* ---------------------------------
   SORTING
   Only names STARTING with numbers go last
---------------------------------- */
const startsWithNumber = (name: string) => /^[0-9]/.test(name);

const sortArtists = (names: string[]) => {
  const normal = names.filter((n) => !startsWithNumber(n));
  const numeric = names.filter((n) => startsWithNumber(n));

  const collator = new Intl.Collator('en', {
    sensitivity: 'base',
    numeric: true,
  });

  normal.sort((a, b) => collator.compare(a, b));
  numeric.sort((a, b) => collator.compare(a, b));

  return [...normal, ...numeric];
};

/* ---------------------------------
   COMPONENT
---------------------------------- */
export default function Preview() {
  const SORTED_ARTISTS = useMemo(() => sortArtists(ARTISTS), []);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const upcomingLineRef = useRef<HTMLSpanElement | null>(null);
  const [upcomingWidth, setUpcomingWidth] = useState<number>(0);

  /* Measure headline width → flyer width */
  useEffect(() => {
    const measure = () => {
      const w = upcomingLineRef.current?.getBoundingClientRect().width ?? 0;
      if (w > 0) setUpcomingWidth(w);
    };

    requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const flyerPx = upcomingWidth;

  /* Ticket button SMALLER than flyer */
  const buttonPx =
    flyerPx > 0 ? Math.max(150, Math.min(Math.round(flyerPx * 0.65), flyerPx - 50)) : 0;

  /* Newsletter submit */
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsSubmittingNewsletter(true);
    setNewsletterMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 800));
      setNewsletterMessage('WELCOME TO THE ARCHIVE FAMILY.');
      setNewsletterEmail('');
    } catch {
      setNewsletterMessage('SOMETHING WENT WRONG.');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  /* ---------------------------------
     RENDER
  ---------------------------------- */
  return (
    <div className="root" style={{ fontFamily: FONT_STACK }}>
      <h1 className="logo">{LOGO_TEXT}</h1>
      <p className="tag">THE ART OF SOUND</p>

      {/* UPCOMING */}
      <section className="upcoming">
        <span ref={upcomingLineRef} className="headline">
          FEB 27 SUPERMARKET CLUB
        </span>

        <a
          href={TICKET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ticket"
          style={{ width: buttonPx }}
        >
          GET YOUR TICKET
        </a>

        <a
          href={TICKET_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ width: flyerPx }}
          className="flyerLink"
        >
          <img src={UPCOMING_FLYER_URL} className="flyer" />
        </a>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <form onSubmit={handleNewsletterSubmit} className="newsletterForm">
          <input
            type="email"
            required
            placeholder="EMAIL"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
          />
          <button disabled={isSubmittingNewsletter}>
            {isSubmittingNewsletter ? 'SENDING…' : 'JOIN'}
          </button>
        </form>

        {newsletterMessage && <p className="msg">{newsletterMessage}</p>}
      </section>

      {/* ARTISTS */}
      <section className="artists">
        {SORTED_ARTISTS.map((a) => (
          <p key={a}>{a}</p>
        ))}
      </section>

      {/* STYLES */}
      <style>{`
        body { margin:0; background:#000; color:#fff; }

        .root { text-align:center; padding:60px 20px; }

        .logo {
          font-size: clamp(40px, 10vw, 120px);
          font-weight:700;
          letter-spacing:-0.05em;
          margin:0;
        }

        .tag {
          margin-top:16px;
          letter-spacing:0.3em;
          opacity:.8;
        }

        .upcoming { margin-top:60px; }

        .headline {
          display:inline-block;
          font-weight:700;
          letter-spacing:0.18em;
        }

        .flyerLink { display:block; margin:20px auto 0; }
        .flyer { width:100%; border:1px solid rgba(255,255,255,.1); }

        .ticket {
          display:inline-flex;
          justify-content:center;
          align-items:center;
          margin-top:16px;
          padding:6px 14px;
          font-size:12px;
          letter-spacing:0.18em;
          font-weight:700;

          background: rgba(255,255,255,.05);
          backdrop-filter: blur(4px);
          border:1px solid rgba(255,255,255,.25);
          text-decoration:none;
          color:#fff;
        }

        .newsletter { margin-top:80px; }
        .newsletterForm { display:flex; justify-content:center; gap:10px; }
        .newsletterForm input {
          padding:10px;
          background:transparent;
          border:1px solid rgba(255,255,255,.3);
          color:#fff;
        }
        .newsletterForm button {
          padding:10px 16px;
          background:transparent;
          border:1px solid rgba(255,255,255,.4);
          color:#fff;
          letter-spacing:.15em;
        }

        .artists { margin-top:80px; opacity:.9; }
        .artists p { margin:6px 0; letter-spacing:.15em; }
      `}</style>
    </div>
  );
}
