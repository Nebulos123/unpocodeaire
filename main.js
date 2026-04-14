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
    logo:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM4NTkzN2UiLz48cGF0aCBkPSJNNjUgMzBMMzUgNTBMODEwMEw2NSAxMDBMNzAgNzBMMTAwIDUwTDcwIDMwTDY1IDMwWiIgZmlsbD0iI2ZlZmRmZCIvPjwvc3ZnPg==',
    heroImage: '',
    heroTitle: 'Un espacio para la curiosidad',
    heroSubtitle: 'Exploramos el mundo a través de las palabras.',
    footerText: 'Un espacio para la curiosidad, la reflexión y la belleza de las palabras.',
    categories: 'Reflexiones, Poesía, Ensayos'
};

let publications = [];
let newsletterEmails = [];
let newsletterSubscribers = [];

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
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
};

function getCategories() {
    return (siteConfig.categories || '')
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);
}

function icon(name, size = 'icon-sm') {
    return `<span class="icon ${size}">${icons[name] || ''}</span>`;
}

// ============================================
// UTILIDADES
// ============================================
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }

function showToast(message, type = 'info') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 4000);
}

function showLoading(show = true) {
    const overlay = $('#loading-overlay');
    if (show) { overlay.classList.remove('hidden'); } else { overlay.classList.add('hidden'); }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
function getInitials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2); }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

// ============================================
// ALMACENAMIENTO LOCAL (FALLBACK)
// ============================================
const storage = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(key); }
};

// ============================================
// INICIALIZACIÓN DE SUPABASE
// ============================================
async function initSupabase() {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("🚀 Conectando a Supabase...");
        
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
        loadLocalData();
        return false;
    }
}

function loadLocalData() {
    const savedConfig = storage.get('siteConfig');
    if (savedConfig) siteConfig = { ...siteConfig, ...savedConfig };
    const savedPubs = storage.get('publications');
    if (savedPubs) publications = savedPubs;
}

function saveLocalData() {
    storage.set('siteConfig', siteConfig);
    storage.set('publications', publications);
}

// ============================================
// AUTENTICACIÓN
// ============================================
async function signUp(email, password, name) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
        showToast('¡Revisa tu email!', 'success');
        return { success: true, data };
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
        return { success: false, error };
    }
}

async function signIn(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        currentUser = data.user;
        isAdmin = currentUser.email === ADMIN_EMAIL;
        showToast('¡Bienvenida!', 'success');
        closeModal();
        renderApp();
        return { success: true, data };
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
        return { success: false, error };
    }
}

async function signOut() {
    await supabaseClient.auth.signOut();
    currentUser = null; isAdmin = false;
    showToast('Sesión cerrada', 'info');
    renderApp();
}

// ============================================
// GESTIÓN DE PUBLICACIONES
// ============================================
async function loadPublications() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('publications')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            publications = data.map(pub => ({
                ...pub,
                readTime: pub.read_time
            }));
        }
    } catch (error) { console.error('Error cargando posts:', error); }
}

async function savePublication(pub) {
    const pubId = pub.id || generateId();
    const publicationToSave = {
        id: pubId,
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
    
    try {
        const { data, error } = await supabaseClient.from('publications').upsert(publicationToSave).select().single();
        if (error) throw error;
        await loadPublications();
        return data;
    } catch (error) {
        showToast('Error guardando: ' + error.message, 'error');
        throw error;
    }
}

async function deletePublication(id) {
    const { error } = await supabaseClient.from('publications').delete().eq('id', id);
    if (error) throw error;
    await loadPublications();
    renderApp();
    return true;
}

// ============================================
// CONFIGURACIÓN DEL SITIO
// ============================================
async function loadSiteConfig() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from('site_config').select('*').single();
        if (error) throw error;
        if (data) {
            siteConfig = {
                name: data.name,
                logo: data.logo,
                heroImage: data.hero_image,
                heroTitle: data.hero_title,
                heroSubtitle: data.hero_subtitle,
                footerText: data.footer_text,
                categories: data.categories || 'Reflexiones, Poesía, Ensayos'
            };
        }
    } catch (error) {
        console.error("Error config:", error);
    }
}

async function saveSiteConfig(config) {
    siteConfig = { ...siteConfig, ...config };
    try {
        const dataToSave = {
            id: 1,
            name: siteConfig.name,
            logo: siteConfig.logo,
            hero_image: siteConfig.heroImage,
            hero_title: siteConfig.heroTitle,
            hero_subtitle: siteConfig.heroSubtitle,
            footer_text: siteConfig.footerText,
            categories: siteConfig.categories
        };
        const { data, error } = await supabaseClient.from('site_config').upsert(dataToSave).select().single();
        if (error) throw error;
        return data;
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
        throw error;
    }
}

// ============================================
// NEWSLETTER
// ============================================
async function subscribeNewsletter(email) {
    try {
        const { error } = await supabaseClient.from('newsletter').insert({ email });
        if (error) {
            if (error.code === '23505') { showToast('Ya estás suscrito ✨', 'info'); return true; }
            throw error;
        }
        showToast('¡Gracias por suscribirte! 💌', 'success');
        return true;
    } catch (error) { showToast('Error en suscripción', 'error'); }
}

async function loadSubscribers() {
    if (!supabaseClient || !isAdmin) return;
    try {
        const { data, error } = await supabaseClient.from('newsletter').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        newsletterSubscribers = data || [];
    } catch (error) {
        console.error('Error cargando suscriptores:', error);
        showToast('No se pudieron cargar suscriptores', 'error');
    }
}

async function deleteSubscriber(id) {
    if (!confirm('¿Eliminar este suscriptor?')) return;
    try {
        const { error } = await supabaseClient.from('newsletter').delete().eq('id', id);
        if (error) throw error;
        showToast('Suscriptor eliminado', 'success');
        await loadSubscribers();
        renderApp();
    } catch (error) {
        showToast('Error al eliminar', 'error');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ============================================
// MODALES
// ============================================
let currentModal = null;
function openModal(content) {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `<div class="modal">${content}</div>`;
    
    let clickStartedOnOverlay = false;
    overlay.addEventListener('mousedown', (e) => {
        clickStartedOnOverlay = (e.target === overlay);
    });
    overlay.addEventListener('mouseup', (e) => {
        if (e.target === overlay && clickStartedOnOverlay) {
            closeModal();
        }
        clickStartedOnOverlay = false;
    });
    
    document.body.appendChild(overlay);
    currentModal = overlay;
}
function closeModal() { if (currentModal) { currentModal.remove(); currentModal = null; } }

function showLoginModal() {
    openModal(`
        <div class="modal-header"><h2>Iniciar sesión</h2></div>
        <form id="login-form" class="modal-body">
            <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-input" name="email" required></div>
            <div class="form-group"><label class="form-label">Contraseña</label><input type="password" class="form-input" name="password" required></div>
            <button type="submit" class="btn btn-primary" style="width: 100%">${icon('login')} Entrar</button>
        </form>
    `);
    $('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await signIn(e.target.email.value, e.target.password.value);
    });
}

function showNewsletterModal() {
    openModal(`
        <div class="modal-header"><h2>Newsletter</h2><p>Si te dan ganas de leer más, deja tu mail acá ✨✨✨</p></div>
        <form id="newsletter-form" class="modal-body">
            <div class="form-group"><input type="email" class="form-input" name="email" placeholder="tu@email.com" required></div>
            <button type="submit" class="btn btn-primary" style="width: 100%">${icon('mail')} Suscribirme</button>
        </form>
    `);
    $('#newsletter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await subscribeNewsletter(e.target.email.value);
        closeModal();
    });
}

function showPublicationModal(pub = null) {
    const isEdit = !!pub;
    const categoryList = getCategories();
    const defaultCategory = categoryList[0] || 'General';
    const data = pub || { title: '', excerpt: '', content: '', category: defaultCategory, author: '', image: '', readTime: '5 min' };

    openModal(`
        <div class="modal-header"><h2>${isEdit ? 'Editar' : 'Nueva'} Publicación</h2></div>
        <form id="publication-form" class="modal-body">
            <div class="form-group"><label class="form-label">Título</label><input type="text" class="form-input" name="title" value="${escapeHtml(data.title)}" required></div>
            <div class="form-group"><label class="form-label">Categoría</label><select class="form-input" name="category">${categoryList.map(cat => `<option value="${escapeHtml(cat)}" ${data.category === cat ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('')}</select></div>
            <div class="form-group"><label class="form-label">Autor</label><input type="text" class="form-input" name="author" value="${escapeHtml(data.author)}" required></div>
            <div class="form-group"><label class="form-label">Tiempo</label><input type="text" class="form-input" name="readTime" value="${escapeHtml(data.readTime)}"></div>
            <div class="form-group"><label class="form-label">Extracto</label><textarea class="form-input" name="excerpt">${escapeHtml(data.excerpt)}</textarea></div>
            <div class="form-group"><label class="form-label">Contenido</label><textarea class="form-input" name="content" rows="6">${escapeHtml(data.content)}</textarea></div>
            <div class="form-group"><label class="form-label">Imagen</label><input type="file" id="pub-image-input" accept="image/*"><input type="hidden" name="existingImage" value="${data.image}"></div>
            <button type="submit" class="btn btn-primary" style="width: 100%">${icon('save')} Guardar</button>
        </form>
    `);

    $('#publication-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        let imageData = form.existingImage.value;
        const file = $('#pub-image-input').files[0];
        if (file) imageData = await fileToBase64(file);
        await savePublication({ id: pub?.id, title: form.title.value, excerpt: form.excerpt.value, content: form.content.value, category: form.category.value, author: form.author.value, readTime: form.readTime.value, image: imageData });
        showToast('Guardado', 'success');
        closeModal();
        renderApp();
    });
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
                <div class="header-actions desktop">
                    <div class="search-wrapper">
                        <span class="search-icon">${icon('search')}</span>
                        <input type="text" class="form-input search-input" placeholder="Buscar..." value="${escapeHtml(searchQuery)}" onkeyup="handleSearch(event)">
                    </div>
                    <button class="btn btn-outline" onclick="showNewsletterModal()">${icon('mail')} Newsletter</button>
                    ${currentUser ? `
                        <div class="user-menu">
                            <span class="text-sm">${currentUser.email.split('@')[0]}</span>
                            ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="navigateAdmin()">${icon('settings')} Admin</button>` : ''}
                            <button class="btn btn-ghost btn-sm" onclick="signOut()">${icon('logout')} Salir</button>
                        </div>
                    ` : `<button class="btn btn-primary" onclick="showLoginModal()">${icon('login')} Entrar</button>`}
                </div>
            </div>
        </header>`;
}

function renderHero() {
    return `
        <section class="hero">
            <div class="hero-bg">${siteConfig.heroImage ? `<img src="${siteConfig.heroImage}">` : ''}<div class="hero-overlay"></div></div>
            <div class="hero-content">
                <div class="hero-logo"><img src="${siteConfig.logo}"></div>
                <h1>${siteConfig.heroTitle}</h1>
                <p>${siteConfig.heroSubtitle}</p>
                <div class="hero-buttons">
                    <button class="btn btn-lg btn-primary" onclick="showNewsletterModal()">Suscribirse</button>
                    <button class="btn btn-lg btn-outline" style="color:white; border-color:white;" onclick="document.getElementById('publications').scrollIntoView({behavior:'smooth'})">Explorar</button>
                </div>
            </div>
            <div class="hero-wave"><svg viewBox="0 0 1440 120" fill="none"><path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H0Z" fill="#fefdfd"/></svg></div>
        </section>`;
}

function renderPublications() {
    const filtered = publications.filter(pub => {
        const matchesCategory = selectedCategory === 'Todos' || pub.category === selectedCategory;
        const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    const cats = ['Todos', ...getCategories()];
    return `
        <section class="publications-section" id="publications">
            <div class="category-filters">
                ${cats.map(c => `<button class="category-btn ${selectedCategory === c ? 'active' : ''}" onclick="filterCategory('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join('')}
            </div>
            <div class="publications-grid">
                ${filtered.map(pub => `
                    <article class="publication-card" onclick="viewPublication('${pub.id}')">
                        <div class="publication-image">
                            <img src="${pub.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'}">
                            <span class="publication-category">${escapeHtml(pub.category)}</span>
                        </div>
                        <div class="publication-content">
                            <h3 class="publication-title">${escapeHtml(pub.title)}</h3>
                            <p class="publication-excerpt">${escapeHtml(pub.excerpt)}</p>
                            <div class="publication-meta" style="margin-top: 1rem; display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--color-sage);">
                                <span>${escapeHtml(pub.author)}</span>
                                <span>${escapeHtml(pub.date)}</span>
                            </div>
                        </div>
                    </article>
                `).join('')}
            </div>
        </section>
    `;
}

function renderPublicationDetail(pub) {
    return `
        <div class="publication-detail">
            <div class="publication-detail-header">
                <img src="${pub.image || ''}">
                <div class="publication-detail-overlay"></div>
                <div class="publication-detail-info">
                    <button class="btn btn-ghost" style="color:white" onclick="navigateHome()">${icon('arrowLeft')} Volver</button>
                    <h1>${pub.title}</h1>
                    <p>${pub.author} • ${pub.date}</p>
                </div>
            </div>
            <div class="publication-detail-content">
                ${pub.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
            </div>
        </div>`;
}

function renderAdminPanel() {
    return `
        <div class="admin-panel">
            <div class="admin-header">
                <div class="admin-header-inner">
                    <h1>Panel Admin</h1>
                    <button class="btn btn-secondary" onclick="navigateHome()">Sitio</button>
                </div>
            </div>
            <nav class="admin-nav">
                <button class="admin-nav-btn ${adminTab === 'publications' ? 'active' : ''}" onclick="setAdminTab('publications')">Posts</button>
                <button class="admin-nav-btn ${adminTab === 'subscribers' ? 'active' : ''}" onclick="setAdminTab('subscribers')">Suscriptores</button>
                <button class="admin-nav-btn ${adminTab === 'site' ? 'active' : ''}" onclick="setAdminTab('site')">Config</button>
            </nav>
            <div class="admin-content">
                ${adminTab === 'publications' ? `
                    <button class="btn btn-primary mb-4" onclick="showPublicationModal()">Nuevo Post</button>
                    <table class="admin-table">
                        ${publications.map(p => `
                            <tr>
                                <td>${escapeHtml(p.title)}</td>
                                <td>
                                    <button onclick="showPublicationModal(publications.find(x => x.id === '${p.id}'))">${icon('edit')}</button>
                                    <button onclick="deletePublication('${p.id}')">${icon('trash')}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                ` : adminTab === 'subscribers' ? `
                    <div style="margin-bottom:1rem"><h3>Total suscriptores: ${newsletterSubscribers.length}</h3></div>
                    <table class="admin-table">
                        <thead><tr><th>Email</th><th>Fecha</th><th style="width:60px"></th></tr></thead>
                        <tbody>
                            ${newsletterSubscribers.map(s => `
                                <tr>
                                    <td>${escapeHtml(s.email)}</td>
                                    <td>${formatDate(s.created_at)}</td>
                                    <td><button onclick="deleteSubscriber(${s.id})" title="Eliminar">${icon('trash')}</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <form onsubmit="event.preventDefault(); saveSiteConfig({ name: this.name.value, heroTitle: this.heroTitle.value, heroSubtitle: this.heroSubtitle.value, footerText: this.footerText.value, categories: this.categories.value }).then(() => { showToast('Guardado','success'); renderApp(); });">
                        <div class="form-group"><label>Nombre</label><input name="name" class="form-input" value="${escapeHtml(siteConfig.name)}"></div>
                        <div class="form-group"><label>Título</label><input name="heroTitle" class="form-input" value="${escapeHtml(siteConfig.heroTitle)}"></div>
                        <div class="form-group"><label>Subtítulo</label><textarea name="heroSubtitle" class="form-input">${escapeHtml(siteConfig.heroSubtitle)}</textarea></div>
                        <div class="form-group"><label>Texto footer</label><textarea name="footerText" class="form-input">${escapeHtml(siteConfig.footerText)}</textarea></div>
                        <div class="form-group"><label>Categorías (separadas por coma)</label><input name="categories" class="form-input" value="${escapeHtml(siteConfig.categories || '')}" placeholder="Reflexiones, Poesía, Ensayos"></div>
                        <button type="submit" class="btn btn-primary">Guardar</button>
                    </form>
                `}
            </div>
        </div>
    `;
}

function renderApp() {
    const app = $('#app');
    if (currentView === 'admin' && isAdmin) { app.innerHTML = renderAdminPanel(); }
    else if (currentView === 'publication' && selectedPublication) { app.innerHTML = `${renderHeader()}${renderPublicationDetail(selectedPublication)}`; }
    else { app.innerHTML = `${renderHeader()}<main>${renderHero()}${renderPublications()}</main>`; }
}

// Eventos de navegación
window.navigateHome = () => { currentView = 'home'; selectedPublication = null; renderApp(); };
window.navigateAdmin = () => { currentView = 'admin'; renderApp(); };
window.viewPublication = (id) => { selectedPublication = publications.find(p => p.id === id); currentView = 'publication'; renderApp(); window.scrollTo(0,0); };
window.filterCategory = (cat) => { selectedCategory = cat; renderApp(); };
window.setAdminTab = async (tab) => { adminTab = tab; if(tab === 'subscribers'){ showLoading(true); await loadSubscribers(); showLoading(false); } renderApp(); };
window.handleSearch = (e) => { searchQuery = e.target.value; renderApp(); };
window.deleteSubscriber = deleteSubscriber;

async function init() {
    showLoading(true);
    await initSupabase();
    if (supabaseClient) {
        await loadSiteConfig();
        await loadPublications();
    }
    showLoading(false);
    renderApp();
}

document.addEventListener('DOMContentLoaded', init);
