// ============================================================
// SITE RENDERER — charge et affiche dynamiquement le contenu
// depuis Firebase/DataManager
// ============================================================

class SiteRenderer {
  constructor(dm) {
    this.dm = dm;
    this._activeFilter = "all";
  }

  init() {
    // S'abonner aux changements
    this.dm.on("all", () => this.renderAll());

    // Navbar scroll
    window.addEventListener("scroll", () => {
      const nav = document.getElementById("navbar");
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 40);
    });

    // Intersection Observer pour animations
    this._initObserver();

    // Masquer le loader
    this._hideLoader();
  }

  renderAll() {
    const data = this.dm._data;
    this._applyTheme(data.colors);
    this._renderNav(data.settings, data.categories, data.services);
    this._renderHero(data.settings, data.hero);
    this._renderStats(data.stats);
    this._renderServices(data.services, data.categories);
    this._renderAbout(data.settings, data.about);
    this._renderArticles(data.articles);
    if (data.extensions?.testimonials) this._renderTestimonials(data.testimonials);
    if (data.extensions?.contact) this._renderContact(data.settings);
    this._renderFooter(data.settings, data.services);
    this._initObserver();
  }

  // ──────────────────────────────────────────────
  // THEME
  // ──────────────────────────────────────────────
  _applyTheme(colors = {}) {
    const r = document.documentElement;
    if (colors.primary) {
      r.style.setProperty("--primary", colors.primary);
      r.style.setProperty("--primary-l", this._lighten(colors.primary, 15));
      r.style.setProperty("--primary-d", this._darken(colors.primary, 25));
    }
    if (colors.secondary) {
      r.style.setProperty("--secondary", colors.secondary);
      r.style.setProperty("--secondary-l", this._lighten(colors.secondary, 10));
    }
    if (colors.accent)  r.style.setProperty("--accent", colors.accent);
    if (colors.dark)    r.style.setProperty("--dark",   colors.dark);
    if (colors.light)   r.style.setProperty("--light",  colors.light);
  }

  _lighten(hex, pct) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const f = n => Math.min(255, Math.round(n + (255-n)*pct/100)).toString(16).padStart(2,"0");
    return `#${f(r)}${f(g)}${f(b)}`;
  }
  _darken(hex, pct) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    const f = n => Math.max(0, Math.round(n*(1-pct/100))).toString(16).padStart(2,"0");
    return `#${f(r)}${f(g)}${f(b)}`;
  }

  // ──────────────────────────────────────────────
  // NAVBAR
  // ──────────────────────────────────────────────
  _renderNav(settings = {}, categories = [], services = []) {
    const el = document.getElementById("navbar");
    if (!el) return;
    const logo = settings.logo
      ? `<img src="${settings.logo}" class="nav-brand-logo" alt="${settings.siteName}">`
      : `<span>${settings.siteName || "BâtiConseil Pro"}</span>`;
    el.innerHTML = `
      <div class="container">
        <div class="nav-inner">
          <a href="index.html" class="nav-brand">${logo}</a>
          <nav class="nav-links" id="navLinks">
            <a href="index.html#services">Services</a>
            <a href="index.html#about">À propos</a>
            <a href="index.html#articles">Actualités</a>
            <a href="index.html#contact" class="nav-cta">Contact</a>
          </nav>
          <button class="nav-toggle" id="navToggle" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>`;
    document.getElementById("navToggle")?.addEventListener("click", () => {
      document.getElementById("navLinks")?.classList.toggle("open");
    });
  }

  // ──────────────────────────────────────────────
  // HERO
  // ──────────────────────────────────────────────
  _renderHero(settings = {}, hero = {}) {
    const el = document.getElementById("hero");
    if (!el) return;
    const bgStyle = settings.heroImage ? `style="background-image:url('${settings.heroImage}')"` : "";
    el.innerHTML = `
      <div class="hero-bg" ${bgStyle}></div>
      <div class="hero-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">🏗️ Expertise &amp; Construction</div>
          <h1 class="hero-title">${hero.title || "Votre partenaire de confiance en construction"}</h1>
          <p class="hero-subtitle">${hero.subtitle || "Conseil, accompagnement et expertise pour tous vos projets, de A à Z."}</p>
          <div class="hero-actions">
            <a href="${hero.ctaLink || '#services'}" class="btn btn-primary">${hero.ctaLabel || "Découvrir nos services"} →</a>
            <a href="${hero.ctaSecondLink || '#contact'}" class="btn btn-outline">${hero.ctaSecondLabel || "Nous contacter"}</a>
          </div>
        </div>
      </div>
      <div class="hero-scroll">
        <span>Découvrir</span>
        <div class="hero-scroll-line"></div>
      </div>`;
  }

  // ──────────────────────────────────────────────
  // STATS
  // ──────────────────────────────────────────────
  _renderStats(stats = []) {
    const el = document.getElementById("stats");
    if (!el) return;
    el.innerHTML = `<div class="container"><div class="stats-grid">${
      stats.map(s => `
        <div class="stat-item fade-up">
          <div class="stat-value">${s.value}</div>
          <div class="stat-label">${s.label}</div>
        </div>`).join("")
    }</div></div>`;
  }

  // ──────────────────────────────────────────────
  // SERVICES
  // ──────────────────────────────────────────────
  _renderServices(services = [], categories = []) {
    const el = document.getElementById("services-content");
    if (!el) return;
    const active = services.filter(s => s.active !== false);
    const featured = active.filter(s => s.featured).sort((a,b) => (a.order||99)-(b.order||99));
    const others = active.filter(s => !s.featured).sort((a,b) => (a.order||99)-(b.order||99));

    const catFilters = [
      `<button class="filter-btn active" data-cat="all">Tous</button>`,
      ...categories.map(c => `<button class="filter-btn" data-cat="${c.id}">${c.icon || ""} ${c.name}</button>`)
    ].join("");

    const renderCard = (s, big = false) => {
      const cat = categories.find(c => c.id === s.categoryId);
      const imgHtml = s.image
        ? `<img src="${s.image}" class="service-card-img" alt="${s.title}" loading="lazy">`
        : `<div class="service-card-img-placeholder">${s.icon || "🏗️"}</div>`;
      return `
        <div class="service-card${big ? " featured" : ""} fade-up" data-cat="${s.categoryId || ""}">
          ${imgHtml}
          <div class="service-card-body">
            ${cat ? `<span class="service-cat-badge">${cat.icon || ""} ${cat.name}</span>` : ""}
            <h3>${s.title}</h3>
            <p>${s.description}</p>
            <span class="service-card-link">En savoir plus →</span>
          </div>
        </div>`;
    };

    el.innerHTML = `
      <div class="services-filters">${catFilters}</div>
      ${featured.length ? `<div class="services-featured" id="servicesFeatured">${featured.map(s => renderCard(s, true)).join("")}</div>` : ""}
      ${others.length ? `<div class="services-grid" id="servicesGrid">${others.map(s => renderCard(s)).join("")}</div>` : ""}`;

    el.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        el.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        el.querySelectorAll(".service-card").forEach(card => {
          const show = cat === "all" || card.dataset.cat === cat;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }

  // ──────────────────────────────────────────────
  // ABOUT
  // ──────────────────────────────────────────────
  _renderAbout(settings = {}, about = {}) {
    const el = document.getElementById("about-content");
    if (!el) return;
    const imgHtml = about.image
      ? `<img src="${about.image}" alt="À propos" loading="lazy">`
      : `<div class="about-img-placeholder">🏛️</div>`;
    el.innerHTML = `
      <div class="about-grid">
        <div class="about-img-wrap fade-up">
          ${imgHtml}
          <div class="about-badge-box">
            <div class="about-badge-num">${about.stat1Value || "500+"}</div>
            <div class="about-badge-txt">${about.stat1Label || "Projets réalisés"}</div>
          </div>
        </div>
        <div class="about-content fade-up delay-2">
          <span class="section-label">Notre histoire</span>
          <h2>${about.title || "Notre expertise à votre service"}</h2>
          <div class="divider"></div>
          <p>${about.text || "Depuis plus de 15 ans, BâtiConseil Pro accompagne particuliers et professionnels dans leurs projets de construction."}</p>
          <div class="about-stats">
            <div>
              <div class="about-stat-val">${about.stat2Value || "15+"}</div>
              <div class="about-stat-lab">${about.stat2Label || "Années d'expérience"}</div>
            </div>
            <div>
              <div class="about-stat-val">${about.stat3Value || "98%"}</div>
              <div class="about-stat-lab">${about.stat3Label || "Clients satisfaits"}</div>
            </div>
          </div>
          <br>
          <a href="#contact" class="btn btn-dark">Prendre rendez-vous →</a>
        </div>
      </div>`;
  }

  // ──────────────────────────────────────────────
  // ARTICLES
  // ──────────────────────────────────────────────
  _renderArticles(articles = []) {
    const el = document.getElementById("articles-grid");
    if (!el) return;
    const pub = articles.filter(a => a.published !== false).sort((a,b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
    }).slice(0, 6);

    if (!pub.length) { el.innerHTML = `<p style="text-align:center;color:var(--text-m)">Aucun article publié.</p>`; return; }

    el.innerHTML = pub.map(a => {
      const imgHtml = a.image
        ? `<img src="${a.image}" class="article-img" alt="${a.title}" loading="lazy">`
        : `<div class="article-img-placeholder">📰</div>`;
      const dateStr = a.date ? new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
      return `
        <a href="article.html?id=${a.id}" class="article-card fade-up">
          ${imgHtml}
          <div class="article-body">
            <div class="article-meta">
              <span class="article-cat">${a.category || "Actualité"}</span>
              ${dateStr ? `<span class="article-date">${dateStr}</span>` : ""}
            </div>
            <h3>${a.title}</h3>
            <p class="article-excerpt">${a.excerpt || ""}</p>
            <span class="article-link">Lire l'article →</span>
          </div>
        </a>`;
    }).join("");
  }

  // ──────────────────────────────────────────────
  // TESTIMONIALS
  // ──────────────────────────────────────────────
  _renderTestimonials(testimonials = []) {
    const el = document.getElementById("testimonials-content");
    if (!el) return;
    const active = testimonials.filter(t => t.active !== false);
    if (!active.length) { el.innerHTML = ""; return; }
    el.innerHTML = `<div class="testimonials-grid">` + active.map(t => {
      const stars = Array.from({length: 5}, (_,i) =>
        `<span class="star${i < (t.rating||5) ? "" : " empty"}">★</span>`).join("");
      const initials = (t.name||"?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
      return `
        <div class="testimonial-card fade-up">
          <div class="stars">${stars}</div>
          <p class="testimonial-text">"${t.text}"</p>
          <div class="testimonial-author">
            <div class="author-avatar">${initials}</div>
            <div>
              <div class="author-name">${t.name}</div>
              <div class="author-role">${t.role || ""}</div>
            </div>
          </div>
        </div>`;
    }).join("") + `</div>`;
  }

  // ──────────────────────────────────────────────
  // CONTACT
  // ──────────────────────────────────────────────
  _renderContact(settings = {}) {
    const el = document.getElementById("contact-content");
    if (!el) return;
    el.innerHTML = `
      <div class="contact-grid">
        <div class="contact-info fade-up">
          <h3>Parlons de votre projet</h3>
          <p>Chaque projet est unique. Notre équipe est à votre écoute pour analyser vos besoins et vous proposer un accompagnement sur-mesure.</p>
          <div class="contact-items">
            ${settings.phone ? `<div class="contact-item"><div class="contact-item-icon">📞</div><div class="contact-item-txt"><div class="label">Téléphone</div><div class="value">${settings.phone}</div></div></div>` : ""}
            ${settings.email ? `<div class="contact-item"><div class="contact-item-icon">✉️</div><div class="contact-item-txt"><div class="label">Email</div><div class="value">${settings.email}</div></div></div>` : ""}
            ${settings.address ? `<div class="contact-item"><div class="contact-item-icon">📍</div><div class="contact-item-txt"><div class="label">Adresse</div><div class="value">${settings.address}</div></div></div>` : ""}
          </div>
        </div>
        <div class="contact-form-card fade-up delay-2">
          <h3>Envoyez-nous un message</h3>
          <form id="contactForm">
            <div class="form-row">
              <div class="form-group"><label>Prénom *</label><input type="text" id="cf-first" required placeholder="Jean"></div>
              <div class="form-group"><label>Nom *</label><input type="text" id="cf-last" required placeholder="Dupont"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Email *</label><input type="email" id="cf-email" required placeholder="jean@exemple.fr"></div>
              <div class="form-group"><label>Téléphone</label><input type="tel" id="cf-phone" placeholder="+33 6 12 34 56 78"></div>
            </div>
            <div class="form-group"><label>Sujet *</label>
              <select id="cf-subject" required>
                <option value="">— Choisir un sujet —</option>
                <option>Demande de devis</option>
                <option>Conseil en construction</option>
                <option>Suivi de chantier</option>
                <option>Expertise technique</option>
                <option>Autre</option>
              </select>
            </div>
            <div class="form-group"><label>Message *</label><textarea id="cf-message" required placeholder="Décrivez votre projet..."></textarea></div>
            <button type="submit" class="btn btn-primary" id="cf-submit" style="width:100%;justify-content:center">Envoyer le message →</button>
            <div class="form-success" id="cf-success">✅ Message envoyé ! Nous vous répondrons dans les plus brefs délais.</div>
            <div class="form-error" id="cf-error">❌ Une erreur s'est produite. Veuillez réessayer.</div>
          </form>
        </div>
      </div>`;

    document.getElementById("contactForm")?.addEventListener("submit", (e) => this._handleContactSubmit(e));
  }

  async _handleContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("cf-submit");
    const ok = document.getElementById("cf-success");
    const err = document.getElementById("cf-error");
    ok.style.display = "none"; err.style.display = "none";
    btn.textContent = "Envoi en cours…"; btn.disabled = true;

    const msg = {
      firstName: document.getElementById("cf-first").value.trim(),
      lastName:  document.getElementById("cf-last").value.trim(),
      email:     document.getElementById("cf-email").value.trim(),
      phone:     document.getElementById("cf-phone").value.trim(),
      subject:   document.getElementById("cf-subject").value,
      message:   document.getElementById("cf-message").value.trim(),
      date:      new Date().toISOString(),
      read:      false
    };

    try {
      if (this.dm.isFirebaseReady() && this.dm._db) {
        await this.dm._db.collection("messages").add(msg);
      } else {
        // Fallback: save to localStorage
        const saved = JSON.parse(localStorage.getItem("bbMessages") || "[]");
        saved.push(msg);
        localStorage.setItem("bbMessages", JSON.stringify(saved));
      }
      ok.style.display = "block";
      e.target.reset();
    } catch (error) {
      console.error(error);
      err.style.display = "block";
    } finally {
      btn.textContent = "Envoyer le message →"; btn.disabled = false;
    }
  }

  // ──────────────────────────────────────────────
  // FOOTER
  // ──────────────────────────────────────────────
  _renderFooter(settings = {}, services = []) {
    const el = document.getElementById("footer");
    if (!el) return;
    const activeServices = (services || []).filter(s => s.active !== false).slice(0, 5);
    const social = [
      settings.socialLinkedIn ? `<a href="${settings.socialLinkedIn}" title="LinkedIn">in</a>` : "",
      settings.socialFacebook ? `<a href="${settings.socialFacebook}" title="Facebook">f</a>` : "",
      settings.socialInstagram ? `<a href="${settings.socialInstagram}" title="Instagram">ig</a>` : ""
    ].filter(Boolean).join("");

    el.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">${settings.siteName || "BâtiConseil Pro"}</div>
            <p class="footer-desc">${settings.tagline || "Votre partenaire en construction, de A à Z"}</p>
            ${social ? `<div class="footer-social">${social}</div>` : ""}
          </div>
          <div class="footer-col">
            <h4>Services</h4>
            <ul>${activeServices.map(s => `<li><a href="index.html#services">${s.title}</a></li>`).join("")}</ul>
          </div>
          <div class="footer-col">
            <h4>Informations</h4>
            <ul>
              <li><a href="index.html#about">À propos</a></li>
              <li><a href="index.html#articles">Actualités</a></li>
              <li><a href="index.html#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span class="footer-bottom-text">${settings.footerText || "© 2024 BâtiConseil Pro. Tous droits réservés."}</span>
          <a href="admin/login.html" class="footer-admin-link">⚙ Admin</a>
        </div>
      </div>`;
  }

  // ──────────────────────────────────────────────
  // ARTICLE PAGE
  // ──────────────────────────────────────────────
  renderArticlePage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const el = document.getElementById("article-page-content");
    if (!el) return;

    const data = this.dm._data;
    const article = (data.articles || []).find(a => a.id === id);

    if (!article) {
      el.innerHTML = `<p style="text-align:center;padding:40px 0">Article introuvable. <a href="index.html" style="color:var(--primary)">Retour à l'accueil</a></p>`;
      return;
    }

    document.title = `${article.title} — ${data.settings?.siteName || "BâtiConseil Pro"}`;
    const dateStr = article.date ? new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

    el.innerHTML = `
      <a href="index.html#articles" class="article-page-back">← Retour aux actualités</a>
      ${article.image ? `<img src="${article.image}" class="article-hero-img" alt="${article.title}">` : ""}
      <div class="article-page-header">
        <div class="article-page-meta">
          <span class="article-cat">${article.category || "Actualité"}</span>
          ${dateStr ? `<span class="article-date">📅 ${dateStr}</span>` : ""}
        </div>
        <h1 class="article-page-title">${article.title}</h1>
        ${article.excerpt ? `<p style="color:var(--text-m);font-size:1.1rem;margin-top:14px;font-style:italic">${article.excerpt}</p>` : ""}
      </div>
      <div class="article-content">${article.content || ""}</div>
      <div style="margin-top:48px;padding-top:32px;border-top:1px solid var(--border)">
        <h3 style="font-size:1.2rem;color:var(--primary-d);margin-bottom:20px">Autres articles</h3>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          ${(data.articles || []).filter(a => a.id !== id && a.published !== false).slice(0,3).map(a =>
            `<a href="article.html?id=${a.id}" style="flex:1;min-width:200px;padding:16px;border:1px solid var(--border);border-radius:var(--radius-sm);transition:box-shadow 0.2s" onmouseover="this.style.boxShadow='var(--shadow)'" onmouseout="this.style.boxShadow=''">
              <span style="font-size:0.7rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--secondary)">${a.category || ""}</span>
              <p style="font-weight:600;color:var(--primary-d);margin-top:6px;font-size:0.9rem">${a.title}</p>
            </a>`
          ).join("")}
        </div>
      </div>`;
  }

  // ──────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────
  _initObserver() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll(".fade-up:not(.visible)").forEach(el => obs.observe(el));
  }

  _hideLoader() {
    const loader = document.getElementById("site-loading");
    if (loader) { setTimeout(() => loader.classList.add("hidden"), 400); }
  }
}

// ============================================================
// BOOTSTRAP
// ============================================================
window.addEventListener("DOMContentLoaded", async () => {
  await dataManager.init();
  const renderer = new SiteRenderer(dataManager);
  renderer.init();

  // Page article
  if (document.getElementById("article-page-content")) {
    renderer.renderArticlePage();
  }
});
