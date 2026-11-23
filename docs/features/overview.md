# What Rachv Adds

Rachv builds on the upstream KiriKiri Web reader for Fate/stay night. The upstream project provides the browser reader and the machinery that loads the story scripts and presents their images, text, music, and sound effects. Rachv keeps that foundation and adds a more configurable reading interface, additional navigation tools, browser-based progress records, and phone-specific behavior.

This page describes the main additions in everyday terms.

## At a glance

| Area | What Rachv provides |
| --- | --- |
| Reading presentation | NVL, Textbox, and Scrolling modes, with reader appearance settings |
| Reading controls | Back, Auto, Skip, Log, Hide, Settings, and Scenes controls |
| Reading history | A backlog of recently displayed text pages |
| Progress | A resume position and a record of indexed scenes visited |
| Save management | Three browser-local save slots and JSON export/import |
| Route navigation | Route selection, day shortcuts, and a scene flowchart |
| Mobile behavior | Visible-height handling, optional fullscreen/landscape behavior, and touch-friendly controls |
| Hosting support | Vercel configuration and web-app metadata/icons |

## 1. More ways to read

Readers can choose between three presentations:

- **NVL:** text appears directly over the scene image, without a conventional dialogue box.
- **Textbox:** text appears in a fixed box near the bottom of the scene, similar to a traditional visual-novel layout.
- **Scrolling:** the original page-scrolling presentation remains available.

The paged modes share the same basic reading controls. Readers can advance or go back using taps, clicks, keyboard keys, or the mouse wheel. The settings menu also provides controls for text appearance and keyboard shortcuts.

See [Reading experience](reading-experience.md).

## 2. A reading backlog and progress records

Rachv keeps a local reading log of recently displayed pages. It also remembers the current reading position so a reader can return to the point where they stopped. The progress screen summarizes visited scenes and the route-related values currently available to the reader.

These records are stored in the browser. They are not automatically shared between devices or browsers.

See [Progress and saves](progress-and-saves.md).

## 3. Save slots and portable save files

The **Settings → Progress** tab provides three save slots. A reader can also export progress to a JSON file and import that file in another browser. Before an import replaces the current progress, Rachv keeps a local backup of the previous state.

The import process checks the save file's application identifier and supported version before accepting it.

## 4. Route and scene navigation

The scene list has a route bar for Fate, Unlimited Blade Works, and Heaven's Feel. It also provides shortcuts for jumping to a day and a flowchart that shows how indexed scenes connect. Scene highlighting helps readers trace the scenes that lead to or follow a selected scene.

See [Routes and scene navigation](routes-and-navigation.md).

## 5. Phone-specific reading behavior

Rachv accounts for the changing visible height of mobile browsers. When the landscape option is enabled, it makes a best-effort request for fullscreen and landscape orientation after a user gesture. Where the browser cannot lock orientation, a rotate-device prompt can be shown, with an option to continue in portrait.

The mobile reading controls are designed for touch and, on sufficiently wide landscape screens, sit in the unused side area beside the 4:3 story display rather than covering the scene.

See [Mobile reading](mobile-reading.md).

## 6. What these additions do not mean

A few boundaries are important:

- Rachv loads story assets from the upstream site's asset host; deploying the reader does not automatically copy those assets to the deployment host.
- Browser-local progress is not cloud synchronization. Use the export/import feature to move it manually.
- The route progress display is based on indexed scenes visited. It is not a guaranteed measure of full route completion.
- The reader evaluates supported conditions in the generated scene graph, but it is not a complete replacement for the original game's engine-level state and scripting behavior.
- A web manifest and service worker do not make every story asset available offline. Offline reading depends on whether the required assets have already been cached and whether the asset host can be reached.

## Relationship to upstream

Rachv is intended to extend the upstream reader rather than replace its underlying story content or generated scene data. The project retains the upstream React/Create React App foundation and generated scene and asset indexes, while adding or changing the feature areas described above. See [Application structure](../architecture/application-structure.md) for the main code locations.
