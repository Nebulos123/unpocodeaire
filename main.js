const SUPABASE_URL = 'https://uagwapbwmgvlpbgwyuvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZ3dhcGJ3bWd2bHBiZ3d5dXZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwOTc4MTUsImV4cCI6MjA4ODY3MzgxNX0.Fj8m1g_m02jhBSFAWYW-vdods53lN_acZ_0wOoG7TGo';

// Email del administrador (quien puede acceder al panel admin)
const ADMIN_EMAIL = 'macarenavila@admin.com';

// ============================================
// INICIALIZACIÓN
// ============================================
let supabaseClient = null;
let currentUser = null;
let isAdmin = false;

// Datos locales (se sincronizarán con Supabase)
let siteConfig = {
    name: 'Letras & Reflexiones',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM4NTkzN2UiLz48cGF0aCBkPSJNNjUgMzBMMzUgNTBMODEwMEw2NSAxMDBMNzAgNzBMMTAwIDUwTDcwIDMwTDY1IDMwWiIgZmlsbD0iI2ZlZmRmZCIvPjwvc3ZnPg==',
    heroImage: '',
    heroTitle: 'Un espacio para la curiosidad',
    heroSubtitle: 'Exploramos el mundo a través de las palabras. Reflexiones, poesía y ensayos que despiertan el pensamiento y alimentan el alma.',
    footerText: 'Un espacio para la curiosidad, la reflexión y la belleza de las palabras.'
};

let publications = [];
let newsletterEmails = [];

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
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 १-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 १ 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 १ 2.83 0l.06.06a1.65 1.65 0 0 ० 1.82.33H9a1.65 1.65 0 0 0 १-1.51V3a2 2 0 0 १ 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 १ 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 २.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 १ 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 १-2-2V5a2 2 0 0 १ 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
};

function icon(name, size = 'icon-sm') {
    return `<span class="icon ${size}">${icons[name] || ''}</span>`;
}

// ============================================
// UTILIDADES
// ============================================
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function showToast(message, type = 'info') {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function showLoading(show = true) {
    const overlay = $('#loading-overlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substr(0, 2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ALMACENAMIENTO LOCAL (FALLBACK)
// ============================================
const storage = {
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

// ============================================
// INICIALIZACIÓN DE SUPABASE
// ============================================
async function initSupabase() {
    if (SUPABASE_URL === 'TU_SUPABASE_URL_AQUI' || SUPABASE_ANON_KEY === 'TU_SUPABASE_ANON_KEY_AQUI') {
        console.warn('Supabase no está configurado. Usando almacenamiento local.');
        loadLocalData();
        return false;
    }
    
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Verificar sesión existente
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            isAdmin = currentUser.email === ADMIN_EMAIL;
        }
        
        // Escuchar cambios de autenticación
        supabaseClient.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            isAdmin = currentUser?.email === ADMIN_EMAIL;
            renderApp();
        });
        
        return true;
    } catch (error) {
        console.error('Error inicializando Supabase:', error);
        loadLocalData();
        return false;
    }
}

function loadLocalData() {
    const savedConfig = storage.get('siteConfig');
    if (savedConfig) siteConfig = { ...siteConfig, ...savedConfig };
    
    const savedPubs = storage.get('publications');
    if (savedPubs) publications = savedPubs;
    
    const savedEmails = storage.get('newsletterEmails');
    if (savedEmails) newsletterEmails = savedEmails;
    
    const savedUser = storage.get('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        isAdmin = savedUser.email === ADMIN_EMAIL;
    }
}

function saveLocalData() {
    storage.set('siteConfig', siteConfig);
    storage.set('publications', publications);
    storage.set('newsletterEmails', newsletterEmails);
}

// ============================================
// AUTENTICACIÓN
// ============================================
async function signUp(email, password, name) {
    if (!supabaseClient) {
        // Modo local
        const user = {
            id: generateId(),
            email: email,
            user_metadata: { name: name }
        };
        currentUser = user;
        isAdmin = email === ADMIN_EMAIL;
        storage.set('currentUser', currentUser);
        showToast('¡Cuenta creada! Bienvenido ' + name, 'success');
        renderApp();
        return { success: true };
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        
        if (error) throw error;
        
        showToast('¡Revisa tu email para confirmar tu cuenta!', 'success');
        return { success: true, data };
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
        return { success: false, error };
    }
}

async function signIn(email, password) {
    if (!supabaseClient) {
        // Modo local
        const user = {
            id: generateId(),
            email: email,
            user_metadata: { name: email.split('@')[0] }
        };
        currentUser = user;
        isAdmin = email === ADMIN_EMAIL;
        storage.set('currentUser', currentUser);
        showToast('¡Bienvenido!', 'success');
        renderApp();
        return { success: true };
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        isAdmin = currentUser.email === ADMIN_EMAIL;
        showToast('¡Bienvenido!', 'success');
        closeModal();
        renderApp();
        return { success: true, data };
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
        return { success: false, error };
    }
}

async function signOut() {
    if (!supabaseClient) {
        currentUser = null;
        isAdmin = false;
        storage.remove('currentUser');
        showToast('Sesión cerrada', 'info');
        renderApp();
        return;
    }
    
    try {
        await supabaseClient.auth.signOut();
        currentUser = null;
        isAdmin = false;
        showToast('Sesión cerrada', 'info');
        renderApp();
    } catch (error) {
        showToast('Error al cerrar sesión', 'error');
    }
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
        if (data) publications = data;
    } catch (error) {
        console.error('Error cargando publicaciones:', error);
    }
}

async function savePublication(pub) {
    const isNew = !pub.id;
    const publication = {
        ...pub,
        id: pub.id || generateId(),
        created_at: pub.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    if (!supabaseClient) {
        if (isNew) {
            publications.unshift(publication);
        } else {
            const index = publications.findIndex(p => p.id === pub.id);
            if (index >= 0) publications[index] = publication;
        }
        saveLocalData();
        return publication;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('publications')
            .upsert(publication)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error guardando publicación:', error);
        throw error;
    }
}

async function deletePublication(id) {
    if (!supabaseClient) {
        publications = publications.filter(p => p.id !== id);
        saveLocalData();
        return true;
    }
    
    try {
        const { error } = await supabaseClient
            .from('publications')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error eliminando publicación:', error);
        throw error;
    }
}

// ============================================
// GESTIÓN DE CONFIGURACIÓN DEL SITIO
// ============================================
async function loadSiteConfig() {
    if (!supabaseClient) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('site_config')
            .select('*')
            .single();
        
        if (data) siteConfig = { ...siteConfig, ...data };
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}

async function saveSiteConfig(config) {
    siteConfig = { ...siteConfig, ...config };
    
    if (!supabaseClient) {
        saveLocalData();
        return siteConfig;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('site_config')
            .upsert({ id: 1, ...siteConfig })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error guardando configuración:', error);
        throw error;
    }
}

// ============================================
// NEWSLETTER
// ============================================
async function subscribeNewsletter(email) {
    if (!supabaseClient) {
        if (!newsletterEmails.includes(email)) {
            newsletterEmails.push(email);
            saveLocalData();
        }
        return true;
    }
    
    try {
        const { error } = await supabaseClient
            .from('newsletter')
            .insert({ email });
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error en newsletter:', error);
        throw error;
    }
}

// ============================================
// CONVERSIÓN DE IMÁGENES A BASE64
// ============================================
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
    // Cerrar modal existente
    closeModal();
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `<div class="modal">${content}</div>`;
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });
    
    document.body.appendChild(overlay);
    currentModal = overlay;
}

function closeModal() {
    if (currentModal) {
        currentModal.remove();
        currentModal = null;
    }
}

// Modal de Login
function showLoginModal() {
    openModal(`
        <div class="modal-header">
            <h2>Iniciar sesión</h2>
            <p>Accede a tu cuenta</p>
        </div>
        <form id="login-form" class="modal-body">
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="email" placeholder="tu@email.com" required>
            </div>
            <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input type="password" class="form-input" name="password" placeholder="••••••••" required minlength="6">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
                ${icon('login')} Entrar
            </button>
        </form>
        <div class="modal-footer">
            <p>¿No tienes cuenta? <button type="button" onclick="showRegisterModal()">Regístrate aquí</button></p>
        </div>
    `);
    
    $('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Entrando...';
        
        await signIn(email, password);
    });
}

// Modal de Registro
function showRegisterModal() {
    openModal(`
        <div class="modal-header">
            <h2>Crear cuenta</h2>
            <p>Únete a nuestra comunidad</p>
        </div>
        <form id="register-form" class="modal-body">
            <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-input" name="name" placeholder="Tu nombre" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" name="email" placeholder="tu@email.com" required>
            </div>
            <div class="form-group">
                <label class="form-label">Contraseña</label>
                <input type="password" class="form-input" name="password" placeholder="••••••••" required minlength="6">
            </div>
            <div class="form-group">
                <label class="form-label">Confirmar contraseña</label>
                <input type="password" class="form-input" name="confirmPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
                ${icon('user')} Crear cuenta
            </button>
        </form>
        <div class="modal-footer">
            <p>¿Ya tienes cuenta? <button type="button" onclick="showLoginModal()">Inicia sesión</button></p>
        </div>
    `);
    
    $('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        
        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }
        
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> Creando...';
        
        await signUp(email, password, name);
    });
}

// Modal de Newsletter
function showNewsletterModal() {
    openModal(`
        <div class="modal-header">
            <div class="modal-icon">${icon('mail', 'icon-lg')}</div>
            <h2>Suscríbete al Newsletter</h2>
            <p>Recibe las mejores publicaciones en tu correo</p>
        </div>
        <form id="newsletter-form" class="modal-body">
            <div class="form-group">
                <label class="form-label">Tu email</label>
                <input type="email" class="form-input" name="email" placeholder="tu@email.com" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">
                ${icon('mail')} Suscribirme
            </button>
            <p class="form-helper text-center mt-4">Respetamos tu privacidad. Puedes darte de baja en cualquier momento.</p>
        </form>
    `);
    
    $('#newsletter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        
        try {
            await subscribeNewsletter(email);
            showToast('¡Gracias por suscribirte!', 'success');
            closeModal();
        } catch (error) {
            showToast('Error al suscribir. Intenta de nuevo.', 'error');
        }
    });
}

// Modal de Publicación (Crear/Editar)
function showPublicationModal(pub = null) {
    const isEdit = !!pub;
    const defaultPub = {
        title: '',
        excerpt: '',
        content: '',
        category: 'Reflexiones',
        author: '',
        image: '',
        readTime: '5 min'
    };
    const data = pub || defaultPub;
    
    openModal(`
        <div class="modal-header">
            <h2>${isEdit ? 'Editar' : 'Nueva'} Publicación</h2>
        </div>
        <form id="publication-form" class="modal-body">
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="form-input" name="title" value="${escapeHtml(data.title)}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Categoría</label>
                <select class="form-input" name="category" required>
                    <option value="Reflexiones" ${data.category === 'Reflexiones' ? 'selected' : ''}>Reflexiones</option>
                    <option value="Poesía" ${data.category === 'Poesía' ? 'selected' : ''}>Poesía</option>
                    <option value="Ensayos" ${data.category === 'Ensayos' ? 'selected' : ''}>Ensayos</option>
                    <option value="Naturaleza" ${data.category === 'Naturaleza' ? 'selected' : ''}>Naturaleza</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Autor</label>
                <input type="text" class="form-input" name="author" value="${escapeHtml(data.author)}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Tiempo de lectura</label>
                <input type="text" class="form-input" name="readTime" value="${escapeHtml(data.readTime)}" placeholder="5 min">
            </div>
            <div class="form-group">
                <label class="form-label">Extracto</label>
                <textarea class="form-input" name="excerpt" rows="2" required>${escapeHtml(data.excerpt)}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Contenido</label>
                <textarea class="form-input" name="content" rows="6" required>${escapeHtml(data.content)}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Imagen</label>
                <div class="file-input-wrapper">
                    <input type="file" class="file-input" name="image" id="pub-image-input" accept="image/*">
                    <label for="pub-image-input" class="file-input-label">
                        ${icon('upload', 'icon-md')}
                        <span>Click para subir imagen</span>
                    </label>
                    <div id="pub-image-preview" class="${data.image ? '' : 'hidden'}">
                        <img src="${data.image}" class="file-preview" alt="Preview">
                    </div>
                </div>
            </div>
            <input type="hidden" name="id" value="${data.id || ''}">
            <input type="hidden" name="existingImage" value="${data.image || ''}">
            <div class="flex gap-3">
                <button type="button" class="btn btn-secondary" style="flex: 1" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary" style="flex: 1">
                    ${icon('save')} ${isEdit ? 'Guardar' : 'Crear'}
                </button>
            </div>
        </form>
    `);
    
    // Preview de imagen
    const imageInput = $('#pub-image-input');
    if (imageInput) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const base64 = await fileToBase64(file);
                const previewDiv = $('#pub-image-preview');
                previewDiv.innerHTML = `<img src="${base64}" class="file-preview" alt="Preview">`;
                previewDiv.classList.remove('hidden');
            }
        });
    }
    
    $('#publication-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        
        let imageData = form.existingImage.value;
        if (form.image.files[0]) {
            imageData = await fileToBase64(form.image.files[0]);
        }
        
        const publication = {
            id: form.id.value || null,
            title: form.title.value,
            excerpt: form.excerpt.value,
            content: form.content.value,
            category: form.category.value,
            author: form.author.value,
            readTime: form.readTime.value || '5 min',
            image: imageData,
            date: pub?.date || formatDate(new Date())
        };
        
        try {
            await savePublication(publication);
            showToast(isEdit ? 'Publicación actualizada' : 'Publicación creada', 'success');
            closeModal();
            renderApp();
        } catch (error) {
            showToast('Error al guardar', 'error');
        }
    });
}

// Modal de confirmación de eliminación
function showDeleteConfirmation(id) {
    openModal(`
        <div class="modal-header">
            <h2>Eliminar publicación</h2>
            <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-body">
            <div class="flex gap-3">
                <button class="btn btn-secondary" style="flex: 1" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-error" style="flex: 1" onclick="confirmDelete('${id}')">
                    ${icon('trash')} Eliminar
                </button>
            </div>
        </div>
    `);
}

async function confirmDelete(id) {
    try {
        await deletePublication(id);
        showToast('Publicación eliminada', 'success');
        closeModal();
        renderApp();
    } catch (error) {
        showToast('Error al eliminar', 'error');
    }
}

// ============================================
// VISTAS
// ============================================
let currentView = 'home';
let selectedPublication = null;
let selectedCategory = 'Todos';
let searchQuery = '';
let adminTab = 'publications';

// Renderizar Header
function renderHeader() {
    return `
        <header class="header">
            <div class="header-inner">
                <button class="logo" onclick="navigateHome()">
                    <img src="${siteConfig.logo}" alt="Logo" class="logo-img">
                    <span class="logo-text">${siteConfig.name}</span>
                </button>
                
                <div class="header-actions desktop">
                    <div class="search-wrapper">
                        <span class="search-icon">${icon('search')}</span>
                        <input type="text" class="form-input search-input" placeholder="Buscar..." 
                            value="${escapeHtml(searchQuery)}" onkeyup="handleSearch(event)">
                    </div>
                    
                    <button class="btn btn-outline" onclick="showNewsletterModal()">
                        ${icon('mail')} Newsletter
                    </button>
                    
                    ${currentUser ? `
                        <div class="user-menu">
                            <div class="user-avatar">${getInitials(currentUser.user_metadata?.name || currentUser.email)}</div>
                            <span class="text-sm">${currentUser.user_metadata?.name || currentUser.email.split('@')[0]}</span>
                            ${isAdmin ? `
                                <button class="btn btn-secondary btn-sm" onclick="navigateAdmin()">
                                    ${icon('settings')} Admin
                                </button>
                            ` : ''}
                            <button class="btn btn-ghost btn-sm" onclick="signOut()">
                                ${icon('logout')} Salir
                            </button>
                        </div>
                    ` : `
                        <button class="btn btn-ghost" onclick="showLoginModal()">
                            ${icon('login')} Entrar
                        </button>
                        <button class="btn btn-primary" onclick="showRegisterModal()">
                            ${icon('user')} Registrarse
                        </button>
                    `}
                </div>
                
                <button class="btn btn-icon btn-ghost mobile-menu-btn" onclick="toggleMobileMenu()">
                    ${icon('menu', 'icon-md')}
                </button>
            </div>
            
            <div class="mobile-menu" id="mobile-menu">
                <div class="form-group">
                    <input type="text" class="form-input" placeholder="Buscar..." 
                        value="${escapeHtml(searchQuery)}" onkeyup="handleSearch(event)">
                </div>
                <button class="btn btn-outline mb-3" onclick="showNewsletterModal()">
                    ${icon('mail')} Newsletter
                </button>
                ${currentUser ? `
                    <div class="user-menu">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="user-avatar">${getInitials(currentUser.user_metadata?.name || currentUser.email)}</div>
                            <span>${currentUser.user_metadata?.name || currentUser.email.split('@')[0]}</span>
                        </div>
                        ${isAdmin ? `
                            <button class="btn btn-secondary mb-2" onclick="navigateAdmin()">
                                ${icon('settings')} Panel Admin
                            </button>
                        ` : ''}
                        <button class="btn btn-ghost" onclick="signOut()">
                            ${icon('logout')} Cerrar sesión
                        </button>
                    </div>
                ` : `
                    <div class="flex gap-2">
                        <button class="btn btn-outline" onclick="showLoginModal()" style="flex: 1">Entrar</button>
                        <button class="btn btn-primary" onclick="showRegisterModal()" style="flex: 1">Registrarse</button>
                    </div>
                `}
            </div>
        </header>
    `;
}

// Renderizar Hero
function renderHero() {
    return `
        <section class="hero">
            <div class="hero-bg">
                ${siteConfig.heroImage ? `<img src="${siteConfig.heroImage}" alt="">` : ''}
                <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
                <div class="hero-logo">
                    <img src="${siteConfig.logo}" alt="Logo">
                </div>
                <h1>${escapeHtml(siteConfig.heroTitle)}</h1>
                <p>${escapeHtml(siteConfig.heroSubtitle)}</p>
                <div class="hero-buttons">
                    <button class="btn btn-lg" style="background: var(--color-cream); color: var(--color-brown);" onclick="showNewsletterModal()">
                        ${icon('mail')} Suscríbete al Newsletter
                    </button>
                    <button class="btn btn-lg btn-outline" style="border-color: var(--color-cream); color: var(--color-cream);" onclick="scrollToPublications()">
                        Explorar publicaciones
                    </button>
                </div>
            </div>
            <div class="hero-wave">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#fefdfd"/>
                </svg>
            </div>
        </section>
    `;
}

// Renderizar Newsletter Section
function renderNewsletterSection() {
    return `
        <section class="newsletter-section">
            ${icon('mail', 'icon-lg')}
            <h2>¿Te gusta lo que lees?</h2>
            <p>Suscríbete a nuestro newsletter semanal y recibe las mejores reflexiones, poemas y ensayos directamente en tu correo.</p>
            <form class="newsletter-form" onsubmit="handleNewsletterSubmit(event)">
                <input type="email" class="form-input" placeholder="tu@email.com" required>
                <button type="submit" class="btn btn-primary">Suscribirse</button>
            </form>
        </section>
    `;
}

// Renderizar Publicaciones
function renderPublications() {
    const filtered = publications.filter(pub => {
        const matchesCategory = selectedCategory === 'Todos' || pub.category === selectedCategory;
        const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             pub.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    const categories = ['Todos', 'Reflexiones', 'Poesía', 'Ensayos', 'Naturaleza'];
    
    return `
        <section class="publications-section" id="publications">
            <h2>Publicaciones recientes</h2>
            
            <div class="category-filters">
                ${categories.map(cat => `
                    <button class="category-btn ${selectedCategory === cat ? 'active' : ''}" onclick="filterCategory('${cat}')">
                        ${cat}
                    </button>
                `).join('')}
            </div>
            
            ${filtered.length > 0 ? `
                <div class="publications-grid">
                    ${filtered.map(pub => `
                        <article class="publication-card" onclick="viewPublication('${pub.id}')">
                            <div class="publication-image">
                                <img src="${pub.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'}" alt="${escapeHtml(pub.title)}">
                                <div class="publication-image-overlay"></div>
                                <span class="publication-category">${pub.category}</span>
                                <h3 class="publication-title">${escapeHtml(pub.title)}</h3>
                            </div>
                            <div class="publication-content">
                                <p class="publication-excerpt">${escapeHtml(pub.excerpt)}</p>
                                <div class="publication-meta">
                                    <div class="publication-author">
                                        <div class="publication-author-avatar">${getInitials(pub.author)}</div>
                                        <span>${escapeHtml(pub.author)}</span>
                                    </div>
                                    <div class="publication-info">
                                        <span>${icon('calendar', 'icon-sm')} ${pub.date}</span>
                                        <span>${icon('clock', 'icon-sm')} ${pub.readTime}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    `).join('')}
                </div>
            ` : `
                <div class="empty-state">
                    <p>No se encontraron publicaciones.</p>
                </div>
            `}
        </section>
    `;
}

// Renderizar detalle de publicación
function renderPublicationDetail(pub) {
    if (!pub) return '';
    
    const paragraphs = pub.content.split('\n\n').filter(p => p.trim());
    
    return `
        <div class="publication-detail">
            <div class="publication-detail-header">
                <img src="${pub.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'}" alt="${escapeHtml(pub.title)}">
                <div class="publication-detail-overlay"></div>
                <div class="publication-detail-info">
                    <button class="btn btn-ghost" style="color: var(--color-cream); margin-bottom: 1rem;" onclick="navigateHome()">
                        ${icon('arrowLeft')} Volver
                    </button>
                    <span class="publication-category" style="position: static; margin-bottom: 0.5rem;">${pub.category}</span>
                    <h1 style="font-family: var(--font-serif); font-size: 2rem; color: var(--color-cream); margin-bottom: 0.5rem;">
                        ${escapeHtml(pub.title)}
                    </h1>
                    <div class="flex items-center gap-4" style="color: rgba(254, 253, 253, 0.8); font-size: 0.875rem;">
                        <div class="flex items-center gap-2">
                            <div class="user-avatar">${getInitials(pub.author)}</div>
                            <span>${escapeHtml(pub.author)}</span>
                        </div>
                        <span>${icon('calendar', 'icon-sm')} ${pub.date}</span>
                        <span>${icon('clock', 'icon-sm')} ${pub.readTime}</span>
                    </div>
                </div>
            </div>
            
            <div class="publication-detail-content">
                ${paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}
                
                <div class="publication-actions">
                    <button class="btn btn-outline">${icon('heart')} Me gusta</button>
                    <button class="btn btn-outline">${icon('bookmark')} Guardar</button>
                    <button class="btn btn-outline">${icon('share')} Compartir</button>
                </div>
                
                <div class="author-card">
                    <div class="author-card-avatar">${getInitials(pub.author)}</div>
                    <div>
                        <h3>${escapeHtml(pub.author)}</h3>
                        <p>Escritor y colaborador de ${siteConfig.name}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Footer
function renderFooter() {
    return `
        <footer class="footer">
            <div class="footer-grid">
                <div>
                    <div class="footer-brand">
                        <img src="${siteConfig.logo}" alt="Logo">
                        <span>${siteConfig.name}</span>
                    </div>
                    <p>${siteConfig.footerText}</p>
                </div>
                <div>
                    <h4>Explorar</h4>
                    <ul>
                        <li><button onclick="filterCategory('Reflexiones'); navigateHome();">Reflexiones</button></li>
                        <li><button onclick="filterCategory('Poesía'); navigateHome();">Poesía</button></li>
                        <li><button onclick="filterCategory('Ensayos'); navigateHome();">Ensayos</button></li>
                        <li><button onclick="filterCategory('Naturaleza'); navigateHome();">Naturaleza</button></li>
                    </ul>
                </div>
                <div>
                    <h4>Newsletter</h4>
                    <p>No te pierdas ninguna publicación.</p>
                    <button class="btn btn-outline" style="border-color: var(--color-cream); color: var(--color-cream); margin-top: 0.5rem;" onclick="showNewsletterModal()">
                        Suscribirse
                    </button>
                </div>
            </div>
            <hr class="footer-divider">
            <p class="footer-copyright">© ${new Date().getFullYear()} ${siteConfig.name}. Todos los derechos reservados.</p>
        </footer>
    `;
}

// ============================================
// PANEL DE ADMINISTRACIÓN
// ============================================
function renderAdminPanel() {
    return `
        <div class="admin-panel">
            <div class="admin-header">
                <div class="admin-header-inner">
                    <h1>${icon('settings')} Panel de Administración</h1>
                    <button class="btn btn-secondary" onclick="navigateHome()">
                        ${icon('arrowLeft')} Volver al sitio
                    </button>
                </div>
            </div>
            
            <nav class="admin-nav">
                <button class="admin-nav-btn ${adminTab === 'publications' ? 'active' : ''}" onclick="setAdminTab('publications')">
                    Publicaciones
                </button>
                <button class="admin-nav-btn ${adminTab === 'site' ? 'active' : ''}" onclick="setAdminTab('site')">
                    Configuración del Sitio
                </button>
                <button class="admin-nav-btn ${adminTab === 'newsletter' ? 'active' : ''}" onclick="setAdminTab('newsletter')">
                    Newsletter
                </button>
            </nav>
            
            <div class="admin-content">
                ${adminTab === 'publications' ? renderAdminPublications() : ''}
                ${adminTab === 'site' ? renderAdminSite() : ''}
                ${adminTab === 'newsletter' ? renderAdminNewsletter() : ''}
            </div>
        </div>
    `;
}

function renderAdminPublications() {
    return `
        <div class="admin-card">
            <div class="flex justify-between items-center mb-4">
                <h3>Publicaciones (${publications.length})</h3>
                <button class="btn btn-primary" onclick="showPublicationModal()">
                    ${icon('plus')} Nueva publicación
                </button>
            </div>
            
            ${publications.length > 0 ? `
                <div style="overflow-x: auto;">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Imagen</th>
                                <th>Título</th>
                                <th>Categoría</th>
                                <th>Autor</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${publications.map(pub => `
                                <tr>
                                    <td><img src="${pub.image}" class="admin-table-img" alt=""></td>
                                    <td>${escapeHtml(pub.title)}</td>
                                    <td>${pub.category}</td>
                                    <td>${escapeHtml(pub.author)}</td>
                                    <td>${pub.date}</td>
                                    <td>
                                        <div class="admin-table-actions">
                                            <button class="btn btn-outline btn-sm" onclick="showPublicationModal(publications.find(p => p.id === '${pub.id}'))">
                                                ${icon('edit')}
                                            </button>
                                            <button class="btn btn-error btn-sm" onclick="showDeleteConfirmation('${pub.id}')">
                                                ${icon('trash')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="empty-state">
                    <p>No hay publicaciones. ¡Crea la primera!</p>
                </div>
            `}
        </div>
    `;
}

function renderAdminSite() {
    return `
        <div class="admin-card">
            <h3>Logo del sitio</h3>
            <div class="logo-upload-section">
                <img src="${siteConfig.logo}" alt="Logo actual" class="current-logo">
                <div class="logo-upload-info">
                    <h4>Logo actual</h4>
                    <p>Recomendado: imagen cuadrada de al menos 200x200px</p>
                    <div class="file-input-wrapper">
                        <input type="file" class="file-input" id="logo-input" accept="image/*" onchange="handleLogoUpload(event)">
                        <label for="logo-input" class="btn btn-primary">
                            ${icon('upload')} Subir nuevo logo
                        </label>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="admin-card">
            <h3>Imagen Hero</h3>
            ${siteConfig.heroImage ? `
                <img src="${siteConfig.heroImage}" alt="Hero actual" class="hero-preview">
            ` : ''}
            <div class="file-input-wrapper">
                <input type="file" class="file-input" id="hero-input" accept="image/*" onchange="handleHeroUpload(event)">
                <label for="hero-input" class="file-input-label">
                    ${icon('image', 'icon-md')}
                    <span>Click para subir imagen hero</span>
                </label>
            </div>
        </div>
        
        <div class="admin-card">
            <h3>Textos del sitio</h3>
            <form onsubmit="handleSiteTextsSubmit(event)">
                <div class="form-group">
                    <label class="form-label">Nombre del sitio</label>
                    <input type="text" class="form-input" name="name" value="${escapeHtml(siteConfig.name)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Título hero</label>
                    <input type="text" class="form-input" name="heroTitle" value="${escapeHtml(siteConfig.heroTitle)}">
                </div>
                <div class="form-group">
                    <label class="form-label">Subtítulo hero</label>
                    <textarea class="form-input" name="heroSubtitle" rows="2">${escapeHtml(siteConfig.heroSubtitle)}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Texto del footer</label>
                    <textarea class="form-input" name="footerText" rows="2">${escapeHtml(siteConfig.footerText)}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                    ${icon('save')} Guardar cambios
                </button>
            </form>
        </div>
    `;
}

function renderAdminNewsletter() {
    return `
        <div class="admin-card">
            <h3>Suscriptores del Newsletter (${newsletterEmails.length})</h3>
            
            <div class="stats-grid mb-6">
                <div class="stat-card">
                    <div class="stat-value">${newsletterEmails.length}</div>
                    <div class="stat-label">Total suscriptores</div>
                </div>
            </div>
            
            ${newsletterEmails.length > 0 ? `
                <div style="overflow-x: auto;">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${newsletterEmails.map(email => `
                                <tr>
                                    <td>${escapeHtml(email)}</td>
                                    <td>-</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="empty-state">
                    <p>No hay suscriptores aún.</p>
                </div>
            `}
        </div>
    `;
}

// ============================================
// FUNCIONES DE NAVEGACIÓN Y EVENTOS
// ============================================
function renderApp() {
    const app = $('#app');
    
    if (currentView === 'admin' && isAdmin) {
        app.innerHTML = renderAdminPanel();
    } else if (currentView === 'publication' && selectedPublication) {
        app.innerHTML = `
            ${renderHeader()}
            <main class="flex-1">
                ${renderPublicationDetail(selectedPublication)}
            </main>
        `;
    } else {
        app.innerHTML = `
            ${renderHeader()}
            <main class="flex-1">
                ${renderHero()}
                ${renderNewsletterSection()}
                ${renderPublications()}
            </main>
            ${renderFooter()}
        `;
    }
}

function navigateHome() {
    currentView = 'home';
    selectedPublication = null;
    renderApp();
    window.scrollTo(0, 0);
}

function navigateAdmin() {
    currentView = 'admin';
    adminTab = 'publications';
    renderApp();
    window.scrollTo(0, 0);
}

function viewPublication(id) {
    selectedPublication = publications.find(p => p.id === id);
    if (selectedPublication) {
        currentView = 'publication';
        renderApp();
        window.scrollTo(0, 0);
    }
}

function filterCategory(category) {
    selectedCategory = category;
    renderApp();
}

function setAdminTab(tab) {
    adminTab = tab;
    renderApp();
}

function handleSearch(event) {
    searchQuery = event.target.value;
    if (event.key === 'Enter' || event.type === 'input') {
        renderApp();
    }
}

function scrollToPublications() {
    const section = $('#publications');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleMobileMenu() {
    const menu = $('#mobile-menu');
    if (menu) {
        menu.classList.toggle('open');
    }
}

async function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    try {
        await subscribeNewsletter(email);
        showToast('¡Gracias por suscribirte!', 'success');
        event.target.reset();
    } catch (error) {
        showToast('Error al suscribir', 'error');
    }
}

async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const base64 = await fileToBase64(file);
        siteConfig.logo = base64;
        saveLocalData();
        showToast('Logo actualizado', 'success');
        renderApp();
    }
}

async function handleHeroUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const base64 = await fileToBase64(file);
        siteConfig.heroImage = base64;
        saveLocalData();
        showToast('Imagen hero actualizada', 'success');
        renderApp();
    }
}

async function handleSiteTextsSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    siteConfig.name = form.name.value;
    siteConfig.heroTitle = form.heroTitle.value;
    siteConfig.heroSubtitle = form.heroSubtitle.value;
    siteConfig.footerText = form.footerText.value;
    
    saveLocalData();
    showToast('Configuración guardada', 'success');
    renderApp();
}

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
async function init() {
    showLoading(true);
    
    // Inicializar Supabase o cargar datos locales
    await initSupabase();
    
    // Cargar datos
    if (supabaseClient) {
        await loadSiteConfig();
        await loadPublications();
    }
    
    // Si no hay publicaciones, crear datos de ejemplo
    if (publications.length === 0) {
        publications = [
            {
                id: generateId(),
                title: 'El arte de la contemplación',
                excerpt: 'En la quietud del atardecer, cuando los pensamientos se vuelven susurros, descubrimos que la verdadera sabiduría habita en los silencios.',
                content: 'En la quietud del atardecer, cuando los pensamientos se vuelven susurros, descubrimos que la verdadera sabiduría habita en los silencios.\n\nLa contemplación no es simplemente pensar, es permitir que el pensamiento se disuelva en la experiencia pura de existir. Es en esos momentos de calma absoluta donde las grandes verdades se revelan, no como conceptos, sino como vivencias.\n\nCuando contemplamos una flor, no la analizamos. La dejamos ser, y en ese dejar ser, nosotros también somos. Esta es la paradoja más hermosa de la existencia: que al perder el ego en la admiración de algo exterior, nos encontramos más plenamente que nunca.',
                author: 'María Elena Vargas',
                category: 'Reflexiones',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
                date: formatDate(new Date()),
                readTime: '5 min'
            },
            {
                id: generateId(),
                title: 'Palabras que sanan',
                excerpt: 'Hay frases que llegan en el momento exacto, como si el universo conspirara para ofrecernos exactamente lo que necesitamos escuchar.',
                content: 'Hay frases que llegan en el momento exacto, como si el universo conspirara para ofrecernos exactamente lo que necesitamos escuchar.\n\nLa poesía tiene este poder misterioso: puede transformar el dolor en belleza, la confusión en claridad, la soledad en conexión. No porque resuelva nuestros problemas, sino porque nos recuerda que somos más grandes que ellos.\n\nRecuerdo la primera vez que leí a Rilke: "Si tu vida cotidiana te parece pobre, no la culpes; culpaste a ti mismo porque no eres poeta para sacar su riqueza". Esas palabras me atravesaron como una flecha.',
                author: 'Carlos Mendoza',
                category: 'Poesía',
                image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
                date: formatDate(new Date(Date.now() - 86400000)),
                readTime: '4 min'
            },
            {
                id: generateId(),
                title: 'El jardín de los libros',
                excerpt: 'Cada libro es una semilla que plantamos en nuestra mente. Algunos germinan de inmediato, otros esperan años bajo la tierra de nuestra memoria.',
                content: 'Cada libro es una semilla que plantamos en nuestra mente. Algunos germinan de inmediato, otros esperan años bajo la tierra de nuestra memoria.\n\nHay libros que cambian vidas. No es una exageración ni una frase hecha. Es una verdad que cualquiera que haya amado la lectura puede confirmar. Ese momento en que las páginas dejan de ser papel y tinta para convertirse en espejos, ventanas, puentes.\n\nMi abuela tenía una biblioteca que parecía un bosque encantado. Los libros apilados hasta el techo, el olor a papel viejo y tiempo, la luz que entraba por las ventanas y pintaba de oro los lomos gastados.',
                author: 'Ana Lucía Fernández',
                category: 'Ensayos',
                image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
                date: formatDate(new Date(Date.now() - 172800000)),
                readTime: '6 min'
            }
        ];
        saveLocalData();
    }
    
    showLoading(false);
    renderApp();
}

// Hacer funciones disponibles globalmente
window.navigateHome = navigateHome;
window.navigateAdmin = navigateAdmin;
window.viewPublication = viewPublication;
window.filterCategory = filterCategory;
window.setAdminTab = setAdminTab;
window.handleSearch = handleSearch;
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.showNewsletterModal = showNewsletterModal;
window.showPublicationModal = showPublicationModal;
window.showDeleteConfirmation = showDeleteConfirmation;
window.confirmDelete = confirmDelete;
window.closeModal = closeModal;
window.signOut = signOut;
window.toggleMobileMenu = toggleMobileMenu;
window.handleNewsletterSubmit = handleNewsletterSubmit;
window.handleLogoUpload = handleLogoUpload;
window.handleHeroUpload = handleHeroUpload;
window.handleSiteTextsSubmit = handleSiteTextsSubmit;
window.scrollToPublications = scrollToPublications;
window.publications = publications;

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
