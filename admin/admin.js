// ============================================================
// ADMIN PANEL — Local mode (no Firebase)
// DEFAULT_DATA est défini dans firebase-config.js (chargé avant)
// ============================================================

// ============================================================
// BOOTSTRAP
// ============================================================
let appData = {};
let firebaseReady = false;
let storageAvailable = false;
let storage = null;
let db = null;
let currentSection = "dashboard"; // must be top-level — used by hoisted initAdmin()

// Extension definitions — const hoisted to TDZ; keep here before any call
const EXTENSION_DEFS = [
  { key: "testimonials", icon: "⭐", name: "Témoignages clients",    desc: "Affiche la section témoignages avec notes étoiles sur le site public" },
  { key: "gallery",      icon: "🖼️", name: "Galerie photos",         desc: "Affiche la section galerie avec toutes vos images de projets" },
  { key: "stats",        icon: "📈", name: "Barre de statistiques",   desc: "Chiffres clés animés (projets réalisés, années d'expérience…)" },
  { key: "contact",      icon: "✉️", name: "Formulaire de contact",  desc: "Affiche la section contact avec formulaire — messages sauvegardés localement" },
  { key: "map",          icon: "🗺️", name: "Carte Google Maps",      desc: "Intègre une carte interactive avec votre adresse professionnelle" },
  { key: "chat",         icon: "💬", name: "Widget de chat",          desc: "Bouton flottant de chat en direct (Tawk.to ou Crisp — URL à configurer)" },
  { key: "newsletter",   icon: "📧", name: "Newsletter",             desc: "Bloc d'inscription à la newsletter (Mailchimp ou autre)" },
  { key: "faq",          icon: "❓", name: "FAQ",                    desc: "Section questions fréquentes avec accordéon interactif" },
  { key: "team",         icon: "👥", name: "Équipe",                  desc: "Présentation des membres et collaborateurs de l'entreprise" },
  { key: "partners",     icon: "🤝", name: "Partenaires & certifications", desc: "Logos des partenaires, labels et certifications (RGE, Qualibat…)" },
];

// ── Auth guard ──────────────────────────────────────────────
if (sessionStorage.getItem("scc_admin_auth") !== "1") {
  window.location.replace("login.html");
} else {
  const _sueEl = document.getElementById("sidebarUserEmail");
  if (_sueEl) _sueEl.textContent = "Administrateur";
  initAdmin().catch(e => {
    var p = document.getElementById("diagPanel");
    if (p) { p.style.display = "block"; p.textContent = "❌ initAdmin() crash: " + e.message + "\n" + e.stack; }
    console.error("initAdmin crash:", e);
  });
}

// ============================================================
// INIT
// ============================================================
async function initAdmin() {
  // Initialise DataManager — charge localStorage puis tente Firebase
  await dataManager.init();
  appData = dataManager._data; // référence partagée (objet in-place via _applyData)
  firebaseReady = dataManager._firebaseReady;
  db = dataManager._db;

  // Quand Firestore met à jour _data depuis un autre onglet/appareil,
  // _applyData() le fait in-place → appData reste valide automatiquement.
  // On écoute quand même pour rafraîchir l'UI admin si besoin.
  dataManager.on("all", () => {
    appData = dataManager._data;
    // Ne pas re-render — l'admin est source de vérité, pas récepteur
  });

  const _sb = document.getElementById("syncBadge");
  if (_sb) {
    if (firebaseReady) {
      _sb.textContent = "☁️ Firebase";
      _sb.className = "topbar-badge badge-firebase";
    } else {
      _sb.textContent = "💾 Local";
      _sb.className = "topbar-badge badge-local";
    }
  }

  renderCurrentSection();
  bindNav();
  bindGlobal();
}

// ============================================================
// DATA LAYER
// ============================================================
async function loadData() {
  if (!db) { loadLocalData(); return; } // admin panel is local-only
  const snap = await db.collection("site").doc("data").get();
  if (snap.exists) {
    appData = snap.data();
  } else {
    appData = JSON.parse(JSON.stringify(DEFAULT_DATA));
    await db.collection("site").doc("data").set(appData);
  }
  saveLocal();
}

function loadLocalData() {
  try {
    const saved = localStorage.getItem("bbSiteData");
    const base = (typeof DEFAULT_DATA !== "undefined") ? DEFAULT_DATA : {
      services:[], articles:[], categories:[], testimonials:[], stats:[], gallery:[],
      settings:{}, colors:{}, hero:{}, about:{}, extensions:{}
    };
    appData = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(base));
  } catch (e) {
    appData = { services:[], articles:[], categories:[], testimonials:[], stats:[], gallery:[],
      settings:{}, colors:{}, hero:{}, about:{}, extensions:{} };
  }
}

function saveLocal() {
  try { localStorage.setItem("bbSiteData", JSON.stringify(appData)); } catch (e) {}
}

async function saveData() {
  try {
    // _applyData() merge in-place — préserve la référence partagée entre appData et dataManager._data
    dataManager._applyData(appData);
    await dataManager.save(); // localStorage + Firestore si connecté
    // Après save(), _data a un _savedAt — garder appData sur le même objet
    appData = dataManager._data;
    const label = dataManager._firebaseLabel || "";
    toast(dataManager.isFirebaseReady() ? `☁️ Synchronisé (Firebase${label ? " " + label : ""})` : "💾 Sauvegardé (local)", "success");
  } catch(e) {
    // Fallback absolu : localStorage direct
    try { localStorage.setItem("bbSiteData", JSON.stringify(appData)); } catch(_) {}
    toast(`⚠️ Local uniquement — ${e.code || e.message || "Firebase KO"}`, "warning");
    console.error("saveData error:", e);
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
}

function escHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function get(path) {
  return path.split(".").reduce((o, k) => o?.[k], appData);
}

function set(path, value) {
  const keys = path.split(".");
  let obj = appData;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]] || typeof obj[keys[i]] !== "object") obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
}

// ============================================================
// NAVIGATION
// ============================================================
function bindNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    const activate = () => {
      const sec = item.dataset.section;
      if (!sec) return;
      currentSection = sec;
      document.querySelectorAll(".nav-item").forEach(n => { n.classList.remove("active"); n.setAttribute("aria-selected","false"); });
      item.classList.add("active");
      item.setAttribute("aria-selected","true");
      // Strip emoji/icons from topbar title for clean display
      const iconEl = item.querySelector(".nav-icon");
      let titleText = item.textContent.trim();
      if (iconEl) titleText = titleText.replace(iconEl.textContent.trim(), "").trim();
      document.getElementById("topbarTitle").textContent = titleText;
      document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
      const el = document.getElementById(`sec-${sec}`);
      if (el) el.style.display = "block";
      renderCurrentSection();
      document.getElementById("sidebar").classList.remove("mobile-open");
    };
    item.addEventListener("click", activate);
    item.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
  });
}

function renderCurrentSection() {
  const renders = {
    dashboard:    renderDashboard,
    messages:     renderMessages,
    services:     renderServicesTable,
    articles:     renderArticlesTable,
    categories:   renderCategoriesTable,
    testimonials: renderTestimonialsTable,
    gallery:      renderGallery,
    settings:     renderSettings,
    hero:         renderHero,
    colors:       renderColors,
    stats:        renderStatsSection,
    extensions:   renderExtensions,
    faq:          renderFaqTable,
    team:         renderTeamTable,
    partners:     renderPartnersTable
  };
  renders[currentSection]?.();
}

function bindGlobal() {
  // Save all
  document.getElementById("saveAllBtn")?.addEventListener("click", saveData);

  // Refresh messages
  document.getElementById("refreshMsgBtn")?.addEventListener("click", renderMessages);
  document.getElementById("msgCategoryFilter")?.addEventListener("change", renderMessages);
  document.getElementById("msgStatusFilter")?.addEventListener("change", renderMessages);

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (!confirm("Se déconnecter ?")) return;
    sessionStorage.removeItem("scc_admin_auth");
    window.location.replace("login.html");
  });

  // Mobile sidebar toggle
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("mobile-open");
  });

  // Modal close
  document.getElementById("modalClose")?.addEventListener("click", closeModal);
  document.getElementById("modalOverlay")?.addEventListener("click", e => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });

  // Boutons statiques — liés UNE SEULE FOIS ici pour éviter les doublons
  document.getElementById("addServiceBtn")?.addEventListener("click", () => editService(null));
  document.getElementById("addArticleBtn")?.addEventListener("click", () => editArticle(null));
  document.getElementById("addCatBtn")?.addEventListener("click",     () => editCategory(null));
  document.getElementById("addTestiBtn")?.addEventListener("click",   () => editTestimonial(null));
  document.getElementById("addFaqBtn")?.addEventListener("click",     () => editFaq(null));
  document.getElementById("addTeamBtn")?.addEventListener("click",    () => editTeam(null));
  document.getElementById("addPartnerBtn")?.addEventListener("click", () => editPartner(null));
  document.getElementById("saveSettingsBtn")?.addEventListener("click", saveSettings);
  document.getElementById("saveHeroBtn")?.addEventListener("click",   saveHero);
  document.getElementById("saveColorsBtn")?.addEventListener("click", saveColors);
  document.getElementById("addStatBtn")?.addEventListener("click",    addStat);
  document.getElementById("saveStatsBtn")?.addEventListener("click",  saveData);
  document.getElementById("saveExtBtn")?.addEventListener("click",    saveData);
  document.getElementById("galleryAddUrl")?.addEventListener("click", addGalleryUrl);
  document.getElementById("galleryFileInput")?.addEventListener("change", e => handleGalleryFiles(e.target.files));
  document.getElementById("serviceSearch")?.addEventListener("input", renderServicesTable);
  document.getElementById("articleSearch")?.addEventListener("input", renderArticlesTable);

  // Aperçu images (hero, about, logo) — maj en temps réel si URL saisie manuellement
  ["h-heroimg", "a-img", "s-logo"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", function() {
      const prev = document.getElementById(id + "-preview");
      if (prev) { prev.src = this.value || ""; prev.style.display = this.value ? "block" : "none"; }
    });
  });

  // Couleurs — liés une seule fois
  bindColors();

  // Drag & drop galerie
  const zone = document.getElementById("galleryDrop");
  zone?.addEventListener("click",     () => document.getElementById("galleryFileInput")?.click());
  zone?.addEventListener("dragover",  e => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone?.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone?.addEventListener("drop",      e => { e.preventDefault(); zone.classList.remove("drag-over"); handleGalleryFiles(e.dataTransfer.files); });
}

// ============================================================
// TOAST
// ============================================================
function toast(msg, type = "success") {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  const el = document.createElement("div");
  el.className = `toast ${type === "success" ? "" : type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]||"ℹ️"}</span><span>${msg}</span>`;
  document.getElementById("toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

// ============================================================
// MODAL
// ============================================================
function openModal(title, bodyHTML, footerHTML) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  document.getElementById("modalFooter").innerHTML = footerHTML || `<button class="btn btn-ghost" onclick="closeModal()">Fermer</button>`;
  document.getElementById("modalOverlay").classList.add("open");
}
function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const data = appData;
  const stats = [
    { icon: "🔧", val: (data.services||[]).length, lbl: "Services", cls: "blue" },
    { icon: "📰", val: (data.articles||[]).length, lbl: "Articles", cls: "green" },
    { icon: "⭐", val: (data.testimonials||[]).length, lbl: "Témoignages", cls: "yellow" },
    { icon: "🖼️", val: (data.gallery||[]).length, lbl: "Images galerie", cls: "purple" }
  ];
  document.getElementById("dashStats").innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-card-icon ${s.cls}">${s.icon}</div>
      <div class="stat-card-info"><div class="val">${s.val}</div><div class="lbl">${s.lbl}</div></div>
    </div>`).join("");

  document.getElementById("quickActions").innerHTML = [
    { icon: "🔧", lbl: "Ajouter un service",    sec: "services" },
    { icon: "📰", lbl: "Nouvel article",         sec: "articles" },
    { icon: "🎨", lbl: "Modifier les couleurs",  sec: "colors" },
    { icon: "🖼️", lbl: "Gérer la galerie",       sec: "gallery" }
  ].map(a => `<button class="quick-btn" onclick="goTo('${a.sec}')"><span class="quick-btn-icon">${a.icon}</span>${a.lbl}</button>`).join("");

  // Recent messages
  loadRecentMessages();
}

function goTo(sec) {
  document.querySelector(`[data-section="${sec}"]`)?.click();
}

function loadRecentMessages() {
  const el = document.getElementById("recentMessages");
  if (!el) return;
  el.innerHTML = `<div class="section-header-bar" style="margin-top:24px"><div><h2>Messages récents</h2></div><button class="btn btn-ghost btn-sm" onclick="goTo('messages')">Voir tout →</button></div>`;
  const msgs = _getLocalMsgs().slice(0, 3);
  if (!msgs.length) { el.innerHTML += `<p style="color:var(--text-m);font-size:0.85rem">Aucun message reçu.</p>`; return; }
  msgs.forEach(m => el.innerHTML += renderMsgCard(m, false));
}

// ============================================================
// MESSAGES (localStorage)
// ============================================================
function _getLocalMsgs() {
  try { return JSON.parse(localStorage.getItem("bbMessages") || "[]").sort((a,b) => new Date(b.date) - new Date(a.date)); }
  catch(e) { return []; }
}
function _saveLocalMsgs(msgs) {
  localStorage.setItem("bbMessages", JSON.stringify(msgs));
}

function _ensureMsgUids() {
  // Backfill _uid for older messages that don't have one
  const all = JSON.parse(localStorage.getItem("bbMessages") || "[]");
  let changed = false;
  all.forEach(m => { if (!m._uid) { m._uid = `msg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`; changed = true; } });
  if (changed) _saveLocalMsgs(all);
  return all;
}

function renderMessages() {
  const el = document.getElementById("messagesList");
  if (!el) return;
  const allMsgs = _ensureMsgUids().sort((a,b) => new Date(b.date) - new Date(a.date));

  // Filters
  const catFilter    = document.getElementById("msgCategoryFilter")?.value || "";
  const statusFilter = document.getElementById("msgStatusFilter")?.value || "";
  const msgs = allMsgs.filter(m => {
    if (catFilter    && m.subject !== catFilter) return false;
    if (statusFilter === "unread" &&  m.read)   return false;
    if (statusFilter === "read"   && !m.read)   return false;
    return true;
  });

  // Count badge
  const countEl = document.getElementById("msgCount");
  if (countEl) {
    const unreadTotal = allMsgs.filter(m => !m.read).length;
    countEl.textContent = msgs.length !== allMsgs.length
      ? `${msgs.length} message${msgs.length > 1 ? "s" : ""} affiché${msgs.length > 1 ? "s" : ""} sur ${allMsgs.length} — ${unreadTotal} non lu${unreadTotal > 1 ? "s" : ""}`
      : `${allMsgs.length} message${allMsgs.length > 1 ? "s" : ""} — ${unreadTotal} non lu${unreadTotal > 1 ? "s" : ""}`;
  }

  if (!msgs.length) {
    el.innerHTML = allMsgs.length
      ? `<div class="empty-state"><div class="empty-state-icon">🔍</div><h4>Aucun résultat</h4><p>Aucun message ne correspond à ce filtre.</p></div>`
      : `<div class="empty-state"><div class="empty-state-icon">📭</div><h4>Aucun message</h4><p>Les messages du formulaire de contact apparaîtront ici.</p></div>`;
  } else {
    el.innerHTML = msgs.map(m => renderMsgCard(m, true)).join("");
  }

  // Nav badge — unread count (all messages, not filtered)
  const unread = allMsgs.filter(m => !m.read).length;
  const badge = document.getElementById("msgBadge");
  if (badge) { badge.textContent = unread; badge.style.display = unread ? "inline" : "none"; }
}

function renderMsgCard(msg, showDelete = false) {
  const date = msg.date ? new Date(msg.date).toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "";
  const safeUid     = escHtml(msg._uid || "");
  const firstName   = escHtml(msg.firstName);
  const lastName    = escHtml(msg.lastName);
  const email       = escHtml(msg.email);
  const subject     = escHtml(msg.subject) || "Sans objet";
  const phone       = msg.phone ? ` · 📞 ${escHtml(msg.phone)}` : "";
  const body        = escHtml(msg.message).replace(/\n/g, "<br>");
  return `
    <div class="message-card${msg.read ? "" : " unread"}">
      <div class="message-header">
        <div><div class="message-sender">${firstName} ${lastName} <span style="font-weight:400;color:var(--text-m)">— ${email}</span></div>
        <div class="message-subject">📋 ${subject}${phone}</div></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="message-date">${date}</span>
          ${!msg.read && showDelete ? `<button class="btn btn-ghost btn-sm" onclick="markMsgRead('${safeUid}')">Lu</button>` : ""}
          ${showDelete ? `<button class="btn btn-danger btn-sm btn-icon" aria-label="Supprimer" onclick="deleteMsg('${safeUid}')">🗑</button>` : ""}
        </div>
      </div>
      <div class="message-body">${body}</div>
    </div>`;
}

function markMsgRead(uid) {
  const all = _ensureMsgUids();
  const m = all.find(x => x._uid === uid);
  if (m) m.read = true;
  _saveLocalMsgs(all);
  renderMessages();
}
function deleteMsg(uid) {
  if (!confirm("Supprimer ce message définitivement ?")) return;
  const all = _ensureMsgUids();
  const idx = all.findIndex(x => x._uid === uid);
  if (idx >= 0) all.splice(idx, 1);
  _saveLocalMsgs(all);
  renderMessages();
  toast("Message supprimé");
}

// ============================================================
// SERVICES
// ============================================================
function renderServicesTable() {
  const services = appData.services || [];
  const categories = appData.categories || [];
  const tbody = document.getElementById("servicesTable");
  if (!tbody) return;

  const search = document.getElementById("serviceSearch");
  const filter = (search?.value||"").toLowerCase();
  const filtered = services.filter(s => !filter || s.title?.toLowerCase().includes(filter));

  tbody.innerHTML = filtered.length ? filtered.map(s => {
    const cat = categories.find(c => c.id === s.categoryId);
    return `<tr>
      <td class="td-icon">${s.icon||"🔧"}</td>
      <td><div class="td-title">${escHtml(s.title)}</div><div class="td-sub">${escHtml((s.description||"").slice(0,50))}…</div></td>
      <td>${cat ? `<span class="badge badge-info">${escHtml(cat.name)}</span>` : "—"}</td>
      <td>${s.featured ? `<span class="badge badge-success">⭐ Oui</span>` : `<span class="badge badge-neutral">Non</span>`}</td>
      <td>${s.active !== false ? `<span class="badge badge-success">Actif</span>` : `<span class="badge badge-danger">Masqué</span>`}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editService('${s.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteService('${s.id}')" title="Supprimer">🗑</button>
      </td></tr>`;
  }).join("") : `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-m)">Aucun service trouvé</td></tr>`;

}

function serviceFormHTML(s = {}, categories = []) {
  const icons = ["🔧","🏗️","🔍","💡","📋","⚡","✅","🏠","🔨","📐","🗂️","🌿","🔑","💼","🏛️","⭐"];
  return `
    <div class="form-grid">
      <div class="form-group span-2"><label>Titre <span class="req">*</span></label><input id="sf-title" type="text" value="${s.title||""}" placeholder="Conseil en construction" required></div>
      <div class="form-group span-2"><label>Description</label><textarea id="sf-desc" rows="3" placeholder="Description du service…">${s.description||""}</textarea></div>
      <div class="form-group"><label>Catégorie</label>
        <select id="sf-cat">
          <option value="">— Aucune —</option>
          ${categories.map(c => `<option value="${c.id}" ${s.categoryId===c.id?"selected":""}>${c.icon||""} ${c.name}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Ordre d'affichage</label><input id="sf-order" type="number" value="${s.order||1}" min="1"></div>
      <div class="form-group span-2">
        <label>Image du service</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input id="sf-img" type="url" value="${s.image||""}" placeholder="https://… ou cliquez Upload" style="flex:1" oninput="(function(v){var p=document.getElementById('sf-img-preview');if(p){p.src=v;p.style.display=v?'block':'none'}})(this.value)">
          <button type="button" class="btn btn-ghost btn-sm" onclick="pickImage('sf-img')" style="white-space:nowrap;flex-shrink:0">📁 Upload</button>
        </div>
        <img id="sf-img-preview" src="${s.image||""}" style="${s.image?"":"display:none;"}margin-top:8px;max-height:90px;border-radius:6px;object-fit:cover;border:1px solid var(--border)">
      </div>
      <div class="form-group"><label>Icône</label>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span id="sf-icon-preview" style="font-size:1.8rem">${s.icon||"🔧"}</span>
          <input id="sf-icon" type="text" value="${s.icon||"🔧"}" style="width:80px;text-align:center;font-size:1.2rem" oninput="document.getElementById('sf-icon-preview').textContent=this.value">
        </div>
        <div class="icon-grid">${icons.map(ic => `<button type="button" class="icon-btn${s.icon===ic?" selected":""}" onclick="selectIcon('${ic}',this)">${ic}</button>`).join("")}</div>
      </div>
      <div class="form-group">
        <label>Options</label>
        <div class="toggle-wrap" style="margin-bottom:10px">
          <label class="toggle"><input type="checkbox" id="sf-featured" ${s.featured?"checked":""}><span class="toggle-slider"></span></label>
          <span class="toggle-label-txt">Mis en avant</span>
        </div>
        <div class="toggle-wrap">
          <label class="toggle"><input type="checkbox" id="sf-active" ${s.active!==false?"checked":""}><span class="toggle-slider"></span></label>
          <span class="toggle-label-txt">Actif / Visible</span>
        </div>
      </div>
    </div>`;
}

function selectIcon(ic, btn) {
  document.getElementById("sf-icon").value = ic;
  document.getElementById("sf-icon-preview").textContent = ic;
  document.querySelectorAll(".icon-btn").forEach(b => b.classList.remove("selected"));
  if (btn) btn.classList.add("selected");
}

function selectCatIcon(ic, btn) {
  const inp  = document.getElementById("cf2-icon");
  const prev = document.getElementById("cf2-icon-preview");
  if (inp)  inp.value = ic;
  if (prev) prev.textContent = ic;
  document.querySelectorAll(".icon-btn").forEach(b => b.classList.remove("selected"));
  if (btn) btn.classList.add("selected");
}

function editService(id) {
  const services = appData.services || [];
  const cats = appData.categories || [];
  const s = id ? services.find(x => x.id === id) : {};
  openModal(
    id ? "Modifier le service" : "Ajouter un service",
    serviceFormHTML(s||{}, cats),
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="saveService('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function saveService(id) {
  const title = document.getElementById("sf-title").value.trim();
  if (!title) { toast("Le titre est requis", "error"); return; }
  const service = {
    id: id || uid("s"),
    title,
    description: document.getElementById("sf-desc").value.trim(),
    categoryId:  document.getElementById("sf-cat").value,
    order:       parseInt(document.getElementById("sf-order").value) || 1,
    image:       document.getElementById("sf-img").value.trim(),
    icon:        document.getElementById("sf-icon").value.trim() || "🔧",
    featured:    document.getElementById("sf-featured").checked,
    active:      document.getElementById("sf-active").checked
  };
  const services = appData.services || [];
  if (id) { const i = services.findIndex(x => x.id === id); if (i >= 0) services[i] = service; }
  else services.push(service);
  appData.services = services;
  closeModal();
  await saveData();
  renderServicesTable();
}

async function deleteService(id) {
  if (!confirm("Supprimer ce service définitivement ?")) return;
  appData.services = (appData.services || []).filter(s => s.id !== id);
  await saveData();
  renderServicesTable();
  toast("Service supprimé");
}

// ============================================================
// ARTICLES
// ============================================================
function renderArticlesTable() {
  const articles = appData.articles || [];
  const tbody = document.getElementById("articlesTable");
  if (!tbody) return;

  const search = (document.getElementById("articleSearch")?.value||"").toLowerCase();
  const filtered = articles.filter(a => !search || a.title?.toLowerCase().includes(search));

  tbody.innerHTML = filtered.length ? filtered.map(a => {
    const date = a.date ? new Date(a.date).toLocaleDateString("fr-FR") : "—";
    return `<tr>
      <td><div class="td-title">${escHtml(a.title)}</div></td>
      <td>${a.category ? `<span class="badge badge-info">${escHtml(a.category)}</span>` : "—"}</td>
      <td>${date}</td>
      <td>${a.published !== false ? `<span class="badge badge-success">Publié</span>` : `<span class="badge badge-warning">Brouillon</span>`}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editArticle('${a.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteArticle('${a.id}')" title="Supprimer">🗑</button>
      </td></tr>`;
  }).join("") : `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-m)">Aucun article trouvé</td></tr>`;

}

function articleFormHTML(a = {}) {
  const cats = (appData.categories || []).filter(c => !c.type || c.type === "article" || c.type === "service");
  return `
    <div class="form-grid cols-1">
      <div class="form-group"><label>Titre <span class="req">*</span></label><input id="af-title" type="text" value="${(a.title||"").replace(/"/g,"&quot;")}" placeholder="Titre de l'article" required></div>
      <div class="form-group"><label>Extrait (résumé)</label><textarea id="af-excerpt" rows="2" placeholder="Courte description affichée en liste…">${a.excerpt||""}</textarea></div>
      <div class="form-group"><label>Contenu complet (HTML)</label><textarea id="af-content" rows="8" placeholder="<p>Contenu de l'article…</p>">${a.content||""}</textarea></div>
      <div class="form-grid" style="grid-column:1">
        <div class="form-group"><label>Catégorie</label>
          <select id="af-cat">
            <option value="">— Choisir —</option>
            ${cats.map(c => `<option value="${c.name}" ${a.category===c.name?"selected":""}>${c.name}</option>`).join("")}
            <option value="Conseil" ${a.category==="Conseil"?"selected":""}>Conseil</option>
            <option value="Actualité" ${a.category==="Actualité"?"selected":""}>Actualité</option>
          </select>
        </div>
        <div class="form-group"><label>Date de publication</label><input id="af-date" type="date" value="${a.date||new Date().toISOString().slice(0,10)}"></div>
      </div>
      <div class="form-group">
        <label>Image de l'article</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input id="af-img" type="url" value="${a.image||""}" placeholder="https://… ou cliquez Upload" style="flex:1" oninput="(function(v){var p=document.getElementById('af-img-preview');if(p){p.src=v;p.style.display=v?'block':'none'}})(this.value)">
          <button type="button" class="btn btn-ghost btn-sm" onclick="pickImage('af-img')" style="white-space:nowrap;flex-shrink:0">📁 Upload</button>
        </div>
        <img id="af-img-preview" src="${a.image||""}" style="${a.image?"":"display:none;"}margin-top:8px;max-height:90px;border-radius:6px;object-fit:cover;border:1px solid var(--border)">
      </div>
      <div class="toggle-wrap">
        <label class="toggle"><input type="checkbox" id="af-published" ${a.published!==false?"checked":""}><span class="toggle-slider"></span></label>
        <span class="toggle-label-txt">Publié (visible sur le site)</span>
      </div>
    </div>`;
}

function editArticle(id) {
  const articles = appData.articles || [];
  const a = id ? articles.find(x => x.id === id) : {};
  openModal(
    id ? "Modifier l'article" : "Nouvel article",
    articleFormHTML(a||{}),
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="saveArticle('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function saveArticle(id) {
  const title = document.getElementById("af-title").value.trim();
  if (!title) { toast("Le titre est requis", "error"); return; }
  const article = {
    id:        id || uid("a"),
    title,
    excerpt:   document.getElementById("af-excerpt").value.trim(),
    content:   document.getElementById("af-content").value.trim(),
    category:  document.getElementById("af-cat").value,
    date:      document.getElementById("af-date").value,
    image:     document.getElementById("af-img").value.trim(),
    published: document.getElementById("af-published").checked,
    slug:      title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")
  };
  const articles = appData.articles || [];
  if (id) { const i = articles.findIndex(x => x.id === id); if (i >= 0) articles[i] = article; }
  else articles.push(article);
  appData.articles = articles;
  closeModal();
  await saveData();
  renderArticlesTable();
}

async function deleteArticle(id) {
  if (!confirm("Supprimer cet article définitivement ?")) return;
  appData.articles = (appData.articles || []).filter(a => a.id !== id);
  await saveData();
  renderArticlesTable();
  toast("Article supprimé");
}

// ============================================================
// CATEGORIES
// ============================================================
function renderCategoriesTable() {
  const cats = appData.categories || [];
  const tbody = document.getElementById("categoriesTable");
  if (!tbody) return;
  tbody.innerHTML = cats.length ? cats.sort((a,b)=>(a.order||99)-(b.order||99)).map(c => `
    <tr>
      <td class="td-icon">${c.icon||"🏷️"}</td>
      <td class="td-title">${escHtml(c.name)}</td>
      <td><span class="badge badge-info">${c.type||"service"}</span></td>
      <td>${c.order||1}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editCategory('${c.id}')">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteCategory('${c.id}')">🗑</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-m)">Aucune catégorie</td></tr>`;

}

function catFormHTML(c = {}) {
  const icons = ["💡","🏗️","🔍","📋","⚡","✅","🏠","⭐","🔧","🌿","🔑","💼","🏛️","📐","🗂️","📊"];
  const safeName = escHtml(c.name || "");
  return `
    <div class="form-grid">
      <div class="form-group"><label>Nom <span class="req">*</span></label><input id="cf2-name" type="text" value="${safeName}" placeholder="Conseil"></div>
      <div class="form-group"><label>Type</label>
        <select id="cf2-type">
          <option value="service" ${c.type==="service"||!c.type?"selected":""}>Service</option>
          <option value="article" ${c.type==="article"?"selected":""}>Article</option>
          <option value="both" ${c.type==="both"?"selected":""}>Les deux</option>
        </select>
      </div>
      <div class="form-group"><label>Ordre</label><input id="cf2-order" type="number" value="${c.order||1}" min="1"></div>
      <div class="form-group"><label>Icône</label>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <span id="cf2-icon-preview" style="font-size:1.8rem">${c.icon||"🏷️"}</span>
          <input id="cf2-icon" type="text" value="${c.icon||"🏷️"}" style="width:80px;text-align:center;font-size:1.2rem">
        </div>
        <div class="icon-grid">${icons.map(ic => `<button type="button" class="icon-btn${c.icon===ic?" selected":""}" onclick="selectCatIcon('${ic}',this)">${ic}</button>`).join("")}</div>
      </div>
    </div>`;
}

function editCategory(id) {
  const cat = id ? (appData.categories||[]).find(c => c.id === id) : {};
  openModal(
    id ? "Modifier la catégorie" : "Nouvelle catégorie",
    catFormHTML(cat||{}),
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="saveCategory('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function saveCategory(id) {
  const name = document.getElementById("cf2-name").value.trim();
  if (!name) { toast("Le nom est requis","error"); return; }
  const cat = {
    id:    id || uid("cat"),
    name,
    type:  document.getElementById("cf2-type").value,
    order: parseInt(document.getElementById("cf2-order").value) || 1,
    icon:  document.getElementById("cf2-icon").value.trim() || "🏷️"
  };
  const cats = appData.categories || [];
  if (id) { const i = cats.findIndex(c => c.id === id); if (i >= 0) cats[i] = cat; }
  else cats.push(cat);
  appData.categories = cats;
  closeModal();
  await saveData();
  renderCategoriesTable();
}

async function deleteCategory(id) {
  if (!confirm("Supprimer cette catégorie ?")) return;
  appData.categories = (appData.categories||[]).filter(c => c.id !== id);
  await saveData();
  renderCategoriesTable();
  toast("Catégorie supprimée");
}

// ============================================================
// TESTIMONIALS
// ============================================================
function renderTestimonialsTable() {
  const items = appData.testimonials || [];
  const tbody = document.getElementById("testimonialsTable");
  if (!tbody) return;
  tbody.innerHTML = items.length ? items.map(t => `
    <tr>
      <td class="td-title">${escHtml(t.name)}</td>
      <td style="color:var(--text-m);font-size:0.82rem">${escHtml(t.role)||"—"}</td>
      <td>${"★".repeat(t.rating||5)}</td>
      <td>${t.active!==false?`<span class="badge badge-success">Visible</span>`:`<span class="badge badge-neutral">Masqué</span>`}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editTestimonial('${t.id}')">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTestimonial('${t.id}')">🗑</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-m)">Aucun témoignage</td></tr>`;

}

function testiFormHTML(t = {}) {
  return `
    <div class="form-grid cols-1">
      <div class="form-grid">
        <div class="form-group"><label>Nom <span class="req">*</span></label><input id="tf-name" type="text" value="${t.name||""}" placeholder="Sophie M."></div>
        <div class="form-group"><label>Rôle / Contexte</label><input id="tf-role" type="text" value="${t.role||""}" placeholder="Propriétaire - Maison individuelle"></div>
      </div>
      <div class="form-group"><label>Témoignage <span class="req">*</span></label><textarea id="tf-text" rows="4" placeholder="Texte du témoignage…">${t.text||""}</textarea></div>
      <div class="form-group"><label>Note (1 à 5 étoiles)</label>
        <select id="tf-rating">
          ${[5,4,3,2,1].map(n=>`<option value="${n}" ${(t.rating||5)===n?"selected":""}>${"★".repeat(n)} ${n}/5</option>`).join("")}
        </select>
      </div>
      <div class="toggle-wrap">
        <label class="toggle"><input type="checkbox" id="tf-active" ${t.active!==false?"checked":""}><span class="toggle-slider"></span></label>
        <span class="toggle-label-txt">Visible sur le site</span>
      </div>
    </div>`;
}

function editTestimonial(id) {
  const t = id ? (appData.testimonials||[]).find(x => x.id === id) : {};
  openModal(
    id ? "Modifier le témoignage" : "Ajouter un témoignage",
    testiFormHTML(t||{}),
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="saveTestimonial('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function saveTestimonial(id) {
  const name = document.getElementById("tf-name").value.trim();
  const text = document.getElementById("tf-text").value.trim();
  if (!name || !text) { toast("Nom et témoignage requis","error"); return; }
  const t = {
    id:     id || uid("t"),
    name,
    role:   document.getElementById("tf-role").value.trim(),
    text,
    rating: parseInt(document.getElementById("tf-rating").value) || 5,
    active: document.getElementById("tf-active").checked
  };
  const items = appData.testimonials || [];
  if (id) { const i = items.findIndex(x => x.id === id); if (i >= 0) items[i] = t; }
  else items.push(t);
  appData.testimonials = items;
  closeModal();
  await saveData();
  renderTestimonialsTable();
}

async function deleteTestimonial(id) {
  if (!confirm("Supprimer ce témoignage ?")) return;
  appData.testimonials = (appData.testimonials||[]).filter(t => t.id !== id);
  await saveData();
  renderTestimonialsTable();
  toast("Témoignage supprimé");
}

// ============================================================
// GALLERY — Firebase Storage
// ============================================================
function renderGallery() {
  const gallery = appData.gallery || [];
  const grid = document.getElementById("galleryGrid");
  if (!grid) return;

  grid.innerHTML = gallery.length ? gallery.map(img => {
    const safeUrl  = escHtml(img.url  || "");
    const safeId   = escHtml(img.id   || "");
    const safeName = escHtml(img.name || "");
    return `
    <div class="gallery-item">
      <img src="${safeUrl}" alt="${safeName}" loading="lazy">
      <div class="gallery-item-overlay">
        <button class="copy-url-btn" onclick="copyUrl('${safeUrl}')">📋 Copier URL</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteGalleryImg('${safeId}')" style="background:rgba(239,68,68,0.8);border-color:transparent">🗑</button>
      </div>
      <div class="gallery-item-name">${safeName}</div>
    </div>`;
  }).join("") : `<p style="grid-column:1/-1;text-align:center;color:var(--text-m);padding:24px">Aucune image dans la galerie</p>`;

}

async function handleGalleryFiles(files) {
  if (!files?.length) return;
  for (const file of Array.from(files)) {
    if (!file.type.startsWith("image/")) { toast(`${file.name} n'est pas une image`, "error"); continue; }
    if (file.size > 15 * 1024 * 1024) { toast(`${file.name} dépasse 15 Mo`, "warning"); continue; }
    toast(`Compression de ${file.name}…`, "info");
    try {
      let url;
      if (storageAvailable && storage) {
        try {
          const ref = storage.ref(`gallery/${Date.now()}_${file.name}`);
          await ref.put(file);
          url = await ref.getDownloadURL();
        } catch(storageErr) {
          console.warn("Storage indisponible, fallback base64:", storageErr.message);
          url = await compressAndEncode(file, 800, 0.75);
        }
      } else {
        // Compression + base64 (max ~700KB encodé pour tenir dans Firestore 1MB)
        url = await compressAndEncode(file, 800, 0.75);
      }
      const img = { id: uid("img"), name: file.name, url, date: new Date().toISOString() };
      appData.gallery = [...(appData.gallery||[]), img];
      await saveData();
      renderGallery();
      toast(`✅ ${file.name} ajouté !`);
    } catch(e) { toast(`Erreur upload ${file.name} : ${e.message}`, "error"); }
  }
}

/** Compresse une image via Canvas et retourne une data URL */
function compressAndEncode(file, maxPx = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        // Redimensionner si trop grand
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx; }
          else { width = Math.round(width * maxPx / height); height = maxPx; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}


/**
 * Ouvre un sélecteur de fichier, compresse l'image, et remplit l'input cible.
 * Affiche aussi un aperçu si un <img id="${inputId}-preview"> existe.
 * @param {string} inputId  — id du <input type="url"> cible
 * @param {number} maxPx    — largeur/hauteur max en px (défaut 1200)
 * @param {number} quality  — qualité JPEG 0–1 (défaut 0.82)
 */
function pickImage(inputId, maxPx = 1200, quality = 0.82) {
  const fp = document.createElement("input");
  fp.type = "file";
  fp.accept = "image/*";
  fp.style.cssText = "position:fixed;left:-9999px;opacity:0";
  document.body.appendChild(fp);
  fp.addEventListener("change", async () => {
    const file = fp.files?.[0];
    fp.remove();
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { toast("Image trop volumineuse (max 15 Mo)", "error"); return; }
    toast("⏳ Compression en cours…", "info");
    try {
      const dataUrl = await compressAndEncode(file, maxPx, quality);
      const el = document.getElementById(inputId);
      if (el) { el.value = dataUrl; el.dispatchEvent(new Event("input", { bubbles: true })); }
      const prev = document.getElementById(inputId + "-preview");
      if (prev) { prev.src = dataUrl; prev.style.display = "block"; }
      toast("✅ Image chargée !");
    } catch(e) { toast("Erreur image : " + e.message, "error"); }
  });
  fp.click();
}

async function addGalleryUrl() {
  const input = document.getElementById("galleryUrlInput");
  const url = input?.value.trim();
  if (!url || !url.startsWith("http")) { toast("URL invalide","error"); return; }
  const name = url.split("/").pop().split("?")[0] || "image";
  const img = { id: uid("img"), name, url, date: new Date().toISOString() };
  appData.gallery = [...(appData.gallery||[]), img];
  input.value = "";
  await saveData();
  renderGallery();
  toast("Image ajoutée depuis URL");
}

async function deleteGalleryImg(id) {
  if (!confirm("Supprimer cette image ?")) return;
  const img = (appData.gallery||[]).find(i => i.id === id);
  // Delete from Firebase Storage if possible
  if (img && img.url && img.url.includes("firebasestorage") && storage) {
    try { await storage.refFromURL(img.url).delete(); } catch(e) { console.warn("Impossible de supprimer du Storage:", e); }
  }
  appData.gallery = (appData.gallery||[]).filter(i => i.id !== id);
  await saveData();
  renderGallery();
  toast("Image supprimée");
}

function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => toast("URL copiée dans le presse-papiers !")).catch(() => {
    prompt("Copiez cette URL :", url);
  });
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  const s = appData.settings || {};
  const fields = { "s-name": s.siteName, "s-tagline": s.tagline, "s-desc": s.description,
    "s-phone": s.phone, "s-email": s.email, "s-address": s.address,
    "s-logo": s.logo, "s-footer": s.footerText,
    "s-linkedin": s.socialLinkedIn, "s-facebook": s.socialFacebook, "s-instagram": s.socialInstagram,
    "s-mapembed": s.mapEmbed, "s-chaturl": s.chatUrl, "s-newsletterurl": s.newsletterUrl };
  Object.entries(fields).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val||""; });
  // Aperçu logo
  const logoInp = document.getElementById("s-logo");
  const logoPrev = document.getElementById("s-logo-preview");
  if (logoInp && logoPrev) { logoPrev.src = logoInp.value || ""; logoPrev.style.display = logoInp.value ? "block" : "none"; }
}

async function saveSettings() {
  const s = appData.settings || {};
  s.siteName      = document.getElementById("s-name")?.value.trim();
  s.tagline       = document.getElementById("s-tagline")?.value.trim();
  s.description   = document.getElementById("s-desc")?.value.trim();
  s.phone         = document.getElementById("s-phone")?.value.trim();
  s.email         = document.getElementById("s-email")?.value.trim();
  s.address       = document.getElementById("s-address")?.value.trim();
  s.logo          = document.getElementById("s-logo")?.value.trim();
  s.footerText    = document.getElementById("s-footer")?.value.trim();
  s.socialLinkedIn  = document.getElementById("s-linkedin")?.value.trim();
  s.socialFacebook  = document.getElementById("s-facebook")?.value.trim();
  s.socialInstagram = document.getElementById("s-instagram")?.value.trim();
  s.mapEmbed        = document.getElementById("s-mapembed")?.value.trim();
  s.chatUrl         = document.getElementById("s-chaturl")?.value.trim();
  s.newsletterUrl   = document.getElementById("s-newsletterurl")?.value.trim();
  appData.settings = s;
  const _logoEl = document.getElementById("sidebarLogo");
  if (_logoEl) _logoEl.textContent = s.siteName || "SCC";
  await saveData();
}

// ============================================================
// HERO & ABOUT
// ============================================================
function renderHero() {
  const h = appData.hero || {};
  const a = appData.about || {};
  const s = appData.settings || {};
  const map = {
    "h-title":   h.title,   "h-subtitle": h.subtitle,
    "h-cta1":    h.ctaLabel, "h-cta1link": h.ctaLink,
    "h-cta2":    h.ctaSecondLabel, "h-cta2link": h.ctaSecondLink,
    "h-heroimg": s.heroImage,
    "a-title":   a.title,   "a-text": a.text, "a-img": a.image,
    "a-s1v": a.stat1Value, "a-s1l": a.stat1Label,
    "a-s2v": a.stat2Value, "a-s2l": a.stat2Label,
    "a-s3v": a.stat3Value, "a-s3l": a.stat3Label
  };
  Object.entries(map).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val||""; });
  // Aperçu images après chargement des valeurs
  ["h-heroimg", "a-img"].forEach(id => {
    const inp = document.getElementById(id);
    const prev = document.getElementById(id + "-preview");
    if (inp && prev) { prev.src = inp.value || ""; prev.style.display = inp.value ? "block" : "none"; }
  });
}

async function saveHero() {
  appData.hero = {
    title:           document.getElementById("h-title")?.value.trim(),
    subtitle:        document.getElementById("h-subtitle")?.value.trim(),
    ctaLabel:        document.getElementById("h-cta1")?.value.trim(),
    ctaLink:         document.getElementById("h-cta1link")?.value.trim(),
    ctaSecondLabel:  document.getElementById("h-cta2")?.value.trim(),
    ctaSecondLink:   document.getElementById("h-cta2link")?.value.trim()
  };
  appData.settings = appData.settings || {};
  appData.settings.heroImage = document.getElementById("h-heroimg")?.value.trim();
  appData.about = {
    title:       document.getElementById("a-title")?.value.trim(),
    text:        document.getElementById("a-text")?.value.trim(),
    image:       document.getElementById("a-img")?.value.trim(),
    stat1Value:  document.getElementById("a-s1v")?.value.trim(),
    stat1Label:  document.getElementById("a-s1l")?.value.trim(),
    stat2Value:  document.getElementById("a-s2v")?.value.trim(),
    stat2Label:  document.getElementById("a-s2l")?.value.trim(),
    stat3Value:  document.getElementById("a-s3v")?.value.trim(),
    stat3Label:  document.getElementById("a-s3l")?.value.trim()
  };
  await saveData();
}

// ============================================================
// COLORS
// ============================================================
function renderColors() {
  const c = appData.colors || {};
  const pairs = [
    ["primary",   c.primary   || "#1a3c5e"],
    ["secondary", c.secondary || "#c8a96e"],
    ["accent",    c.accent    || "#e8f4f8"],
    ["dark",      c.dark      || "#0d1f2d"],
    ["light",     c.light     || "#f8f6f0"]
  ];
  pairs.forEach(([name, val]) => {
    const picker = document.getElementById(`c-${name}-picker`);
    const hex    = document.getElementById(`c-${name}-hex`);
    if (picker) picker.value = val;
    if (hex)    hex.value    = val;
  });
  updateThemePreview();
}

function bindColors() {
  ["primary","secondary","accent","dark","light"].forEach(name => {
    const picker = document.getElementById(`c-${name}-picker`);
    const hex    = document.getElementById(`c-${name}-hex`);
    if (picker) picker.addEventListener("input", () => { if (hex) hex.value = picker.value; updateThemePreview(); });
    if (hex)    hex.addEventListener("input",   () => { if (/^#[0-9a-f]{6}$/i.test(hex.value)) { if (picker) picker.value = hex.value; updateThemePreview(); } });
  });
}

function updateThemePreview() {
  const p = document.getElementById("c-primary-picker")?.value   || "#1a3c5e";
  const s = document.getElementById("c-secondary-picker")?.value || "#c8a96e";
  const d = document.getElementById("c-dark-picker")?.value      || "#0d1f2d";
  const bar  = document.getElementById("tpBar");
  const body = document.getElementById("tpBody");
  const btn1 = document.getElementById("tpBtn1");
  const btn2 = document.getElementById("tpBtn2");
  if (bar)  bar.style.background  = d;
  if (body) body.style.background = "#f8f9fa";
  if (btn1) { btn1.style.background = p; btn1.style.color = "#fff"; }
  if (btn2) { btn2.style.background = s; btn2.style.color = d; }
}

async function saveColors() {
  appData.colors = {
    primary:   document.getElementById("c-primary-hex")?.value   || "#1a3c5e",
    secondary: document.getElementById("c-secondary-hex")?.value || "#c8a96e",
    accent:    document.getElementById("c-accent-hex")?.value    || "#e8f4f8",
    dark:      document.getElementById("c-dark-hex")?.value      || "#0d1f2d",
    light:     document.getElementById("c-light-hex")?.value     || "#f8f6f0"
  };
  await saveData();
}

// ============================================================
// STATS
// ============================================================
function renderStatsSection() {
  const stats = appData.stats || [];
  const tbody = document.getElementById("statsTable");
  if (!tbody) return;
  tbody.innerHTML = stats.map((s, i) => `
    <tr>
      <td><input type="text" value="${s.icon||"🏗️"}" style="width:60px;font-size:1.2rem;text-align:center;border:1.5px solid var(--border);border-radius:4px;padding:4px" oninput="updateStat(${i},'icon',this.value)"></td>
      <td><input type="text" value="${s.value||""}" style="width:100px;border:1.5px solid var(--border);border-radius:4px;padding:6px 8px;font-size:0.9rem" oninput="updateStat(${i},'value',this.value)" placeholder="500+"></td>
      <td><input type="text" value="${s.label||""}" style="width:180px;border:1.5px solid var(--border);border-radius:4px;padding:6px 8px;font-size:0.9rem" oninput="updateStat(${i},'label',this.value)" placeholder="Projets réalisés"></td>
      <td class="td-actions">
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteStat('${s.id}')">🗑</button>
      </td>
    </tr>`).join("");

}

function updateStat(index, field, value) {
  if (appData.stats?.[index]) appData.stats[index][field] = value;
}
async function addStat() {
  appData.stats = [...(appData.stats||[]), { id: uid("st"), icon: "⭐", value: "0", label: "Nouvelle stat" }];
  await saveData();
  renderStatsSection();
}
async function deleteStat(id) {
  appData.stats = (appData.stats||[]).filter(s => s.id !== id);
  await saveData();
  renderStatsSection();
  toast("Statistique supprimée");
}

// ============================================================
// PASSWORD CHANGE
// ============================================================
async function changePwd() {
  const p1 = document.getElementById("new-pwd")?.value;
  const p2 = document.getElementById("new-pwd2")?.value;
  if (!p1) { toast("Mot de passe vide", "error"); return; }
  if (p1.length < 8) { toast("Minimum 8 caractères", "error"); return; }
  if (p1 !== p2) { toast("Les mots de passe ne correspondent pas", "error"); return; }
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p1));
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem("scc_admin_pwd", hash);
    const _p1el = document.getElementById("new-pwd");
    const _p2el = document.getElementById("new-pwd2");
    if (_p1el) _p1el.value = "";
    if (_p2el) _p2el.value = "";
    toast("Mot de passe mis à jour ✅", "success");
  } catch(e) {
    toast("Erreur lors du changement de mot de passe", "error");
  }
}

// ============================================================
// EXTENSIONS
// ============================================================
function renderExtensions() {
  const exts = appData.extensions || {};
  const grid = document.getElementById("extensionsGrid");
  if (!grid) return;
  grid.innerHTML = EXTENSION_DEFS.map(e => `
    <div class="extension-card">
      <div class="extension-icon">${e.icon}</div>
      <div class="extension-info">
        <h4>${e.name}</h4>
        <p>${e.desc}</p>
      </div>
      <label class="toggle" style="flex-shrink:0">
        <input type="checkbox" id="ext-${e.key}" ${exts[e.key]?"checked":""}
          onchange="toggleExtension('${e.key}',this.checked)">
        <span class="toggle-slider"></span>
      </label>
    </div>`).join("");
}

async function toggleExtension(key, value) {
  if (!appData.extensions) appData.extensions = {};
  appData.extensions[key] = value;
  await saveData();
  toast(`Extension "${key}" ${value ? "activée" : "désactivée"}`);
}

// ============================================================
// FAQ
// ============================================================
function renderFaqTable() {
  const tbody = document.getElementById("faqTable");
  if (!tbody) return;
  const faqs = (appData.faq || []).sort((a,b) => (a.order||99)-(b.order||99));
  tbody.innerHTML = faqs.length ? faqs.map(f => `
    <tr>
      <td style="width:60px;text-align:center;color:var(--text-m);font-size:0.82rem">${f.order||"—"}</td>
      <td>
        <div class="td-title">${escHtml(f.question)}</div>
        <div class="td-sub" style="white-space:normal">${escHtml((f.answer||"").slice(0,80))}…</div>
      </td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editFaq('${f.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteFaq('${f.id}')" title="Supprimer">🗑</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="3" style="text-align:center;padding:32px;color:var(--text-m)">Aucune question — cliquez "+ Ajouter"</td></tr>`;
}

function editFaq(id) {
  const f = id ? (appData.faq||[]).find(x => x.id === id) : {};
  openModal(id ? "Modifier la question" : "Nouvelle question", `
    <div class="form-grid cols-1">
      <div class="form-group"><label>Question <span class="req">*</span></label><input id="fq-q" type="text" value="${escHtml(f?.question||"")}" placeholder="Comment se déroule…"></div>
      <div class="form-group"><label>Réponse <span class="req">*</span></label><textarea id="fq-a" rows="4" placeholder="La réponse détaillée…">${escHtml(f?.answer||"")}</textarea></div>
      <div class="form-group"><label>Ordre d'affichage</label><input id="fq-order" type="number" value="${f?.order||1}" min="1"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="saveFaq('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function saveFaq(id) {
  const q = document.getElementById("fq-q")?.value.trim();
  if (!q) { toast("La question est requise", "error"); return; }
  const item = { id: id||uid("faq"), question: q, answer: document.getElementById("fq-a")?.value.trim()||"", order: parseInt(document.getElementById("fq-order")?.value)||1 };
  if (!appData.faq) appData.faq = [];
  const i = appData.faq.findIndex(x => x.id === id);
  if (i >= 0) appData.faq[i] = item; else appData.faq.push(item);
  closeModal(); await saveData(); renderFaqTable();
}

async function deleteFaq(id) {
  if (!confirm("Supprimer cette question ?")) return;
  appData.faq = (appData.faq||[]).filter(x => x.id !== id);
  await saveData(); renderFaqTable(); toast("Question supprimée");
}

// ============================================================
// TEAM
// ============================================================
function renderTeamTable() {
  const tbody = document.getElementById("teamTable");
  if (!tbody) return;
  const members = (appData.team || []).sort((a,b) => (a.order||99)-(b.order||99));
  tbody.innerHTML = members.length ? members.map(m => `
    <tr>
      <td style="width:52px">${m.photo ? `<img src="${escHtml(m.photo)}" style="width:44px;height:44px;border-radius:50%;object-fit:cover">` : `<div style="width:44px;height:44px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem">${escHtml((m.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase())}</div>`}</td>
      <td><div class="td-title">${escHtml(m.name)}</div></td>
      <td><span class="badge badge-info">${escHtml(m.role||"—")}</span></td>
      <td style="width:60px;text-align:center;color:var(--text-m);font-size:0.82rem">${m.order||"—"}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editTeam('${m.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteTeam('${m.id}')" title="Supprimer">🗑</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-m)">Aucun membre — cliquez "+ Ajouter"</td></tr>`;
}

function editTeam(id) {
  const m = id ? (appData.team||[]).find(x => x.id === id) : {};
  openModal(id ? "Modifier le membre" : "Nouveau membre", `
    <div class="form-grid">
      <div class="form-group span-2"><label>Nom <span class="req">*</span></label><input id="tm-name" type="text" value="${escHtml(m?.name||"")}" placeholder="Jean Dupont"></div>
      <div class="form-group span-2"><label>Rôle / Titre</label><input id="tm-role" type="text" value="${escHtml(m?.role||"")}" placeholder="Architecte DPLG"></div>
      <div class="form-group span-2"><label>Biographie courte</label><textarea id="tm-bio" rows="3" placeholder="Quelques mots sur l'expertise…">${escHtml(m?.bio||"")}</textarea></div>
      <div class="form-group span-2">
        <label>Photo</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input id="tm-photo" type="url" value="${escHtml(m?.photo||"")}" placeholder="https://… ou cliquez Upload" style="flex:1" oninput="(function(v){var p=document.getElementById('tm-photo-preview');if(p){p.src=v;p.style.display=v?'block':'none'}})(this.value)">
          <button type="button" class="btn btn-ghost btn-sm" onclick="pickImage('tm-photo',400,0.85)" style="white-space:nowrap">📁 Upload</button>
        </div>
        <img id="tm-photo-preview" src="${escHtml(m?.photo||"")}" style="${m?.photo?"":"display:none;"}margin-top:8px;width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid var(--border)">
      </div>
      <div class="form-group"><label>Ordre d'affichage</label><input id="tm-order" type="number" value="${m?.order||1}" min="1"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="saveTeam('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function saveTeam(id) {
  const name = document.getElementById("tm-name")?.value.trim();
  if (!name) { toast("Le nom est requis", "error"); return; }
  const item = { id: id||uid("tm"), name, role: document.getElementById("tm-role")?.value.trim()||"", bio: document.getElementById("tm-bio")?.value.trim()||"", photo: document.getElementById("tm-photo")?.value.trim()||"", order: parseInt(document.getElementById("tm-order")?.value)||1 };
  if (!appData.team) appData.team = [];
  const i = appData.team.findIndex(x => x.id === id);
  if (i >= 0) appData.team[i] = item; else appData.team.push(item);
  closeModal(); await saveData(); renderTeamTable();
}

async function deleteTeam(id) {
  if (!confirm("Supprimer ce membre ?")) return;
  appData.team = (appData.team||[]).filter(x => x.id !== id);
  await saveData(); renderTeamTable(); toast("Membre supprimé");
}

// ============================================================
// PARTNERS
// ============================================================
function renderPartnersTable() {
  const tbody = document.getElementById("partnersTable");
  if (!tbody) return;
  const partners = appData.partners || [];
  tbody.innerHTML = partners.length ? partners.map(p => `
    <tr>
      <td style="width:80px">${p.logo ? `<img src="${escHtml(p.logo)}" style="max-height:40px;max-width:72px;object-fit:contain;border-radius:4px">` : `<span style="color:var(--text-m);font-size:0.78rem">Aucun logo</span>`}</td>
      <td><div class="td-title">${escHtml(p.name||"—")}</div></td>
      <td><a href="${escHtml(p.url||"#")}" target="_blank" rel="noopener" style="color:var(--primary);font-size:0.82rem;word-break:break-all">${escHtml(p.url||"—")}</a></td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editPartner('${p.id}')" title="Modifier">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deletePartner('${p.id}')" title="Supprimer">🗑</button>
      </td>
    </tr>`).join("") : `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-m)">Aucun partenaire — cliquez "+ Ajouter"</td></tr>`;
}

function editPartner(id) {
  const p = id ? (appData.partners||[]).find(x => x.id === id) : {};
  openModal(id ? "Modifier le partenaire" : "Nouveau partenaire", `
    <div class="form-grid cols-1">
      <div class="form-group"><label>Nom <span class="req">*</span></label><input id="pt-name" type="text" value="${escHtml(p?.name||"")}" placeholder="RGE Qualibat"></div>
      <div class="form-group">
        <label>Logo</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input id="pt-logo" type="url" value="${escHtml(p?.logo||"")}" placeholder="https://… ou cliquez Upload" style="flex:1" oninput="(function(v){var prev=document.getElementById('pt-logo-preview');if(prev){prev.src=v;prev.style.display=v?'block':'none'}})(this.value)">
          <button type="button" class="btn btn-ghost btn-sm" onclick="pickImage('pt-logo',300,0.88)" style="white-space:nowrap">📁 Upload</button>
        </div>
        <img id="pt-logo-preview" src="${escHtml(p?.logo||"")}" style="${p?.logo?"":"display:none;"}margin-top:8px;max-height:48px;max-width:120px;object-fit:contain;border-radius:4px;border:1px solid var(--border)">
      </div>
      <div class="form-group"><label>URL (lien cliquable)</label><input id="pt-url" type="url" value="${escHtml(p?.url||"")}" placeholder="https://www.qualibat.com"></div>
    </div>`,
    `<button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
     <button class="btn btn-primary" onclick="savePartner('${id||""}')">💾 Sauvegarder</button>`
  );
}

async function savePartner(id) {
  const name = document.getElementById("pt-name")?.value.trim();
  if (!name) { toast("Le nom est requis", "error"); return; }
  const item = { id: id||uid("pt"), name, logo: document.getElementById("pt-logo")?.value.trim()||"", url: document.getElementById("pt-url")?.value.trim()||"" };
  if (!appData.partners) appData.partners = [];
  const i = appData.partners.findIndex(x => x.id === id);
  if (i >= 0) appData.partners[i] = item; else appData.partners.push(item);
  closeModal(); await saveData(); renderPartnersTable();
}

async function deletePartner(id) {
  if (!confirm("Supprimer ce partenaire ?")) return;
  appData.partners = (appData.partners||[]).filter(x => x.id !== id);
  await saveData(); renderPartnersTable(); toast("Partenaire supprimé");
}

// ============================================================
// EXPORT — expose to HTML onclick handlers
// ============================================================
window.editService    = editService;
window.deleteService  = deleteService;
window.saveService    = saveService;
window.selectIcon     = selectIcon;
window.selectCatIcon  = selectCatIcon;
window.pickImage      = pickImage;
window.editFaq        = editFaq;
window.deleteFaq      = deleteFaq;
window.saveFaq        = saveFaq;
window.editTeam       = editTeam;
window.deleteTeam     = deleteTeam;
window.saveTeam       = saveTeam;
window.editPartner    = editPartner;
window.deletePartner  = deletePartner;
window.savePartner    = savePartner;
window.editArticle    = editArticle;
window.deleteArticle  = deleteArticle;
window.saveArticle    = saveArticle;
window.editCategory   = editCategory;
window.deleteCategory = deleteCategory;
window.saveCategory   = saveCategory;
window.editTestimonial   = editTestimonial;
window.deleteTestimonial = deleteTestimonial;
window.saveTestimonial   = saveTestimonial;
window.deleteGalleryImg  = deleteGalleryImg;
window.copyUrl           = copyUrl;
window.updateStat        = updateStat;
window.deleteStat        = deleteStat;
window.toggleExtension   = toggleExtension;
window.markMsgRead       = markMsgRead;
window.deleteMsg         = deleteMsg;
window.goTo              = goTo;
window.changePwd         = changePwd;
window.closeModal        = closeModal;
