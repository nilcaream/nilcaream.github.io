// noinspection DuplicatedCode

((r) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r) : r())(() => {

    const state = {
        player: {
            x: 0,
            y: 0
        },

        zoom: 64,

        offset: {
            x: Math.round(window.innerWidth / 2),
            y: Math.round(window.innerHeight / 2)
        },

        chunks: {
            left: [0, 0, 0],
            current: 0,
            right: [0, 0, 0]
        },

        // block: {
        //     x:0,
        //     y:0,
        // },

        init: function () {
            this.keyboard.init();
        },

        update: function (diff) {
            this.player.x += (diff * 1) * (this.keyboard.has("KeyD") - this.keyboard.has("KeyA")) / 64;
            this.player.y -= (diff * 1) * (this.keyboard.has("KeyS") - this.keyboard.has("KeyW")) / 64;

            this.chunks.current = Math.floor(this.player.x / 256);
            this.keyboard.has("Digit1") ? this.zoom = 8 * 2 : 0;
            this.keyboard.has("Digit2") ? this.zoom = 8 * 4 : 0;
            this.keyboard.has("Digit3") ? this.zoom = 8 * 8 : 0;
            this.keyboard.has("Digit4") ? this.zoom = 8 * 16 : 0;
            this.keyboard.has("Digit5") ? this.zoom = 8 * 32 : 0;
            this.keyboard.has("Digit6") ? this.zoom = 8 * 64 : 0;
            this.keyboard.has("Digit7") ? this.zoom = 8 * 128 : 0;
        },

        keyboard: {
            map: {},

            init: function () {
                document.addEventListener("keydown", (e) => this.map[e.code] = true, false);
                document.addEventListener("keyup", (e) => this.map[e.code] = false, false);
            },

            has: function (code) {
                return this.map[code] || 0;
            }
        }
    };

    const images = {
        store: {},

        base: 16, // element size in px
        size: 16, // number of elements in a row

        load: function (id, src) {
            console.log(`Loading ${src}`);
            this.store[id] = {
                loaded: false
            };
            const image = new Image();
            image.src = src;
            image.onload = (e) => {
                console.log(`Loaded ${src} as ${id}`);
                this.store[id] = {
                    loaded: true,
                    image: image
                };
            }
        },

        onLoad: function (onLoad) {
            const timer = setTimeout(() => {
                if (Object.values(this.store).filter(v => !v.loaded).length === 0) {
                    console.log(`Finished loading images`);
                    clearTimeout(timer);
                    onLoad();
                }
            }, 100);
        },

        draw: function (ctx, id, index, screen, x, y) {
            const iX = index % this.size;
            const iY = Math.floor(index / this.size);
            ctx.drawImage(this.store[id].image,
                iX * this.base, iY * this.base,
                this.base, this.base,
                x * screen, y * screen,
                screen, screen);
        }
    };

    const hud = {
        canvas: null,
        ctx: null,

        init: function (canvasId) {
            this.canvas = document.getElementById(canvasId);
            this.canvas.setAttribute("width", window.innerWidth + "");
            this.canvas.setAttribute("height", window.innerHeight + "");

            this.ctx = this.canvas.getContext("2d");
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.font = '16px mono';
            this.ctx.fillStyle = "black";
        },

        draw: function (time, diff) {
            this.ctx.save();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillText(`${(1000 / diff).toFixed(2)}`, 3, 15);
            this.ctx.fillText(`(${state.player.x.toFixed(0)},${state.player.y.toFixed(0)})`, 60, 15);
            this.ctx.fillText(`Zoom:${state.zoom}`, 190, 15);
            //this.ctx.fillText(`Chunk:${state.chunks.current}`, 260, 15);

            // state.borders.forEach(b => {
            //     this.ctx.beginPath();
            //     this.ctx.moveTo(b * 256 - state.player.x + this.canvas.width / 2, 0);
            //     this.ctx.lineTo(b * 256 - state.player.x + this.canvas.width / 2, this.canvas.height);
            //     this.ctx.stroke();
            //     this.ctx.fillText(`B:${b}`, b * 256 - state.player.x + this.canvas.width / 2, 15);
            // });
            //
            // this.ctx.beginPath();
            // this.ctx.moveTo(0, -state.player.y + this.canvas.height / 2);
            // this.ctx.lineTo(this.canvas.width, -state.player.y + this.canvas.height / 2);
            // this.ctx.stroke();

            this.ctx.restore();
        }
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

            this.ctx.font = '9px mono';
            this.ctx.fillStyle = "black";
            this.ctx.textBaseline = "top";
        },

        drawV1: function (time, diff) {
            const ctx = this.ctx;
            ctx.save();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // ctx.translate(state.offset.x, state.offset.y);
            // images.draw(ctx, "mobs", 0, state.zoom, 0, 0);
            // images.draw(ctx, "mobs", 16, state.zoom, 0, 1);
            ctx.restore();

            ctx.save();
            for (let x = Math.floor(-state.player.x) % state.zoom - state.zoom; x < window.innerWidth; x += state.zoom) {
                ctx.strokeStyle = '#000000';
                for (let y = Math.floor(-state.player.y) % state.zoom - state.zoom; y < window.innerHeight; y += state.zoom) {
                    ctx.beginPath();
                    ctx.rect(x, y, state.zoom, state.zoom);
                    ctx.stroke();

                    this.ctx.fillText(`${x.toFixed(0)},${y.toFixed(0)}`, x + 0.1 * state.zoom, y + 0.1 * state.zoom);

                    const chunk = Math.floor((state.player.x + x - state.offset.x) / (state.zoom * 16));
                    const cX = Math.floor(state.player.x - state.offset.x) % (state.zoom / 16);
                    const cY = Math.floor(state.player.y - state.offset.y) % (state.zoom);

                    this.ctx.fillText(`C:${chunk}`, x + 0.1 * state.zoom, y + 0.3 * state.zoom);
                    this.ctx.fillText(`(${cX},${cY})`, x + 0.1 * state.zoom, y + 0.5 * state.zoom);


                }

                // if (Math.round(x) % (state.zoom * 16) === 0) { // TODO
                //     ctx.strokeStyle = '#ff0000';
                //     ctx.beginPath();
                //     ctx.moveTo(x, 0);
                //     ctx.lineTo(x, window.innerHeight);
                //     ctx.stroke();
                // }
            }
        },

        drawV2: function (time, diff) {
            const ctx = this.ctx;
            ctx.save();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // const oX = state.offset.x + state.player.x % state.zoom;
            // const oY = state.offset.y + state.player.y % state.zoom;
            // ctx.translate(state.offset.x - state.player.x - state.zoom / 2, state.offset.y - state.player.y - state.zoom / 2);
            ctx.translate(state.offset.x - state.zoom / 2, state.offset.y - state.zoom / 2);


            //Math.floor(-state.player.x) % state.zoom - state.zoom
            //Math.floor(-state.player.y) % state.zoom - state.zoom

            for (let x = -state.player.x; x < window.innerWidth; x += state.zoom) {
                ctx.strokeStyle = '#000000';
                for (let y = 0; y < window.innerHeight; y += state.zoom) {
                    const chunk = Math.floor((x) / (16 * state.zoom));
                    const cX = Math.floor((x) / (state.zoom)) % 16;
                    const cY = Math.floor((y) / (state.zoom));

                    if (chunk === 0 && cY === 0 && cX === 0) {
                        this.ctx.fillStyle = "red";
                    } else {
                        this.ctx.fillStyle = "black";
                    }

                    ctx.beginPath();
                    ctx.rect(x, y, state.zoom, state.zoom);
                    ctx.stroke();

                    this.ctx.fillText(`S:${x.toFixed(0)},${y.toFixed(0)}`, x + 2, y + 2);

                    const pX = Math.floor(x + state.player.x);
                    const pY = Math.floor(y + state.player.y);
                    this.ctx.fillText(`P:${pX},${pY}`, x + 2, y + 10);

                    this.ctx.fillText(`C:${chunk}:${cX},${cY}`, x + 2, y + 18);


                }

                // if (Math.round(x) % (state.zoom * 16) === 0) { // TODO
                //     ctx.strokeStyle = '#ff0000';
                //     ctx.beginPath();
                //     ctx.moveTo(x, 0);
                //     ctx.lineTo(x, window.innerHeight);
                //     ctx.stroke();
                // }


            }

            ctx.beginPath();
            ctx.rect(0, 0, state.zoom, state.zoom);
            ctx.stroke();
            ctx.restore();

            // ctx.save();
            // ctx.translate(state.offset.x, state.offset.y);
            // ctx.beginPath();
            // ctx.rect(-state.zoom / 2, -state.zoom / 2, state.zoom, state.zoom);
            // ctx.stroke();
            // ctx.restore();
        },

        draw: function (time, diff) {
            const ctx = this.ctx;
            ctx.save();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.translate(state.offset.x - state.zoom / 2, state.offset.y - state.zoom / 2);

            const view = {
                iXmin: -64 + Math.floor(state.player.x),
                iXmax: 64 + Math.floor(state.player.x),
                iYmin: -32 - Math.floor(state.player.y),
                iYmax: 32 - Math.floor(state.player.y)
            }
            for (let iX = view.iXmin; iX <= view.iXmax; iX++) {
                const chunk = Math.floor(iX / 16);
                const level = world.getChunk(chunk);

                for (let iY = view.iYmin; iY <= view.iYmax; iY++) {
                    const cX = iX >= 0 ? iX % 16 : (iX % 16 + 16) % 16;
                    const cY = -iY;

                    if (chunk === 0 && cY === 0 && cX === 0) {
                        this.ctx.fillStyle = "red";
                    } else {
                        this.ctx.fillStyle = "black";
                    }

                    const rX = iX * state.zoom - state.player.x * state.zoom;
                    const rY = iY * state.zoom + state.player.y * state.zoom;
                    ctx.beginPath();
                    ctx.rect(rX, rY, state.zoom, state.zoom);
                    ctx.fillText(`${chunk}:${cX},${cY}`, rX + 2, rY + 2);
                    ctx.stroke();

                    if (cY <= level.surface[cX]) {
                        ctx.beginPath();
                        ctx.fillRect(rX + state.zoom / 4, rY + state.zoom / 4, state.zoom / 2, state.zoom / 2);
                        ctx.stroke();
                    }
                }
            }

            ctx.beginPath();
            ctx.rect(0, 0, state.zoom, state.zoom);
            ctx.rect(state.zoom / 4, state.zoom / 4, state.zoom / 2, state.zoom / 2);
            ctx.stroke();
            ctx.restore();
        }
    };

    const animation = {
        _timestamp: 0,

        init: function (fps) {
            this.fps = fps;
        },

        start: function (loop) {
            const go = timestamp => {
                const diff = timestamp - this._timestamp;
                if (diff >= 1000 / this.fps) {
                    loop(timestamp, diff);
                    this._timestamp = timestamp;
                }
                requestAnimationFrame(go);
            }
            requestAnimationFrame(go);
        }
    };

    const world = {
        seed: 0,

        chunks: {},

        init: function (seed) {
            this.seed = seed;
        },

        getChunk: function (number) {
            let chunk = this.chunks[number];
            if (chunk === undefined) {
                chunk = this.createChunk(number);
                this.chunks[number] = chunk;
            }
            // update if needed
            return chunk;
        },

        createChunk: function (number) {
            const drafts = [];
            for (let i = -32; i < 32; i++) {
                drafts.push(this.createDraftChunk(number + i));
            }
            const surfaceChunks = drafts.filter(d => d.y !== false);
            const surfaceX = Smooth(surfaceChunks.map(s => s.number));
            const surfaceY = Smooth(surfaceChunks.map(s => s.y));

            const surface = [];

            let startI = 0;
            for (let i = 0; i < surfaceChunks.length && surfaceX(i) <= number; i += 0.01) {
                startI = i;
            }
            let endI = 0;
            for (let i = surfaceChunks.length - 1; i >= 0 && surfaceX(i) >= number + 1; i -= 0.01) {
                endI = i;
            }

            for (let i = startI; i < endI; i += (endI - startI) / 16) {
                surface.push(Math.round(surfaceY(i)));
            }

            const chunk = drafts.filter(d => d.number === number)[0];
            chunk.surface = surface;

            console.log(`Created chunk ${number}, surface ${surface.join(",")}`);
            return chunk;
        },

        createDraftChunk: function (number) {
            const random = this.getChunkRandom(number);
            let y = false;
            if (random[0] < 100) {
                if (random[1] < 40) {
                    y = 8 + 0.7 * random[2];
                } else if (random[1] < 120) {
                    y = 32 + 0.5 * random[2];
                } else if (random[1] < 170) {
                    y = 48 + 0.25 * random[2];
                } else {
                    y = 60 + 0.05 * random[2];
                }
            }
            const chunk = {
                number: number,
                random: random,
                y: y
            };
            console.log(`Created draft chunk ${number}`);
            return chunk;
        },

        getChunkRandom: function (number) {
            return sha512.array(`${this.seed}-${this.seed % number}-${number}-`);
        }
    };

    hud.init("hud");
    gfx.init("gfx");

    state.init();
    world.init(21321334);
    state.player.y = world.getChunk(0).surface[0] + 1;
    window.world = world;

    images.load("blocks", "blocks.png");
    images.load("mobs", "mobs.png");
    images.onLoad(() => {
        animation.init(20);
        animation.start((time, diff) => {
            //console.log(`${time} ${diff}`);
            state.update(diff);
            gfx.draw(time, diff);
            hud.draw(time, diff);
        });
    });


    // const level = {
    //     chunks: [],
    //     init: function () {
    //         const bases = [];
    //
    //         for (let c = 0; c < 16; c++) {
    //             const rng = [Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1];
    //             const base = new Array(16).fill(0)
    //                 .map((_, i) => 32 + Math.abs(rng[3]) * 32 + 64 * rng[0] * Math.sin(256 * rng[2] + i * rng[1] / 16))
    //                 .map(x => Math.round(x))
    //                 .map(x => Math.min(128, Math.max(0, x)))
    //             ;
    //             const b = base.map(x => c === 0 ? x : x - base[0] + bases[c - 1][15])
    //                 .map(x => Math.min(128, Math.max(0, x)));
    //
    //             console.log(b);
    //             bases.push(b);
    //
    //             const chunk = [];
    //
    //             for (let y = 128; y > 0; y--) {
    //                 const row = [];
    //                 for (let x = 0; x < 16; x++) {
    //                     const b = base[x];
    //                     if (b > y) {
    //                         row.push(0);
    //                     } else if (b === y) {
    //                         row.push(1);
    //                     } else {
    //                         row.push(2);
    //                     }
    //                 }
    //                 chunk.push(row);
    //             }
    //             this.chunks.push(chunk);
    //             console.log(chunk);
    //         }
    //     }
    // };

    const worldOld = {
        seed: 0,
        _chunks: {},

        init: function (seed) {
            this.seed = seed;
        },

        _createSurface: function () {
            const rngX = this._createRng(41);
            const rngY = this._createRng(93);

            for (let i = 0; i < 40; i++) {
                const p = {
                    x: 4 + world.value(1, i) * 32,
                    y: 16 + world.value(2, i) * (128 - 32),
                }
                if (points.length) {
                    p.x += points[points.length - 1].x;
                }
                console.log(`${i} (${p.x.toFixed(0)},${p.y.toFixed(0)})`);
                points.push(p);
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

        _createRng: function (id) {
            const rand = this._sfc32(0x9E3779B9 + id * id, 0x243F6A88, id ^ 0xB7E15162, this.seed ^ 0xDEADBEEF);
            for (let i = 0; i < 19 + id % 7; i++) {
                rand();
            }
            return rand;
        },


        getChunk: function (index) {
            let chunk = this._chunks[index];
            if (chunk === undefined) {
                chunk = this._createChunk(index);
                this._chunks[index] = chunk;
            }
            return chunk;
        },

        _createChunk: function (index) {
            const chunk = [];
            const rng = this._createRng(index);

            const base = Math.floor(64 + 32 * rng());
            for (let y = 0; y < 128; y++) {
                const row = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for (let x = 0; x < 16; x++) {
                    if (y === base) {

                    }
                }
            }
            return chunk;
        }
    }
});