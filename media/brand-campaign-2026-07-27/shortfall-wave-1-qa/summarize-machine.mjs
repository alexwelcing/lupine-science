#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
const d=JSON.parse(await readFile(new URL('./machine-qa.json',import.meta.url),'utf8'));
for(const a of d.assets){const m=a.metrics,h=m.forbidden_hue_fraction,t=a.ocr.strong_tokens.map(x=>`${x.text}:${x.confidence}`).join('|');console.log(`${a.asset_id}\tpaper=${m.warm_paper_fraction}\topen=${m.negative_space_proxy.largest_open_warm_paper_fraction}\tcyan=${h.cyan_teal}\toy=${h.orange_ochre_yellow}\tred=${h.red}\tgreen=${h.green}\totherblue=${h.other_blue}\tOCR=${t}`)}
