import {Settings} from "./settings.js";
import {Random} from "./random.js";
import {Smooth} from "../Smooth-0.1.7.js";
import {Spline} from "./spline.js";

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

        const previousLastBiome = previous.biomes[previous.biomes.length - 1];
        const currentFirstBiome = current.biomes[0];

        previousLastBiome.end = currentFirstBiome.start + Settings.chunk.width - 1; // prevent last chunk biome overlapping with first next chunk biome
        previousLastBiome.surfacePoints = previousLastBiome.surfacePoints.filter(p => p.x < previousLastBiome.end); // filter surface points outside of biome end

        current.biomes.map(b => b.surfacePoints).forEach(sp => {
            sp.forEach(s => {
                pointsX.push(s.x);
                pointsY.push(s.y);
            });
        });

        const currentLastBiome = current.biomes[current.biomes.length - 1];
        const nextFirstBiome = next.biomes[0];

        currentLastBiome.end = nextFirstBiome.start + Settings.chunk.width - 1; // prevent last chunk biome overlapping with first next chunk biome
        currentLastBiome.surfacePoints = currentLastBiome.surfacePoints.filter(p => p.x < currentLastBiome.end); // filter surface points outside of biome end

        next.biomes.map(b => b.surfacePoints).forEach(sp => {
            sp.forEach(s => {
                pointsX.push(s.x + Settings.chunk.width);
                pointsY.push(s.y);
            });
        });

        pointsX.push(2 * Settings.chunk.width);
        pointsY.push(Settings.chunk.middle);


        for (let i = 0; i < pointsX.length; i++) {
            console.log(`Point ${i}: ${pointsX[i]} ${pointsY[i]}`)
        }

        const surfaceMap = {};

        const surfaceX = Smooth(pointsX, {method: "linear"});
        const surfaceY = Smooth(pointsY, {method: "cubic", lanczosFilterSize: 3});
        for (let i = 0; i < pointsX.length; i++) {
            for (let j = 0; j < 1; j += 0.001) {
                const a = Math.floor(surfaceX(i + j));
                const b = Math.round(surfaceY(i + j));
                surfaceMap[a] = surfaceMap[a] || b;
            }
        }

        const spline = new Spline(pointsX, pointsY);
        for (let i = pointsX[0]; i < pointsX[pointsX.length - 1]; i++) {
            //surfaceMap[i] = Math.round(spline.at(i));
            // surfaceMap[i] = (surfaceMap[i]+ Math.round(spline.at(i)))/2;
        }

        console.log(surfaceMap);
        //
        for (let i = 0; i < pointsX.length; i++) {
            console.log(`Point ${pointsX[i]} ${pointsY[i]} - Surface ${surfaceMap[pointsX[i]]}`);
        }
        for (let i = -Settings.chunk.width; i <= 2 * Settings.chunk.width; i += 32) {
            console.log(`Surface ${i} ${surfaceMap[i]}`)
        }

        const surface = [];
        for (let i = 0; i < Settings.chunk.width; i++) {
            surface.push(surfaceMap[i]);
        }
        return surface;
    }

    createBaseChunk(id) {
        const chunk = {
            id: id,
            biomes: this.getBiomes(id)
        }
        return chunk;
    }

    getBiomes(id) {
        const rng = this.getRng(id + 1000);
        const count = rng(Settings.chunk.biomes.countMin, Settings.chunk.biomes.countMax, true);
        const biomes = [];

        for (let i = 0; i < count; i++) {
            const definition = this.getBiomeDefinition(id, i);
            const start = i === 0 ? rng(Settings.chunk.biomes.startMin, Settings.chunk.biomes.startMax) : biomes[i - 1].end + 1;
            const end = start + rng(definition.widthMin, definition.widthMax, true);
            const surfacePoints = this.getSurfacePoints(id, definition, start, end);

            biomes.push({
                definition: definition,
                start: start,
                end: end,
                surfacePoints: surfacePoints
            });
            console.log(`Biome ${id}.${i} ${definition.name} ${start}-${end}`);
        }
        return biomes;
    }

    getSurfacePoints(id, definition, start, end) {
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
        return points; // points outside of chunk width will be taken into consideration when surface is calculated
    }

    getBiomeDefinition(id, number) {
        const rng = this.getRng(id + 2000 + number);

        for (let i = 0; i < 128; i++) {
            const biome = Settings.biomes[rng(0, Settings.biomes.length)];
            if (rng() < biome.chance) {
                return biome;
            }
        }

        console.log(`Unable to generate biome for ${id} ${number}`);
        return Settings.biomes[0];
    }

}

export {Generator}
