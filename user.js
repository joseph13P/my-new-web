// user.js — set a personalized greeting using first name from URL or localStorage
// Usage: add ?name=Joseph or ?user=Joseph to the site URL to set greeting for the session.

(function(){
  function firstWord(s){
    return (s||'').trim().split(/\s+/)[0] || '';
  }

  function readNameFromQuery(){
    try{
      const params = new URLSearchParams(location.search);
      return params.get('name') || params.get('user') || params.get('firstName') || params.get('first');
    }catch(e){ return null; }
  }

  function setGreeting(name){
    const el = document.getElementById('userGreeting');
    if (!el) return;
    const display = name ? ('@' + name) : '@Guest';
    el.textContent = display;
    el.setAttribute('title', name ? ('Signed in as ' + name) : 'Set your name');
  }

  function saveName(name){
    try{ localStorage.setItem('echo_firstName', name); }catch(e){}
  }

  function loadSavedName(){
    try{ return localStorage.getItem('echo_firstName'); }catch(e){return null}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const el = document.getElementById('userGreeting');
    if (!el) return;

    // Priority: URL param -> localStorage -> nothing
    let name = readNameFromQuery();
    if (name) name = firstWord(name);
    else name = loadSavedName();

    if (name) {
      setGreeting(name);
    } else {
      setGreeting(null);
    }

    // clicking greeting lets user set / update their first name
    el.style.cursor = 'pointer';
    el.setAttribute('aria-label', 'Click to set your first name');
    el.addEventListener('click', ()=>{
      const current = loadSavedName() || '';
      const answer = prompt('Enter your first name (will be saved locally):', current);
      if (!answer) return;
      const first = firstWord(answer);
      if (!first) return;
      saveName(first);
      setGreeting(first);
    });
  });
})();


// Telegram forwarding handlers for buttons
// Bot username is read from a meta tag (name="echo-bot") if present, otherwise falls back to the value below.
// To avoid committing your bot handle to the repo, set a meta tag at deploy time and omit the fallback.
(function(){
  const BOT = document.querySelector('meta[name="echo-bot"]')?.content || 'RiesIvan';

  function isMobile(){
    return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // base64url encode JSON (UTF-8 safe)
  function base64UrlEncode(obj){
    const json = JSON.stringify(obj);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  function forwardToTelegram(botUsername, payloadObj){
    if(!botUsername) return console.warn('Telegram bot username not configured');
    const payload = base64UrlEncode(payloadObj);
    const webUrl = `https://t.me/${botUsername}?start=${encodeURIComponent(payload)}`;
    const appUrl = `tg://resolve?domain=${botUsername}&start=${encodeURIComponent(payload)}`;

    // Prefer app on mobile; fallback to web if app isn't installed
    try{
      if(isMobile()){
        // Open app link first — browsers may block navigation so this is best effort
        window.location.href = appUrl;
        // Fallback to web link after a short delay
        setTimeout(()=> window.open(webUrl, '_blank', 'noopener'), 700);
      } else {
        window.open(webUrl, '_blank', 'noopener');
      }
    }catch(err){
      console.error('Failed to open Telegram link', err);
      window.open(webUrl, '_blank', 'noopener');
    }
  }

  // Attach handlers once DOM is ready. The site currently loads scripts with `defer`, so this will run early.
  function attachHandlers(){
    // Movie "More" buttons
    document.querySelectorAll('.btn.action[data-movie]').forEach(btn => {
      btn.addEventListener('click', () => {
        const movie = btn.dataset.movie || '';
        forwardToTelegram(BOT, {v:1, action:'more_movie', movie});
      });
    });

    // Trending music items
    document.querySelectorAll('.trend-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const song = btn.dataset.song || '';
        const artist = btn.dataset.artist || '';
        forwardToTelegram(BOT, {v:1, action:'play_trend', song, artist});
      });
    });

    // Music grid cards
    document.querySelectorAll('.music-card').forEach(card => {
      card.addEventListener('click', () => {
        const song = card.dataset.song || '';
        const artist = card.dataset.artist || '';
        forwardToTelegram(BOT, {v:1, action:'play_song', song, artist});
      });
    });

    // New Quote / Another
    document.getElementById('newQuote')?.addEventListener('click', () => {
      forwardToTelegram(BOT, {v:1, action:'random_quote'});
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', attachHandlers);
  } else {
    attachHandlers();
  }

  // Expose helper on window for debugging (optional)
  window.__echo_telegram = { forwardToTelegram, BOT };
})();
