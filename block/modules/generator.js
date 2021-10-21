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
            const definition = this.getBiomeDefinition(id, i);
            const start = i === 0 ? 0 : biomes[i - 1].end + 1;
            const end = start + rng(definition.widthMin, definition.widthMax, true);
            const surfacePoints = this.createSurfacePoints(id, definition, start, end);

            const biome = {
                definition: definition,
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
        biomes.forEach((b, i) => console.log(`Chunk ${id} biome ${i}: ${b.definition.name} ${b.start}-${b.end}`));
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

    getBiomeDefinition(id, number) {
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

}

export {Generator}
