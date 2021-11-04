import {Random} from "./random.js";

class Texture {
    constructor(width, height, seed = new Date().getTime()) {
        this.width = width;
        this.height = height;
        this.rng = Random(seed, 11);

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", width + "");
        this.canvas.setAttribute("height", height + "");

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
    }

    getCanvas() {
        return this.canvas;
    }

    getImageData() {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }

    getImage(onLoad) {
        const image = new Image;
        image.onload = () => onLoad(image);
        image.src = this.canvas.toDataURL("image/png", 1);
    }

    defaults = {
        type: "rect",
        x0: 0, y0: 0,
        x1: 16, y1: 16,
        hue: 33, saturation: 100, luminosity: 100, alpha: 100,
        hueMax: 0, saturationMax: 0, luminosityMax: 0, alphaMax: 0,
        width: 1, height: 1,
        widthMax: 0, heightMax: 0,
        count: 1, countMax: 0,
        chance: 0,
        spread: 0,
        wrapX: false, wrapY: false
    }

    noise(opt) {
        // apply defaults if not set in opt
        Object.keys(this.defaults)
            .filter(key => opt[key] === undefined)
            .forEach(key => opt[key] = this.defaults[key]);

        // override default max values
        Object.keys(opt)
            .filter(key => key.endsWith("Max"))
            .filter(key => !opt[key])
            .forEach(key => opt[key] = opt[key.replace("Max", "")]);

        if (opt.type === "fillRect") {
            this.ctx.fillStyle = this.optHsla(opt);
            this.ctx.fillRect(opt.x0, opt.y0, opt.x1 - opt.x0, opt.y1 - opt.y0);
        } else if (opt.type === "fillPixel") {
            let width, height;
            if (opt.chance > 0) {
                for (let x = opt.x0; x < opt.x1; x++) {
                    for (let y = opt.y0; y < opt.y1; y++) {
                        if (this.rng(0, 100) < opt.chance) {
                            this.ctx.fillStyle = this.optHsla(opt);
                            width = this.rng(opt.width, opt.widthMax, true);
                            height = this.rng(opt.height, opt.heightMax, true);
                            this.fillRect(opt, x, y, width, height);
                        }
                    }
                }
            } else if (opt.count > 0 && opt.spread > 0) {
                let x, y;
                let results = [];
                const count = this.rng(opt.count, opt.countMax, true);
                for (let i = 0; i < 128 && results.length < count; i++) {
                    x = this.rng(opt.x0, opt.x1, true);
                    y = this.rng(opt.y0, opt.y1, true);
                    const tooClose = results.map(r => Math.sqrt((r.x - x) * (r.x - x) + (r.y - y) * (r.y - y))).filter(d => d < opt.spread).length;
                    if (tooClose === 0) {
                        results.push({x: x, y: y});
                    }
                }
                results.forEach(r => {
                    width = this.rng(opt.width, opt.widthMax, true);
                    height = this.rng(opt.height, opt.heightMax, true);
                    this.ctx.fillStyle = this.optHsla(opt);
                    this.fillRect(opt, r.x, r.y, width, height);
                });
            } else {
                let x, y;
                const count = this.rng(opt.count, opt.countMax, true);
                for (let i = 0; i < count; i++) {
                    x = this.rng(opt.x0, opt.x1, true);
                    y = this.rng(opt.y0, opt.y1, true);
                    width = this.rng(opt.width, opt.widthMax, true);
                    height = this.rng(opt.height, opt.heightMax, true);
                    this.ctx.fillStyle = this.optHsla(opt);
                    this.fillRect(opt, x, y, width, height);
                }
            }
        }
    }

    fillRect(opt, x, y, width, height) {
        if (opt.wrapX || opt.wrapY) {
            for (let xi = x; xi < x + width; xi++) {
                for (let yi = y; yi < y + height; yi++) {
                    this.ctx.fillRect(xi % this.width, yi % this.height, 1, 1);
                }
            }
        } else {
            if (opt.shadow) {
                this.ctx.save();
                this.ctx.shadowColor = "#000";
                this.ctx.shadowColor = this.hsla(opt.hue, opt.saturation, 0.7 * opt.luminosity, 60, opt.hueMax, opt.saturationMax, 0.7 * opt.luminosityMax, 60);
                this.ctx.shadowBlur = 1;
                this.ctx.shadowOffsetX = -1;
                this.ctx.shadowOffsetY = 1;
                this.ctx.fillRect(x, y, width, height);
                this.ctx.restore();
            } else {
                this.ctx.fillRect(x, y, width, height);
            }
        }
    }

    optHsla(opt) {
        return this.hsla(opt.hue, opt.saturation, opt.luminosity, opt.alpha, opt.hueMax, opt.saturationMax, opt.luminosityMax, opt.alphaMax);
    }

    hsla(h, s, l, a, hMax = h, sMax = s, lMax = l, aMax = a) {
        const vh = this.rng(h, hMax, true);
        const vs = Math.min(100, Math.max(0, this.rng(s, sMax, true)));
        const vl = Math.min(100, Math.max(0, this.rng(l, lMax, true)));
        const va = Math.min(1, Math.max(0, this.rng(a, aMax, true) / 100));
        return `hsla(${vh},${vs}%,${vl}%,${va})`;
    }

    static draw(ctx, rawTexture, id, x, y, width, height) {
        if (rawTexture.image) {
            ctx.drawImage(rawTexture.image, 0, 0, rawTexture.width, rawTexture.height, x, y, width, height);
        } else if (!rawTexture.loading) {
            rawTexture.loading = true;
            const texture = new Texture(16, 16, 1); // TODO remove hardcoded values
            rawTexture.data.forEach(opt => texture.noise(opt));
            texture.getImage(image => {
                rawTexture.image = image;
                rawTexture.loading = false;
            });
        }
    }
}

const Textures = {

    result: {
        NOT_FOUND: "not found",
        LOADING: "loading",
        DRAWN: "drawn"
    },

    store: {},

    load: function (id, seed, width, height, opt) {
        console.log(`Loading texture ${id} seed ${seed}`);
        const element = {
            texture: new Texture(width, height, seed)
        }
        this.store[id] = element;
        opt.forEach(o => element.texture.noise(o));
        element.texture.getImage(image => {
            element.image = image;
            // console.log(`Loaded texture ${id} seed ${seed}`);
        });
    },

    draw: function (ctx, id, x, y, w, h) {
        const element = this.store[id];
        if (element === undefined) {
            return this.result.NOT_FOUND;
        } else if (element.image === undefined) {
            return this.result.LOADING;
        } else {
            ctx.drawImage(element.image, 0, 0, element.texture.width, element.texture.height, x, y, w, h);
            return this.result.DRAWN;
        }
    }
}

export {
    Texture, Textures
};
