import {Random} from "./random.js";

class Texture {
    constructor(width, height, seed = new Date().getTime()) {
        this.width = width;
        this.height = height;
        this.rng = Random(seed, 11);
        console.log(`Seed ${seed}`);

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
        hueDelta: 0, saturationDelta: 0, luminosityDelta: 0, alphaDelta: 0,
        width: 1, height: 1,
        widthDelta: 0, heightDelta: 0,
        widthDeltaInclude: true, heightDeltaInclude: true,
        chance: 100,
        wrapX: false, wrapY: false
    }

    noise(opt) {
        // apply defaults if not set in opt
        Object.keys(this.defaults).filter(key => opt[key] === undefined).forEach(key => opt[key] = this.defaults[key]);

        if (opt.type === "fillRect") {
            this.ctx.fillStyle = this.optHsla(opt);
            this.ctx.fillRect(opt.x0, opt.y0, opt.x1 - opt.x0, opt.y1 - opt.y0);
        } else if (opt.type === "fillPixel") {
            let width, height;
            for (let x = opt.x0; x < opt.x1; x++) {
                for (let y = opt.y0; y < opt.y1; y++) {
                    if (this.rng(0, 100) < opt.chance) {
                        this.ctx.fillStyle = this.optHsla(opt);
                        width = this.rng(opt.width - opt.widthDelta, opt.width + opt.widthDelta, opt.widthDeltaInclude);
                        height = this.rng(opt.height - opt.heightDelta, opt.height + opt.heightDelta, opt.heightDeltaInclude);
                        this.fillRect(opt, x, y, width, height);
                    }
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
            this.ctx.fillRect(x, y, width, height);
        }
    }

    optHsla(opt) {
        return this.hsla(opt.hue, opt.saturation, opt.luminosity, opt.alpha, opt.hueDelta, opt.saturationDelta, opt.luminosityDelta, opt.alphaDelta);
    }

    hsla(h, s, l, a, hd = 0, sd = 0, ld = 0, ad = 0) {
        const vh = this.rng(h - hd, h + hd, true);
        const vs = Math.min(100, Math.max(0, this.rng(s - sd, s + sd, true)));
        const vl = Math.min(100, Math.max(0, this.rng(l - ld, l + ld, true)));
        const va = Math.min(1, Math.max(0, this.rng(a - ad, a + ad, true) / 100));
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

export {
    Texture
};
