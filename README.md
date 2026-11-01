# metatemple

A permitted adaptation of the sansatemple.com visual runtime, with metatemple branding, multilingual UI, 7 temple halls and a hard admission limit of 100 visitors per hall. The owner confirmed permission to reuse the original runtime and creative assets in this chat. No original source repository was supplied; the deployed browser module is retained in `reference/vendor` and adapted by `scripts/reference/prepare-reference.mjs`.

## Run

```sh
npm run install:ci
npm run dev -- --port 3010
```

The project uses React / Vinext, Cloudflare D1 and the original Three.js rendering runtime. The main page mounts `components/native-temple.tsx`. `public/temple/renderer.js` retains the original temple, Buddha, mural, novice characters, walking / bowing / greeting, original 3D prayer beads, outdoor areas, sound settings and moonlight radio.

The runtime has been adapted to use only local assets and `public/temple/presence.js`. It does not connect to the reference site's presence server, Supabase or analytics. The reference developer's bank account and payment links are removed. The bowl button opens an 18-language virtual rice offering panel with $1, $5 and $10 USD choices. Payments remain disabled; sandbox preparation and remaining integration work are documented in `docs/paypal-setup.md`.

## Rooms and admission

- 7 hall IDs: `maru`, `maru-02` … `maru-07`.
- A conditional SQLite insert admits at most 100 active visitors per hall. Capacity checking and slot allocation happen in the same statement inside a D1 batch.
- An existing visitor can renew their place in a full room. A denied transfer retains their previous room.
- Visitor slots are unique within each room. Cushion reservations are unique and exclude six cushions reserved for ambient residents.
- Presence expires after 18 seconds without updates; expired records are removed during the next update.
- Anonymous HttpOnly visitor tokens derive separate public IDs. Virtual coordinates, actions, chosen display names and short-lived speech are shared within a hall. Messages are limited to 120 characters and expire after 12 seconds.
- The transport refreshes on movement with a 450ms minimum interval and sends idle heartbeats every 1.2 seconds. This is not a load-tested 700-person WebSocket deployment.

Each hall has 12 indoor ambient residents (six bowing and six standing) and 10 outdoor ambient residents. These NPCs are excluded from actual visitor counts. Six of the 100 cushions are reserved for residents, leaving 94 reservable cushions. Every hall still accepts 100 real visitors; remaining visitors can walk or use the prayer beads.

## Recent interface updates

- Temple preview backgrounds and real loading stages before entry, with language selection and retry support.
- Editable display names. Speech appears above names in compact 12px bubbles with dismiss controls.
- A two-row mobile header keeps all five tool buttons in view.
- Hall 1 retains its original interior; halls 2–7 no longer switch architecture, lighting or zoom at the entrance.

## Localization

English defaults on first entry. The language parameter in the URL takes priority, followed by the remembered device preference. The globe button offers English, Japanese, Simplified / Traditional Chinese, Thai, Vietnamese, Burmese, Khmer, Sinhala, Lao, Mongolian, Tibetan, Nepali, Spanish, French, German, Portuguese and Korean.

UI text and accessibility labels are localized. The Korean hall name is 연화당. Hall 1 retains the original architecture; halls 2–7 preserve their themed architecture when visitors enter the interior. Operational labels use the 18-locale dictionaries. Extended source credits and less common status details fall back to English. Temple recordings retain their original language. Native-speaker review remains appropriate before a public launch.

## Assets and audio

`public/temple/asset-manifest.json` retains the exact SHA-256 hashes of the 27 visual assets from the reference release. Assets are self-hosted; nothing is hotlinked to the reference asset service.

The Buddha originates from the National Museum of Korea (Deoksu 2116, KOGL Type 1). The original temple field recording is Kim Yong-bae's “염불소리1”, Gongu Madang, CC BY 4.0. The moonlight courtyard's four original music tracks and artwork retain their original artist credits. See `/credits` and the audio license text for attribution.

## Validation

```sh
npx tsc --noEmit
node tests/native-runtime.mjs
node tests/capacity.mjs
node tests/exteriors.mjs
node tests/residents.mjs
node tests/arrival.mjs
node tests/offerings.mjs
node tests/presence.mjs
node tests/speech.mjs
node tests/names.mjs
```

The presence, speech and name integration tests use a running local preview. `TEMPLE_TEST_URL` can select another test deployment. It creates and removes two anonymous test visitors. The capacity test runs the exact admission SQL against SQLite and checks rejection of the 101st visitor, full-room renewal, denied-transfer preservation, unique slots, and cushion reservations. It is a correctness test, not a concurrent-user load benchmark.

## Build and local database

Use the installed Sites `scripts/build-site.mjs` helper. The hosting manifest retains the same Site project and D1 binding. For a new local database, apply the numbered SQL migrations in `drizzle/` in ascending order, once each, through Wrangler with the built `dist/server/wrangler.json` and `.wrangler/state` persistence directory. Hosting applies production migrations during publication.

## Hosting

The reviewed deployment remains owner-private. The visible title is **metatemple**. The supplied domain `metatemple.net` is displayed as the brand domain; no DNS records or custom-domain routing have been changed.
