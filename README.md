# CFR Playwright Scripts

Playwright checks for https://cryptofaxreport.com.

## Scripts

- `npm run lint` runs ESLint with `eslint-plugin-playwright`.
- `npm run screenshot` captures screenshots for the covered paths.
- `npm run record` records one portrait and one landscape video while navigating the covered paths.
- `npm run clean` removes generated screenshots, videos, and Playwright output.

## Coverage

- Covers `/`, `/reports/bitcoin`, `/research`, `/market-info`, `/news`, `/blog`, and `/blog/fake-tokens-and-impersonation-scams-a-practical-crypto-safety-playbook`.
- Captures full-page screenshots on iPhone 15 Pro Max portrait and landscape projects.
- Records videos for the same mobile projects, waiting 4 seconds after navigation, scrolling to the bottom, then waiting another 5 seconds on each covered page.
- Runs in Forgejo Actions on a daily cron and manual dispatch.

## Outputs

- Screenshots are written to `screenshots/URLPATH-DEVICE-ORIENTATION-TIMESTAMP.png`.
- Videos are written to `videos/DEVICE-ORIENTATION-TIMESTAMP.webm`.
- `screenshots/` and `videos/` are gitignored.
