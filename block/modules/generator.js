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
        this.addBlocks(chunk);
        this.addCaves(chunk);
        this.addOres(chunk);
        this.addWater(chunk);
        this.addBedrock(chunk);
        this.storeBiomesNames(chunk);

        // this.blendBiomes(chunk); // not working yet
        return chunk;
    }

    createBaseChunk(id) {
        return {
            id: id,
            biomes: this.createBiomes(id),
            blocks: new Array(Settings.chunk.height).fill(0).map(_ => new Array(Settings.chunk.width).fill(Settings.blocks.none.id))
        };
    }

    storeBiomesNames(chunk) {
        chunk.biomesNames = new Array(Settings.chunk.width);
        chunk.biomes.forEach(biome => {
            for (let i = biome.start; i <= biome.end; i++) {
                chunk.biomesNames[i] = biome.name;
            }
        });
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
                surfacePoints: surfacePoints,
                water: definition.water
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
            const biome = Settings.biomes.all[rng(0, Settings.biomes.all.length)];
            if (rng() < biome.chance) {
                return biome;
            }
        }

        console.log(`Chunk ${id} biome ${number}: unable to generate biome`);
        return Settings.biomes.all[0];
    }

    addBlocks(chunk) {
        for (let number = 0; number < chunk.biomes.length; number++) {
            this.updateBlocksInBiome(chunk, number);
        }

        // for (let y = Settings.chunk.height - 1; y >= 0; y--) {
        //     console.log(blocks[y].join(""));
        // }
    }

    updateBlocksInBiome(chunk, number) {
        const rng = this.getRng(chunk.id + 8000 + number);
        const biome = chunk.biomes[number];
        const blocks = Settings.biomes[biome.name].blocks || [];

        for (let x = biome.start; x <= biome.end; x++) {
            let y = chunk.surface[x];

            blocks.forEach(block => {
                if (rng() <= block.chance) {
                    const depth = rng(block.depthMin, block.depthMax, true);
                    for (let i = 0; i < depth && y >= 0; i++) {
                        chunk.blocks[y--][x] = block.blockId;
                    }
                }
            });
        }
    }

    addOres(chunk) {
        const rng = this.getRng(chunk.id + 7100 + chunk.id);
        chunk.biomes.forEach((biome, biomeNumber) => {

            const widthFactor = 2 * (biome.end - biome.start) / Settings.chunk.width;

            (Settings.biomes[biome.name].veins || []).forEach(definition => {
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
                                    if (rng() > 0.25) {
                                        vX++;
                                    } else if (rng() > 0.25) {
                                        vY--;
                                    } else if (rng() > 0.25) {
                                        vX--;
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

    addWater(chunk) {
        const fillDown = (x, waterId) => {
            for (let y = Settings.chunk.middle; y > 0; y--) {
                if (chunk.blocks[y][x] === Settings.blocks.none.id) {
                    chunk.blocks[y][x] = waterId;
                } else {
                    break;
                }
            }
        };

        chunk.biomes.filter(b => b.water).forEach(biome => {
            // biome boundaries
            for (let x = biome.start; x <= biome.end; x++) {
                fillDown(x, biome.water);
            }

            // left
            for (let x = biome.start - 1; x >= 0; x--) {
                if (chunk.blocks[Settings.chunk.middle][x] !== 0) {
                    break;
                }
                fillDown(x, biome.water);
            }

            // right
            for (let x = biome.end + 1; x < Settings.chunk.width; x++) {
                if (chunk.blocks[Settings.chunk.middle][x] !== 0) {
                    break;
                }
                fillDown(x, biome.water);
            }
        });

        // flood first biome if previous chunk last biome is water
        if (!chunk.biomes[0].water) {
            const previous = this.createBaseChunk(chunk.id - 1);
            const biome = previous.biomes[previous.biomes.length - 1];
            if (biome.water) {
                // right
                for (let x = 0; x < Settings.chunk.width; x++) {
                    if (chunk.blocks[Settings.chunk.middle][x] !== 0) {
                        break;
                    }
                    fillDown(x, biome.water);
                }
            }
        }

        // flood last biome if next chunk first biome is water
        if (!chunk.biomes[chunk.biomes.length - 1].water) {
            const next = this.createBaseChunk(chunk.id + 1);
            const biome = next.biomes[0];
            if (biome.water) {
                // left
                for (let x = Settings.chunk.width - 1; x >= 0; x--) {
                    if (chunk.blocks[Settings.chunk.middle][x] !== 0) {
                        break;
                    }
                    fillDown(x, biome.water);
                }
            }
        }
    }

    addCaves(chunk) {
        const rng = this.getRng(chunk.id + 500);
        const get = (x, y) => {
            if (x < 0 || x >= Settings.chunk.width || y < 0 || y >= Settings.chunk.height) {
                return undefined;
            } else {
                return chunk.blocks[y][x];
            }
        }
        const set = (x, y, v) => {
            if (!(x < 0 || x >= Settings.chunk.width || y < 0 || y >= Settings.chunk.height)) {
                chunk.blocks[y][x] = v;
            }
        }

        for (let i = 0, n = rng(Settings.caves.numberMin, Settings.caves.numberMax); i < n; i++) {
            const x = rng(16, Settings.chunk.width - 16);
            const y = rng(Settings.caves.heightMin, chunk.surface[x] + 8);//Settings.chunk.middle;// rng(16, Settings.chunk.height - 16);

            const cave = this.createCave(chunk.id, i);

            if (x + cave[0].length < Settings.chunk.width) {
                for (let cY = 0; cY < cave.length; cY++) {
                    for (let cX = 0; cX < cave[0].length; cX++) {
                        const blockCurrent = get(x + cX, y - cY);
                        const blockCave = cave[cY][cX];
                        if (blockCurrent !== undefined && blockCurrent > Settings.blocks.none.id) {
                            const blockNew = blockCave === Settings.blocks.any.id ? blockCurrent : Settings.blocks.none.id;
                            set(x + cX, y - cY, blockNew);
                        }
                    }
                }
            }
        }
    }

    createCave(id, number) {
        const rng = this.getRng(id + 9000 + number);
        const width = rng(Settings.caves.widthMin, Settings.caves.widthMax);
        const height = rng(Settings.caves.heightMin, Settings.caves.heightMax);

        const adjCount = (data, x, y) => {
            let count = 0;
            for (let a = -1; a <= 1; a++) {
                for (let b = -1; b <= 1; b++) {
                    count += data[a + y][b + x] === Settings.blocks.any.id;
                }
            }
            return count;
        }

        const data1 = new Array(height).fill(0).map(_ => new Array(width).fill(Settings.blocks.none.id)); // all empty
        const data2 = new Array(height).fill(0).map(_ => new Array(width).fill(Settings.blocks.any.id)); // all full

        // init data1 with random + border wall
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (x < 1 || y < 1 || x > width - 2 || y > height - 2) {
                    data1[y][x] = Settings.blocks.any.id;
                } else if (rng() > Settings.caves.wallChance) {
                    data1[y][x] = Settings.blocks.any.id;
                }
            }
        }

        // perform n iterations
        for (let i = 0; i < Settings.caves.iterations; i++) {
            // set walls based on adjacent count
            for (let x = 1; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    if (adjCount(data1, x, y) > 4) {
                        data2[y][x] = Settings.blocks.any.id;
                    } else {
                        data2[y][x] = Settings.blocks.none.id;
                    }
                }
            }

            // copy data1 into data2
            for (let x = 1; x < width - 1; x++) {
                for (let y = 1; y < height - 1; y++) {
                    data1[y][x] = data2[y][x];
                }
            }
        }

        return data1;
    }

    addBedrock(chunk) {
        const rng = this.getRng(chunk.id + 120);
        for (let x = 0; x < Settings.chunk.width; x++) {
            for (let y = 0; y < rng(1, 2, true); y++) {
                chunk.blocks[y][x] = Settings.blocks.bedrock.id;
            }
        }
    }

    blendBiomes(chunk) { // TODO WIP
        const rng = this.getRng(chunk.id + 2600);
        chunk.biomes.forEach((current, number) => {
            let previous;
            if (number === 0) {
                const previousChunk = this.createBaseChunk(chunk.id - 1);
                const number = previousChunk.biomes.length - 1;
                previous = previousChunk.biomes[number];

            } else {
                previous = chunk.biomes[number - 1];
            }
            for (let i = 0; i < 16; i++) {
                const x = current.start + i;

            }
        });

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
