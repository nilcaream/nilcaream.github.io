const chunk = {
    height: 128,
    middle: 64,
    width: 512,
    top: 16, // no blocks are generated at Y in [0,16] // TODO remove
    bottom: 124, // no blocks are generated at Y in [124,height] // TODO remove

    biomes: {
        widthMin: 32, // minimum width of the last biome in chunk
    }
};

const blocks = {
    none: {id: 0},
    any: {id: 1, color: "#000"},
    grass: {id: 2, color: "#2ab013"},
    dirt: {id: 3, color: "#846a2c"},
    stone1: {id: 4, color: "#a29e92"},
    stone2: {id: 5, color: "#d3d1c6"},
    stone3: {id: 6, color: "#eae4cb"},
    deepStone1: {id: 7, color: "#868277"},
    deepStone2: {id: 8, color: "#6e695f"},
    deepStone3: {id: 9, color: "#504832"},
    sand: {id: 10, color: "#fffd98"},
    gravel: {id: 11, color: "#ecece7"},
    sandBlock: {id: 12, color: "#ffe677"},

    coalOre: {id: 390, color: "#211f1f", yMin: 5, yMax: 128, lengthMin: 3, lengthMax: 6, chance: 1},
    ironOre: {id: 391, color: "#ced5d4", yMin: 5, yMax: 100, lengthMin: 3, lengthMax: 5, chance: 0.5},
    goldOre: {id: 392, color: "#f1c802", yMin: 5, yMax: 48, lengthMin: 2, lengthMax: 5, chance: 0.25},
    diamondOre: {id: 393, color: "#1ba4f1", yMin: 4, yMax: 20, lengthMin: 2, lengthMax: 5, chance: 0.125},
};

const blockHelper = (depthMin, depthMax, blockId, chance) => {
    return {
        depthMin: depthMin,
        depthMax: depthMax,
        blockId: blockId,
        chance: chance
    }
};

const veinHelper = (count, blockId, chance) => {
    return {
        count: count,
        blockId: blockId,
        chance: chance
    }
}

const biomes = [ // order is important as generator is array-index based
    {
        name: "plains",
        chance: 0.5,
        widthMin: 100,
        widthMax: 400,
        heightMin: chunk.middle - 8,
        heightMax: chunk.middle + 8,
        surfacePointsMin: 3,
        surfacePointsMax: 6,
        blocks: [
            blockHelper(1, 1, blocks.grass.id, 1),
            blockHelper(1, 4, blocks.dirt.id, 1),
            blockHelper(2, 8, blocks.stone1.id, 0.7),
            blockHelper(2, 4, blocks.gravel.id, 0.7),
            blockHelper(2, 5, blocks.stone2.id, 0.8),
            blockHelper(15, 25, blocks.stone3.id, 1),
            blockHelper(15, 25, blocks.stone2.id, 1),
            blockHelper(15, 25, blocks.stone1.id, 1),
            blockHelper(40, 40, blocks.deepStone1.id, 1),
        ],
        veins: [
            veinHelper(50, blocks.coalOre.id, 1),
            veinHelper(40, blocks.ironOre.id, 1),
            veinHelper(30, blocks.goldOre.id, 1),
            veinHelper(30, blocks.diamondOre.id, 1),
        ]
    },
    {
        name: "mountains",
        chance: 0.3,
        widthMin: 100,
        widthMax: 300,
        heightMin: Math.round(0.7 * chunk.height),
        heightMax: Math.round(0.9 * chunk.height),
        surfacePointsMin: 2,
        surfacePointsMax: 3,
        blocks: [
            blockHelper(1, 1, blocks.grass.id, 0.6),
            blockHelper(2, 3, blocks.dirt.id, 0.6),
            blockHelper(1, 2, blocks.stone1.id, 0.4),
            blockHelper(1, 3, blocks.gravel.id, 0.3),
            blockHelper(4, 10, blocks.stone1.id, 0.8),
            blockHelper(1, 3, blocks.gravel.id, 0.3),
            blockHelper(3, 8, blocks.stone2.id, 0.9),
            blockHelper(5, 10, blocks.stone3.id, 0.8),
            blockHelper(10, 30, blocks.stone1.id, 1),
            blockHelper(2, 5, blocks.gravel.id, 0.9),
            blockHelper(3, 6, blocks.dirt.id, 0.9),
            blockHelper(5, 20, blocks.deepStone1.id, 1),
            blockHelper(5, 20, blocks.deepStone2.id, 1),
            blockHelper(10, 30, blocks.stone1.id, 1),
            blockHelper(30, 64, blocks.deepStone3.id, 1),
            blockHelper(30, 30, blocks.deepStone2.id, 1),
        ],
        veins: [
            veinHelper(60, blocks.coalOre.id, 1),
            veinHelper(50, blocks.ironOre.id, 1),
            veinHelper(30, blocks.goldOre.id, 1),
            veinHelper(30, blocks.diamondOre.id, 1),
        ]
    },
    {
        name: "desert",
        chance: 0.2,
        widthMin: 200,
        widthMax: 400,
        heightMin: chunk.middle - 8,
        heightMax: chunk.middle + 8,
        surfacePointsMin: 3,
        surfacePointsMax: 6,
        blocks: [
            blockHelper(3, 8, blocks.sand.id, 1),
            blockHelper(2, 4, blocks.sandBlock.id, 1),
            blockHelper(2, 4, blocks.dirt.id, 0.7),
            blockHelper(15, 20, blocks.stone1.id, 0.7),
            blockHelper(2, 4, blocks.dirt.id, 0.7),
            blockHelper(15, 20, blocks.stone3.id, 0.7),
            blockHelper(15, 20, blocks.stone2.id, 0.7),
            blockHelper(15, 20, blocks.stone1.id, 1),
            blockHelper(60, 60, blocks.deepStone1.id, 1)
        ],
        veins: [
            veinHelper(30, blocks.coalOre.id, 1),
            veinHelper(30, blocks.ironOre.id, 1),
            veinHelper(30, blocks.goldOre.id, 1),
            veinHelper(30, blocks.diamondOre.id, 1),
        ]
    },
    {
        name: "ocean",
        chance: 0.2,
        widthMin: 200,
        widthMax: 400,
        heightMin: Math.round(0.3 * chunk.middle),
        heightMax: Math.round(0.8 * chunk.middle),
        surfacePointsMin: 3,
        surfacePointsMax: 6,
        blocks: [
            blockHelper(2, 4, blocks.sand.id, 1),
            blockHelper(2, 3, blocks.gravel.id, 0.5),
            blockHelper(5, 10, blocks.dirt.id, 1),
            blockHelper(5, 10, blocks.stone1.id, 0.7),
            blockHelper(10, 15, blocks.stone2.id, 0.8),
            blockHelper(10, 20, blocks.stone3.id, 0.9),
            blockHelper(60, 60, blocks.stone1.id, 1)
        ],
        veins: [
            veinHelper(30, blocks.coalOre.id, 1),
            veinHelper(30, blocks.ironOre.id, 1),
            veinHelper(40, blocks.goldOre.id, 1),
            veinHelper(40, blocks.diamondOre.id, 1),
        ]
    },
    {
        name: "river",
        chance: 0.3,
        widthMin: 50,
        widthMax: 100,
        heightMin: Math.round(0.8 * chunk.middle),
        heightMax: Math.round(0.9 * chunk.middle),
        surfacePointsMin: 2,
        surfacePointsMax: 4,
        blocks: [
            blockHelper(1, 2, blocks.sand.id, 0.6),
            blockHelper(2, 3, blocks.gravel.id, 0.6),
            blockHelper(5, 8, blocks.dirt.id, 1),
            blockHelper(5, 10, blocks.stone1.id, 0.7),
            blockHelper(10, 15, blocks.stone2.id, 0.8),
            blockHelper(10, 20, blocks.stone1.id, 0.9),
            blockHelper(60, 60, blocks.stone3.id, 1)
        ],
        veins: [
            veinHelper(30, blocks.coalOre.id, 1),
            veinHelper(30, blocks.ironOre.id, 1),
            veinHelper(40, blocks.goldOre.id, 1),
            veinHelper(40, blocks.diamondOre.id, 1),
        ]
    }
];

const Settings = {
    chunk: chunk,
    biomes: biomes,
    blocks: blocks
}

export {Settings};
