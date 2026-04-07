# ATS Matching Preferences

The main user-editable matching file is:

- `config/matching-preferences.json`

## What to edit

- `targetFunctions`: your core role families
- `preferredLocations`: where you want to work
- `includeRemote`: whether remote roles stay in scope
- `industriesOfInterest`: sectors you want the scanner to prioritize
- `companiesOfInterest`: optional companies to seed into the watchlist
- `positiveKeywords`: ATS and JD terms you want matched
- `negativeKeywords`: terms you want filtered out
- `conceptMatches`: themes that matter even if the title varies

## Good examples for business roles

- strategy
- business operations
- strategic initiatives
- go-to-market
- revenue operations
- program management
- strategic finance
- financial modeling
- capacity planning
- portfolio management
- enablement
- stakeholder management

## Workflow

1. Edit `config/matching-preferences.json`
2. Regenerate `portals.yml`

```bash
npm run refresh-search
```

3. Run your next scan

Ask Claude Code to run a job scan.
