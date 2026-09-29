#!/usr/bin/env node
// Original vector illustration. Geometry is composed for visual storytelling;
// it is not a plot of the research population. Rebuild all four assets together.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/articles/tms-2027-measuring-what-we-can-trust');
const fixed = (x) => x.toFixed(2);
const contours = [];
for (let ring = 0; ring < 31; ring++) {
  const scale = 0.14 + ring * 0.034;
  const points = [];
  for (let j = 0; j <= 150; j++) {
    const a = j / 150 * Math.PI * 2;
    const ripple = 1 + 0.10 * Math.sin(3 * a + scale * 1.5) + 0.045 * Math.cos(5 * a - scale);
    const x = 654 + 386 * scale * ripple * Math.cos(a);
    const y = 393 + 154 * scale * ripple * Math.sin(a) - 53 * Math.pow(1 - scale, 2) + 35 * scale * Math.sin(2 * a);
    points.push(`${j ? 'L' : 'M'}${fixed(x)} ${fixed(y)}`);
  }
  contours.push(`<path d="${points.join(' ')}Z" opacity="${ring % 5 === 0 ? '.60' : '.26'}" stroke-width="${ring % 5 === 0 ? '1.2' : '.7'}"/>`);
}
const scatter = [];
for (let i = 0; i < 43; i++) {
  const x = 72 + ((i * 79) % 278);
  const y = 289 + ((i * 67) % 211);
  const length = 5 + (i % 6) * 2.5;
  scatter.push(`<path class="trace trace-${i % 3}" d="M${x} ${y}q${length} ${i % 2 ? -8 : 8} ${length * 2} 0" opacity="${i % 4 ? '.3' : '.6'}"/>`);
}
const landmarks = [[351,457],[508,376],[716,413],[879,288]];
const anchors = landmarks.map(([x,y],i) => `<g transform="translate(${x} ${y})">
  <circle class="anchor-halo" r="19" fill="none" stroke="#8a5e1f" opacity=".27"/>
  <circle r="6" fill="#faf9f6" stroke="#3d4db3" stroke-width="2"/>
  <circle r="2" fill="#3d4db3"/>
  <path d="M-27 0h6M21 0h6M0-27v6M0 21v6" stroke="#8a5e1f" opacity=".65"/>
  <text x="25" y="-17" fill="#666a80" font-family="monospace" font-size="10">${['A','B','C','D'][i]}</text>
</g>`).join('\n');
const petals = [];
for (let i = 0; i < 7; i++) {
  const y = -13 - i * 13;
  const span = 27 - i * 2.6;
  petals.push(`<path d="M0 ${y}C${-span} ${y-3} ${-span-7} ${y-23} -6 ${y-15}Q2 ${y-8} 0 ${y}" fill="#3d4db3" opacity="${.53+i*.065}"/>
  <path d="M0 ${y-5}C${span} ${y-7} ${span+3} ${y-26} 5 ${y-18}Q-1 ${y-12} 0 ${y-5}" fill="#6676ca" opacity="${.62+i*.05}"/>`);
}
const route = 'M117 514C211 473 276 502 351 457S442 330 508 376S629 462 716 413S795 308 879 288';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700" role="img" aria-labelledby="art-title art-desc">
<title id="art-title">A clearer map, a better next question</title>
<desc id="art-desc">An original metaphor for Lupine Science's progress. Scattered traces become a surveyed indigo landscape. Four reference landmarks guide a path toward a flowering lupine, while a dotted path continues into unfinished terrain. The drawing contains no research data.</desc>
<defs>
  <pattern id="survey-grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#3d4db3" opacity=".15"/></pattern>
  <linearGradient id="field-fade"><stop stop-color="#3d4db3" stop-opacity="0"/><stop offset=".35" stop-color="#3d4db3" stop-opacity=".045"/><stop offset="1" stop-color="#3d4db3" stop-opacity="0"/></linearGradient>
  <radialGradient id="survey-light"><stop stop-color="#c1a16a" stop-opacity=".22"/><stop offset="1" stop-color="#c1a16a" stop-opacity="0"/></radialGradient>
  <clipPath id="field-clip"><rect x="64" y="220" width="1072" height="350"/></clipPath>
</defs>
<style id="motion">
  .route { stroke-dasharray:1; animation:survey-route 18s ease-in-out infinite; }
  .survey-light { animation:survey-light 18s ease-in-out infinite; }
  .anchor-halo { transform-box:fill-box; transform-origin:center; animation:anchor-breathe 6s ease-in-out infinite; }
  .trace { animation:trace-drift 10s ease-in-out infinite alternate; }
  .trace-1 { animation-delay:-3s; } .trace-2 { animation-delay:-7s; }
  .flower { transform-origin:879px 288px; animation:flower-sway 9s ease-in-out infinite; }
  @keyframes survey-route { 0%,8% { stroke-dashoffset:1; opacity:.2; } 65%,88% { stroke-dashoffset:0; opacity:1; } 100% { stroke-dashoffset:0; opacity:.2; } }
  @keyframes survey-light { 0%,8% { transform:translateX(-510px); opacity:0; } 18% { opacity:1; } 78% { transform:translateX(440px); opacity:1; } 100% { transform:translateX(480px); opacity:0; } }
  @keyframes anchor-breathe { 0%,100% { opacity:.18; transform:scale(.9); } 50% { opacity:.48; transform:scale(1.12); } }
  @keyframes trace-drift { from { transform:translate(0,0); } to { transform:translate(7px,-5px); } }
  @keyframes flower-sway { 0%,100% { transform:rotate(-1deg); } 50% { transform:rotate(1deg); } }
  @media (prefers-reduced-motion:reduce) { * { animation:none!important; } }
</style>
<rect width="1200" height="700" fill="#f2efe7"/>
<rect x="1" y="1" width="1198" height="698" rx="2" fill="none" stroke="#d9d5c9"/>
<rect x="34" y="34" width="1132" height="632" fill="url(#survey-grid)"/>
<path d="M64 81V64h17M1119 64h17v17M64 619v17h17M1119 636h17v-17" fill="none" stroke="#8a5e1f" stroke-width="1"/>
<text x="89" y="97" fill="#3d4db3" font-family="monospace" font-size="12" letter-spacing="2.3">LUPINE SCIENCE / TMS 2027</text>
<text x="88" y="162" fill="#252b53" font-family="Georgia,serif" font-size="53" letter-spacing="-1.2">A clearer map.</text>
<text x="90" y="201" fill="#575c77" font-family="Georgia,serif" font-size="25" font-style="italic">A better next question.</text>
<path d="M835 104h235M1018 99l6 5-6 5" stroke="#3d4db3" stroke-width="1" fill="none" opacity=".45"/>
<text x="835" y="86" fill="#686a78" font-family="monospace" font-size="10" letter-spacing="1.2">THE WORK CONTINUES</text>
<ellipse cx="654" cy="393" rx="455" ry="185" fill="url(#field-fade)"/>
<g clip-path="url(#field-clip)">
  <g fill="none" stroke="#3d4db3">${scatter.join('\n')}</g>
  <g fill="none" stroke="#3d4db3" stroke-linejoin="round">${contours.join('\n')}</g>
  <ellipse class="survey-light" cx="610" cy="382" rx="160" ry="225" fill="url(#survey-light)"/>
  <path d="${route}" stroke="#3d4db3" stroke-width="1.1" stroke-dasharray="2 6" opacity=".28" fill="none"/>
  <path class="route" pathLength="1" d="${route}" stroke="#3d4db3" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M879 288C926 264 970 236 1048 250L1117 202" stroke="#8a5e1f" stroke-width="1.4" stroke-dasharray="3 7" opacity=".62" fill="none"/>
</g>
<g>${anchors}</g>
<g class="flower"><g transform="translate(879 288)">
  <path d="M0 0C-6-35 6-68 0-111" stroke="#394885" stroke-width="2" fill="none"/>
  <path d="M0-8C-42-5-40-29-14-20ZM0-6C36-8 40-35 17-25Z" fill="#3d4db3" opacity=".5"/>
  ${petals.join('\n')}
  <path d="M-3-109Q-9-126 0-130Q10-124 4-111Z" fill="#3d4db3"/>
</g></g>
<circle cx="1117" cy="202" r="5" fill="#f2efe7" stroke="#8a5e1f" stroke-dasharray="2 3"/>
<path d="M89 588h1022" stroke="#ccc9be" stroke-width=".8"/>
<g font-family="monospace" font-size="11" letter-spacing="1.2" fill="#3d4db3">
  <text x="90" y="613">01 / MEASURE</text><text x="476" y="613">02 / TEST</text><text x="860" y="613">03 / LEARN</text>
</g>
<g font-family="Georgia,serif" font-size="16" fill="#67697a">
  <text x="90" y="640">Make the differences visible.</text><text x="476" y="640">Find what survives.</text><text x="860" y="640">Choose the next measurement.</text>
</g>
</svg>\n`;
const still = svg.replace(/<style id="motion">[\s\S]*?<\/style>\n/, '');
await fs.mkdir(out, { recursive: true });
await fs.writeFile(path.join(out, 'hero.svg'), svg);
await fs.writeFile(path.join(out, 'hero-still.svg'), still);
await sharp(Buffer.from(still)).resize(1200, 630, { fit: 'contain', background:'#f2efe7' }).jpeg({ quality:90, mozjpeg:true }).toFile(path.join(out, 'hero.jpg'));
await sharp(Buffer.from(still)).resize(640, 360, { fit:'contain', background:'#f2efe7' }).jpeg({ quality:86, mozjpeg:true }).toFile(path.join(out, 'thumb.jpg'));
console.log('TMS2027 original SVG, still, social image and thumbnail rebuilt.');
