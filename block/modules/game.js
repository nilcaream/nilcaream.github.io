import {Settings} from "./settings.js";
import {Generator} from "./generator.js";
import {Random} from "./random.js";
import {Keyboard} from "./keyboard.js";

class Entity {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.chunkId = 0;
        this.chunkX = 0;
        this.chunkY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.targetVelocityX = 0;
        this.targetVelocityY = 0;
        this.width = 1.5;
        this.height = 1.5;
    }
}

const Mode = {
    spectator: "spectator",
    creative: "creative"
}

class Game {

    mode = Mode.spectator;

    constructor(seed) {
        this.generator = new Generator(seed);
        this.spawn = this.selectSpawnPoint();
        Keyboard.init();
    }

    setPlayer(name) {
        this.player = new Entity(name, Settings.entities.player.id);
        this.player.x = this.spawn.x;
        this.player.y = this.spawn.y + 2;
        this.player.chunkId = this.spawn.chunkId;
        this.player.x = 333;
        this.player.y = 64;
    }

    getRng(id) {
        return Random(this.generator.seed, id);
    }

    selectSpawnPoint() {
        const rng = this.getRng(100);
        for (let i = 0; i < 4; i++) {
            const chunk = this.generator.getChunk(i);
            for (let number = 0; number < chunk.biomes.length; number++) {
                const biome = chunk.biomes[number];

                for (let j = 0; j < (biome.end - biome.start) / 2; j++) {
                    const x = rng(biome.start, biome.end);
                    let y = Settings.chunk.height - 1;
                    while (y > 0 && chunk.blocks[y][x] === Settings.blocks.none.id) {
                        y--;
                    }
                    const blockId = chunk.blocks[y][x];
                    if (blockId !== Settings.blocks.water1.id) { // TODO add other water / lava blocks
                        y++;
                        console.log(`Spawn point seed ${this.generator.seed} chunk ${i} biome ${number} ${biome.name} block ${blockId}: ${x} ${y}`);
                        return {
                            x: x,
                            y: y,
                            chunkId: chunk.id
                        }
                    }
                }
            }
        }
    }

    collides(x, w, dx, y, h, dy) {
        const x0 = x + dx;
        const x1 = x0 + w;
        const y1 = y + dy;
        const y0 = y1 - h;

        const x0y0 = this.getBlock(0, Math.floor(x0), Math.ceil(y0));
        const x1y0 = this.getBlock(0, Math.floor(x1), Math.ceil(y0));
        const x0y1 = this.getBlock(0, Math.floor(x0), Math.ceil(y1));
        const x1y1 = this.getBlock(0, Math.floor(x1), Math.ceil(y1));

        // console.log(`x0y0:${x0y0} x1y0:${x1y0} x0y1:${x0y1} x1y1:${x1y1}`);

        return {
            x0: x0,
            x1: x1,
            y0: y0,
            y1: y1,
            x0y0: x0y0,
            x1y0: x1y0,
            x0y1: x0y1,
            x1y1: x1y1,
        };
    }

    update(timestamp, diff) {
        const multiplier = Keyboard.has(Keyboard.bindings.sneak) ? 0.1 : Keyboard.has(Keyboard.bindings.run) ? 5 : 1;
        let deltaX = (diff * multiplier) * (Keyboard.has(Keyboard.bindings.moveRight) - Keyboard.has(Keyboard.bindings.moveLeft)) / 64;
        let deltaY = (diff * multiplier) * (Keyboard.has(Keyboard.bindings.moveUp) - Keyboard.has(Keyboard.bindings.moveDown)) / 64;

        if (deltaX !== 0 || deltaY !== 0) {
            //this.move(this.player, deltaX, deltaY);
            this.player.x += deltaX;
            this.player.y += deltaY;
        }

        const x = this.player.x;
        const y = this.player.y;
        const w = this.player.width;
        const h = this.player.height;
        console.log(`P:${x.toFixed(2)}-${(x + w).toFixed(2)},${y.toFixed(2)}-${(y - h).toFixed(2)}`);

    }

    allowed1(x, w, dx, y, h, dy) {
        const none = Settings.blocks.none.id;
        const c = this.collides(x, w, dx, y, h, dy)
        return c.x0y0 === none && c.x1y0 === none && c.x0y1 === none && c.x1y1 === none;
    }

    allowed(x, w, dx, y, h, dy) {

        console.log(`Allowed ${x}+${dx} w:${w} ${y}+${dy} h:${h}`);

        const none = Settings.blocks.none.id;

        for (let xi = x; xi <= x + Math.ceil(w); xi++) {
            for (let yi = y; yi >= y - Math.ceil(h); yi--) {
                const xx = Math.min(xi, x + w) + dx;
                const yy = Math.min(yi, y + h) + dy;
                const xxxxx = Math.floor(xx);
                const yyyyy = Math.ceil(yy);
                const block = this.getBlock(0, xxxxx, yyyyy);
                console.log(`Check ${xxxxx} ${yyyyy} ${block}`);
                if (block !== none) {
                    return false;
                }
            }
        }

        // for (let xi = x; xi <= x + w; xi += w / 4) {
        //     for (let yi = y - h; yi <= y; yi += h / 4) {
        //         const block = this.getBlock(0, Math.floor(xi + dx), Math.ceil(yi + dy));
        //         console.log(`Check ${xi + dx} ${yi + dy} ${block}`);
        //         if (block !== none) {
        //             return false;
        //         }
        //     }
        // }
        return true;
    }

    move(entity, deltaX, deltaY) {
        console.log(`Move ${deltaX} ${deltaY}`);
        const step = 0.05;

        let n = Math.ceil(Math.abs(deltaX) / step);
        for (let i = 0; i < n; i++) {
            if (this.allowed(entity.x, entity.width, deltaX / n, entity.y, entity.height, 0)) {
                entity.x += deltaX / n;
            } else {
                break;
            }
        }

        n = Math.ceil(Math.abs(deltaY) / step);
        for (let i = 0; i < n; i++) {
            if (this.allowed(entity.x, entity.width, 0, entity.y, entity.height, deltaY / n)) {
                entity.y += deltaY / n;
            } else {
                break;
            }
        }
    }

    update2(timestamp, diff) {
        const t = diff / 1000;
        const g = 8;
        const e = 0.001;

        const multiplier = Keyboard.has(Keyboard.bindings.sneak) ? 0.1 : Keyboard.has(Keyboard.bindings.run) ? 5 : 1;
        let deltaX = (diff * multiplier) * (Keyboard.has(Keyboard.bindings.moveRight) - Keyboard.has(Keyboard.bindings.moveLeft)) / 64;
        let deltaY = (diff * multiplier) * (Keyboard.has(Keyboard.bindings.moveUp) - Keyboard.has(Keyboard.bindings.moveDown)) / 64;

        // collisions
        const none = Settings.blocks.none.id;

        if (Math.abs(deltaX) > e) {
            const c = this.collides(this.player.x, this.player.width, deltaX, this.player.y, this.player.height, 0);
            if (deltaX > 0 && (c.x1y0 !== none || c.x1y1 !== none)) { // right
                this.player.x = Math.ceil(this.player.x + this.player.width) - this.player.width - e;
            } else if (deltaX < 0 && (c.x0y0 !== none || c.x0y1 !== none)) { // left
                this.player.x = Math.floor(this.player.x) + e;
            } else {
                this.player.x += deltaX;
            }
        }

        if (Math.abs(deltaY) > e) {
            const c = this.collides(this.player.x, this.player.width, 0, this.player.y, this.player.height, deltaY);
            if (deltaY > 0 && (c.x0y1 !== none || c.x1y1 !== none)) { // up
                this.player.y = Math.ceil(this.player.y) - e;
            } else if (deltaY < 0 && (c.x0y0 !== none || c.x1y0 !== none)) { // down
                this.player.y = Math.floor(this.player.y - this.player.height) + this.player.height + e;
            } else {
                this.player.y += deltaY;
            }
        }
    }

    update1(timestamp, diff) {
        this.player.chunkId = Math.floor(this.player.x / Settings.chunk.width);
        this.player.chunkX = this.player.x - this.player.chunkId * Settings.chunk.width;
        this.player.chunkY = this.player.y;

        if (this.mode === Mode.spectator) {
            const multiplier = Keyboard.has("Shift") ? 0.1 : Keyboard.has("Control") ? 5 : 1;
            this.player.x += (diff * multiplier) * (Keyboard.has("KeyD") - Keyboard.has("KeyA")) / 64;
            this.player.y -= (diff * multiplier) * (Keyboard.has("KeyS") - Keyboard.has("KeyW")) / 64;
        } else if (this.mode === Mode.creative) {
            // if (Keyboard.has("KeyD")) {
            //     this.player.targetVelocityX = 16;
            // } else if (Keyboard.has("KeyA")) {
            //     this.player.targetVelocityX = -16;
            // } else {
            //     this.player.targetVelocityX = 0;
            // }
            //
            // if (this.player.targetVelocityX > 0) {
            //     this.player.velocityX = Math.min(this.player.velocityX + diff / 32, this.player.targetVelocityX);
            // } else if (this.player.targetVelocityX < 0) {
            //     this.player.velocityX = Math.max(this.player.velocityX - diff / 32, this.player.targetVelocityX);
            // } else if (this.player.targetVelocityX === 0 && this.player.velocityX !== 0) {
            //     const sign = Math.sign(this.player.velocityX);
            //     this.player.velocityX = this.player.velocityX - sign * diff / 8;
            //     if (Math.sign(this.player.velocityX) !== sign) {
            //         this.player.velocityX = 0;
            //     }
            // }

            // -----------------------

            const t = diff / 1000;
            const g = 8;

            if (Keyboard.has(Keyboard.bindings.moveRight)) {
                this.player.velocityX = 5;
            } else if (Keyboard.has(Keyboard.bindings.moveLeft)) {
                this.player.velocityX = -5;
            } else {
                this.player.velocityX = 0;
            }

            if (Keyboard.has(Keyboard.bindings.jump) && this.player.velocityY === 0) {
                console.log("Space");
                this.player.velocityY = 5;
            }

            const chunkX = Math.floor(this.player.chunkX);
            const chunkY = Math.floor(this.player.chunkY);

            if (this.getBlock(this.player.chunkId, chunkX, chunkY) === Settings.blocks.none.id) {
                console.log("gravity");
                this.player.velocityY = this.player.velocityY - g * t;
            }
            // } else {
            //     this.player.velocityY = 0;
            // }

            this.player.x += t * this.player.velocityX;
            this.player.y += t * this.player.velocityY;

            this.player.y = Math.max(0, Math.min(Settings.chunk.height, this.player.y));

        }

        this.player.chunkId = Math.floor(this.player.x / Settings.chunk.width);
        this.player.chunkX = this.player.x - this.player.chunkId * Settings.chunk.width;
        this.player.chunkY = this.player.y;

        const block = this.getBlock(this.player.chunkId, Math.floor(this.player.chunkX), Math.floor(this.player.chunkY));

        if (block !== Settings.blocks.none.id && this.player.velocityY !== 0) {
            this.player.y = Math.ceil(this.player.y);
            this.player.chunkY = this.player.y;
            this.player.velocityY = 0;
            console.log(`Stop Y`);
        }

        if (block !== Settings.blocks.none.id && this.player.velocityX > 0) {
            this.player.x = Math.ceil(this.player.x);
            this.player.chunkX = this.player.x - this.player.chunkId * Settings.chunk.width;
            this.player.velocityX = 0;
            console.log(`Stop X positive`);
        }

        if (block !== Settings.blocks.none.id && this.player.velocityX < 0) {
            this.player.x = Math.floor(this.player.x);
            this.player.chunkX = this.player.x - this.player.chunkId * Settings.chunk.width;
            this.player.velocityX = 0;
            console.log(`Stop X positive`);
        }

        console.log(`Player ${this.player.name} chunk ${this.player.chunkId}: ${this.player.chunkX} ${this.player.chunkY} block ${block}`);
    }

    collisions(chunkId, x, y, deltaX, deltaY) {
        const isEmpty = (x, y) => this.getBlock(chunkId, x, y) === Settings.blocks.none.id;
        this.getBlock(chunkId,)
    }

    getBlock(chunkId, x, y) {
        if (y > Settings.chunk.width || y < 0) {
            let _chunkId = Math.floor(y / Settings.chunk.width);
            let _y = y - _chunkId * Settings.chunk.width;
            console.log(`Chunk ${chunkId} y out of range: ${y}`);
            return this.generator.getChunk(chunkId + _chunkId).blocks[_y][x];
        } else {
            return this.generator.getChunk(chunkId).blocks[y][x];
        }
    }

    getBlockAbsolute(x, y) {
        let _chunkId = Math.floor(x / Settings.chunk.width);
        let _x = x % Settings.chunk.width;
        let _y = Math.max(0, Math.min(y, Settings.chunk.height));

        return this.generator.getChunk(_chunkId).blocks[Math.floor(y)][Math.floor(x)];
    }
}

export {Game}
