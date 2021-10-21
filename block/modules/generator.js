import {Settings} from "./settings.js";
import {Random} from "./random.js";
import {Smooth} from "./smooth.js";

class Generator {

    chunks = {}

    constructor(seed) {
        this.seed = seed;
    }

    getRng(id) {
        return Random(this.seed, id);
    }

    getChunk(id) {
        let chunk = this.chunks[id];
        if (chunk === undefined) {
            chunk = this.createChunk(id);
            this.chunks[id] = chunk
        }
        return chunk;
    }

    createChunk(id) {
        const chunk = this.createBaseChunk(id);
        chunk.surface = this.createSurface(chunk);
        this.updateBlocks(chunk);
        // this.blendBiomes(chunk);
        this.updateOres(chunk);
        return chunk;
    }

    createBaseChunk(id) {
        const chunk = {
            id: id,
            biomes: this.createBiomes(id)
        }
        return chunk;
    }

    createBiomes(id) {
        const rng = this.getRng(id + 1000);
        const biomes = [];

        for (let i = 0; i < Settings.chunk.width / 16; i++) {
            const definition = this.createBiomeDefinitions(id, i);
            const start = i === 0 ? 0 : biomes[i - 1].end + 1;
            const end = start + rng(definition.widthMin, definition.widthMax, true);
            const surfacePoints = this.createSurfacePoints(id, definition, start, end);

            const biome = {
                name: definition.name,
                start: start,
                end: end,
                surfacePoints: surfacePoints
            };

            biomes.push(biome);

            if (end >= Settings.chunk.width) { // break when last biome exceeds chunk width
                if (end - start < Settings.chunk.biomes.widthMin) { // remove last biome if it is too small
                    biomes.pop();
                }
                break;
            }
        }

        const last = biomes[biomes.length - 1];
        last.end = Settings.chunk.width - 1;
        last.surfacePoints = last.surfacePoints.filter(s => s.x < last.end);
        biomes.forEach((b, i) => console.log(`Chunk ${id} biome ${i}: ${b.name} ${b.start}-${b.end}`));
        return biomes;
    }

    createSurfacePoints(id, definition, start, end) {
        const rng = this.getRng(id + 3000);
        const count = rng(definition.surfacePointsMin, definition.surfacePointsMax, true);
        const x = [];

        while (x.length < count) {
            const value = rng(start, end); // TODO consider adding offset from start and end
            if (x.indexOf(value) === -1) {
                x.push(value);
            }
        }

        const points = [];
        for (let j = 0; j < count; j++) {
            points.push({
                x: x[j],
                y: rng(definition.heightMin, definition.heightMax, true)
            });
        }
        points.sort((s1, s2) => s1.x - s2.x);
        return points;
    }

    createSurface(current) {
        const previous = this.createBaseChunk(current.id - 1);
        const next = this.createBaseChunk(current.id + 1);

        const pointsX = [-Settings.chunk.width];
        const pointsY = [Settings.chunk.middle];

        previous.biomes.map(b => b.surfacePoints).forEach(sp => {
            sp.forEach(s => {
                pointsX.push(s.x - Settings.chunk.width);
                pointsY.push(s.y);
            });
        });

        current.biomes.map(b => b.surfacePoints).forEach(sp => {
            sp.forEach(s => {
                pointsX.push(s.x);
                pointsY.push(s.y);
            });
        });

        next.biomes.map(b => b.surfacePoints).forEach(sp => {
            sp.forEach(s => {
                pointsX.push(s.x + Settings.chunk.width);
                pointsY.push(s.y);
            });
        });

        pointsX.push(2 * Settings.chunk.width);
        pointsY.push(Settings.chunk.middle);

        for (let i = 0; i < pointsX.length; i++) {
            console.log(`Chunk ${current.id} surface point ${i}: ${pointsX[i]} ${pointsY[i]}`)
        }

        const surfaceMap = {};

        const surfaceX = Smooth(pointsX, {method: "linear"});
        const surfaceY = Smooth(pointsY, {method: "cubic"});
        for (let i = 0; i < pointsX.length; i++) {
            for (let j = 0; j < 1; j += 0.001) {
                const a = Math.floor(surfaceX(i + j));
                const b = Math.round(surfaceY(i + j));
                surfaceMap[a] = surfaceMap[a] || b;
            }
        }

        // for (let i = -Settings.chunk.width; i <= 2 * Settings.chunk.width; i += 32) {
        //     console.log(`Surface ${i} ${surfaceMap[i]}`)
        // }

        const surface = [];
        for (let i = 0; i < Settings.chunk.width; i++) {
            surface.push(surfaceMap[i]);
        }
        return surface;
    }

    createBiomeDefinitions(id, number) {
        const rng = this.getRng(id + 2000 + number);

        for (let i = 0; i < 128; i++) {
            const biome = Settings.biomes[rng(0, Settings.biomes.length)];
            if (rng() < biome.chance) {
                return biome;
            }
        }

        console.log(`Chunk ${id} biome ${number}: unable to generate biome`);
        return Settings.biomes[0];
    }

    updateBlocks(chunk) {
        const blocks = new Array(Settings.chunk.height).fill(0).map(_ => new Array(Settings.chunk.width).fill(0));

        chunk.biomes.forEach((biome, number) => {
            const rng = this.getRng(chunk.id + 8000 + number);
            const definition = Settings.biomes.filter(b => b.name === biome.name)[0].blocks || [];

            for (let x = biome.start; x <= biome.end; x++) {
                let y = chunk.surface[x];

                definition.forEach(d => {
                    if (rng() <= d.chance) {
                        const depth = rng(d.depthMin, d.depthMax, true);
                        for (let i = 0; i < depth && y >= 0; i++) {
                            blocks[y--][x] = d.blockId;
                        }
                    }
                });
            }
        });

        chunk.blocks = blocks;
        // for (let y = Settings.chunk.height - 1; y >= 0; y--) {
        //     console.log(blocks[y].join(""));
        // }
    }

    updateOres(chunk) {
        const rng = this.getRng(chunk.id + 7100 + chunk.id);
        chunk.biomes.forEach((biome, biomeNumber) => {

            const widthFactor = 2 * (biome.end - biome.start) / Settings.chunk.width;

            (Settings.biomes.filter(b => b.name === biome.name)[0].veins || []).forEach(definition => {
                const block = Object.values(Settings.blocks).filter(bl => bl.id === definition.blockId)[0];
                for (let i = 0; i < definition.count; i++) {
                    for (let j = 0; j < 256; j++) {
                        const x = rng(biome.start, biome.end);
                        const y = rng(block.yMin, block.yMax);
                        if (chunk.blocks[y][x] !== 0 && chunk.blocks[y][x] < Settings.blocks.coalOre.id) { // not empty block and not ore
                            if (rng() <= (definition.chance * block.chance * widthFactor)) {
                                const block = Object.values(Settings.blocks).filter(bl => bl.id === definition.blockId)[0];
                                const length = rng(block.lengthMin, block.lengthMax, true);
                                console.log(`Chunk ${chunk.id} biome ${biomeNumber} ${biome.name} ore ${definition.blockId}: ${x} ${y} length ${length}`);
                                let vX = x;
                                let vY = y;
                                for (let k = 0; k < length && vX < Settings.chunk.width && vY < Settings.chunk.height; k++) {
                                    if (chunk.blocks[vY][vX] !== 0 && chunk.blocks[vY][vX] < definition.blockId) { // not empty and not ore of higher grade
                                        chunk.blocks[vY][vX] = definition.blockId;
                                        console.log(`Chunk ${chunk.id} biome ${biomeNumber} ${biome.name} vein ${definition.blockId}: ${vX} ${vY}`);
                                    }
                                    if (rng() > 0.5) {
                                        vX++;
                                    } else {
                                        vY++;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            });
        });
    }

    blendBiomes(chunk) { // this doesnt work well as grass goes into stone
        const rng = this.getRng(chunk.id + 2600);
        chunk.biomes.map(b => b.start).filter(s => s > 16 && s < Settings.chunk.width).forEach(s => {
            for (let y = 0; y < Settings.chunk.height; y++) {
                for (let i = 1; i < 16; i++) {
                    const left = chunk.blocks[y][s - i];
                    const right = chunk.blocks[y][s + i];
                    if (left && right) {
                        if (rng() < (0.7 - 0.5 * i / 16)) {
                            chunk.blocks[y][s - i] = right;
                            chunk.blocks[y][s + i] = left;
                        }
                    }
                }
            }
        });
    }
}

export {Generator}
