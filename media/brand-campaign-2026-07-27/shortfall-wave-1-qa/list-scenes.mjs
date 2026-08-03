#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
const d=JSON.parse(await readFile('/home/alex/Dev/lupine/lupine-science/public/brand-assets/campaign-2026-07-27/shortfall-wave-1-manifest.json','utf8'));
for(const a of d.assets) console.log(`${a.asset_id}\n scene=${a.specific_physical_scene}\n mechanism=${a.single_mechanism}\n`);
