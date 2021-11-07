import {Canvas} from "./canvas.js";
import {Settings} from "./settings.js";

class Sky extends Canvas {

    constructor(canvasId, game) {
        super(canvasId);
        this.game = game;
        this.ctx.imageSmoothingEnabled = true;

        const dark = {r: 20, g: 20, b: 20};
        const day = [{r: 58, g: 168, b: 243}, {r: 91, g: 184, b: 246}, {r: 189, g: 244, b: 250}];
        const night = [dark, dark, dark];

        this.palette = {
            0: night,
            5: night,
            6: day,

            18: day,
            19: night,
            24: night,
        };
    }

    frame(timestamp, diff) {
        if (this.game.meta.blockSize) {
            this.draw();
        }
    }

    draw() {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.sky();
        // this.celestial(1, 0.2, 0.2, 2, 6, Math.PI / 2, 3 * Math.PI / 2, 255, 251, 38);
        // this.celestial(1, 0.2, 0.2, 1.8, 2, 3 * Math.PI / 2, Math.PI / 2, 255, 255, 255);
        const sun = this.staticCelestial(0.04, 0.2, Math.PI / 2, 3 * Math.PI / 2, 255, 251, 38);
        this.staticCelestial(0.037, 0.05, 3 * Math.PI / 2, Math.PI / 2, 255, 255, 255);

        // this.ctx.fillStyle = "#fff";
        // this.ctx.font = "30px mono";
        // this.ctx.textBaseline = "bottom";
        // this.ctx.textAlign = "left";
        // this.ctx.fillText(this.game.getGameClock(), 0, this.canvas.height);
        this.ctx.restore();

        this.game.meta.light = sun;
    }

    sky() {
        this.ctx.save();

        const level = y => (Settings.chunk.height - y) / Settings.chunk.height;

        const blockLevel = this.blockLevel();
        const gradient = this.ctx.createLinearGradient(0, blockLevel(Settings.chunk.height), 0, blockLevel(0));

        const get = (hour, index) => {
            let from = Object.keys(this.palette).filter(h => hour >= parseInt(h));
            from = parseInt(from[from.length - 1]);
            const to = parseInt(Object.keys(this.palette).filter(h => parseInt(h) > from)[0]);

            const percentage = (hour - from) / (to - from);
            const mix = this.mix(this.palette[from][index], this.palette[to][index], percentage);
            // console.log(`hour:${this.hour().toFixed(2)} from:${from} to:${to} ${percentage.toFixed(2)} ${index} ${mix}`);
            return mix;
        };

        const night = `rgb(${this.palette[0][0].r},${this.palette[0][0].g},${this.palette[0][0].b})`;
        gradient.addColorStop(level(Settings.chunk.height), get(this.hour(), 0));
        gradient.addColorStop(level(Settings.chunk.middle + 16), get(this.hour(), 1));
        gradient.addColorStop(level(Settings.chunk.middle), get(this.hour(), 2));
        gradient.addColorStop(level(40), night);
        gradient.addColorStop(level(0), "#000");

        // gradient.addColorStop(level(Settings.chunk.height), "#3aa8f3");
        // gradient.addColorStop(level(Settings.chunk.height - 16), "#5bb8f6");
        // gradient.addColorStop(level(Settings.chunk.middle), "#bde0fa");
        // gradient.addColorStop(level(40), "#333");
        // gradient.addColorStop(level(0), "#111");

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.restore();
    }

    update() {
        this.gamePlayerY = this.gamePlayerY === undefined ? this.game.player.y : this.gamePlayerY;
    }

    blockLevel() {
        const screen = this.canvas.height / this.game.meta.blockSize;
        const playerY = this.game.player.y + this.game.player.widthStand;
        const top = playerY + 0.5 * screen;
        const bottom = playerY - 0.5 * screen;

        const y0 = -(Settings.chunk.height - top) * this.game.meta.blockSize; // upper edge
        const y1 = this.canvas.height + bottom * this.game.meta.blockSize; // lower edge

        return level => {
            return y1 + (y0 - y1) * (level / Settings.chunk.height)
        };
    }

    mix(a, b, percentage) {
        const m = (a, b) => b * percentage + (1 - percentage) * a;
        return `rgb(${m(a.r, b.r, percentage)},${m(a.g, b.g, percentage)},${m(a.b, b.b, percentage)})`;
    }

    hour() {
        return (this.game.getGameTime() / 60) % 24;
    }

    celestial(_originY, _radiusX, _radiusY, _r1, _r2, spinOffset, alphaOffset, r, g, b) {
        const blockLevel = this.blockLevel();

        const hour = this.hour();
        const originX = this.canvas.width / 2;
        const angle = 2 * Math.PI * hour / 24;

        this.ctx.save();

        const radiusX = _radiusX * Settings.chunk.height * this.game.meta.blockSize;
        const radiusY = _radiusY * Settings.chunk.height * this.game.meta.blockSize;
        const originY = _originY * blockLevel(0.5 * Settings.chunk.height);
        const r1 = _r1 * this.game.meta.blockSize;
        const r2 = _r2 * this.game.meta.blockSize;
        const x = originX + radiusX * Math.cos(spinOffset + angle);
        const y = originY + radiusY * Math.sin(spinOffset + angle);
        const alpha = Math.min(1, Math.max(0, 4 * Math.pow(Math.sin(alphaOffset + angle), 1)));
        const gradient = this.ctx.createRadialGradient(x, y, r1, x, y, r2);

        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // this.ctx.fillStyle = "#f2f";
        // this.ctx.fillRect(originX, originY, 5, 5);
        // this.ctx.fillStyle = "#000";
        // this.ctx.fillRect(x, y, 5, 5);

        this.ctx.restore();
    }

    staticCelestial(r1, r2, spinOffset, alphaOffset, r, g, b) {
        const depthFactor = Math.min(0, (this.game.player.y - Settings.chunk.middle) / Settings.chunk.middle); // top 0, mid 0, bottom -1

        const x0 = Math.floor(this.canvas.width / 2);
        const y0 = Math.floor(this.canvas.height / 2 + 2 * this.canvas.height * depthFactor);
        const radiusX = 1.1 * Math.floor(this.canvas.width / 2);
        const radiusY = Math.floor(this.canvas.height / 2);
        const hour = this.hour();
        const angle = 2 * Math.PI * hour / 24;
        const alpha = Math.min(1, Math.max(0, 4 * Math.pow(Math.sin(alphaOffset + angle), 1)));

        this.ctx.save();

        const x = x0 + radiusX * Math.cos(spinOffset + angle);
        const y = y0 + radiusY * Math.sin(spinOffset + angle);
        const gradient = this.ctx.createRadialGradient(x, y, r1 * this.canvas.height, x, y, r2 * this.canvas.height);

        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // this.ctx.fillStyle = "#f2f";
        // this.ctx.fillRect(x0, y0, 5, 5);
        // this.ctx.fillStyle = "#000";
        // this.ctx.fillRect(x, y, 5, 5);

        this.ctx.restore();

        return {
            x: Math.max(0, Math.min(1, x / this.canvas.width)),
            y: Math.max(0, Math.min(1, 1 - y / this.canvas.height)),
            v: alpha
        }
    }

}

export {Sky};