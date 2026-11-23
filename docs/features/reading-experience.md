# Reading Experience

Rachv offers several ways to display story text and a set of controls for moving through a scene.

## Reading modes

### NVL

NVL places a page of text over the scene image. It does not use the conventional bottom dialogue box. A small chevron indicates when more text is available on the current scene page. The reader can adjust the darkness of the overlay through the reading settings.

### Textbox

Textbox mode places the text in a fixed area near the bottom of the screen. It is intended for readers who prefer a familiar visual-novel dialogue panel.

### Scrolling

Scrolling mode retains the page-scrolling presentation. It is useful for readers who prefer to move through the text as a continuous page rather than advancing one screen at a time.

## Moving through the story

In NVL and Textbox modes, the standard inputs are:

| Action | Default input |
| --- | --- |
| Advance | Click/tap, Enter, Space, Right Arrow, or Down Arrow |
| Go back | Shift+Space, Left Arrow, or Up Arrow |
| Auto mode | A |
| Skip mode | S |
| Hide interface | H |
| Open backlog | L |
| Open settings | Escape |

The advance and previous-reading keys can be changed in the settings menu. The controls bar also provides buttons for Back, Auto, Skip, Log, Hide, Settings, and the scene list. Auto advances through pages automatically. Skip advances rapidly, with the reader stopping before an unread next scene rather than automatically skipping into it.

The reader includes input timing and asset-loading checks so that a tap made while a scene is still loading, or two taps made very close together, are less likely to advance the story unexpectedly.

## Text and interface settings

The settings menu includes options for the reading mode, text font, text size, keyboard shortcuts, and (for the paged modes) dialogue-box opacity. The exact options shown depend on the selected reading mode.

## Backlog

The Log control opens the backlog. It lists text pages that have been displayed, grouped by scene, with the newest entries at the bottom. The browser stores up to 400 entries. The backlog can be cleared from its own interface.

## Scene transitions

When the current scene has a single supported next scene, the paged reader can move into it automatically after the final page. A scene-change notice identifies the destination. Auto can continue across these transitions. Skip continues only when the next scene has already been read. Where a scene requires a branch decision, the reader presents the available choices.

The Scrolling mode retains its Continue button behavior.
