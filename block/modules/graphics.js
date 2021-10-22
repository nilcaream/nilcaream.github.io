import {Settings} from "./settings.js";
import {Game} from "./game.js";
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

    draw() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillText(`${this.game.player.x},${this.game.player.y}`, 10, 10);

        const offset = {
            x: this.offset.x - this.zoom / 2,
            y: this.offset.y - this.zoom / 2
        }

        const blocksInView = {
            x: Math.ceil(0.5 * this.canvas.width / this.zoom), // 0.5 as it is taken from -x to x
            y: Math.ceil(0.5 * this.canvas.height / this.zoom) // 0.5 as it is taken from -y to y
        }

        ctx.translate(offset.x, offset.y);

        const blocksInChunk = {
            xMin: -blocksInView.x + Math.floor(this.game.player.x),
            xMax: blocksInView.x + Math.floor(this.game.player.x),
            yMin: -blocksInView.y + Math.floor(this.game.player.y),
            yMax: blocksInView.y + Math.floor(this.game.player.y)
        }

        for (let _chunkX = blocksInChunk.xMin; _chunkX <= blocksInChunk.xMax; _chunkX++) {
            const chunkId = Math.floor(_chunkX / Settings.chunk.width);
            const chunkX = _chunkX - chunkId * Settings.chunk.width;

            for (let chunkY = blocksInChunk.yMin; chunkY <= blocksInChunk.yMax; chunkY++) {

                const viewX = _chunkX * this.zoom - this.game.player.x * this.zoom;
                const viewY = -chunkY * this.zoom + this.game.player.y * this.zoom;

                const screenX = Math.floor(viewX + offset.x);
                const screenY = Math.floor(viewY + offset.y);

                ctx.beginPath();
                ctx.rect(viewX, viewY, this.zoom, this.zoom);
                ctx.stroke();

                const block = this.game.getBlock(chunkId, chunkX, chunkY);
                ctx.fillStyle = "#000";
                ctx.fillText(`${chunkId}:${chunkX},${chunkY}:${block}`, viewX + 2, viewY + 2);

                if (block !== Settings.blocks.none.id) {
                    const blockDef = Object.values(Settings.blocks).filter(bl => bl.id === block)[0];
                    ctx.fillStyle = blockDef.color;
                    ctx.fillRect(viewX + this.zoom / 4, viewY + this.zoom / 4, this.zoom / 2, this.zoom / 2);
                }

                ctx.fillStyle = "#000";
                ctx.fillText(`${screenX},${screenY}`, viewX + 2, viewY + 10);
            }
        }

        ctx.beginPath();
        ctx.rect(0, 0, this.zoom, this.zoom);
        ctx.rect(this.zoom / 4, this.zoom / 4, this.zoom / 2, this.zoom / 2);
        ctx.stroke();
        ctx.restore();
    }
}

export {Graphics}
