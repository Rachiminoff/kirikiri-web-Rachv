# Changes

## Updated files

- `src/reader/scroll/watcher.js` — Auto now estimates its wait from the currently visible page rather than the entire script section, uses the existing Slow/Normal/Fast preference, caps the wait at seven seconds, and rechecks Auto/pause conditions when the timer fires. Existing lifecycle cleanup and manual-advance cancellation remain in place.
- `src/reader/controls/controls.js` — removed the in-game Scenes button; Auto and Skip continue to expose their pressed state through `aria-pressed`.
- `src/reader/controls/controls.css` — standardized the control dock's sizing, spacing, focus/active/disabled treatment, and mobile touch targets.
- `src/reader/reader.js` — removed the now-unused scene-list destination passed to the control bar.
- `src/options/menu/menu.js` and `src/options/menu/menu.css` — removed the Settings-side route selector, its navigation code/imports, and the route-selector-only styles. Route progress reporting remains in the Progress tab.
- `src/home/home.js` — replaced the scrolling introduction/always-visible graph landing page with a title-screen menu, conditional Continue action, route selection panel, and a route flowchart view after route selection.
- `src/home/home-screen.css` — added responsive title-screen, footer menu, route panel, and route-view styling.

## Auto diagnosis

The previous Auto timer calculated its delay from the full text section divided by the number of pages, rather than from the page currently being read. Long sections therefore commonly reached the 12-second maximum, making Auto appear unresponsive. The timer callback also did not re-check the pause conditions before advancing. The revised scheduler measures the visible page and validates the current mode/overlay state at fire time.

## Confirmation notes

- The quick control bar retains the actions that already existed there (Back, Auto, Skip, Log, Hide, Settings). Save/Load remain in Settings → Progress, where the existing slot-based and import/export workflows live; I did not invent a default save slot for one-tap Save/Load buttons.
- Continue is shown only when the saved resume record points to a known scene. Start/Select Route reveals the three route choices; selecting one opens that route's existing flowchart.
- Settings → Progress still displays route progress. Only the route-choice buttons were removed from Settings.
