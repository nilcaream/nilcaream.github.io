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
        this.width = 0.8;
        this.height = 1.8;
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
        this.player.x = 333.5;
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

    isSpaceAround(entity) {
        const x0 = entity.x - entity.width / 2;
        const x1 = entity.x + entity.width / 2;
        const y0 = entity.y;
        const y1 = entity.y + entity.height;

        // console.log(`Around feet x0:${x0} x1:${x1} head y0:${y0} y1:${y1}`);

        for (let xi = x0; xi < x1 + 1; xi++) {
            const x = Math.min(xi, x0 + entity.width);
            for (let yi = y0; yi < y1 + 1; yi++) {
                const y = Math.min(yi, y0 + entity.height);
                const b = this.getBlockAbsolute(x, y);
                //console.log(`Check ${x.toFixed(2)},${y.toFixed(2)} chunk ${b.x} ${b.y} block ${b.blockId}`);
                if (b.blockId !== Settings.blocks.none.id) {
                    return false;
                }
            }
        }

        return true;
    }

    isSpaceAroundEdge(entity, deltaX, deltaY) {
        let x0 = entity.x - entity.width / 2 + deltaX;
        let x1 = entity.x + entity.width / 2 + deltaX;
        let y0 = entity.y + deltaY;
        let y1 = entity.y + entity.height + deltaY;


        if (deltaX > 0 && deltaY === 0) { // right edge
            x0 = x1;
        } else if (deltaX < 0 && deltaY === 0) { // left edge
            x1 = x0;
        }

        if (deltaY > 0 && deltaX === 0) { // top edge
            y0 = y1;
        } else if (deltaY < 0 && deltaX === 0) { // bottom edge
            y1 = y0;
        }

        //console.log(`Around feet x0:${x0} x1:${x1} head y0:${y0} y1:${y1}`);

        for (let xi = x0; xi < x1 + 1; xi++) {
            const x = Math.min(xi, x0 + entity.width);
            for (let yi = y0; yi < y1 + 1; yi++) {
                const y = Math.min(yi, y0 + entity.height);
                const b = this.getBlockAbsolute(x, y);

                //console.log(`Check ${x.toFixed(2)},${y.toFixed(2)} chunk ${b.x} ${b.y} block ${b.blockId}`);

                if (b.blockId !== Settings.blocks.none.id) {
                    return false;
                }
            }
        }

        return true;
    }

    move(entity, deltaX, deltaY) {
        let stepsX = Math.abs(deltaX / 0.02);
        let stepsY = Math.abs(deltaY / 0.02);

        for (let sX = 0; sX < stepsX; sX++) {
            this.moveIfPossible(entity, deltaX / stepsX, 0);
        }
        for (let sY = 0; sY < stepsY; sY++) {
            this.moveIfPossible(entity, 0, deltaY / stepsY);
        }
    }

    moveIfPossible(entity, deltaX, deltaY) {
        if (this.isSpaceAroundEdge(entity, deltaX, deltaY)) {
            entity.x += deltaX;
            entity.y += deltaY;
        }
    }

    update(timestamp, diff) {
        const multiplier = Keyboard.has(Keyboard.bindings.sneak) ? 0.03 : Keyboard.has(Keyboard.bindings.run) ? 5 : 1;
        let deltaX = (diff * multiplier) * (Keyboard.has(Keyboard.bindings.moveRight) - Keyboard.has(Keyboard.bindings.moveLeft)) / 64;
        let deltaY = (diff * multiplier) * (Keyboard.has(Keyboard.bindings.moveUp) - Keyboard.has(Keyboard.bindings.moveDown)) / 64;

        if (deltaX !== 0 || deltaY !== 0) {
            //this.move(this.player, deltaX, deltaY);
            // this.player.x += deltaX;
            // this.player.y += deltaY;
            this.move(this.player, deltaX, deltaY);
        }

        this.isSpaceAround(this.player);

        // const x = this.player.x;
        // const y = this.player.y;
        // const w = this.player.width;
        // const h = this.player.height;
        // console.log(`P:${x.toFixed(2)}-${(x + w).toFixed(2)},${y.toFixed(2)}-${(y - h).toFixed(2)}`);

    }

    getBlockAbsolute(x, y) {
        const position = this.resolve(x, y);
        position.blockId = this.generator.getChunk(position.chunkId).blocks[position.y][position.x];
        position.block = Settings.blocks[position.blockId];
        // console.log(`Pos(${x},${y}) = (${position.x},${position.y}) chunk ${position.chunkId} block ${position.blockId}`);
        return position;
    }

    resolve(x, y) {
        return {
            chunkId: Math.floor(x / Settings.chunk.width),
            x: Math.floor(x % Settings.chunk.width),
            y: Math.floor(Math.max(0, Math.min(y, Settings.chunk.height)))
        }
    }
}

export {Game}
