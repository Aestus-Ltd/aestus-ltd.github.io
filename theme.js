(function(){
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let preference;try{preference=localStorage.getItem('aestus-theme')}catch{}
  function apply(theme){document.documentElement.dataset.theme=theme;document.querySelectorAll('.theme-toggle').forEach(b=>{const dark=theme==='dark';b.setAttribute('aria-pressed',String(dark));b.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');b.innerHTML=dark?'<span aria-hidden="true">☀</span><span>Light mode</span>':'<span aria-hidden="true">☾</span><span>Dark mode</span>'});}
  apply(preference|| (media.matches?'dark':'light'));
  document.addEventListener('DOMContentLoaded',()=>{const button=document.createElement('button');button.type='button';button.className='theme-toggle';document.querySelector('header')?.append(button);button.addEventListener('click',()=>{preference=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('aestus-theme',preference)}catch{}apply(preference)});apply(document.documentElement.dataset.theme)});
  media.addEventListener('change',e=>{if(!preference)apply(e.matches?'dark':'light')});
  window.addEventListener('storage',e=>{if(e.key==='aestus-theme'){preference=e.newValue;apply(preference||(media.matches?'dark':'light'))}});
})();
