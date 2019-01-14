#Nil Cube

Simple ES6 JavaScript lib for drawing NxNxN Rubik's cubes and Square-1 with some annotation support.

## Files

* [nilcube.js](nilcube.js) - NilCube class definition.
* [nilcube-resolve.html](nilcube-resolve.html) - Passes `window.location.hash` to NilCube resolve function to render a single-page cube image.
* [nilcube-examples.html](nilcube-examples.html) - Page for testing NilCube features. Can be used as an API example usage.
* [algorithms.js](algorithms.js) - Some 2x2, 3x3 and Square-1 algorithms I use.
* [index.html](index.html) - Draws algorithms from [algorithms.js](algorithms.js) in a table form.

## nilcube.js usage

```javascript
// Create 2x2 cube with cubicle size of 256x256px.
const nc = new NilCube(2, 256);

// Create U wall with colors: UBL: Yellow, UBR: Red, UFL: Green UFR: Orange.
// Function `u(colors)` returns `CanvasRenderingContext2D` for U wall and preserves the context internally.
const uWallContext = nc.u("YRGO");  

// Combine all internally stored wall and generate a PNG image in data URL form of max size of 160x160px.
// Background color of the image is white
const dataUrl = nc.toImage(160, "white");

// Combine all internally stored wall and generate a PNG image in data URL form.
// Image is not resized and has transparent background.
// For NilCube(2, 256) this image will have size of 512x512
const dataUrlRaw = nc.toImage();
``` 