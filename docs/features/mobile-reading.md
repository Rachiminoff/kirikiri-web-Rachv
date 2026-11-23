# Mobile Reading

Rachv includes a set of adjustments for phones and small touch devices. The goal is to keep the story readable while accounting for browser toolbars, touch input, and the limited height of a landscape screen.

## Visible screen height

Mobile browsers can report a viewport height that includes areas hidden behind browser controls. Rachv measures the visible window height and stores it in a CSS variable used by the reader layout. It updates that value when the window is resized or the device orientation changes.

## Landscape behavior

The Reading settings include a Force landscape option. When enabled on a supported phone, the reader waits for a user gesture and then makes a best-effort request to enter fullscreen and lock the screen to landscape.

Not every browser supports these requests. If the phone remains in portrait while the option is enabled, Rachv can show a rotate-device prompt. The prompt also provides a way to continue in portrait.

The scene list is allowed to remain in portrait; the landscape behavior is intended for the reading view.

## Mobile controls outside the story frame

On landscape phones with enough horizontal room, the NVL reading controls are placed in a compact vertical dock in the unused side area beside the centered 4:3 story frame. This keeps the controls available without placing them over the dialogue or character artwork.

On narrower screens, the controls remain in the normal bottom position rather than being forced into a side area that would be too small. The dock uses icon-only buttons with accessible labels/titles and touch-sized targets. Safe-area insets are respected where the browser exposes them.

## Touch input

The reader supports taps to advance and swipes for route navigation. It also applies mobile touch and overscroll settings while a paged reading view is active to reduce accidental browser gestures and text selection.

## Browser differences

Fullscreen and orientation locking are browser-controlled capabilities. Rachv requests them where available but cannot guarantee that every phone or browser will allow them. The rotate prompt and portrait continuation option provide a fallback.
