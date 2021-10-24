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
    creative: "creative",
    survival: "survival"
}

class Game {

    mode = Mode.survival;

    constructor(seed) {
        this.generator = new Generator(seed);
        this.spawn = this.selectSpawnPoint();
        this.meta = {};
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

        // console.log(`Around feet x0:${x0} x1:${x1} head y0:${y0} y1:${y1}`);

        for (let xi = x0; xi < x1 + 1; xi++) {
            const x = Math.min(xi, x0 + entity.width);
            for (let yi = y0; yi < y1 + 1; yi++) {
                const y = Math.min(yi, y0 + entity.height);
                const b = this.getBlockAbsolute(x, y);

                // console.log(`Check ${x.toFixed(2)},${y.toFixed(2)} chunk ${b.x} ${b.y} block ${b.blockId}`);

                if (b.blockId !== Settings.blocks.none.id) {
                    return false;
                }
            }
        }

        return true;
    }

    move(entity, deltaX, deltaY) {
        const stepX = Math.sign(deltaX) * Settings.movement.step;
        const stepY = Math.sign(deltaY) * Settings.movement.step;

        let stepsX = Math.ceil(Math.abs(deltaX / Settings.movement.step));
        let stepsY = Math.ceil(Math.abs(deltaY / Settings.movement.step));

        for (let sX = 0; sX < stepsX; sX++) {
            this.moveIfPossible(entity, stepX, 0);
        }
        for (let sY = 0; sY < stepsY; sY++) {
            this.moveIfPossible(entity, 0, stepY);
        }
    }

    moveIfPossible(entity, deltaX, deltaY) {
        if (this.isSpaceAroundEdge(entity, deltaX, deltaY)) {
            entity.x += deltaX;
            entity.y += deltaY;
        }
    }

    update(timestamp, diff) {
        if (this.mode === Mode.spectator) {
            this.moveSpectator(timestamp, diff);
        } else if (this.mode === Mode.creative) {
            this.moveCreative(timestamp, diff);
        } else if (this.mode === Mode.survival) {
            this.moveSurvival(timestamp, diff);
        }
    }

    changeMode(mode) {
        if (mode) {
            this.mode = mode;
        } else {
            const values = Object.values(Mode);
            this.mode = values[(values.indexOf(this.mode) + 1) % values.length];
        }
    }

    getVelocity(positiveBind, negativeBind) {
        let result = 0;

        if (Keyboard.has(positiveBind)) {
            result = 1;
        } else if (Keyboard.has(negativeBind)) {
            result = -1;
        }

        if (Keyboard.has(Keyboard.bindings.run) && Keyboard.has(Keyboard.bindings.jump)) {
            result *= Settings.movement.runJumpSpeed;
        } else if (Keyboard.has(Keyboard.bindings.run)) {
            result *= Settings.movement.runSpeed;
        } else if (Keyboard.has(Keyboard.bindings.sneak)) {
            result *= Settings.movement.sneakSpeed;
        } else {
            result *= Settings.movement.walkSpeed;
        }

        return result;
    }

    changeVelocity(diff, v0, factor, positiveBind, negativeBind) {
        const v1 = this.getVelocity(positiveBind, negativeBind);

        if (v1 > v0) { // increase
            // console.log(`Increase v0=${v0} v1=${v1}`);
            return Math.min(v0 + factor * diff, v1);
        } else if (v1 < v0) { //decrease
            // console.log(`Decrease v0=${v0} v1=${v1}`);
            return Math.max(v0 - factor * diff, v1);
        } else {
            return v0;
        }
    }

    moveCreative(timestamp, diff) {
        const t = diff / 1000; // in seconds
        const g = (this.player.g === undefined) ? Settings.movement.gravity : this.player.g;

        const factor = this.player.velocityY === 0 ? Settings.movement.accelerationGround : Settings.movement.accelerationAir;
        this.player.velocityX = this.changeVelocity(diff, this.player.velocityX, factor, Keyboard.bindings.moveRight, Keyboard.bindings.moveLeft);

        if (g === 0) {
            this.player.velocityY = this.getVelocity(Keyboard.bindings.moveUp, Keyboard.bindings.moveDown);
        } else {
            if (Keyboard.has(Keyboard.bindings.jump) && this.player.velocityY === 0) {
                this.player.velocityY = Settings.movement.jumpSpeed;
            } else if (this.player.velocityY > Settings.movement.step && !this.isSpaceAroundEdge(this.player, 0, +Settings.movement.step)) {
                console.log("Head bang");
                this.player.velocityY = Settings.movement.step;
            } else if (this.isSpaceAroundEdge(this.player, 0, -Settings.movement.step)) {
                console.log("Gravity");
                this.player.velocityY = this.player.velocityY - g * t;
            } else {
                this.player.velocityY = 0;
            }
        }

        this.player.lastJump = this.player.lastJump || 0;
        if (Keyboard.had(Keyboard.bindings.jump)) {
            console.log(`Jump ${timestamp} last ${this.player.lastJump}`);
            if ((timestamp - this.player.lastJump) < 200) { // second jump within 500ms
                console.log(`Gravity switch`);
                this.player.g = (g === 0 ? Settings.movement.gravity : 0);
            }
            this.player.lastJump = timestamp;
        }

        if (this.player.velocityX || this.player.velocityY) {
            this.move(this.player, t * this.player.velocityX, t * this.player.velocityY)
        }
    }

    moveSpectator(timestamp, diff) {
        const t = diff / 1000; // in seconds

        this.player.velocityX = 2 * this.getVelocity(Keyboard.bindings.moveRight, Keyboard.bindings.moveLeft);
        this.player.velocityY = 2 * this.getVelocity(Keyboard.bindings.moveUp, Keyboard.bindings.moveDown);

        if (this.player.velocityX || this.player.velocityY) {
            this.player.x += t * this.player.velocityX;
            this.player.y += t * this.player.velocityY;
        }
    }

    moveSurvival(timestamp, diff) {
        const t = diff / 1000; // in seconds
        const g = Settings.movement.gravity;

        const factor = this.player.velocityY === 0 ? Settings.movement.accelerationGround : Settings.movement.accelerationAir;
        this.player.velocityX = this.changeVelocity(diff, this.player.velocityX, factor, Keyboard.bindings.moveRight, Keyboard.bindings.moveLeft);

        if (Keyboard.has(Keyboard.bindings.jump) && this.player.velocityY === 0) {
            this.player.velocityY = Settings.movement.jumpSpeed;
        } else if (this.player.velocityY > Settings.movement.step && !this.isSpaceAroundEdge(this.player, 0, +Settings.movement.step)) {
            console.log("Head bang");
            this.player.velocityY = Settings.movement.step;
        } else if (this.isSpaceAroundEdge(this.player, 0, -Settings.movement.step)) {
            console.log("Gravity");
            this.player.velocityY = this.player.velocityY - g * t;
        } else {
            this.player.velocityY = 0;
        }

        if (this.player.velocityX || this.player.velocityY) {
            this.move(this.player, t * this.player.velocityX, t * this.player.velocityY)
        }
    }

    getBlockAbsolute(x, y) {
        const position = this.resolve(x, y);
        //console.log(`Pos(${x},${y}) = (${position.x},${position.y}) chunk ${position.chunkId} block ${position.blockId}`);
        const chunk = this.generator.getChunk(position.chunkId);
        position.blockId = chunk.blocks[position.y][position.x];
        position.block = Settings.blocks[position.blockId];
        position.biomeName = chunk.biomesNames[position.x];
        return position;
    }

    resolve(x, y) {
        return {
            chunkId: Math.floor(x / Settings.chunk.width),
            x: Math.floor(x % Settings.chunk.width),
            y: Math.floor(Math.max(0, Math.min(y, Settings.chunk.height - 1)))
        }
    }
}

export {Game}
