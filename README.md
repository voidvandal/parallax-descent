# Descent: a parallax journey

A parallax scrolling webpage that takes you **7,800 metres down**: from mountain peaks at dawn, through a pine forest and a sunset coast, into the shallows and finally the deep-sea abyss. Scrolling down literally takes you down, and a depth meter counts from +4,800 m to −3,000 m.

Built with plain HTML, CSS and JavaScript. There are no libraries and no image files: every mountain, tree, fish, kelp strand and jellyfish is generated in code.

**Demo video:** [demo.mp4](demo.mp4)

## Scenes

| Scene | Layers | Fun bits |
| --- | --- | --- |
| **Peaks** | Stars, sun, clouds, birds, 5 mountain ridges, title | The sun sets behind the ridges and the front mountains rise up over the title |
| **Forest** | 4 rows of pines, 2 mist banks, fireflies | Each tree row is closer and faster, and the front row moves *faster* than the page |
| **Coast** | Sunset, clouds, 4 wave bands | The waves slide sideways in alternating directions as you scroll |
| **Shallows** | Caustics, light rays, 3 fish schools, bubbles, kelp | **Click the water to blow bubbles** |
| **Abyss** | Plankton, 2 jellyfish depths, seabed | **Poke a jellyfish** to make it flash · **Ascend** flies you back to the top |

## How the parallax works

Every layer has a `data-speed`, and optionally `data-x` and `data-depth`:

- `data-speed`: how far the layer moves vertically relative to the scroll inside its scene. `0` moves with the page; `0.6` lags behind, so it looks far away; negative values move *faster* than the page, so they look very close.
- `data-x`: horizontal drift per pixel scrolled (waves, fish, clouds).
- `data-depth`: how strongly the layer follows the mouse (desktop only).

A single `requestAnimationFrame` loop applies `translate3d` transforms, but only for scenes that are on screen and only when the scroll or mouse position changes. Transforms keep it GPU-friendly and smooth. Mountains and trees are regenerated at the exact pixel size of the screen, so they look right on phones and on wide monitors.

## Also included

- A depth / altitude meter and chapter navigation that highlights the current scene
- Glass text cards that reveal as they enter the screen
- Responsive layout that works from 320px phones to wide desktops (the mouse parallax is turned off on touch screens)
- Respects `prefers-reduced-motion`, and jellyfish can be poked with the keyboard (Enter or Space)

## Run locally

Open `index.html` in a browser. That's it.

## Files

```
index.html   scenes and layers
style.css    look, animations, responsive rules
script.js    scenery generator + parallax engine + interactions
demo.mp4     screen recording
```
