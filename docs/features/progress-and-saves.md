# Progress and Saves

Rachv stores reading progress in the browser's local storage. This means progress normally remains available in the same browser on the same device, but it is not automatically synchronized with another device.

## Resume position

As the reader moves through a scene, Rachv records the current scene, section, and page position. Returning through the scene list's resume entry, or reloading a scene page, can restore the saved reading position.

## Visited scenes

Rachv marks indexed scenes as read when they are opened. The progress screen uses these records to show visited-scene counts for Fate, Unlimited Blade Works, and Heaven's Feel.

The displayed percentage is calculated from the indexed scenes visited for that route. It should be treated as a browsing-progress indicator, not proof that every branch or ending has been completed.

## Choice history

When a reader selects an explicit scene branch, Rachv can record the source scene, destination scene, and choice label. This is a history of selections. It should not be confused with a complete reconstruction of the original game's affection system or every hidden game variable.

## Game flags

The reader has a separate game-flag store and evaluates the supported conditions represented in the generated scene graph. The condition parser supports the comparison and boolean operators used by that generated data. It is deliberately restricted and does not execute arbitrary JavaScript.

This support is limited to the information represented by the generated graph and the reader's own settings. It does not turn the browser reader into a full implementation of the original game's scripting engine.

## Save slots

Open **Settings → Progress** to see the progress summary and manage three local save slots. Saving a slot captures the current progress snapshot. Loading a slot replaces the current browser progress with the saved snapshot. A slot can also be cleared.

## Export and import

The **Settings → Progress** tab also provides buttons to export a snapshot as JSON and import a previously exported snapshot. The snapshot can include:

- The resume position and current scene.
- Visited-scene records.
- Backlog entries.
- Explicit choice history.
- Supported game flags.
- Reader settings included by the export process.

Imports are checked for the expected application identifier and supported save version. Before applying an import, Rachv stores a pre-import backup in the browser. This is a safety measure, but readers should still keep their own copy of exported save files.

## Storage limitations

Browser storage can be cleared by the user, browser settings, private-browsing behavior, or storage pressure. Clearing site data can remove progress and save slots. Export important progress periodically if it matters to you.
