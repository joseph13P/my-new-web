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
