const chunk = {
    height: 128,
    middle: 64,
    width: 512,

    biomes: {
        widthMin: 32, // minimum width of the last biome in chunk
    }
};

const entities = {
    player: {id: 0}
};

const update = object => {
    const keys = Object.keys(object);
    object.all = Object.values(object);
    keys.forEach(key => {
        const value = object[key];
        value.name = key;
        object[value.id] = value;
    });
};

const blocks = {
    void: {id: -1, color: "#000"},
    none: {id: 0, color: "#fff"},
    any: {id: 1, color: "#000"},
    grass: {
        id: 2, color: "#2ab013", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 31, saturation: 93, luminosity: 22, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 31, saturation: 93, luminosity: 18, alpha: 100,
                    luminosityMax: 22,
                    chance: 40
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 2,
                    hue: 91, saturation: 93, luminosity: 22, alpha: 100,
                    luminosityMax: 28,
                    chance: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 2,
                    x1: 16, y1: 3,
                    hue: 91, saturation: 93, luminosity: 22, alpha: 50,
                    luminosityMax: 28, alphaMax: 100,
                    chance: 40
                }
            ]
        }
    },
    dirt: {
        id: 3, color: "#846a2c", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 31, saturation: 93, luminosity: 22, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 31, saturation: 93, luminosity: 18, alpha: 100,
                    luminosityMax: 22,
                    chance: 40
                }
            ]
        }
    },
    stone1: {
        id: 4, color: "#a29e92", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 50, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 53, alpha: 100,
                    luminosityMax: 57,
                    chance: 40
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 63, alpha: 100,
                    luminosityMax: 67,
                    chance: 10
                }
            ]
        }
    },
    stone2: {
        id: 5, color: "#d3d1c6", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 45, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 33, alpha: 100,
                    luminosityMax: 37,
                    chance: 40
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 63, alpha: 40,
                    luminosityMax: 67, alphaMax: 80,
                    chance: 20,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }
            ]
        }
    },
    stone3: {
        id: 6, color: "#eae4cb", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 45, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 23, alpha: 20,
                    luminosityMax: 27, alphaMax: 60,
                    chance: 40,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 40,
                    luminosityMax: 17, alphaMax: 80,
                    chance: 10,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }
            ]
        }
    },
    deepStone1: {
        id: 7, color: "#868277", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 20, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 100,
                    luminosityMax: 27,
                    chance: 40
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 33, alpha: 100,
                    luminosityMax: 37,
                    chance: 10,
                    width: 1, widthMax: 2
                }
            ]
        }
    },
    deepStone2: {
        id: 8, color: "#6e695f", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 25, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 100,
                    luminosityMax: 17,
                    chance: 40,
                    width: 1, widthMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 23, alpha: 40,
                    luminosityMax: 27, alphaMax: 80,
                    chance: 20,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }
            ]
        }
    },
    deepStone3: {
        id: 9, color: "#504832", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 15, alpha: 100,
                    width: 1, widthMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 3, alpha: 20,
                    luminosityMax: 7, alphaMax: 60,
                    chance: 40,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 3, alpha: 40,
                    luminosityMax: 7, alphaMax: 80,
                    chance: 10,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }
            ]
        }
    },
    sand: {
        id: 10, color: "#fffd98", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 48, saturation: 69, luminosity: 61, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 48, saturation: 69, luminosity: 56, alpha: 60,
                    luminosityMax: 66, alphaMax: 100,
                    chance: 40
                }
            ]
        }
    },
    gravel: {
        id: 11, color: "#ecece7", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 50, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 53, alpha: 80,
                    luminosityMax: 57,
                    chance: 40
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 25, alpha: 100,
                    luminosityMax: 35,
                    chance: 17
                }
            ]
        }
    },
    sandBlock: {id: 12, color: "#ffe677"},

    water1: {
        id: 20, color: "#60b0e3", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 216, saturation: 100, luminosity: 48, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 216, saturation: 100, luminosity: 53, alpha: 50,
                    luminosityMax: 57,
                    chance: 30
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 216, saturation: 100, luminosity: 55, alpha: 30,
                    luminosityMax: 75,
                    chance: 10,
                    width: 4, widthMax: 7,
                    wrapX: true,
                }
            ]
        }
    },
    water2: {id: 21, color: "#2be883"},
    water3: {id: 22, color: "#172d7a"},

    coalOre: {
        id: 240, color: "#211f1f", yMin: 5, yMax: 128, lengthMin: 3, lengthMax: 6, chance: 1, texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 45, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 23, alpha: 20,
                    luminosityMax: 27, alphaMax: 60,
                    chance: 40,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 40,
                    luminosityMax: 17, alphaMax: 80,
                    chance: 10,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 1, y0: 1,
                    x1: 11, y1: 11,
                    hue: 0, saturation: 0, luminosity: 0, alpha: 60,
                    luminosityMax: 10, alphaMax: 80,
                    count: 4, countMax: 6,
                    width: 3, widthMax: 4,
                    height: 3, heightMax: 4,
                    shadow: true,
                    spread: 4
                }
            ]
        }
    },
    ironOre: {
        id: 241, color: "#ced5d4", yMin: 5, yMax: 100, lengthMin: 3, lengthMax: 5, chance: 0.5, texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 45, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 23, alpha: 20,
                    luminosityMax: 27, alphaMax: 60,
                    chance: 40,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 40,
                    luminosityMax: 17, alphaMax: 80,
                    chance: 10,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 1, y0: 1,
                    x1: 11, y1: 11,
                    hue: 34, saturation: 68, luminosity: 57, alpha: 50,
                    luminosityMax: 77, alphaMax: 70,
                    count: 4, countMax: 6,
                    width: 3, widthMax: 4,
                    height: 3, heightMax: 4,
                    shadow: true,
                    spread: 4
                }
            ]
        }
    },
    goldOre: {
        id: 242, color: "#f1c802", yMin: 5, yMax: 48, lengthMin: 2, lengthMax: 5, chance: 0.25, texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 45, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 23, alpha: 20,
                    luminosityMax: 27, alphaMax: 60,
                    chance: 40,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 40,
                    luminosityMax: 17, alphaMax: 80,
                    chance: 10,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 1, y0: 1,
                    x1: 11, y1: 11,
                    hue: 58, saturation: 100, luminosity: 35, alpha: 50,
                    luminosityMax: 45, alphaMax: 65,
                    count: 4, countMax: 6,
                    width: 3, widthMax: 4,
                    height: 3, heightMax: 4,
                    shadow: true,
                    spread: 4
                }
            ]
        }
    },
    diamondOre: {
        id: 243, color: "#1ba4f1", yMin: 4, yMax: 20, lengthMin: 2, lengthMax: 5, chance: 0.125, texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 45, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 23, alpha: 20,
                    luminosityMax: 27, alphaMax: 60,
                    chance: 40,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 13, alpha: 40,
                    luminosityMax: 17, alphaMax: 80,
                    chance: 10,
                    width: 1, widthMax: 2,
                    height: 1, heightMax: 2
                }, {
                    type: "fillPixel",
                    x0: 1, y0: 1,
                    x1: 11, y1: 11,
                    hue: 187, saturation: 100, luminosity: 37, alpha: 40,
                    luminosityMax: 57, alphaMax: 60,
                    count: 4, countMax: 6,
                    width: 3, widthMax: 4,
                    height: 3, heightMax: 4,
                    shadow: true,
                    spread: 4
                }
            ]
        }
    },

    bedrock: {
        id: 255, color: "#1a1919", texture: {
            data: [
                {
                    type: "fillRect",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 22, alpha: 100
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 18, alpha: 50,
                    luminosityMax: 22,
                    chance: 30
                }, {
                    type: "fillPixel",
                    x0: 0, y0: 0,
                    x1: 16, y1: 16,
                    hue: 0, saturation: 0, luminosity: 2, alpha: 60,
                    luminosityMax: 20, alphaMax: 80,
                    chance: 10,
                    width: 6, widthMax: 10,
                    wrapX: true, wrapY: true,
                }
            ]
        }
    },
};

update(blocks);

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

const biomes = {
    plains: {
        id: 0,
        chance: 0.5,
        widthMin: 100,
        widthMax: 350,
        heightMin: chunk.middle - 2,
        heightMax: chunk.middle + 16,
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
    mountains: {
        id: 1,
        chance: 0.3,
        widthMin: 100,
        widthMax: 300,
        heightMin: Math.round(0.7 * chunk.height),
        heightMax: Math.round(0.9 * chunk.height),
        surfacePointsMin: 3,
        surfacePointsMax: 4,
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
    desert: {
        id: 2,
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
    ocean: {
        id: 3,
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
        ],
        water: blocks.water1.id
    },
    river: {
        id: 4,
        chance: 0.3,
        widthMin: 30,
        widthMax: 60,
        heightMin: Math.round(0.7 * chunk.middle),
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
        ],
        water: blocks.water1.id
    }
};

update(biomes);

const caves = {
    widthMin: 8,
    widthMax: 128,
    heightMin: 8,
    heightMax: 16,
    wallChance: 0.54,
    iterations: 6,
    numberMin: 16,
    numberMax: 32
};

const movement = {
    step: 0.02, // percentage of block size
    gravity: 18,
    walkSpeed: 4.3, // blocks per second
    crouchSpeed: 3.3, // blocks per second
    sneakSpeed: 1.3, // blocks per second
    runSpeed: 5.6, // blocks per second
    runJumpSpeed: 6.2, // blocks per second // 7.2
    jumpSpeed: 6,
    accelerationGround: 0.05,
    accelerationAir: 0.02,
    fallDamageMin: 8,
    fallDamageFactor: 0.7
}

const nearest = {
    rMinimum: 0.9,
    rMaximum: 2.8,
    rStep: 0.9,
}

const textures = {
    player: {
        head: [
            {
                "type": "canvas",
                "width": 16,
                "height": 16
            },
            {
                "type": "fillPixel",
                "x0": 0,
                "y0": 0,
                "x1": 16,
                "y1": 16,
                "hue": 38,
                "saturation": 40,
                "saturationMax": 45,
                "luminosity": 50,
                "alpha": 100,
                "chance": 100
            },
            {
                "type": "fillPixel",
                "x0": 0,
                "y0": 0,
                "x1": 8,
                "y1": 8,
                "hue": 38,
                "saturation": 50,
                "luminosity": 30,
                "luminosityMax": 40,
                "alpha": 100,
                "chance": 100
            },
            {
                "type": "fillPixel",
                "x0": 8,
                "y0": 0,
                "x1": 16,
                "y1": 4,
                "hue": 38,
                "saturation": 50,
                "luminosity": 30,
                "luminosityMax": 40,
                "alpha": 100,
                "chance": 100,
                "shadow": true,
                "shadowX": -1,
                "shadowY": 0
            },
            {
                "type": "fillPixel",
                "x0": 0,
                "y0": 8,
                "x1": 5,
                "y1": 14,
                "hue": 38,
                "saturation": 50,
                "luminosity": 30,
                "luminosityMax": 40,
                "alpha": 100,
                "chance": 100,
                "shadow": true,
                "shadowX": 1,
                "shadowY": 0
            },
            {
                "type": "fillPixel",
                "x0": 12,
                "y0": 7,
                "x1": 14,
                "y1": 9,
                "hue": 233,
                "saturation": 50,
                "luminosity": 30,
                "luminosityMax": 40,
                "alpha": 100,
                "chance": 100,
                "shadow": true,
                "shadowX": -1,
                "shadowY": 0
            },
            {
                "type": "fillPixel",
                "x0": 12,
                "y0": 13,
                "x1": 16,
                "y1": 14,
                "hue": 5,
                "saturation": 73,
                "luminosity": 40,
                "luminosityMax": 50,
                "alpha": 100,
                "chance": 100,
                "shadow": true,
                "shadowX": 1,
                "shadowY": 0
            },
            {
                "type": "fillRect,fillPixel,flipX,flipY",
                "x0": 0,
                "y0": 0,
                "x1": 16,
                "y1": 16,
                "hue": 33,
                "saturation": 100,
                "luminosity": 100,
                "alpha": 100,
                "hueMax": 0,
                "saturationMax": 0,
                "luminosityMax": 0,
                "alphaMax": 0,
                "width": 1,
                "height": 1,
                "widthMax": 0,
                "heightMax": 0,
                "count": 1,
                "countMax": 0,
                "chance": 0,
                "spread": 0,
                "wrapX": false,
                "wrapY": false
            }
        ]
    }
};

const Settings = {
    chunk: chunk,
    biomes: biomes,
    blocks: blocks,
    caves: caves,
    entities: entities,
    movement: movement,
    nearest: nearest,
    textures: textures,
};

export {Settings};
