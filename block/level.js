// noinspection DuplicatedCode

((r) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r) : r())(() => {

    const blocks = {
        none: {id: 0},
        any: {id: 1, color: "#000"},
        grass: {id: 2, color: "#2ab013"},
        dirt: {id: 3, color: "#846a2c"},
        stone1: {id: 4, color: "#a29e92"},
        stone2: {id: 5, color: "#d3d1c6"},
        stone3: {id: 6, color: "#eae4cb"},
        deepStone1: {id: 7, color: "#868277"},
        deepStone2: {id: 8, color: "#6e695f"},
        deepStone3: {id: 9, color: "#504832"},
        sand: {id: 10, color: "#ffe677"},
    };

    const biomes = {
        plains: {id: 1},
        mountains: {id: 2},
        desert: {id: 3},
        ocean: {id: 4},
    };

    const world = {
        seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),

        chunks: {},

        init: function (seed) {
            this.chunks = {};
            this.seed = seed;
        },

        width: 512,
        height: 128,

        getChunk: function (number) {
            let chunk = this.chunks[number];

            if (chunk) {
                return chunk;
            } else {
                const previous = this.chunks[number - 1] || {};
                const next = this.chunks[number + 1] || {};
                return this.createChunk(number, previous.rightY, next.leftY);
            }
        },

        createChunk: function (number, _leftY, _rightY) {
            console.log(`Creating chunk ${number}. lY:${_leftY}, rY:${_rightY}`);
            const data = new Array(this.height).fill(0).map(_ => new Array(this.width).fill(0));

            const random = this.getRandom(10000 + number);
            const leftY = _leftY || random(16, 128);
            const rightY = _rightY || random(16, 128);
            const pointsX = [];
            const pointsY = [];

            pointsX.push(0);
            pointsY.push(leftY);

            for (let i = 0; i < this.width / 64; i++) {
                const x = random(8, 100) + (pointsX[pointsX.length - 1] || 0);
                if (x > this.width - 8) {
                    break;
                } else {
                    pointsX.push(x);
                    pointsY.push(random(16, this.height - 16));
                }
            }

            pointsX.push(this.width - 1);
            pointsY.push(rightY);

            const surfaceX = Smooth(pointsX);
            const surfaceY = Smooth(pointsY);

            const surface = {};
            for (let i = 0; i < pointsX.length - 1; i++) {
                for (let j = 0; j < 1; j += 0.002) {
                    const a = Math.floor(surfaceX(i + j));
                    const b = Math.round(surfaceY(i + j));
                    surface[a] = surface[a] || b;
                }
            }

            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const s = surface[x] || surface[x + 1] || surface[x - 1];
                    if (y >= s) {
                        data[y][x] = 1;
                    }
                }
            }

            console.log(`pX:${pointsX.join(",")}`);
            console.log(`pY:${pointsY.join(",")}`);

            const chunk = {
                number: number,
                data: data,
                surface: surface,
                leftY: leftY,
                rightY: rightY
            };

            this.createCaves(number, chunk);
            this.updateBlocks(number, chunk);

            this.chunks[number] = chunk;
            return chunk;
        },

        updateBlocks: function (number, chunk) {
            const random = this.getRandom(8000 + number);

            const isSkyAbove = (x, y) => {
                let i = y - 1;
                for (; i >= 0; i--) {
                    if (chunk.data[i][x] !== 0) {
                        break;
                    }
                }
                return i <= 0;
            };

            for (let x = 0; x < this.width; x++) {
                let surface = undefined;
                for (let y = 0; y < this.height; y++) {
                    const d = chunk.data[y][x];
                    if (surface !== undefined && d === 0) {
                        continue;
                    } else if (surface === undefined && d === 0) {
                        continue;
                    } else if (surface === undefined && d > 0) {
                        surface = y;
                        chunk.data[y][x] = blocks.grass.id;
                    } else if (y - surface < random(2, 5)) {
                        chunk.data[y][x] = blocks.dirt.id;
                    } else if (y - surface < random(2, 16)) {
                        chunk.data[y][x] = blocks.stone1.id;
                    } else if (y - surface < random(2, 16)) {
                        chunk.data[y][x] = blocks.stone2.id;
                    } else if (y - surface < random(2, 32)) {
                        chunk.data[y][x] = blocks.stone3.id;
                    }
                }
            }

            /*
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (chunk.data[y][x] !== 0 && isSkyAbove(x, y)) {
                        chunk.data[y][x] = 2;
                        for (let i = y + 1; i < this.height; i++) {
                            if (chunk.data[i][x] !== 0) {
                                if (i - y < random(3, 5)) {
                                    chunk.data[i][x] = 3;
                                } else if (i - y < random(3, 32)) {
                                    chunk.data[i][x] = 4;
                                } else if (i - y < random(16, 32)) {
                                    chunk.data[i][x] = 5;
                                } else if (y > 60 && random() > 0.3) {
                                    chunk.data[i][x] = 6;
                                } else if (y > 80 && random() > 0.4) {
                                    chunk.data[i][x] = 7;
                                } else if (y > 100 && random() > 0.5) {
                                    chunk.data[i][x] = 8;
                                } else if (y > 70) {
                                    chunk.data[i][x] = 2;
                                } else {
                                    // chunk.data[i][x] = 3;
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
            }

             */
        },

        createCave: function (number) {
            const random = this.getRandom(30000 + number);
            const width = random(16, 128);
            const height = random(16, 48);

            const adjCount = (data, x, y) => {
                let count = 0;
                for (let a = -1; a <= 1; a++) {
                    for (let b = -1; b <= 1; b++) {
                        count += data[a + y][b + x] === 1;
                    }
                }
                return count;
            }

            const data1 = new Array(height).fill(0).map(_ => new Array(width).fill(0)); // all empty
            const data2 = new Array(height).fill(0).map(_ => new Array(width).fill(1)); // all full

            // init data1 with random + border wall
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    if (x < 1 || y < 1 || x > width - 2 || y > height - 2) {
                        data1[y][x] = 1;
                    } else if (random() > 0.54) {
                        data1[y][x] = 1;
                    }
                }
            }

            // perform n iterations
            for (let i = 0; i < 6; i++) {
                // set walls based on adjacent count
                for (let x = 1; x < width - 1; x++) {
                    for (let y = 1; y < height - 1; y++) {
                        if (adjCount(data1, x, y) > 4) {
                            data2[y][x] = 1;
                        } else {
                            data2[y][x] = 0;
                        }
                    }
                }

                // copy data1 into data2
                for (let x = 1; x < width - 1; x++) {
                    for (let y = 1; y < height - 1; y++) {
                        data1[y][x] = data2[y][x];
                    }
                }
            }

            return data1;
        },

        createCaves: function (number, chunk) {
            const random = this.getRandom(20000 + number);
            const get = (x, y) => {
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                    return undefined;
                } else {
                    return chunk.data[y][x];
                }
            }
            const set = (x, y, v) => {
                if (!(x < 0 || x >= this.width || y < 0 || y >= this.height)) {
                    chunk.data[y][x] = v;
                }
            }

            for (let i = 0, n = random(8, 16); i < n; i++) {
                const x = random(16, this.width - 16);
                const y = random(16, this.height - 16);

                if (y > chunk.surface[x] - random(0, 64)) {
                    const cave = this.createCave(number + 4000 * i);

                    if (x + cave[0].length < this.width) {
                        for (let cY = 0; cY < cave.length; cY++) {
                            for (let cX = 0; cX < cave[0].length; cX++) {
                                if (get(x + cX, y + cY) === 1) {
                                    set(x + cX, y + cY, cave[cY][cX]);
                                }
                            }
                        }
                    }
                }
            }
        },

        // https://newbedev.com/seeding-the-random-number-generator-in-javascript
        // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
        // http://www.roguebasin.com/index.php/Random_number_generator
        _sfc32: function (a, b, c, d) {
            return function () {
                a >>>= 0;
                b >>>= 0;
                c >>>= 0;
                d >>>= 0;
                let t = (a + b) | 0;
                a = b ^ b >>> 9;
                b = c + (c << 3) | 0;
                c = (c << 21 | c >>> 11);
                d = d + 1 | 0;
                t = t + d | 0;
                c = c + t | 0;
                return (t >>> 0) / 4294967296;
            }
        },

        getRandom: function (id) {
            const rand = this._sfc32(0x9E3779B9 + id * id, 0x243F6A88, id ^ 0xB7E15162, this.seed ^ 0xDEADBEEF);
            for (let i = 0; i < 19 + id % 7; i++) {
                rand();
            }
            return (min, max) => {
                if (min || max) {
                    return min + Math.floor(rand() * (max - min));
                } else {
                    return rand();
                }
            };
        },
    };

    const gfx = {
        canvas: null,
        ctx: null,

        init: function (canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.canvas.setAttribute("width", window.innerWidth + "");
            this.canvas.setAttribute("height", window.innerHeight + "");

            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;

            this.ctx.font = '20px mono';
            this.ctx.fillStyle = "black";
            this.ctx.textBaseline = "top";
        },

        draw: function () {
            const ctx = this.ctx;
            ctx.save();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const zoom = 2;
            const color = id => Object.values(blocks).filter(b => b.id === id)[0].color;

            for (let i = 0; i < 2; i++) {
                const chunk = world.getChunk(i).data;
                for (let y = 0; y < chunk.length; y++) {
                    for (let x = 0; x < chunk[y].length; x++) {
                        const c = chunk[y][x];
                        if (c !== 0) {
                            ctx.fillStyle = color(c);
                            ctx.fillRect(x * zoom, zoom * i * world.height + y * zoom, zoom, zoom);
                        }
                    }
                }
            }

            ctx.restore();
        }
    };

    world.init(838238121);

    gfx.init("gfx");
    gfx.draw();

    window.world = world;

});