# Application Structure

This page describes the main parts of the Rachv source tree and how they work together. It is a guide to the current repository, not a complete reference for every component.

## Main application flow

The application starts in `src/index.js`, which initializes the mobile viewport helper and renders `src/App.js`. The app-level components connect the home/scene list, reader, settings, and routing behavior.

## Main folders

| Folder | Responsibility |
| --- | --- |
| `src/home/` | Home page, introduction, scene flowchart, route bar, and resume entry points |
| `src/reader/` | Story reader, reading controls, scene animation, choices, backlog, and scene transitions |
| `src/interpreter/` | Loads and interprets the extracted KiriKiri script data used by the reader |
| `src/progress/` | Browser-local resume data, visited scenes, save slots, export/import, and game flags |
| `src/options/` | Reader settings, settings menu, mobile helpers, and small UI utilities |
| `src/router/` | Route definitions and navigation integration |
| `src/resources/` | Resource lookup helpers, titles, and generated scene/asset indexes |

## Reader and script loading

`src/reader/reader.js` is the main reading component. It coordinates the visible story, controls, scene choices, and scene-change notices. The animation component displays the current scene's visual layers and coordinates its audio timelines.

`src/interpreter/script-loader.js` loads a script. The parsing code under `src/interpreter/parse/` tokenizes the script, interprets its instructions, and creates the data used by the reader to display text and animation.

## Progress storage

`src/progress/progress.js` handles browser-local reading records and save snapshots. `src/progress/game-state.js` stores and evaluates the supported game flags used by generated scene-graph conditions. These are kept separate from the browser's HTTP asset cache: clearing or evicting cached files is not the same as intentionally deleting a save record, although clearing all site data can remove both.

## Generated resources

The `src/resources/generated/` folder contains generated scene and asset indexes used by the reader and navigation views. The actual images, music, voice, sound effects, and script assets are loaded from the upstream asset host rather than being bundled in this repository.

## Styling

Styles are generally kept near the feature they affect, such as `reader.css`, `controls.css`, and `mobile.css`. Shared colors and global reader rules are in `src/index.css`.

## Where to make common changes

- Reading layout: `src/reader/reader.css`
- Reading toolbar: `src/reader/controls/controls.js` and `controls.css`
- Reading modes and behavior: `src/reader/scroll/watcher.js` and `src/options/`
- Scene list and route bar: `src/home/graph/`
- Progress and save behavior: `src/progress/`
- Mobile viewport and orientation behavior: `src/options/mobile/`
- Asset path lookup: `src/resources/lookup.js`
