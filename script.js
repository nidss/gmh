(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const languageButton = document.querySelector('#language-toggle');
  const motionButton = document.querySelector('#motion-toggle');
  const dialog = document.querySelector('#hub-dialog');
  const dialogBody = document.querySelector('#dialog-body');
  const closeButton = document.querySelector('.dialog-close');
  const exploreButton = document.querySelector('#explore-toggle');
  const exploreList = document.querySelector('#explore-list');
  const world = document.querySelector('#world');
  const viewport = document.querySelector('#scene-viewport');
  const readPreference = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const writePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Optional storage. */ } };
  let language = readPreference('gmh-language') === 'en' ? 'en' : 'th';
  let paused = reducedMotion.matches || readPreference('gmh-motion') === 'paused';
  let returnFocus = null;
  let ocean = null;
  const translate = scope => scope.querySelectorAll('[data-th][data-en]').forEach(element => {
    element.textContent = element.dataset[language].replace(/\\n/g, '\n');
  });
  function motionLabels() {
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.querySelector('.motion-label').textContent = paused
      ? (language === 'th' ? 'เล่น motion' : 'Play motion')
      : (language === 'th' ? 'พัก motion' : 'Pause motion');
    motionButton.querySelector('.motion-icon').textContent = paused ? '▶' : 'Ⅱ';
  }
  function setLanguage(next) {
    language = next;
    root.lang = next;
    translate(document);
    languageButton.innerHTML = next.toUpperCase() + ' <span>/ ' + (next === 'th' ? 'EN' : 'TH') + '</span>';
    languageButton.setAttribute('aria-label', next === 'th' ? 'Switch language to English' : 'เปลี่ยนเป็นภาษาไทย');
    closeButton.setAttribute('aria-label', next === 'th' ? 'ปิดหน้าต่าง' : 'Close dialog');
    viewport.setAttribute('aria-label', next === 'th' ? 'ฉาก Go More Hub สามารถเลื่อนภาพเพื่อสำรวจได้' : 'Go More Hub scene. Scroll to explore.');
    document.querySelector('#explore').setAttribute('aria-label', next === 'th' ? 'เมนู Go More Hub' : 'Go More Hub menu');
    document.querySelector('.supplied-phone').setAttribute('aria-label', next === 'th' ? 'ติดต่อ Go More Hub' : 'Contact Go More Hub');
    document.querySelector('.supplied-frame').setAttribute('aria-label', next === 'th' ? 'Villadd — จองที่พักพูลวิลล่า' : 'Villadd — Pool villa booking');
    document.querySelector('.supplied-note').setAttribute('aria-label', next === 'th' ? 'เกี่ยวกับ Go More Hub' : 'About Go More Hub');
    document.querySelector('.supplied-figure').setAttribute('aria-label', next === 'th' ? 'ThaiMove — เร็ว ๆ นี้' : 'ThaiMove — Coming Soon');
    motionLabels();
    soundLabels();
    updateCues();
    writePreference('gmh-language', next);
  }
  function setMotion(value) {
    paused = value;
    root.classList.toggle('motion-paused', paused);
    root.style.setProperty('--scene-x', '0px');
    root.style.setProperty('--scene-y', '0px');
    motionLabels();
    ocean?.sync();
  }
  function closeExplore() {
    exploreButton.setAttribute('aria-expanded', 'false');
    exploreList.hidden = true;
  }
  function openPanel(name, trigger) {
    const template = document.querySelector('#panel-' + name);
    if (!(template instanceof HTMLTemplateElement)) return;
    closeExplore();
    if (!dialog.open) returnFocus = exploreList.contains(trigger) ? exploreButton : trigger;
    dialogBody.replaceChildren(template.content.cloneNode(true));
    dialogBody.querySelector('h2').id = 'dialog-title';
    translate(dialogBody);
    dialog.dataset.panel = name;
    dialog.scrollTop = 0;
    if (!dialog.open) dialog.showModal();
    closeButton.focus({ preventScroll:true });
    ocean?.sync();
  }
  languageButton.addEventListener('click', () => setLanguage(language === 'th' ? 'en' : 'th'));
  motionButton.addEventListener('click', () => {
    setMotion(!paused);
    writePreference('gmh-motion', paused ? 'paused' : 'playing');
  });
  reducedMotion.addEventListener('change', event => setMotion(event.matches || readPreference('gmh-motion') === 'paused'));
  exploreButton.addEventListener('click', () => {
    const opening = exploreList.hidden;
    exploreList.hidden = !opening;
    exploreButton.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('click', async event => {
    const trigger = event.target.closest('[data-open]');
    if (trigger) {
      const stop = camera.mode === 'pan' && exploreList.contains(trigger) && STOPS.find(item => item.panels.includes(trigger.dataset.open));
      if (stop && Math.abs(centreOf(stop) - viewport.scrollLeft) > viewport.clientWidth * .25) {
        closeExplore();
        glide(centreOf(stop), 650).then(() => openPanel(trigger.dataset.open, trigger));
      } else openPanel(trigger.dataset.open, trigger);
      return;
    }
    if (!event.target.closest('#explore')) closeExplore();
    const copy = event.target.closest('[data-copy]');
    if (copy) {
      const status = dialogBody.querySelector('.copy-status');
      try {
        await navigator.clipboard.writeText(copy.dataset.copy);
        status.textContent = language === 'th' ? 'คัดลอกอีเมลแล้ว' : 'Email copied.';
      } catch {
        status.textContent = language === 'th' ? 'อีเมล: support@villadd.com' : 'Email: support@villadd.com';
      }
    }
    if (event.target.closest('#another-idea')) nextIdea();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !exploreList.hidden) {
      closeExplore();
      exploreButton.focus();
    }
  });
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    returnFocus?.focus({ preventScroll:true });
    ocean?.sync();
  });
  const ideas = [
    ['พักสักนิด แล้วออกไปค้นพบที่ใหม่ ๆ', 'Take a breather. Find a new place.'],
    ['เริ่มจากก้าวเล็ก ๆ แล้วขยับไปอีกนิด', 'Start with a small step. Keep moving.'],
    ['ชวนคนที่คุณรัก ไปใช้เวลาดี ๆ ด้วยกัน', 'Make time for good moments together.']
  ];
  let ideaIndex = 0;
  function nextIdea() {
    const target = dialogBody.querySelector('.idea-message');
    if (!target) return;
    const idea = ideas[ideaIndex++ % ideas.length];
    target.dataset.th = idea[0];
    target.dataset.en = idea[1];
    target.textContent = idea[language === 'th' ? 0 : 1];
  }
  // Camera: every screen sees the same world. Wide screens fit all four objects; tall or narrow screens pan along the desk.
  const SCENE_W = 2926, SCENE_H = 1081;
  // Object bounds on the native canvas (from the measured positions in styles.css), with a small margin.
  const SAFE = { x0:.245, x1:.83, y0:.33, y1:.98 };
  // The supplied outpaint continues the scene 520px above and 200px below the original panorama.
  const EXTEND_TOP = 520 / SCENE_H, EXTEND_BOTTOM = 200 / SCENE_H;
  const NOTE_H = .1386 * SCENE_H;
  const STOPS = [
    { x:.325, label:'About · Contact', panels:['about', 'contact'] },
    { x:.502, label:'ThaiMove', panels:['thaimove'] },
    { x:.753, label:'Villadd', panels:['villadd'] }
  ];
  const header = document.querySelector('.site-header');
  const cues = [document.querySelector('.edge-prev'), document.querySelector('.edge-next')];
  const stopMarkers = STOPS.map(() => {
    const marker = document.createElement('span');
    marker.className = 'scene-stop';
    marker.setAttribute('aria-hidden', 'true');
    viewport.append(marker);
    return marker;
  });
  const camera = { mode:'', width:0 };
  let tween = 0, tourTimer = 0, cueFrame = 0;
  // Keep a range centred on the safe zone, covering the screen where possible, but never hide an object under the controls.
  function place(size, view, low, high, start, end, before = 0, after = 0) {
    let position = (low + high) / 2 - (start + end) / 2 * size;
    position = size >= view ? Math.min(0, Math.max(view - size, position)) : (view - size) / 2;
    // Where the panorama is shorter than the screen, the outpaint strips (before / after, in panorama heights) cover the rest.
    const first = before * size, last = (1 + after) * size;
    if (size < view) position = first + last >= view ? Math.min(first, Math.max(view - last, position)) : (view - last + first) / 2;
    return Math.max(low - start * size, Math.min(high - end * size, position));
  }
  const centreOf = stop => stop.x * camera.width - viewport.clientWidth / 2;
  function fitScene() {
    root.classList.add('camera-ready');
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const focus = camera.mode === 'pan' ? (viewport.scrollLeft + vw / 2) / camera.width : STOPS[1].x;
    const top = header.getBoundingClientRect().bottom + 10;
    const bottom = 8;
    const availableH = Math.max(120, vh - top - bottom);
    const safeW = (SAFE.x1 - SAFE.x0) * SCENE_W, safeH = (SAFE.y1 - SAFE.y0) * SCENE_H;
    const fitScale = Math.min((vw - 32) / safeW, availableH / safeH, Math.max(vw / SCENE_W, vh / SCENE_H));
    // Fit only while the smallest note stays easy to tap and the scene fills most of the screen height.
    const mode = fitScale * NOTE_H >= 46 && fitScale * SCENE_H >= vh * .55 ? 'fit' : 'pan';
    let scale = fitScale;
    if (mode === 'pan') {
      const share = Math.min(.8, Math.max(.45, vw / 1000));
      scale = Math.max(fitScale, Math.min(vw / (share * safeW), availableH / SCENE_H), vh / (SCENE_H * (1 + EXTEND_TOP + EXTEND_BOTTOM)));
    }
    const width = Math.round(SCENE_W * scale), height = Math.round(SCENE_H * scale);
    const x = mode === 'fit' ? place(width, vw, 16, vw - 16, SAFE.x0, SAFE.x1) : Math.max(0, (vw - width) / 2);
    const y = place(height, vh, top, vh - bottom, SAFE.y0, SAFE.y1, EXTEND_TOP, EXTEND_BOTTOM);
    root.style.setProperty('--world-w', width + 'px');
    root.style.setProperty('--world-x', Math.round(x) + 'px');
    root.style.setProperty('--world-y', Math.round(y) + 'px');
    root.style.setProperty('--cue-y', Math.round(y + height * .2) + 'px');
    root.classList.toggle('scene-fit', mode === 'fit');
    root.classList.toggle('scene-pan', mode === 'pan');
    camera.mode = mode;
    camera.width = width;
    stopMarkers.forEach((marker, index) => { marker.style.left = Math.round(x + STOPS[index].x * width) + 'px'; });
    if (mode === 'pan') viewport.scrollLeft = focus * width - vw / 2;
    updateCues();
    ocean?.resize();
  }
  // Point to the nearest object off each side of the screen, so people know there is more desk to explore.
  function updateCues() {
    cueFrame = 0;
    const vw = viewport.clientWidth;
    const onScreen = stop => stop.x * camera.width - viewport.scrollLeft;
    const panning = camera.mode === 'pan' && camera.width > vw + 1;
    const targets = panning ? [
      STOPS.filter(stop => onScreen(stop) < vw * .1).pop(),
      STOPS.find(stop => onScreen(stop) > vw * .9)
    ] : [];
    cues.forEach((cue, index) => {
      const stop = targets[index];
      cue.classList.toggle('is-visible', Boolean(stop));
      if (!stop) return;
      cue.dataset.stop = String(STOPS.indexOf(stop));
      cue.querySelector('.edge-label').textContent = stop.label;
      cue.setAttribute('aria-label', (language === 'th' ? 'เลื่อนไปที่ ' : 'Go to ') + stop.label);
    });
  }
  function stopGlide() {
    cancelAnimationFrame(tween);
    clearTimeout(tourTimer);
    root.classList.remove('camera-moving');
  }
  function glide(target, duration) {
    stopGlide();
    const from = viewport.scrollLeft;
    const to = Math.max(0, Math.min(camera.width - viewport.clientWidth, target));
    if (paused || reducedMotion.matches || Math.abs(to - from) < 2) {
      viewport.scrollLeft = to;
      return Promise.resolve();
    }
    // Snapping would fight the animated scroll, so it is switched off until the camera arrives.
    root.classList.add('camera-moving');
    return new Promise(resolve => {
      const start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start) / duration);
        viewport.scrollLeft = from + (to - from) * (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        if (t < 1) tween = requestAnimationFrame(step);
        else { root.classList.remove('camera-moving'); resolve(); }
      };
      tween = requestAnimationFrame(step);
    });
  }
  // On the first visit of a session, sweep once along the desk so every object is seen.
  function tour() {
    let seen = false;
    try { seen = sessionStorage.getItem('gmh-tour') === '1'; sessionStorage.setItem('gmh-tour', '1'); } catch { /* Optional storage. */ }
    if (seen || camera.mode !== 'pan' || paused || reducedMotion.matches || dialog.open) return;
    glide(centreOf(STOPS[0]), 650)
      .then(() => glide(centreOf(STOPS[2]), 1500))
      .then(() => glide(centreOf(STOPS[1]), 850));
  }
  // Ambient beach sound: off until the visitor turns it on. Web Audio keeps the loop gapless and fades it in and out.
  const soundButton = document.querySelector('#sound-toggle');
  const SOUND_VOLUME = .55;
  let soundOn = readPreference('gmh-sound') === 'on';
  let audio = null;
  function soundLabels() {
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', language === 'th' ? 'เสียงบรรยากาศ' : 'Ambient sound');
    soundButton.title = soundOn ? (language === 'th' ? 'ปิดเสียง' : 'Mute sound') : (language === 'th' ? 'เปิดเสียง' : 'Play sound');
  }
  function createAudio() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    const context = new Context();
    const gain = context.createGain();
    gain.gain.value = 0;
    gain.connect(context.destination);
    const ready = fetch('assets/windy-beach.mp3')
      .then(response => { if (!response.ok) throw new Error('Sound unavailable'); return response.arrayBuffer(); })
      .then(data => new Promise((resolve, reject) => context.decodeAudioData(data, resolve, reject)))
      .then(buffer => {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        source.start();
      });
    return { context, gain, ready };
  }
  function syncSound() {
    if (!audio) return;
    const audible = soundOn && !document.hidden;
    const level = audio.gain.gain, now = audio.context.currentTime;
    level.cancelScheduledValues(now);
    level.setValueAtTime(level.value, now);
    level.linearRampToValueAtTime(audible ? SOUND_VOLUME : 0, now + (audible ? 1.6 : .4));
    if (audible) audio.context.resume();
    else setTimeout(() => { if (audio && !(soundOn && !document.hidden)) audio.context.suspend(); }, 450);
  }
  function setSound(value) {
    soundOn = value;
    // The audio context must be created inside the visitor's gesture for browsers to allow playback.
    if (soundOn && !audio) {
      audio = createAudio();
      audio?.ready.catch(() => { audio = null; soundOn = false; soundLabels(); });
      if (!audio) soundOn = false;
    }
    soundLabels();
    syncSound();
  }
  // Browsers block sound until a gesture, so a saved "on" preference starts on the first tap, click or key press.
  const resumeEvents = ['click', 'keydown', 'touchend'];
  function resumeSound(event) {
    resumeEvents.forEach(type => document.removeEventListener(type, resumeSound, true));
    if (soundOn && !audio && !soundButton.contains(event.target)) setSound(true);
  }
  if (soundOn) resumeEvents.forEach(type => document.addEventListener(type, resumeSound, true));
  soundButton.addEventListener('click', () => {
    setSound(!soundOn);
    writePreference('gmh-sound', soundOn ? 'on' : 'off');
  });
  document.addEventListener('visibilitychange', syncSound);
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(type => viewport.addEventListener(type, stopGlide, { passive:true }));
  viewport.addEventListener('scroll', () => { if (!cueFrame) cueFrame = requestAnimationFrame(updateCues); }, { passive:true });
  cues.forEach(cue => cue.addEventListener('click', () => glide(centreOf(STOPS[Number(cue.dataset.stop)]), 700)));
  window.addEventListener('resize', fitScene, { passive:true });
  document.addEventListener('visibilitychange', () => ocean?.sync());
  document.querySelector('#year').textContent = new Date().getFullYear();
  setLanguage(language);
  setMotion(paused);
  fitScene();
  const startTour = () => setTimeout(tour, 500);
  const backdrop = document.querySelector('#world-background');
  if (backdrop.complete) startTour(); else backdrop.addEventListener('load', startTour, { once:true });

  // On phones the dialog is a paper sheet; pull it down from the top to close it.
  const sheetLayout = matchMedia('(max-width:700px)');
  let drag = null;
  dialog.addEventListener('touchstart', event => {
    drag = sheetLayout.matches && dialog.scrollTop <= 0 && event.touches.length === 1 ? { y:event.touches[0].clientY, distance:0 } : null;
  }, { passive:true });
  dialog.addEventListener('touchmove', event => {
    if (!drag) return;
    drag.distance = Math.max(0, event.touches[0].clientY - drag.y);
    if (drag.distance > 0 && dialog.scrollTop <= 0) {
      event.preventDefault();
      dialog.style.transform = 'translateY(' + drag.distance + 'px)';
    }
  }, { passive:false });
  dialog.addEventListener('touchend', () => {
    if (!drag) return;
    const dismiss = drag.distance > 90;
    drag = null;
    dialog.style.transition = 'transform .22s ease';
    dialog.style.transform = dismiss ? 'translateY(100%)' : '';
    setTimeout(() => {
      dialog.style.transition = '';
      if (dismiss) { dialog.close(); dialog.style.transform = ''; }
    }, 230);
  });

  // Animate only the water in the supplied background; the beach and window stay sharp.
  const image = document.querySelector('#world-background');
  const canvas = document.querySelector('#sea-canvas');
  function initializeOcean() {
    let render;
    const gl = canvas.getContext('webgl', { alpha:false, antialias:false, depth:false, preserveDrawingBuffer:false });
    if (gl) {
      const vertexSource = 'attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=(a_position+1.0)*0.5;gl_Position=vec4(a_position,0.0,1.0);}';
      const fragmentSource = [
        'precision mediump float; varying vec2 v_uv; uniform sampler2D u_image; uniform float u_time;',
        'void main(){',
        'vec2 p=vec2(v_uv.x,1.0-v_uv.y);',
        'float edge=mix(0.535,0.704,clamp((p.x-0.368)/0.354,0.0,1.0));',
        'float left=mix(0.479,0.361,clamp((p.y-0.415)/0.17,0.0,1.0)); float mask=smoothstep(left,left+0.012,p.x)*(1.0-smoothstep(0.714,0.724,p.x))*smoothstep(0.408,0.425,p.y)*(1.0-smoothstep(edge-0.025,edge,p.y));',
        'vec2 offset=vec2(sin(p.y*210.0+u_time*0.7)+sin(p.x*120.0-u_time*0.45),sin(p.x*100.0+u_time*0.8))*vec2(0.00092,0.0011)*mask;',
        'vec3 color=texture2D(u_image,vec2(p.x+offset.x,1.0-p.y-offset.y)).rgb;',
        'float ripple=pow(max(0.0,sin(p.y*520.0+sin(p.x*85.0-u_time*0.6)*1.4-u_time*1.1)),10.0);',
        'float sparkle=pow(max(0.0,sin(p.x*710.0+u_time*0.5)),5.0);',
        'float reflection=exp(-pow((p.x-0.692)/0.034,2.0));',
        'color+=vec3(0.055,0.045,0.026)*ripple*sparkle*reflection*mask;',
        'gl_FragColor=vec4(color,1.0);}'
      ].join('\n');
      const compile = (type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Ocean shader unavailable');
        return shader;
      };
      try {
        const program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Ocean renderer unavailable');
        gl.useProgram(program);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
        const timeUniform = gl.getUniformLocation(program, 'u_time');
        render = time => {
          gl.viewport(0,0,canvas.width,canvas.height);
          gl.uniform1f(timeUniform, time);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        };
        canvas.dataset.engine = 'webgl';
      } catch {
        // The illustration remains visible if this device cannot compile the shader.
        canvas.dataset.engine = 'static';
        return;
      }
      canvas.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        canvas.classList.remove('ready');
        canvas.dataset.state = 'unavailable';
        cancelAnimationFrame(frame);
      });
      canvas.addEventListener('webglcontextrestored', () => location.reload());
    } else {
      const context = canvas.getContext('2d', { alpha:false });
      if (!context) return;
      render = time => {
        const w = canvas.width, h = canvas.height;
        context.drawImage(image,0,0,w,h);
        context.save();
        context.beginPath();
        context.moveTo(w*.479,h*.415);
        context.lineTo(w*.718,h*.415);
        context.lineTo(w*.718,h*.689);
        context.lineTo(w*.374,h*.535);
        context.lineTo(w*.446,h*.47);
        context.closePath();
        context.clip();
        const sourceW = image.naturalWidth, sourceH = image.naturalHeight;
        for (let y=.415; y<.704; y+=.003) {
          const fade = Math.sin(Math.min(1,(y-.415)/.289)*Math.PI);
          const shift = Math.sin(y*210+time*.7)*w*.00085*fade;
          context.drawImage(image,0,y*sourceH,sourceW,.003*sourceH,shift,y*h,w,.003*h+1);
        }
        context.restore();
      };
      canvas.dataset.engine = 'canvas2d';
    }
    let frame = 0, time = 0, last = 0, drawing = 0;
    function tick(now) {
      if (last) time += Math.min(now-last,100)/1000;
      last = now;
      if (now-drawing > 40) { render(time); drawing = now; }
      frame = requestAnimationFrame(tick);
    }
    ocean = {
      resize() {
        canvas.width = Math.round(Math.min(2926,Math.max(900,world.clientWidth * Math.min(devicePixelRatio,1.5))));
        canvas.height = Math.round(canvas.width * image.naturalHeight / image.naturalWidth);
        render(time);
      },
      sync() {
        cancelAnimationFrame(frame);
        last = 0;
        const running = !paused && !reducedMotion.matches && !document.hidden && !dialog.open;
        canvas.dataset.state = running ? 'running' : 'paused';
        if (running) frame = requestAnimationFrame(tick);
      }
    };
    ocean.resize();
    canvas.classList.add('ready');
    ocean.sync();
  }
  if (image.complete && image.naturalWidth) initializeOcean();
  else image.addEventListener('load', initializeOcean, { once:true });
})();