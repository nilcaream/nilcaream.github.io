import {Keyboard} from "./keyboard.js";
import {Animation} from "./animation.js";

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

        this.debug = 1;

        this.zoom = 64;
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
            this.update(timestamp, diff);
            this.draw();
        });
    }

    update(timestamp, diff) {
        Keyboard.had("F4") ? this.game.changeMode() : 0;
        Keyboard.had("F8") ? this.debug = (this.debug + 1) % 3 : 0;

        Keyboard.had("F9") ? this.zoom = this.zoom / 2 : 0;
        Keyboard.had("F10") ? this.zoom = this.zoom * 2 : 0;

        Keyboard.had("F11") ? this.animation.fps = Math.max(5, this.animation.fps - 5) : 0;
        Keyboard.had("F12") ? this.animation.fps = this.animation.fps + 5 : 0;

        this.game.meta.blockSize = this.zoom;
        this.game.meta.targetFps = this.animation.fps;
        this.game.meta.debug = this.debug;
        this.game.meta.fps = 1000 / diff;
    }

    drawBlock(x, y) {
        const r = this.game.getBlockAbsolute(x, y);

        if (this.debug === 1) {
            if (r.blockId) {
                this.ctx.fillStyle = r.block.color;
                this.ctx.fillRect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
            }
        } else if (this.debug === 2) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(0,0,0,0.69)";
            this.ctx.rect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
            this.ctx.stroke();

            this.ctx.fillStyle = "#000";
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(`${r.x},${r.y} b:${r.blockId}`, this.rX(x) + this.rS(0.01), this.rY(y));

            if (r.blockId) {
                this.ctx.fillStyle = r.block.color;
                this.ctx.fillRect(this.rX(x) + this.rS(0.1), this.rY(y + 1) + this.rS(0.1), this.rS(0.8), this.rS(0.8));
            }
        }
    }

    // origin is at center of player model
    // player.y is feet level; player.x is at center of player (width/2)

    rX(x) {
        return Math.floor(this.offset.x + (x - this.game.player.x) * this.zoom);
    }

    rY(y) {
        return Math.floor(this.offset.y + (this.game.player.y - y + this.game.player.height / 2) * this.zoom);
    }

    rS(v) {
        return v * this.zoom;
    }

    draw() {
        const ctx = this.ctx;
        const player = this.game.player;

        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.debug === 2) {
            ctx.fillStyle = "rgba(252,24,0,0.76)";
            ctx.fillRect(this.offset.x - 2, this.offset.y - 2, 4, 4);

            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(this.rX(player.x) - 4, this.rY(player.y) - 4, 8, 8);
        }

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

        if (this.debug === 2) {
            ctx.fillStyle = "#000";
            ctx.font = '20px mono';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.game.player.x.toFixed(2)},${this.game.player.y.toFixed(2)}`, this.rX(player.x), this.rY(player.y));
        }

        ctx.restore();
    }
}

export {Graphics}
