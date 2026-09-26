/** Reproduce the explicitly labelled three-colour bounds from sourced seed data. */
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const catalogueUrl=new URL('../docs/data/ramsey.json',import.meta.url);
const seedUrl=new URL('../docs/data/three-colour-seeds.json',import.meta.url);
const catalogue=JSON.parse(await readFile(catalogueUrl,'utf8'));
const seeds=JSON.parse(await readFile(seedUrl,'utf8'));
const key=t=>[...t].sort((a,b)=>a-b).join('-');
const display=t=>`R(${t.join(', ')})`;
const baseRecords=catalogue.records.filter(r=>r.generatedBy!=='three-colour-v1');
const two=new Map(baseRecords.filter(r=>r.colours===2).map(r=>[key(r.tuple),{value:r.upper,source:r.upperSource}]));
const lowerTwo=new Map(baseRecords.filter(r=>r.colours===2&&r.tuple[0]===3).map(r=>[r.tuple[1],{value:r.lower,source:r.lowerSource,evidence:r.lowerEvidence}]));
for(const r of seeds.twoColourTriangles) {
  if(r.upper) two.set(`3-${r.k}`,{value:r.upper,source:r.upperSource});
  if(r.lower) lowerTwo.set(r.k,{value:r.lower,source:r.lowerSource,evidence:r.lowerEvidence});
}
const upperAnchors=new Map(seeds.upperAnchors.map(r=>[key(r.tuple),{value:r.upper,source:r.source}]));
const upperMemo=new Map();
function upper(tuple) {
  tuple=[...tuple].sort((a,b)=>a-b);
  const id=key(tuple);
  if(upperMemo.has(id)) return upperMemo.get(id);
  if(tuple[0]===2) return upper(tuple.slice(1));
  if(tuple.length===1) return {value:tuple[0],source:'survey-18'};
  const anchor=tuple.length===2?two.get(id):upperAnchors.get(id);
  if(anchor) return anchor;
  const children=tuple.map((_,i)=>{const t=[...tuple];t[i]--;return {tuple:t.sort((a,b)=>a-b),...upper(t)};});
  let value=children.reduce((sum,r)=>sum+r.value,0)+2-tuple.length;
  const parity=value%2===0&&children.some(r=>r.value%2===0);
  if(parity) value--;
  const expression=`${children.map(r=>r.value.toLocaleString('en')).join(' + ')}${tuple.length===3?' − 1':''}${parity?' − 1 (parity)':''} = ${value.toLocaleString('en')}`;
  const result={value,source:'survey-18',derivation:{rule:'upper-recurrence',inputs:children.map(r=>({tuple:r.tuple,bound:r.value})),parity,explanation:`The recurrence in §6.1(a), using ${children.map(r=>`${display(r.tuple)} ≤ ${r.value.toLocaleString('en')}`).join('; ')}, gives ${expression}. Inputs are sourced bounds or recursive consequences; this is not asserted to be the sharpest upper bound.`}};
  upperMemo.set(id,result);return result;
}
const lowerSeeds=new Map(seeds.threeColourLower.map(r=>[key(r.tuple),r]));
const lower33=new Map([[2,{value:6,source:'survey-18'}]]);
for(let k=3;k<=50;k++) {
  const seed=lowerSeeds.get(`3-3-${k}`);
  let best=seed?{value:seed.lower,source:seed.source,evidence:seed.evidence,location:seed.location}:{value:0};
  if(k>=5) {
    const input=lowerTwo.get(k-1);
    assert(input,`Missing two-colour lower seed for ${k-1}`);
    const candidate=4*input.value-3;
    if(candidate>best.value) best={value:candidate,source:'survey-18',evidence:`Derived using ${input.evidence}`,location:'§6.2(g)',support:[input.source],derivation:{rule:'four-times-two-colour',inputs:[{tuple:[3,k-1],bound:input.value,source:input.source}],explanation:`The construction in §6.2(g) gives R(3, 3, ${k}) ≥ 4R(3, ${k-1}) − 3 ≥ 4 × ${input.value.toLocaleString('en')} − 3 = ${candidate.toLocaleString('en')}. See the input source below; witness graphs have not been independently verified by this site.`}};
  }
  for(let p=2;p<k;p++) {
    const q=k-p+1,a=lower33.get(p),b=lower33.get(q),candidate=a.value+b.value-1;
    if(candidate>best.value) best={value:candidate,source:'join-construction',evidence:`Derived by a join; input evidence: ${a.evidence||'sourced bound'}; ${b.evidence||'sourced bound'}`,location:'Complete join in colour 3',support:[a.source,b.source,...(a.support||[]),...(b.support||[])],derivation:{rule:'colour-three-join',inputs:[{tuple:[3,3,p],bound:a.value},{tuple:[3,3,q],bound:b.value}],explanation:`Join witnesses on ${a.value-1} and ${b.value-1} vertices, colouring all cross-edges in colour 3. The largest colour-3 clique has at most (${p} − 1) + (${q} − 1) = ${k-1} vertices. Hence ${a.value} + ${b.value} − 1 = ${candidate} is a lower bound.`}};
  }
  lower33.set(k,best);
}
const targets=new Map(seeds.threeColourLower.map(r=>[key(r.tuple),r.tuple]));
for(let k=3;k<=50;k++) targets.set(`3-3-${k}`,[3,3,k]);
const existing=new Set(baseRecords.map(r=>key(r.tuple)));
const generated=[];
for(const tuple of targets.values()) {
  if(existing.has(key(tuple))) continue;
  const seed=lowerSeeds.get(key(tuple));
  const low=tuple[0]===3&&tuple[1]===3?lower33.get(tuple[2]):{value:seed.lower,source:seed.source,evidence:seed.evidence,location:seed.location};
  const high=upper(tuple);
  assert(low.value<=high.value,`Contradictory bounds: ${tuple}`);
  const support=new Set([...(low.support||[]),'survey-18','Boza9']);
  support.delete(low.source);support.delete(high.source);
  const r={id:`r-${key(tuple)}`,colours:3,tuple,lower:low.value,upper:high.value,lowerSource:low.source,upperSource:high.source,lowerLocation:low.location,upperLocation:'§6.1(a); Tables Ia–Ib and IIa for two-colour inputs',lowerEvidence:low.evidence,upperEvidence:'Derived recurrence bound; includes preprint and surveyed computational inputs',supportingSources:[...support],note:seed&&low.value>seed.lower?`The survey explicitly lists the lower bound ${seed.lower}; the displayed construction yields ${low.value}.`:(seed?.note||''),checkedDate:catalogue.checkedDate,generatedBy:'three-colour-v1'};
  if(low.derivation) r.lowerDerivation=low.derivation;
  r.upperDerivation=high.derivation;
  generated.push(r);
}
const result=[...baseRecords,...generated].sort((a,b)=>a.colours-b.colours||a.tuple.reduce((n,v,i)=>n||v-b.tuple[i],0));
if(process.argv.includes('--check')) {
  assert.deepEqual(catalogue.records,result,'Generated catalogue differs; run node scripts/derive-three-colour.mjs');
  console.log(`Reproduced ${generated.length} generated records; ${result.filter(r=>r.colours===3).length} three-colour cases.`);
} else {
  catalogue.records=result;
  await writeFile(catalogueUrl,JSON.stringify(catalogue,null,2)+'\n');
  console.log(`Wrote ${result.length} records, including ${generated.length} new three-colour cases.`);
}
