// ============================================================
// CONFIGURATION FIREBASE
// Remplacez les valeurs ci-dessous par celles de votre projet
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
// DONNÉES PAR DÉFAUT
// ============================================================
const DEFAULT_DATA = {
  settings: {
    siteName: "BâtiConseil Pro",
    tagline: "Votre partenaire en construction, de A à Z",
    description: "Expertise, accompagnement et suivi de projet pour tous vos travaux de construction et de rénovation.",
    phone: "+33 1 23 45 67 89",
    email: "contact@baticonseil.fr",
    address: "12 Avenue du Bâtiment, 75008 Paris",
    heroImage: "",
    logo: "",
    footerText: "© 2024 BâtiConseil Pro. Tous droits réservés.",
    socialLinkedIn: "",
    socialFacebook: "",
    socialInstagram: ""
  },
  colors: {
    primary: "#1a3c5e",
    secondary: "#c8a96e",
    accent: "#e8f4f8",
    dark: "#0d1f2d",
    light: "#f8f6f0"
  },
  hero: {
    title: "Votre partenaire de confiance en construction",
    subtitle: "Conseil, accompagnement et expertise pour tous vos projets, de A à Z.",
    ctaLabel: "Découvrir nos services",
    ctaLink: "#services",
    ctaSecondLabel: "Nous contacter",
    ctaSecondLink: "#contact"
  },
  about: {
    title: "Notre expertise à votre service",
    text: "Depuis plus de 15 ans, BâtiConseil Pro accompagne particuliers et professionnels dans leurs projets de construction et de rénovation. Notre équipe d'experts vous guide à chaque étape, du diagnostic initial à la réception des travaux.",
    image: "",
    stat1Label: "Projets réalisés",
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
    { id: "t1", name: "Sophie M.", role: "Propriétaire - Maison individuelle", text: "Grâce à BâtiConseil Pro, notre chantier s'est déroulé sans accroc. Leur expertise nous a évité de nombreux problèmes. Je recommande vivement !", rating: 5, active: true },
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
    map: false,
    chat: false
  },
  gallery: []
};

// ============================================================
// DATA MANAGER — Firebase + LocalStorage
// ============================================================
class DataManager {
  constructor() {
    this._data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this._listeners = {};
    this._firebaseReady = false;
    this._db = null;
    this._unsubscribe = null;
  }

  async init() {
    this._loadLocal();
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      this._db = firebase.firestore();
      await this._syncFromFirebase();
      this._firebaseReady = true;
      console.log("✅ Firebase connecté");
    } catch (e) {
      console.warn("⚠️ Firebase non disponible, mode local activé", e.message);
    }
    return this;
  }

  _loadLocal() {
    try {
      const saved = localStorage.getItem("bbSiteData");
      if (saved) this._data = this._mergeDeep(JSON.parse(JSON.stringify(DEFAULT_DATA)), JSON.parse(saved));
    } catch (e) { /* ignore */ }
  }

  _saveLocal() {
    try { localStorage.setItem("bbSiteData", JSON.stringify(this._data)); } catch (e) { /* ignore */ }
  }

  async _syncFromFirebase() {
    return new Promise((resolve) => {
      const docRef = this._db.collection("site").doc("data");
      this._unsubscribe = docRef.onSnapshot(snap => {
        if (snap.exists) {
          this._data = this._mergeDeep(JSON.parse(JSON.stringify(DEFAULT_DATA)), snap.data());
          this._saveLocal();
          this._notifyAll();
        }
        resolve();
      }, (err) => { console.warn("Firestore sync error:", err); resolve(); });
    });
  }

  async save() {
    this._saveLocal();
    this._notifyAll();
    if (this._firebaseReady && this._db) {
      try {
        await this._db.collection("site").doc("data").set(this._data);
      } catch (e) { console.error("Erreur sauvegarde Firebase:", e); throw e; }
    }
  }

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
