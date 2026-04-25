/* --- API URLs --- */
var IMTI_APPS_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbx4SXbyr-NoPYgs0xB5wWHiPb2qbn_DEiRbfMUSgMST_d7HnFmSCeBEXTlz3xNsz3wsFg/exec';
var IMTI_LOG_SHEET_URL      = 'https://script.google.com/macros/s/AKfycbyEUW4PVXAUaug9iC5iWp7ANatksYrhpSM6zBc5IrBeuxVpSIMpJXqT1QyaZeZAy2FO9A/exec';
var IMTI_CONTACT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzBInDqEoLUfRUKmAGEdvgJhFy6FHsp0uqv0HnhgVfh4Lb5F-NeeSACdMAJdT9DYaBZlA/exec';
var GAS_URL = 'https://script.google.com/macros/s/AKfycbyLTQ-1r9n-3weRUtRL9Cqo5H4GeRDYnKzlGXL60Tk3geSF86OwXJ0RvJQxZ4ucXRkJ/exec';

/* --- Session Guard --- */
function imtiRequireAuth() {
    if (!sessionStorage.getItem('imti_user_email')) {
        sessionStorage.clear();
        window.location.replace('index.html');
    }
}

function imtiRequireAdminAuth() {
    if (!sessionStorage.getItem('admin_email')) {
        sessionStorage.clear();
        window.location.replace('index.html');
    }
}

/* --- Common Modal CSS --- */
(function injectCommonStyles() {
    if (document.getElementById('imti-common-style')) return;
    var s = document.createElement('style');
    s.id = 'imti-common-style';
    s.textContent = [
        /* Modal base */
        '.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;z-index:1000;}',
        '.modal-bg.open{display:flex;}',
        '.modal-box{background:#fff;padding:30px;border-radius:12px;width:90%;max-width:400px;text-align:center;}',
        '.btn-row{display:flex;gap:10px;margin-top:20px;}',
        '.btn-row button{flex:1;padding:12px;border-radius:6px;border:none;cursor:pointer;font-weight:700;}',
        '.btn-confirm{background:#212529;color:#fff;}',
        '.btn-confirm:disabled{background:#adb5bd;cursor:not-allowed;}',
        '.btn-cancel{background:#e9ecef;color:#495057;}',
        /* Alert modal */
        '.alert-modal-box{background:#fff;padding:28px 30px 22px;border-radius:12px;width:90%;max-width:480px;text-align:center;}',
        '.alert-modal-box p{font-size:0.85rem;line-height:1.8;margin-bottom:20px;color:#343a40;}',
        '.alert-modal-box p .en{font-size:0.78rem;color:#868e96;display:block;margin-top:6px;}',
        /* Password modal */
        '#modal-pw .modal-box{max-width:460px;}',
        '#modal-pw h3{font-family:"DM Mono";font-size:1rem;margin-bottom:4px;}',
        '.modal-subtitle{font-size:0.75rem;color:#868e96;margin-bottom:18px;line-height:1.6;}',
        '.pw-field-group{text-align:left;margin-bottom:10px;}',
        '.pw-field-group label{font-size:0.75rem;color:#868e96;display:block;margin-bottom:4px;}',
        '.pw-field-group input{width:100%;padding:9px 12px;border:1px solid #dee2e6;border-radius:6px;font-size:0.88rem;font-family:"Noto Sans KR";outline:none;transition:border-color 0.2s;}',
        '.pw-field-group input:focus{border-color:#868e96;}',
        '.pw-divider{border:none;border-top:1px dashed #dee2e6;margin:14px 0;}',
        '.pw-hint{font-size:0.72rem;color:#868e96;text-align:left;margin-top:-6px;margin-bottom:6px;line-height:1.5;}',
        '#pw-error{font-size:0.78rem;color:#e03131;min-height:1.2em;margin-top:4px;text-align:left;}',
        '#modal-pw-errinput-id,#modal-pw-errinput-email,#modal-pw-errinput-pw,#modal-pw-errpasscheck,#modal-pw-errinpassput,#modal-pw-success{z-index:1100;}',
        /* Contact modal */
        '#modal-contact{z-index:1000;}',
        '#modal-contact .modal-box{max-width:520px;text-align:left;padding:36px 36px 28px;}',
        '#modal-contact-success{z-index:1100;}',
        '.modal-title{font-family:"DM Mono",monospace;font-size:1.05rem;font-weight:700;color:#212529;margin-bottom:6px;letter-spacing:0.04em;}',
        '.modal-desc{font-size:0.78rem;color:#868e96;line-height:1.7;margin-bottom:22px;}',
        '.contact-field{margin-bottom:14px;}',
        '.contact-field label{display:block;font-family:"DM Mono",monospace;font-size:0.72rem;font-weight:700;color:#495057;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px;}',
        '.contact-field input,.contact-field textarea{width:100%;border:1px solid #dee2e6;border-radius:6px;padding:9px 12px;font-family:"Noto Sans KR",sans-serif;font-size:0.82rem;color:#343a40;outline:none;transition:border-color 0.2s;resize:none;}',
        '.contact-field input:focus,.contact-field textarea:focus{border-color:#343a40;}',
        '.contact-to-row{display:flex;align-items:center;gap:10px;background:#f8f9fa;border-radius:6px;padding:9px 12px;margin-bottom:14px;border:1px solid #e9ecef;}',
        '.contact-to-label{font-family:"DM Mono",monospace;font-size:0.72rem;font-weight:700;color:#adb5bd;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;}',
        '.contact-to-email{font-family:"DM Mono",monospace;font-size:0.82rem;color:#343a40;font-weight:500;}',
        '.contact-notice{font-size:0.7rem;color:#adb5bd;line-height:1.6;margin-top:12px;text-align:center;}',
        '#contact-send-btn{width:100%;background:#343a40;color:#fff;border:none;border-radius:8px;padding:13.8px 12px;font-family:"DM Mono",monospace;font-size:0.8rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;margin-top:20px;display:flex;align-items:center;justify-content:center;gap:8px;min-height:51px;}',
        '#contact-send-btn:hover:not(:disabled){background:#1a56db;}',
        '#contact-send-btn:disabled{background:#adb5bd;cursor:not-allowed;}',
        /* PW progress overlay */
        '#pw-progress{display:none;position:fixed;inset:0;background:rgba(255,255,255,0.88);backdrop-filter:blur(6px);z-index:1200;align-items:center;justify-content:center;flex-direction:column;gap:16px;}',
    ].join('');
    document.head.appendChild(s);
})();

/* --- Common Modal HTM --- */
function imtiInjectModals() {
    if (document.getElementById('imti-common-modals')) return;
    var wrap = document.createElement('div');
    wrap.id = 'imti-common-modals';
    wrap.innerHTML = [
        /* Contact */
        '<div id="modal-contact" class="modal-bg" onclick="imtiOutsideCloseContact(event)">',
        '  <div class="modal-box" onclick="event.stopPropagation()">',
        '    <div class="modal-title">✉ Contact-Us</div>',
        '    <p class="modal-desc">IMTI 운영진에 문의(신고) 사항을 남겨주세요.<br><span style="font-size:0.72rem;">Contact the IMTI operations team with your inquiry or report.</span></p>',
        '    <div class="contact-field"><label>Your e-mail</label><input type="email" id="contact-from" placeholder="회신받으실 이메일 주소를 입력해주세요." oninput="imtiValidateContactForm()"></div>',
        '    <div class="contact-field"><label>Subject</label><input type="text" id="contact-subject" placeholder="문의(신고) 제목을 입력해주세요." oninput="imtiValidateContactForm()"></div>',
        '    <div class="contact-field"><label>Message</label><textarea id="contact-body" rows="5" placeholder="문의(신고) 내용을 입력해주세요." oninput="imtiValidateContactForm()"></textarea></div>',
        '    <p class="contact-notice"></p>',
        '    <button id="contact-send-btn" onclick="imtiSendContactMail()" disabled>✈ Send E-mail</button>',
        '    <div style="margin-top:16px;text-align:right;">',
        '      <button onclick="imtiCloseModal(\'modal-contact\')" style="background:none;border:none;cursor:pointer;font-family:\'DM Mono\',monospace;font-size:0.75rem;color:#adb5bd;letter-spacing:0.06em;" onmouseover="this.style.color=\'#343a40\'" onmouseout="this.style.color=\'#adb5bd\'">CLOSE ✕</button>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div id="modal-contact-success" class="modal-bg">',
        '  <div class="alert-modal-box">',
        '    <p>문의 메일이 정상적으로 발송되었습니다.<span class="en">Your inquiry has been sent successfully.</span></p>',
        '    <div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-contact-success\')">확인 (Confirm)</button></div>',
        '  </div>',
        '</div>',
        /* Logout */
        '<div id="modal-logout" class="modal-bg">',
        '  <div class="modal-box">',
        '    <h3 style="font-family:\'DM Mono\'">Log-out</h3>',
        '    <p style="margin:15px 0;font-size:0.9rem;">로그아웃 하시겠습니까?<br>Would you like to log out?</p>',
        '    <div class="btn-row">',
        '      <button class="btn-confirm" onclick="imtiDoLogout()">확인</button>',
        '      <button class="btn-cancel" onclick="imtiCloseModal(\'modal-logout\')">취소</button>',
        '    </div>',
        '  </div>',
        '</div>',
        /* Withdraw */
        '<div id="modal-withdraw" class="modal-bg">',
        '  <div class="modal-box" style="max-width:520px;text-align:left;">',
        '    <p style="font-size:0.92rem;line-height:1.8;margin-bottom:24px;">본 웹사이트(IMTI)의 회원에서 탈퇴하시겠습니까?<br>탈퇴 후 모든 데이터는 복구할 수 없습니다.<br><span style="font-size:0.82rem;color:#868e96;">Would you like to withdraw your membership?</span></p>',
        '    <div style="border:1px dashed #ccc;border-radius:6px;padding:12px 20px;margin-bottom:20px;">',
        '      <div style="display:table;width:100%;font-size:0.88rem;color:#495057;">',
        '        <div style="display:table-row;"><span style="display:table-cell;text-align:right;padding:8px 0;white-space:nowrap;">ID</span><span style="display:table-cell;text-align:center;padding:8px 6px;">:</span><span style="display:table-cell;padding:8px 0;color:#212529;font-weight:600;" id="withdraw-id"></span></div>',
        '        <div style="display:table-row;"><span style="display:table-cell;text-align:right;padding:8px 0;white-space:nowrap;">e-mail</span><span style="display:table-cell;text-align:center;padding:8px 6px;">:</span><span style="display:table-cell;padding:8px 0;color:#212529;font-weight:600;" id="withdraw-email"></span></div>',
        '        <div style="display:table-row;"><span style="display:table-cell;text-align:right;padding:8px 0;white-space:nowrap;">password</span><span style="display:table-cell;text-align:center;padding:8px 6px;">:</span><span style="display:table-cell;padding:4px 0;"><input type="password" id="withdraw-pw" placeholder="비밀번호 입력" style="width:100%;padding:6px 10px;border:1px solid #dee2e6;border-radius:6px;font-size:0.85rem;font-family:\'Noto Sans KR\';outline:none;"></span></div>',
        '      </div>',
        '      <div id="withdraw-error" style="font-size:0.78rem;color:#e03131;min-height:1.1em;margin-top:6px;text-align:left;"></div>',
        '    </div>',
        '    <div class="btn-row">',
        '      <button class="btn-confirm" style="background:#e03131;" onclick="imtiDoWithdraw()">확인 (Confirm)</button>',
        '      <button class="btn-cancel" onclick="imtiCloseModal(\'modal-withdraw\');document.getElementById(\'withdraw-pw\').value=\'\';document.getElementById(\'withdraw-error\').textContent=\'\';">취소 (Cancel)</button>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div id="modal-withdraw-success" class="modal-bg">',
        '  <div class="modal-box" style="text-align:center;">',
        '    <p style="font-size:0.92rem;line-height:1.9;margin-bottom:28px;">회원 탈퇴 처리가 되었습니다.<span style="font-size:0.82rem;color:#868e96;display:block;margin-top:8px;">Your membership has been withdrawn.</span></p>',
        '    <div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:200px;" onclick="imtiDoWithdrawSuccess()">확인 (Confirm)</button></div>',
        '  </div>',
        '</div>',
        /* Password change */
        '<div id="modal-pw" class="modal-bg">',
        '  <div class="modal-box">',
        '    <h3>비밀번호 변경</h3>',
        '    <p class="modal-subtitle">패스워드 변경을 위하여 아래의 입력란에 ID와 e-mail 주소,<br>현재 패스워드와 변경하실 패스워드를 입력해주세요.</p>',
        '    <div class="pw-field-group"><label>ID</label><input type="text" id="pw-id" placeholder="ID를 입력해주세요." oninput="imtiValidatePwForm()"></div>',
        '    <div class="pw-field-group"><label>e-mail</label><input type="email" id="pw-email" placeholder="이메일 주소를 입력해주세요." oninput="imtiValidatePwForm()"></div>',
        '    <div class="pw-field-group"><label>현재 패스워드</label><input type="password" id="pw-current" placeholder="현재 사용하시는 패스워드를 입력해주세요." oninput="imtiValidatePwForm()"></div>',
        '    <hr class="pw-divider">',
        '    <div class="pw-field-group"><label>변경 패스워드</label><input type="password" id="pw-new" placeholder="새로운 패스워드를 입력해주세요." oninput="imtiValidatePwForm()"></div>',
        '    <div class="pw-field-group"><label>변경 패스워드 (확인)</label><input type="password" id="pw-confirm" placeholder="새로운 패스워드를 입력해주세요." oninput="imtiValidatePwForm()"></div>',
        '    <p class="pw-hint">※ 비밀번호는 영문, 숫자, 특수문자(!@#$% 등)를 포함하여 13자리 이상으로 설정해 주세요.</p>',
        '    <div id="pw-error"></div>',
        '    <div class="btn-row">',
        '      <button class="btn-confirm" id="pw-submit-btn" onclick="imtiDoChangePassword()" disabled>확인 (Confirm)</button>',
        '      <button class="btn-cancel" onclick="imtiCloseModal(\'modal-pw\');imtiClearPwForm()">취소 (Cancel)</button>',
        '    </div>',
        '  </div>',
        '</div>',
        /* Password error / success modals */
        '<div id="modal-pw-errinput-id" class="modal-bg"><div class="alert-modal-box"><p>입력하신 ID가 존재하지 않습니다.<span class="en">The ID you entered does not exist.</span></p><div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-pw-errinput-id\')">확인</button></div></div></div>',
        '<div id="modal-pw-errinput-email" class="modal-bg"><div class="alert-modal-box"><p>입력된 e-mail이 정보와 일치하지 않습니다.<span class="en">The e-mail does not match.</span></p><div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-pw-errinput-email\')">확인</button></div></div></div>',
        '<div id="modal-pw-errinput-pw" class="modal-bg"><div class="alert-modal-box"><p>입력하신 현재 패스워드가 올바르지 않습니다.<span class="en">The current password is incorrect.</span></p><div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-pw-errinput-pw\')">확인</button></div></div></div>',
        '<div id="modal-pw-errpasscheck" class="modal-bg"><div class="alert-modal-box"><p>비밀번호는 영문, 숫자, 특수문자를 포함하여 13자리 이상으로 설정해 주세요.<span class="en">Password must be 13+ chars with letters, numbers, and special chars.</span></p><div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-pw-errpasscheck\')">확인</button></div></div></div>',
        '<div id="modal-pw-errinpassput" class="modal-bg"><div class="alert-modal-box"><p>입력된 두 개의 새로운 패스워드가 일치하지 않습니다.<span class="en">The two passwords do not match.</span></p><div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-pw-errinpassput\')">확인</button></div></div></div>',
        '<div id="modal-pw-success" class="modal-bg"><div class="alert-modal-box"><p>패스워드가 정상적으로 변경되었습니다.<span class="en">Your password has been successfully changed.</span></p><div class="btn-row" style="justify-content:center;"><button class="btn-confirm" style="max-width:160px;" onclick="imtiCloseModal(\'modal-pw-success\')">확인</button></div></div></div>',
        /* PW progress overlay */
        '<div id="pw-progress" style="display:none;position:fixed;inset:0;background:rgba(255,255,255,0.88);backdrop-filter:blur(6px);z-index:1200;align-items:center;justify-content:center;flex-direction:column;gap:16px;">',
        '  <svg viewBox="0 0 56 56" style="width:48px;height:48px;animation:spin 1s linear infinite;">',
        '    <circle cx="28" cy="28" r="22" fill="none" stroke="#e9ecef" stroke-width="4"/>',
        '    <circle cx="28" cy="28" r="22" fill="none" stroke="#343a40" stroke-width="4" stroke-dasharray="35 100" stroke-linecap="round"/>',
        '  </svg>',
        '  <div style="font-family:\'DM Mono\',monospace;font-size:0.78rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#343a40;">Verifying credentials...</div>',
        '</div>',
    ].join('');
    document.body.appendChild(wrap);
}

/* --- Modal control --- */
function imtiOpenModal(id) {
    if (id === 'modal-withdraw') {
        document.getElementById('withdraw-email').textContent = sessionStorage.getItem('imti_user_email') || '';
        document.getElementById('withdraw-id').textContent    = sessionStorage.getItem('imti_user_id')    || '';
        var wpEl = document.getElementById('withdraw-pw');
        if (wpEl) wpEl.value = '';
        var weEl = document.getElementById('withdraw-error');
        if (weEl) weEl.textContent = '';
    }
    if (id === 'modal-contact') {
        var fi = document.getElementById('contact-from');
        if (fi && !fi.value) fi.value = sessionStorage.getItem('imti_user_email') || '';
        imtiValidateContactForm();
    }
    document.getElementById(id).classList.add('open');
}
function imtiCloseModal(id) { document.getElementById(id).classList.remove('open'); }
function imtiOutsideClose(e, id) { if (e.target === document.getElementById(id)) imtiCloseModal(id); }
function imtiOutsideCloseContact(e) { if (e.target === document.getElementById('modal-contact')) imtiCloseModal('modal-contact'); }

/* --- Contact --- */
function imtiValidateContactForm() {
    var f   = (document.getElementById('contact-from')    || {}).value || '';
    var s   = (document.getElementById('contact-subject') || {}).value || '';
    var b   = (document.getElementById('contact-body')    || {}).value || '';
    var btn = document.getElementById('contact-send-btn');
    if (btn) btn.disabled = !(f.trim() && s.trim() && b.trim());
}

async function imtiSendContactMail() {
    var from    = document.getElementById('contact-from').value.trim();
    var subject = document.getElementById('contact-subject').value.trim();
    var body    = document.getElementById('contact-body').value.trim();
    var btn     = document.getElementById('contact-send-btn');
    btn.disabled = true; btn.textContent = '전송 중...';

    function resetBtn() {
        btn.disabled = false; btn.textContent = '✈ Send E-mail';
    }

    try {
        var res = await fetch(IMTI_CONTACT_SCRIPT_URL, {
            method:  'POST',
            cache:   'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ action: 'sendContact', from: from, subject: subject, body: body })
        }).then(function(r) { return r.json(); });

        if (res && res.status === 'OK') {
            document.getElementById('contact-from').value    = '';
            document.getElementById('contact-subject').value = '';
            document.getElementById('contact-body').value    = '';
            imtiCloseModal('modal-contact');
            imtiOpenModal('modal-contact-success');
        } else {
            alert('메일 전송에 실패했습니다. (' + (res && res.status || 'ERROR') + ')');
        }
    } catch (err) {
        console.warn('POST failed, trying no-cors:', err);
        /* CORS 차단 환경 fallback — 응답 확인 불가이지만 GAS는 실행됨 */
        try {
            await fetch(IMTI_CONTACT_SCRIPT_URL, {
                method:  'POST',
                mode:    'no-cors',
                cache:   'no-cache',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ action: 'sendContact', from: from, subject: subject, body: body })
            });
            document.getElementById('contact-from').value    = '';
            document.getElementById('contact-subject').value = '';
            document.getElementById('contact-body').value    = '';
            imtiCloseModal('modal-contact');
            imtiOpenModal('modal-contact-success');
        } catch (err2) {
            alert('메일 전송에 실패했습니다.');
        }
    } finally {
        resetBtn();
    }
}

/* --- Authorization Util  --- */
async function imtiSha256(str) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function imtiJsonpCall(url, cb, tcb) {
    var n = 'jsonp_cb_' + Date.now();
    var s = document.createElement('script');
    var t = setTimeout(function() {
        delete window[n];
        if (s.parentNode) s.parentNode.removeChild(s);
        if (tcb) tcb(); else cb(null);
    }, 10000);
    window[n] = function(r) {
        clearTimeout(t); delete window[n];
        if (s.parentNode) s.parentNode.removeChild(s);
        cb(r);
    };
    s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + n;
    document.body.appendChild(s);
}

function imtiSendLog(type, id, email) {
    try {
        fetch(IMTI_LOG_SHEET_URL + '?' + new URLSearchParams({ type: type, id: id, email: email }),
            { method: 'GET', mode: 'no-cors', keepalive: true }).catch(function() {});
    } catch (e) {}
}

/* --- Admin log  --- */
function imtiSendAdminLog(type, email, ip) {
    try {
        var params = { action: 'adminLog', type: type, email: email };
        if (ip) params.ip = ip;
        fetch(GAS_URL + '?' + new URLSearchParams(params),
            { method: 'GET', mode: 'no-cors', keepalive: true }).catch(function() {});
    } catch (e) {}
}
async function imtiSendAdminLoginLog(email) {
    var ip = 'unknown';
    try {
        var res  = await fetch('https://api.ipify.org?format=json');
        var data = await res.json();
        ip = data.ip || 'unknown';
    } catch (e) { /* IP 조회 실패 시 unknown 유지 */ }
    imtiSendAdminLog('login', email, ip);
}

/* --- log out  --- */
function imtiDoLogout() {
    /* 일반 유저 로그아웃 */
    if (sessionStorage.getItem('imti_user_email')) {
        /* imti_log_key: 로그인 시 시트에 기록된 id와 동일한 값 (없으면 imti_user_id → email 순 fallback) */
        var logKey = sessionStorage.getItem('imti_log_key')
                  || sessionStorage.getItem('imti_user_id')
                  || sessionStorage.getItem('imti_user_email')
                  || '';
        imtiSendLog('logout',
            logKey,
            sessionStorage.getItem('imti_user_email') || '');
    }
    /* Admin 로그아웃 → Admin-log 탭에 logout-time 기록 */
    if (sessionStorage.getItem('admin_email')) {
        imtiSendAdminLog('logout', sessionStorage.getItem('admin_email') || '');
    }
    sessionStorage.clear();
    location.href = 'index.html';
}

/* --- member withdraw  --- */
async function imtiDoWithdraw() {
    var email = sessionStorage.getItem('imti_user_email') || '';
    var pw    = document.getElementById('withdraw-pw').value.trim();
    var err   = document.getElementById('withdraw-error');
    if (!pw) { err.textContent = '비밀번호를 입력해주세요.'; return; }
    err.textContent = '';
    var hashed = await imtiSha256(pw);
    imtiJsonpCall(
        IMTI_APPS_SCRIPT_URL + '?action=withdraw' +
        '&email='    + encodeURIComponent(email) +
        '&password=' + encodeURIComponent(hashed),
        function(r) {
            if (r && (r === 'OK' || r.status === 'OK')) {
                sessionStorage.clear();
                imtiCloseModal('modal-withdraw');
                document.getElementById('withdraw-pw').value = '';
                document.getElementById('modal-withdraw-success').classList.add('open');
            } else {
                err.textContent = '비밀번호가 올바르지 않습니다.';
            }
        }
    );
}

function imtiDoWithdrawSuccess() {
    imtiCloseModal('modal-withdraw-success');
    location.href = 'index.html';
}

/* --- p/w change  --- */
function imtiIsValidPassword(pw) {
    return pw.length >= 13 &&
        /[a-zA-Z]/.test(pw) &&
        /[0-9]/.test(pw) &&
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
}

function imtiValidatePwForm() {
    var ids = ['pw-id', 'pw-email', 'pw-current', 'pw-new', 'pw-confirm'];
    var filled = ids.every(function(i) { return (document.getElementById(i) || {}).value && document.getElementById(i).value.trim(); });
    var btn = document.getElementById('pw-submit-btn');
    if (btn) btn.disabled = !filled;
}

function imtiClearPwForm() {
    ['pw-id', 'pw-email', 'pw-current', 'pw-new', 'pw-confirm'].forEach(function(i) {
        var el = document.getElementById(i);
        if (el) el.value = '';
    });
    var err = document.getElementById('pw-error');
    if (err) err.textContent = '';
    var btn = document.getElementById('pw-submit-btn');
    if (btn) btn.disabled = true;
}

function imtiShowPwProgress() { var el = document.getElementById('pw-progress'); if (el) el.style.display = 'flex'; }
function imtiHidePwProgress()  { var el = document.getElementById('pw-progress'); if (el) el.style.display = 'none'; }

async function imtiDoChangePassword() {
    var id    = document.getElementById('pw-id').value.trim();
    var email = document.getElementById('pw-email').value.trim();
    var cur   = document.getElementById('pw-current').value;
    var nw    = document.getElementById('pw-new').value;
    var cf    = document.getElementById('pw-confirm').value;

    if (!imtiIsValidPassword(nw)) { imtiOpenModal('modal-pw-errpasscheck'); return; }
    if (nw !== cf)                { imtiOpenModal('modal-pw-errinpassput'); return; }

    imtiShowPwProgress();

    var hashes = await Promise.all([imtiSha256(cur), imtiSha256(nw)]);
    var hc = hashes[0], hn = hashes[1];
    var base = IMTI_APPS_SCRIPT_URL;

    function isOK(r) { return r && (r === 'OK' || r.status === 'OK'); }

    var results = await new Promise(function(resolve) {
        var done = 0, out = [null, null, null];
        function check(i, url) {
            imtiJsonpCall(url, function(r) {
                out[i] = r;
                if (++done === 3) resolve(out);
            });
        }
        check(0, base + '?action=checkField&field=id&id=' + encodeURIComponent(id));
        check(1, base + '?action=checkField&field=email&id=' + encodeURIComponent(id) + '&email=' + encodeURIComponent(email));
        check(2, base + '?action=checkField&field=password&id=' + encodeURIComponent(id) + '&email=' + encodeURIComponent(email) + '&currentPassword=' + encodeURIComponent(hc));
    });

    if (!isOK(results[0])) { imtiHidePwProgress(); imtiOpenModal('modal-pw-errinput-id');    return; }
    if (!isOK(results[1])) { imtiHidePwProgress(); imtiOpenModal('modal-pw-errinput-email'); return; }
    if (!isOK(results[2])) { imtiHidePwProgress(); imtiOpenModal('modal-pw-errinput-pw');    return; }

    imtiJsonpCall(
        base + '?action=changePassword'
        + '&id='              + encodeURIComponent(id)
        + '&email='           + encodeURIComponent(email)
        + '&currentPassword=' + encodeURIComponent(hc)
        + '&newPassword='     + encodeURIComponent(hn),
        function(r4) {
            imtiHidePwProgress();
            if (isOK(r4)) { imtiCloseModal('modal-pw'); imtiClearPwForm(); imtiOpenModal('modal-pw-success'); }
            else           { imtiOpenModal('modal-pw-errinput-pw'); }
        }
    );
}

/* --- navbar loader  --- */
function imtiLoadNavbar(currentPage) {
    function _run() {
        imtiInjectModals();
        fetch('navbar.html', { credentials: 'same-origin' })
            .then(function(r) {
                if (!r.ok) throw new Error('navbar fetch failed: ' + r.status);
                return r.text();
            })
            .then(function(html) {
                var placeholder = document.getElementById('navbar-placeholder');
                if (!placeholder) return;
                placeholder.innerHTML = html;
                document.querySelectorAll('.nav-menu-item[data-page]').forEach(function(el) {
                    if (el.getAttribute('data-page') === currentPage) {
                        el.classList.add('active');
                        el.removeAttribute('href');
                    }
                });
                var emailEl = document.getElementById('user-email-display');
                if (emailEl) emailEl.textContent = sessionStorage.getItem('imti_user_email') || 'Guest User';
            })
            .catch(function(err) {
                console.error('[IMTI] navbar load error:', err);
            });
    }
    if (document.body) {
        _run();
    } else {
        document.addEventListener('DOMContentLoaded', _run);
    }
}
