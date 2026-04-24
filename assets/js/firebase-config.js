// ============================================================
// CONFIGURATION FIREBASE PRINCIPALE
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDfpL1jyl3B0FZnB8m-BvYst8SyVh5YcKA",
  authDomain: "baticonseil-ah0izw.firebaseapp.com",
  projectId: "baticonseil-ah0izw",
  storageBucket: "baticonseil-ah0izw.firebasestorage.app",
  messagingSenderId: "605781891786",
  appId: "1:605781891786:web:116be1aec5d9c682e5f233"
};

// ============================================================
// CONFIGURATION FIREBASE SECONDAIRE (backup optionnel)
// Créez un second projet Firebase → Console → Firestore → Règles :
//   allow read, write: if true;
// Puis collez la config ci-dessous. Laissez null pour désactiver.
// ============================================================
const FIREBASE_CONFIG_SECONDARY = null;
/* Exemple — décommentez et remplissez :
const FIREBASE_CONFIG_SECONDARY = {
  apiKey: "...",
  authDomain: "...-backup.firebaseapp.com",
  projectId: "...-backup",
  storageBucket: "...-backup.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
*/

// ============================================================
// RÈGLES FIRESTORE RECOMMANDÉES (Firebase Console > Firestore > Règles)
// ============================================================
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site/data {
      allow read: if true;
      allow write: if request.auth != null;  // auth anonyme suffit
    }
    match /messages/{msg} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
*/

// ============================================================
// DONNÉES PAR DÉFAUT
// ============================================================
const DEFAULT_DATA = {
  settings: {
    siteName: "Synergie Conseils Constructions",
    tagline: "L'expertise au service de vos projets de construction",
    description: "Cabinet de conseil en construction, accompagnement de A à Z : étude de faisabilité, maîtrise d'œuvre, expertise technique et suivi de chantier.",
    phone: "+33 4 73 XX XX XX",
    email: "contact@synergie-cc.fr",
    address: "Clermont-Ferrand, Auvergne",
    heroImage: "",
    logo: "assets/img/logo.png",
    footerText: "© 2024 Synergie Conseils Constructions. Tous droits réservés.",
    socialLinkedIn: "",
    socialFacebook: "",
    socialInstagram: "",
    mapEmbed: "",
    chatUrl: "",
    newsletterUrl: ""
  },
  colors: {
    primary: "#1E3A2F",
    secondary: "#C4956A",
    accent: "#F5F0E8",
    dark: "#0F1A13",
    light: "#FAF8F3"
  },
  hero: {
    title: "Votre partenaire de confiance en construction",
    subtitle: "Conseil expert, accompagnement personnalisé et suivi rigoureux pour tous vos projets de construction et de rénovation.",
    ctaLabel: "Nos services",
    ctaLink: "#services",
    ctaSecondLabel: "Prendre contact",
    ctaSecondLink: "#contact"
  },
  about: {
    title: "L'expertise SCC à votre service",
    text: "Synergie Conseils Constructions accompagne particuliers et professionnels dans leurs projets de construction et de rénovation en Auvergne et partout en France. Notre équipe d'experts vous guide à chaque étape, du diagnostic initial à la réception des travaux.",
    image: "",
    stat1Label: "Projets accompagnés",
    stat1Value: "500+",
    stat2Label: "Années d'expérience",
    stat2Value: "15+",
    stat3Label: "Clients satisfaits",
    stat3Value: "98%"
  },
  categories: [
    { id: "cat1", name: "Conseil", icon: "💡", order: 1, type: "service" },
    { id: "cat2", name: "Suivi de chantier", icon: "🏗️", order: 2, type: "service" },
    { id: "cat3", name: "Expertise", icon: "🔍", order: 3, type: "service" }
  ],
  services: [
    {
      id: "s1", title: "Conseil en construction", categoryId: "cat1",
      description: "Analyse de faisabilité, étude de sol, recommandations techniques et réglementaires pour lancer votre projet dans les meilleures conditions.",
      icon: "💡", featured: true, order: 1, active: true, image: ""
    },
    {
      id: "s2", title: "Maîtrise d'œuvre", categoryId: "cat2",
      description: "Coordination complète de votre chantier, gestion des entreprises et contrôle de la qualité d'exécution jusqu'à la réception.",
      icon: "🏗️", featured: true, order: 2, active: true, image: ""
    },
    {
      id: "s3", title: "Expertise technique", categoryId: "cat3",
      description: "Diagnostic de pathologies, expertise contradictoire, rapport d'expertise pour assurances et sinistres constructifs.",
      icon: "🔍", featured: true, order: 3, active: true, image: ""
    },
    {
      id: "s4", title: "Accompagnement permis de construire", categoryId: "cat1",
      description: "Constitution du dossier de permis de construire, optimisation du projet selon les règles d'urbanisme locales.",
      icon: "📋", featured: false, order: 4, active: true, image: ""
    },
    {
      id: "s5", title: "Audit énergétique", categoryId: "cat3",
      description: "Diagnostic de performance énergétique, préconisations pour la rénovation thermique et accès aux aides financières.",
      icon: "⚡", featured: false, order: 5, active: true, image: ""
    },
    {
      id: "s6", title: "Suivi de réception", categoryId: "cat2",
      description: "Assistance à la réception des travaux, levée des réserves, vérification de la conformité des ouvrages réalisés.",
      icon: "✅", featured: false, order: 6, active: true, image: ""
    }
  ],
  articles: [
    {
      id: "a1",
      title: "10 erreurs à éviter dans votre projet de construction",
      excerpt: "Avant de lancer votre chantier, découvrez les pièges les plus fréquents et comment les anticiper grâce à un accompagnement professionnel.",
      content: "<p>Construire une maison est souvent le projet d'une vie. Pour éviter les déconvenues, voici les 10 erreurs les plus fréquentes que nous observons en tant qu'experts du bâtiment...</p><p>1. Sous-estimer le budget prévisionnel<br>2. Négliger l'étude de sol<br>3. Choisir un terrain sans vérifier les contraintes d'urbanisme<br>4. Signer sans comprendre les contrats<br>5. Ignorer les délais administratifs...</p>",
      category: "Conseil", image: "", date: "2024-03-15", published: true, slug: "10-erreurs-eviter-construction"
    },
    {
      id: "a2",
      title: "Comment choisir son maître d'œuvre ?",
      excerpt: "Le maître d'œuvre est votre chef d'orchestre sur le chantier. Voici les critères essentiels pour faire le bon choix et sécuriser votre projet.",
      content: "<p>Le choix du maître d'œuvre est déterminant pour la réussite de votre projet. Il doit allier compétences techniques, expérience et qualités relationnelles...</p>",
      category: "Suivi de chantier", image: "", date: "2024-02-20", published: true, slug: "comment-choisir-maitre-oeuvre"
    },
    {
      id: "a3",
      title: "Rénovation énergétique : les aides disponibles en 2024",
      excerpt: "MaPrimeRénov', CEE, éco-PTZ… faites le point sur toutes les aides financières pour rénover votre logement et réduire vos factures d'énergie.",
      content: "<p>En 2024, de nombreuses aides financières existent pour soutenir la rénovation énergétique des logements. Tour d'horizon des dispositifs disponibles...</p>",
      category: "Expertise", image: "", date: "2024-01-10", published: true, slug: "aides-renovation-energetique-2024"
    }
  ],
  testimonials: [
    { id: "t1", name: "Sophie M.", role: "Propriétaire - Maison individuelle", text: "Grâce à SCC, notre chantier s'est déroulé sans accroc. Leur expertise nous a évité de nombreux problèmes. Je recommande vivement !", rating: 5, active: true },
    { id: "t2", name: "Laurent D.", role: "Promoteur immobilier", text: "Un partenaire de confiance pour tous nos projets. Réactivité, professionnalisme et conseils avisés sont au rendez-vous à chaque fois.", rating: 5, active: true },
    { id: "t3", name: "Marie & Pierre F.", role: "Maîtres d'ouvrage - Rénovation", text: "Le suivi de chantier assuré par leur équipe nous a permis de recevoir des travaux conformes à nos attentes. Excellent rapport qualité-prix.", rating: 4, active: true }
  ],
  stats: [
    { id: "st1", label: "Projets réalisés", value: "500+", icon: "🏗️" },
    { id: "st2", label: "Années d'expérience", value: "15+", icon: "⭐" },
    { id: "st3", label: "Clients satisfaits", value: "98%", icon: "😊" },
    { id: "st4", label: "Régions couvertes", value: "12", icon: "📍" }
  ],
  extensions: {
    testimonials: true,
    contact: true,
    gallery: false,
    stats: true,
    map: false,
    chat: false,
    newsletter: false,
    faq: false,
    team: false,
    partners: false
  },
  gallery: [],
  faq: [
    { id: "faq1", question: "Comment se déroule un premier rendez-vous ?", answer: "Le premier rendez-vous est une consultation d'une heure pour analyser votre projet, définir vos besoins et vous proposer un accompagnement adapté. Il est sans engagement.", order: 1 },
    { id: "faq2", question: "Quels types de projets accompagnez-vous ?", answer: "Nous accompagnons tous types de projets : construction neuve, rénovation, extension, surélévation, expertise technique, permis de construire et audit énergétique.", order: 2 },
    { id: "faq3", question: "Intervenez-vous partout en France ?", answer: "Nous intervenons principalement en Auvergne-Rhône-Alpes mais acceptons des missions sur tout le territoire national selon la nature du projet.", order: 3 },
    { id: "faq4", question: "Quels sont vos honoraires ?", answer: "Nos honoraires sont calculés en fonction de la nature et du volume du projet. Nous vous fournissons un devis détaillé et transparent lors de notre premier échange.", order: 4 }
  ],
  team: [
    { id: "tm1", name: "Jean-Marie Bernard", role: "Directeur & Expert en construction", bio: "Plus de 20 ans d'expérience dans le BTP, expert reconnu en maîtrise d'œuvre et expertise technique.", photo: "", order: 1 },
    { id: "tm2", name: "Sophie Leclerc", role: "Architecte DPLG", bio: "Spécialiste en rénovation et patrimoine, elle pilote les projets complexes avec rigueur et créativité.", photo: "", order: 2 },
    { id: "tm3", name: "Marc Durand", role: "Ingénieur structure", bio: "Expert en calcul de structure et diagnostic pathologique, il sécurise chaque phase technique du projet.", photo: "", order: 3 }
  ],
  partners: [
    { id: "pt1", name: "RGE Qualibat", logo: "", url: "https://www.qualibat.com" },
    { id: "pt2", name: "OPPBTP", logo: "", url: "https://www.oppbtp.fr" },
    { id: "pt3", name: "UNSFA", logo: "", url: "https://www.unsfa.com" },
    { id: "pt4", name: "FNTP", logo: "", url: "https://www.fntp.fr" }
  ]
};

// ============================================================
// DATA MANAGER — Firebase + LocalStorage
// Sync strategy:
//   1. _loadLocal()   → render immediately from localStorage (fast)
//   2. _syncFromFirebase() → Firestore onSnapshot for real-time cross-device sync
//   3. storage event  → instant same-browser cross-tab sync (admin → public)
//   4. _savedAt stamp → timestamp gating prevents old Firestore from overwriting new local
// ============================================================
class DataManager {
  constructor() {
    this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this._listeners = {};
    this._firebaseReady = false;
    this._db = null;
    this._unsubscribe = null;

    // ── Cross-tab sync ───────────────────────────────────────
    // When admin (different tab, same origin) writes localStorage,
    // the public site tab receives this event and re-renders instantly
    // without waiting for Firestore onSnapshot.
    window.addEventListener("storage", (e) => {
      if (e.key !== "bbSiteData" || !e.newValue) return;
      try {
        const parsed   = JSON.parse(e.newValue);
        const incoming = parsed._savedAt || 0;
        const current  = this._data._savedAt || 0;
        if (incoming >= current) {
          // Merge in-place so existing object references stay valid
          this._applyData(parsed);
          this._notifyAll();
        }
      } catch (_) {}
    });
  }

  // ── Init ────────────────────────────────────────────────────
  async init() {
    this._loadLocal();
    this._notifyAll(); // render at once from localStorage — don't wait for Firebase

    // ── Primary Firebase ───────────────────────────────────────
    try {
      let app;
      try { app = firebase.initializeApp(FIREBASE_CONFIG); }
      catch (e) {
        if (e.code === "app/duplicate-app") { app = firebase.app(); }
        else { throw e; }
      }
      this._db = app.firestore ? app.firestore() : firebase.firestore();

      // Anonymous auth — only available when admin loads firebase-auth-compat.js
      if (typeof firebase.auth === "function") {
        try {
          await firebase.auth(app).signInAnonymously();
          console.log("✅ Auth anonyme OK");
        } catch (authErr) {
          console.warn("⚠️ Auth anonyme:", authErr.message);
        }
      }

      await this._syncFromFirebase();
      this._firebaseReady = true;
      this._firebaseLabel = "primary";
      console.log("✅ Firebase principal connecté");
    } catch (e) {
      console.warn("⚠️ Firebase principal:", e.message);
      this._lastFirebaseError = e.message;
    }

    // ── Secondary Firebase (fallback) ──────────────────────────
    if (!this._firebaseReady && FIREBASE_CONFIG_SECONDARY) {
      try {
        let backupApp;
        try { backupApp = firebase.initializeApp(FIREBASE_CONFIG_SECONDARY, "scc-backup"); }
        catch (e) {
          if (e.code === "app/duplicate-app") { backupApp = firebase.app("scc-backup"); }
          else { throw e; }
        }
        this._db = backupApp.firestore();
        await this._syncFromFirebase();
        this._firebaseReady = true;
        this._firebaseLabel = "backup";
        console.log("✅ Firebase backup connecté");
      } catch (e) {
        console.warn("⚠️ Firebase backup:", e.message);
        this._lastFirebaseError += " | backup: " + e.message;
      }
    }

    return this;
  }

  // ── Local storage ────────────────────────────────────────────
  _loadLocal() {
    try {
      const saved = localStorage.getItem("bbSiteData");
      if (saved) this._applyData(JSON.parse(saved));
    } catch (e) { /* ignore */ }
  }

  _saveLocal() {
    try { localStorage.setItem("bbSiteData", JSON.stringify(this._data)); } catch (e) { /* ignore */ }
  }

  // Merge source into this._data IN PLACE so object references stay valid
  _applyData(source) {
    const merged = this._mergeDeep(JSON.parse(JSON.stringify(DEFAULT_DATA)), source);
    // Clear then re-fill the existing object (preserves reference for admin appData)
    Object.keys(this._data).forEach(k => { delete this._data[k]; });
    Object.assign(this._data, merged);
  }

  // ── Firebase ─────────────────────────────────────────────────
  async _syncFromFirebase() {
    return new Promise((resolve) => {
      const docRef = this._db.collection("site").doc("data");
      let resolved = false;
      this._unsubscribe = docRef.onSnapshot(snap => {
        if (snap.exists) {
          const incoming    = snap.data();
          const incomingTs  = incoming._savedAt || 0;
          const currentTs   = this._data._savedAt || 0;
          // Only overwrite local data if Firestore version is same-age or newer.
          // This prevents a stale onSnapshot from clobbering fresh admin saves.
          if (incomingTs >= currentTs) {
            this._applyData(incoming);
            this._saveLocal();
            this._notifyAll();
          }
        }
        if (!resolved) { resolved = true; resolve(); }
      }, (err) => { console.warn("Firestore sync error:", err); if (!resolved) { resolved = true; resolve(); } });
    });
  }

  // ── Save ─────────────────────────────────────────────────────
  async save() {
    this._data._savedAt = Date.now(); // timestamp used for conflict resolution
    this._saveLocal();
    this._notifyAll();
    if (this._firebaseReady && this._db) {
      try {
        await this._db.collection("site").doc("data").set(this._data);
        return; // success — done
      } catch (e) {
        console.error("Erreur sauvegarde Firebase principal:", e);
        // Try secondary if configured
        if (FIREBASE_CONFIG_SECONDARY) {
          try {
            const backupApp = firebase.app("scc-backup");
            await backupApp.firestore().collection("site").doc("data").set(this._data);
            console.log("✅ Sauvegarde backup réussie");
            return;
          } catch (e2) {
            console.error("Erreur sauvegarde Firebase backup:", e2);
          }
        }
        throw e; // re-throw so admin.js toast shows the error
      }
    }
  }

  // ── Accessors ────────────────────────────────────────────────
  get(path) {
    return path.split(".").reduce((obj, k) => obj && obj[k] !== undefined ? obj[k] : undefined, this._data);
  }

  set(path, value) {
    const keys = path.split(".");
    let obj = this._data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] === undefined) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  }

  on(section, cb) {
    if (!this._listeners[section]) this._listeners[section] = [];
    this._listeners[section].push(cb);
    cb(this._data);
  }

  off(section, cb) {
    if (this._listeners[section]) {
      this._listeners[section] = this._listeners[section].filter(f => f !== cb);
    }
  }

  _notifyAll() {
    Object.keys(this._listeners).forEach(sec => {
      (this._listeners[sec] || []).forEach(cb => cb(this._data));
    });
  }

  uid(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  isFirebaseReady() { return this._firebaseReady; }

  _mergeDeep(target, source) {
    if (!source || typeof source !== "object") return target;
    Object.keys(source).forEach(k => {
      if (source[k] && typeof source[k] === "object" && !Array.isArray(source[k])) {
        if (!target[k] || typeof target[k] !== "object") target[k] = {};
        this._mergeDeep(target[k], source[k]);
      } else {
        target[k] = source[k];
      }
    });
    return target;
  }
}

const dataManager = new DataManager();
