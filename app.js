const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function qs(id) { return document.getElementById(id); }
function mk(tag, props = {}) { const el = document.createElement(tag); Object.assign(el, props); return el; }

function setAttr(el, attr, val){ if(el) el.setAttribute(attr, val); }
function removeAttr(el, attr){ if(el) el.removeAttribute(attr); }
role="tab"]');
const pages = $$('.page');

const topAvatar = $('#top-avatar');
const topUsername = $('#top-username');

const notifBtn = $('#notif-btn');
const notifList = $('#notifications-list');
const notifBadge = $('#notif-badge');
const notifItems = $('#notif-items');
const homeNotifs = $('#home-notifs');

const obfuscateBtn = $('#obfuscate-btn');
const codeInput = $('#code-input');
const codeOutput = $('#code-output');
const languageSelect = $('#language-select');
const strEncrypt = $('#str-encrypt');
const ctrlFlow = $('#ctrl-flow');
const junkCode = $('#junk-code');
const varRename = $('#var-rename');
const strengthRange = $('#strength-range');
const strengthVal = $('#strength-val');

const quickObfuscate = $('#quick-obfuscate');
const quickSettings = $('#quick-settings');

const copyBtn = $('#copy-btn');
const clearBtn = $('#clear-btn');
const downloadBtn = $('#download-btn');

const historyList = $('#history-list');

const themeRadios = $$('input[name="theme"]');
const soundToggle = $('#sound-toggle');
const usernameEdit = $('#username-edit');

/* GitHub elements */
const ghFetchBtn = $('#gh-fetch');
const ghClearBtn = $('#gh-clear');
const ghUsernameInput = $('#gh-username-input');
const ghAvatar = $('#gh-avatar');
const ghNameEl = $('#gh-name');
const ghLoginEl = $('#gh-login');
const ghInfo = $('#gh-info');

const LS_THEME = 'bb_theme';
const LS_HISTORY = 'bb_history';
const LS_GHUSER = 'bb_gh_user';
const LS_PROFILE = 'bb_profile';
const LS_SETTINGS = 'bb_settings';
const DEFAULT_THEME = localStorage.getItem(LS_THEME) || 'blue';
document.documentElement.setAttribute('data-theme', DEFAULT_THEME);
themeRadios.forEach(r => { r.checked = (r.value === DEFAULT_THEME); r.addEventListener('change', (e) => {
  if(e.target.checked){
    applyTheme(e.target.value);
    play('switch');
  }
}); });

function applyTheme(name){
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem(LS_THEME, name);
}

function activateTab(tab) {
  tabs.forEach(t => t.setAttribute('aria-selected','false'));
  pages.forEach(p => { p.classList.remove('active'); p.hidden = true; });

  tab.setAttribute('aria-selected','true');
  const id = tab.getAttribute('aria-controls');
  const page = document.getElementById(id);
  if(page){ page.classList.add('active'); page.hidden = false; page.focus(); }
}
tabs.forEach((tab, idx) => {
  tab.addEventListener('click', () => { activateTab(tab); play('click'); });
  // keyboard: Alt+1..4
  window.addEventListener('keydown', (e) => {
    if(e.altKey && !isNaN(Number(e.key))) {
      const n = Number(e.key);
      if(n === idx+1) { activateTab(tab); }
    }
  });
});
// ensure initial tab
activateTab(tabs[0]);

let notifCount = 0;
function notify(msg, type='info'){
  const el = mk('div');
  el.className = 'notif-item';
  if(type === 'success') el.style.color = 'var(--success)';
  if(type === 'error') el.style.color = 'var(--danger)';
  el.textContent = msg;
  if(notifItems) notifItems.prepend(el);
  if(homeNotifs) homeNotifs.prepend(el.cloneNode(true));
  notifCount++;
  if(notifBadge) notifBadge.style.display = 'block';
  // auto-remove after 8s
  setTimeout(()=>{ if(el.parentNode) el.parentNode.removeChild(el); }, 8000);
}

/* toggle notif list */
let notifOpen = false;
notifBtn.addEventListener('click', () => {
  notifOpen = !notifOpen;
  if(notifOpen){ notifList.classList.add('visible'); notifList.hidden = false; notifBtn.setAttribute('aria-expanded','true'); }
  else { notifList.classList.remove('visible'); notifBtn.setAttribute('aria-expanded','false'); setTimeout(()=> notifList.hidden = true, 250); }
  play('click');
});
document.addEventListener('click', (e) => {
  if(notifOpen && !notifBtn.contains(e.target) && !notifList.contains(e.target)){
    notifOpen = false; notifList.classList.remove('visible'); setTimeout(()=> notifList.hidden = true, 250); notifBtn.setAttribute('aria-expanded','false');
  }
});

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioEnabled = () => (JSON.parse(localStorage.getItem(LS_SETTINGS) || '{}').sounds !== false) && (soundToggle ? soundToggle.checked : true);

function play(type='click'){
  if(!AudioCtx || !audioEnabled()) return;
  const ctx = new AudioCtx();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  const now = ctx.currentTime;
  switch(type){
    case 'click': o.frequency.setValueAtTime(700, now); g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.12); break;
    case 'switch': o.frequency.setValueAtTime(900, now); g.gain.setValueAtTime(0.06, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.14); break;
    case 'success': o.frequency.setValueAtTime(1100, now); g.gain.setValueAtTime(0.09, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.2); break;
    case 'error': o.frequency.setValueAtTime(240, now); g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now+0.26); break;
  }
  o.type = 'sine'; o.start(now); o.stop(now+0.18);
}

/* save sound preference */
soundToggle && soundToggle.addEventListener('change', () => {
  const s = JSON.parse(localStorage.getItem(LS_SETTINGS) || '{}'); s.sounds = !!soundToggle.checked; localStorage.setItem(LS_SETTINGS, JSON.stringify(s));
});

/* username edit */
usernameEdit && usernameEdit.addEventListener('change', () => {
  const v = usernameEdit.value.trim();
  if(v) topUsername.textContent = v;
  localStorage.setItem(LS_SETTINGS, JSON.stringify({...JSON.parse(localStorage.getItem(LS_SETTINGS)||'{}'), displayName: v}));
});

/* Load saved settings like display name */
(function loadSettings(){
  try{
    const s = JSON.parse(localStorage.getItem(LS_SETTINGS)||'{}');
    if(s && s.displayName){ topUsername.textContent = s.displayName; usernameEdit.value = s.displayName; }
    if(typeof s.sounds !== 'undefined') { soundToggle.checked = !!s.sounds; }
  }catch(e){}
})();

function variableRename(code){
  // naive: collect identifiers and randomize small names
  const names = new Set();
  const re = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
  let m;
  const keywords = new Set(['function','if','else','return','for','while','do','end','local','var','let','const','true','false','null','undefined','break','continue','switch','case','new','class','this','typeof']);
  while((m = re.exec(code)) !== null){
    const n = m[1];
    if(!keywords.has(n) && n.length > 1) names.add(n);
  }
  const map = {};
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  names.forEach(n => {
    let id=''; const l = 2 + Math.floor(Math.random()*3);
    for(let i=0;i<l;i++) id += letters[Math.floor(Math.random()*letters.length)];
    map[n] = id;
  });
  let out = code;
  Object.entries(map).forEach(([orig, repl]) => {
    out = out.replace(new RegExp('\\b'+orig+'\\b','g'), repl);
  });
  return out;
}

function stringEncrypt(code, lang='lua'){
  // very naive: replace quoted strings with runtime decode functions
  return code.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, (m) => {
    const s = m.slice(1,-1);
    const arr = Array.from(s).map(ch => ch.charCodeAt(0));
    if(lang === 'js' || lang === 'javascript') {
      return '(()=>{let s="";['+arr.join(',')+'].forEach(c=>s+=String.fromCharCode(c));return s;})()';
    }
    // lua
    return "((function() local s=''; local a={" + arr.join(',') + "} for i=1,#a do s=s..string.char(a[i]) end return s end)())";
  });
}

function controlFlowWrap(code, lang){
  if(lang === 'lua') {
    return `do local _i=0 repeat _i=_i+1 if _i==1 then\n${code}\nend until true end`;
  }
  return `(() => { let _pc=0; while(true){ switch(_pc){ case 0:\n${code}\nreturn; } } })();`;
}

function junkInjection(code, lang){
  const junk = lang==='lua' ? ['local _j=math.random()','-- junk'] : ['const _j=Math.random();','// junk'];
  const lines = code.split('\n');
  for(let i = 0; i < lines.length; i+=3){
    if(Math.random() > 0.6) lines.splice(i,0,junk[Math.floor(Math.random()*junk.length)]);
  }
  return lines.join('\n');
}

/* main obfuscate handler */
async function obfuscateHandler(){
  const input = codeInput.value.trim();
  if(!input){ alert('Paste some code first.'); codeInput.focus(); return; }

  // Gather options
  const options = {
    lang: languageSelect.value === 'js' ? 'js' : (languageSelect.value === 'javascript' ? 'js' : 'lua'),
    strEncrypt: !!strEncrypt.checked,
    ctrlFlow: !!ctrlFlow.checked,
    junkCode: !!junkCode.checked,
    varRename: !!varRename.checked,
    strength: Number(strengthRange.value) || 5
  };

  // UI busy state
  obfuscateBtn.disabled = true;
  setAttr(obfuscateBtn,'aria-busy','true');
  obfuscateBtn.classList.add('working');

  // show spinner
  setTimeout(()=>{ obfuscateBtn.querySelector('.btn-spinner').style.visibility = 'visible'; }, 80);

  play('click');

  // Simulate progressive work; in a real engine you would stream progress
  await new Promise(r => setTimeout(r, 350));

  try{
    let out = input;

    // variable rename (if selected) may be repeated based on strength
    if(options.varRename) out = variableRename(out);

    if(options.strEncrypt) out = stringEncrypt(out, options.lang === 'js' ? 'js' : 'lua');

    if(options.ctrlFlow) out = controlFlowWrap(out, options.lang);

    if(options.junkCode) out = junkInjection(out, options.lang);

    // repeat junk injection based on strength
    for(let i=1;i<options.strength;i++){
      if(options.junkCode && Math.random()>0.5) out = junkInjection(out, options.lang);
      if(options.varRename && Math.random()>0.5) out = variableRename(out);
    }

    // Prepend metadata
    out = `-- Obfuscated with BlueBlock Pro (strength=${options.strength}) --\n` + out;

    // set output
    codeOutput.value = out;

    // Save to history (local)
    addHistory({
      time: new Date().toISOString(),
      lang: options.lang,
      options,
      inputSnippet: input.slice(0, 350),
      outputSnippet: out.slice(0, 350)
    });

    notify('Obfuscation complete', 'success');
    play('success');

  }catch(err){
    notify('Obfuscation failed: ' + (err && err.message ? err.message : 'unknown'), 'error');
    play('error');
  }finally{
    obfuscateBtn.disabled = false;
    removeAttr(obfuscateBtn,'aria-busy');
    obfuscateBtn.classList.remove('working');
    obfuscateBtn.querySelector('.btn-spinner').style.visibility = 'hidden';
  }
}

/* Wire obfuscation UI */
obfuscateBtn.addEventListener('click', obfuscateHandler);
strengthRange.addEventListener('input', ()=> strengthVal.textContent = strengthRange.value);

/* Copy / Clear / Download */
copyBtn.addEventListener('click', async () => {
  if(!codeOutput.value) return;
  try {
    await navigator.clipboard.writeText(codeOutput.value);
    notify('Copied output to clipboard', 'success');
    play('click');
  } catch(e){ alert('Copy failed'); }
});
clearBtn.addEventListener('click', () => { codeInput.value=''; codeOutput.value=''; play('click'); });
downloadBtn.addEventListener('click', () => {
  if(!codeOutput.value) return;
  const blob = new Blob([codeOutput.value], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = mk('a'); a.href = url;
  a.download = 'obfuscated.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  notify('Saved obfuscated file', 'success');
});

/* Quick nav actions */
quickObfuscate && quickObfuscate.addEventListener('click', ()=> { activateTab($('#tab-obfuscator')); play('click'); });
quickSettings && quickSettings.addEventListener('click', ()=> { activateTab($('#tab-settings')); play('click'); });

/* =========================
   Simple History storage (localStorage)
   ========================= */
function loadHistory(){ try{ return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); }catch(e){return [];} }
function saveHistory(h){ localStorage.setItem(LS_HISTORY, JSON.stringify(h)); }
let history = loadHistory();
function addHistory(entry){
  history.unshift(entry);
  if(history.length > 60) history.length = 60; // keep small
  renderHistory();
  saveHistory(history);
}
function renderHistory(){
  historyList.innerHTML = '';
  if(history.length === 0){
    historyList.innerHTML = '<div class="muted">No history yet.</div>'; return;
  }
  history.forEach(h => {
    const el = mk('div'); el.className = 'history-item';
    el.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${h.lang.toUpperCase()} • ${new Date(h.time).toLocaleString()}</div>
        <div class="muted small">Options: ${Object.keys(h.options).filter(k => h.options[k] && k!=='strength').join(', ') || 'none'} • Strength: ${h.options.strength}</div>
        <details style="margin-top:8px">
          <summary>Output snippet</summary>
          <pre>${escapeHTML(h.outputSnippet||'')}</pre>
        </details>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn ghost" data-action="copy" title="Copy output">Copy</button>
        <button class="btn ghost" data-action="rerun" title="Re-run">Rerun</button>
      </div>
    `;
    // actions
    el.querySelector('[data-action="copy"]').addEventListener('click', () => {
      navigator.clipboard.writeText(h.outputSnippet || '').then(()=> notify('Copied history output', 'success'));
    });
    el.querySelector('[data-action="rerun"]').addEventListener('click', () => {
      // simple rerun: put inputs in editor (we only have the snippet)
      codeInput.value = h.inputSnippet || '';
      activateTab($('#tab-obfuscator'));
      play('click');
    });
    historyList.appendChild(el);
  });
}
renderHistory();
function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* =========================
   GitHub public-profile integration
   - client-only; uses GitHub public API
   - persists username in localStorage
   ========================= */
const GH_API = 'https://api.github.com/users/';

async function fetchGitHub(username){
  const url = GH_API + encodeURIComponent(username);
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
  if(res.status === 404) throw new Error('GitHub user not found');
  if(!res.ok) throw new Error('API error: ' + res.status);
  return await res.json();
}

async function connectGitHub(username){
  ghInfo.textContent = 'Fetching...';
  ghFetchBtn.disabled = true; ghClearBtn.disabled = true;
  try{
    const profile = await fetchGitHub(username);
    // update UI
    ghAvatar.style.backgroundImage = `url(${profile.avatar_url})`;
    topAvatar.style.backgroundImage = `url(${profile.avatar_url})`;
    ghNameEl.textContent = profile.name || profile.login;
    ghLoginEl.textContent = profile.login;
    ghInfo.innerHTML = `${profile.public_repos} repos • ${profile.followers} followers • <a href="${profile.html_url}" target="_blank">View on GitHub</a>`;
    topUsername.textContent = profile.name || profile.login;
    // persist username
    localStorage.setItem(LS_GHUSER, profile.login);
    localStorage.setItem(LS_PROFILE, JSON.stringify({avatar: profile.avatar_url, name: profile.name || profile.login}));
    notify('GitHub profile loaded', 'success');
  }catch(err){
    ghInfo.textContent = 'Error: ' + (err.message || 'failed');
    notify('GitHub fetch error: ' + (err.message||''), 'error');
  }finally{
    ghFetchBtn.disabled = false; ghClearBtn.disabled = false;
  }
}

// Wire buttons
ghFetchBtn.addEventListener('click', ()=> {
  const user = (ghUsernameInput.value||'').trim();
  if(!user){ ghInfo.textContent = 'Enter a username'; return; }
  connectGitHub(user);
});
ghClearBtn.addEventListener('click', ()=> {
  ghUsernameInput.value=''; ghAvatar.style.backgroundImage=''; ghNameEl.textContent='Not connected'; ghLoginEl.textContent=''; ghInfo.textContent='';
  topAvatar.style.backgroundImage=''; topUsername.textContent = localStorage.getItem(LS_PROFILE) ? JSON.parse(localStorage.getItem(LS_PROFILE)).name : 'DevMaster';
  localStorage.removeItem(LS_GHUSER); localStorage.removeItem(LS_PROFILE);
  notify('GitHub connection cleared', 'info');
});

/* On load, attempt to load saved profile */
(function loadSavedProfile(){
  const savedUser = localStorage.getItem(LS_GHUSER);
  const savedProfile = localStorage.getItem(LS_PROFILE);
  if(savedProfile){
    try{
      const p = JSON.parse(savedProfile);
      topAvatar.style.backgroundImage = `url(${p.avatar})`;
      ghAvatar.style.backgroundImage = `url(${p.avatar})`;
      ghNameEl.textContent = p.name;
      topUsername.textContent = p.name;
    }catch(e){}
  }else if(savedUser){
    ghUsernameInput.value = savedUser;
    // auto fetch with small delay
    setTimeout(()=> connectGitHub(savedUser), 200);
  }
})();

/* =========================
   Copy / Save / Clear handlers for input & output
   ========================= */
/* Already wired above for output. Provide keyboard shortcuts */
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter to obfuscate
  if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
    e.preventDefault();
    obfuscateHandler();
  }
});

/* =========================
   Small UX: show saved stats
   ========================= */
(function loadStats(){
  const hist = loadHistoryFromLS();
  qs('stat-scripts').textContent = hist.length || 0;
  qs('stat-sessions').textContent = Math.max(1, Math.floor(Math.random()*6));
})();
function loadHistoryFromLS(){ try{ return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); }catch(e){return [];} }

/* =========================
   Accessibility helpers (focus outlines for keyboard only)
   ========================= */
function handleFirstTab(e){
  if(e.key === 'Tab'){ document.body.classList.add('user-is-tabbing'); window.removeEventListener('keydown', handleFirstTab); }
}
window.addEventListener('keydown', handleFirstTab);

/* =========================
   Final notes:
   - This project uses a demo obfuscation pipeline. For production,
     replace the demo functions with robust obfuscation algorithms
     or integrate a backend service that performs heavy transformations.
   - For GitHub authenticated access or to avoid rate limits, implement
     OAuth server-side and forward credentials securely.
   ========================= */
