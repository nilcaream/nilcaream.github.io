const chunk = {
    height: 128,
    middle: 64,
    width: 512,
    top: 16, // no blocks are generated at Y in [0,16] // TODO remove
    bottom: 124, // no blocks are generated at Y in [124,height] // TODO remove

    biomes: {
        startMin: 32,
        startMax: 128,
        countMin: 2, // number of biomes starting point per chunk
        countMax: 4
    }
};

const biomes = [
    {
        id: 1,
        name: "plains",
        chance: 0.5,
        widthMin: 100,
        widthMax: 400,
        heightMin: chunk.middle - 8,
        heightMax: chunk.middle + 8,
        surfacePointsMin: 3,
        surfacePointsMax: 6,
    },
    {
        id: 2,
        name: "mountains",
        chance: 0.3,
        widthMin: 100,
        widthMax: 300,
        heightMin: Math.round(0.7 * chunk.height),
        heightMax: Math.round(0.9 * chunk.height),
        surfacePointsMin: 2,
        surfacePointsMax: 3,
    },
    {
        id: 3,
        name: "desert",
        chance: 0.2,
        widthMin: 200,
        widthMax: 400,
        heightMin: chunk.middle - 8,
        heightMax: chunk.middle + 8,
        surfacePointsMin: 3,
        surfacePointsMax: 6,
    },
    {
        id: 4,
        name: "ocean",
        chance: 0.2,
        widthMin: 200,
        widthMax: 400,
        heightMin: Math.round(0.3 * chunk.middle),
        heightMax: Math.round(0.8 * chunk.middle),
        surfacePointsMin: 3,
        surfacePointsMax: 6,
    },
    {
        id: 5,
        name: "river",
        chance: 0.3,
        widthMin: 50,
        widthMax: 100,
        heightMin: Math.round(0.8 * chunk.middle),
        heightMax: Math.round(0.9 * chunk.middle),
        surfacePointsMin: 2,
        surfacePointsMax: 4,
    }
];

const Settings = {
    chunk: chunk,
    biomes: biomes
}

export {Settings};
