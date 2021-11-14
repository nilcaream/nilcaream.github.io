import {Keyboard} from "./keyboard.js";
import {Settings} from "./settings.js";
import {Mouse} from "./mouse.js";
import {Images} from "./images.js";
import {Textures} from "./texture.js";
import {Canvas} from "./canvas.js";

class CyclicArray {
    constructor(size) {
        this.size = size;
        this.data = new Array(size).fill(0);
        this.index = 0;
    }

    add(value) {
        this.data[this.index] = value;
        this.index = (this.index + 1) % this.size;
    }

    average() {
        return this.data.reduce((a, b) => a + b) / this.size;
    }

    minimum() {
        return Math.min(...this.data);
    }

    maximum() {
        return Math.max(...this.data);
    }
}

class Graphics extends Canvas {

    constructor(canvasId, game) {
        super(canvasId);

        this.game = game;
        this.frameTime = new CyclicArray(64);

        this.ctx.font = '9px monospace';
        this.ctx.fillStyle = "#000";
        this.ctx.textBaseline = "top";
        this.ctx.lineWidth = 1;

        this.debug = 0;
        this.zoom = 80;

        this.offset = {
            x: Math.floor(window.innerWidth / 2),
            y: Math.floor(window.innerHeight / 2)
        };

        Keyboard.init();
        Mouse.init();

        Images.load("blocks", "blocks.png");
    }


    frame(timestamp, diff) {
        this.frameTimestamp = performance.now();
        this.update(timestamp, diff);
        this.game.update(timestamp, diff, this.sX(Mouse.x), this.sY(Mouse.y));
        this.draw(timestamp, diff);
        this.game.meta.frame = Math.round(1000 * (performance.now() - this.frameTimestamp));
        this.game.meta.fpsMax = Math.round(1000000 / this.game.meta.frame);
        this.frameTime.add(performance.now() - this.frameTimestamp);
        this.game.meta.frameTimeMin = Math.round(this.frameTime.minimum());
        this.game.meta.frameTimeMax = Math.round(this.frameTime.maximum());
        this.game.meta.frameTimeAvg = Math.round(this.frameTime.average());
    }

    update(timestamp, diff) {
        Keyboard.had("F4") ? this.game.changeMode() : 0;
        Keyboard.had("F8") ? this.debug = (this.debug + 1) % 3 : 0;

        Keyboard.had("F9") ? this.zoom = Math.max(16, this.zoom - 16) : 0;
        Keyboard.had("F10") ? this.zoom = this.zoom + 16 : 0;

        Keyboard.had("F11") ? this.animation.fps = Math.max(5, this.animation.fps - 5) : 0;
        Keyboard.had("F12") ? this.animation.fps = this.animation.fps + 5 : 0;

        this.game.meta.blockSize = this.zoom;
        this.game.meta.targetFps = this.animation.fps;
        this.game.meta.debug = this.debug;
        this.game.meta.fps = 1000 / diff;
    }

    drawTexture(x, y, block) {
        const index = 5 * (x % 4) + (y % 4);
        const textureId = `block.${block.name}.${index}`;

        const drawResult = Textures.draw(this.ctx, textureId, this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));

        if (drawResult === Textures.result.NOT_FOUND) {
            Textures.load(textureId, 4620 * block.id + index, 16, 16, block.texture.data);
        }
        if (drawResult !== Textures.result.DRAWN) {
            this.ctx.fillStyle = Settings.blocks.any.color;
            this.ctx.fillRect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
        }
    }

    drawBlock(x, y) {
        const r = this.game.getBlockAbsolute(x, y);

        if (this.debug === 0) {
            if (r.seen) {
                if (r.block.texture) {
                    this.drawTexture(x, y, r.block);
                } else if (r.blockId !== Settings.blocks.none.id) {
                    this.ctx.fillStyle = r.block.color;
                    this.ctx.fillRect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
                    //Images.draw(this.ctx, "blocks", r.blockId, this.rX(x), this.rY(y + 1), this.rS(1));
                }
            } else {
                this.ctx.fillStyle = "#000";
                this.ctx.fillRect(this.rX(x), this.rY(y + 1), this.rS(1), this.rS(1));
            }
        } else if (this.debug === 1) {

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

            const light = this.game.getLight(r.xAbsolute, r.yAbsolute);
            if (light) {
                this.ctx.fillText(`v:${light}`, this.rX(x) + this.rS(0.01), this.rY(y) - 8);
            }
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
        return Math.ceil(v * this.zoom);
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

        this.game.meta.screenWidth = blocksCountX * 2;
        this.game.meta.screenHeight = blocksCountY * 2;

        for (let yi = -blocksCountY; yi <= blocksCountY; yi++) {
            for (let xi = -blocksCountX; xi <= blocksCountX; xi++) {
                this.drawBlock(Math.floor(player.x) + xi, Math.floor(player.y) + yi);
            }
        }

        // player
        if (this.game.mode !== "demo") {
            if (this.debug > 0) {
                ctx.fillStyle = "rgba(60,187,167,0.44)";
                ctx.fillRect(this.rX(player.x - player.width / 2), this.rY(player.y + player.height), this.rS(player.width), this.rS(player.height));
            }
            this.drawPlayer(diff, timestamp);
        }

        if (this.debug === 2) {
            ctx.fillStyle = "#000";
            ctx.font = '10px monospace';
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

    }

    drawPlayer(diff, timestamp) {
        const ctx = this.ctx;
        const player = this.game.player;
        const headSize = 0.22 * player.height;
        const chestWidth = 0.25 * player.height;
        const chestHeight = 0.45 * player.height;
        const armWidth = 0.14 * player.height;
        const armHeight = 0.8 * chestHeight;
        const legWidth = 0.14 * player.height;
        const legHeight = player.height - headSize - chestHeight;

        const textures = {
            head: Settings.textures.player.head,
            chest: [{
                type: "fillRect",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 0, saturation: 0, luminosity: 50, alpha: 100
            }, {
                type: "fillPixel",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 0, saturation: 0, luminosity: 53, alpha: 100,
                luminosityMax: 57,
                chance: 40
            }],
            leg1: [{
                type: "fillRect",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 0, saturation: 0, luminosity: 45, alpha: 100
            }, {
                type: "fillPixel",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 0, saturation: 0, luminosity: 23, alpha: 20,
                luminosityMax: 27, alphaMax: 60,
                chance: 40,
                width: 1, widthMax: 2,
                height: 1, heightMax: 2
            }],
            leg2: [{
                type: "fillRect",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 0, saturation: 0, luminosity: 20, alpha: 100
            }, {
                type: "fillPixel",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 0, saturation: 0, luminosity: 13, alpha: 100,
                luminosityMax: 27,
                chance: 40
            }],
            arm1: [{
                type: "fillRect",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 48, saturation: 69, luminosity: 61, alpha: 100
            }, {
                type: "fillPixel",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 48, saturation: 69, luminosity: 56, alpha: 60,
                luminosityMax: 66, alphaMax: 100,
                chance: 40
            }],
            arm2: [{
                type: "fillRect",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 216, saturation: 100, luminosity: 48, alpha: 100
            }, {
                type: "fillPixel",
                x0: 0, y0: 0,
                x1: 16, y1: 16,
                hue: 216, saturation: 100, luminosity: 53, alpha: 50,
                luminosityMax: 57,
                chance: 30
            }],
        };

        const draw = (id, x, y, w, h) => {
            Textures.draw(ctx, id, x, y, w, h);
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.stroke();
        };

        const armAngle = (offset) => {
            if (player.velocityX === 0) {
                player.animation.armTime = timestamp;
                return 0;
            } else if (player.animation.side === "right") {
                return -0.1 * Math.PI + 0.2 * Math.PI * Math.sin(offset + -1.2 * Math.PI + (timestamp - player.animation.armTime) / 200);
            } else if (player.animation.side === "left") {
                return 0.1 * Math.PI + 0.2 * Math.PI * Math.sin(offset + -0.2 * Math.PI + (timestamp - player.animation.armTime) / 200);
            }
        }

        Object.keys(textures).forEach(key => {
            Textures.load("player." + key + ".r", 1, 16, 16, textures[key]);
            Textures.load("player." + key + ".l", 1, 16, 16, [{type: "flipX"}, textures[key]].flat());
        });

        player.animation.legTime = player.animation.legTime || 0;
        player.animation.legAngle = player.animation.legAngle || 0;
        player.animation.armTime = player.animation.armTime || 0;
        player.animation.armAngle = player.animation.armAngle || 0;
        player.animation.side = Mouse.x > this.rX(player.x) ? "right" : "left";

        const suffix = player.animation.side === "right" ? ".r" : ".l";

        if (player.velocityX === 0) {
            player.animation.legTime = timestamp;
        }
        player.animation.legAngle = 0.2 * Math.PI * Math.sin((timestamp - player.animation.legTime) / 200);

        // player.animation.armAngle = armAngle(0);

        ctx.save();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000";

        // arm1
        ctx.save();
        ctx.translate(this.rX(player.x), this.rY(player.y + player.height - headSize - 0.2));
        ctx.rotate(armAngle(0));
        draw("player.arm1" + suffix, this.rS(-armWidth / 2), this.rS(-0.1), this.rS(armWidth), this.rS(armHeight));
        ctx.restore();

        // leg1
        ctx.save();
        ctx.translate(this.rX(player.x), this.rY(player.y + legHeight));
        ctx.rotate(player.animation.legAngle);
        draw("player.leg1" + suffix, this.rS(-legWidth / 2), 0, this.rS(legWidth), this.rS(legHeight));
        ctx.restore();

        // chest
        draw("player.chest" + suffix, this.rX(player.x - chestWidth / 2), this.rY(player.y + player.height - headSize), this.rS(chestWidth), this.rS(chestHeight));

        // arm2
        ctx.save();
        ctx.translate(this.rX(player.x), this.rY(player.y + player.height - headSize - 0.2));
        ctx.rotate(armAngle(Math.PI));
        draw("player.arm2" + suffix, this.rS(-armWidth / 2), this.rS(-0.1), this.rS(armWidth), this.rS(armHeight));
        ctx.restore();

        // leg2
        ctx.save();
        ctx.translate(this.rX(player.x), this.rY(player.y + legHeight));
        ctx.rotate(-player.animation.legAngle);
        draw("player.leg2" + suffix, this.rS(-legWidth / 2), 0, this.rS(legWidth), this.rS(legHeight));
        ctx.restore();

        // head
        let headAngle = Math.atan2(this.rY(player.y + player.height - headSize / 2) - Mouse.y, Math.abs(this.rX(player.x) - Mouse.x));
        headAngle = Math.max(-0.35, Math.min(0.35, Math.sign(this.rX(player.x) - Mouse.x) * headAngle));

        ctx.save();
        ctx.translate(this.rX(player.x), this.rY(player.y + player.height - headSize / 2));
        ctx.rotate(headAngle);
        draw("player.head" + suffix, this.rS(-headSize / 2), -this.rS(headSize / 2), this.rS(headSize), this.rS(headSize));
        ctx.restore();

        // draw("player.head", this.rX(player.x - headSize / 2), this.rY(player.y + player.height), this.rS(headSize), this.rS(headSize));

        ctx.restore();
    }
}

export {Graphics}
