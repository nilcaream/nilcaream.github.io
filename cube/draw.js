class NilCube {

    constructor(type, cubicleSize = 256) {
        this._type = type;
        this._cubicleSize = cubicleSize;

        this._lineWidth = this._cubicleSize / 5;
        this._radius = this._cubicleSize / 12;
        this._cubeSize = this._type * this._cubicleSize;
        this._worldSize = (this._type + 1) * this._cubicleSize;

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
        const toWidth = (wall) => ((wall || {}).canvas || {}).width || 0;
        const toHeight = (wall) => ((wall || {}).canvas || {}).height || 0;
        const width = toWidth(nc._walls.l) + toWidth(nc._walls.u) + toWidth(nc._walls.r);
        const height = toHeight(nc._walls.b) + toHeight(nc._walls.u) + toHeight(nc._walls.f);

        let context = NilCube.createContext(width, height);

        if (backgroundColor) {
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, width, height);
        }

        context.fillStyle = nc._colorsMap.core;

        // F
        let wall = nc._walls.f;
        if (wall) {
            context.fillRect(
                toWidth(nc._walls.l) + nc._cubicleSize / 2,
                height - toHeight(nc._walls.f) - nc._cubicleSize / 4,
                nc._cubicleSize * (nc._type - 1),
                nc._cubicleSize / 2);
            context.drawImage(wall.canvas, toWidth(nc._walls.l), height - toHeight(wall));
        }
        // B
        wall = nc._walls.b;
        if (wall) {
            context.fillRect(
                toWidth(nc._walls.l) + nc._cubicleSize / 2,
                toHeight(nc._walls.b) - nc._cubicleSize / 4,
                nc._cubicleSize * (nc._type - 1),
                nc._cubicleSize / 2);
            context.drawImage(wall.canvas, toWidth(nc._walls.l), 0);
        }
        // L
        wall = nc._walls.l;
        if (wall) {
            context.fillRect(
                toWidth(nc._walls.l) + nc._cubicleSize / 4,
                toHeight(nc._walls.b) + nc._cubicleSize / 2,
                -nc._cubicleSize / 2,
                nc._cubicleSize * (nc._type - 1));
            context.drawImage(wall.canvas, 0, toHeight(nc._walls.b));
        }
        // R
        wall = nc._walls.r;
        if (wall) {
            context.fillRect(
                width - toWidth(nc._walls.r) - nc._cubicleSize / 4,
                toHeight(nc._walls.b) + nc._cubicleSize / 2,
                nc._cubicleSize / 2,
                nc._cubicleSize * (nc._type - 1));
            context.drawImage(wall.canvas, width - toWidth(wall), toHeight(nc._walls.b));
        }

        // U
        context.drawImage(nc._walls.u.canvas, toWidth(nc._walls.l), toHeight(nc._walls.b));

        if (size) {
            const scale = size / Math.max(width, height);
            const newWidth = Math.round(width * scale);
            const newHeight = Math.round(height * scale);

            const resizeContext = NilCube.createContext(newWidth, newHeight);
            resizeContext.imageSmoothingQuality = 'high';
            resizeContext.drawImage(context.canvas, 0, 0, newWidth, newHeight);
            context = resizeContext;
        }

        return context.canvas.toDataURL("image/png");
    }

    toImageOld(size, backgroundColor) {
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
    a() { // TODO
        const nc = this;
        const elements = Array.prototype.slice.call(arguments);
        const context = NilCube.createContext(nc._cubeSize, nc._cubeSize);

        context.lineCap = "round";
        context.translate(nc._cubicleOuterSize / 2 + nc._lineWidth / 6, nc._cubicleOuterSize / 2 + nc._lineWidth / 6);

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

        context.lineWidth = nc._lineWidth / 2.2;
        context.strokeStyle = nc._colorsMap.arrowBack;
        elements.forEach(draw);

        context.lineWidth = nc._lineWidth / 3;
        context.strokeStyle = nc._colorsMap.arrowFront;
        elements.forEach(draw);

        nc._walls.ua = context;
        return nc._walls.ua;
    }

    // "YYYYBYYYY"
    u(colors) {
        const nc = this;
        const context = nc._wall(colors);
        const canvas = context.canvas;

        console.log("U " + colors + " " + canvas.width + "x" + canvas.height);
        nc._walls.u = context;

        return context;
    }

    // "YYYYBYYYY"
    f(colors) {
        const nc = this;
        const context = nc._side(colors);
        const canvas = context.canvas;

        console.log("F " + colors + " " + canvas.width + "x" + canvas.height);
        nc._walls.f = context;

        return context;
    }

    // "YYYYBYYYY"
    b(colors) {
        const nc = this;
        const context = NilCube.rotate(nc._side(colors), 180);
        const canvas = context.canvas;

        console.log("B " + colors + " " + canvas.width + "x" + canvas.height);
        nc._walls.b = context;

        return context;
    }

    // "YYYYBYYYY"
    l(colors) {
        const nc = this;
        const context = NilCube.rotate(nc._side(colors), 90);
        const canvas = context.canvas;

        console.log("L " + colors + " " + canvas.width + "x" + canvas.height);
        nc._walls.l = context;

        return context;
    }

    // "YYYYBYYYY"
    r(colors) {
        const nc = this;
        const context = NilCube.rotate(nc._side(colors), 270);
        const canvas = context.canvas;

        console.log("R " + colors + " " + canvas.width + "x" + canvas.height);
        nc._walls.r = context;

        return context;
    }

    _side(colors, cutCorners = false) {
        const nc = this;
        const context = nc._wall(colors, {baseHeight: 0.8, height: 0.75, lineWidth: 0.8}, cutCorners);
        const m = { // TODO calculate it someday
            2: {m: 0.5, e: 0.3},
            3: {m: 0.1, e: 0.5},
            4: {m: 0.2, e: 0.4},
            5: {m: 0.06, e: 0.47},
            6: {m: 0.2, e: 0.43},
        };
        return NilCube.fakePerspective(context, m[nc._type].m, m[nc._type].e);
    }

    _wall(colors, shrink = {baseHeight: 1, height: 1, lineWidth: 1}, cutCorners = true) {
        colors = colors.replace(/[^A-Za-z]/g, "");
        const nc = this;

        console.log("Wall " + colors);

        const hFactor = (row) => (1 - Math.pow(shrink.height, row)) / (1 - shrink.height);
        const rowsCount = Math.ceil(colors.length / nc._type);
        const imageHeight = shrink.baseHeight * nc._cubicleSize * (shrink.height === 1 ? rowsCount : hFactor(rowsCount));

        const context = NilCube.createContext(nc._cubicleSize * nc._type, imageHeight);

        // core
        context.fillStyle = nc._colorsMap.core;
        context.fillRect(nc._cubicleSize / 2, shrink.baseHeight * nc._cubicleSize / 2, nc._cubicleSize * (nc._type - 1), imageHeight - shrink.baseHeight * nc._cubicleSize / 2 - shrink.baseHeight * nc._cubicleSize * Math.pow(shrink.height, rowsCount - 1) / 2);

        colors.split("").forEach(function (color, index) {
            const col = index % nc._type;
            const row = Math.floor(index / nc._type);

            const x = col * nc._cubicleSize;
            const y = Math.floor(shrink.baseHeight * nc._cubicleSize * (shrink.height === 1 ? row : hFactor(row)));

            const cornerCut = cutCorners ? {row: row, col: col} : false;
            const cubicle = nc._cubicle(color, nc._cubicleSize, Math.ceil(shrink.baseHeight * nc._cubicleSize * Math.pow(shrink.height, row)), nc._lineWidth * Math.pow(shrink.lineWidth, row), nc._radius, cornerCut);
            context.drawImage(cubicle.canvas, x, y);
        });

        return context;
    }

    _cubicle(color, width, height, lineWidth, radius = 0, cornerCut = false) {
        const nc = this;
        const context = NilCube.createContext(width, height);
        const r = [radius, radius, radius, radius];

        context.lineWidth = lineWidth;

        if (cornerCut) {
            const row = cornerCut.row;
            const col = cornerCut.col;
            const rMultiplier = cornerCut.m || 3;

            if (col === 0 && row === 0) { // corners
                r[2] *= nc._type === 2 ? rMultiplier : 1;
            } else if (col === nc._type - 1 && row === 0) {
                r[3] *= nc._type === 2 ? rMultiplier : 1;
            } else if (col === 0 && row === nc._type - 1) {
                r[1] *= nc._type === 2 ? rMultiplier : 1;
            } else if (col === nc._type - 1 && row === nc._type - 1) {
                r[0] *= nc._type === 2 ? rMultiplier : 1;
            } else if (row === 0) { // edges
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
            } else { // middle
                r[0] *= rMultiplier;
                r[1] *= rMultiplier;
                r[2] *= rMultiplier;
                r[3] *= rMultiplier;
            }
        }

        // cubicle
        const c = lineWidth / 2;
        context.fillStyle = nc._colorsMap[color];
        context.strokeStyle = nc._colorsMap.cube;
        context.lineCap = "round";
        NilCube.roundPoly(context, [[c, c, r[0]], [0 + width - c, c, r[1]], [0 + width - c, 0 + height - c, r[2]], [c, 0 + height - c, r[3]]]);
        context.stroke();
        context.fill();

        return context;
    }

    // context, [[1,2,5],[2,3,6],[x,y,r]]
    // context, [[1,2],[2,3],[x,y]], r
    // based on https://stackoverflow.com/a/7838871
    static roundPoly(context, points, r) {
        context.beginPath();
        context.moveTo(points[0][0] + (points[0][2] || r), points[0][1]);
        for (var i = 0, i1 = 1, i2 = 2; i < points.length; i++, i1 = (i1 + 1) % points.length, i2 = (i2 + 1) % points.length) {
            context.arcTo(points[i1][0], points[i1][1], points[i2][0], points[i2][1], points[i1][2] || r);
        }
        context.closePath();
    }

    static rotate(context, angle) {
        const canvas = context.canvas;
        let x = 0, y = 0, width = canvas.width, height = canvas.height;

        if (angle === 90) {
            width = canvas.height;
            height = canvas.width;
            x = width;
        } else if (angle === 180) {
            x = width;
            y = height;
        } else if (angle === 270) {
            width = canvas.height;
            height = canvas.width;
            y = height;
        } else if (angle % 360 !== 0) {
            throw "Unsupported rotation angle";
        }

        const rotateContext = NilCube.createContext(width, height);

        rotateContext.translate(x, y);
        rotateContext.rotate(angle * Math.PI / 180);
        rotateContext.drawImage(canvas, 0, 0);

        return rotateContext;
    }

    static fakePerspective(context, middle = 0.1, edge = 0.2) {
        const canvas = context.canvas;
        const width = canvas.width;
        const height = canvas.height;

        const fake = NilCube.createContext(width, height);

        fake.save();
        fake.setTransform(1, 0, 0.1, 1, 0, 0);
        fake.drawImage(canvas, 0, 0, width * edge, height, 0, 0, width * edge, height);
        fake.restore();

        fake.save();
        fake.setTransform(1, 0, -0.1, 1, 0, 0);
        fake.drawImage(canvas, width * (1 - edge), 0, width * edge, height, width * (1 - edge), 0, width * edge, height);
        fake.restore();

        fake.save();
        fake.setTransform(1, 0, 0, 1, 0, 0);
        fake.drawImage(canvas, width * (1 - middle) / 2, 0, width * middle, height, width * (1 - middle) / 2, 0, width * middle, height);
        fake.restore();

        return fake;
    }
}
