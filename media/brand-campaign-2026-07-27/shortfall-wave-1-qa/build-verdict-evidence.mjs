#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const DIR=path.dirname(new URL(import.meta.url).pathname);
const machine=JSON.parse(await readFile(path.join(DIR,'machine-qa.json'),'utf8'));
const notes={
'SW1-B1-A01-01':['orange/ochre sky wash','cutaway lacks a legible ceramic-plate/electrode ion-path mechanism'],
'SW1-B1-A01-04':['readable generated “lupine” signature/logo','pseudo-label marks on walls/equipment','cyan/teal route drift'],
'SW1-B1-A01-05':['text-like cabinet marks','buffer-to-charger path is not concretely depicted'],
'SW1-B1-A02-01':['text-like control marks','yellow/orange and cyan accents'],
'SW1-B1-A02-02':['cyan/teal and orange/ochre machinery','text-like/glyph marks','surviving-pellet route is ambiguous'],
'SW1-B1-A02-03':['cyan/blue wash outside restrained path','pressure-and-heat cycling mechanism is generic/ambiguous'],
'SW1-B1-A02-04':['generated signature at lower right','dense cyan/teal field','text-like control-panel marks'],
'SW1-B1-A02-05':['generic factory silhouette does not show qualified-pellet metering mechanism'],
'SW1-B1-A03-02':['dense text-like panel patterning','cyan/teal field','three-stage screening mechanism is not legible'],
'SW1-B1-A03-04':['cyan/teal cartridge field','text-like instrument marks'],
'SW1-B1-A04-04':['prohibited arrow and decorative squiggle glyphs','grain-boundary measurement mechanism is not legible'],
'SW1-B1-A04-05':['open warm-paper proxy below 45%','text-like cabinet marks','storage-to-charger discharge path is not shown'],
'SW1-B2-A01-02':['large green and yellow fields','cyan/teal drift'],
'SW1-B2-A01-03':['icon/glyph on contactor cabinet','cyan/teal plume/wash'],
'SW1-B2-A01-04':['cyan/teal plume and shading','generated tiny signature/mark'],
'SW1-B2-A02-02':['text-like equipment marks','generic process line does not clearly show kiln/calciner-to-capture-vessel mechanism'],
'SW1-B2-A02-03':['generated signature','plant/grass forms','generic concrete plant does not clearly show specified beam-mold/load-frame handoff'],
'SW1-B2-A02-04':['generic beam/chute omits the specified four-point load frame and interface cutaway'],
'SW1-B2-A02-05':['large orange/ochre buildings and red/orange vehicle','plant/grass forms'],
'SW1-B2-A03-01':['visible trees/plants','generic building does not clearly depict sealed landfill-gas oxidation mechanism'],
'SW1-B2-A03-03':['cyan/teal field','specified solid-carbon removal trays are not legible'],
'SW1-B2-A03-04':['orange/ochre piping','text-like component marks'],
'SW1-B2-A03-05':['orange/ochre ground and red/orange door','specified closed refrigerant loop is not legible'],
'SW1-B2-A04-02':['cyan/teal wash across pressure vessel','spiral membrane separation path is ambiguous'],
'SW1-B2-A04-03':['generated “Lupine Science” signature/logo','orange/ochre landscape wash'],
'SW1-B3-A01-03':['schematic glyph/mark candidates along probe line','four-coupon recirculating loop is not clearly depicted'],
'SW1-B3-A01-04':['pseudo-writing on cabinet','icon/glyph on cabinet','cyan/teal wall and route'],
'SW1-B3-A02-02':['text-like/glyph marks on long process line','membrane cassette and recovery-vessel separation are not legible'],
'SW1-B3-A02-03':['generated signatures/marks','cyan/teal liquid field'],
'SW1-B3-A02-04':['pseudo-writing on both cartridges','cyan/teal fluid fields'],
'SW1-B3-A03-02':['label-like marks on cabinet','generated vertical signature/mark','cyan/teal room shading'],
'SW1-B3-A03-03':['generic enclosure does not depict the specified compressor/condenser/expansion/evaporator loop'],
'SW1-B3-A03-04':['red indicator dot','blue/cyan control dot','text-like equipment marks'],
'SW1-B3-A04-03':['red/orange accent inside vessel','downstream sampling mechanism is ambiguous'],
'SW1-B3-A04-04':['generated vertical signature/mark','schematic valve/glyph marks'],
'SW1-B4-A01-02':['generic industrial silhouette omits the mask/X-ray/bend-test transfer rail'],
'SW1-B4-A01-03':['pseudo-writing on all four trays','label/icon-like instrument marks'],
'SW1-B4-A01-04':['dense pseudo-writing/glyphs along beam','glow/starburst at right endpoint'],
'SW1-B4-A02-02':['prohibited arrow/flow glyphs','does not clearly depict two plates under one scanning probe'],
'SW1-B4-A02-03':['cyan/teal cutaway field','scanning probe and buried interface inspection are not clearly depicted'],
'SW1-B4-A03-02':['diagrammatic arrow/glyph marks','four make-measure-revise stations are not legible'],
'SW1-B4-A03-04':['cyan/teal repeated field','sealed-cartridge chain and opposing instruments are ambiguous'],
'SW1-B4-A04-01':['diagrammatic symbols/glyphs along coupler chain','archive/instrument endpoints are ambiguous'],
'SW1-B4-A04-02':['decorative molecule/network/icon glyphs rather than a plain traceability chain'],
'SW1-B4-A04-04':['text-like equipment marks','cyan/teal field','candidate-routing gate is ambiguous'],
'SW1-B5-A01-02':['plant/grass-like spike field','large cyan/teal wash','probe-array mechanism is not legible'],
'SW1-B5-A01-03':['abstract/glow-like radiating geometry','specified rail/correction-plate/tensile-frame mechanism is absent'],
'SW1-B5-A01-04':['yellow and red blocks','generic frame does not clearly show compatible versus stopped carriage'],
'SW1-B5-A02-02':['glow/luminous halos','generic insulator-like objects do not depict ordered coupon rows'],
'SW1-B5-A02-03':['visible human figure','readable/pseudo machine labels','green/orange wiring'],
'SW1-B5-A02-04':['stock/glossy 3D-like device rendering','correction-plate/fatigue-fixture mechanism is ambiguous'],
'SW1-B5-A03-02':['glow/starburst effect','generated signature/mark','generic impact scene does not show bounded probe mapping'],
'SW1-B5-A03-03':['pseudo-writing and chart-like marks','three physical deflection pointers are not clearly legible'],
'SW1-B5-A04-02':['generic ridge/pin graphic does not clearly distinguish measured barrier from underestimated trajectory'],
'SW1-B5-A04-04':['label-like side panel','generic box does not clearly show unsupported magnetic specimen abstention'],
'SW1-B6-A01-01':['multiple prohibited arrows and diagram glyphs','does not depict physical coupon diffusion rigs'],
'SW1-B6-A01-02':['map/diagram glyphs and arrow-like route','physical shared diffusion-test stations are not legible'],
'SW1-B6-A01-03':['multiple prohibited arrows','gauge pointer comparison is diagrammatic rather than plain physical hardware'],
'SW1-B6-A02-01':['visible human figure','multiple labels/pseudo-writing on test bays','cyan/teal drift'],
'SW1-B6-A02-02':['many readable/text-like rail labels and marks','possible tiny silhouettes','open warm-paper proxy below 45%'],
'SW1-B6-A02-03':['stock/glossy 3D appearance','generic aperture does not depict a high-pressure cell with three containment rings'],
'SW1-B6-A02-04':['traffic-light red/yellow/green rack','labels/pseudo-writing on bays','generated signature/mark'],
'SW1-B6-A03-01':['abstract blue splash sequence','paired spring-gauge mechanism is absent'],
'SW1-B6-A03-04':['readable labels including “Sample” and pseudo-technical callouts'],
'SW1-B6-A04-01':['traffic-light red/yellow/green indicator','plume/glow and arrow glyphs','text-like machine marks'],
'SW1-B6-A04-02':['cyan/teal wash across support and coating','sparse airflow/mechanical-support mechanism is ambiguous'],
'SW1-B6-A04-03':['many readable/pseudo labels and callouts across the full process line']
};
const ids=machine.assets.map(a=>a.asset_id); const missing=ids.filter(id=>!notes[id]); const extra=Object.keys(notes).filter(id=>!ids.includes(id));
if(missing.length||extra.length) throw new Error(JSON.stringify({missing,extra}));
const assets=machine.assets.map(a=>({
 asset_id:a.asset_id,original_asset_id:a.original_asset_id,batch:a.batch,path:a.output_path,sha256:a.actual_sha256,
 verdict:'REJECT',reasons:notes[a.asset_id],scene_spec:{specific_physical_scene:a.specific_physical_scene,single_mechanism:a.single_mechanism},
 integrity:{hash_pass:a.hash_pass,bytes_pass:a.bytes_pass,dimensions_pass:a.dimensions_pass,dimensions:a.actual_dimensions},
 mechanical_evidence:{metrics:a.metrics,ocr:{method:a.ocr.method,strong_tokens:a.ocr.strong_tokens,pseudo_writing_candidates:a.ocr.pseudo_writing_candidates}},
 visual_inspection:{contact_sheet:machine.contact_sheets[a.batch],reviewed:true,notes:notes[a.asset_id]}
}));
const batch_tallies={}; for(const b of ['B1','B2','B3','B4','B5','B6']){const x=assets.filter(a=>a.batch===b);batch_tallies[b]={reviewed:x.length,PASS:0,REJECT:x.length};}
const out={schema_version:'1.0.0',task_id:'t_2b35afb3',generated_at:new Date().toISOString(),scope:{manifest:machine.integrity.aggregate_manifest_path,asset_count:assets.length,method:'Approved-manifest and per-file hash verification; native-resolution two-pass OCR; full-resolution pixel metrics; labeled B1-B6 contact-sheet and per-panel visual adjudication against every hard exclusion and each scene mechanism.'},integrity:machine.integrity,overall_tally:{reviewed:assets.length,PASS:0,REJECT:assets.length},batch_tallies,contact_sheets:machine.contact_sheets,assets};
await writeFile(path.join(DIR,'verdict-evidence.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({output:path.join(DIR,'verdict-evidence.json'),overall_tally:out.overall_tally,batch_tallies},null,2));
