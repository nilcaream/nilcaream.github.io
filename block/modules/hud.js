import {Keyboard} from "./keyboard.js";
import {Canvas} from "./canvas.js";
import {Settings} from "./settings.js";

class Hud extends Canvas {

    constructor(canvasId, game) {
        super(canvasId);
        this.game = game;

        this.ctx.textBaseline = "top";

        this.updateFontSize(13);

        this.zoom = 128;
        this.offset = {
            x: Math.round(window.innerWidth / 2),
            y: Math.round(window.innerHeight / 2)
        };

        Keyboard.init();
    }

    frame(timestamp, diff) {
        this.update();
        if (this.game.meta.fps) {
            this.draw();
        }
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
        const position = this.game.getBlockAbsolute(player.x, player.y);

        let text =
            `${player.name} p:(${player.x.toFixed(2)},${player.y.toFixed(2)}) ` +
            `v:(${player.velocityX.toFixed(2)},${player.velocityY.toFixed(2)}) ` +
            `c:${position.chunkId} ` +
            `b:${this.game.meta.blockSize} ` +
            `${this.game.mode}:${this.game.generator.seed} ${position.biomeName} ` +
            `HP:${this.game.player.health} ` +
            `FPS:${this.game.meta.fps.toFixed(0)}/${this.game.meta.targetFps.toFixed(0)} ` +
            `${this.game.meta.frame}ms ` +
            `${this.game.getGameClock()} `;

        if (player.selected.present) {
            const block = (Settings.blocks[player.selected.block.blockId] || {}).name;
            text += `${block} ${player.selected.x},${player.selected.y} ${player.adjacent.face} `;
        }

        text = (text + (this.game.meta.debug ? `DEBUG:${this.game.meta.debug}` : "")).trim();

        const width = ctx.measureText(text).width;
        const height = this.fontSize;

        ctx.save();

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000";
        ctx.fillText(text, 0, 0);

        ctx.restore();
    }
}

export {Hud}
