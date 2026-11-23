# KiriKiri Web

A [KiriKiri](https://en.wikipedia.org/wiki/List_of_visual_novel_engines#KiriKiri) engine specifically written to power the [web version of Fate/Stay Night](https://fatestaynight.vnovel.org).

## Social

Join [our Discord](https://discord.gg/ejespgUpgg)!

## Development

PRs welcome!

To get the project running, you will need node installed, then simply:

1. Clone the repo.
2. Run `npm ci` to install dependencies.
3. Run `npm start` to start the development server.
4. Navigate to https://localhost:3000.

Note that:

- Changes to source files will be reloaded automatically.
- Static assets will be loaded on-demand from the live site, so an internet connection is required. (See `"proxy"` in [package.json](./package.json))

## Reading modes

Settings (ESC) → *Reading* → *Mode*:

- **NVL** (default): the page of text is laid straight over the picture, top-left, under a deep-blue veil, like the
  console *Realta Nua* release. A pale-blue chevron sits right after the last character on the page. Choices appear in the
  lower half of the picture at the end of the scene. The *Overlay darkness* slider controls the veil.
- **Textbox**: a fixed text box along the bottom of the screen (the original PC layout).
- **Scrolling**: the original scroll-through page.

NVL and Textbox share the same input: click / tap, `Enter`, `Space`, `→` or `↓` (or wheel down) to advance;
`Shift+Space`, `←`, `↑` (or wheel up) to go back. Long passages are split into pages.
Quick buttons: Back, Auto, Skip, Hide, Log, Settings (`Esc`) and Scenes. The Controls settings tab lets readers choose a font, adjust its size, and assign unique keyboard shortcuts.

The paged modes live in [watcher.js](./src/reader/scroll/watcher.js) (the "VN mode" section, plus `positionMarker()` for the
NVL chevron), [reader.js](./src/reader/reader.js) and the `.vn-*` / `.nvl` rules in [reader.css](./src/reader/reader.css).

## Scene list, routes & phones

- **Route bar** ([routebar.js](./src/home/graph/routebar/routebar.js)): sticky buttons for Fate / UBW / HF (replacing the old
  side arrows), "jump to day" chips, and a key to the lines. `←` / `→` and swiping sideways also switch route. The settings
  menu has the same three route buttons.
- **Flowchart**: curved connectors with arrowheads ([arrows](./src/home/graph/arrows)). Pointing at (or tabbing to) a scene lights
  the scenes that follow it in cyan and the ones that lead to it in amber; everything else fades.
- **Clicking mid-scene**: taps/keys are ignored while a scene's picture and sound are still loading (a small diamond pulses), a
  tap while the picture fades in only reveals the text, and two hand-made inputs closer than `MIN_INPUT_GAP`
  ([watcher.js](./src/reader/scroll/watcher.js)) count as one. Auto and Skip are unaffected.
- **Phones** ([src/options/mobile](./src/options/mobile)): `--vh` tracks the visible height, the first tap while reading asks for
  fullscreen + landscape lock (Android Chrome), and portrait shows a "rotate your device" cover where that is not possible
  (iPhone Safari). Settings → Reading → *Force landscape* turns it off. Swipe left / right to turn pages.

## Look & feel

The palette lives in `:root` in [index.css](./src/index.css) (`--fate-*`): night blue, silver, cyan highlight, and the
command-seal red used only for small diamond marks and "on" states. Headings use *Cinzel* (loaded from Google Fonts in
`public/index.html`, with serif fallbacks). The settings menu is a full-screen, console-style menu
([menu.js](./src/options/menu/menu.js) / [menu.css](./src/options/menu/menu.css)); choice buttons and scene tiles share the
same clipped-corner "glass plate" shape.

## How it Works / Repo Organization

Static assets extracted from the original Visual Novel are loaded on demand, these are collected under `https://fatestaynight.vnovel.org/static/`

```shell
├── bgm         # top-level music folder
│   ├── classic # original music
│   ├── ps2     # ps2 music
│   └── vita    # ps vita music
├── images      # top-level images folder
│   ├── eng     # modified / translated
│   ├── h       # alternate versions
│   └── mature  # alternate versions
├── scripts     # script files (*.ks) containing game logic
│   ├── eng     # translated
│   │   └── h   # alternate versions
│   └── jp      # original language
│       └── h   # alternate versions
├── sound       # sound effects
└── voice       # voice lines
```

The exception to this, is a couple indexes which are generated alongside the above assets, but are included directly in this repo.<br/>
(See [lookup.js](./src/resources/lookup.js) and the [generated/](./src/resources/generated) folder for more details.)

Tools for extracting & converting assets are in a separate repo, see https://github.com/Kent-H/kirikiri-web-helper.<br/>
(Please request access via discord.)

### Notable Components

- Most pages are rendered by the [Reader](./src/reader/reader.js) component, which among other things, is responsible for:

    1. Displaying the current scene's text, handling user input & navigation.
    2. Detecting the user's progression through the text.
    3. Displaying the appropriate animation (including music & sounds) for the currently visible text.

- The above text & animations are extracted from KiriKiri scripts, loaded by a separate, dedicated [Script Loader](./src/interpreter/script-loader.js) component, which performs a few logical steps:

    1. [Tokenize](./src/interpreter/parse/tokenize.js) - Reads in a \*.ks file and outputs tokens.
    2. [Interpret](./src/interpreter/parse/interpreter.js) - Receives tokens from tokenizer and updates gamestate.
    3. [Render](./src/interpreter/parse/render.js) - Creates animation segments based on progression of the gamestate.

- A [home page](./src/home/home.js) exists to support navigating the full visual novel, and includes:
    - A short introduction & site tutorial.
    - A graph of every scene, including connectivity between scenes.

## Backlog, resume and scene changes

- **Log** (`L`, or the *Log* button): every page read so far, newest at the bottom, grouped under the scene it came from.
  It is kept in `localStorage` (last 400 pages) and has a *Clear* button. `Esc` / `L` close it.
- **Where you left off**: the scene, section and page are saved as you read ([progress.js](./src/progress/progress.js)).
- **Progress & save files**: the Progress settings tab tracks indexed scenes visited for each route, stores three local save slots, and supports JSON export/import for moving progress between browsers or devices. Imports are version-validated and keep a local pre-import backup. Settings are included in exported save files.
- **Choice history**: explicit scene-branch selections are recorded alongside visited scenes and the backlog. This is a record of choices, not a reconstruction of the original game's affection values or hidden flags.
  The scene list shows a *Where you left off* plate at the top and opens on the route you were reading, scrolled to that
  scene (marked in red). Scenes you have opened carry a small cyan diamond. Reloading the page in the middle of a scene
  returns to the same page.
- **Limits of progression tracking**: scene coverage is not a true route-completion percentage. Conditional branches that depend on original game flags are not fully simulated; the ordinary path is used where the reader cannot resolve a flag, and H scenes are taken when enabled ([next.js](./src/reader/next.js)).
- **No *Continue* button**: when a scene has only one way on, the NVL / Textbox readers go to the next scene by
  themselves when you advance past the last page (click, key, or Auto), and a *Scene change* notice names it. Auto stays
  on across scenes; Skip carries on only into scenes already read. Real choices still appear as buttons. Where a branch
  depends on a game flag (which isn't tracked here) the ordinary path is taken; H scenes are taken when they are on
  ([next.js](./src/reader/next.js)). The *Scrolling* mode keeps its *Continue* button.
- **Scene list**: one route at a time in a single column (the route plate at the top opens a list of the three routes),
  instead of three columns sliding side by side ([route.js](./src/home/graph/route.js)).

## Route progression and save state

The reader now evaluates the generated `graphLogic` conditions against a persistent game-flag store (`src/progress/game-state.js`). Scene `update` instructions are applied when a scene is entered; conditional branches support the comparison and boolean operators used by the generated graph (`==`, `!=`, `>=`, `<=`, `>`, `<`, `&&`, `||`). The parser is intentionally restricted and does not use `eval`.

Game flags are stored separately from the browser HTTP cache and are included in version-2 exported saves and save slots. Version-1 save files remain importable and start with empty game flags. The `ghentai` and `gmature` graph conditions are derived from the reader's existing H-content and mature-content settings.

The supplied route flowcharts and generated scene graph describe route gates, affection thresholds, endings, and bad-end branches. This implementation replays the conditions and updates present in the generated graph; it does not execute the original game's Kirikiri scripts or reproduce its full engine-level state, combat logic, or presentation scripting.
