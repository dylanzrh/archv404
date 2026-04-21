import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================================
   ARCHIVE 404
========================================= */

const LOGO_TEXT = "ARCHIVE 404";
const FONT_STACK = "Helvetica Neue, Helvetica, Arial, sans-serif";

const INSTAGRAM_URL = "https://instagram.com/archv404";
const MAILTO_URL = "mailto:info@archv404.com";
const WHATSAPP_URL =
  "https://chat.whatsapp.com/LhIUP32cBH25L9Pn4u78ZN";

/* ---------- Upcoming ---------- */
const MAY8_FLYER_URL =
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1776801767/AR405_Instagram-Post-Lineup-Grey-4-5_260409_lsw2xb.jpg";

const MAY8_TICKET_URL =
  "https://tickets.samigo.ch/en/events/archive-404";

/* ---------- Past ---------- */
const APR17_FLYER_URL =
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1774627082/AR402_Instagram-Post_SH_260227_01_Instapost_Grau_tcxhpc.jpg";

const FEB27_FLYER_URL =
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1770251160/IMG_1687_wvmczm.png";

const ZURICH_JAN30_FLYER_URL =
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1769005674/AR402_Instagram-Post_SH_260121-08_qxhube.png";

const ST_MORITZ_FLYER_URL =
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1765023902/AR4_Instagram-Post_251203_l5i1md.png";

const ABOUT_TEXT =
  "ARCHIVE 404 IS A ZURICH-BASED EVENT LABEL CRAFTING CAREFULLY DESIGNED EXPERIENCES WHERE MUSIC, LIGHT AND SPACE CREATE IMMERSIVE MOMENTS. ITS NAME REINTERPRETS A DIGITAL ERROR AS AN INVITATION TO RECONNECT THROUGH PEOPLE AND SOUND. BY BRINGING TOGETHER RESPECTED INTERNATIONAL ARTISTS AND SOME OF THE MOST PROMISING LOCAL TALENTS, ARCHIVE 404 CREATES A DISTINCT ENERGY THAT FEELS CONTEMPORARY YET TIMELESS.";

const PAST_FLYERS = [
  APR17_FLYER_URL,
  FEB27_FLYER_URL,
  ZURICH_JAN30_FLYER_URL,
  ST_MORITZ_FLYER_URL,
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060268/archive404_251025_post_yus7xj.jpg",
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060242/archive03102025_post_eptqbf.jpg",
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060222/ARCHIVE404_06082025_Palm3_wjeh8o.jpg",
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060209/ARCHIVE404_06082025_Soluna_zv1cfx.jpg",
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060195/ARCHIVE404_04072025_POST_ptktcy.jpg",
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060161/ARCHIVE404_02052025_POST01_ly44jq.jpg",
  "https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto,w_900/v1763060124/ARCHIVE404_280225_POST03_LOGO_nqcgah.jpg",
];

/* keep 2M last */
const ARTISTS = [
  "ANCHI",
  "ARWIN AZIZ",
  "AXEL NORD",
  "BOYSDONTCRY",
  "CALI:BER",
  "CAMILLO",
  "DARREN",
  "DE:AN",
  "DEBARRO",
  "DANGEL TWINS",
  "DYZEN",
  "FELIX DE LEON",
  "GIANNI",
  "GIORGIO",
  "HEUER",
  "HOMEOFFICE",
  "JOSEPH",
  "JULIA LINKOGEL",
  "KASSETTE",
  "LOU COMBO",
  "MATTEOMIE",
  "MICHELLE VANJA",
  "MORIS",
  "ORSAY",
  "PAUL ALMQVIST",
  "ROCCO",
  "RONNY GRAUER",
  "RUBEN SCORZA",
  "SAM MADI",
  "SEBASTIAN KONRAD",
  "SIELLE",
  "SOLIQUE",
  "TIM ENGELHARDT",
  "WHEREISVERO",
  "YENI:SAM",
  "2M",
];

const HIGHLIGHT_ARTISTS = new Set([
  "DANGEL TWINS",
  "DYZEN",
  "SEBASTIAN KONRAD",
  "TIM ENGELHARDT",
]);

type Page = "home" | "upcoming" | "past" | "artists" | "about";

const pageToPath = (p: Page) => {
  if (p === "home") return "/";
  return `/${p}`;
};

const pathToPage = (pathname: string): Page => {
  const clean =
    (pathname || "/").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (clean === "/") return "home";
  if (clean === "/upcoming") return "upcoming";
  if (clean === "/past") return "past";
  if (clean === "/artists") return "artists";
  if (clean === "/about") return "about";
  return "home";
};

export default function Preview() {
  const [page, setPage] = useState<Page>("home");
  const [isEntering, setIsEntering] = useState(true);
  const [logoAnimKey, setLogoAnimKey] = useState(0);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(
    null
  );
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] =
    useState(false);

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artistRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const [rowVisible, setRowVisible] = useState<boolean[]>(
    Array.from(
      { length: Math.ceil(PAST_FLYERS.length / 2) },
      (_, i) => i === 0
    )
  );

  const [artistVisible, setArtistVisible] = useState<boolean[]>(
    ARTISTS.map(() => false)
  );

  const nav = useMemo(
    () =>
      [
        ["UPCOMING", "upcoming"],
        ["PAST", "past"],
        ["ARTISTS", "artists"],
        ["ABOUT", "about"],
      ] as const,
    []
  );

  const playIntro = () => {
    setIsEntering(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsEntering(false))
    );
  };

  useEffect(() => {
    const apply = () => {
      const next = pathToPage(window.location.pathname);
      setPage(next);
      setLogoAnimKey((k) => k + 1);
      playIntro();
    };

    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  const navigate = (next: Page) => {
    if (next === page) return;
    setPage(next);
    setLogoAnimKey((k) => k + 1);
    playIntro();
    window.history.pushState({}, "", pageToPath(next));
    window.scrollTo(0, 0);

    if (next === "artists") {
      setArtistVisible(ARTISTS.map(() => false));
    }

    if (next === "past") {
      setRowVisible(
        Array.from(
          { length: Math.ceil(PAST_FLYERS.length / 2) },
          (_, i) => i === 0
        )
      );
    }
  };

  useEffect(() => {
    if (page !== "artists") return;

    const observer = new IntersectionObserver(
      (entries) => {
        setArtistVisible((prev) => {
          const next = [...prev];
          let changed = false;

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idx = Number(
              (entry.target as HTMLElement).dataset.index
            );
            if (!next[idx]) {
              next[idx] = true;
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      },
      { threshold: 0.08, rootMargin: "200px 0px" }
    );

    artistRefs.current.forEach((el, i) => {
      if (!el) return;
      el.dataset.index = String(i);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [page]);

  useEffect(() => {
    if (page !== "past") return;

    const observer = new IntersectionObserver(
      (entries) => {
        setRowVisible((prev) => {
          const next = [...prev];
          let changed = false;

          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const idx = Number(
              (entry.target as HTMLElement).dataset.index
            );
            if (!next[idx]) {
              next[idx] = true;
              changed = true;
            }
          });

          return changed ? next : prev;
        });
      },
      { threshold: 0.08, rootMargin: "200px 0px" }
    );

    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      el.dataset.index = String(i);
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [page]);

  const submitNewsletter = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;

    setIsSubmittingNewsletter(true);
    setNewsletterMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 800));
      setNewsletterMessage("WELCOME TO THE ARCHIVE FAMILY.");
      setNewsletterEmail("");
    } catch {
      setNewsletterMessage("SOMETHING WENT WRONG.");
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const renderUpcoming = () => (
    <section className="section upcoming-section">
      <div className="upcoming upcoming-updated">
        <div className="upcoming-next upcoming-line">
          <p className="upcoming-head">MAY 8 SAMIGO</p>
        </div>

        <div className="upcoming-ticket-wrap upcoming-ticket-wrap-top">
          <a
            href={MAY8_TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ticketbtn"
          >
            TICKETS
          </a>
        </div>

        <div className="upcoming-flyer-wrap">
          <a
            href={MAY8_TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="upcoming-flyer-link"
          >
            <img
              src={MAY8_FLYER_URL}
              alt="ARCHIVE 404 MAY 8 SAMIGO"
              className="upcoming-flyer"
              loading="eager"
              fetchPriority="high"
            />
          </a>
        </div>
      </div>

      <div className="newsletter upcoming-newsletter">
        <p className="newsletter-label">FOR THOSE WHO KNOW.</p>

        <form className="newsletter-form" onSubmit={submitNewsletter}>
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
            {isSubmittingNewsletter ? "SENDING…" : "JOIN"}
          </button>
        </form>

        {newsletterMessage && (
          <p className="newsletter-message">{newsletterMessage}</p>
        )}
      </div>

      <div className="homebtn-wrapper upcoming-homebtn">
        <button className="homebtn" onClick={() => navigate("home")}>
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
              ref={(el) => (rowRefs.current[rowIndex] = el)}
              className={`flyer-row ${
                rowVisible[rowIndex] ? "flyer-row-visible" : ""
              }`}
            >
              {row.map((src, i) => (
                <div className="flyer-cell" key={i}>
                  <img src={src} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="homebtn-wrapper">
          <button className="homebtn" onClick={() => navigate("home")}>
            HOME
          </button>
        </div>
      </section>
    );
  };

  const renderArtists = () => (
    <section className="section">
      <div className="artists-list">
        <p className="az-label">A–Z</p>

        {ARTISTS.map((artist, index) => {
          const isHighlight = HIGHLIGHT_ARTISTS.has(artist);

          return (
            <div key={artist} className="artist-block">
              <p
                ref={(el) => (artistRefs.current[index] = el)}
                className={`artist-name ${
                  artistVisible[index] ? "artist-name-visible" : ""
                } ${isHighlight ? "artist-name-highlight" : ""}`}
              >
                {artist}
              </p>

              {artist === "BOYSDONTCRY" && (
                <p className="artist-resident">RESIDENT</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="homebtn-wrapper">
        <button className="homebtn" onClick={() => navigate("home")}>
          HOME
        </button>
      </div>
    </section>
  );

  return (
    <>
      <div className="root" style={{ fontFamily: FONT_STACK }}>
        <div className="bg-layer" />

        <div
          className={`center ${
            page === "home" ? "center-home" : "center-subpage"
          } ${page === "upcoming" ? "center-upcoming" : ""}`}
        >
          <h1
            key={logoAnimKey}
            className="logo-main logo-animate"
            onClick={() => navigate("home")}
          >
            {LOGO_TEXT}
          </h1>

          <p className={`tag ${isEntering ? "tag-hidden" : "tag-visible"}`}>
            THE ART OF SOUND
          </p>

          <nav
            className={`nav ${
              page === "home"
                ? isEntering
                  ? "fade-hidden"
                  : "fade-visible"
                : "nav-offhome"
            }`}
          >
            {nav.map(([label, key]) => (
              <button
                key={label}
                className="navbtn"
                onClick={() => navigate(key as Page)}
              >
                {label}
              </button>
            ))}
          </nav>

          <main
            className={`panel ${
              isEntering ? "panel-intro" : "panel-steady"
            }`}
          >
            {page === "upcoming" && renderUpcoming()}
            {page === "past" && renderPast()}
            {page === "artists" && renderArtists()}

            {page === "about" && (
              <section className="section about-section">
                <article className="about">
                  <p className="about-block">{ABOUT_TEXT}</p>
                </article>

                <div className="homebtn-wrapper">
                  <button
                    className="homebtn"
                    onClick={() => navigate("home")}
                  >
                    HOME
                  </button>
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className="footer footer-visible">
          <div className="icons">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="iconlink"
            >
              WA
            </a>
            <span className="dot">·</span>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="iconlink"
            >
              IG
            </a>
            <span className="dot">·</span>
            <a
              href={MAILTO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="iconlink"
            >
              MAIL
            </a>
          </div>
        </footer>

        <style>{`
:root { color-scheme: dark; }

html, body {
  margin:0;
  padding:0;
  background:#000;
}

.root{
  min-height:100vh;
  color:#fff;
  position:relative;
  overflow:hidden;
}

.bg-layer{
  position:fixed;
  inset:0;
  z-index:0;
  background-image:
    linear-gradient(rgba(0,0,0,.32), rgba(0,0,0,.44)),
    url('https://res.cloudinary.com/dsas5i0fx/image/upload/f_auto,q_auto/v1763336289/IMG_5984_wjkvk6.jpg');
  background-size:cover,115%;
  background-position:center center, center 48%;
}

.center{
  position:relative;
  z-index:1;
  max-width:900px;
  margin:0 auto;
  padding:6vh 24px 8vh;
  text-align:center;
}

.center-home{
  min-height:90vh;
  display:flex;
  flex-direction:column;
  justify-content:center;
}

.center-subpage{
  padding-top:4vh;
}

.center-upcoming{
  padding-top:10vh;
}

.logo-main{
  margin:0;
  font-size:clamp(36px,12vw,140px);
  font-weight:700;
  line-height:.86;
  letter-spacing:-0.082em;
  cursor:pointer;
}

.logo-animate{
  animation:logoIntro .6s ease forwards;
}

.tag{
  margin-top:20px;
  margin-bottom:40px;
  letter-spacing:.28em;
  font-size:clamp(12px,2.4vw,16px);
}

.tag-hidden{
  opacity:0;
  transform:translateY(30px);
}

.tag-visible{
  opacity:.95;
  transform:translateY(0);
  transition:.6s ease;
}

.nav{
  display:flex;
  flex-wrap:wrap;
  gap:24px;
  justify-content:center;
}

.nav-offhome{
  display:none;
}

.fade-hidden{
  opacity:0;
}

.fade-visible{
  opacity:1;
}

.navbtn,
.homebtn,
.newsletter-btn,
.ticketbtn{
  background:rgba(255,255,255,.01);
  border:1px solid rgba(255,255,255,.08);
  color:#fff;
  padding:10px 18px;
  border-radius:10px;
  letter-spacing:.12em;
  font-size:11px;
  cursor:pointer;
  text-transform:uppercase;
  text-decoration:none;
}

.panel{
  margin-top:12px;
}

.panel-intro{
  opacity:0;
  transform:translateY(30px);
}

.panel-steady{
  opacity:1;
  transform:translateY(0);
  transition:.6s ease;
}

.section{
  max-width:900px;
  margin:0 auto;
}

.upcoming{
  text-transform:uppercase;
}

.upcoming-updated{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px;
}

.upcoming-line{
  margin-top:20px;
}

.upcoming-head{
  margin:0;
  font-weight:700;
  letter-spacing:.2em;
  font-size:16px;
}

.upcoming-ticket-wrap-top{
  margin-top:2px;
  margin-bottom:2px;
}

.ticketbtn{
  min-width:160px;
  display:inline-flex;
  justify-content:center;
}

.upcoming-flyer-wrap{
  width:100%;
  max-width:300px;
}

.upcoming-flyer-link{
  display:block;
  line-height:0;
}

.upcoming-flyer{
  width:100%;
  height:auto;
  display:block;
}

.newsletter{
  margin:40px auto 0;
  max-width:420px;
}

.newsletter-label{
  font-size:13px;
  letter-spacing:.26em;
}

.newsletter-form{
  display:flex;
  gap:12px;
  margin-top:10px;
}

.newsletter-input{
  flex:1;
  padding:10px 14px;
  background:transparent;
  border:1px solid rgba(255,255,255,.16);
  border-radius:8px;
  color:#fff;
}

.newsletter-message{
  margin-top:10px;
  font-size:11px;
  letter-spacing:.16em;
}

.flyer-grid{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.flyer-row{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:20px;
  opacity:0;
  transform:translateY(10px);
  transition:.6s ease;
}

.flyer-row-visible{
  opacity:1;
  transform:translateY(0);
}

.flyer-cell img{
  width:100%;
  display:block;
}

.artists-list{
  text-align:center;
}

.az-label{
  margin-bottom:24px;
  letter-spacing:.22em;
}

.artist-name{
  margin:8px 0;
  opacity:0;
  transform:translateY(6px);
  transition:.4s ease;
  letter-spacing:.18em;
}

.artist-name-visible{
  opacity:.92;
  transform:translateY(0);
}

.artist-name-highlight{
  font-weight:700;
}

.artist-resident{
  font-size:10px;
  opacity:.6;
  margin-top:-8px;
  letter-spacing:.22em;
}

.about{
  max-width:38ch;
  margin:0 auto;
}

.about-block{
  line-height:1.5;
  text-align:justify;
}

.homebtn-wrapper{
  margin-top:54px;
  margin-bottom:80px;
  display:flex;
  justify-content:center;
}

.footer{
  position:fixed;
  left:0;
  right:0;
  bottom:0;
  padding:14px 0 18px;
  z-index:5;
}

.icons{
  display:flex;
  justify-content:center;
  align-items:center;
}

.iconlink{
  color:#fff;
  text-decoration:none;
  font-size:12px;
  letter-spacing:.16em;
}

.dot{
  margin:0 .6rem;
}

@media (max-width:640px){
  .logo-main{
    font-size:clamp(36px,16vw,72px);
    white-space:nowrap;
  }

  .center-home{
    padding-top:16vh;
    min-height:96vh;
    justify-content:flex-start;
  }

  .center-subpage{
    padding-top:12vh;
  }

  .upcoming-flyer-wrap{
    max-width:280px;
  }

  .ticketbtn{
    min-width:144px;
  }
}

@keyframes logoIntro{
  from{
    opacity:0;
    transform:translateY(-32px);
  }
  to{
    opacity:1;
    transform:translateY(0);
  }
}
        `}</style>
      </div>
    </>
  );
}
