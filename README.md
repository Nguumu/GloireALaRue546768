# TCG Collection Platform

Plateforme de gestion de collection de cartes à jouer (TCG), pensée pour **One
Piece Card Game** au lancement, avec un modèle de données assez générique pour
accueillir d'autres jeux (Pokémon, Magic, Dragon Ball, Lorcana...) sans
réécriture.

Ce document couvre : la vision produit, les choix d'architecture et pourquoi,
l'arborescence du monorepo, le schéma de données, les interfaces
d'extensibilité (`TCGAdapter`, `CardDataProvider`, `PriceProvider`,
`DeckExporter`), l'état d'avancement réel par phase, et comment lancer le
projet en local.

## 1. Philosophie

Priorité constante : **application légère, rapide, peu coûteuse à héberger et
à maintenir**, plutôt qu'une infrastructure impressionnante sur le papier.
Concrètement :

- Pas de microservices, pas de queue, pas d'Elasticsearch, pas de GraphQL :
  Postgres (Supabase) + Next.js font l'essentiel du travail.
- Recherche, filtres et pagination **côté serveur** — jamais des milliers de
  cartes chargées côté client.
- Le maximum de code (types, validation, règles métier, requêtes DB, logique
  de deck) est partagé entre le web et le mobile via des packages ; seule la
  couche UI et le client Supabase (cookies web vs AsyncStorage mobile)
  diffèrent réellement.
- Chaque dépendance ajoutée doit résoudre un problème réel, maintenant.

## 2. Stack

| Domaine | Choix | Pourquoi |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | Cache de build, tâches parallèles, sans la lourdeur de Nx |
| Web | Next.js 14 (App Router) + Tailwind | Rendu serveur, SEO natif, un seul framework pour pages publiques + app |
| Mobile | Expo + Expo Router | Partage max de code avec le web via les packages ; pas de build natif géré à la main |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) | Pas de backend Node séparé à maintenir ; RLS pour la sécurité au niveau ligne |
| Validation | Zod | Un seul schéma pour formulaires web, mobile et validation serveur |
| État serveur | Requêtes directes en Server Components (Next), Server Actions + `useTransition` pour les mutations | Pas de TanStack Query : la Phase 2 (collection, doubles, dashboard) n'en a pas eu besoin — `revalidatePath` + Server Actions suffisent. À réévaluer si une vraie mutation optimiste devient nécessaire |
| État global | Aucun (pas de Redux/Zustand) | Rien ne le justifie encore ; à réévaluer si un état vraiment transverse apparaît |
| Styling web | Tailwind CSS | Léger, zéro CSS-in-JS runtime |
| Styling mobile | React Native `StyleSheet` natif | NativeWind évalué mais pas retenu pour l'instant : le partage web/mobile réel vient des *packages logique*, pas des styles — voir §7 |

## 3. Arborescence du monorepo

```
/apps
  /web              Next.js 14 (App Router, Tailwind)
  /mobile           Expo + Expo Router
/packages
  /types            Types TypeScript partagés (Game, Card, CardPrinting, Deck, ...)
  /utils            Argent (centimes entiers), pagination, schémas Zod
  /tcg-core         TCGAdapter, OnePieceAdapter, règles de deck, staples, providers
  /database         Client Supabase (browser/server/admin), migrations SQL, requêtes, seed
  /ui               Design system web (Tailwind) : Button, Input, Badge, CardThumbnail...
```

Chaque package s'exporte directement en TypeScript source (`main`:
`./src/index.ts`) — Next.js et Metro le transpilent via `transpilePackages` /
Babel, pas de step de build séparé par package. Ça garde l'itération rapide et
évite d'ajouter un bundler par package alors que 6 packages internes n'en ont
pas besoin.

## 4. Schéma de données (Supabase/Postgres)

Migrations dans `packages/database/supabase/migrations/`, appliquées dans
l'ordre. **26 tables, 48 policies RLS**, validées contre un Postgres 16 réel
pendant le développement (voir §9).

- **0001** — catalogue jeu-agnostique : `games`, `sets`, `cards`,
  `card_printings`, `products`, `card_printing_product_sources`. Lecture
  publique, écriture réservée au `service_role` (scripts de sync) ou aux
  admins. `cards.metadata jsonb` porte les attributs propres à un jeu qui ne
  généralisent pas (voir §6). Recherche full-text (`tsvector` généré) +
  trigram sur le nom.
- **0002** — `profiles` (1 par utilisateur Supabase Auth, créé automatiquement
  via un trigger `on_auth_user_created`).
- **0003** — collection : `storage_locations` (hiérarchie optionnelle),
  `collection_entries` (quantité + `keep_quantity` → doubles, condition,
  achat, localisation), `grading_companies`, `graded_cards`,
  `sealed_product_entries`. RLS : accès strictement au propriétaire.
- **0004** — `collection_lists` (+ `collection_list_items`), `wishlist_items`,
  `price_alerts`.
- **0005** — `market_prices` (un snapshot **par jour**, pas de tick — suffisant
  pour les graphiques 7j/30j/3m/1an), `trade_listings` (SELL/BUY/TRADE, sans
  paiement intégré).
- **0006** — `decks`, `deck_cards`, `deck_guides` (markdown).
- **0007** — `conversations`, `chat_messages`, `blocked_users`, `news_posts`
  (`is_confirmed` distingue officiel/rumeur).
- **0008** — policies admin (`profiles.role in ('ADMIN','MODERATOR')`) sur le
  catalogue, et `feature_flags` (une ligne par flag, pas de SaaS — voir §8).
- **0009** — triggers `updated_at`.

Argent : toujours en **centimes entiers** (`*_minor integer`), jamais en
float — voir `@tcg/utils` `formatMoney`.

## 5. Types partagés (`@tcg/types`)

Un type TypeScript par entité du schéma (`Game`, `CardSet`, `Card`,
`CardPrinting`, `Product`, `CollectionEntry`, `Deck`, `MarketPrice`,
`TradeListing`, `NewsPost`, `ChatMessage`, ...), plus les types transverses
(`Money`, `PaginatedResult`, `CardCondition` en union fermée). C'est le
contrat entre le schéma SQL, `@tcg/database` et l'UI — voir
`packages/types/src/`.

## 6. Interfaces d'extensibilité

Quatre interfaces, dans `@tcg/tcg-core`, permettent d'ajouter un nouveau jeu,
une nouvelle source de données ou un nouveau format d'export **sans toucher
au reste de l'app** :

```ts
interface TCGAdapter {
  gameCode: string;
  getDeckRules(): DeckRules;
  getCardFilters(): CardFilterDefinition[];
  validateDeck(deck: DeckList): DeckValidationResult;
  calculateDeckCompatibility(deck: DeckList, owned: Map<ID, number>): DeckOwnershipSummary;
  parseDeckList(text: string, resolveCard: (n: string) => Card | undefined): ParsedDeckList;
  exportDeckList(deck: DeckList): string;
}
```

Seul `OnePieceAdapter` est complet (règles de deck : leader + exactement 50
cartes, max 4 exemplaires, couleurs compatibles avec le leader — voir
`adapters/one-piece/rules.ts`). Un `PokemonAdapter`/`MagicAdapter` futur
implémente la même interface et s'enregistre dans `adapters/registry.ts`.

```ts
interface CardDataProvider {
  fetchGames(): Promise<NormalizedGame[]>;
  fetchSets(gameCode): Promise<NormalizedSet[]>;
  fetchCards(gameCode): Promise<NormalizedCard[]>;
  fetchPrintings(gameCode): Promise<NormalizedCardPrinting[]>;
  fetchProducts(gameCode): Promise<NormalizedProduct[]>;
}
```

`LocalJsonCardDataProvider` (fixture OP01, 11 cartes, 13 impressions, 2
produits) est le seul implémenté — pour le MVP, sans API externe payante.
`packages/database/src/scripts/sync-cards.ts` upsert le résultat d'un
provider dans Postgres (idempotent, testé). Remplacer par une vraie API =
implémenter l'interface, rien d'autre à changer.

```ts
interface PriceProvider {
  marketplace: string;
  fetchPrice(query: PriceQuery): Promise<PriceQuote | null>;
}
interface NewsProvider {
  fetchLatest(gameCode: string): Promise<NormalizedNewsItem[]>;
}
interface DeckExporter {
  format: string;
  export(deck: DeckList): string;
}
```

`PriceProvider`/`NewsProvider` n'ont **aucune implémentation** dans le MVP —
volontairement : section 27 du brief interdit le scraping non autorisé, donc
tant qu'aucune source de prix sous licence n'est branchée, mieux vaut une
interface propre et vide qu'une implémentation qui scrape en douce.
`DeckExporterRegistry` n'a que le format `"text"` (copier/coller interne) :
ni Bandai TCG+ ni les simulateurs OP ne publient de format/API public
documenté à ce jour — voir le commentaire dans
`packages/tcg-core/src/deck/index.ts`.

## 7. Web ↔ Mobile : ce qui est réellement partagé

- **Partagé tel quel** : `@tcg/types`, `@tcg/utils` (Zod, argent, pagination),
  `@tcg/tcg-core` (règles de deck, staples, providers), et surtout
  `@tcg/database`'s **query functions** (`searchCards`, `getCardDetail`,
  `getProductsForPrintings`, `listGames`...) — elles prennent un
  `SupabaseClient` générique et n'ont aucune dépendance Next.js ou React
  Native. `apps/mobile/app/search.tsx` appelle littéralement la même
  fonction `searchCards` que `apps/web`.
- **Pas partagé, par choix assumé** : le bootstrap du client Supabase
  (`@supabase/ssr` + cookies côté web, `@supabase/supabase-js` +
  AsyncStorage côté mobile — les deux plateformes n'ont pas la même notion de
  session persistante) et les composants visuels (`@tcg/ui` est Tailwind/DOM,
  web uniquement). NativeWind permettrait de partager le *styling* mais pas
  la logique — qui est déjà le partage le plus précieux — donc non retenu
  tant que ce n'est pas un vrai besoin (règle §59 du brief : ne pas ajouter
  une techno qui ne résout pas un problème actuel).

## 8. Feature flags

Table `feature_flags` (une ligne = une clé, un booléen). Pas de plateforme
SaaS de feature flags — inutile à cette échelle. Flags actuels, tous à
`false` par défaut :

- `ENABLE_BINDER_SCAN` — scan de page de classeur complète (section 15,
  expérimental)
- `ENABLE_AUTO_DECK_BUILDER` — proposition de deck à partir de la collection
  (Phase 6)
- `ENABLE_MARKETPLACE` — offres SELL/BUY/TRADE (Phase 7)
- `ENABLE_CHAT` — messagerie privée (Phase 7)

## 9. État d'avancement réel

### Phase 1 — Foundation : **fait et vérifié**

- Monorepo (Turborepo + pnpm), schéma DB complet avec RLS, `@tcg/types`,
  `@tcg/utils`, `@tcg/tcg-core`, `@tcg/ui`.
- Auth Supabase complète : inscription, connexion, déconnexion, mot de passe
  oublié, callback de confirmation email, session persistante via cookies
  (middleware de refresh).
- Recherche de cartes serveur (full-text + filtres couleur/rareté/type,
  pagination, filtres dans l'URL), fiche carte avec **toutes les versions**
  et **"disponible dans"** (section 6/7 du brief).
- Nav responsive (bottom nav mobile), dark/light mode sans flash.
- Design URLs SEO : `/one-piece/cards/op01-016`.
- Vérifié pour de vrai : les 9 migrations s'appliquent sans erreur sur un
  Postgres 16 local ; le script de seed est idempotent (deux exécutions de
  suite → mêmes comptes de lignes) ; **les pages ont été testées dans un
  vrai navigateur (Chromium/Playwright) contre PostgREST branché sur ce
  Postgres** — recherche, filtre par nom, fiche carte avec impressions et
  produits, tout retourne les vraies données de la fixture OP01. Capture de
  ce test disponible sur demande (non committée — c'est un test local, pas
  un artefact du produit).
- Non vérifié contre un vrai Supabase (car hors de portée de ce bac à
  sable, toujours sans Docker) : la Phase 2 (voir ci-dessous) a testé le
  flux d'auth de bout en bout contre un faux serveur GoTrue écrit pour
  l'occasion (mêmes routes `/auth/v1/signup`, `/token`, `/user`, mêmes JWT
  HS256 signés avec le `jwt-secret` que PostgREST vérifie) — ça valide le
  contrat (cookies, `auth.uid()`, RLS) mais ce n'est pas le vrai GoTrue.
  **À revalider contre un vrai projet Supabase avant mise en prod.** L'app
  mobile est type-checkée mais pas lancée dans un simulateur (aucun
  simulateur iOS/Android disponible ici).

### Phase 2 — Collection : **fait et vérifié**

- `/collection` : liste paginée de la collection, tri (récentes, quantité,
  nom, extension, rareté, personnage) et filtres (extension, rareté,
  couleur) dans l'URL, édition inline (quantité, quantité à conserver,
  emplacement, note, disponible à l'échange), suppression.
- Ajout à la collection depuis la fiche carte, par impression (quantité,
  état, emplacement en texte libre créé-ou-réutilisé, prix d'achat, date,
  note) — fusionne avec l'entrée existante (même impression + état) plutôt
  que dupliquer.
- `/collection/doubles` : cartes où quantité > quantité à conserver, avec
  le toggle "disponible à l'échange" (section 18).
- `/dashboard` : cartes possédées, cartes uniques, prix d'achat total,
  doubles, cartes gradées/produits scellés (0 pour l'instant), récemment
  ajoutées — agrégats calculés côté serveur par une fonction Postgres
  (`get_my_collection_stats`, une seule requête, jamais tout le tableau
  rapatrié pour sommer côté client). "Valeur estimée" et "Master Set"
  affichent honnêtement "—" plutôt qu'un chiffre inventé, en attendant la
  Phase 5 (prix) et une future vue de progression par extension.
- Nouvelle migration **0010** : une vue `collection_entries_detailed`
  (jointure collection ⋈ impression ⋈ carte ⋈ set ⋈ emplacement,
  `security_invoker = true` pour que les RLS de `collection_entries`
  s'appliquent toujours) qui rend le tri/filtre/pagination triviaux sans
  dépendre du typage fragile des embeds PostgREST imbriqués (voir le
  commentaire dans `database.types.ts`).
- Vérifié pour de vrai : migration 0010 appliquée sur Postgres local:
  inscription réelle via le formulaire → trigger `on_auth_user_created` →
  profil créé ; ajout d'une carte → apparaît dans `/collection` ; édition
  de la quantité à conserver → la carte apparaît dans `/collection/doubles`
  avec le bon nombre de surplus ; `/dashboard` affiche les bons agrégats
  (testé : 6 cartes, 1 unique, 12,50 € d'achat, 1 double) — tout via un
  script Playwright qui pilote un vrai navigateur à travers le vrai
  formulaire d'inscription, pas un raccourci API. Un bug réel a été trouvé
  et corrigé pendant ce test (la vignette de carte débordait dans
  `/collection` à cause d'un conflit de classes Tailwind `w-full`/`w-20`).

### Phase 3 à 7 : **schéma prêt, logique métier pure prête, UI pas commencée**

- Import/export CSV, scan carte/continu/binder : pas commencés (le scan
  carte nécessite une lib OCR côté client — à choisir en gardant le bundle
  léger, ex. tesseract.js seulement si nécessaire).
- Deck builder : `TCGAdapter.validateDeck`/`calculateDeckCompatibility` sont
  **déjà testés unitairement** (§10) ; il manque l'UI (`/decks/new`,
  liste communautaire, guides).
- Prix, wishlist, alertes, gradées, scellé : schéma + RLS prêts ; pas de
  `PriceProvider` réel branché (voir §6) ; pas d'UI.
- Staples : moteur de calcul (`computeStapleStats`) testé unitairement ; pas
  encore appelé depuis une UI ni un job planifié.
- Communauté (chat, offres, actualités) : schéma + RLS prêts ; UI pas
  commencée ; `ENABLE_CHAT`/`ENABLE_MARKETPLACE` à `false`.

## 10. Tests

```
packages/tcg-core  16 tests — règles de deck OP (leader, 50 cartes, 4 copies,
                              couleurs), parsing/export de decklist, calcul de
                              manque (missing cards), moteur de staples
packages/utils     18 tests — argent (centimes entiers, pas de dérive float),
                              pagination, schémas Zod (signup/login/collection)
```

`pnpm test` (racine) les lance tous via Turborepo. Composants purement
visuels non testés unitairement, conformément à la section 52 du brief.

## 11. Lancer le projet en local

Prérequis : Node 20+, pnpm 9, un projet Supabase (ou `supabase start` en
local si Docker est disponible — voir note ci-dessous).

```bash
pnpm install

# Base de données : appliquer les migrations sur votre projet Supabase
# (dashboard SQL editor, ou `supabase db push` avec la CLI), puis :
DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres" pnpm db:seed

# Variables d'environnement
cp apps/web/.env.example apps/web/.env.local        # à remplir
cp apps/mobile/.env.example apps/mobile/.env        # à remplir
cp packages/database/.env.example packages/database/.env

pnpm dev          # tout (web + mobile)
pnpm dev:web      # web seul
```

> **Note environnement de développement de cette session** : ce sandbox n'a
> pas de daemon Docker, donc `supabase start`/`supabase gen types` n'ont pas
> pu tourner. Le schéma a été validé contre un Postgres 16 installé
> nativement (avec un schéma `auth` minimal simulé), et le bout-en-bout web a
> été validé contre PostgREST (pas la stack Supabase complète — GoTrue/Auth
> n'a donc pas été testé pour de vrai). `packages/database/src/types/database.types.ts`
> est donc écrit à la main plutôt que généré ; régénérez-le avec
> `supabase gen types typescript` dès qu'un vrai projet existe.

## 12. Sécurité — ce qui est déjà en place

- RLS activée sur les 26 tables ; chaque table utilisateur (collection,
  wishlist, decks privés, messages...) restreinte à `auth.uid() = user_id`
  (ou aux deux participants pour les conversations).
- Aucune clé secrète (`SUPABASE_SERVICE_ROLE_KEY`) référencée côté client —
  seulement dans `@tcg/database`'s `createSupabaseAdminClient`, appelé
  uniquement depuis des scripts serveur.
- Validation Zod sur les entrées serveur (auth, recherche), pas seulement
  côté client.
- Rate limiting, modération de contenu et upload : pas encore implémentés —
  à ajouter avant toute fonctionnalité d'upload (Phase 3+) ou de contenu
  utilisateur public (Phase 7).
