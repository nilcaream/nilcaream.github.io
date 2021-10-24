import {Keyboard} from "./keyboard.js";
import {Animation} from "./animation.js";

class Hud {

    constructor(canvasId, game) {
        this.game = game;

        this.canvas = document.getElementById(canvasId);
        this.canvas.setAttribute("width", window.innerWidth + "");
        this.canvas.setAttribute("height", window.innerHeight + "");

        this.ctx = this.canvas.getContext("2d");
        // this.ctx.imageSmoothingEnabled = false;

        this.updateFontSize(13);

        this.zoom = 128;
        this.offset = {
            x: Math.round(window.innerWidth / 2),
            y: Math.round(window.innerHeight / 2)
        };

        Keyboard.init();
    }

    start(fps) {
        this.animation = new Animation(fps);
        this.animation.start(() => {
            this.update();
            this.draw();
        });
    }

    update() {
        Keyboard.had("F7") ? this.updateFontSize(this.fontSize + 3) : 0;
    }

    updateFontSize(size) {
        if (size > 22) {
            this.fontSize = 10;
        } else {
            this.fontSize = size;
        }
        this.ctx.font = this.fontSize + "px mono";
    }

    draw() {
        const ctx = this.ctx;
        const player = this.game.player;

        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "#000";
        this.ctx.textBaseline = "top";
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        const position = this.game.getBlockAbsolute(player.x, player.y);
        const text = (
            `${player.name} p:(${player.x.toFixed(2)},${player.y.toFixed(2)}) ` +
            `v:(${player.velocityX.toFixed(2)},${player.velocityY.toFixed(2)}) b:${this.game.meta.blockSize} ` +
            `${this.game.mode}:${this.game.generator.seed} ${position.biomeName} ` +
            `${this.game.meta.fps.toFixed(2)} FPS (${this.game.meta.targetFps.toFixed(0)}) ` +
            (this.game.meta.debug ? `DEBUG:${this.game.meta.debug}` : "")
        ).trim();

        ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);

        ctx.restore();
    }
}

export {Hud}
