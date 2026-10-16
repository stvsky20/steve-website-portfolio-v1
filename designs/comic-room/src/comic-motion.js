import * as THREE from 'three';

// Drawn feedback stays aligned with the selected object while the camera moves.
export function createComicMotion(stage, camera, { reduced }) {
  const ns = 'http://www.w3.org/2000/svg';
  const overlay = document.createElementNS(ns, 'svg');
  overlay.classList.add('comic-motion');
  overlay.setAttribute('aria-hidden', 'true');
  const mark = document.createElementNS(ns, 'g');
  const travel = document.createElementNS(ns, 'g');
  for (let i = 0; i < 10; i++) {
    const a = i * Math.PI * 2 / 10;
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', 'M ' + Math.cos(a)*54 + ' ' + Math.sin(a)*38 + ' L ' + Math.cos(a)*77 + ' ' + Math.sin(a)*59);
    line.setAttribute('stroke', i % 3 === 0 ? '#20d5f5' : '#ffb531');
    line.setAttribute('stroke-width', i % 2 ? '3' : '5');
    mark.append(line);
  }
  // Lines live at the edges: the room and text retain a clear reading area.
  for (let i = 0; i < 28; i++) {
    const a = i * Math.PI * 2 / 28;
    const line = document.createElementNS(ns, 'path');
    const rx = 870, ry = 560;
    line.setAttribute('d', 'M ' + (800+Math.cos(a)*rx) + ' ' + (500+Math.sin(a)*ry) + ' L ' + (800+Math.cos(a)*rx*.73) + ' ' + (500+Math.sin(a)*ry*.73));
    line.setAttribute('stroke', ['#f3e7cf','#20d5f5','#f32b85'][i%3]);
    line.setAttribute('stroke-width', String(i%4 === 0 ? 7 : 3));
    travel.append(line);
  }
  mark.style.opacity = '0';
  travel.style.opacity = '0';
  overlay.append(travel,mark); stage.append(overlay);
  let selected = null, enabled = true, animation = null;
  const p = new THREE.Vector3();
  function clearTravel() { animation?.cancel(); animation = null; travel.style.opacity = '0'; }
  return {
    hover(object) { selected = object; },
    travel() {
      clearTravel(); selected = null;
      if (!enabled || reduced.matches) return;
      animation = travel.animate([
        {opacity:0,transform:'scale(.95)'},
        {opacity:.85,transform:'scale(1)',offset:.12},
        {opacity:0,transform:'scale(1.06)'}
      ], {duration:500,easing:'cubic-bezier(0.23, 1, 0.32, 1)'});
      animation.onfinish = () => { animation = null; };
    },
    clear() { selected = null; clearTravel(); },
    setEnabled(value) { enabled = value; if (!value) clearTravel(); },
    update() {
      overlay.setAttribute('viewBox', '0 0 1600 1000');
      if (!selected || !enabled || reduced.matches) { mark.style.opacity='0'; return; }
      selected.getWorldPosition(p).project(camera);
      if (p.z > 1) { mark.style.opacity='0'; return; }
      mark.setAttribute('transform','translate('+(p.x*.5+.5)*1600+' '+(-p.y*.5+.5)*1000+')');
      mark.style.opacity='.9';
    },
    get enabled() { return enabled; }
  };
}
