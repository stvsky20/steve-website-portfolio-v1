const valley = `<div class="scenery"><div class="valley-frame"><img class="valley-image" src="assets/valley.png" alt="Painted alpine valley with blue mountains, a red farmhouse, wildflowers and a country road."><div class="drive" aria-hidden="true"><div class="car-sprite"><img src="assets/car.png" alt=""></div></div></div></div>`;
const motionButton = `<button class="motion-toggle" data-motion aria-label="Pause ambient motion" aria-pressed="false">Ⅱ</button>`;
const nav = (brand = 'Steven', subtitle = 'A small corner of the internet') => `<header class="hero-nav"><a class="brand" href="#stage">${brand}<span>${subtitle}</span></a><nav class="nav-links" aria-label="Main navigation"><a href="#work">Work</a><a href="#about">About</a>${motionButton}</nav></header>`;
const variants = [
  () => `<main class="hero sky" aria-label="Sky Letters hero">${valley}${nav()}<div class="sky-heading"><span class="eyebrow">Software engineer · Systems / Apps / UI / ML</span><h1>STEVEN</h1><div class="sky-actions"><a class="primary" href="#work">Explore my work <span aria-hidden="true">↗</span></a></div></div><div class="hero-foot"><a class="caption-chip" href="#work"><small>A project along the way</small>Ayos! — connecting people and LGUs ↗</a><span class="landscape-credit">A little curiosity goes a long way.</span></div></main>`,
  () => `<main class="hero journal" aria-label="Travel Journal hero">${valley}${nav('Steven', 'Notes from the journey')}<div class="journal-index">FIELD NOTES <span>01 / A beginning</span></div><div class="journal-paper"><div><h1>Hi, I’m Steven.</h1><div class="role">Software engineer</div></div><div class="intro-copy"><p>A little curiosity, a few ideas, and things worth building.</p><a class="small-link" href="#work">Currently featured: Ayos! ↗</a></div><a class="primary" href="#work">View my work <span aria-hidden="true">↗</span></a></div></main>`,
  () => `<main class="hero train" aria-label="Coastal Line hero"><div class="scenery"><div class="train-frame"><img class="train-image" src="assets/train-reference.png" alt="A green and cream coastal train at a quiet seaside railway crossing under a bright blue sky."></div></div>${nav('S / Portfolio', 'The coastal line')}<div class="station-sign"><div class="station-topline"><span><i class="route-dot" aria-hidden="true"></i>You are here</span><span>01 — Introduction</span></div><h1>STEVEN</h1><p class="station-role">Software engineer</p><div class="sign-bottom"><span>Next stop: things I’ve built</span><a href="#work">View work →</a></div></div><div class="train-location">Take the scenic route.</div><div class="train-ticket"><div><small>Featured destination</small><strong>Ayos!</strong></div><div><small>Community reporting</small><span>People ↔ Local government</span></div><a href="#work" aria-label="Explore Ayos project">↗</a></div></main>`
];
let manuallyPaused = false;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion() {
  document.body.classList.toggle('motion-paused', manuallyPaused || reducedMotion.matches);
  const button = document.querySelector('[data-motion]');
  if (!button) return;
  button.disabled = reducedMotion.matches;
  button.setAttribute('aria-pressed', String(manuallyPaused || reducedMotion.matches));
  button.setAttribute('aria-label', reducedMotion.matches ? 'Reduced motion enabled' : manuallyPaused ? 'Resume ambient motion' : 'Pause ambient motion');
  button.textContent = reducedMotion.matches ? '—' : manuallyPaused ? '▷' : 'Ⅱ';
  // The train study uses the supplied still artwork; don't imply its train is animated.
  button.hidden = Boolean(document.querySelector('.hero.train'));
}
new MutationObserver(syncMotion).observe(document.querySelector('#stage'), {childList:true});
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('click', event => {
  if (event.target.closest('[data-motion]')) { manuallyPaused = !manuallyPaused; syncMotion(); }
});
const projectDialog = document.querySelector('#project-dialog');
const projectOpener = document.querySelector('#project-open');
projectOpener.addEventListener('click', () => projectDialog.showModal());
document.querySelectorAll('.dialog-close,.dialog-done').forEach(button => button.addEventListener('click', () => projectDialog.close()));
projectDialog.addEventListener('close', () => projectOpener.focus());
