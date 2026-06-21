/**
 * m_ad_common.js — IMTI Admin shared script (MOBILE)
 *
 * Mobile pages live under ad_pages/mobile/, so the site root is two levels up
 * ('../../index.html'). This file is fully self-contained — it does NOT depend
 * on ad_common.js.
 *
 * - Constants (GAS_URL, SHEET_ID)
 * - Mobile navbar injection (m_ad_navbar.html)
 * - Logout handling
 * - Session timer (30-min countdown, auto-logout on idle)
 * - Shared utilities: generatePassword, sha256, gasJsonp
 */

/* ── Constants ── */
const GAS_URL  = 'https://script.google.com/macros/s/AKfycbyLTQ-1r9n-3weRUtRL9Cqo5H4GeRDYnKzlGXL60Tk3geSF86OwXJ0RvJQxZ4ucXRkJ/exec';
const SHEET_ID = '1ZEczHs1ARAmu8XKSfREE8JuNHOSW3QxKSzXpgJrJ9EU';

/* ── Root index (mobile is two levels below site root) ── */
const ROOT_INDEX = '../../index.html';

/* ── Session guard — redirect to login if no admin session ── */
function requireAdminSession() {
    if (!sessionStorage.getItem('admin_email')) {
        sessionStorage.clear();
        window.location.replace(ROOT_INDEX);
    }
}

/* ── Inject mobile navbar from m_ad_navbar.html ── */
async function injectNavbar() {
    /* Pages may provide their own mount point (#m-navbar-mount); otherwise
       we insert at the top of <body>. If a navbar is already present, skip. */
    if (document.getElementById('m-admin-topnav')) return;
    try {
        const res = await fetch('m_ad_navbar.html');
        if (!res.ok) throw new Error('fetch failed: ' + res.status);
        const html = await res.text();

        let mount = document.getElementById('m-navbar-mount');
        if (mount) {
            mount.innerHTML = html;
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
            mount = document.body;
        }

        /* Re-execute scripts injected via innerHTML/insertAdjacentHTML
           (they don't auto-run) */
        mount.querySelectorAll('script').forEach(oldScript => {
            if (oldScript._navbarExecuted) return;
            oldScript._navbarExecuted = true;
            const newScript = document.createElement('script');
            if (oldScript.src) newScript.src = oldScript.src;
            else newScript.textContent = oldScript.textContent;
            document.body.appendChild(newScript);
            oldScript.remove();
        });
    } catch (e) {
        console.error('Mobile navbar load failed:', e);
    }
}

/* ── Logout ── */
function openLogoutPopup()  { document.getElementById('logout-popup').classList.add('active'); }
function closeLogoutPopup() { document.getElementById('logout-popup').classList.remove('active'); }

async function handleAdminLogout() {
    const btn = document.getElementById('logout-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Logging out...';
    const email = sessionStorage.getItem('admin_email') || '';
    try {
        await fetch(`${GAS_URL}?action=adminLog&type=logout&email=${encodeURIComponent(email)}`,
            { method: 'GET', mode: 'no-cors', credentials: 'omit' });
    } catch (e) { console.warn('Logout log failed:', e); }
    sessionStorage.removeItem('admin_email');
    sessionStorage.removeItem('admin_login_time');
    window.location.replace(ROOT_INDEX);
}

/* ── Session timer (30-min idle auto-logout) ── */
const SESSION_MINUTES = 30;
let _sessionTimer = null;

function _getLastActivity() {
    return parseInt(sessionStorage.getItem('last_activity') || '0', 10);
}
function _resetActivity() {
    sessionStorage.setItem('last_activity', Date.now().toString());
}

function startSessionTimer() {
    if (!_getLastActivity()) _resetActivity();
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'].forEach(evt => {
        window.addEventListener(evt, _resetActivity, { passive: true });
    });

    function tick() {
        const elapsed   = Math.floor((Date.now() - _getLastActivity()) / 1000);
        const remaining = Math.max(SESSION_MINUTES * 60 - elapsed, 0);
        const el = document.getElementById('session-timer');
        if (el) {
            const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
            const ss = String(remaining % 60).padStart(2, '0');
            el.textContent = `${mm}:${ss}`;
            el.classList.toggle('warning', remaining <= 300);
        }
        if (remaining <= 0) { clearInterval(_sessionTimer); _autoLogout(); }
    }
    tick();
    _sessionTimer = setInterval(tick, 1000);
}

async function _autoLogout() {
    const email = sessionStorage.getItem('admin_email') || '';
    try {
        await fetch(`${GAS_URL}?action=adminLog&type=logout&email=${encodeURIComponent(email)}`,
            { method: 'GET', mode: 'no-cors', credentials: 'omit' });
    } catch (e) { console.warn('Auto-logout log failed:', e); }
    sessionStorage.clear();
    window.location.replace(ROOT_INDEX);
}

/* ── Utilities ── */

/** Generate a 13-char random password (at least 1 uppercase, lowercase, digit, special char) */
function generatePassword() {
    const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower   = 'abcdefghjkmnpqrstuvwxyz';
    const digits  = '23456789';
    const special = '!@#$%';
    const all = upper + lower + digits + special;
    let pw = '';
    pw += upper  [Math.floor(Math.random() * upper.length)];
    pw += lower  [Math.floor(Math.random() * lower.length)];
    pw += digits [Math.floor(Math.random() * digits.length)];
    pw += special[Math.floor(Math.random() * special.length)];
    for (let i = 0; i < 9; i++) pw += all[Math.floor(Math.random() * all.length)];
    return pw.split('').sort(() => Math.random() - 0.5).join('');
}

/** SHA-256 hash (returns hex string) */
async function sha256(message) {
    const msgBuffer  = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generic JSONP call to a GAS endpoint.
 * @param {string} url  - GAS exec URL
 * @param {object} params - query params (callback key is added automatically)
 * @param {string} [prefix='cb'] - callback name prefix (use distinct prefixes per page)
 */
function gasJsonp(url, params, prefix = 'cb') {
    return new Promise((resolve, reject) => {
        const cbName = prefix + '_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
        const timer  = setTimeout(() => { cleanup(); reject(new Error('Timeout')); }, 15000);
        function cleanup() {
            delete window[cbName];
            const el = document.getElementById('s_' + cbName);
            if (el) el.remove();
        }
        window[cbName] = function(data) { clearTimeout(timer); cleanup(); resolve(data); };
        const qs = Object.entries({ ...params, callback: cbName })
            .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
        const script = document.createElement('script');
        script.id    = 's_' + cbName;
        script.src   = url + '?' + qs;
        script.onerror = function() { clearTimeout(timer); cleanup(); reject(new Error('Load error')); };
        document.head.appendChild(script);
    });
}

/* ── DOMContentLoaded init ── */
document.addEventListener('DOMContentLoaded', async () => {
    requireAdminSession();
    await injectNavbar();

    const emailEl = document.getElementById('admin-email-display');
    if (emailEl) emailEl.textContent = sessionStorage.getItem('admin_email') || '-';

    startSessionTimer();

    if (typeof window.__pageInit === 'function') window.__pageInit();
});
