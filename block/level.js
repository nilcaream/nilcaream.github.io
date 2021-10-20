// noinspection DuplicatedCode

((r) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r) : r())(() => {

    const state = {
        player: {
            x: 0,
            y: 0
        },

        init: function () {
            this.keyboard.init();
        },

        update: function (diff) {
            this.player.x += (diff / 4) * (this.keyboard.has("KeyD") - this.keyboard.has("KeyA"));
            this.player.y += (diff / 4) * (this.keyboard.has("KeyS") - this.keyboard.has("KeyW"));
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

    const bezier = {
        factorial: function (n) {
            return n <= 0 ? 1 : n * this.factorial(n - 1);
        },

        nCr: function (n, r) {
            return (this.factorial(n) / (this.factorial(r) * this.factorial(n - r)));
        },

        curve: function (points) {
            let n = points.length;
            let curvepoints = [];

            for (let u = 0; u <= 1; u += 1 / (5 * n)) {

                let p = {x: 0, y: 0};

                for (let i = 0; i < n; i++) {
                    let B = this.nCr(n - 1, i) * Math.pow((1 - u), (n - 1) - i) * Math.pow(u, i);
                    let px = points[i].x * B;
                    let py = points[i].y * B;

                    p.x += px;
                    p.y += py;

                }

                curvepoints.push(p);
            }

            return curvepoints;
        }
    };

    const linear = {

        calc: function (points) {
            const result = [];
            for (let i = 0; i < points.length; i++) {

            }
        }
    };

    const gfx = {
        canvas: null,
        ctx: null,
        points: [],
        curve: [],

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

        drawV1: function (time, diff) {
            const ctx = this.ctx;
            ctx.save();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillText(`${state.player.x.toFixed(0)},${state.player.y.toFixed(0)}`, 10, 10);

            ctx.translate(0, Math.floor(window.innerHeight / 2));

            const size = 4;
            const x = state.player.x;
            let a = 1;
            let b = 1;
            let c = 1;

            const points = [];
            for (let i = 0; i < 8; i++) {
                points.push({
                    x: world.value(1, x % 16 + i),
                    y: world.value(2, x % 16 + i),
                });
            }


            for (let i = 0; i < window.innerWidth; i += size) {
                const value = 64 * a * Math.sin((x * b + i) / (c * 256));
                ctx.beginPath();
                ctx.rect(i, value, size, size);
                ctx.stroke();
                let value1 = world.value(1, Math.abs(Math.floor((x + i) / 41)));
                if (Math.floor(x + i + 61 * value1) % 101 === 0) {
                    a = world.value(3, Math.abs(Math.floor(x + i)) % 13);
                    c = world.value(2, Math.abs(Math.floor(x + i)) % 14);
                }
                console.log(`${value1} ${a} ${c}`);
            }

            ctx.restore();
        },

        draw: function (time, diff) {
            const ctx = this.ctx;
            ctx.save();
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.fillText(`${state.player.x.toFixed(0)},${state.player.y.toFixed(0)}`, 10, 10);

            // ctx.translate(0, Math.floor(window.innerHeight / 2));

            const scale = 2;

            ctx.strokeStyle = '#000000';
            for (let i = 0; i < this.points.length; i++) {
                ctx.beginPath();
                ctx.rect(scale * this.points[i].x, scale * this.points[i].y, 5, 5);
                ctx.stroke();
            }

            ctx.strokeStyle = '#22ee22';
            for (let i = 0; i < this.curve.length; i++) {
                ctx.beginPath();
                ctx.rect(scale * this.curve[i].x, scale * this.curve[i].y, 4, 4);
                ctx.stroke();
            }

            ctx.strokeStyle = '#33e';
            for (let i = 0; i < 100; i += 0.1) {
                ctx.beginPath();
                let x = scale * this.smoothX(i);
                let y = scale * this.smoothY(i);
                ctx.rect(x, y, 8, 8);
                ctx.stroke();
                //console.log(`${x} ${y}`);
            }

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
        // seed:

        // https://newbedev.com/seeding-the-random-number-generator-in-javascript
        // https://github.com/bryc/code/blob/master/jshash/PRNGs.md
        // http://www.roguebasin.com/index.php/Random_number_generator
        sfc32: function (a, b, c, d) {
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

        rng: function (id) {
            const rand = this.sfc32(0x9E3779B9 + id * id, 0x243F6A88, id ^ 0xB7E15162, this.seed ^ 0xDEADBEEF);
            for (let i = 0; i < 19 + id % 7; i++) {
                rand();
            }
            return rand;
        },

        init: function (seed) {
            this.seed = seed;
        },

        _chunks: {},

        _values: {},

        value: function (_index, _number) {
            const index = _number < 0 ? -_index : _index;
            const number = Math.abs(Math.floor(_number));

            let cache = this._values[index];
            if (cache === undefined) {
                cache = {
                    rng: this.rng(index),
                    values: []
                };
                this._values[index] = cache;
            }
            while (cache.values.length < number + 128) {
                const pack = new Array(128).fill(0).map(_ => cache.rng());
                cache.values.push(...pack);
            }
            return cache.values[number];
        },

        get: function (index) {
            let chunk = this._chunks[index];
            if (chunk === undefined) {
                chunk = this.create(index);
                this._chunks[index] = chunk;
            }
            return chunk;
        },

        create: function (index) {
            const chunk = [];
            const rng = this.rng(index);

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


    state.init();
    gfx.init("gfx");
    world.init(838238121);

    const points = [];
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
    gfx.points = points;
    gfx.curve = bezier.curve(points);

    gfx.smoothX = Smooth(points.map(p => p.x), {
        method: 'linear'
    });
    gfx.smoothY = Smooth(points.map(p => p.y), {
        method: 'lanczos'
    });

    for (let i = 0; i < 100; i++) {
        let x = gfx.smoothX(i);
        let y = gfx.smoothY(i);
        console.log(`${i} smooth ${x} ${y}`);
    }

    console.log(sha512("dupa"));
    console.log(sha512("dupa"));
    console.log(sha512.digest("dupa"));
    console.log(sha512.digest("dupa"));
    console.log(sha512.array("dupa"));
    console.log(sha512.array("dupa"));

    animation.init(20);
    animation.start((time, diff) => {
        state.update(diff);
        gfx.draw(time, diff);
    });
})
;