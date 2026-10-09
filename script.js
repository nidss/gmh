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
    document.querySelector('#explore').setAttribute('aria-label', next === 'th' ? 'เมนูสำรวจ Go More Hub' : 'Explore Go More Hub');
    document.querySelector('.villa-card').setAttribute('aria-label', next === 'th' ? 'สำรวจ Villadd' : 'Explore Villadd');
    document.querySelector('.move-card').setAttribute('aria-label', next === 'th' ? 'สำรวจ ThaiMove — Coming Soon' : 'Explore ThaiMove — Coming Soon');
    motionLabels();
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
    if (!dialog.open) returnFocus = trigger;
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
    if (trigger) { openPanel(trigger.dataset.open, trigger); return; }
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
  world.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches || event.pointerType !== 'mouse') return;
    const bounds = world.getBoundingClientRect();
    root.style.setProperty('--scene-x', ((event.clientX - bounds.left) / bounds.width - .5) * 3 + 'px');
    root.style.setProperty('--scene-y', ((event.clientY - bounds.top) / bounds.height - .5) * 3 + 'px');
  }, { passive:true });
  world.addEventListener('pointerleave', () => {
    root.style.setProperty('--scene-x', '0px');
    root.style.setProperty('--scene-y', '0px');
  });
  let wasMobile = false;
  function fitScene() {
    const mobile = matchMedia('(max-width:700px)').matches;
    if (mobile && !wasMobile) viewport.scrollLeft = (world.clientWidth - viewport.clientWidth) / 2;
    wasMobile = mobile;
    ocean?.resize();
  }
  window.addEventListener('resize', fitScene, { passive:true });
  document.addEventListener('visibilitychange', () => ocean?.sync());
  document.querySelector('#year').textContent = new Date().getFullYear();
  setLanguage(language);
  setMotion(paused);
  fitScene();

  // Animate only the water in the original illustration; the beach and window stay sharp.
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
        'float edge=mix(0.535,0.455,clamp((p.x-0.25)/0.45,0.0,1.0));',
        'float mask=smoothstep(0.228,0.25,p.x)*(1.0-smoothstep(0.68,0.72,p.x))*smoothstep(0.361,0.383,p.y)*(1.0-smoothstep(edge-0.026,edge,p.y));',
        'vec2 offset=vec2(sin(p.y*210.0+u_time*0.7)+sin(p.x*120.0-u_time*0.45),sin(p.x*100.0+u_time*0.8))*vec2(0.0012,0.0009)*mask;',
        'vec3 color=texture2D(u_image,vec2(p.x+offset.x,1.0-p.y-offset.y)).rgb;',
        'float ripple=pow(max(0.0,sin(p.y*520.0+sin(p.x*85.0-u_time*0.6)*1.4-u_time*1.1)),10.0);',
        'float sparkle=pow(max(0.0,sin(p.x*710.0+u_time*0.5)),5.0);',
        'float reflection=exp(-pow((p.x-0.315)/0.055,2.0));',
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
        context.moveTo(w*.245,h*.365);
        context.lineTo(w*.70,h*.365);
        context.lineTo(w*.68,h*.456);
        context.lineTo(w*.25,h*.532);
        context.closePath();
        context.clip();
        const sourceW = image.naturalWidth, sourceH = image.naturalHeight;
        for (let y=.365; y<.535; y+=.003) {
          const fade = Math.sin(Math.min(1,(y-.365)/.17)*Math.PI);
          const shift = Math.sin(y*210+time*.7)*w*.0013*fade;
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
        canvas.width = Math.round(Math.min(1500,Math.max(900,world.clientWidth * Math.min(devicePixelRatio,1.5))));
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