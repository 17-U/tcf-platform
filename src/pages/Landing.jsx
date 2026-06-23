import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

/* ─────────────────────────────────────────────────────────────
   PERSONNALISATION RAPIDE
   - BRAND : le nom de ton centre (apparaît dans le header et le footer)
   - CONTACT : tes vraies coordonnées
   - SLIDES : remplace les "image" par TES photos. Le plus simple :
       1) mets tes photos dans le dossier  public/  (ex : public/hero1.jpg)
       2) écris  image: "/hero1.jpg"
     Les photos par défaut sont libres de droits (Unsplash) et remplaçables.
   ───────────────────────────────────────────────────────────── */
const BRAND = "Le Relais Formation";
const CONTACT = {
    phone: "+237 6 00 00 00 00",
    email: "contact@lerelaisformation.com",
    whatsapp: "https://wa.me/2376000000000",
    city: "Yaoundé, Cameroun",
};

const SLIDES = [
    {
        eyebrow: "Immigration Canada",
        title: "Réussissez votre TCF, TEF ou IELTS",
        text: "Une préparation complète et structurée pour atteindre le score exigé, du premier coup.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80&auto=format&fit=crop",
    },
    {
        eyebrow: "Vos opportunités",
        title: "Ouvrez-vous les portes du Canada",
        text: "Études, travail, résidence : maîtriser le français et l'anglais change votre avenir.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80&auto=format&fit=crop",
    },
    {
        eyebrow: "Méthode éprouvée",
        title: "Apprenez avec une méthode qui marche",
        text: "Cours interactifs, tests blancs en ligne et suivi personnalisé jusqu'au jour de l'examen.",
        image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1600&q=80&auto=format&fit=crop",
    },
];

const SERVICES = [
    { icon: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.42A12 12 0 0112 21a12 12 0 01-6.16-10.42L12 14z", title: "TCF Canada", text: "Préparation ciblée aux quatre épreuves du TCF pour l'immigration." },
    { icon: "M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z", title: "TEF Canada", text: "Entraînement intensif au TEF avec corrections détaillées." },
    { icon: "M3 5h12M9 3v2m1.5 14H21M14 13l3 6 3-6 M9 17l-3-12-3 12 M5 11h8", title: "IELTS", text: "Reading, writing, listening et speaking : stratégie pour chaque band." },
    { icon: "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11", title: "Tests blancs en ligne", text: "Passez des simulations d'examen autant de fois que vous voulez." },
    { icon: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z", title: "Expression écrite & orale", text: "Sujets corrigés par un formateur avec retour personnalisé." },
    { icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75", title: "Suivi personnalisé", text: "Un accompagnement et des consignes jusqu'au jour J." },
];

const STATS = [
    { v: "95%", k: "de réussite" },
    { v: "1200+", k: "candidats préparés" },
    { v: "3", k: "examens couverts" },
    { v: "J-J", k: "suivi jusqu'au jour J" },
];

const TESTIMONIALS = [
    { name: "Awa D.", result: "TCF Canada — NCLC 8", quote: "Méthode claire et tests réalistes. J'ai eu mon score dès la première tentative." },
    { name: "Yann M.", result: "TEF Canada — NCLC 9", quote: "Le suivi du formateur a tout changé, surtout pour l'expression orale." },
    { name: "Sara O.", result: "IELTS — Band 7.5", quote: "Les simulations en ligne m'ont mise en confiance. Je recommande à 100%." },
];

const FAQS = [
    { q: "À quels examens préparez-vous ?", a: "Nous préparons au TCF Canada, au TEF Canada et à l'IELTS, pour les projets d'immigration, d'études et de travail." },
    { q: "Comment se passent les cours ?", a: "Vous accédez à une plateforme en ligne avec cours, tests blancs et suivi personnalisé. Vous passez les épreuves librement, autant de fois que nécessaire." },
    { q: "Comment obtenir un compte ?", a: "Contactez-nous : nous créons votre accès candidat et vous accompagnons dès votre inscription." },
    { q: "Puis-je m'entraîner sur mobile ?", a: "Oui, la plateforme fonctionne sur téléphone, tablette et ordinateur." },
    { q: "Recevez-vous une correction pour l'écrit et l'oral ?", a: "Oui. Vos productions écrites et orales sont corrigées par un formateur, avec une note et des commentaires." },
];

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [slide, setSlide] = useState(0);
    const [broken, setBroken] = useState({});
    const [openFaq, setOpenFaq] = useState(0);

    const ctaTarget = user
        ? user.role === "admin" ? "/utilisateurs" : "/tests"
        : "/connexion";
    const ctaLabel = user ? "Mon espace" : "Se connecter";

    useEffect(() => {
        const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="lp">
            {/* HEADER */}
            <header className="lp-header">
                <a href="#top" className="lp-brand">
                    <span className="lp-mark">
                        <svg width="20" height="20" viewBox="0 0 32 32"><path d="M16 4l1.7 4.4 4.2-1.3-1.7 4.1 3.8 1.7-3.6 1.9 2.3 4-4.3-1 .3 4.5L16 25l-2.7-1.4.3-4.5-4.3 1 2.3-4-3.6-1.9 3.8-1.7L4 8.5l4.2 1.3L16 4z" fill="#fff" /></svg>
                    </span>
                    <span>{BRAND}</span>
                </a>
                <nav className="lp-nav">
                    <a href="#services">Services</a>
                    <a href="#temoignages">Témoignages</a>
                    <a href="#faq">FAQ</a>
                    <a href="#contact">Contact</a>
                </nav>
                <button className="lp-btn lp-btn-sm" onClick={() => navigate(ctaTarget)}>{ctaLabel}</button>
            </header>

            {/* HERO CARROUSEL */}
            <section className="lp-hero" id="top">
                {SLIDES.map((s, i) => (
                    <div key={i} className={"lp-slide" + (i === slide ? " active" : "")}>
                        {!broken[i] && (
                            <img
                                src={s.image}
                                alt=""
                                className="lp-slide-img"
                                onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                            />
                        )}
                        <div className="lp-slide-overlay" />
                        <div className="lp-slide-content">
                            <span className="lp-eyebrow">{s.eyebrow}</span>
                            <h1>{s.title}</h1>
                            <p>{s.text}</p>
                            <div className="lp-hero-actions">
                                <button className="lp-btn lp-btn-accent" onClick={() => navigate(ctaTarget)}>
                                    {user ? "Accéder à la plateforme" : "Commencer maintenant"}
                                </button>
                                <a href="#contact" className="lp-btn lp-btn-light">Nous contacter</a>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="lp-dots">
                    {SLIDES.map((_, i) => (
                        <button key={i} aria-label={`Slide ${i + 1}`} className={i === slide ? "on" : ""} onClick={() => setSlide(i)} />
                    ))}
                </div>
            </section>

            {/* STATS */}
            <section className="lp-stats">
                {STATS.map((s, i) => (
                    <div key={i}><strong>{s.v}</strong><span>{s.k}</span></div>
                ))}
            </section>

            {/* SERVICES */}
            <section className="lp-section" id="services">
                <div className="lp-head">
                    <span className="lp-eyebrow dark">Nos services</span>
                    <h2>Une préparation complète, du premier cours au jour de l'examen</h2>
                </div>
                <div className="lp-grid">
                    {SERVICES.map((s, i) => (
                        <div key={i} className="lp-card">
                            <span className="lp-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                            </span>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* TEMOIGNAGES */}
            <section className="lp-section alt" id="temoignages">
                <div className="lp-head">
                    <span className="lp-eyebrow dark">Témoignages</span>
                    <h2>Ils ont atteint leur objectif</h2>
                </div>
                <div className="lp-grid lp-grid-3">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="lp-card lp-quote">
                            <p>“{t.quote}”</p>
                            <div className="lp-author">
                                <span className="lp-avatar">{t.name.split(" ").map((p) => p[0]).join("")}</span>
                                <div>
                                    <strong>{t.name}</strong>
                                    <span>{t.result}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="lp-section" id="faq">
                <div className="lp-head">
                    <span className="lp-eyebrow dark">Questions fréquentes</span>
                    <h2>Tout ce qu'il faut savoir</h2>
                </div>
                <div className="lp-faq">
                    {FAQS.map((f, i) => (
                        <div key={i} className={"lp-faq-item" + (openFaq === i ? " open" : "")}>
                            <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                                <span>{f.q}</span>
                                <span className="lp-faq-sign">{openFaq === i ? "−" : "+"}</span>
                            </button>
                            {openFaq === i && <p>{f.a}</p>}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="lp-cta">
                <h2>Prêt à réussir votre examen ?</h2>
                <p>Rejoignez les candidats qui préparent leur avenir au Canada avec {BRAND}.</p>
                <div className="lp-hero-actions center">
                    <button className="lp-btn lp-btn-accent" onClick={() => navigate(ctaTarget)}>{ctaLabel}</button>
                    <a href={CONTACT.whatsapp} className="lp-btn lp-btn-light" target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lp-footer" id="contact">
                <div className="lp-foot-grid">
                    <div>
                        <div className="lp-brand light">
                            <span className="lp-mark"><svg width="18" height="18" viewBox="0 0 32 32"><path d="M16 4l1.7 4.4 4.2-1.3-1.7 4.1 3.8 1.7-3.6 1.9 2.3 4-4.3-1 .3 4.5L16 25l-2.7-1.4.3-4.5-4.3 1 2.3-4-3.6-1.9 3.8-1.7L4 8.5l4.2 1.3L16 4z" fill="#fff" /></svg></span>
                            <span>{BRAND}</span>
                        </div>
                        <p className="lp-foot-about">Centre de préparation aux tests de langue pour l'immigration, les études et le travail au Canada.</p>
                    </div>
                    <div>
                        <h4>Navigation</h4>
                        <a href="#services">Services</a>
                        <a href="#temoignages">Témoignages</a>
                        <a href="#faq">FAQ</a>
                        <button className="lp-link" onClick={() => navigate(ctaTarget)}>{ctaLabel}</button>
                    </div>
                    <div>
                        <h4>Contact</h4>
                        <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>{CONTACT.phone}</a>
                        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                        <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
                        <span>{CONTACT.city}</span>
                    </div>
                </div>
                <div className="lp-foot-bottom">
                    © {new Date().getFullYear()} {BRAND}. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}