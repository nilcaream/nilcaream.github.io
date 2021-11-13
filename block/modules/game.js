import {Settings} from "./settings.js";
import {Generator} from "./generator.js";
import {Random} from "./random.js";
import {Keyboard} from "./keyboard.js";
import {Mouse} from "./mouse.js";

class Entity {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.x = 0;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.widthStand = 0.8;
        this.heightStand = 1.8;
        this.widthCrouch = 1.6;
        this.heightCrouch = 0.8;
        this.maxHealth = 20;
        this.health = 20;
        this.hurtEverySecond = {};
        this.animation = {};

        this.setCrouch(false);
    }

    setCrouch(crouch) {
        this.crouch = crouch;
        if (crouch) {
            this.width = this.widthCrouch;
            this.height = this.heightCrouch;
        } else {
            this.width = this.widthStand;
            this.height = this.heightStand;
        }
    }
}

const Mode = {
    spectator: "spectator",
    creative: "creative",
    survival: "survival",
    demo: "demo",
}

class Game {

    mode = Mode.survival;

    constructor(seed) {
        this.generator = new Generator(seed);
        this.spawn = this.selectSpawnPoint();
        this.meta = {
            light: {}
        };
        this.time = 0;
        this.lights = {};
        Keyboard.init();
    }

    setPlayer(name) {
        this.player = new Entity(name, Settings.entities.player.id);
        this.player.x = this.spawn.x;
        this.player.y = this.spawn.y;
        this.player.lastJump = 0;
        // this.player.x = 333.5;
        // this.player.y = 64;
        this.player.selected = {};

        // this.player.x = 298;
        // this.player.y = 65;
        // this.player.y = 2.2;
    }

    start(hour) {
        this.setHour(hour);
    }

    // real time in seconds
    getRealTime() {
        return Math.floor(this.time / 1000);
    }

    // game time in minutes
    getGameTime() {
        return this.time / 1200;
    }

    setHour(hour = 0) {
        // TODO add up to full hour instead of time override
        this.time = 1000 * 60 * 60 * 12 * (hour / 24);
    }

    getGameClock() {
        const gameTime = Math.floor(this.getGameTime());
        let minutes = gameTime % 60;
        let hours = ((gameTime - minutes) / 60) % 24;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        hours = hours < 10 ? "0" + hours : hours;
        return `${hours}:${minutes}`;
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
                    while (y > 0 && chunk.blocks[y][x].blockId === Settings.blocks.none.id) {
                        y--;
                    }
                    const blockId = chunk.blocks[y][x].blockId;
                    if (blockId !== Settings.blocks.water1.id) { // TODO add other water / lava blocks
                        y++;
                        console.log(`Spawn point seed ${this.generator.seed} chunk ${i} biome ${number} ${biome.name} block ${Settings.blocks[blockId].name}: ${x} ${y}`);
                        return {
                            x: x + chunk.id * Settings.chunk.width,
                            y: y
                        }
                    }
                }
            }
        }
    }

    isSpaceAroundEdge(entity, deltaX, deltaY, width = entity.width, height = entity.height) {
        let x0 = entity.x - width / 2 + deltaX;
        let x1 = entity.x + width / 2 + deltaX;
        let y0 = entity.y + deltaY;
        let y1 = entity.y + height + deltaY;

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
            const x = Math.min(xi, x0 + width);
            for (let yi = y0; yi < y1 + 1; yi++) {
                const y = Math.min(yi, y0 + height);
                const b = this.getBlockAbsolute(x, y);

                // console.log(`Check ${x.toFixed(2)},${y.toFixed(2)} chunk ${b.x} ${b.y} block ${b.blockId}`);

                if (b.blockId > Settings.blocks.none.id) {
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
            if (Keyboard.has(Keyboard.bindings.sneak) && this.isSpaceAroundEdge(entity, 2 * stepX, -Settings.movement.step) && entity.velocityY === 0) {
                console.log(`Prevented fall by sneaking`);
            } else {
                this.moveIfPossible(entity, stepX, 0);
            }
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

    update(timestamp, diff, mouseX, mouseY) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.time += diff;
        if (this.mode === Mode.spectator) {
            this.moveSpectator(timestamp, diff);
        } else if (this.mode === Mode.creative) {
            this.moveCreative(timestamp, diff);
        } else if (this.mode === Mode.survival && this.player.health > 0) {
            this.moveSurvival(timestamp, diff);
            this.selectBlockAt(mouseX, mouseY);
            this.actOnSelectedBlock();
            // this.updateLights();
        }
    }

    updateLights() { // TODO implement in the future
        if (this.meta.light.x !== undefined && this.meta.screenWidth !== undefined) {
            this.lights = {};

            const x0 = (this.meta.light.x - 0.5) * this.meta.screenWidth + this.player.x;
            const y0 = this.meta.light.y * (this.meta.screenHeight / 2) + this.player.y;

            //console.log(`Sun ${x0.toFixed(2)} ${y0.toFixed(2)}`);
            for (let a = 0; a < Math.PI; a += Math.PI / 256) {
                for (let r = 0.9; r < 80; r += 0.9) {
                    const x1 = x0 + r * Math.cos(a);
                    const y1 = y0 - r * Math.sin(a);

                    const block = this.getBlockAbsolute(x1, y1);
                    const top = this.getBlockAbsolute(block.xAbsolute, block.yAbsolute + 1);
                    const adjacent = this.getBlockAbsolute(block.xAbsolute + (a < Math.PI / 2 ? -1 : 1), block.yAbsolute);
                    const blocked = top.blockId > Settings.blocks.any.id && adjacent.blockId > Settings.blocks.any.id;
                    const light = blocked ? 0 : this.meta.light.v;

                    if (this.lights[block.yAbsolute] === undefined) {
                        this.lights[block.yAbsolute] = {};
                    }

                    this.lights[block.yAbsolute][block.xAbsolute] = light;

                    if (block.blockId > Settings.blocks.any.id) {
                        break;
                    }
                }
            }
        }
    }

    getLight(x, y) {
        return (this.lights[y] || {})[x] || 0;
    }

    actOnSelectedBlock() {
        if (this.player.selected.present) {
            if (Mouse.had(Mouse.bindings.attack)) {
                this.removeBlock(this.player.selected.block);
                this.makeVisible();
            } else if (Mouse.had(Mouse.bindings.place)) {
                const block = this.player.adjacent.block;
                if (this.doesIntersect(
                    this.player.x - this.player.width / 2, this.player.y,
                    this.player.x + this.player.width / 2, this.player.y + 1,
                    block.xAbsolute, block.yAbsolute,
                    block.xAbsolute + 1, block.yAbsolute + 1)) {
                    console.log(`Cannot place block`);
                } else {
                    block.blockId = Settings.blocks.dirt.id;
                    this.addBlock(block);
                }
            }
        }
    }

    isWithinBounds(x, y, x0, y0, x1, y1) {
        return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    }

    // e1 - rectangular entity 1 with coordinates x0y0,x1y1 (x1>x0, y1>x1)
    // e2 - rectangular entity 2 with coordinates x0y0,x1y1 (x1>x0, y1>x1)
    doesIntersect(e1x0, e1y0, e1x1, e1y1, e2x0, e2y0, e2x1, e2y1) {
        if (this.isWithinBounds(e1x1, e1y0, e2x0, e2y0, e2x1, e2y1)) { // e1 bottom left corner in e2
            return true;
        } else if (this.isWithinBounds(e1x1, e1y0, e2x0, e2y0, e2x1, e2y1)) { // e1 bottom right corner in e2
            return true;
        } else if (this.isWithinBounds(e1x0, e1y0, e2x0, e2y0, e2x1, e2y1)) { // e1 bottom left corner in e2
            return true;
        } else if (this.isWithinBounds(e1x1, e1y1, e2x0, e2y0, e2x1, e2y1)) { // e1 top right corner in e2
            return true;
        } else if (this.isWithinBounds(e1x0, e1y1, e2x0, e2y0, e2x1, e2y1)) { // e1 top left corner in e2
            return true;
        } else {
            return false
        }
    }

    selectBlockAt(x2, y2) {
        const x0 = this.player.x;
        const y0 = this.player.y + 0.8 * this.player.height;
        const a = Math.atan2(y2 - y0, x2 - x0);
        const none = Settings.blocks.none.id;

        this.player.selected.present = false;

        for (let r = Settings.nearest.rMinimum; r <= Settings.nearest.rMaximum; r += Settings.nearest.rStep) {
            const x1 = x0 + r * Math.cos(a);
            const y1 = y0 + r * Math.sin(a);
            const block = this.getBlockAbsolute(x1, y1);

            if (block.blockId > none) {
                block.midX = block.xAbsolute + 0.5;
                block.midY = block.yAbsolute + 0.5;
                const pointerBlockDistance = Math.sqrt((x2 - block.midX) * (x2 - block.midX) + (y2 - block.midY) * (y2 - block.midY));
                const adjacent = this.detectFirstFace(x0, y0, Math.tan(a), block.xAbsolute, block.yAbsolute, block.xAbsolute + 1, block.yAbsolute + 1);
                if (pointerBlockDistance < 4.7 && adjacent) { // TODO remove if distance check is not needed
                    this.player.selected.present = true;
                    this.player.selected.x = block.xAbsolute;
                    this.player.selected.y = block.yAbsolute;
                    this.player.selected.x0 = x0;
                    this.player.selected.y0 = y0;
                    this.player.selected.x1 = x1;
                    this.player.selected.y1 = y1;
                    this.player.selected.x2 = x2;
                    this.player.selected.y2 = y2;
                    this.player.selected.block = block;
                    this.player.adjacent = adjacent;

                    // console.log(`Selected ${this.player.selected.x} ${this.player.selected.y} ${this.player.adjacent.face}`);
                }
                break;
            }
        }
    }

    // x0,y0 - starting point
    // a - angle
    // x1,y1 - lower left block corner
    // x2,y2 - upper right block corner
    detectFirstFace(x0, y0, a, x1, y1, x2, y2) {
        const b = y0 - a * x0;
        let x;
        let y;
        let block;

        // left
        y = a * x1 + b;
        block = this.getBlockAbsolute(x1 - 0.5, y1 + 0.5);
        if (y > y1 && y < y2 && x0 < x1 && block.blockId === Settings.blocks.none.id) {
            return {
                face: "left",
                block: block
            };
        }

        // right
        y = a * x2 + b;
        block = this.getBlockAbsolute(x2 + 0.5, y1 + 0.5);
        if (y > y1 && y < y2 && x0 > x2 && block.blockId === Settings.blocks.none.id) {
            return {
                face: "right",
                block: block
            };
        }

        // top
        x = (y2 - b) / a;
        block = this.getBlockAbsolute(x1 + 0.5, y2 + 0.5);
        if (x > x1 && x < x2 && y0 > y2 && block.blockId === Settings.blocks.none.id) {
            return {
                face: "top",
                block: block
            };
        }

        // bottom
        x = (y1 - b) / a;
        block = this.getBlockAbsolute(x1 + 0.5, y1 - 0.5);
        if (x > x1 && x < x2 && y0 < y1 && block.blockId === Settings.blocks.none.id) {
            return {
                face: "bottom",
                block: block
            };
        } else {
            return false;
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

    surrounding(eX, eY) {
        const results = {};
        let x, y, a, r, block, yValues;
        for (a = 0; a < 2 * Math.PI; a += 2 * Math.PI / 256) {
            for (r = 0.5; r < 30; r += 0.9) {
                x = eX + r * Math.cos(a);
                y = eY + r * Math.sin(a);
                block = this.getBlockAbsolute(x, y);
                yValues = results[block.yAbsolute];
                if (!yValues) {
                    yValues = {};
                    results[block.yAbsolute] = yValues;
                }
                yValues[block.xAbsolute] = block;
                if (block.blockId !== Settings.blocks.none.id) {
                    break;
                }
            }
        }
        return results;
    }

    makeVisible(eX = this.player.x, eY = this.player.y + 0.8 * this.player.height) {
        let x, y, a, r, block;
        for (a = 0; a < 2 * Math.PI; a += 2 * Math.PI / 128) {
            for (r = 0.5; r < 30; r += 0.9) {
                x = eX + r * Math.cos(a);
                y = eY + r * Math.sin(a);
                block = this.getBlockAbsolute(x, y);
                if (!block.seen) {
                    this.see(block);
                }
                if (block.blockId !== Settings.blocks.none.id) {
                    break;
                }
            }
        }
    }

    getVelocity(positiveBind, negativeBind) {
        let result = 0;

        if (Keyboard.has(positiveBind)) {
            result = 1;
        } else if (Keyboard.has(negativeBind)) {
            result = -1;
        }

        if (Keyboard.has(Keyboard.bindings.run) && Keyboard.has(Keyboard.bindings.jump) && this.player.crouch === false) {
            result *= Settings.movement.runJumpSpeed;
        } else if (Keyboard.has(Keyboard.bindings.run) && this.player.crouch === false) {
            result *= Settings.movement.runSpeed;
        } else if (Keyboard.has(Keyboard.bindings.sneak)) {
            result *= Settings.movement.sneakSpeed;
        } else if (this.player.crouch) {
            result *= Settings.movement.crouchSpeed;
        } else {
            result *= Settings.movement.walkSpeed;
        }

        return result;
    }

    changeVelocity(diff, v0, factor, positiveBind, negativeBind) {
        const v1 = this.getVelocity(positiveBind, negativeBind);

        if (v1 > v0) { // increase
            return Math.min(v0 + factor * diff, v1);
        } else if (v1 < v0) { //decrease
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
                this.player.velocityY = this.player.velocityY - g * t;
                console.log(`Gravity v=${this.player.velocityY.toFixed(2)}`);
            } else {
                this.player.velocityY = 0;
            }
        }

        if (Keyboard.had(Keyboard.bindings.jump)) {
            console.log(`Jump ${timestamp} last ${this.player.lastJump}`);
            if ((timestamp - this.player.lastJump) < 200) { // second jump within 200ms
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

        if (this.player.velocityY === 0 && Keyboard.has(Keyboard.bindings.moveDown)) {
            if (this.player.crouch === false && this.isSpaceAroundEdge(this.player, 0, 0, this.player.widthCrouch, this.player.heightCrouch)) {
                this.player.setCrouch(true);
            }
        } else if (this.player.crouch === true && this.isSpaceAroundEdge(this.player, 0, 0, this.player.widthStand, this.player.heightStand)) {
            this.player.setCrouch(false);
        }

        const factor = this.player.velocityY === 0 ? Settings.movement.accelerationGround : Settings.movement.accelerationAir;
        this.player.velocityX = this.changeVelocity(diff, this.player.velocityX, factor, Keyboard.bindings.moveRight, Keyboard.bindings.moveLeft);

        if (Keyboard.has(Keyboard.bindings.jump) && this.player.velocityY === 0) {
            this.player.velocityY = Settings.movement.jumpSpeed;
        } else if (this.player.velocityY > Settings.movement.step && !this.isSpaceAroundEdge(this.player, 0, +Settings.movement.step)) {
            console.log("Head bang");
            this.player.velocityY = Settings.movement.step;
        } else if (this.isSpaceAroundEdge(this.player, 0, -Settings.movement.step)) {
            this.player.velocityY = this.player.velocityY - g * t;
            // console.log(`Gravity v=${this.player.velocityY.toFixed(2)}`);
        } else if (this.player.velocityY !== 0) {
            console.log(`Hurt from ${this.player.velocityY.toFixed(2)}`);
            this.hurt(this.getFallDamage(Math.abs(this.player.velocityY)));
            this.player.velocityY = 0;
        }

        if (this.player.y < 0) {
            this.hurtEverySecond(timestamp, "void", 1, 250);
        }

        if (this.player.velocityX || this.player.velocityY) {
            this.move(this.player, t * this.player.velocityX, t * this.player.velocityY);
            this.makeVisible();
        }
    }

    hurtEverySecond(timestamp, key, amount, milliseconds = 1000) {
        const id = key + ":" + Math.floor(timestamp / milliseconds);
        if (this.player.health > 0 && !this.player.hurtEverySecond[id]) {
            this.hurt(amount);
            this.player.hurtEverySecond[id] = true;
        }
    }

    hurt(damage) {
        if (damage > 0) {
            console.log(`Player received ${damage} damage`);
            this.player.health = Math.max(0, this.player.health - damage);
        }

        if (this.player.health === 0) {
            console.log(`Player died`);
            this.die();
        }
    }

    die() {

    }

    getFallDamage(v) {
        return Math.max(0, Math.floor((v - Settings.movement.fallDamageMin) * Settings.movement.fallDamageFactor));
    }

    getBlockAbsolute(x, y) {
        const position = this.resolve(x, y);
        //console.log(`Pos(${x},${y}) = (${position.x},${position.y}) chunk ${position.chunkId} block ${position.blockId}`);
        const chunk = this.generator.getChunk(position.chunkId);
        if (position.yAbsolute >= Settings.chunk.height) {
            position.blockId = Settings.blocks.none.id;
            position.seen = true;
        } else if (position.yAbsolute < 0) {
            position.blockId = Settings.blocks.void.id;
            position.seen = true;
        } else {
            position.blockId = chunk.blocks[position.y][position.x].blockId;
            position.seen = chunk.blocks[position.y][position.x].seen || this.mode === Mode.demo;
            position.light = chunk.blocks[position.y][position.x].light;
        }
        position.block = Settings.blocks[position.blockId];
        position.biomeName = chunk.biomesNames[position.x];
        return position;
    }

    see(block) {
        const chunk = this.generator.getChunk(block.chunkId);
        chunk.blocks[block.y][block.x].seen = true;
    }

    removeBlock(block) {
        const chunk = this.generator.getChunk(block.chunkId);
        chunk.blocks[block.y][block.x].blockId = Settings.blocks.none.id;
    }

    addBlock(block) {
        const chunk = this.generator.getChunk(block.chunkId);
        chunk.blocks[block.y][block.x].blockId = block.blockId;
    }

    resolve(x, y) {
        return {
            chunkId: Math.floor(x / Settings.chunk.width),
            x: Math.floor((x % Settings.chunk.width + Settings.chunk.width) % Settings.chunk.width),
            y: Math.floor(Math.max(0, Math.min(y, Settings.chunk.height - 1))),
            xAbsolute: Math.floor(x),
            yAbsolute: Math.floor(y),
        }
    }
}

export {Game}
