const SUPABASE_URL = 'https://uagwapbwmgvlpbgwyuvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZ3dhcGJ3bWd2bHBiZ3d5dXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTc4MTUsImV4cCI6MjA4ODY3MzgxNX0.Fj8m1g_m02jhBSFAWYW-vdods53lN_acZ_0wOoG7TGo';

// Email del administrador
const ADMIN_EMAIL = 'macarenavila@admin.com';

// ============================================
// INICIALIZACIÓN
// ============================================
let supabaseClient = null;
let currentUser = null;
let isAdmin = false;

let siteConfig = {
    name: 'Letras & Reflexiones',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM4NTkzN2UiLz48cGF0aCBkPSJNNjUgMzBMMzUgNTBMODEwMEw2NSAxMDBMNzAgNzBMMTAwIDUwTDcwIDMwTDY1IDMwWiIgZmlsbD0iI2ZlZmRmZCIvPjwvc3ZnPg==',
    heroImage: '',
    heroTitle: 'Un espacio para la curiosidad',
    heroSubtitle: 'Exploramos el mundo a través de las palabras.',
    footerText: 'Un espacio para la curiosidad, la reflexión y la belleza de las palabras.',
    categories: 'Reflexiones, Poesía, Ensayos'
};

let publications = [];
let newsletterSubscribers = []; // Lista de suscriptores cargada de Supabase

// ============================================
// ICONOS SVG
// ============================================
const icons = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
    login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
};

// ============================================
// UTILIDADES
// ============================================
function $(selector) { return document.querySelector(selector); }
function showToast(message, type = 'info') {
    const container = $('#toast-container');
    if (!container) return alert(message);
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}
function showLoading(show = true) {
    const overlay = $('#loading-overlay');
    if (overlay) { if (show) overlay.classList.remove('hidden'); else overlay.classList.add('hidden'); }
}
function formatDate(date) { return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }
function getCategories() { return (siteConfig.categories || '').split(',').map(c => c.trim()).filter(c => c.length > 0); }
function icon(name, size = 'icon-sm') { return `<span class="icon ${size}">${icons[name] || ''}</span>`; }

// ============================================
// SUPABASE CORE
// ============================================
async function initSupabase() {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            isAdmin = currentUser.email === ADMIN_EMAIL;
        }
        supabaseClient.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            isAdmin = currentUser?.email === ADMIN_EMAIL;
            renderApp();
        });
        return true;
    } catch (error) {
        console.error('❌ Error Supabase:', error);
        return false;
    }
}

// ============================================
// AUTENTICACIÓN
// ============================================
async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        currentUser = data.user;
        isAdmin = currentUser.email === ADMIN_EMAIL;
        showToast('¡Bienvenida!', 'success');
        closeModal();
        renderApp();
    } catch (error) { showToast('Error: ' + error.message, 'error'); }
}

async function signOut() {
    await supabaseClient.auth.signOut();
    currentUser = null; isAdmin = false;
    showToast('Sesión cerrada', 'info');
    navigateHome();
}

// ============================================
// PUBLICACIONES Y CONFIG
// ============================================
async function loadPublications() {
    try {
        const { data, error } = await supabaseClient.from('publications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        publications = data.map(pub => ({ ...pub, readTime: pub.read_time }));
    } catch (error) { console.error('Error cargando posts:', error); }
}

async function savePublication(pub) {
    const publicationToSave = {
        id: pub.id || generateId(),
        title: pub.title,
        excerpt: pub.excerpt,
        content: pub.content,
        category: pub.category,
        author: pub.author,
        image: pub.image,
        date: pub.date || formatDate(new Date()),
        read_time: pub.readTime,
        updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from('publications').upsert(publicationToSave);
    if (error) throw error;
    await loadPublications();
}

async function deletePublication(id) {
    if (!confirm('¿Seguro quieres borrar este post?')) return;
    const { error } = await supabaseClient.from('publications').delete().eq('id', id);
    if (error) showToast('Error al borrar', 'error');
    else { await loadPublications(); renderApp(); }
}

async function loadSiteConfig() {
    try {
        const { data, error } = await supabaseClient.from('site_config').select('*').single();
        if (data) {
            siteConfig = {
                name: data.name,
                logo: data.logo,
                heroImage: data.hero_image,
                heroTitle: data.hero_title,
                heroSubtitle: data.hero_subtitle,
                footerText: data.footer_text,
                categories: data.categories
            };
        }
    } catch (e) { console.log("Config inicial cargada"); }
}

async function saveSiteConfig(config) {
    const dataToSave = {
        id: 1,
        name: config.name,
        hero_title: config.heroTitle,
        hero_subtitle: config.heroSubtitle,
        footer_text: config.footerText,
        categories: config.categories
    };
    const { error } = await supabaseClient.from('site_config').upsert(dataToSave);
    if (error) throw error;
    siteConfig = { ...siteConfig, ...config };
}

// ============================================
// NEWSLETTER (LOGICA NUEVA)
// ============================================
async function subscribeNewsletter(email) {
    try {
        const { error } = await supabaseClient.from('newsletter').insert({ email });
        if (error) {
            if (error.code === '23505') { showToast('Ya estás suscrito ✨', 'info'); return; }
            throw error;
        }
        showToast('¡Gracias por suscribirte! 💌', 'success');
    } catch (error) { showToast('Error en suscripción', 'error'); }
}

async function loadSubscribers() {
    if (!isAdmin) return;
    try {
        const { data, error } = await supabaseClient
            .from('newsletter')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        newsletterSubscribers = data;
        renderApp();
    } catch (error) { console.error("Error suscriptores:", error); }
}

async function deleteSubscriber(id) {
    if (!confirm('¿Eliminar suscriptor?')) return;
    const { error } = await supabaseClient.from('newsletter').delete().eq('id', id);
    if (!error) loadSubscribers();
}

// ============================================
// UI - MODALES
// ============================================
let currentModal = null;
function openModal(content) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `<div class="modal">${content}</div>`;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
    document.body.appendChild(overlay);
    currentModal = overlay;
}
function closeModal() { if (currentModal) { currentModal.remove(); currentModal = null; } }

function showLoginModal() {
    openModal(`
        <div class="modal-header"><h2>Panel de Control</h2></div>
        <form id="login-form" class="modal-body">
            <div class="form-group"><label>Email</label><input type="email" class="form-input" name="email" required></div>
            <div class="form-group"><label>Contraseña</label><input type="password" class="form-input" name="password" required></div>
            <button type="submit" class="btn btn-primary" style="width: 100%">Entrar</button>
        </form>
    `);
    $('#login-form').onsubmit = (e) => { e.preventDefault(); signIn(e.target.email.value, e.target.password.value); };
}

function showNewsletterModal() {
    openModal(`
        <div class="modal-header"><h2>Newsletter</h2><p>Si te dan ganas de leer más, deja tu mail acá ✨</p></div>
        <form id="newsletter-form" class="modal-body">
            <div class="form-group"><input type="email" class="form-input" name="email" placeholder="tu@email.com" required></div>
            <button type="submit" class="btn btn-primary" style="width: 100%">Suscribirme</button>
        </form>
    `);
    $('#newsletter-form').onsubmit = (e) => { e.preventDefault(); subscribeNewsletter(e.target.email.value); closeModal(); };
}

// ============================================
// VISTAS Y NAVEGACIÓN
// ============================================
let currentView = 'home';
let selectedPublication = null;
let selectedCategory = 'Todos';
let searchQuery = '';
let adminTab = 'publications';

function renderHeader() {
    return `
        <header class="header">
            <div class="header-inner">
                <button class="logo" onclick="navigateHome()">
                    <img src="${siteConfig.logo}" class="logo-img">
                    <span class="logo-text">${siteConfig.name}</span>
                </button>
                <div class="header-actions">
                    <button class="btn btn-outline" onclick="showNewsletterModal()">${icon('mail')} Newsletter</button>
                    ${currentUser ? `
                        <button class="btn btn-secondary" onclick="navigateAdmin()">${icon('settings')} Admin</button>
                        <button class="btn btn-ghost" onclick="signOut()">${icon('logout')}</button>
                    ` : `<button class="btn btn-ghost" onclick="showLoginModal()">${icon('user')}</button>`}
                </div>
            </div>
        </header>`;
}

function renderHero() {
    return `
        <section class="hero">
            <div class="hero-content">
                <h1>${siteConfig.heroTitle}</h1>
                <p>${siteConfig.heroSubtitle}</p>
                <div class="hero-buttons">
                    <button class="btn btn-lg btn-primary" onclick="showNewsletterModal()">Suscribirse</button>
                </div>
            </div>
        </section>`;
}

function renderAdminPanel() {
    let tabContent = '';

    if (adminTab === 'publications') {
        tabContent = `
            <button class="btn btn-primary mb-4" onclick="showPublicationModal()">Nuevo Post</button>
            <table class="admin-table">
                ${publications.map(p => `
                    <tr>
                        <td>${escapeHtml(p.title)}</td>
                        <td style="text-align:right">
                            <button class="btn btn-sm" onclick="showPublicationModal(publications.find(x => x.id === '${p.id}'))">${icon('edit')}</button>
                            <button class="btn btn-sm" onclick="deletePublication('${p.id}')">${icon('trash')}</button>
                        </td>
                    </tr>
                `).join('')}
            </table>`;
    } else if (adminTab === 'site') {
        tabContent = `
            <form id="config-form" class="modal-body">
                <div class="form-group"><label>Nombre del Sitio</label><input name="name" class="form-input" value="${siteConfig.name}"></div>
                <div class="form-group"><label>Título Hero</label><input name="heroTitle" class="form-input" value="${siteConfig.heroTitle}"></div>
                <div class="form-group"><label>Subtítulo Hero</label><textarea name="heroSubtitle" class="form-input">${siteConfig.heroSubtitle}</textarea></div>
                <div class="form-group"><label>Categorías</label><input name="categories" class="form-input" value="${siteConfig.categories}"></div>
                <button type="submit" class="btn btn-primary">Guardar Configuración</button>
            </form>`;
        setTimeout(() => {
            $('#config-form').onsubmit = async (e) => {
                e.preventDefault();
                await saveSiteConfig({
                    name: e.target.name.value,
                    heroTitle: e.target.heroTitle.value,
                    heroSubtitle: e.target.heroSubtitle.value,
                    categories: e.target.categories.value
                });
                showToast('Guardado', 'success');
                renderApp();
            };
        }, 0);
    } else if (adminTab === 'subscribers') {
        tabContent = `
            <div class="stats-card mb-4">
                <h3>Total de Suscriptores: ${newsletterSubscribers.length}</h3>
            </div>
            <table class="admin-table">
                <thead><tr><th>Email</th><th>Fecha</th><th></th></tr></thead>
                <tbody>
                    ${newsletterSubscribers.map(s => `
                        <tr>
                            <td>${escapeHtml(s.email)}</td>
                            <td>${formatDate(s.created_at)}</td>
                            <td><button class="btn btn-sm" onclick="deleteSubscriber(${s.id})">${icon('trash')}</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    }

    return `
        <div class="admin-panel">
            <div class="admin-header"><div class="admin-header-inner"><h1>Panel de Administración</h1><button class="btn btn-secondary" onclick="navigateHome()">Volver</button></div></div>
            <nav class="admin-nav" style="display:flex; gap:10px; padding: 20px 0;">
                <button class="btn ${adminTab === 'publications' ? 'btn-primary' : 'btn-outline'}" onclick="setAdminTab('publications')">Publicaciones</button>
                <button class="btn ${adminTab === 'subscribers' ? 'btn-primary' : 'btn-outline'}" onclick="setAdminTab('subscribers')">Suscriptores</button>
                <button class="btn ${adminTab === 'site' ? 'btn-primary' : 'btn-outline'}" onclick="setAdminTab('site')">Configuración</button>
            </nav>
            <div class="admin-content">${tabContent}</div>
        </div>`;
}

// Lógica de renderizado principal igual a la tuya...
function renderApp() {
    const app = $('#app');
    if (currentView === 'admin' && isAdmin) { app.innerHTML = renderAdminPanel(); }
    else if (currentView === 'publication' && selectedPublication) { app.innerHTML = `${renderHeader()}<div class="publication-detail">...</div>`; }
    else { 
        const filtered = publications.filter(p => selectedCategory === 'Todos' || p.category === selectedCategory);
        app.innerHTML = `
            ${renderHeader()}
            <main>
                ${renderHero()}
                <section class="publications-section">
                    <div class="category-filters">
                        ${['Todos', ...getCategories()].map(c => `<button class="category-btn ${selectedCategory === c ? 'active' : ''}" onclick="filterCategory('${c}')">${c}</button>`).join('')}
                    </div>
                    <div class="publications-grid">
                        ${filtered.map(pub => `<article class="publication-card" onclick="viewPublication('${pub.id}')"><h3>${pub.title}</h3><p>${pub.excerpt}</p></article>`).join('')}
                    </div>
                </section>
            </main>`;
    }
}

// Navegación
window.navigateHome = () => { currentView = 'home'; renderApp(); };
window.navigateAdmin = () => { currentView = 'admin'; renderApp(); };
window.setAdminTab = (tab) => { 
    adminTab = tab; 
    if (tab === 'subscribers') loadSubscribers();
    else renderApp(); 
};
window.filterCategory = (cat) => { selectedCategory = cat; renderApp(); };

async function init() {
    showLoading(true);
    await initSupabase();
    await loadSiteConfig();
    await loadPublications();
    showLoading(false);
    renderApp();
}

document.addEventListener('DOMContentLoaded', init);
