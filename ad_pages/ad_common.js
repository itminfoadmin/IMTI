/**
 * ad_common.js  —  IMTI Admin 공통 스크립트
 *
 * 포함 기능:
 *   - 상수 (GAS_URL, SHEET_ID)
 *   - 네비바 + 로그아웃 팝업 동적 삽입 (injectNavbar)
 *   - 로그아웃 팝업 열기/닫기/처리
 *   - 네비게이션 함수 (go_*)
 *   - 세션 타이머 (30분 카운트다운)
 *   - 어드민 이메일 표시
 *   - 13자리 랜덤 패스워드 생성 (generatePassword)
 *
 * 사용법:
 *   <head> 또는 <body> 끝에 아래 한 줄 추가:
 *   <script src="ad_common.js"></script>
 *
 *   페이지별 추가 초기화가 필요하면 window.__pageInit 에 함수를 등록하세요:
 *   window.__pageInit = function() { loadData(); };
 */

/* ══════════════════════════════════════════
   1. 상수
══════════════════════════════════════════ */
const GAS_URL  = 'https://script.google.com/macros/s/AKfycbyLTQ-1r9n-3weRUtRL9Cqo5H4GeRDYnKzlGXL60Tk3geSF86OwXJ0RvJQxZ4ucXRkJ/exec';
const SHEET_ID = '1ZEczHs1ARAmu8XKSfREE8JuNHOSW3QxKSzXpgJrJ9EU';


/* ══════════════════════════════════════════
   1-1. 세션 가드
   — admin 세션이 없으면 즉시 index.html 로 리다이렉트.
   — DOMContentLoaded 에서 자동 호출되므로 별도 호출 불필요.
══════════════════════════════════════════ */
function requireAdminSession() {
    if (!sessionStorage.getItem('admin_email')) {
        sessionStorage.clear();
        window.location.replace('../index.html');
    }
}

/* ══════════════════════════════════════════
   2. 네비바 + 로그아웃 팝업 동적 삽입
   — ad_navbar.html 을 fetch 하여 body 맨 앞에 삽입
   — 로고·버튼·링크 변경은 ad_navbar.html 만 수정하면 전 페이지에 반영됨
══════════════════════════════════════════ */
async function injectNavbar() {
    try {
        const res = await fetch('ad_navbar.html');
        if (!res.ok) throw new Error('fetch failed: ' + res.status);
        const html = await res.text();
        document.body.insertAdjacentHTML('afterbegin', html);

        /* insertAdjacentHTML 로 삽입된 <script> 는 자동 실행되지 않으므로
           직접 새 <script> 요소를 만들어 재실행합니다.
           단, ad_navbar.html 삽입으로 생긴 스크립트만 실행 —
           body 전체를 순회하면 ad_common.js 자신이 재실행되어 const 중복 선언 오류 발생 */
        const navbarEl = document.getElementById('admin-topnav');
        const navbarScripts = navbarEl
            ? navbarEl.querySelectorAll('script')
            : [];
        navbarScripts.forEach(oldScript => {
            if (oldScript._navbarExecuted) return;
            oldScript._navbarExecuted = true;
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.head.appendChild(newScript);
            oldScript.remove();
        });

        /* 현재 페이지 메뉴 표시
           — 일반 버튼: current 클래스 → # # # 표시
           — 드롭다운 하위 버튼: current + 부모 .nav-dropdown 에 active → 부모 위에 # # # 표시 */
        const cur = location.pathname.split('/').pop();
        document.querySelectorAll('#admin-topnav .topnav-btn[onclick]').forEach(btn => {
            const m = btn.getAttribute('onclick').match(/location\.href='([^']+)'/);
            if (m && m[1] === cur) {
                btn.classList.add('current');
                const parentDropdown = btn.closest('.nav-dropdown');
                if (parentDropdown) parentDropdown.classList.add('active');
            }
        });

    } catch (e) {
        console.error('navbar 로드 실패:', e);
    }
}

/* ══════════════════════════════════════════
   3. 로그아웃
══════════════════════════════════════════ */
function openLogoutPopup()  { document.getElementById('logout-popup').classList.add('active'); }
function closeLogoutPopup() { document.getElementById('logout-popup').classList.remove('active'); }

async function handleAdminLogout() {
    const btn = document.getElementById('logout-confirm-btn');
    btn.disabled = true;
    btn.textContent = 'Logging out...';

    const email = sessionStorage.getItem('admin_email') || '';
    try {
        await fetch(
            `${GAS_URL}?action=adminLog&type=logout&email=${encodeURIComponent(email)}`,
            { method: 'GET', mode: 'no-cors', credentials: 'omit' }
        );
    } catch (e) {
        console.warn('로그아웃 기록 실패:', e);
    }

    sessionStorage.removeItem('admin_email');
    sessionStorage.removeItem('admin_login_time');
    window.location.replace('../index.html');   // replace → 뒤로가기로 복귀 불가
}

/* ══════════════════════════════════════════
   4. 네비게이션
══════════════════════════════════════════ */
/* 네비게이션 링크는 ad_navbar.html 의 각 버튼 onclick 에서 직접 관리합니다. */

/* ══════════════════════════════════════════
   5. 세션 타이머 (비활동 30분 자동 로그아웃)
      — 마우스·클릭·키보드·터치 발생 시 last_activity 갱신
      — 페이지 이동도 활동으로 간주 (sessionStorage 공유)
      — 페이지 로드 시 남은 시간 이어받아 표시
══════════════════════════════════════════ */
const SESSION_MINUTES = 30;
let _sessionTimer = null;

function _getLastActivity() {
    return parseInt(sessionStorage.getItem('last_activity') || '0', 10);
}

function _resetActivity() {
    sessionStorage.setItem('last_activity', Date.now().toString());
}

function startSessionTimer() {
    // 첫 활동 시각이 없으면 지금으로 설정
    if (!_getLastActivity()) _resetActivity();

    // 활동 이벤트 → last_activity 갱신
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

            if (remaining <= 300) {
                el.classList.add('warning');
            } else {
                el.classList.remove('warning');
            }
        }

        if (remaining <= 0) {
            clearInterval(_sessionTimer);
            _autoLogout();
        }
    }

    tick(); // 즉시 1회 실행
    _sessionTimer = setInterval(tick, 1000);
}

// 자동 로그아웃 — 팝업 버튼 없이 직접 처리
async function _autoLogout() {
    const email = sessionStorage.getItem('admin_email') || '';
    try {
        await fetch(
            `${GAS_URL}?action=adminLog&type=logout&email=${encodeURIComponent(email)}`,
            { method: 'GET', mode: 'no-cors', credentials: 'omit' }
        );
    } catch (e) {
        console.warn('자동 로그아웃 기록 실패:', e);
    }
    sessionStorage.clear();
    window.location.replace('../index.html');
}

/* ══════════════════════════════════════════
   6. 유틸
══════════════════════════════════════════ */

/** 13자리 랜덤 패스워드 생성 (대/소문자·숫자·특수문자 각 1개 이상) */
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

/* ══════════════════════════════════════════
   7. 초기화 — DOMContentLoaded
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
    // 세션 가드 — 미인증 접근 즉시 차단
    requireAdminSession();

    // 네비바 삽입 (fetch 완료 후 이메일·타이머 초기화)
    await injectNavbar();

    // 어드민 이메일 표시
    const emailEl = document.getElementById('admin-email-display');
    if (emailEl) emailEl.textContent = sessionStorage.getItem('admin_email') || '-';

    // 세션 타이머 시작 (비활동 30분 기준)
    startSessionTimer();

    // 페이지별 추가 초기화 (각 페이지에서 window.__pageInit = function(){...} 으로 등록)
    if (typeof window.__pageInit === 'function') {
        window.__pageInit();
    }

});

