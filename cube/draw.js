var cdraw = {
    begin: function (type) {
        this._type = type;
        this._size = 256;
        this._space = this._size / 7;
        this._line = this._size / 5;
        this._radius = this._size / 12;
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
        core: "#303030",
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
            var backgroundCanvas = $("<canvas></canvas>").attr("width", Math.ceil(cropCanvas.width * (1 + 1 / 64))).attr("height", Math.ceil(cropCanvas.height * (1 + 1 / 64)))[0];
            var backgroundContext = backgroundCanvas.getContext("2d");
            backgroundContext.fillStyle = backgroundColor;
            backgroundContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            backgroundContext.drawImage(cropCanvas, Math.ceil(cropCanvas.width * 1 / 128), Math.ceil(cropCanvas.height * 1 / 128));
            cropCanvas = backgroundCanvas;
        }
        if (size) {
            var scale = size / Math.max(width, height);
            width = Math.ceil(width * scale);
            height = Math.ceil(height * scale);
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
        var canvas = context.canvas;
        var width = canvas.width;
        var height = canvas.height;
        var data = context.getImageData(0, 0, width, height).data;

        var xMin = width;
        var xMax = 0;
        var yMin = height;
        var yMax = 0;

        var x, y, i;

        for (i = 0, x = 0, y = 0; i < data.length; i += 4) {
            if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0 || data[i + 3] > 0) {
                x = (i >> 2) % width;
                y = Math.floor(i / (4 * width));
                xMin = Math.min(xMin, x);
                xMax = Math.max(xMax, x);
                yMin = Math.min(yMin, y);
                yMax = Math.max(yMax, y);
            }
        }
        var results = {xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax, width: xMax - xMin, height: yMax - yMin};
        console.log("bounds x:" + xMin + ":" + xMax + " y:" + yMin + ":" + yMax + " w:" + results.width + " h:" + results.height);
        return results;
    },
    // ["Y11:11,02,012","B","R00:22]
    u: function (elements) {
        var cdraw = this;
        // core
        cdraw._context.fillStyle = cdraw.colorsMap.core;
        cdraw._context.fillRect(cdraw._origin + cdraw._size / 2, cdraw._origin + cdraw._size / 2, (cdraw._size + cdraw._space) * (cdraw._type - 1), (cdraw._size + cdraw._space) * (cdraw._type - 1));

        elements = elements.slice(0, this._type * this._type);
        elements.forEach(function (element, index) {
            var mainSplit = element.split(":");

            var color = mainSplit[0][0];
            var options = mainSplit[1] || "";
            var midDeltaX = mainSplit[0][1] || 1;
            var midDeltaY = mainSplit[0][2] || 1;

            var col = index % cdraw._type;
            var row = Math.floor(index / cdraw._type);
            var size = cdraw._size;

            var x = cdraw._origin + col * (cdraw._size + cdraw._space);
            var y = cdraw._origin + row * (cdraw._size + cdraw._space);

            var rMultiplier = 3;
            var r = [cdraw._radius, cdraw._radius, cdraw._radius, cdraw._radius];

            // corner cutting improvements
            if (col === 0 && row === 0) {
                // corners
                r[2] *= cdraw._type === 2 ? rMultiplier : 1;
            } else if (col === cdraw._type - 1 && row === 0) {
                r[3] *= cdraw._type === 2 ? rMultiplier : 1;
            } else if (col === 0 && row === cdraw._type - 1) {
                r[1] *= cdraw._type === 2 ? rMultiplier : 1;
            } else if (col === cdraw._type - 1 && row === cdraw._type - 1) {
                r[0] *= cdraw._type === 2 ? rMultiplier : 1;
                // edges
            } else if (row === 0) {
                r[2] *= rMultiplier;
                r[3] *= rMultiplier;
            } else if (row === cdraw._type - 1) {
                r[0] *= rMultiplier;
                r[1] *= rMultiplier;
            } else if (col === 0) {
                r[1] *= rMultiplier;
                r[2] *= rMultiplier;
            } else if (col === cdraw._type - 1) {
                r[0] *= rMultiplier;
                r[3] *= rMultiplier;
            } else {
                // middle
                r[0] *= rMultiplier;
                r[1] *= rMultiplier;
                r[2] *= rMultiplier;
                r[3] *= rMultiplier;
            }

            console.log("U" + row + col + " " + color + " o=(" + x.toFixed(2) + "," + y.toFixed(2) + ") r=(" + r[0].toFixed(2) + "," + r[1].toFixed(2) + "," + r[2].toFixed(2) + "," + r[3].toFixed(2) + ")");

            // normal
            cdraw._context.fillStyle = cdraw.colorsMap[color];
            cdraw._context.strokeStyle = cdraw.colorsMap.black;
            cdraw._context.lineWidth = cdraw._line;
            cdraw._roundPoly(cdraw._context, [[x, y, r[0]], [x + size, y, r[1]], [x + size, y + size, r[2]], [x, y + size, r[3]]]);
            cdraw._context.stroke();
            cdraw._context.fill();

            // arrows
            cdraw._context.lineWidth = cdraw._size / 16;
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
    // https://stackoverflow.com/a/7838871
    _roundRect: function (context, x, y, w, h, r) {
        context.beginPath();
        context.moveTo(x + r, y); // 0
        context.arcTo(x + w, y, x + w, y + h, r); // 1-2
        context.arcTo(x + w, y + h, x, y + h, r); // 2-3
        context.arcTo(x, y + h, x, y, r); // 3-0
        context.arcTo(x, y, x + w, y, r); // 0-1
        context.closePath();
    },
    // context, [[1,2,5],[2,3,6],[x,y,r]]
    _roundPoly: function (context, points) {
        context.beginPath();
        context.moveTo(points[0][0] + points[0][2], points[0][1]);
        for (var i = 0, i1 = 1, i2 = 2; i < points.length; i++, i1 = (i1 + 1) % points.length, i2 = (i2 + 1) % points.length) {
            context.arcTo(points[i1][0], points[i1][1], points[i2][0], points[i2][1], points[i1][2]);
        }
        context.closePath();
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

            var r = cdraw._size / 64;

            console.log("first" + depth + " " + colorsArray[i]);
            context.beginPath();
            context.moveTo(x + r, y);
            context.arcTo(x + width, y, x + width, y + height, r);
            context.arcTo(x + width, y + height, x + width - top, y + height, r);
            context.arcTo(x + width - top, y + height, x, y, r);
            context.arcTo(x, y, x + width, y, r);
            context.closePath();
            context.fill();
            context.stroke();

            for (var j = i + 1; j < i + cdraw._type - 1; j++) {
                context.fillStyle = cdraw.colorsMap[colorsArray[j]];
                console.log("mid" + depth + " " + colorsArray[j]);
                x = cdraw._size / 8 + (j % cdraw._type) * (cdraw._size * 17 / 16) + (cdraw._size * 1 / 64);
                cdraw._roundRect(context, x, y, this._size * 63 / 64, height, r);
                context.fill();
                context.stroke();
            }

            context.fillStyle = cdraw.colorsMap[colorsArray[i + cdraw._type - 1]];
            console.log("last" + depth + " " + colorsArray[i + cdraw._type - 1]);
            context.beginPath();
            x = cdraw._size / 8 + (j % cdraw._type) * (cdraw._size * 34 / 32) + (cdraw._size * 1 / 64);
            context.moveTo(x + r, y);
            context.arcTo(x + width, y, x + top, y + height, r);
            context.arcTo(x + top, y + height, x, y + height, r);
            context.arcTo(x, y + height, x, y, r);
            context.arcTo(x, y, x + width, y, r);
            context.closePath();
            context.fill();
            context.stroke();

            totalHeight += height + cdraw._size * 5 / 64;
        }

        return this._autoCrop(canvas, this._findBoundaries(context));
    }
};