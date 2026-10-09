(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const languageButton = document.querySelector('.language');
  const motionButton = document.querySelector('#motion-toggle');
  const hero = document.querySelector('.hero');
  const progress = document.querySelector('.scroll-progress');
  let language = 'th';
  let paused = reducedMotion.matches;
  const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const writePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } };
  if (readPreference('gmh-language') === 'en') language = 'en';
  if (readPreference('gmh-motion') === 'paused') paused = true;

  function setLanguage(next) {
    language = next;
    root.lang = next;
    document.body.dataset.lang = next;
    document.querySelectorAll('[data-th][data-en]').forEach(element => {
      element.textContent = element.dataset[next].replace(/\\n/g, '\n');
    });
    languageButton.replaceChildren();
    languageButton.append(document.createTextNode(next.toUpperCase() + ' '));
    const other = document.createElement('span');
    other.textContent = '/ ' + (next === 'th' ? 'EN' : 'TH');
    languageButton.append(other);
    languageButton.setAttribute('aria-label', next === 'th' ? 'Switch language to English' : 'เปลี่ยนเป็นภาษาไทย');
    motionButton.textContent = paused ? (next === 'th' ? 'เล่น motion' : 'Play motion') : (next === 'th' ? 'พัก motion' : 'Pause motion');
    document.querySelector('nav').setAttribute('aria-label', next === 'th' ? 'เมนูหลัก' : 'Main navigation');
    writePreference('gmh-language', next);
  }
  function setMotion(value) {
    paused = value;
    root.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? (language === 'th' ? 'เล่น motion' : 'Play motion') : (language === 'th' ? 'พัก motion' : 'Pause motion');
    if (paused) { root.style.setProperty('--pointer-x', '0px'); root.style.setProperty('--pointer-y', '0px'); }
  }
  languageButton.addEventListener('click', () => setLanguage(language === 'th' ? 'en' : 'th'));
  motionButton.addEventListener('click', () => { setMotion(!paused); writePreference('gmh-motion', paused ? 'paused' : 'playing'); });
  reducedMotion.addEventListener('change', event => setMotion(event.matches || readPreference('gmh-motion') === 'paused'));
  setLanguage(language);
  setMotion(paused);
  document.querySelector('#year').textContent = String(new Date().getFullYear());

  // Original kinetic brand artwork: sixteen rounded rays around a directional mark.
  const rays = document.querySelector('#sun-rays');
  for (let i = 0; i < 16; i++) {
    const ray = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    for (const [key, value] of Object.entries({x:137,y:15,width:26,height:96,rx:3,transform:`rotate(${i * 22.5} 150 150)`})) ray.setAttribute(key, value);
    rays.append(ray);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, {threshold:0.08});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    root.classList.add('js');
  }
  let ticking = false;
  function updateProgress() {
    const length = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${length > 0 ? Math.min(1, window.scrollY / length) : 0})`;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; } }, {passive:true});
  window.addEventListener('resize', updateProgress, {passive:true});
  updateProgress();
  hero.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    root.style.setProperty('--pointer-x', `${(event.clientX - bounds.left - bounds.width / 2) * 0.025}px`);
    root.style.setProperty('--pointer-y', `${(event.clientY - bounds.top - bounds.height / 2) * 0.025}px`);
  }, {passive:true});
  hero.addEventListener('pointerleave', () => { root.style.setProperty('--pointer-x', '0px'); root.style.setProperty('--pointer-y', '0px'); });
})();
