Voici les GitHub Actions que je mettrais en place pour ton repo, dans un ordre de priorité “ROI maximal”, avec une approche monorepo pnpm (root lockfile) + Next.js + Vitest + Playwright.

---

## 1) CI Frontend obligatoire: lint, format, typecheck, tests, build

Objectif: garantir que `apps/web` reste toujours “green”.

**Déclencheurs**

- `pull_request` (toujours)
- `push` sur `main`

**Étapes**

- checkout
- setup pnpm + Node (je recommande Node **20 LTS** ou **22 LTS** en CI)
- `pnpm install --frozen-lockfile`
- `pnpm --filter web format:check`
- `pnpm --filter web lint:ci`
- `pnpm --filter web typecheck`
- `pnpm --filter web test:run`
- `pnpm --filter web build`

**Pourquoi**

- C’est la base qualité; aucun merge sans ça.

---

## 2) E2E Playwright en CI (sur PR), avec artifacts (trace, report)

Objectif: valider les parcours critiques, sans dépendre de ton VPS (et éviter les soucis liés à ton Ubuntu non-LTS).

**Étapes**

- installer les browsers Playwright (`pnpm --filter web exec playwright install --with-deps chromium`)
- lancer `pnpm --filter web e2e`
- uploader artifacts en cas d’échec:
  - `playwright-report/`
  - `test-results/` (traces)

**Pourquoi**

- Les E2E sont ceux qui te sauvent en prod.
- Et en CI tu contrôles l’environnement (Ubuntu 24.04), donc moins de surprises.

---

## 3) Workflow “Paths filters” (optimisation monorepo)

Objectif: ne pas exécuter le CI web quand tu modifies uniquement:

- `apps/api/**` (Go)
- `infra/**`
- docs

Tu peux conditionner l’exécution sur les chemins `apps/web/**` + fichiers globaux (lockfile, config).

**Pourquoi**

- Moins de minutes CI, plus rapide.

---

## 4) Dépendances: Dependabot (ou Renovate)

Objectif: PR automatiques pour upgrades de dépendances (Next, ESLint, Vitest, Playwright…).

**Configuration**

- weekly (ou bi-weekly)
- group updates (ex: “eslint ecosystem”, “testing”, “next/react”)
- limiter le nombre de PR ouvertes

**Pourquoi**

- Tu as dit vouloir suivre les mises à jour de libs: c’est exactement ce qui évite les gros sauts douloureux.

---

## 5) Sécurité: CodeQL + secret scanning

### CodeQL (JavaScript/TypeScript)

- scan sur `main` + PR
- faible friction

### Secret scanning

- GitHub l’active souvent automatiquement selon le repo, mais autant vérifier.
- Ajoute aussi un `gitleaks` en option si tu veux être strict.

**Pourquoi**

- Repo public + futur produit = surface d’attaque.
- Ça coûte presque rien.

---

## 6) Qualité “garde-fous”: PR checks + branch protection

Pas une Action, mais essentiel:

- empêcher merge si CI rouge
- exiger au moins 1 check (web-ci)
- optionnel: “Require linear history”

**Pourquoi**

- Ça te protège contre les merges accidentels.

---

## 7) Optionnel mais très utile: Preview deployments

Selon ton hébergeur:

- Vercel previews (le plus simple pour Next)
- ou une preview sur un VPS dédié

**Pourquoi**

- Pour un blog/admin, voir la PR en ligne est souvent plus rapide que lire le code.

---

# Ce que je mettrais en place dès maintenant (minimum pro)

1. `web-ci.yml` (format/lint/typecheck/test/build)
2. `web-e2e.yml` (Playwright + artifacts)
3. Dependabot
4. CodeQL

Ensuite seulement: path filters + preview deployments.

---

Si tu veux, je peux te donner directement les fichiers prêts à copier:

- `.github/workflows/web-ci.yml`
- `.github/workflows/web-e2e.yml`
- `.github/dependabot.yml`
- `.github/workflows/codeql.yml`

Dis-moi juste:

- tu veux Node **20** ou **22** en CI ?
- et tu préfères exécuter Playwright **sur chaque PR** ou seulement sur `main` (ou nightly) ?

---

---

---

Oui, traite ça comme une vraie feature “infra/CI”. Tu vas modifier plusieurs fichiers sensibles (`.github/…`, éventuellement `package.json`, scripts), donc la meilleure approche est une **branche dédiée + PR**, avec validation par GitHub Actions elles-mêmes.

---

## 1) Organisation Git recommandée

### A) Crée une branche dédiée

Depuis `main` à jour :

```bash
git checkout main
git pull
git checkout -b ci/setup-github-actions
```

### B) Découpe en commits cohérents (important)

Tu as deux stratégies :

**Option 1 (simple)** : un commit par workflow

- `ci: add web ci workflow`
- `ci: add web e2e workflow`
- `ci: add codeql workflow`
- `chore: add dependabot config`

**Option 2 (plus compact)** : un ou deux commits max

- `ci: add github actions for web checks and e2e`
- `chore: add dependabot and code scanning`

Je préfère Option 1 : plus facile à relire, à revert, à diagnostiquer.

### C) Ouvre une PR tôt

Pousse la branche dès que tu as le premier workflow :

```bash
git push -u origin ci/setup-github-actions
```

Puis ouvre une PR. Même si tu es solo, c’est la meilleure façon de **tester**.

---

## 2) Comment tester (et valider) tes Actions

### A) Le test principal : la PR elle-même

Dès que tu pushes une modification dans `.github/workflows/*.yml`, GitHub va :

- détecter le workflow
- le lancer selon `on: pull_request` / `on: push`

Tu testes donc “en vrai” sur GitHub, ce qui est le plus fiable.

### B) Vérifier que les triggers sont bons

Pour éviter de te tromper :

- au début, mets `on: [pull_request, push]` (sur ta branche + main)
- ensuite tu affines quand tout marche

Exemple (simple) :

```yaml
on:
  pull_request:
  push:
    branches: [main]
```

### C) Forcer un run sans changer le code

Ajoute temporairement :

```yaml
on:
  workflow_dispatch:
```

Ça te permet de lancer manuellement depuis GitHub → onglet **Actions**.

Je te recommande de le garder au moins pendant la mise au point.

### D) Debug rapide en cas d’échec

- Les logs GitHub Actions sont très bons
- Pour Playwright, conserve les artifacts (report/trace) en cas d’échec

---

## 3) Vérifications locales avant push (pour éviter le cycle lent)

Avant chaque push, lance exactement ce que la CI fera pour `apps/web` :

```bash
pnpm --filter web format:check
pnpm --filter web lint:ci
pnpm --filter web typecheck
pnpm --filter web test:run
pnpm --filter web build
```

Et si tu veux valider E2E localement :

```bash
pnpm --filter web e2e
```

Cela réduit énormément le “push → fail → fix”.

---

## 4) Plan de travail concret (1–2 heures)

### Étape 1 — Workflow “web-ci”

- format:check
- lint:ci
- typecheck
- test:run
- build

✅ Objectif : vert dès le premier push de la PR

### Étape 2 — Workflow “web-e2e”

- install Playwright chromium + deps
- run `pnpm --filter web e2e`
- upload artifacts en cas d’échec

✅ Objectif : vert et débogable

### Étape 3 — Dependabot

- `.github/dependabot.yml`
- fréquence hebdo
- group updates

### Étape 4 — CodeQL

- scan JS/TS
- planifié + PR

---

## 5) “Garde-fous” côté GitHub (après que la PR est verte)

Une fois les workflows ok, tu peux activer :

- Branch protection sur `main`
- Require status checks: `web-ci` (et `web-e2e` si tu veux)
- Require PR before merge (même solo, utile)

---

## 6) Option avancée : tester les workflows localement

Tu peux utiliser `act` (outil qui exécute GitHub Actions localement), mais sur un VPS c’est souvent plus de friction qu’autre chose, surtout avec Playwright. La PR reste le meilleur test.

---

### Recommandation finale

Oui : **branche dédiée + PR**, et tu testes en conditions réelles via GitHub Actions. Commence par `web-ci`, valide, puis ajoute `web-e2e`.

Si tu me dis si tu veux Node **20 LTS** ou **22 LTS** pour la CI, je te donne directement les deux workflows prêts à copier, optimisés pour pnpm + monorepo.
