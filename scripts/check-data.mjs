import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const data = JSON.parse(await readFile(new URL('../docs/data/ramsey.json', import.meta.url), 'utf8'));
assert.equal(data.schemaVersion,1);
const ids = new Set();
for (const r of data.records) {
  assert(!ids.has(r.id),`Duplicate record: ${r.id}`); ids.add(r.id);
  assert.equal(r.id,`r-${r.tuple.join('-')}`);
  assert.equal(r.colours,r.tuple.length);
  assert(r.tuple.every((k,i)=>Number.isInteger(k)&&k>=3&&(i===0||k>=r.tuple[i-1])),`Invalid tuple: ${r.id}`);
  assert(Number.isSafeInteger(r.lower)&&Number.isSafeInteger(r.upper)&&r.lower<=r.upper,`Invalid interval: ${r.id}`);
  for(const key of ['lowerSource','upperSource']) assert(data.sources[r[key]],`Missing source: ${r.id} ${key}`);
  for(const id of r.supportingSources) assert(data.sources[id],`Missing further source: ${id}`);
  assert(r.lowerEvidence && r.upperEvidence,`Missing evidence status: ${r.id}`);
  assert.equal(r.checkedDate,data.checkedDate);
}
for(const s of Object.values(data.sources)) {
  assert.equal(new URL(s.url).protocol,'https:');
  assert(s.title&&s.authors&&s.status,`Incomplete source: ${s.url}`);
}
for(let s=3;s<=10;s++) for(let t=s;t<=10;t++) assert(ids.has(`r-${s}-${t}`),`Missing matrix entry R(${s},${t})`);
for(let t=11;t<=15;t++) assert(ids.has(`r-3-${t}`));
for(let colours=3;colours<=9;colours++) assert(data.records.some(r=>r.colours===colours));
// Check Ramsey monotonicity constraints where both comparable records are present.
for(const a of data.records) for(const b of data.records) {
  if(a.colours===b.colours&&a.tuple.every((v,i)=>v<=b.tuple[i])) assert(a.lower<=b.upper,`Inconsistent intervals: ${a.id} and ${b.id}`);
}
// These five-to-nine-colour upper endpoints are claimed to follow this recurrence.
let prior=data.records.find(r=>r.id==='r-3-3-3-3').upper;
for(let k=5;k<=9;k++) {
  const r=data.records.find(r=>r.colours===k&&r.tuple.every(n=>n===3));
  assert.equal(r.upper,k*(prior-1)+2,`Triangle recurrence mismatch for ${k} colours`); prior=r.upper;
}
console.log(`Validated ${data.records.length} intervals, ${Object.keys(data.sources).length} sources, matrix coverage and triangle recurrence.`);
