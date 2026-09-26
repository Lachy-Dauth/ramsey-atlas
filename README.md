# Ramsey Atlas

A browsable, sourced catalogue of exact values and known lower and upper bounds for classical clique Ramsey numbers.

**[Open the site](https://lachy-dauth.github.io/ramsey-atlas/)**

## Coverage

58 intervals, checked against the literature on **26 September 2026**:

- Two colours: all `3 ≤ s ≤ t ≤ 10`, plus `R(3,t)` for `11 ≤ t ≤ 15`.
- Three and four colours: selected small diagonal and off-diagonal cases.
- Five through nine colours: diagonal triangle Ramsey numbers `R_r(3)`.

Every interval uses **inclusive endpoints**: `lower ≤ R ≤ upper`. A lower-bound construction has `lower − 1` vertices. Exact values have equal endpoints.

This is a curated, dated research snapshot, not a claim to cover every Ramsey number or a live literature feed. Directed, hypergraph, size, induced, and non-clique variants are outside scope.

## Sources and evidence

The baseline is Stanisław P. Radziszowski’s [Small Ramsey Numbers, revision 18 (24 April 2026)](https://www.cs.rit.edu/~spr/ElJC/ejcram18.pdf), [DOI: 10.37236/21](https://doi.org/10.37236/21).

Two-colour upper bounds use **Table Ib** where stronger than Table Ia. Many of these are unpublished computations reported in the published survey. Recent multicolour upper bounds include [Boza’s March 2026 preprint](https://arxiv.org/abs/2603.10851). Some lower bounds are also preprints or survey-listed personal communications. The site labels evidence status per endpoint and does not describe every result as peer reviewed.

Subsequent literature searches found no later improvement for the included finite cases. This does not establish that none exists; corrections with primary sources are welcome. Asymptotic results are outside the catalogue and must not be used to infer a numerical endpoint without explicit constants and a valid derivation.

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
```

The checks validate intervals, unique canonical tuples, citation integrity, matrix coverage, and the claimed multicolour triangle recurrence. They do **not** independently verify mathematical proofs or witness graphs. GitHub Actions runs them on pushes and pull requests.

## GitHub Pages

The site is static HTML, CSS, JavaScript and JSON under `docs/`, with relative URLs so project Pages paths work. In repository **Settings → Pages**, use **Deploy from a branch**, branch **main**, folder **/docs**. Changes pushed to `main` are published automatically by GitHub Pages.

Links such as `#r-4-4-4` open a specific entry. The interface supports keyboard navigation, mobile tables, and downloadable JSON. There are no analytics, third-party scripts, or external runtime dependencies.
