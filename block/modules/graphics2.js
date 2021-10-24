import {Settings} from "./settings.js";
import {Game} from "./game2.js";
import {Keyboard} from "./keyboard.js";

class Animation {
    constructor(fps) {
        this.fps = fps;
        this.timestamp = 0;
    }

    start(loop) {
        const go = timestamp => {
            const diff = timestamp - this.timestamp;
            if (this.fps && diff >= 1000 / this.fps) {
                loop(timestamp, diff);
                this.timestamp = timestamp;
            }
            requestAnimationFrame(go);
        }
        requestAnimationFrame(go);
    }

    stop() {
        this.fps = 0;
    }
}

class Graphics {

    constructor(canvasId, game) {
        this.game = game;

        this.canvas = document.getElementById(canvasId);
        this.canvas.setAttribute("width", window.innerWidth + "");
        this.canvas.setAttribute("height", window.innerHeight + "");

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.font = '9px mono';
        this.ctx.fillStyle = "black";
        this.ctx.textBaseline = "top";

        this.zoom = 128;
        this.offset = {
            x: Math.round(window.innerWidth / 2),
            y: Math.round(window.innerHeight / 2)
        };

        Keyboard.init();
    }

    start(fps) {
        this.animation = new Animation(fps);
        this.animation.start((timestamp, diff) => {
            this.game.update(timestamp, diff);
            this.update();
            this.draw();
        });
    }

    update() {
        Keyboard.has("Digit1") ? this.zoom = 8 * 2 : 0;
        Keyboard.has("Digit2") ? this.zoom = 8 * 4 : 0;
        Keyboard.has("Digit3") ? this.zoom = 8 * 8 : 0;
        Keyboard.has("Digit4") ? this.zoom = 8 * 16 : 0;
        Keyboard.has("Digit5") ? this.zoom = 8 * 32 : 0;
        Keyboard.has("Digit6") ? this.zoom = 8 * 64 : 0;
        Keyboard.has("Digit7") ? this.zoom = 8 * 128 : 0;
    }

    drawBlock(x, y) {
        const r = this.game.getBlockAbsolute(x, y);

        // this.ctx.beginPath();
        // this.ctx.strokeStyle = "rgba(0,0,0,0.69)";
        // this.ctx.rect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
        // this.ctx.stroke();

        // this.ctx.fillStyle = "#000";
        // this.ctx.textBaseline = 'bottom';
        // this.ctx.fillText(`${r.x},${r.y} b:${r.blockId}`, this.rX(x) + this.rS(0.01), this.rY(y));

        if (r.blockId) {
            this.ctx.fillStyle = r.block.color;
            this.ctx.fillRect(this.rX(x) + this.rS(0.1), this.rY(y + 1) + this.rS(0.1), this.rS(0.8), this.rS(0.8));
        }
    }

    // origin is at center of player model
    // player.y is feet level; player.x is at center of player (width/2)

    rX(x) {
        return this.offset.x + (x - this.game.player.x) * this.zoom;
    }

    rY(y) {
        return this.offset.y + (this.game.player.y - y + this.game.player.height / 2) * this.zoom;
    }

    rS(v) {
        return v * this.zoom;
    }

    draw() {
        const ctx = this.ctx;
        const player = this.game.player;

        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "rgba(252,24,0,0.76)";
        ctx.fillRect(this.offset.x - 2, this.offset.y - 2, 4, 4);

        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(this.rX(player.x) - 4, this.rY(player.y) - 4, 8, 8);

        const blocksCountX = Math.ceil(0.5 * this.canvas.width / this.zoom);
        const blocksCountY = Math.ceil(0.5 * this.canvas.height / this.zoom) + 1;

        for (let yi = -blocksCountY; yi <= blocksCountY; yi++) {
            for (let xi = -blocksCountX; xi <= blocksCountX; xi++) {
                this.drawBlock(Math.floor(player.x) + xi, Math.floor(player.y) + yi);
            }
        }

        // !!!! IMPORTANT player.x is at player.width/2, player.y is a feet level,

        // player
        ctx.fillStyle = "rgba(60,187,167,0.44)";
        ctx.fillRect(this.rX(player.x - player.width / 2), this.rY(player.y + player.height), this.rS(player.width), this.rS(player.height));
        ctx.fillStyle = "#000";
        ctx.font = '20px mono';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.game.player.x.toFixed(2)},${this.game.player.y.toFixed(2)}`, this.rX(player.x), this.rY(player.y));

        ctx.restore();
    }
}

export {Graphics}
