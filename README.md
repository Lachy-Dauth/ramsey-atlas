# Ramsey Atlas

A browsable, sourced catalogue of exact values and known lower and upper bounds for classical clique Ramsey numbers.

**[Open the site](https://lachy-dauth.github.io/ramsey-atlas/)**

## Coverage

121 intervals, checked against the literature on **26 September 2026**:

- Two colours: all `3 ≤ s ≤ t ≤ 10`, plus `R(3,t)` for `11 ≤ t ≤ 15`.
- Three colours: **70 cases**, including every `R(3,3,k)` for `3 ≤ k ≤ 50`, diagonal cases `R(k,k,k)` through `k=10`, and selected mixed-clique cases.
- Four colours: selected small diagonal and off-diagonal cases.
- Five through nine colours: diagonal triangle Ramsey numbers `R_r(3)`.

Every interval uses **inclusive endpoints**: `lower ≤ R ≤ upper`. A lower-bound construction has `lower − 1` vertices. Exact values have equal endpoints.

This is a curated, dated research snapshot, not a claim to cover every Ramsey number or a live literature feed. Directed, hypergraph, size, induced, and non-clique variants are outside scope.

## Sources and evidence

The baseline is Stanisław P. Radziszowski’s [Small Ramsey Numbers, revision 18 (24 April 2026)](https://www.cs.rit.edu/~spr/ElJC/ejcram18.pdf), [DOI: 10.37236/21](https://doi.org/10.37236/21).

Two-colour upper bounds use **Table Ib** where stronger than Table Ia. Many of these are unpublished computations reported in the published survey. Recent multicolour upper bounds include [Boza’s March 2026 preprint](https://arxiv.org/abs/2603.10851). Some lower bounds are also preprints or survey-listed personal communications. The site labels evidence status per endpoint and does not describe every result as peer reviewed.

The reported entries were checked against the cited survey and newer primary sources. Derived extensions are not asserted to be best known; corrections with primary sources are welcome. Asymptotic results are outside the catalogue and must not be used to infer a numerical endpoint without explicit constants and a valid derivation.

## Run locally

No build step or dependencies are needed. From the repository root:

```sh
python3 -m http.server 8765 --directory docs
```

Open `http://localhost:8765/`. Serve over HTTP; opening `index.html` directly from disk may prevent the JSON catalogue loading.

## Update a bound

Edit [`docs/data/ramsey.json`](docs/data/ramsey.json), the single source of truth. Each record contains:

- Canonical sorted `tuple`, number of `colours`, and matching `id`.
- Integer `lower` and `upper` endpoints.
- Separate source IDs, locations, and evidence labels for each endpoint.
- A check date, explanatory note, and any supporting source IDs.

Add or update the referenced source metadata, preserve publication-status caveats, and cite a primary proof or witness, or a clearly identified authoritative survey. For a new record, update the displayed coverage counts and README scope. A dataset-wide review should update `checkedDate`, the dates on all reviewed records, and the visible HTML review date together; a partial update should retain accurate per-record check dates and adjust validation accordingly.

Run:

```sh
node --check docs/app.js
node scripts/check-data.mjs
node scripts/derive-three-colour.mjs --check
```

The checks validate intervals, unique canonical tuples, citation integrity, matrix coverage, and the claimed multicolour triangle recurrence. They do **not** independently verify mathematical proofs or witness graphs. GitHub Actions runs them on pushes and pull requests.

## Derived three-colour bounds

**Derived** labels mark calculated endpoints, which are not asserted to be the strongest currently known. The extended catalogue includes reported lower bounds from survey Tables XIa–XIb and §6.1(f), the August 2026 [Coniglio et al. preprint](https://arxiv.org/abs/2608.18769), and an explicitly labelled [author-reported R(3,17) witness](https://github.com/ypwang61/ScaleAutoResearch-Ramsey). This site has not independently certified those witness graphs.

The reproducible inputs are [`docs/data/three-colour-seeds.json`](docs/data/three-colour-seeds.json), together with the existing two-colour records in the main catalogue. Extend those inputs and run `node scripts/derive-three-colour.mjs` to regenerate the records marked `generatedBy: "three-colour-v1"`. Do not edit generated values by hand.

Upper bounds use the multicolour recurrence in survey §6.1(a), with the latest small three-colour anchors, two-colour upper bounds, and parity refinement. For a numerical bound B equal to the sum of child bounds plus 2 minus the colour count, if B is even and a child bound is even, B−1 is valid: at order B−1 every degree would be forced to its maximum, producing an odd-regular graph on an odd number of vertices. This proof works with upper bounds as inputs; they need not be exact values.

For R(3,3,k), lower bounds take the maximum of a directly surveyed bound, `4L(3,k−1)−3` for k≥5 (survey §6.2(g)), and complete joins in colour three. Joining witnesses for R(3,3,p) and R(3,3,q) gives a lower bound `L_p + L_q − 1` for R(3,3,p+q−1): cross edges cannot form a triangle in the first two colours, and a third-colour clique has at most p+q−2 vertices. The selected derivation is stored with each endpoint.

Examples: `269 ≤ R(3,3,15) ≤ 1019`, `293 ≤ R(3,3,16) ≤ 1212`, and `1641 ≤ R(3,3,50) ≤ 37562`. The upper bounds are computed; the lower bound 293 improves the explicitly tabulated 291 by applying the construction to R(3,15)≥74. These are not claims of new research records. General formulas permit extending further; 50 is the current displayed range.

## GitHub Pages

The site is static HTML, CSS, JavaScript and JSON under `docs/`, with relative URLs so project Pages paths work. In repository **Settings → Pages**, use **Deploy from a branch**, branch **main**, folder **/docs**. Changes pushed to `main` are published automatically by GitHub Pages.

Links such as `#r-4-4-4` open a specific entry. The interface supports keyboard navigation, mobile tables, and downloadable JSON. There are no analytics, third-party scripts, or external runtime dependencies.
