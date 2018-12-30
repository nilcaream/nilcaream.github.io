var cdraw = {
    begin: function (size, canvasId, type) {
        this._type = type;
        this._size = size;
        this._origin = size;
        this._canvas = $("#" + canvasId);
        this._context = this._canvas[0].getContext("2d");
    },
    colorsMap: {
        B: "#0000ff",
        O: "#ff8000",
        Y: "#ffff00",
        W: "#ffffff",
        G: "#00ff00",
        R: "#ff0000",
        D: "#404040",
        black: "#000000",
    },
    end: function () {

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
    // ["Y:11,02","B"]
    u: function (colorsArray) {
        var cdraw = this;
        colorsArray.forEach(function (color, index) {
            var col = index % cdraw._type;
            var row = Math.floor(index / cdraw._type);

            var x = cdraw._origin + col * (cdraw._size + cdraw._size / 32);
            var y = cdraw._origin + row * (cdraw._size + cdraw._size / 32);

            // normal
            cdraw._context.fillStyle = cdraw.colorsMap[color[0]];
            cdraw._context.fillRect(x, y, cdraw._size, cdraw._size);

            // gradients
            var stop0 = "#000000";
            var stop1 = cdraw._rgba(cdraw.colorsMap[color[0]], 0);
            var stop2 = "#404040";

            // horizontal
            var grd = cdraw._context.createLinearGradient(x, y, x + cdraw._size, y);
            grd.addColorStop(0, stop0);
            grd.addColorStop(0.05, stop1);
            grd.addColorStop(0.9, stop1);
            grd.addColorStop(1, stop2);
            cdraw._context.fillStyle = grd;
            cdraw._context.fillRect(x, y, cdraw._size, cdraw._size);

            // vertical
            grd = cdraw._context.createLinearGradient(x, y, x, y + cdraw._size);
            grd.addColorStop(0, stop0);
            grd.addColorStop(0.05, stop1);
            grd.addColorStop(0.9, stop1);
            grd.addColorStop(1, stop2);
            cdraw._context.fillStyle = grd;
            cdraw._context.fillRect(x, y, cdraw._size, cdraw._size);

            // border
            cdraw._context.lineWidth = cdraw._size / 32;
            cdraw._context.strokeStyle = cdraw.colorsMap.black;
            cdraw._context.strokeRect(x, y, cdraw._size, cdraw._size);

            // arrows
            var midX = x + cdraw._size / 2;
            var midY = y + cdraw._size / 2;
            cdraw._context.lineWidth = cdraw._size / 32;

            color.substring(2).split(",").forEach(function (part) {
                var sx = (part.split("")[0] - 1) * cdraw._size / 2;
                var sy = (part.split("")[1] - 1) * cdraw._size / 2;
                cdraw._context.moveTo(midX, midY);
                cdraw._context.lineTo(midX + sx, midY + sy);
                cdraw._context.stroke();
            });
        });
    }
};