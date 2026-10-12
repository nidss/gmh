# Handoff: Next.js (App Router + TypeScript)

อ่าน [README.md](README.md) ในโฟลเดอร์นี้ก่อน ไฟล์นั้นอธิบายพฤติกรรมที่ต้องคงไว้ โครง component และ checklist ตรวจรับ

**โค้ดส่วนที่ทำงานฝั่ง client เหมือนกับ React ทุกอย่าง** ได้แก่ กล้อง, dialog, วิดีโอ, ทะเล, ฝุ่น, เสียง และไอคอน ให้ทำตาม [react.md](react.md) หัวข้อ 4 และ 6–9 ไฟล์นี้อธิบายเฉพาะส่วนที่ Next.js ต่างออกไป ได้แก่ server/client component, metadata, ฟอนต์, ภาษา, hydration และการ deploy

---

## 1. เริ่มโปรเจกต์

```sh
npx create-next-app@latest gmh-web --ts --app --eslint --src-dir --no-tailwind
```

### `next.config.ts`

เลือกตามที่ที่จะ deploy

```ts
import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''; // '/gmh' ถ้ายังอยู่ที่ nidss.github.io/gmh

const config: NextConfig = {
  // ไม่ต้องตั้งถ้าใช้ Vercel
  output: 'export',          // static HTML ใน out/ สำหรับ GitHub Pages หรือ S3
  basePath,
  trailingSlash: true,
  images: { unoptimized: true }, // export แบบ static ใช้ image optimizer ไม่ได้
};
export default config;
```

`basePath` **ไม่เติมให้ path ของไฟล์ใน `public/` ที่เขียนเป็น string เอง** เช่น `<img src="/assets/...">`, `<video>`, `fetch()` หรือ CSS `url()` ต้องเติมเองผ่าน helper

```ts
export const asset = (name: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/${name}`;
```

`styles.css` เดิมมี `url(assets/desk-panorama.webp)` อยู่หนึ่งที่ (`.world-shell::before`) ให้เปลี่ยนเป็น path ที่มี basePath หรือตั้งเป็น CSS variable จาก component

---

## 2. โครงไฟล์

```
src/
├─ app/
│  ├─ layout.tsx               <html>, metadata, ฟอนต์, สคริปต์ก่อน hydrate, <noscript>
│  ├─ page.tsx                 server component: render <GoMoreHub />
│  └─ globals.css              styles.css เดิม (ขั้นแรก)
├─ components/
│  ├─ GoMoreHub.tsx            'use client' : providers + header + scene + dialog
│  ├─ header/…  scene/…  dialog/…  effects/…   (เหมือน react.md หัวข้อ 2)
├─ i18n/ th.ts, en.ts
└─ lib/ asset.ts, camera.ts (pure, test ได้)
public/assets/                 ไฟล์ "In use" 26 ไฟล์
```

---

## 3. Server component กับ client component

ทุกส่วนของหน้านี้ต้องใช้ `window`, `localStorage`, `matchMedia`, canvas, WebGL หรือ Web Audio วิธีที่ง่ายที่สุดจึงเป็น

- **`app/layout.tsx` และ `app/page.tsx` เป็น server component:** ใช้ทำ metadata และโครง HTML
- **`components/GoMoreHub.tsx` ขึ้นต้นด้วย `'use client'`:** เป็นทางเข้าเดียวไปส่วนที่เป็น client ทั้งหมด

Next.js ยัง render client component เป็น HTML บน server ครั้งแรกอยู่ ผลคือ

- **ได้ HTML ของฉากมาตั้งแต่แรก:** คนที่ไม่มี JS หรือ crawler จะเห็นฉากนิ่งและข้อความ ตรงกับ fallback ของเว็บเดิม
- **โค้ดที่แตะ browser API ต้องอยู่ใน `useEffect` หรือ `useLayoutEffect` เท่านั้น:** ห้ามอ่าน `localStorage` หรือ `window` ระหว่าง render
  - `useState(() => localStorage.getItem(...))` ในแบบ React จะพังบน server
  - ให้เริ่มด้วยค่าเริ่มต้น (`th`, เล่น motion, ปิดเสียง) แล้วอ่านค่าจริงใน `useEffect`
- **ทะเลและฝุ่น:** โหลดด้วย `dynamic(() => import(...), { ssr: false })` ได้ ไม่จำเป็นต้องมีใน HTML จาก server

---

## 4. `app/layout.tsx`

### Metadata

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://nidss.github.io'),
  title: 'Go More Hub - A little world of possibilities',
  description: 'สำรวจโลกของ Go More Hub บริษัท โก มอร์ ฮับ จำกัด พบกับ Villadd แพลตฟอร์มจองพูลวิลล่า และ ThaiMove เปลี่ยนการออกกำลังกายเป็นคะแนนและรางวัล',
  alternates: { canonical: '/gmh/' },
  icons: { icon: '/gmh/assets/gomorehub-logo.png' },
  openGraph: {
    type: 'website', url: '/gmh/',
    title: 'Go More Hub - A little world of possibilities',
    description: 'Good escapes. Meaningful movement. Explore the Go More Hub world.',
    images: ['/gmh/assets/desk-panorama.webp'],
  },
  twitter: { card: 'summary_large_image' },
};
export const viewport = { themeColor: '#edddc7' };
```

`title` ใช้ `-` ไม่ใช้ `—` (กฎใน `CLAUDE.md`) และต้องปรับ path ใน `metadataBase` กับ `/gmh/` ถ้าย้ายโดเมน

### ฟอนต์

ทางเลือกที่แนะนำคือ `next/font/google` เพราะ self-host ไฟล์ฟอนต์และไม่ทำให้ layout กระโดด

```tsx
import { DM_Sans, Manrope, Noto_Sans_Thai } from 'next/font/google';
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-dm-sans' });
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-manrope' });
const notoThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-noto-thai' });
```

- **ข้อควรระวัง:** `next/font` ตั้งชื่อ font-family ใหม่ด้วย hash แต่ `styles.css` เดิมเรียกชื่อตรง ๆ เช่น `'DM Sans'`, `'Manrope'` และ `'Noto Sans Thai'` (ไม่ต้องโหลด Patrick Hand เพราะ CSS ไม่ได้ใช้)
  - ต้องแทนชื่อเหล่านี้ใน CSS ด้วย `var(--font-dm-sans)` ฯลฯ
  - หรือใช้ `<link>` Google Fonts แบบเดิมใน layout แทน `next/font` ก็ได้ ง่ายกว่าแต่ไม่ได้ข้อดีข้างต้น

### สคริปต์ก่อน hydrate และ `<noscript>`

```tsx
const boot = `try{var d=document.documentElement;d.classList.add('js');
var l=localStorage.getItem('gmh-language');d.lang=l==='en'?'en':'th';
if(localStorage.getItem('gmh-motion')==='paused'||matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion-paused');}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning className={`${dmSans.variable} ${manrope.variable} ${notoThai.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: boot }} /></head>
      <body>
        {children}
        <noscript>{/* ข้อความติดต่อเดิมจาก index.html */}</noscript>
      </body>
    </html>
  );
}
```

- **`suppressHydrationWarning` บน `<html>`:** จำเป็น เพราะสคริปต์นี้และกล้อง (`camera-ready`, `scene-fit`, CSS variable) แก้ `<html>` ก่อนและระหว่าง hydrate
- **ห้ามใส่บน element อื่นแบบเหมารวม:** จะซ่อนบั๊ก hydration ที่ควรเห็น

---

## 5. ภาษา: เลือก 1 จาก 2 แบบ

### แบบ A: สลับฝั่ง client เหมือนเดิม (แนะนำสำหรับขั้นแรก)

- **การทำงาน:** URL เดียว ใช้ context `t` เหมือน [react.md](react.md) หัวข้อ 5 และจำค่าใน `localStorage` ด้วย key `gmh-language`
- **ปัญหาภาษากะพริบ:** server render เป็นภาษาไทยเสมอ คนที่เลือกภาษาอังกฤษไว้จะเห็นภาษาไทยแวบหนึ่งก่อน hydrate แก้ได้ 2 ทาง
  - render ข้อความจาก `document.documentElement.lang` ที่สคริปต์ boot ตั้งไว้ หลัง mount แล้ว
  - หรือซ่อนข้อความชั่วคราวด้วย CSS `html[lang=en] [data-i18n-pending]{visibility:hidden}` จนกว่าจะ hydrate เสร็จ
- **ข้อจำกัด:** crawler เห็นเฉพาะภาษาไทย

### แบบ B: แยก URL `/th` และ `/en` (ดีกว่าสำหรับ SEO)

- **การทำงาน:** ใช้ `app/[locale]/page.tsx` + `generateStaticParams()` คืน `[{ locale: 'th' }, { locale: 'en' }]`
  - export แบบ static ได้ทั้งสองหน้า
  - ใช้ `next-intl` หรือ dictionary ของเราเองก็ได้
- **ข้อดี:** panel สามารถเป็น server component ได้ เพราะรู้ภาษาตั้งแต่ตอน render จึงได้ HTML ภาษาที่ถูกต้องและแยก metadata ต่อภาษาได้ (`generateMetadata`)
- **การสลับภาษา:** ปุ่ม TH/EN กลายเป็นลิงก์ไปอีก URL ต้องจำค่า `gmh-motion` และ `gmh-sound` ผ่าน `localStorage` เหมือนเดิม
  - ถ้าต้องการ ให้หน้า `/` redirect ฝั่ง client ไปยังภาษาที่เคยเลือก (`output: 'export'` ใช้ middleware ไม่ได้)
- **ข้อสังเกต:** พฤติกรรมต่างจากเว็บเดิมเล็กน้อย เพราะเปลี่ยนภาษาแล้วโหลดหน้าใหม่ ต้องให้กล้องคงตำแหน่งเดิม หรือยอมให้กลับไปจุดเริ่มต้น

---

## 6. รูปภาพ

- **ใช้ `<img>` ธรรมดาสำหรับเลเยอร์ของฉาก:** ภาพหลัก แถบต่อฉาก วัตถุ 4 ชิ้น และรูปบนราว
  - CSS เดิมวางภาพด้วย `%` แบบตรงตัว และพึ่งพา `width`/`height` attribute ของ `<img>`
  - `next/image` เติม style และ `srcset` ที่อาจทำให้ภาพเลื่อนจากตำแหน่ง
  - ปิด lint rule `@next/next/no-img-element` เฉพาะไฟล์เหล่านี้
- **ภาพใน dialog และโลโก้:** ใช้ `next/image` ได้ ถ้าใช้ `output: 'export'` ต้องตั้ง `unoptimized` ไว้แล้ว (หัวข้อ 1)
- **ภาพหลักโหลดเร็ว:** `world-background` ควรมี `fetchPriority="high"` เหมือนเดิม

---

## 7. ส่วนที่ทำเหมือน React

ให้ทำตาม [react.md](react.md) โดยปรับ 2 ข้อนี้

- **`useLayoutEffect`:** ใน client component ที่ render บน server ด้วย React 18 จะมี warning ให้ใช้ `useEffect` หรือ hook `useIsomorphicLayoutEffect` แทนใน `useSceneCamera`
- **path ของไฟล์:** ทุกที่ที่โหลดไฟล์ (`<video>`, `fetch('windy-beach.mp3')`, poster) ต้องใช้ `asset()` จากหัวข้อ 1

| หัวข้อใน react.md | สรุป |
| --- | --- |
| 4. State กลาง | `PreferencesProvider` (เริ่มจากค่าเริ่มต้น แล้วอ่าน localStorage ใน effect) และ `DialogProvider` |
| 6. ฉากและกล้อง | `computeCamera()` แบบ pure + `useSceneCamera` + `glide` / `tour` / ป้ายที่ขอบจอ |
| 7. Dialog | `<dialog>` + `showModal()`, คลิกนอกกรอบ, โฟกัสกลับ, ลาก sheet ด้วย `{ passive:false }`, `ShowreelVideo` ที่ใส่ **MP4 ก่อน WebM** |
| 8. Effects | `createOcean` / `createDust` มี `destroy()`, `useAmbientSound` สร้าง AudioContext ใน click |
| 9. ไอคอน | `lucide-react` หรือ SVG เดิม โดยคง class เดิมไว้ |

---

## 8. Deploy

### Vercel (ง่ายที่สุด)

- import repo แล้วไม่ต้องตั้ง `output: 'export'` หรือ `basePath`
- ถ้าใช้แบบ B ใน Vercel จะใช้ middleware redirect ตามภาษาได้

### GitHub Pages (ที่เดิม)

- ตั้ง `NEXT_PUBLIC_BASE_PATH=/gmh` แล้ว `next build` จะได้ `out/`
- แก้ `.github/workflows/deploy.yml`

```yaml
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm test
      - run: npm run build
        env: { NEXT_PUBLIC_BASE_PATH: /gmh }
      - run: touch out/.nojekyll   # ให้ Pages เสิร์ฟโฟลเดอร์ _next/
      # ส่ง out/ ขึ้น gh-pages หรือใช้ actions/upload-pages-artifact + actions/deploy-pages
```

- **`.nojekyll` สำคัญ:** ถ้าไม่มี GitHub Pages จะไม่เสิร์ฟโฟลเดอร์ที่ขึ้นต้นด้วย `_` และหน้าเว็บจะโหลด JS ไม่ได้
- **cache:** ระบบ `?v=N` ไม่ต้องใช้แล้ว เพราะ Next.js ใส่ hash ในชื่อไฟล์เอง

---

## 9. ลำดับการทำที่แนะนำ

1. ตั้งโปรเจกต์ ตั้ง `next.config.ts` และ `asset()` ก๊อป assets และ `globals.css` แล้วแก้ `url()` กับชื่อฟอนต์
2. ทำ `layout.tsx` (metadata, ฟอนต์, สคริปต์ boot, `<noscript>`)
3. เลือกแบบภาษา A หรือ B แล้วดึงข้อความเป็นไฟล์ `th.ts` และ `en.ts`
4. ทำ `GoMoreHub` (`'use client'`) ตาม [react.md](react.md) หัวข้อ 11 ข้อ 2–7
5. เช็กว่า console ไม่มี hydration warning ทั้งตอนเลือกภาษาไทยและอังกฤษ และทั้งตอนเล่นและพัก motion
6. ไล่ checklist ใน [README.md](README.md) หัวข้อ 7 แล้วจึงเปลี่ยน workflow
