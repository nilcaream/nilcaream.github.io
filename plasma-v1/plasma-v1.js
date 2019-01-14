var fpsDiv;

var palette;
var paletteSize;
var paletteInit = {red: 0, green: 0.4, blue: 0.7};

var mainCanvas;
var mainCanvases = [];

var scale = 1;
var offset = {x: 0, y: 0};
var options = {zoom: 2, paletteSize: 512};
var mouse = {pressed: false, shiftPressed: false, init: {x: 0, y: 0}, offset: {x: 0, y: 0}, scale: 0};

var algorithm = algorithm01;
var algorithmIndex = 0;
var algorithms = [algorithm01, algorithm02, algorithm03, mandelbrot];

var frameTime = 16;
var drawTime = 16;

var frameTimestamp = 0;

function init() {
    fpsDiv = document.getElementById("fps");
    for (var i = 1; i <= 9; i++) {
        var zoomCanvas = document.getElementById("main-zoom-" + i);
        zoomCanvas.style.zIndex = 10 + i;
        zoomCanvas.style.zoom = i;
        zoomCanvas.width = Math.ceil(window.innerWidth / i);
        zoomCanvas.height = Math.ceil(window.innerHeight / i);

        mainCanvases.push({
            canvas: zoomCanvas,
            context: zoomCanvas.getContext("2d"),
            width: zoomCanvas.width,
            height: zoomCanvas.height,
            zoom: i
        });
    }

    var paletteCanvas = document.getElementById("palette");
    paletteCanvas.height = 40;
    paletteCanvas.width = window.innerWidth;

    initFromHash();
    registerToggles();
    selectCanvas();
    updateFpsDiv();
    requestAnimationFrame(loop);
}

function initFromHash() {
    var match = location.hash.match(/#x(\-?[0-9]+)y(\-?[0-9]+)s([0-9\.]+)z([1-9])c([0-9\.]+)r([0-9\.]+)g([0-9\.]+)b([0-9\.]+)a([0-9]+).*/);
    if (match) {
        offset.x = parseInt(match[1]);
        offset.y = parseInt(match[2]);
        scale = parseFloat(match[3]);
        options.zoom = parseInt(match[4]);
        options.paletteSize = parseInt(match[5]);
        paletteInit.red = parseFloat(match[6]);
        paletteInit.green = parseFloat(match[7]);
        paletteInit.blue = parseFloat(match[8]);
        updateAlgorithm(parseInt(match[9]));
    } else {
        location.hash = "";
    }
}

function updateAlgorithm(index) {
    algorithmIndex = index % algorithms.length;
    algorithm = algorithms[algorithmIndex];
}

function registerToggles() {
    document.onkeypress = function (e) {
        if (e.keyCode === 96) { // 96 `
            toggleDisplay(document.getElementsByClassName("toggle"));
        } else if (e.keyCode > 48 && e.keyCode <= 48 + 10) { // 48 0; 49 1...
            options = {zoom: e.keyCode - 48, paletteSize: paletteSize};
        } else if (e.keyCode >= 97 && e.keyCode <= 116) { // 97 a; 98 b... 116 t
            options = {zoom: mainCanvas.zoom, paletteSize: Math.ceil(Math.pow(2, e.keyCode - 96))};
        } else if (e.keyCode === 91) { // 91 [
            scale = Math.max(0.1, scale / 1.2);
        } else if (e.keyCode === 93) { // 93 ]
            scale *= 1.2;
        } else if (e.keyCode === 32) { // 32 space
            paletteInit = {red: 0, green: 0.4, blue: 0.7};
            offset.x = 0;
            offset.y = 0;
            scale = 1;
            options = {zoom: 2, paletteSize: 512};
            updateAlgorithm(0);
        } else if (e.keyCode === 13) { // 13 enter
            paletteInit = {red: Math.random() * 2 * Math.PI, green: Math.random() * 2 * Math.PI, blue: Math.random() * 2 * Math.PI};
            options = {zoom: mainCanvas.zoom, paletteSize: paletteSize};
        } else if (e.keyCode === 82) { // 82 R
            paletteInit.red = mod(paletteInit.red + 0.1, 2 * Math.PI);
            options = {zoom: mainCanvas.zoom, paletteSize: paletteSize};
        } else if (e.keyCode === 71) { // 71 G
            paletteInit.green = mod(paletteInit.green + 0.1, 2 * Math.PI);
            options = {zoom: mainCanvas.zoom, paletteSize: paletteSize};
        } else if (e.keyCode === 66) { // 66 B
            paletteInit.blue = mod(paletteInit.blue + 0.1, 2 * Math.PI);
            options = {zoom: mainCanvas.zoom, paletteSize: paletteSize};
        } else if (e.keyCode === 92) { // 92 \
            updateAlgorithm(algorithmIndex + 1);
        }
        updateHash();
        repaint = true;
        // console.log("keypress " + e.keyCode);
    }
}

function selectCanvas() {
    for (var i = 0; i < mainCanvases.length; i++) {
        var zoomCanvas = mainCanvases[i];
        if (zoomCanvas.zoom === options.zoom) {
            initCanvasImage(zoomCanvas);
            zoomCanvas.canvas.style.display = "block";
            mainCanvas = zoomCanvas;
        } else {
            zoomCanvas.canvas.style.display = "none";
            zoomCanvas.image = null;
            zoomCanvas.context.clearRect(0, 0, zoomCanvas.width, zoomCanvas.height);
        }
    }

    paletteSize = options.paletteSize;
    generatePalette();
    drawPalette();
}

function initCanvasImage(zoomCanvas) {
    var canvas = zoomCanvas.canvas;
    var image = zoomCanvas.context.createImageData(canvas.width, canvas.height);
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            putRGBA(image.data, canvas.width, x, y, 0, 0, 0, 255);
        }
    }
    zoomCanvas.image = image;
}

function loop(timestamp) {
    if (options) {
        selectCanvas();
        options = false;
        updateHash();
    }
    animate(timestamp);
    requestAnimationFrame(loop);
}

function generatePalette() {
    palette = [[], [], []];
    for (var i = 0; i <= paletteSize; i++) {
        palette[0][i] = Math.floor(127 + 128 * Math.sin(paletteInit.red + 2 * Math.PI * i / paletteSize));
        palette[1][i] = Math.floor(127 + 128 * Math.sin(paletteInit.green + 2 * Math.PI * i / paletteSize));
        palette[2][i] = Math.floor(127 + 128 * Math.sin(paletteInit.blue + 2 * Math.PI * i / paletteSize));
    }
}

function drawPalette() {
    var paletteCanvas = document.getElementById("palette");
    var ratio = paletteSize / paletteCanvas.width;
    var skip = Math.ceil(ratio);
    var step = Math.max(5, Math.ceil(1 / ratio));

    // console.log("palette: size " + paletteSize + " ratio " + ratio.toFixed(4) + " 1/ratio " + (1 / ratio).toFixed(4) + " skip " + skip + " step " + step);

    var paletteContext = paletteCanvas.getContext("2d");
    paletteContext.save();
    paletteContext.clearRect(0, 0, paletteCanvas.width, paletteCanvas.height);

    for (var i = 0; i < paletteSize; i += skip) {
        paletteContext.fillStyle = "rgb(" + palette[0][i] + ",0,0)";
        paletteContext.fillRect(0, 0, step, 8);
        paletteContext.translate(0, 8);
        paletteContext.fillStyle = "rgb(0," + palette[1][i] + ",0)";
        paletteContext.fillRect(0, 0, step, 8);
        paletteContext.translate(0, 8);
        paletteContext.fillStyle = "rgb(0,0," + palette[2][i] + ")";
        paletteContext.fillRect(0, 0, step, 8);
        paletteContext.translate(0, 8);
        paletteContext.fillStyle = "rgb(" + palette[0][i] + "," + palette[1][i] + "," + palette[2][i] + ")";
        paletteContext.fillRect(0, 0, step, 16);
        paletteContext.translate(skip / ratio, -24);
    }

    paletteContext.restore();
}

function animate(timestamp) {
    frameTime = timestamp - frameTimestamp;
    frameTimestamp = timestamp;

    var drawStart = new Date().getTime();

    algorithm(timestamp);

    mainCanvas.context.putImageData(mainCanvas.image, 0, 0);

    drawTime = new Date().getTime() - drawStart;
}


function algorithm01(timestamp) {
    var index;
    var rotX;
    var rotY;
    var x;
    var y;
    var rawX;
    var rawY;

    for (rawY = 0; rawY < mainCanvas.height; rawY++) {
        y = rawY * mainCanvas.zoom + offset.y + mouse.offset.y;
        y *= scale + mouse.scale;
        for (rawX = 0; rawX < mainCanvas.width; rawX++) {
            x = rawX * mainCanvas.zoom + offset.x + mouse.offset.x;
            x *= scale + mouse.scale;

            // large circle
            rotX = mainCanvas.zoom * mainCanvas.width * (1 + 0.5 * Math.sin(timestamp / 5024)) / 2;
            rotY = mainCanvas.zoom * mainCanvas.height * (1 + 0.5 * Math.cos(timestamp / 4000)) / 2;
            index = paletteSize * 0.0005 * (200 + distance(x - rotX, y - rotY));

            // larger slow circle
            rotX = mainCanvas.zoom * mainCanvas.width * (1 + 0.5 * Math.sin(0.3 + timestamp / 1320)) / 2;
            rotY = mainCanvas.zoom * mainCanvas.height * (1 + 0.5 * Math.cos(3 + timestamp / 2210)) / 2;
            index += paletteSize * 0.0005 * (200 + distance(x - 1.3 * rotY, y - 0.4 * rotX));

            // stripes
            rotX = mainCanvas.zoom * mainCanvas.width * (1 + 0.5 * Math.sin(0.8 + timestamp / 2420)) / 2;
            rotY = mainCanvas.zoom * mainCanvas.height * (1 + 0.5 * Math.cos(2 + timestamp / 2810)) / 2;
            index += 0.5 * paletteSize * Math.sin(x / 200 + rotX / 1000);
            index += 0.5 * paletteSize * Math.sin(rotY / 1210 - y / 400);

            index = mod(Math.floor(index - paletteSize * timestamp / 9000), paletteSize);
            putRGB(mainCanvas.image.data, mainCanvas.width, rawX, rawY, palette[0][index], palette[1][index], palette[2][index]);
        }
    }
}

function algorithm02(timestamp) {
    var index;
    var d;
    var x;
    var y;
    var rawX;
    var rawY;

    for (rawY = 0; rawY < mainCanvas.height; rawY++) {
        y = rawY * mainCanvas.zoom + offset.y + mouse.offset.y;
        y *= scale + mouse.scale;
        for (rawX = 0; rawX < mainCanvas.width; rawX++) {
            x = rawX * mainCanvas.zoom + offset.x + mouse.offset.x;
            x *= scale + mouse.scale;

            // rotating stripes 1
            index = paletteSize * 0.00002 * (x * Math.sin(timestamp / 5000) / 2 + y * Math.cos(timestamp / 5000) / 2);

            // rotating stripes 2
            index += paletteSize * 0.000015 * (x * Math.sin(1 + timestamp / 6000) / 2 - y * Math.cos(0.7 + timestamp / 4000) / 2);

            // grid
            index += Math.sin(timestamp / 1300) * paletteSize * 0.2 * (Math.sin(x / 60) + Math.sin(0.3 + (x) / 121 + timestamp / 1000));
            index += Math.cos(timestamp / 2100) * paletteSize * 0.2 * (Math.sin(y / 60) + Math.sin(0.7 + (y) / 123 + timestamp / 900));

            // grid-like circle
            d = distance(x, y);
            index += paletteSize * 0.2 * Math.sin(d / 200 + Math.sin(x / 100) + Math.sin(y / 100));

            index = mod(Math.floor(index - paletteSize * timestamp / 9000), paletteSize);
            putRGB(mainCanvas.image.data, mainCanvas.width, rawX, rawY, palette[0][index], palette[1][index], palette[2][index]);
        }
    }
}

function algorithm03(timestamp) {
    var index;
    var rotX;
    var rotY;
    var x;
    var y;
    var rawX;
    var rawY;

    for (rawY = 0; rawY < mainCanvas.height; rawY++) {
        y = rawY * mainCanvas.zoom + offset.y + mouse.offset.y;
        y *= scale + mouse.scale;
        for (rawX = 0; rawX < mainCanvas.width; rawX++) {
            x = rawX * mainCanvas.zoom + offset.x + mouse.offset.x;
            x *= scale + mouse.scale;

            // x stripes
            index = 0.3 * Math.sin(x / 200 + timestamp / 1000);

            // rotating xy stripes
            index += 0.1 * Math.sin(0.01 * x * Math.sin(timestamp / 11000) + 0.01 * y * Math.cos(timestamp / 11100));

            // circle
            rotX = (x - mainCanvas.zoom * mainCanvas.width / 2) * (1 + Math.sin(timestamp / 3000));
            rotY = (y - mainCanvas.zoom * mainCanvas.height / 2) * (1 + Math.cos(timestamp / 4000));

            index -= 0.2 * Math.sin(Math.sqrt(0.0001 * (rotX * rotX + rotY * rotY) + 100) + timestamp / 1000);

            index *= paletteSize;

            index = mod(Math.floor(index - paletteSize * timestamp / 9000), paletteSize);
            putRGB(mainCanvas.image.data, mainCanvas.width, rawX, rawY, palette[0][index], palette[1][index], palette[2][index]);
        }
    }
}

var repaint = true;
var mandelbrotTimestamp = 0;
var mandelbrotIndexes = [0];

function mandelbrot(timestamp) {
    var index;
    var x;
    var y;
    var rawX;
    var rawY;

    var real;
    var imaginary;

    var newReal;
    var newImaginary;

    var iterations = 64;
    var threshold = 64;

    var m = 0;
    if (repaint) {
        console.log("redraw " + mandelbrotTimestamp);
        for (rawY = 0; rawY < mainCanvas.height; rawY++) {
            y = rawY * mainCanvas.zoom + offset.y + mouse.offset.y;
            y *= (scale + mouse.scale) / 500;
            y -= mainCanvas.height * mainCanvas.zoom * ((scale + mouse.scale) / 500) / 2;
            for (rawX = 0; rawX < mainCanvas.width; rawX++) {
                x = rawX * mainCanvas.zoom + offset.x + mouse.offset.x;
                x *= (scale + mouse.scale) / 500;
                x -= mainCanvas.width * mainCanvas.zoom * ((scale + mouse.scale) / 500) / 2;

                real = x;
                imaginary = y;

                if (m < 2) {
                    index = 0;
                } else if(mandelbrotIndexes[m-1] === 0 && mandelbrotIndexes[m-2] > 0) {
                    index = 0
                } else {
                    index = mandelbrotIndexes[m-1];
                }

                for (var i = 0; i < iterations; i++) {
                    newReal = real * real - imaginary * imaginary + x;
                    newImaginary = 2 * real * imaginary + y;

                    real = newReal;
                    imaginary = newImaginary;

                    if (real * imaginary > threshold) {
                        index = paletteSize * i / iterations;
                        break;
                    }
                }

                mandelbrotIndexes[m] = index;
                m++;
                index = mod(Math.floor(index - paletteSize * timestamp / 9000), paletteSize);

                putRGB(mainCanvas.image.data, mainCanvas.width, rawX, rawY, palette[0][index], palette[1][index], palette[2][index]);
            }
        }
        mandelbrotTimestamp = timestamp;
        repaint = false;
    } else {
        for (rawY = 0; rawY < mainCanvas.height; rawY++) {
            for (rawX = 0; rawX < mainCanvas.width; rawX++) {
                index = mod(Math.floor(mandelbrotIndexes[m] - paletteSize * timestamp / 9000), paletteSize);
                putRGB(mainCanvas.image.data, mainCanvas.width, rawX, rawY, palette[0][index], palette[1][index], palette[2][index]);
                m++;
            }
        }
    }
}

function algorithmCenterTest(timestamp) {
    var index;
    var x;
    var y;
    var rawX;
    var rawY;

    for (rawY = 0; rawY < mainCanvas.height; rawY++) {
        y = rawY * mainCanvas.zoom + offset.y + mouse.offset.y;// - mainCanvas.height * mainCanvas.zoom/2;
        y *= scale + mouse.scale;
        for (rawX = 0; rawX < mainCanvas.width; rawX++) {
            x = rawX * mainCanvas.zoom + offset.x + mouse.offset.x;// - mainCanvas.width * mainCanvas.zoom/2;
            x *= scale + mouse.scale;

            index = paletteSize * Math.min(50, distance(x - (mainCanvas.width * mainCanvas.zoom * (scale + mouse.scale)) / 2, y - (mainCanvas.height * mainCanvas.zoom * (scale + mouse.scale)) / 2));

            index = mod(Math.floor(index - paletteSize * timestamp / 9000), paletteSize);
            putRGB(mainCanvas.image.data, mainCanvas.width, rawX, rawY, palette[0][index], palette[1][index], palette[2][index]);
        }
    }
}

function updateFpsDiv() {
    var text = mainCanvas.width + "x" + mainCanvas.height;
    text += " " + leadingSpace((1000 / frameTime).toFixed(2), 2 + 1 + 2) + " FPS";
    text += " (zoom " + mainCanvas.zoom;
    text += ", scale " + (scale + mouse.scale).toFixed(2);
    text += ", colors " + paletteSize;
    text += ", RGB " + paletteInit.red.toFixed(2) + " " + paletteInit.green.toFixed(2) + " " + paletteInit.blue.toFixed(2);
    text += ", frame " + leadingSpace(Math.ceil(frameTime), 4) + "ms";
    text += ", draw " + leadingSpace(drawTime, 4) + "ms";
    text += ", offset " + (offset.x + mouse.offset.x) + "," + (offset.y + mouse.offset.y);
    text += ", " + algorithm.name;
    text += ")";
    fpsDiv.innerText = text;
    setTimeout(updateFpsDiv, 200);
}

function leadingSpace(text, size) {
    var result = text.toString();
    while (result.length < size) {
        result = " " + result;
    }
    return result;
}

function toggleDisplay(elements) {
    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function distance(x, y) {
    return Math.sqrt(x * x + y * y);
}

function putRGB(data, width, x, y, r, g, b) {
    var start = 4 * (x + y * width);
    data[start] = r;
    data[start + 1] = g;
    data[start + 2] = b;
}

function putRGBA(data, width, x, y, r, g, b, a) {
    var start = 4 * (x + y * width);
    data[start] = r;
    data[start + 1] = g;
    data[start + 2] = b;
    data[start + 3] = a;
}

function mouseMove(event) {
    if (mouse.pressed) {
        mouse.offset.x = mouse.init.x - event.x;
        mouse.offset.y = mouse.init.y - event.y;
    } else if (mouse.shiftPressed) {
        var newScale = scale * (mouse.init.y - event.y) / 256;
        if (newScale + scale > 0.1) {
            mouse.scale = newScale;
        }
    }
}

function mouseDown(event) {
    mouse.init.x = event.x;
    mouse.init.y = event.y;
    if (event.shiftKey) {
        mouse.shiftPressed = true;
    } else {
        mouse.pressed = true;
    }
}

function mouseUp() {
    if (mouse.pressed) {
        mouse.pressed = false;
        offset.x += mouse.offset.x;
        offset.y += mouse.offset.y;
        mouse.offset.x = 0;
        mouse.offset.y = 0;
    } else if (mouse.shiftPressed) {
        mouse.shiftPressed = false;
        scale += mouse.scale;
        mouse.scale = 0;
    }
    updateHash();
    repaint = true;
}

function updateHash() {
    location.hash = "x" + offset.x + "y" + offset.y + "s" + scale.toFixed(2) + "z" + mainCanvas.zoom
        + "c" + paletteSize + "r" + paletteInit.red.toFixed(2) + "g" + paletteInit.green.toFixed(2) + "b" + paletteInit.blue.toFixed(2)
        + "a" + algorithmIndex;
}
