'use strict';

const view = document.getElementById('data-view');
const detail = document.getElementById('detail');
const tabs = [...document.querySelectorAll('[role="tab"]')];
let catalogue;
let activeColours = 2;
let threeFamily = 'triangles';
let threeRange = '3-16';
let selectedId = 'r-5-5';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format = value => value.toLocaleString('en');
const name = r => `R(${r.tuple.join(', ')})`;
const diagonal = r => r.tuple.every(v => v === r.tuple[0]);
const label = r => r.colours >= 5 && diagonal(r) ? `R<sub>${r.colours}</sub>(${r.tuple[0]})` : escape(name(r));
const labelText = r => r.colours >= 5 && diagonal(r) ? `${r.colours}-colour triangle Ramsey number` : name(r);
const exact = r => r.lower === r.upper;
const byId = id => catalogue.records.find(r => r.id === id);
const sourceLink = (id, text) => `<a class="source-link" href="${escape(catalogue.sources[id].url)}" target="_blank" rel="noopener noreferrer">${escape(text || catalogue.sources[id].title)} <span aria-hidden="true">↗</span></a>`;

function rows(records) {
  return `<div class="list-scroll" tabindex="0" role="region" aria-label="Ramsey bounds table"><table class="bounds-table"><caption class="sr-only">Inclusive lower and upper bounds. Select a Ramsey number to inspect its sources.</caption><thead><tr><th scope="col">Ramsey number</th><th scope="col">Lower</th><th scope="col">Upper</th><th scope="col">Status</th></tr></thead><tbody>${records.map(r => `<tr data-row="${r.id}" class="${r.id === selectedId ? 'selected' : ''}"><th scope="row"><button data-record="${r.id}" aria-label="Inspect ${escape(labelText(r))}" aria-pressed="${r.id === selectedId}">${label(r)}</button>${r.colours >= 5 ? `<span class="row-context">${r.colours} colours</span>` : ''}</th><td>${format(r.lower)}${r.lowerDerivation ? '<span class="derived-label">Derived</span>' : ''}</td><td>${format(r.upper)}${r.upperDerivation ? '<span class="derived-label">Derived</span>' : ''}</td><td><span class="status-pill ${exact(r) ? 'exact' : ''}">${exact(r) ? 'Exact' : 'Unsolved'}</span></td></tr>`).join('')}</tbody></table></div>`;
}

function matrix() {
  const ks = [3,4,5,6,7,8,9,10];
  return `<div class="matrix-wrap" tabindex="0" role="region" aria-label="Two-colour bounds matrix, scroll horizontally on small screens"><table class="matrix"><caption class="sr-only">R(s,t), with row s and column t. Single values are exact; pairs are inclusive lower and upper bounds.</caption><thead><tr><th scope="col"><span aria-label="row s, column t">s ∖ t</span></th>${ks.map(k => `<th scope="col">${k}</th>`).join('')}</tr></thead><tbody>${ks.map(s => `<tr><th scope="row">${s}</th>${ks.map(t => {
    if (t < s) return '<td class="empty" aria-label="By symmetry, see transposed entry">·</td>';
    const r = byId(`r-${s}-${t}`);
    return `<td><button class="${exact(r) ? 'exact ' : ''}${s===t ? 'diagonal' : ''}" data-record="${r.id}" aria-label="${escape(name(r))}: ${exact(r) ? `exactly ${r.lower}` : `${r.lower} to ${r.upper}, inclusive`}" aria-pressed="${r.id===selectedId}">${exact(r) ? format(r.lower) : `<span>${format(r.lower)}</span><span class="interval-divider" aria-hidden="true">—</span><span>${format(r.upper)}</span>`}</button></td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div><details class="extra-values" ${byId(selectedId)?.tuple[1] > 10 ? 'open' : ''}><summary>More triangle cases: R(3, t), t = 11–15</summary>${rows(catalogue.records.filter(r => r.colours===2 && r.tuple[1]>10))}</details>`;
}

function familyOf(r) {
  if(r.tuple[0]===3 && r.tuple[1]===3) return 'triangles';
  return diagonal(r) ? 'diagonal' : 'other';
}

function threeColourView() {
  const all = catalogue.records.filter(r=>r.colours===3);
  let filtered=all.filter(r=>threeFamily==='triangles' ? r.tuple[0]===3 && r.tuple[1]===3 : threeFamily==='diagonal' ? diagonal(r) : !(r.tuple[0]===3&&r.tuple[1]===3)&&!diagonal(r));
  if(threeFamily==='triangles') {
    const [lo,hi]=threeRange.split('-').map(Number);
    filtered=filtered.filter(r=>r.tuple[2]>=lo&&r.tuple[2]<=hi);
  }
  return `<div class="family-controls"><label>Family<select id="three-family"><option value="triangles" ${threeFamily==='triangles'?'selected':''}>Two triangles · R(3, 3, k)</option><option value="other" ${threeFamily==='other'?'selected':''}>Other mixed cliques</option><option value="diagonal" ${threeFamily==='diagonal'?'selected':''}>Equal cliques · R(k, k, k)</option></select></label>${threeFamily==='triangles'?`<label>Third clique size<select id="three-range">${['3-16','17-30','31-50'].map(range=>`<option value="${range}" ${range===threeRange?'selected':''}>${range.replace('-','–')}</option>`).join('')}</select></label>`:''}</div><p class="derivation-notice">Entries marked <strong>Derived</strong> use established formulas and sourced inputs. These are valid bounds; they are not claimed to be the best known.</p>${rows(filtered)}`;
}

function derivationText(value) {
  return value ? `<p class="derivation-explanation">${escape(value.explanation)}</p>` : '';
}

function renderDetail(r, announce = false) {
  selectedId = r.id;
  const diagonalText = diagonal(r) ? `A monochromatic clique on ${r.tuple[0]} vertices, in any of the ${r.colours} colours.` : `A clique on ${r.tuple.map((k,i)=>`${k} vertices in colour ${i+1}`).join(', or ')}.`;
  detail.innerHTML = `<button class="back-to-table" type="button">Back to table</button><p class="detail-kicker">${r.colours} colours${diagonal(r) ? ' / diagonal' : ''}</p><h3>${label(r)}</h3><span class="status ${exact(r) ? 'exact' : ''}">${exact(r) ? 'Known exactly' : 'Still unsolved'}</span><div class="bound-equation">${exact(r) ? `<span>R = </span>${format(r.lower)}` : `${format(r.lower)} <span>≤ R ≤</span> ${format(r.upper)}`}</div><p>${escape(diagonalText)}</p><hr><h4>${exact(r) ? 'Exact value' : `Lower bound · ${format(r.lower)}`}</h4>${sourceLink(r.lowerSource)}<p class="provenance">${escape(r.lowerEvidence)}${r.lowerSource==='survey-18' ? `<br>${escape(r.lowerLocation)}` : ''}</p>${derivationText(r.lowerDerivation)}${exact(r) && r.lowerSource===r.upperSource ? '' : `<h4>${exact(r) ? 'Upper-bound proof' : `Upper bound · ${format(r.upper)}`}</h4>${sourceLink(r.upperSource)}<p class="provenance">${escape(r.upperEvidence)}${r.upperSource==='survey-18' ? `<br>${escape(r.upperLocation)}` : ''}</p>${derivationText(r.upperDerivation)}`}${r.note ? `<p class="detail-note">${escape(r.note)}</p>` : ''}${r.supportingSources.length ? `<h4>Further reading</h4>${r.supportingSources.map(id=>sourceLink(id)).join('')}` : ''}<p class="provenance checked">Checked ${escape(r.checkedDate)}</p>`;
  document.querySelectorAll('[data-record]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.record===r.id)));
  document.querySelectorAll('[data-row]').forEach(row => row.classList.toggle('selected',row.dataset.row===r.id));
  if (announce) document.getElementById('view-announcement').textContent = `${labelText(r)} selected. ${exact(r) ? `Exact value ${r.lower}` : `Lower bound ${r.lower}, upper bound ${r.upper}`}. Sources are in the selected-number panel.`;
}

function showColours(colours, preferred, updateHash = true) {
  activeColours = colours;
  const records = catalogue.records.filter(r => colours===5 ? r.colours>=5 : r.colours===colours);
  const defaults = {2:'r-5-5',3:'r-3-3-15',4:'r-3-3-3-3',5:'r-3-3-3-3-3'};
  selectedId = records.some(r=>r.id===preferred) ? preferred : defaults[colours];
  tabs.forEach(tab => {const active=Number(tab.dataset.colours)===colours;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active ? 0 : -1;});
  document.getElementById('results').setAttribute('aria-labelledby',`tab-${colours}`);
  document.getElementById('view-description').textContent = ({2:'Two-colour Ramsey numbers R(s, t)',3:'Three-colour Ramsey numbers',4:'Selected four-colour Ramsey numbers',5:'Triangle Ramsey numbers in 5–9 colours'})[colours];
  if(colours===3) {
    const r=byId(selectedId);
    threeFamily=familyOf(r);
    threeRange=r.tuple[2]<=16?'3-16':r.tuple[2]<=30?'17-30':'31-50';
  }
  view.innerHTML = colours===2 ? matrix() : colours===3 ? threeColourView() : rows(records);
  document.getElementById('table-note').innerHTML = colours===2 ? 'Row s, column t. A single value is exact; stacked values are lower and upper bounds. Both endpoints are inclusive. Select a cell for sources.' : 'Both endpoints are inclusive: L ≤ R ≤ U. Select a number to see its sources.';
  if (colours===5) view.insertAdjacentHTML('beforeend','<p class="formula-note">R<sub>r</sub>(3) means R(3, …, 3) with r arguments. The upper bounds for 5–9 colours follow the established recurrence R<sub>r</sub>(3) ≤ r(R<sub>r−1</sub>(3) − 1) + 2, starting with R₄(3) ≤ 62.</p>');
  renderDetail(byId(selectedId));
  if(updateHash) history.replaceState(null,'',`#${selectedId}`);
  document.getElementById('view-announcement').textContent = `${colours===5 ? 'Five and more' : colours} colours, ${records.length} entries.`;
}

function syncHash() {
  const id=location.hash.slice(1), r=byId(id);
  if(r) showColours(Math.min(r.colours,5),r.id,false);
}

async function initialise() {
  try {
    const response = await fetch('./data/ramsey.json');
    if (!response.ok) throw new Error('Catalogue request failed');
    catalogue = await response.json();
    const featured=['survey-18','angeltveit-mckay-r55','angeltveit-r310','Boza9','nagda-raghavan-thakurta-2026'];
    document.getElementById('source-list').innerHTML=featured.map(id=>`<div class="source-entry">${sourceLink(id)}<p>${escape(catalogue.sources[id].authors)} · ${escape(catalogue.sources[id].date)}<br>${escape(catalogue.sources[id].status)}</p></div>`).join('');
    const initial=byId(location.hash.slice(1));
    showColours(initial ? Math.min(initial.colours,5) : 2,initial?.id,false);
    tabs.forEach((tab,index)=>{
      tab.addEventListener('click',()=>showColours(Number(tab.dataset.colours)));
      tab.addEventListener('keydown',event=>{
        let next;
        if(event.key==='ArrowRight') next=(index+1)%tabs.length;
        if(event.key==='ArrowLeft') next=(index+tabs.length-1)%tabs.length;
        if(event.key==='Home') next=0;
        if(event.key==='End') next=tabs.length-1;
        if(next!==undefined){event.preventDefault();tabs[next].focus();showColours(Number(tabs[next].dataset.colours));}
      });
    });
    detail.addEventListener('click',event=>{
      if(event.target.closest('.back-to-table')) document.getElementById('results').scrollIntoView({block:'start'});
    });
    view.addEventListener('change',event=>{
      const control=event.target;
      if(control.id!=='three-family' && control.id!=='three-range') return;
      if(control.id==='three-family') threeFamily=control.value;
      else threeRange=control.value;
      view.innerHTML=threeColourView();
      const first=view.querySelector('[data-record]');
      if(first) {
        renderDetail(byId(first.dataset.record),true);
        history.replaceState(null,'',`#${first.dataset.record}`);
      }
      document.getElementById(control.id)?.focus();
    });
    view.addEventListener('click',event=>{
      const button=event.target.closest('[data-record]');
      if(!button) return;
      const r=byId(button.dataset.record);
      renderDetail(r,true);
      history.replaceState(null,'',`#${r.id}`);
      if(matchMedia('(max-width: 800px)').matches) detail.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
    window.addEventListener('hashchange',syncHash);
  } catch(error) {
    view.innerHTML='<p class="error">The catalogue could not be loaded. <a href="./">Reload the page</a> or <a href="./data/ramsey.json">open the data file</a>.</p>';
    tabs.forEach(tab=>{tab.disabled=true;});
    document.getElementById('view-announcement').textContent='The catalogue could not be loaded.';
  }
}
initialise();
