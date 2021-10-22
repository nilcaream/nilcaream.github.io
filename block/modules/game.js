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
    }
}

const Mode = {
    spectator: "spectator",
    creative: "creative"
}

class Game {

    mode = Mode.creative;

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
        // this.player.x = 10;
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

    update(timestamp, diff) {
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

            if (Keyboard.has("KeyD")) {
                this.player.velocityX = 5;
            } else if (Keyboard.has("KeyA")) {
                this.player.velocityX = -5;
            } else {
                this.player.velocityX = 0;
            }

            if (Keyboard.has("Space") && this.player.velocityY === 0) {
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

    getBlock(chunkId, x, y) {
        return this.generator.getChunk(chunkId).blocks[y][x];
    }
}

export {Game}
