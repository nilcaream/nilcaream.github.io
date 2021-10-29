import {Keyboard} from "./keyboard.js";
import {Animation} from "./animation.js";
import {Settings} from "./settings.js";
import {Mouse} from "./mouse.js";

class Graphics {

    constructor(canvasId, game) {
        this.game = game;

        this.canvas = document.getElementById(canvasId);
        this.canvas.setAttribute("width", window.innerWidth + "");
        this.canvas.setAttribute("height", window.innerHeight + "");

        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.font = '9px mono';
        this.ctx.fillStyle = "#000";
        this.ctx.textBaseline = "top";
        this.ctx.lineWidth = 1;

        this.debug = 1;

        this.zoom = 64;
        this.offset = {
            x: Math.round(window.innerWidth / 2),
            y: Math.round(window.innerHeight / 2)
        };

        Keyboard.init();
        Mouse.init();
    }

    start(fps) {
        this.animation = new Animation(fps);
        this.animation.start((timestamp, diff) => {
            this.update(timestamp, diff);
            this.game.update(timestamp, diff, this.sX(Mouse.x), this.sY(Mouse.y));
            this.draw(timestamp, diff);
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

            if (r.seen) {
                this.ctx.fillStyle = r.block.color;
            } else {
                this.ctx.fillStyle = "#000";
            }

            this.ctx.fillRect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
        } else if (this.debug === 2) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = "rgba(0,0,0,0.69)";
            this.ctx.rect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
            this.ctx.stroke();

            if (r.blockId) {
                this.ctx.fillStyle = r.block.color;
                this.ctx.fillRect(this.rX(x) + this.rS(0.1), this.rY(y + 1) + this.rS(0.1), this.rS(0.8), this.rS(0.8));
            }

            this.ctx.fillStyle = "#000";
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(`${r.x},${r.y} b:${r.blockId}`, this.rX(x) + this.rS(0.01), this.rY(y));
        }
    }

    // origin is at center of player model in stand position
    // player.y is feet level; player.x is at center of player (width/2)

    // convert chunk x,y to screen x,y
    rX(x) {
        return Math.floor(this.offset.x + (x - this.game.player.x) * this.zoom);
    }

    rY(y) {
        return Math.floor(this.offset.y + (this.game.player.y - y + this.game.player.heightStand / 2) * this.zoom);
    }

    rS(v) {
        return v * this.zoom;
    }

    // convert screen x,y to chunk x,y
    sX(x) {
        return this.game.player.x + (x - this.offset.x) / this.zoom;
    }

    sY(y) {
        return this.game.player.y + this.game.player.heightStand / 2 + (this.offset.y - y) / this.zoom;
    }

    draw(timestamp, diff) {
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

        // player
        ctx.fillStyle = "rgba(60,187,167,0.44)";
        ctx.fillRect(this.rX(player.x - player.width / 2), this.rY(player.y + player.height), this.rS(player.width), this.rS(player.height));

        if (this.debug === 2) {
            ctx.fillStyle = "#000";
            ctx.font = '10px mono';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.game.player.x.toFixed(2)},${this.game.player.y.toFixed(2)}`, this.rX(player.x), this.rY(player.y));
        }

        const selected = player.selected;
        if (selected.present) {
            if (this.debug === 2) {
                ctx.fillStyle = "#28c0af";
                ctx.fillRect(this.rX(selected.x + 0.35), this.rY(selected.y + 1 - 0.35), this.rS(0.3), this.rS(0.3));

                ctx.strokeStyle = "#33f";
                ctx.beginPath();
                ctx.moveTo(this.rX(selected.x0), this.rY(selected.y0));
                ctx.lineTo(this.rX(selected.x1), this.rY(selected.y1));
                ctx.stroke();
            } else {
                const dash = 5;
                const offset = Math.floor((timestamp / 150) % (2 * dash));
                ctx.setLineDash([dash, dash]);

                ctx.beginPath();
                ctx.lineDashOffset = offset;
                ctx.strokeStyle = "#111";
                ctx.rect(this.rX(selected.x), this.rY(selected.y + 1), this.rS(1), this.rS(1));
                ctx.stroke();

                ctx.beginPath();
                ctx.lineDashOffset = offset + dash;
                ctx.strokeStyle = "#eee";
                ctx.rect(this.rX(selected.x), this.rY(selected.y + 1), this.rS(1), this.rS(1));
                ctx.stroke();

                let x0, y0, x1, y1;
                if (player.adjacent.face === "right") {
                    x0 = selected.x + 1;
                    x1 = selected.x + 1;
                    y0 = selected.y;
                    y1 = selected.y + 1;
                } else if (player.adjacent.face === "left") {
                    x0 = selected.x;
                    x1 = selected.x;
                    y0 = selected.y;
                    y1 = selected.y + 1;
                } else if (player.adjacent.face === "top") {
                    x0 = selected.x;
                    x1 = selected.x + 1;
                    y0 = selected.y + 1;
                    y1 = selected.y + 1;
                } else if (player.adjacent.face === "bottom") {
                    x0 = selected.x;
                    x1 = selected.x + 1;
                    y0 = selected.y;
                    y1 = selected.y;
                }

                ctx.lineWidth = 3;

                ctx.beginPath();
                ctx.lineDashOffset = dash;
                ctx.strokeStyle = "#111";
                ctx.moveTo(this.rX(x0), this.rY(y0));
                ctx.lineTo(this.rX(x1), this.rY(y1));
                ctx.stroke();

                ctx.beginPath();
                ctx.lineDashOffset = 2 * dash;
                ctx.strokeStyle = "#eee";
                ctx.moveTo(this.rX(x0), this.rY(y0));
                ctx.lineTo(this.rX(x1), this.rY(y1));
                ctx.stroke();

                ctx.lineWidth = 1;
                ctx.setLineDash([]);
            }
        }

        ctx.restore();

        this.drawMousePointer();
    }

    drawMousePointer() {
        this.ctx.save();

        const midX = Mouse.x;
        const midY = Mouse.y;
        const length = 16;

        const draw = () => {
            this.ctx.beginPath();
            this.ctx.moveTo(midX - length / 2, midY);
            this.ctx.lineTo(midX + length / 2, midY);
            this.ctx.stroke();
            this.ctx.moveTo(midX, midY - length / 2);
            this.ctx.lineTo(midX, midY + length / 2);
            this.ctx.stroke();
        }

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "#fff";
        draw();

        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = "#000";
        draw();

        if (this.debug === 2) {
            this.ctx.fillStyle = "#000";
            this.ctx.textBaseline = 'middle';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`${this.sX(midX).toFixed(2)},${this.sY(midY).toFixed(2)}`, midX, midY - length);
        }
        this.ctx.restore();
    }
}

export {Graphics}
