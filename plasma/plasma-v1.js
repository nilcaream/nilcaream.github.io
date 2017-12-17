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
var algorithms = [algorithm01, algorithm02, algorithm03];
var drawParameters = {x: 0, y: 0, index: 0, rawX: 0, rawY: 0, d: 0};

var frameTime = 16;
var drawTime = 16;

var frameTimestamp = 0;

function init() {
    fpsDiv = document.getElementById("fps");
    for (var i = 1; i <= 9; i++) {
        var zoomCanvas = document.getElementById("main-zoom-" + i);
        zoomCanvas.style.zIndex = 10;
        zoomCanvas.style.zoom = i;
        zoomCanvas.width = Math.ceil(window.innerWidth / i);
        zoomCanvas.height = Math.ceil(window.innerHeight / i);

        var image = zoomCanvas.getContext("2d").createImageData(zoomCanvas.width, zoomCanvas.height);
        for (var x = 0; x < zoomCanvas.width; x++) {
            for (var y = 0; y < zoomCanvas.height; y++) {
                putRGBA(image.data, zoomCanvas.width, x, y, 0, 0, 0, 255);
            }
        }

        mainCanvases.push({
            canvas: zoomCanvas,
            context: zoomCanvas.getContext("2d"),
            image: image,
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
            updateHash();
        } else if (e.keyCode === 93) { // 93 ]
            scale *= 1.2;
            updateHash();
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
            updateHash();
        }
        // console.log("keypress " + e.keyCode);
    }
}

function selectCanvas() {
    for (var i = 0; i < mainCanvases.length; i++) {
        var zoomCanvas = mainCanvases[i];
        if (zoomCanvas.zoom === options.zoom) {
            zoomCanvas.canvas.style.display = "block";
            mainCanvas = zoomCanvas;
        } else {
            zoomCanvas.canvas.style.display = "none";
        }
    }

    paletteSize = options.paletteSize;
    generatePalette();
    drawPalette();
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

    for (drawParameters.rawY = 0; drawParameters.rawY < mainCanvas.height; drawParameters.rawY++) {
        drawParameters.y = drawParameters.rawY * mainCanvas.zoom + offset.y + mouse.offset.y;
        drawParameters.y *= scale + mouse.scale;
        for (drawParameters.rawX = 0; drawParameters.rawX < mainCanvas.width; drawParameters.rawX++) {
            drawParameters.x = drawParameters.rawX * mainCanvas.zoom + offset.x + mouse.offset.x;
            drawParameters.x *= scale + mouse.scale;

            drawParameters.index = mod(Math.floor(algorithm(timestamp, drawParameters) - paletteSize * timestamp / 9000), paletteSize);
            putRGB(mainCanvas.image.data, mainCanvas.width, drawParameters.rawX, drawParameters.rawY, palette[0][drawParameters.index], palette[1][drawParameters.index], palette[2][drawParameters.index]);
        }
    }

    mainCanvas.context.putImageData(mainCanvas.image, 0, 0);

    drawTime = new Date().getTime() - drawStart;
}

function algorithm01(timestamp, parameters) {
    // large circle
    parameters.rotX = mainCanvas.zoom * mainCanvas.width * (1 + 0.5 * Math.sin(timestamp / 5024)) / 2;
    parameters.rotY = mainCanvas.zoom * mainCanvas.height * (1 + 0.5 * Math.cos(timestamp / 4000)) / 2;
    parameters.index = paletteSize * 0.0005 * (200 + distance(drawParameters.x - parameters.rotX, drawParameters.y - parameters.rotY));

    // larger slow circle
    parameters.rotX = mainCanvas.zoom * mainCanvas.width * (1 + 0.5 * Math.sin(0.3 + timestamp / 1320)) / 2;
    parameters.rotY = mainCanvas.zoom * mainCanvas.height * (1 + 0.5 * Math.cos(3 + timestamp / 2210)) / 2;
    parameters.index += paletteSize * 0.0005 * (200 + distance(drawParameters.x - 1.3 * parameters.rotY, drawParameters.y - 0.4 * parameters.rotX));

    // stripes
    parameters.rotX = mainCanvas.zoom * mainCanvas.width * (1 + 0.5 * Math.sin(0.8 + timestamp / 2420)) / 2;
    parameters.rotY = mainCanvas.zoom * mainCanvas.height * (1 + 0.5 * Math.cos(2 + timestamp / 2810)) / 2;
    parameters.index += 0.5 * paletteSize * Math.sin(drawParameters.x / 200 + parameters.rotX / 1000);
    parameters.index += 0.5 * paletteSize * Math.sin(parameters.rotY / 1210 - drawParameters.y / 400);

    return parameters.index;
}

function algorithm02(timestamp, parameters) {
    // rotating stripes 1
    parameters.index = paletteSize * 0.00002 * (drawParameters.x * Math.sin(timestamp / 5000) / 2 + drawParameters.y * Math.cos(timestamp / 5000) / 2);

    // rotating stripes 2
    parameters.index += paletteSize * 0.000015 * (drawParameters.x * Math.sin(1 + timestamp / 6000) / 2 - drawParameters.y * Math.cos(0.7 + timestamp / 4000) / 2);

    // grid
    parameters.index += Math.sin(timestamp / 1300) * paletteSize * 0.2 * (Math.sin(drawParameters.x / 60) + Math.sin(0.3 + (drawParameters.x) / 121 + timestamp / 1000));
    parameters.index += Math.cos(timestamp / 2100) * paletteSize * 0.2 * (Math.sin(drawParameters.y / 60) + Math.sin(0.7 + (drawParameters.y) / 123 + timestamp / 900));

    // grid-like circle
    parameters.d = distance(drawParameters.x, drawParameters.y);
    parameters.index += paletteSize * 0.2 * Math.sin(parameters.d / 200 + Math.sin(drawParameters.x / 100) + Math.sin(drawParameters.y / 100));

    return parameters.index;
}

function algorithm03(timestamp, parameters) {
    // x stripes
    parameters.index = 0.3 * Math.sin(parameters.x / 200 + timestamp / 1000);

    // rotating xy stripes
    parameters.index += 0.1 * Math.sin(0.01 * parameters.x * Math.sin(timestamp / 11000) + 0.01 * parameters.y * Math.cos(timestamp / 11100));

    // circle
    parameters.rotX = (parameters.x - mainCanvas.zoom * mainCanvas.width / 2) * (1 + Math.sin(timestamp / 3000));
    parameters.rotY = (parameters.y - mainCanvas.zoom * mainCanvas.height / 2) * (1 + Math.cos(timestamp / 4000));

    parameters.index -= 0.2 * Math.sin(Math.sqrt(0.0001 * (parameters.rotX * parameters.rotX + parameters.rotY * parameters.rotY) + 100) + timestamp / 1000);

    return parameters.index * paletteSize;
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
}

function updateHash() {
    location.hash = "x" + offset.x + "y" + offset.y + "s" + scale.toFixed(2) + "z" + mainCanvas.zoom
        + "c" + paletteSize + "r" + paletteInit.red.toFixed(2) + "g" + paletteInit.green.toFixed(2) + "b" + paletteInit.blue.toFixed(2)
        + "a" + algorithmIndex;
}
