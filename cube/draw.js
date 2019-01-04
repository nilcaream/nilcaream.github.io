class NilCube {

    constructor(type, cubicleSize = 256) {
        this._type = type;
        this._cubicleSize = cubicleSize;

        this._cubiclePadding = this._cubicleSize / 7;
        this._cubicleOuterSize = this._cubicleSize + this._cubiclePadding;
        this._edgeWidth = this._cubicleSize / 5;
        this._radius = this._cubicleSize / 12;
        this._cubeSize = this._type * this._cubicleOuterSize;
        this._cubePadding = this._cubicleSize;
        this._worldSize = this._cubePadding * 3 + this._cubeSize;

        this._colorsMap = {
            B: "#0000f2",
            O: "#ff8600",
            Y: "#fefe00",
            W: "#ffffff",
            G: "#00f300",
            R: "#fe0000",
            D: "#808080",
            cube: "#000000",
            core: "#303030",
            arrowFront: "#000000",
            arrowBack: "rgba(255,255,255,0.2)",
        };

        this._walls = {}
    }

    setColor(key, color) {
        this._colorsMap[key] = color;
    }

    static asImage(size, backgroundColor, parameters) {
        const nc = new NilCube(parameters.type);

        if (parameters.cube) {
            nc.setColor("cube", parameters.cube);
        }
        if (parameters.core) {
            nc.setColor("core", parameters.core);
        }
        if (parameters.dark) {
            nc.setColor("D", parameters.dark);
        }

        if (parameters.a) {
            nc.a.apply(nc, parameters.a)
        }
        if (parameters.u) {
            nc.u.apply(nc, parameters.u)
        }
        if (parameters.f) {
            nc.f.apply(nc, parameters.f)
        }
        if (parameters.b) {
            nc.b.apply(nc, parameters.b)
        }
        if (parameters.l) {
            nc.l.apply(nc, parameters.l)
        }
        if (parameters.r) {
            nc.r.apply(nc, parameters.r)
        }

        return nc.toImage(size, backgroundColor);
    }

    static toCanvas(context) {
        return context ? context.canvas : undefined;
    }

    toImage(size, backgroundColor) {
        const nc = this;
        let context = NilCube.createContext(nc._worldSize);
        context.translate(nc._cubePadding, nc._cubePadding);

        // U
        context.drawImage(NilCube.autoCrop(nc._walls.u).canvas, 0, 0);

        let wall;
        // arrows
        wall = NilCube.toCanvas(nc._walls.ua);
        if (wall) {
            context.drawImage(wall, 0, 0);
        }

        context.translate(nc._cubicleSize / 32, nc._cubicleSize / 32);

        // F
        wall = NilCube.toCanvas(nc._walls.f);
        if (wall) {
            context.drawImage(wall, (nc._cubeSize - wall.width) / 2, nc._cubeSize);
        }
        // B
        wall = NilCube.toCanvas(nc._walls.b);
        if (wall) {
            context.drawImage(wall, (nc._cubeSize - wall.width) / 2, -wall.height);
        }
        // L
        wall = NilCube.toCanvas(nc._walls.l);
        if (wall) {
            context.drawImage(wall, -wall.width, (nc._cubeSize - wall.height) / 2);
        }
        // R
        wall = NilCube.toCanvas(nc._walls.r);
        if (wall) {
            context.drawImage(wall, nc._cubeSize, (nc._cubeSize - wall.height) / 2);
        }

        if (size !== "raw") {
            context = NilCube.autoCrop(context);
        }

        if (backgroundColor) {
            const backgroundContext = NilCube.createContext(context.canvas.width + 2, context.canvas.height + 2);
            backgroundContext.fillStyle = backgroundColor;
            backgroundContext.fillRect(0, 0, backgroundContext.canvas.width, backgroundContext.canvas.height);
            backgroundContext.drawImage(context.canvas, 1, 1);
            context = backgroundContext;
        }

        if (!isNaN(size) && size > 0) {
            let width = context.canvas.width;
            let height = context.canvas.height;

            const scale = size / Math.max(width, height);
            width = Math.ceil(width * scale);
            height = Math.ceil(height * scale);

            const resizeContext = NilCube.createContext(width, height);
            resizeContext.imageSmoothingQuality = 'high';
            resizeContext.drawImage(context.canvas, 0, 0, width, height);
            context = resizeContext;
        }

        return context.canvas.toDataURL("image/png");
    }

    static autoCrop(context, boundaries = NilCube.findBoundaries(context)) {
        const canvas = context.canvas;
        const cropContext = NilCube.createContext(boundaries.width, boundaries.height);
        cropContext.imageSmoothingQuality = 'low';
        cropContext.drawImage(canvas, -boundaries.xMin, -boundaries.yMin);
        console.log("Crop (" + canvas.width.toFixed(2) + "," + canvas.height.toFixed(2) + ") (" + boundaries.width.toFixed(2) + "," + boundaries.height.toFixed(2) + ")");
        return cropContext;
    }

    static createContext(width, height) {
        return $("<canvas></canvas>").attr("width", width).attr("height", height || width)[0].getContext("2d");
    }

    static findBoundaries(context) {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const data = context.getImageData(0, 0, width, height).data;

        let xMin = width;
        let xMax = 0;
        let yMin = height;
        let yMax = 0;

        for (let i = 0, x = 0, y = 0; i < data.length; i += 4) {
            if (data[i] > 0 || data[i + 1] > 0 || data[i + 2] > 0 || data[i + 3] > 0) {
                x = (i >> 2) % width;
                y = Math.floor(i / (4 * width));
                if (x < xMin) {
                    xMin = x;
                } else if (x > xMax) {
                    xMax = x;
                }
                if (y < yMin) {
                    yMin = y;
                } else if (y > yMax) {
                    yMax = y;
                }
            }
        }

        const results = {xMin: xMin, xMax: xMax + 1, yMin: yMin, yMax: yMax + 1, width: xMax - xMin + 1, height: yMax - yMin + 1};
        console.log("Boundaries x:" + results.xMin + ":" + results.xMax + " y:" + results.yMin + ":" + results.yMax + " w:" + results.width + " h:" + results.height);
        return results;
    }

    // "00:22", "11:03", "xy:XY"
    a() {
        const nc = this;
        const elements = Array.prototype.slice.call(arguments);
        const context = NilCube.createContext(nc._cubeSize, nc._cubeSize);

        context.lineCap = "round";
        context.translate(nc._cubicleOuterSize / 2 + nc._edgeWidth / 6, nc._cubicleOuterSize / 2 + nc._edgeWidth / 6);

        const draw = (element) => {
            const mainSplit = element.split(":");

            const x0 = mainSplit[0][0] * nc._cubicleOuterSize;
            const y0 = mainSplit[0][1] * nc._cubicleOuterSize;
            const x1 = mainSplit[1][0] * nc._cubicleOuterSize;
            const y1 = mainSplit[1][1] * nc._cubicleOuterSize;

            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
        };

        context.lineWidth = nc._edgeWidth / 2.2;
        context.strokeStyle = nc._colorsMap.arrowBack;
        elements.forEach(draw);

        context.lineWidth = nc._edgeWidth / 3;
        context.strokeStyle = nc._colorsMap.arrowFront;
        elements.forEach(draw);

        nc._walls.ua = context;
        return nc._walls.ua;
    }

    // "Y11:11,02,012","B","R00:22
    u() {
        const nc = this;
        const elements = Array.prototype.slice.call(arguments, 0, nc._type * nc._type);
        const size = Math.round(nc._cubeSize + nc._cubicleSize);
        const context = NilCube.createContext(size, size);

        context.translate(Math.round(nc._cubicleSize / 2), Math.round(nc._cubicleSize / 2));

        // core
        context.fillStyle = nc._colorsMap.core;
        context.fillRect(nc._cubicleSize / 2, nc._cubicleSize / 2, (nc._cubicleSize + nc._cubiclePadding) * (nc._type - 1), (nc._cubicleSize + nc._cubiclePadding) * (nc._type - 1));

        elements.forEach(function (color, index) {
            const col = index % nc._type;
            const row = Math.floor(index / nc._type);
            const size = nc._cubicleSize;

            const x = col * (nc._cubicleSize + nc._cubiclePadding);
            const y = row * (nc._cubicleSize + nc._cubiclePadding);

            const rMultiplier = 3;
            const r = [nc._radius, nc._radius, nc._radius, nc._radius];

            // corner cutting improvements
            if (col === 0 && row === 0) {
                // corners
                r[2] *= nc._type === 2 ? rMultiplier : 1;
            } else if (col === nc._type - 1 && row === 0) {
                r[3] *= nc._type === 2 ? rMultiplier : 1;
            } else if (col === 0 && row === nc._type - 1) {
                r[1] *= nc._type === 2 ? rMultiplier : 1;
            } else if (col === nc._type - 1 && row === nc._type - 1) {
                r[0] *= nc._type === 2 ? rMultiplier : 1;
                // edges
            } else if (row === 0) {
                r[2] *= rMultiplier;
                r[3] *= rMultiplier;
            } else if (row === nc._type - 1) {
                r[0] *= rMultiplier;
                r[1] *= rMultiplier;
            } else if (col === 0) {
                r[1] *= rMultiplier;
                r[2] *= rMultiplier;
            } else if (col === nc._type - 1) {
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

            // cubicle
            context.fillStyle = nc._colorsMap[color];
            context.strokeStyle = nc._colorsMap.cube;
            context.lineWidth = nc._edgeWidth;
            NilCube.roundPoly(context, [[x, y, r[0]], [x + size, y, r[1]], [x + size, y + size, r[2]], [x, y + size, r[3]]]);
            context.stroke();
            context.fill();
        });

        nc._walls.u = context;
        return nc._walls.u;
    }

    // context, [[1,2,5],[2,3,6],[x,y,r]]
    // context, [[1,2],[2,3],[x,y]], r
    // generalized idea based on https://stackoverflow.com/a/7838871
    static roundPoly(context, points, r) {
        context.beginPath();
        context.moveTo(points[0][0] + (points[0][2] || r), points[0][1]);
        for (var i = 0, i1 = 1, i2 = 2; i < points.length; i++, i1 = (i1 + 1) % points.length, i2 = (i2 + 1) % points.length) {
            context.arcTo(points[i1][0], points[i1][1], points[i2][0], points[i2][1], points[i1][2] || r);
        }
        context.closePath();
    }

    static rotate(context, factor) {
        const canvas = context.canvas;
        const size = Math.max(canvas.width, canvas.height) + 32;
        const halfSize = Math.round(size / 2);
        const rotateContext = NilCube.createContext(size, size);

        rotateContext.translate(halfSize, halfSize);
        rotateContext.rotate(Math.PI * factor);
        rotateContext.translate(-halfSize, -halfSize);
        rotateContext.drawImage(canvas, 16, 16);

        return NilCube.autoCrop(rotateContext);
    }

    // ["Y","B","G"]
    _side(colors) {
        const nc = this;
        const t = Math.tan(Math.PI * 78 / 180);
        const d = nc._cubicleSize / 32;
        const e = 0.8;

        const aBase = nc._cubicleSize;
        const bBase = aBase * 22 / 64;
        const rBase = nc._radius * 3 / 4;

        const log = (label, points) =>
            console.log(label
                + " (" + points[0][0].toFixed(2) + "," + points[0][1].toFixed(2)
                + ") (" + points[1][0].toFixed(2) + "," + points[1][1].toFixed(2)
                + ") (" + points[2][0].toFixed(2) + "," + points[2][1].toFixed(2)
                + ") (" + points[3][0].toFixed(2) + "," + points[3][1].toFixed(2) + ")");

        let a, b, r, bTotal;

        const context = NilCube.createContext(nc._cubeSize, 2 * nc._cubicleSize);
        context.translate(0, nc._cubiclePadding);
        context.strokeStyle = nc._colorsMap.cube;

        // left
        a = aBase;
        b = bBase;
        r = rBase;
        bTotal = 0;
        context.translate(nc._cubicleOuterSize - nc._edgeWidth / 8, 0);
        context.lineWidth = nc._edgeWidth / 3;
        for (let i = 0; i < Math.floor(colors.length / nc._type); i++) {
            const color = colors[i * nc._type];
            context.fillStyle = nc._colorsMap[color];

            const c = (t * a - b) / t;
            const points = [[-c, bTotal + b], [0, bTotal + b], [0, bTotal], [-a, bTotal]];
            log("L edge " + color, points);

            NilCube.roundPoly(context, points, r);
            context.fill();
            context.stroke();

            bTotal += b + d;
            a = a - (b + d) / t;
            b *= e;
            r *= e;
            context.lineWidth *= e;
        }
        context.translate(-nc._cubicleOuterSize + nc._edgeWidth / 8, 0);

        // middle
        b = bBase;
        r = rBase;
        bTotal = 0;
        context.translate(nc._cubicleOuterSize, 0);
        context.lineWidth = nc._edgeWidth / 3;
        for (let i = 0; i < colors.length; i++) {
            if (i % nc._type === 0 || (i + 1) % nc._type === 0) {
                continue;
            }
            const col = i % nc._type;
            const row = Math.floor(i / nc._type);
            const color = colors[i];
            context.fillStyle = nc._colorsMap[color];

            const size = nc._cubicleOuterSize - nc._edgeWidth / 8;
            const x = (col - 1) * nc._cubicleOuterSize;
            const y = bTotal;

            const points = [[x, y], [x + size, y], [x + size, y + b], [x, y + b]];
            log("M edge " + row + col + " " + color, points);

            NilCube.roundPoly(context, points, r);
            context.fill();
            context.stroke();

            if (col === nc._type - 2) {
                bTotal += b + d;
                b *= e;
                r *= e;
                context.lineWidth *= e;
            }
        }
        context.translate(-nc._cubicleOuterSize, 0);

        // right
        a = aBase;
        b = bBase;
        r = rBase;
        bTotal = 0;
        context.translate((nc._type - 1) * nc._cubicleOuterSize, 0);
        context.lineWidth = nc._edgeWidth / 3;
        for (let i = 0; i < Math.floor(colors.length / nc._type); i++) {
            const color = colors[(i + 1) * (nc._type) - 1];
            context.fillStyle = nc._colorsMap[color];

            const c = (t * a - b) / t;
            const points = [[0, bTotal + b], [c, bTotal + b], [a, bTotal], [0, bTotal]];
            log("R edge " + color, points);

            NilCube.roundPoly(context, points, r);
            context.fill();
            context.stroke();

            bTotal += b + d;
            a = a - (b + d) / t;
            b *= e;
            r *= e;
            context.lineWidth *= e;
        }
        context.translate(-(nc._type - 1) * nc._cubicleOuterSize, 0);

        return context;
    }

    // ["Y","B","G"]
    f() {
        console.log("F wall");
        const context = this._side(Array.prototype.slice.call(arguments));
        this._walls.f = NilCube.autoCrop(context);
        return context;
    }

    // ["Y","B","G"]
    b() {
        console.log("B wall");
        const context = this._side(Array.prototype.slice.call(arguments));
        this._walls.b = NilCube.rotate(NilCube.autoCrop(context), 1);
        return context;
    }

    // ["Y","B","G"]
    r() {
        console.log("R wall");
        const context = this._side(Array.prototype.slice.call(arguments));
        this._walls.r = NilCube.rotate(NilCube.autoCrop(context), -0.5);
        return context;
    }

    // ["Y","B","G"]
    l() {
        console.log("L wall");
        const context = this._side(Array.prototype.slice.call(arguments));
        this._walls.l = NilCube.rotate(NilCube.autoCrop(context), 0.5);
        return context;
    }
}
