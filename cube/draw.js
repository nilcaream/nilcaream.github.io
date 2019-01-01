var cdraw = {
    begin: function (type) {
        this._type = type;
        this._size = 256;
        this._origin = this._size;
        this._width = this._size * 3 + this._origin * 2;
        this._height = this._size * 3 + this._origin * 2;
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
    end: function (size) {
        var boundaries = this._findBoundaries();
        var width = boundaries.width + 1;
        var height = boundaries.height + 1;

        var cropCanvas = $("<canvas></canvas>").attr("width", width).attr("height", height)[0];
        var cropContext = cropCanvas.getContext("2d");
        cropContext.imageSmoothingQuality = 'low';
        cropContext.drawImage(this._canvas, -boundaries.xMin, -boundaries.yMin);

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
    _findBoundaries: function () {
        var data = this._context.getImageData(0, 0, this._width, this._height).data;
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
    // "#11ffee", 0.5
    _rgba: function (rgb, a) {
        var r = parseInt(rgb.substring(1, 3), 16);
        var g = parseInt(rgb.substring(3, 5), 16);
        var b = parseInt(rgb.substring(5, 7), 16);
        console.log(rgb);
        console.log("rgba(" + r + "," + g + "," + b + "," + a + ")");
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    },
    // ["Y11:11,02,012","B"]
    u: function (colorsArray) {
        var cdraw = this;
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
                cdraw._context.fillRect(midX - cdraw._size / 64, midY - cdraw._size / 64, cdraw._size / 32, cdraw._size / 32);
            });
        });
    },
    // ["Y","B","G"]
    side: function (colorsArray) {
        var cdraw = this;
        for (var i = 0; i < colorsArray.length; i += cdraw._type) {
            var depth = Math.floor(i / cdraw._type);
            // handle first
            console.log("first" + depth + " " + colorsArray[i]);
            for (var j = i + 1; j < i + cdraw._type - 1; j++) {
                console.log("mid" + depth + " " + colorsArray[j]);
            }
            // handle last
            console.log("last" + depth + " " + colorsArray[i + cdraw._type - 1]);
        }
    }
};