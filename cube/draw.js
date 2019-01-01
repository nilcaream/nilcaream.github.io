var cdraw = {
    begin: function (type) {
        this._type = type;
        this._size = 512;
        this._origin = this._size * 2;
        this._width = this._size * type + this._origin * 2;
        this._height = this._size * type + this._origin * 2;
        this._canvas = $("<canvas></canvas>").attr("width", this._width).attr("height", this._height)[0];
        this._context = this._canvas.getContext("2d");
    },
    colorsMap: {
        B: "#0000f2",
        O: "#ff8600",
        Y: "#fefe00",
        W: "#ffffff",
        G: "#00f300",
        R: "#fe0000",
        D: "#808080",
        black: "#000000",
    },
    raw: function () {
        return this._canvas.toDataURL("image/png");
    },
    end: function (size, backgroundColor) {
        var boundaries = this._findBoundaries(this._context);
        var width = boundaries.width + 1;
        var height = boundaries.height + 1;
        var cropCanvas = this._autoCrop(this._canvas, boundaries);

        if (backgroundColor) {
            var backgroundCanvas = $("<canvas></canvas>").attr("width", cropCanvas.width * (1 + 1 / 64)).attr("height", cropCanvas.height * (1 + 1 / 64))[0];
            var backgroundContext = backgroundCanvas.getContext("2d");
            backgroundContext.fillStyle = backgroundColor;
            backgroundContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            backgroundContext.drawImage(cropCanvas, cropCanvas.width * 1 / 128, cropCanvas.height * 1 / 128);
            cropCanvas = backgroundCanvas;
        }
        if (size) {
            var scale = size / Math.max(width, height);
            width = Math.ceil(width) * scale;
            height = Math.ceil(height) * scale;
            var resizeCanvas = $("<canvas></canvas>").attr("width", width).attr("height", height)[0];
            var resizeContext = resizeCanvas.getContext("2d");
            resizeContext.imageSmoothingQuality = 'high';
            resizeContext.drawImage(cropCanvas, 0, 0, width, height);
            return resizeCanvas.toDataURL("image/png");
        } else {
            return cropCanvas.toDataURL("image/png");
        }
    },
    _autoCrop: function (canvas, boundaries) {
        var width = boundaries.width + 1;
        var height = boundaries.height + 1;

        var cropCanvas = $("<canvas></canvas>").attr("width", width).attr("height", height)[0];
        var cropContext = cropCanvas.getContext("2d");
        cropContext.imageSmoothingQuality = 'low';
        cropContext.drawImage(canvas, -boundaries.xMin, -boundaries.yMin);

        return cropCanvas;
    },
    _findBoundaries: function (context) {
        var data = context.getImageData(0, 0, this._width, this._height).data;
        var results = {
            xMin: this._width,
            xMax: 0,
            yMin: this._height,
            yMax: 0
        };
        for (var i = 0, x = 0, y = 0; i < data.length; i += 4) {
            if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0 || data[i + 3] !== 0) {
                x = (i / 4) % this._width;
                y = Math.floor(i / (4 * this._width));
                results.xMin = Math.min(results.xMin, x);
                results.xMax = Math.max(results.xMax, x);
                results.yMin = Math.min(results.yMin, y);
                results.yMax = Math.max(results.yMax, y);
            }
        }
        results.width = results.xMax - results.xMin;
        results.height = results.yMax - results.yMin;
        return results;
    },
    // ["Y11:11,02,012","B"]
    u: function (colorsArray) {
        var cdraw = this;
        colorsArray = colorsArray.slice(0, this._type * this._type);
        colorsArray.forEach(function (element, index) {
            var mainSplit = element.split(":");

            var color = mainSplit[0][0];
            var options = mainSplit[1] || "";
            var midDeltaX = mainSplit[0][1] || 1;
            var midDeltaY = mainSplit[0][2] || 1;

            var col = index % cdraw._type;
            var row = Math.floor(index / cdraw._type);

            var x = cdraw._origin + col * (cdraw._size + cdraw._size / 16);
            var y = cdraw._origin + row * (cdraw._size + cdraw._size / 16);

            // normal
            cdraw._context.fillStyle = cdraw.colorsMap[color];
            cdraw._context.fillRect(x, y, cdraw._size, cdraw._size);

            // border
            cdraw._context.lineWidth = cdraw._size / 8;
            cdraw._context.strokeStyle = cdraw.colorsMap.black;
            cdraw._context.strokeRect(x, y, cdraw._size, cdraw._size);

            // arrows
            cdraw._context.lineWidth = cdraw._size / 32;

            cdraw._context.fillStyle = "black";

            var midX = x + cdraw._size / 2 + (midDeltaX - 1) * cdraw._size / 4;
            var midY = y + cdraw._size / 2 + (midDeltaY - 1) * cdraw._size / 4;

            options.split(",").filter(function (element) {
                return element;
            }).forEach(function (element) {
                var split = element.split("");
                var sx = (split[0] - 1) * cdraw._size / (split[2] || 2);
                var sy = (split[1] - 1) * cdraw._size / (split[2] || 2);
                cdraw._context.moveTo(midX, midY);
                cdraw._context.lineTo(midX + sx, midY + sy);
                cdraw._context.stroke();
                // center dot
                cdraw._context.fillRect(midX - cdraw._size / 64, midY - cdraw._size / 64, cdraw._size / 32, cdraw._size / 32);
            });
        });
    },
    // ["Y","B","G"]
    f: function (colorsArray) {
        var canvas = this._side(colorsArray);
        this._context.drawImage(canvas, this._origin - this._size * 3 / 64, this._origin - this._size / 8 + this._type * this._size * 17 / 16 + this._size * 9 / 64);
    },
    // ["Y","B","G"]
    b: function (colorsArray) {
        var canvas = this._rotate(this._side(colorsArray), 1);
        this._context.drawImage(canvas, this._origin - this._size * 3 / 64, this._origin - canvas.height - this._size * 5 / 64);
    },
    // ["Y","B","G"]
    r: function (colorsArray) {
        var canvas = this._rotate(this._side(colorsArray), -0.5);
        this._context.drawImage(canvas, this._origin - this._size * 7 / 64 + this._size / 8 + this._type * this._size * 17 / 16, this._origin - canvas.height - this._size / 8 + this._type * this._size * 17 / 16 + this._size * 7 / 64);
    },
    // ["Y","B","G"]
    l: function (colorsArray) {
        var canvas = this._rotate(this._side(colorsArray), 0.5);
        this._context.drawImage(canvas, this._origin - this._size * 5 / 64 - canvas.width, this._origin - canvas.height - this._size / 8 + this._type * this._size * 17 / 16 + this._size * 7 / 64);
    },
    // ["Y","B","G"]
    _rotate: function (canvas, factor) {
        var scaleCanvas = $("<canvas></canvas>").attr("width", Math.max(canvas.width, canvas.height)).attr("height", Math.max(canvas.width, canvas.height))[0];
        var scaleContext = scaleCanvas.getContext("2d");
        scaleContext.translate(scaleCanvas.width / 2, scaleCanvas.height / 2,);
        scaleContext.rotate(Math.PI * factor);
        scaleContext.translate(-scaleCanvas.width / 2, -scaleCanvas.height / 2,);
        scaleContext.drawImage(canvas, 0, 0);
        return this._autoCrop(scaleCanvas, this._findBoundaries(scaleContext));
    },
    // ["Y","B","G"]
    _side: function (colorsArray) {
        var tga = 4.1;
        var cdraw = this;
        var canvas = $("<canvas></canvas>").attr("width", 2 * this._origin + this._type * (this._size * 17 / 16)).attr("height", 2 * this._origin + this._size)[0];
        var context = canvas.getContext("2d");

        context.lineWidth = cdraw._size / 16;
        context.strokeStyle = cdraw.colorsMap.black;

        var totalHeight = 0;
        for (var i = 0; i < Math.min(colorsArray.length, this._type * this._type); i += cdraw._type) {
            context.fillStyle = cdraw.colorsMap[colorsArray[i]];
            var depth = Math.floor(i / cdraw._type);

            var edgeOffset = depth * this._size / 13;

            var height = (this._size - edgeOffset) / 4;
            var width = this._size - edgeOffset;

            var top = (width * tga - height) / tga;

            var x = cdraw._size / 8 + edgeOffset;
            var y = cdraw._size / 8 + totalHeight;

            console.log("first" + depth + " " + colorsArray[i]);
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + width, y);
            context.lineTo(x + width, y + height);
            context.lineTo(x + width - top, y + height);
            context.lineTo(x, y);
            context.closePath();
            context.fill();
            context.stroke();

            for (var j = i + 1; j < i + cdraw._type - 1; j++) {
                context.fillStyle = cdraw.colorsMap[colorsArray[j]];
                console.log("mid" + depth + " " + colorsArray[j]);
                context.beginPath();
                x = cdraw._size / 8 + (j % cdraw._type) * (cdraw._size * 17 / 16) + (cdraw._size * 1 / 64);
                context.moveTo(x, y);
                context.lineTo(x + this._size * 63 / 64, y);
                context.lineTo(x + this._size * 63 / 64, y + height);
                context.lineTo(x, y + height);
                context.lineTo(x, y);
                context.closePath();
                context.fill();
                context.stroke();
            }

            context.fillStyle = cdraw.colorsMap[colorsArray[i + cdraw._type - 1]];
            console.log("last" + depth + " " + colorsArray[i + cdraw._type - 1]);
            context.beginPath();
            x = cdraw._size / 8 + (j % cdraw._type) * (cdraw._size * 34 / 32) + (cdraw._size * 1 / 64);
            context.moveTo(x, y);
            context.lineTo(x + width, y);
            context.lineTo(x + top, y + height);
            context.lineTo(x, y + height);
            context.lineTo(x, y);
            context.closePath();
            context.fill();
            context.stroke();

            totalHeight += height + cdraw._size * 5 / 64;
        }

        return this._autoCrop(canvas, this._findBoundaries(context));
    }
};