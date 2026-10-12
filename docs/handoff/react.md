# Handoff: React (Vite + TypeScript)

อ่าน [README.md](README.md) ในโฟลเดอร์นี้ก่อน ไฟล์นั้นอธิบายพฤติกรรมที่ต้องคงไว้ โครง component และ checklist ตรวจรับ ไฟล์นี้อธิบายเฉพาะวิธีทำใน React SPA ที่ build ด้วย Vite

ผลลัพธ์ที่ได้คือไฟล์ static ใน `dist/` ที่ deploy ขึ้น GitHub Pages ได้เหมือนเดิม

---

## 1. เริ่มโปรเจกต์

```sh
npm create vite@latest gmh-web -- --template react-ts
cd gmh-web
npm install
```

ไม่ต้องใช้ library อื่นสำหรับฟีเจอร์ที่มีตอนนี้ ถ้าอยากใช้ i18n library ให้ดูหัวข้อ 5

### `vite.config.ts`

ถ้ายัง deploy ที่ `https://nidss.github.io/gmh/` ต้องตั้ง `base` เป็น `/gmh/`

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/gmh/', // ใช้ '/' ถ้าย้ายไปโดเมนของตัวเอง
});
```

เมื่อตั้ง `base` แล้ว ให้อ้างไฟล์ใน `public/` ด้วย `import.meta.env.BASE_URL` เช่น

```ts
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
// <img src={asset('desk-panorama.webp')} />
```

---

## 2. โครงไฟล์

```
gmh-web/
├─ index.html                  meta, ฟอนต์, สคริปต์ใส่ class "js", <noscript>
├─ public/assets/              ไฟล์ "In use" 26 ไฟล์จาก ASSETS.md
├─ src/
│  ├─ main.tsx                 import './styles/global.css' + render <App/>
│  ├─ App.tsx
│  ├─ styles/global.css        styles.css เดิม ก๊อปมาทั้งไฟล์ (ขั้นแรก)
│  ├─ i18n/
│  │  ├─ th.ts, en.ts          ข้อความทั้งหมด (ดึงจาก data-th / data-en)
│  │  └─ I18nProvider.tsx
│  ├─ state/
│  │  ├─ PreferencesProvider.tsx   language, paused, soundOn + localStorage
│  │  └─ DialogProvider.tsx        openPanel(name, trigger), current panel
│  ├─ scene/
│  │  ├─ camera.ts             computeCamera() + place() (pure, มี unit test)
│  │  ├─ useSceneCamera.ts
│  │  ├─ Scene.tsx, World.tsx, SceneObject.tsx, PhotoString.tsx, EdgeCue.tsx
│  │  └─ layout.ts             STOPS, SAFE, รายการวัตถุและรูปบนราว
│  ├─ effects/
│  │  ├─ ocean.ts              initializeOcean() เดิม + destroy()
│  │  ├─ dust.ts               createDust() เดิม + destroy()
│  │  ├─ useOcean.ts, useDust.ts
│  │  └─ useAmbientSound.ts
│  ├─ header/                  SiteHeader, ExploreMenu, MotionToggle, SoundToggle, LanguageToggle, icons.tsx
│  └─ dialog/
│     ├─ HubDialog.tsx
│     ├─ ShowreelVideo.tsx
│     └─ panels/               AboutPanel, ContactPanel, VilladdPanel, ThaiMovePanel, SocialPanel
└─ tests/                      Vitest (camera.ts) + Playwright (e2e)
```

---

## 3. `index.html`

ย้าย `<head>` เดิมมาเกือบทั้งหมด ส่วนที่ต้องมีคือ

- **meta:** title, description, og:\*, twitter:card, canonical, theme-color
- **favicon:** `assets/gomorehub-logo.png`
- **ฟอนต์:** `<link>` Google Fonts ตัวเดิม
- **สคริปต์ inline:** `<script>document.documentElement.classList.add('js')</script>` เพื่อให้ CSS รู้ว่ามี JS ก่อน React โหลดเสร็จ
- **ป้องกันภาษากะพริบ:** เพิ่มสคริปต์ inline ที่ตั้ง `lang` ก่อน render

```html
<script>
  try {
    var l = localStorage.getItem('gmh-language');
    document.documentElement.lang = l === 'en' ? 'en' : 'th';
    if (localStorage.getItem('gmh-motion') === 'paused') document.documentElement.classList.add('motion-paused');
  } catch (e) {}
</script>
```

- **`<noscript>`:** เก็บข้อความเดิมที่แสดงข้อมูลติดต่อไว้ เพราะ SPA ไม่มี HTML ของฉากถ้าไม่มี JS

---

## 4. State กลาง

### `PreferencesProvider`

```tsx
type Prefs = { language: 'th' | 'en'; paused: boolean; soundOn: boolean };

const read = (key: string) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* optional */ } };

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [language, setLanguage] = useState<'th' | 'en'>(() => (read('gmh-language') === 'en' ? 'en' : 'th'));
  const [userPaused, setUserPaused] = useState(() => read('gmh-motion') === 'paused');
  const [soundOn, setSoundOn] = useState(() => read('gmh-sound') === 'on');
  const paused = reduced || userPaused;

  useEffect(() => { document.documentElement.lang = language; write('gmh-language', language); }, [language]);
  useEffect(() => { document.documentElement.classList.toggle('motion-paused', paused); }, [paused]);
  // ...ส่ง togglePaused() ที่เขียน 'gmh-motion' และ toggleSound() ที่เขียน 'gmh-sound'
}
```

### `DialogProvider`

- **ค่าที่เก็บ:** `panel: PanelName | null` และ `returnFocus` (ref ของปุ่มที่เปิด)
- **`openPanel(name, trigger)`:**
  - ปิดเมนู
  - ถ้ากล้องอยู่ในโหมด pan และเปิดจากเมนู ให้ `glide()` ไปยัง STOP ของ panel นั้นก่อน (ดู `script.js` บรรทัด 92–101)
  - ตั้ง `panel` ให้ dialog เปิด

---

## 5. ภาษา (i18n)

มี 2 ทางให้เลือก

1. **Context เล็ก ๆ ของเราเอง** (แนะนำ เพราะมีแค่ 2 ภาษาและหน้าเดียว)

   ```ts
   // i18n/th.ts
   export const th = {
     menu: 'เมนู',
     motion: { pause: 'พัก motion', play: 'เล่น motion' },
     aria: { scene: 'ฉาก Go More Hub สามารถเลื่อนภาพเพื่อสำรวจได้', close: 'ปิดหน้าต่าง', /* ... */ },
     panels: { contact: { address: '666/66 หมู่ที่ 5 ตำบลนาเกลือ อำเภอบางละมุง จังหวัดชลบุรี 20150', /* ... */ } },
   } as const;
   ```

   ใช้ `const t = useT(); t.menu` และให้ type ของ `en` เป็น `typeof th` เพื่อให้ compiler ฟ้องเมื่อข้อความหาย
2. **`react-i18next`:** ถ้าทีมใช้อยู่แล้ว ก็แค่ย้ายข้อความเข้าไฟล์ JSON

**ไล่หาข้อความ:**

- `grep -o 'data-th="[^"]*"' index.html` และ `data-en` ให้ครบทุกตัว
- `aria-label` ใน `setLanguage()`, `motionLabels()`, `soundLabels()` และ `updateCues()`
- ข้อความหลังคัดลอกอีเมล
- ข้อความที่มี `\n` ให้แสดงด้วย CSS `white-space: pre-line` ซึ่ง `.dialog-lead` ตั้งไว้แล้ว

---

## 6. ฉากและกล้อง

### `scene/camera.ts` (pure function)

ก๊อป `place()` และส่วนคำนวณของ `fitScene()` มาจาก `script.js` (บรรทัด 147–198) ตรง ๆ แต่แยกการอ่านและเขียน DOM ออก

```ts
export const SCENE_W = 2926, SCENE_H = 1081;
export const SAFE = { x0: .245, x1: .83, y0: 0, y1: .98 };
export const EXTEND_TOP = 520 / SCENE_H, EXTEND_BOTTOM = 200 / SCENE_H;
export const NOTE_H = .1386 * SCENE_H;

export type Camera = { mode: 'fit' | 'pan'; width: number; height: number; x: number; y: number; cueY: number };

export function computeCamera(vw: number, vh: number, headerBottom: number): Camera {
  const top = headerBottom + 10, bottom = 8;
  // ...โค้ดเดิมบรรทัด 186–198 ไม่ต้องแก้สูตร
  return { mode, width, height, x, y, cueY: Math.round(y + height * .53) };
}
```

เขียน unit test ด้วย Vitest อย่างน้อยกรณีเหล่านี้: ที่ 1920×1080 ได้ `fit`, ที่ 390×844 ได้ `pan`, และ `y` ของฉากต้องไม่ทับ header

### `useSceneCamera`

```ts
export function useSceneCamera(viewportRef: RefObject<HTMLDivElement>, headerRef: RefObject<HTMLElement>) {
  const [camera, setCamera] = useState<Camera | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  useLayoutEffect(() => {
    const viewport = viewportRef.current!, header = headerRef.current!;
    const update = () => {
      const prev = cameraRef.current;
      const focus = prev?.mode === 'pan' ? (viewport.scrollLeft + viewport.clientWidth / 2) / prev.width : STOPS[1].x;
      const next = computeCamera(viewport.clientWidth, viewport.clientHeight, header.getBoundingClientRect().bottom);
      const root = document.documentElement.style;
      root.setProperty('--world-w', next.width + 'px');
      // --world-x, --world-y, --cue-y ...
      document.documentElement.classList.add('camera-ready');
      document.documentElement.classList.toggle('scene-fit', next.mode === 'fit');
      document.documentElement.classList.toggle('scene-pan', next.mode === 'pan');
      if (next.mode === 'pan') viewport.scrollLeft = focus * next.width - viewport.clientWidth / 2;
      cameraRef.current = next; setCamera(next);
    };
    update();
    const observer = new ResizeObserver(update); // ดีกว่า window resize เพราะจับความสูงของ header ที่เปลี่ยนได้ด้วย
    observer.observe(viewport); observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return camera;
}
```

- **เขียน CSS variable ตรง ๆ:** ไม่ต้องผ่าน React state ทุกเฟรม เพราะ CSS เดิมอ่านจาก `<html>` อยู่แล้ว
- **`glide()`, `tour()`, `updateCues()`:** port มาเป็นฟังก์ชันใน hook เดียวกัน ทุกฟังก์ชันใช้ `requestAnimationFrame` และต้อง `cancelAnimationFrame` ใน cleanup
- **การหยุดกล้อง:** เมื่อผู้ใช้ `pointerdown`, `wheel`, `touchstart` หรือ `keydown` บน viewport ให้หยุดการ glide (บรรทัด 330)

### ข้อมูลวัตถุ

ให้ข้อมูลเป็นตัวขับ JSX ส่วนตำแหน่งยังอยู่ใน CSS เดิม

```ts
export const SCENE_OBJECTS = [
  { className: 'supplied-note', panel: 'about', image: 'desk-about.webp', w: 1000, h: 1000 },
  { className: 'supplied-phone', panel: 'contact', image: 'desk-phone.webp', w: 2000, h: 2000 },
  { className: 'supplied-frame', panel: 'villadd', image: 'desk-villadd.webp', w: 2000, h: 1632 },
  { className: 'supplied-figure', panel: 'thaimove', image: 'desk-thaimove.webp', w: 2000, h: 2075 },
] as const;

export const PHOTOS = [
  { slug: 'central-pattaya', w: 283, h: 307 }, { slug: 'huay-yai', w: 282, h: 315 },
  { slug: 'bang-saray', w: 275, h: 298 }, { slug: 'south-pattaya', w: 255, h: 289 },
  { slug: 'gomorehub', w: 265, h: 296, link: false },
  { slug: 'phra-tamnak', w: 295, h: 323 }, { slug: 'jomtien', w: 287, h: 328 },
] as const;
```

ขนาด `w`/`h` ตรงกับ attribute ใน `index.html` ปัจจุบัน ให้เช็กอีกครั้งตอน port

---

## 7. Dialog

```tsx
export function HubDialog() {
  const { panel, close, returnFocus } = useDialog();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
    if (panel && !dialog.open) dialog.showModal();
    if (!panel && dialog.open) dialog.close();
  }, [panel]);

  useEffect(() => {
    const dialog = ref.current!;
    const onClose = () => { close(); returnFocus.current?.focus({ preventScroll: true }); };
    dialog.addEventListener('close', onClose); // Escape ก็ผ่านทางนี้
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  return (
    <dialog ref={ref} className="paper-dialog" id="hub-dialog" data-panel={panel ?? undefined}
      aria-labelledby="dialog-title" onClick={closeWhenClickOutside}>
      <button className="dialog-close" aria-label={t.aria.close} onClick={() => ref.current!.close()} autoFocus>×</button>
      <div className="dialog-body">{panel && <Panel name={panel} />}</div>
    </dialog>
  );
}
```

- **หัวเรื่อง:** `<h2>` ของแต่ละ panel ต้องมี `id="dialog-title"`
- **คลิกนอกกรอบ:** ใช้เงื่อนไขเดียวกับบรรทัด 122–126 คือ `event.target === dialog` และพิกัดคลิกอยู่นอก rect
- **ลากลงเพื่อปิด (มือถือ):** port บรรทัด 343–367 เป็น `useSheetDrag(ref)` ถ้าใช้ React event `onTouchMove` จะเรียก `preventDefault()` ไม่ได้ เพราะ React ตั้ง listener เป็น passive ต้องใช้ `addEventListener('touchmove', fn, { passive: false })` ใน effect แทน

### `ShowreelVideo`

```tsx
export function ShowreelVideo({ name, poster, caption }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const { paused } = usePreferences();
  useEffect(() => {
    const video = ref.current!;
    if (!paused) video.play().catch(() => {});
    return () => video.pause(); // ปิด dialog แล้ว unmount
  }, []);
  return (
    <figure className="dialog-video">
      <video ref={ref} poster={asset(poster)} width={720} height={1280} muted loop playsInline controls preload="metadata">
        <source src={asset(`${name}-showreel.mp4`)} type="video/mp4" />   {/* MP4 ต้องมาก่อน */}
        <source src={asset(`${name}-showreel.webm`)} type="video/webm" />
      </video>
      <figcaption className="sr-only">{caption}</figcaption>
    </figure>
  );
}
```

**ข้อควรระวัง:** React ใส่ attribute `muted` ลงใน DOM ไม่ได้เสมอไป iOS ต้องการทั้ง property และ attribute จึงจะยอมให้เล่นอัตโนมัติ ให้เพิ่ม `ref.current.muted = true` ใน effect ก่อนเรียก `play()` กันไว้

---

## 8. Effects

ย้าย `initializeOcean()` และ `createDust()` ไปเป็น module ที่คืนค่า `{ resize, sync, destroy }` แล้วเรียกจาก hook

```ts
export function useOcean(canvasRef: RefObject<HTMLCanvasElement>, imageRef: RefObject<HTMLImageElement>, active: boolean) {
  const engine = useRef<ReturnType<typeof createOcean> | null>(null);
  useEffect(() => {
    const image = imageRef.current!;
    const start = () => { engine.current = createOcean(canvasRef.current!, image); };
    if (image.complete && image.naturalWidth) start(); else image.addEventListener('load', start, { once: true });
    return () => { engine.current?.destroy(); engine.current = null; };
  }, []);
  useEffect(() => { engine.current?.sync(active); }, [active]);
  // เรียก engine.current?.resize() เมื่อกล้องเปลี่ยนขนาด
}
```

- **`active`:** `!paused && !document.hidden && !dialogOpen` (`paused` รวม reduced-motion แล้ว) ฟัง `visibilitychange` เพื่ออัปเดตค่านี้
- **`destroy()`:** ต้อง `cancelAnimationFrame` และถอด listener `webglcontextlost` / `webglcontextrestored` ออก
- **StrictMode ใน dev:** React จะ mount effect สองครั้ง ถ้า cleanup ไม่ครบจะได้ loop วาดซ้อนสองชุด
- **ฝุ่น:** อ่านตำแหน่งดวงอาทิตย์จาก `world.getBoundingClientRect()` และอ่าน `scrollLeft` ของ viewport ให้ส่ง ref ของสองตัวนี้เข้าไปใน `createDust()`

### `useAmbientSound`

- **สร้าง AudioContext ใน click handler เท่านั้น:** ห้ามสร้างใน effect เพราะ browser จะไม่ยอมเล่นเสียง
- port `createAudio()`, `syncSound()` และ `resumeSound()` (บรรทัด 268–329) มาตรง ๆ
- **โหลดไฟล์:** ใช้ `fetch(asset('windy-beach.mp3'))` เพื่อให้ path ถูกเมื่อตั้ง `base`

---

## 9. ไอคอน

ไอคอนทั้งหมดเป็น Lucide ใช้ได้ 2 ทาง

- **`lucide-react`:** `import { ChevronDown, Pause, Play, Volume2, VolumeX } from 'lucide-react'` แล้วใส่ `size={14}` (เสียง `size={16}`), `aria-hidden` และ `className` เดิม (`menu-chevron`, `motion-icon icon-pause` ฯลฯ) เพื่อให้ CSS เดิมใช้ได้
- **ก๊อป `<svg>` เดิมจาก `index.html`:** ทำเป็น component ใน `header/icons.tsx`

ปุ่ม motion และปุ่มเสียงต้อง render ไอคอน**ทั้งสองตัว**ไว้เสมอ แล้วให้ CSS เลือกแสดงตาม `aria-pressed` หรือจะ render ตาม state ตัวเดียวก็ได้ แต่ต้องลบกฎ CSS `#motion-toggle[aria-pressed=…] .icon-*` และ `#sound-toggle[aria-pressed=…] .icon-*` ออกด้วย

---

## 10. Deploy (GitHub Pages)

แก้ `.github/workflows/deploy.yml` ให้ build ก่อน

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test            # vitest + ตรวจเนื้อหาแทน tools/check.mjs
      - run: npm run build       # ได้ dist/
      # ส่ง dist/ ขึ้น gh-pages หรือเปลี่ยนไปใช้ actions/upload-pages-artifact + actions/deploy-pages
```

ระบบ `?v=N` ไม่ต้องใช้แล้ว เพราะ Vite ใส่ hash ในชื่อไฟล์ JS และ CSS ให้เอง

---

## 11. ลำดับการทำที่แนะนำ

1. ตั้งโปรเจกต์ ก๊อป `styles.css` เป็น global ก๊อป assets และย้าย `<head>`
2. ทำ header, ฉาก (render นิ่ง ๆ ก่อน), วัตถุ 4 ชิ้น และราวรูป ตอนนี้หน้าตาควรเหมือนเดิมเมื่อไม่มีกล้อง
3. ทำ `computeCamera` พร้อม test แล้วทำ `useSceneCamera`
4. ทำ dialog, panel ทั้ง 5 และวิดีโอ
5. ทำภาษา (i18n) ให้ครบรวม `aria-label`
6. ทำทะเล ฝุ่น และเสียง
7. ทำโหมด pan: STOPS, ป้ายที่ขอบจอ, การกวาดครั้งแรก, glide จากเมนู และการลาก sheet ปิดบนมือถือ
8. ไล่ checklist ใน [README.md](README.md) หัวข้อ 7 แล้วจึงเปลี่ยน workflow
