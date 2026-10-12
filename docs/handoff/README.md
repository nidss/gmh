# Handoff: ย้ายเว็บ Go More Hub ไปเป็น React หรือ Next.js

เอกสารชุดนี้สำหรับทีม frontend ที่จะนำเว็บ https://nidss.github.io/gmh/ ไปทำต่อใน framework

- **ไฟล์นี้:** สิ่งที่ใช้ร่วมกันทั้งสองทาง ได้แก่ เว็บทำอะไรบ้าง ส่วนไหนต้องคงไว้ จะแบ่ง component อย่างไร และวิธีตรวจรับงาน
- **[react.md](react.md):** ทำเป็น React SPA ด้วย Vite
- **[nextjs.md](nextjs.md):** ทำเป็น Next.js (App Router)

ถ้ายังไม่แน่ใจว่าจะใช้ตัวไหน ให้อ่านหัวข้อ "เลือก React หรือ Next.js" ท้ายไฟล์นี้ก่อน

เอกสารอ้างอิงใน repo ที่ควรเปิดคู่กัน:

- `README.md`: ฟีเจอร์ทั้งหมดจากมุมผู้ใช้
- `CLAUDE.md`: สถาปัตยกรรมและกฎด้านเนื้อหา
- `ASSETS.md`: ที่มาของไฟล์ภาพ วิดีโอ และเสียงทุกไฟล์ และรายการไฟล์ที่ไม่ได้ใช้แล้ว

---

## 1. สภาพปัจจุบัน

เว็บเป็น static site ไม่มีขั้นตอน build และไม่มี dependency

| ไฟล์ | บทบาท |
| --- | --- |
| `index.html` (162 บรรทัด) | โครงหน้า, header, ฉาก, `<template id="panel-…">` ของ dialog ทั้งหมด, `<noscript>` |
| `styles.css` (122 บรรทัด, เขียนแบบบรรทัดเดียวยาว) | สไตล์ทั้งหมด ช่วงท้ายไฟล์เป็นบล็อกที่มีคอมเมนต์และ override กฎก่อนหน้า ลำดับของกฎจึงสำคัญ |
| `script.js` (578 บรรทัด, IIFE เดียว) | ภาษา, motion, dialog, กล้อง, เสียง, การลาก sheet ปิดบนมือถือ, ทะเล WebGL, ฝุ่น |
| `assets/` | ภาพ วิดีโอ และเสียง (ดูรายการไฟล์ที่ใช้อยู่ใน `ASSETS.md` หัวข้อ "In use") |
| `tools/check.mjs` | การตรวจอัตโนมัติอย่างเดียวที่มี (ID ไม่ซ้ำ, anchor ถูกต้อง, panel ครบ, asset มีอยู่จริง, ข้อมูลบริษัทครบ) |
| `.github/workflows/deploy.yml` | push เข้า `main` แล้ว รัน check, ส่งขึ้น `gh-pages` แล้วสั่ง GitHub Pages build |

---

## 2. พฤติกรรมที่ต้องคงไว้ (spec)

### 2.1 ฉากและพิกัด

- **พิกัด:** ทุกอย่างวางบนภาพ `desk-panorama.webp` ขนาด **2926 × 1081** ด้วยหน่วย **%** ของกล่อง `.world` ซึ่งล็อกอัตราส่วน `2926/1081` ไว้
  - ห้ามเปลี่ยนเป็น px หรือ flex/grid ไม่อย่างนั้นวัตถุจะหลุดจากตำแหน่งในภาพ
  - ตำแหน่งทั้งหมดอยู่ท้าย `styles.css`: `.supplied-*`, `.window-photos`, `.photo-*`
- **วัตถุคลิกได้ 4 ชิ้น** (`button.scene-item` แต่ละชิ้นเปิด dialog):

  | class | ภาพ | เปิด panel |
  | --- | --- | --- |
  | `.supplied-note` | `desk-about.webp` | `about` |
  | `.supplied-phone` | `desk-phone.webp` | `contact` |
  | `.supplied-frame` | `desk-villadd.webp` | `villadd` |
  | `.supplied-figure` | `desk-thaimove.webp` | `thaimove` |
- **ราวรูปบนหน้าต่าง** (`.window-photos`):
  - วางที่ `left:30.55%; top:-5.3373%; width:43.5506%` และยื่นขึ้นไปเหนือภาพหลัก
  - ภาพฐานคือ `window-string.webp` (เชือกกับไม้หนีบ) ทับด้วยรูปที่ตัดแยกไว้ 7 รูป
  - รูปสถานที่ 6 รูปเป็นลิงก์ `<a target="_blank" rel="noopener noreferrer">` ไปที่ `https://villadd.com/th/villas/<area>` (central-pattaya, huay-yai, bang-saray, south-pattaya, phra-tamnak, jomtien)
  - การ์ด Go More Hub เป็น `<span>` ไม่มีลิงก์
  - ทุกรูปแกว่งรอบไม้หนีบ (keyframes `photo-swing`, `transform-origin` ของแต่ละรูปอยู่ใน `.photo-*`) เมื่อ hover หรือ focus และไม่มีแสง glow
- **แถบต่อฉาก:**
  - `desk-extension-top.webp` อยู่เหนือภาพหลัก และ `desk-extension-bottom.webp` อยู่ใต้ภาพหลัก แต่ละแถบซ้อนภาพหลัก 64 px (offset `5.9204%`)
  - แสดงเฉพาะเมื่อกล้องทำงาน (class `camera-ready`)

### 2.2 กล้อง (`fitScene`, `script.js` บรรทัด 146–213)

กล้องเลือกโหมดจากขอบเขตของวัตถุ ไม่ได้ดูจาก breakpoint

- **ค่าคงที่:**
  - `SAFE = { x0:.245, x1:.83, y0:0, y1:.98 }` คือกล่องที่ครอบวัตถุทั้งหมดรวมราวรูป
  - `NOTE_H = .1386 * 1081` คือความสูงของวัตถุชิ้นเล็กที่สุด
  - `EXTEND_TOP = 520/1081` และ `EXTEND_BOTTOM = 200/1081` คือส่วนที่แถบต่อฉากยื่นออกไป
- **โหมด fit:** ใช้เมื่อวัตถุเล็กสุดยังสูงอย่างน้อย 46 px บนจอ และฉากสูงอย่างน้อย 55% ของความสูงจอ จะแสดงวัตถุทั้งหมดในจอเดียว
- **โหมด pan:** ใช้ในกรณีอื่น (มือถือ, iPad แนวตั้ง) viewport เลื่อนแนวนอนได้ มี scroll-snap ที่ `STOPS` และมีป้ายที่ขอบจอชี้ไปยังวัตถุที่อยู่นอกจอ
- **ผลลัพธ์:**
  - เขียน CSS variable `--world-w`, `--world-x`, `--world-y`, `--cue-y` บน `<html>`
  - สลับ class `camera-ready`, `scene-fit`, `scene-pan`
- **ระยะจาก header:** ฟังก์ชัน `place()` ทำให้วัตถุไม่ไปอยู่ใต้ header โดยวัดตำแหน่งขอบล่างของ `.site-header` ทุกครั้งที่ resize
- **`STOPS` (จุดหยุดของกล้อง):** `About · Contact` (x .325), `ThaiMove` (.502) และ `Villadd` (.753) ใช้กับ 4 อย่างนี้
  - snap marker
  - ป้ายที่ขอบจอ
  - การกวาดกล้องครั้งแรกของ session (`sessionStorage` `gmh-tour`)
  - การเลือกเมนูในโหมด pan: กล้องเลื่อนไปที่วัตถุก่อน แล้วจึงเปิด dialog

**ข้อแนะนำ:** แยก `place()` กับการคำนวณใน `fitScene()` ออกมาเป็น **pure function** ที่รับ `(vw, vh, headerBottom, previousFocus)` แล้วคืนค่า `{ mode, width, height, x, y, cueY }` ก่อน จะเขียน unit test ได้ และ hook เหลือแค่ส่วนที่แตะ DOM

### 2.3 Dialog

- **โครงสร้าง:** ใช้ `<dialog id="hub-dialog">` ตัวเดียว เปิดด้วย `showModal()` และใส่เนื้อหาของ panel ที่เลือก
  - ปุ่ม Escape ปิดได้ (ทำงานเองจาก `<dialog>`)
  - คลิกนอกกรอบแล้วปิด
  - ปิดแล้วโฟกัสกลับไปที่ปุ่มที่เปิด ถ้าเปิดจากเมนู ให้กลับไปที่ปุ่มเมนู
- **panel ที่ใช้งาน:** `about`, `contact`, `villadd`, `thaimove` และ `social` (Find Us On)
  - **`panel-products` และ `panel-idea` ไม่มีปุ่มไหนเปิดได้แล้ว** ไม่ต้อง port เว้นแต่จะนำกลับมาใช้
- **Villadd / ThaiMove:**
  - จอกว้างเป็นสองคอลัมน์ เนื้อหาซ้าย วิดีโอแนวตั้งขวา (`.dialog-split`) จอต่ำกว่า 860 px จะเรียงซ้อนกัน
  - เปิด dialog แล้ววิดีโอเล่นเองแบบ `muted loop playsinline` **เว้นแต่ผู้ใช้พัก motion หรือตั้งค่า `prefers-reduced-motion`**
  - ปิด dialog แล้ว `pause()`
  - **ต้องใส่ `<source>` MP4 ก่อน WebM เสมอ** ถ้า WebM มาก่อน iPhone จะเลือกไฟล์ WebM แล้วแสดงจอดำ
- **มือถือ (≤ 700 px):** dialog เป็น bottom sheet ลากลงเกิน 90 px เพื่อปิดได้ (`script.js` บรรทัด 343–367)
- **ขณะ dialog เปิด:** ทะเลกับฝุ่นหยุดเคลื่อนไหว

### 2.4 Header และปุ่มควบคุม

- **ซ้าย:** `a.site-name` เป็นโลโก้ `gomorehub-logo.png` บนแผ่นสีครีม กดแล้วกลับหน้าแรก
- **ขวา** (`.header-actions`):
  - **Menu:** เปิด/ปิดรายการ panel มี `aria-expanded` และไอคอน Lucide chevron-down ที่หมุน 180° ตอนเปิด
  - **พัก/เล่น motion:** ใช้ `aria-pressed` และมีไอคอน Lucide pause/play ทั้งสองอยู่ใน DOM ตลอด CSS เลือกแสดงตาม `aria-pressed`
  - **เสียง:** ใช้ `aria-pressed` และไอคอน Lucide volume-2/volume-x แบบเดียวกัน
  - **TH / EN:** สลับภาษา
- **การจำค่า:** เก็บใน `localStorage` ทุกครั้งต้องห่อด้วย try/catch

  | key | ค่า |
  | --- | --- |
  | `gmh-language` | `th` (ค่าเริ่มต้น) / `en` |
  | `gmh-motion` | `playing` / `paused` |
  | `gmh-sound` | `on` / `off` (ค่าเริ่มต้นปิด) |

### 2.5 Effects

ทั้งสามอย่างเป็นโค้ดแบบ imperative ให้ห่อเป็น hook หรือ component ทั้งก้อน ไม่ต้องแปลงเป็น React state

- **ทะเล** (`initializeOcean`, บรรทัด 369–488):
  - WebGL shader ทำให้เฉพาะน้ำเคลื่อนไหว จำกัดด้วย mask ในพิกัดของภาพ (normalized)
  - ถ้าไม่มี WebGL จะใช้ Canvas 2D แทน และใช้รูปหลายเหลี่ยมเดียวกันเป็น mask
  - วาดประมาณ 25 fps
  - **ถ้าเปลี่ยนภาพฉาก ต้องแก้ mask ทั้งสองที่**
- **ฝุ่น** (`createDust`, บรรทัด 489–573): canvas เต็มจอ มีฝุ่น 12–28 จุด วาดประมาณ 30 fps
- **การหยุด:** ทะเลและฝุ่นหยุดเมื่อผู้ใช้พัก motion, ตั้งค่า reduced-motion, แท็บถูกซ่อน หรือ dialog เปิดอยู่ (`sync()`)
- **เสียง** (บรรทัด 268–329):
  - ใช้ Web Audio สร้าง AudioContext **ภายใน event ที่ผู้ใช้คลิก**
  - โหลด `windy-beach.mp3` ครั้งแรกตอนผู้ใช้เปิดเสียง เล่นวนไม่มีรอยต่อ ค่อย ๆ ดังขึ้น 1.6 วินาที และเบาลง 0.4 วินาที
  - ถ้าผู้ใช้เคยเปิดเสียงไว้ จะเล่นต่อเมื่อมีการคลิก แตะ หรือกดปุ่มครั้งแรกของการเข้าชมครั้งถัดไป

### 2.6 ภาษา

- **กลไกปัจจุบัน:** ข้อความทุกจุดมี `data-th` และ `data-en` แล้ว `translate()` สลับ `textContent` โดย `\n` แปลงเป็นการขึ้นบรรทัดใหม่
- **ตอน port:** ดึงข้อความทั้งหมดออกมาเป็น `messages/th.json` และ `messages/en.json`
  - **ข้อความที่ต้องไม่ลืม:** `aria-label` ที่ตั้งใน `setLanguage()` (บรรทัด 30–47) ได้แก่
    - ปุ่มภาษา, ปุ่มปิด dialog, viewport ของฉาก, เมนู, วัตถุ 4 ชิ้น
    - ชื่อปุ่ม motion และปุ่มเสียง (`motionLabels`, `soundLabels`)
    - ข้อความหลังคัดลอกอีเมล
    - ป้ายที่ขอบจอ
  - ตั้ง `<html lang>` ตามภาษาที่เลือกด้วย

### 2.7 การเข้าถึง (accessibility)

- **การนำทาง:** มี skip link ไปที่เมนู และปุ่มทุกปุ่มมีชื่อทั้งสองภาษา
- **ภาพ:** ภาพตกแต่งใช้ `alt=""` ส่วนวิดีโอมี `<figcaption class="sr-only">`
- **reduced motion:** ทำตาม `prefers-reduced-motion` ทั้งใน CSS และ JS ได้แก่ ไม่กวาดกล้อง ไม่เลื่อนแบบ animation วิดีโอไม่เล่นเอง และทะเลกับฝุ่นหยุด
- **ไม่มี JavaScript:** ฉากแบบนิ่งยังแสดงได้ และ `<noscript>` แสดงข้อมูลติดต่อ ถ้า port เป็น Next.js ที่ render บน server จะได้ส่วนนี้มาเอง ถ้าเป็น React SPA ให้คงข้อความใน `<noscript>` ของ `index.html` ไว้

---

## 3. โครงสร้าง component ที่แนะนำ (ใช้ได้ทั้งสองทาง)

```
App / page
├─ PreferencesProvider           language, motion (paused), sound + localStorage
├─ SkipLink
├─ SiteHeader
│  ├─ HomeLogo                   a.site-name > img
│  ├─ ExploreMenu                ปุ่ม + รายการ panel (aria-expanded, Escape ปิด)
│  ├─ MotionToggle               aria-pressed, ไอคอน pause/play
│  ├─ SoundToggle                aria-pressed, ไอคอน volume-2/volume-x, ใช้ useAmbientSound
│  └─ LanguageToggle
├─ Scene                         ใช้ useSceneCamera (คืนค่า css vars + mode)
│  ├─ SceneViewport              div.scene-viewport (scroll ในโหมด pan)
│  │  └─ World                   div.world (aspect 2926/1081)
│  │     ├─ extension top/bottom, world-background img
│  │     ├─ OceanCanvas          useOcean(imageRef, active)
│  │     └─ WorldLayer
│  │        ├─ PhotoString       window-string + 6 PhotoLink + GoMoreHubCard
│  │        └─ SceneObject × 4   button → openPanel(name)
│  ├─ DustCanvas                 useDust(active)
│  └─ EdgeCue × 2
├─ SiteFooter
└─ HubDialog                     <dialog> + panel ที่เลือก
   └─ AboutPanel | ContactPanel | VilladdPanel | ThaiMovePanel | SocialPanel
      └─ ShowreelVideo           (Villadd, ThaiMove) play/pause ตาม open + motion
```

**ค่าที่ใช้ร่วมกัน:**

- `active = !paused && !reducedMotion && !document.hidden && !dialogOpen` ใช้ควบคุมทะเลและฝุ่น
- `openPanel(name, trigger)` อยู่ใน context เพราะทั้งวัตถุในฉาก เมนู และปุ่มในหน้า About เรียกใช้

---

## 4. CSS

**แนะนำให้ทำเป็นสองขั้น:**

1. **ขั้นแรก:** import `styles.css` เป็น global stylesheet ทั้งไฟล์ ไม่ต้องแก้ แล้วใช้ class เดิมใน JSX จะได้หน้าตาเหมือนเดิมทันที และตรวจรับง่าย
2. **ขั้นสอง (ถ้าต้องการ):** ค่อย ๆ ย้ายแต่ละส่วนไปเป็น CSS Modules หรือ Tailwind
   - ต้องระวังลำดับการ override เพราะบล็อกท้ายไฟล์ตั้งใจเขียนทับกฎก่อนหน้า
   - class ที่ JS เปิดปิดบน `<html>` และ CSS อ้างถึงต้องคงชื่อเดิม ได้แก่ `js`, `camera-ready`, `scene-fit`, `scene-pan`, `camera-moving` และ `motion-paused`
   - หรือย้ายไปไว้ที่ element ราก ของ app แล้วแก้ selector ให้ตรงกัน

**จุดอื่น ๆ:**

- `?v=N` ที่ต่อท้ายลิงก์ CSS/JS ใน `index.html` ไม่ต้องใช้แล้ว เพราะ bundler ใส่ hash ในชื่อไฟล์เอง
- ฟอนต์ที่ CSS ใช้จริงมี DM Sans, Manrope และ Noto Sans Thai (Google Fonts) ส่วน Patrick Hand โหลดอยู่ใน `index.html` แต่ไม่มีกฎ CSS ไหนใช้ ไม่ต้องย้ายไป

---

## 5. Assets

- **ไฟล์ที่ต้องย้ายมี 26 ไฟล์:** ทุกไฟล์ในหัวข้อ "In use" ของ `ASSETS.md` วางใน `public/assets/` เพื่อให้ path `assets/...` ใช้ได้เหมือนเดิม
- **ไม่ต้องย้าย:** ไฟล์ในหัวข้อ "No longer used by the page"
- **ไฟล์ใหญ่:** วิดีโอ Villadd ประมาณ 4.4–4.9 MB และ ThaiMove ประมาณ 1.5–1.6 MB ทั้งคู่ใช้ `preload="metadata"` และโหลดเมื่อเปิด dialog เท่านั้น ห้าม preload วิดีโอตอนโหลดหน้า
- **ความถูกต้องของภาพ:**
  - ห้ามแก้ไฟล์ภาพให้เปลี่ยนสัดส่วน เพราะตำแหน่งวัตถุอ้างอิงขนาดของภาพ
  - ห้ามให้ระบบ optimize ภาพครอปหรือ resize แบบไม่รักษาอัตราส่วน
  - โลโก้ทางการต้องใช้ตามไฟล์ที่ได้มา ห้ามแก้

---

## 6. กฎด้านเนื้อหา (จาก `CLAUDE.md`)

- **ThaiMove:** ยังเป็น "Coming Soon" ห้ามใส่วันเปิดตัวหรือลิงก์ทดลองใช้ ระบุชื่อแอปที่เชื่อมต่อได้
- **ภาพ Villadd ใน dialog:** เป็นภาพแนวคิด ต้องมีข้อความกำกับว่า "ไม่ใช่ที่พักที่เปิดจอง"
- **เครื่องหมายขีด:** ข้อความบนเว็บใช้ `-` ไม่ใช้ `—` ทั้งใน title, label และ aria-label
- **ข้อมูลบริษัท:** ข้อมูลติดต่อและลิงก์ Facebook ทั้งสามต้องตรงกับ `tools/check.mjs`

---

## 7. ตรวจรับงาน (acceptance checklist)

เปิดเว็บเดิมและเว็บใหม่คู่กันแล้วเทียบตามรายการนี้ ถ้าใช้ Playwright จะทำซ้ำได้ทุกครั้งที่แก้

- [ ] **ขนาดจอ:** 1920×1080, 1366×768, 2560×1080 อยู่ในโหมด fit และ 390×844, 820×1180 อยู่ในโหมด pan ทุกขนาดต้องแสดงวัตถุตรงตำแหน่งในภาพ และราวรูปไม่โดน header บัง
- [ ] **ลิงก์ราวรูป:** รูปสถานที่ทั้ง 6 ลิงก์ถูก URL เปิดแท็บใหม่ ทุกรูปแกว่งเมื่อ hover และการ์ด Go More Hub ไม่มีลิงก์
- [ ] **Dialog:** วัตถุทั้ง 4 ชิ้นและเมนูทั้ง 5 รายการเปิด panel ถูกตัว Escape ปิดได้ คลิกนอกกรอบปิดได้ และโฟกัสกลับที่เดิม
- [ ] **โหมด pan:** เลือกเมนูแล้วกล้องเลื่อนไปที่วัตถุก่อนเปิด dialog ป้ายที่ขอบจอทำงาน และกล้องกวาดครั้งแรกครั้งเดียวต่อ session
- [ ] **วิดีโอ:** เปิด dialog แล้วเล่นเองแบบปิดเสียง ปิดแล้วหยุด ไม่เล่นเองเมื่อพัก motion หรือ reduced-motion และ **บน iPhone Safari ต้องเห็นภาพ ไม่ใช่จอดำ**
- [ ] **การจำค่า:** ภาษา motion และเสียงยังจำค่าหลัง reload และหน้าเว็บไม่กะพริบเป็นภาษาไทยก่อนเปลี่ยนเป็นภาษาอังกฤษ
- [ ] **TH/EN:** สลับแล้วข้อความทุกจุดเปลี่ยน รวมถึง `aria-label` และ `<html lang>`
- [ ] **Effects:** ทะเลเคลื่อนไหวเฉพาะในน้ำ และฝุ่นแสดง เมื่อพัก motion หรือเปิด dialog ทั้งคู่หยุด
- [ ] **มือถือ:** dialog เป็น bottom sheet ลากลงเพื่อปิดได้
- [ ] **ข้อความ:** ไม่มี `—` ในข้อความใด ๆ บนเว็บ
- [ ] **ข้อมูลบริษัท:** ข้อมูลที่ `tools/check.mjs` ตรวจยังอยู่ครบ ให้ย้ายการตรวจเป็น test ของโปรเจกต์ใหม่

---

## 8. เลือก React หรือ Next.js

| | React (Vite) | Next.js |
| --- | --- | --- |
| เหมาะกับ | หน้าเดียว แยกเป็นเว็บของตัวเอง หรือฝังในแอป React ที่มีอยู่แล้ว | รวมเข้ากับเว็บหลักที่เป็น Next.js อยู่แล้ว หรืออยากได้ SEO และ HTML จาก server |
| Deploy | static ไฟล์ล้วน (GitHub Pages, Netlify, S3) | Vercel หรือ `output: 'export'` เป็น static ได้เหมือนกัน |
| SEO / แชร์ลิงก์ | meta อยู่ใน `index.html` เนื้อหาใน dialog render ฝั่ง client | Metadata API ทำให้แยก URL `/th` กับ `/en` ได้ |
| สิ่งที่ต้องระวังเพิ่ม | ไม่มี | ต้องใส่ `'use client'` และระวัง hydration mismatch กับค่าที่เก็บใน localStorage |
| ความยากในการ port | ง่ายกว่า | ปานกลาง |

ถ้าบริษัทจะมีเว็บหลักที่เป็น Next.js อยู่แล้ว ให้เลือก Next.js ถ้าหน้านี้จะยังเป็น landing page แยกของตัวเอง React (Vite) พอแล้ว
