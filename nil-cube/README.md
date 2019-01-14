# Nil Cube

Simple ES6 JavaScript lib for drawing NxNxN Rubik's cubes and Square-1 with some annotation support.

## Files

* [nilcube.js](nilcube.js) - NilCube class definition.
* [nilcube-resolve.html](nilcube-resolve.html) - Passes `window.location.hash` to NilCube resolve function to render a single-page cube image.
* [nilcube-examples.html](nilcube-examples.html) - Page for testing NilCube features. Can be used as an API example usage.
* [algorithms.js](algorithms.js) - Some 2x2, 3x3 and Square-1 algorithms I use.
* [index.html](index.html) - Draws algorithms from [algorithms.js](algorithms.js) in a table form.

## nilcube.js usage

#### Adding wall by wall

```javascript
// Creates 2x2 cube with cubicle size of 256x256px.
const nc = new NilCube(2, 256);

// Creates Up wall with colors: UBL: Yellow, UBR: Red, UFL: Green UFR: Orange.
// Function u(colors) returns new CanvasRenderingContext2D for U wall and stores it internally.
// Wall adding order is not relevant. 
const uWallContext = nc.u("YRGO");  

// Creates Front wall with colors: UFL: Yellow, UFR: Red. API is similar to u(colors) function. 
const fWallContext = nc.f("YR");

// Creates Right wall with colors: UFR: Yellow, UBR: Red. API is similar to u(colors) function. 
const rWallContext = nc.r("YR");

// Creates Back wall with colors: UBR: Yellow, UBL: Red. API is similar to u(colors) function. 
const bWallContext = nc.b("YR");

// Creates Left wall with colors: UBL: Yellow, UFL: Red. API is similar to u(colors) function. 
const lWallContext = nc.l("YR");

// Combines all internally stored walls and generates a PNG image in data URL format
// scaled to fit rectangle of 160x160px size. Background color of the image is white.
// This method can be used at any moment assuming that U wall has been defined.
// It does not change internal state of nc instance (is idempotent).
const dataUrl160 = nc.toImage(160, "white");

// Combines all internally stored walls and generates a PNG image in data URL format.
// Image is not resized and has transparent background.
// For NilCube(2, 256) it will have size of 512x512px.
const dataUrlRaw = nc.toImage();
```
 