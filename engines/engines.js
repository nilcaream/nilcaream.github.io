'use strict';

class EnginesProvider {
    constructor() {
        this.engines = {};
    }

    init() {
        const dis = this;
        return fetch('settings.json')
            .then(function (response) {
                return response.json();
            }).then((json) => {
                dis.settings = json;
                dis.settings.engines.forEach(engines => {
                    const engine = new Engine(engines);
                    dis.engines[engine.name] = engine;
                });
                console.log("Initialized engines");
                console.log(dis.engines);
            });
    }

    get(name) {
        return this.engines[name];
    }

    getAll() {
        return Object.keys(this.engines).map(name => this.engines[name]);
    }

}

class Engine {
    constructor(source) {
        this.name = source.name;
        this.numbering = source.numbering;
        this.cylinders = source.numbering.length;
        this.crankpins = source.crankshaft.length;
        this.crankpinsPerRod = this.cylinders / this.crankpins;
        this.banks = Engine._loop(source.banks || [0], this.cylinders);
        this.splitPins = Engine._loop(source.splitPins || [0], this.cylinders);
        this.crankshaft = source.crankshaft;
        this.crankshaftZero = this.createCrankshaftZero();
        this.tdcs = this.createTdcs(this.crankshaftZero, this.banks);
        this.tdcsZero = this.createTdcsZero(this.tdcs);
        this.tdcsZero720 = this.createTdcsZero720(this.tdcsZero);
        this.bdcs = this.createBdcs();
        this.evenAngleDiff = 720 / this.tdcs.length;
        this.ignitionsEven = this.createIgnitionsEven(this.tdcsZero720, this.evenAngleDiff);
        this.ignitionsEvenBanks = this.ignitionsEven.map(setup => this.createBanksOrder(setup, this.banks));
        this.ignitionsUneven = this.createIgnitionsUneven(this.tdcsZero720);
        this.ignitionsUnevenBanks = this.ignitionsUneven.map(setup => this.createBanksOrder(setup, this.banks));
    }

    static _duplicate(array, count) {
        const result = [];
        array.forEach(element => {
            for (let i = 0; i < count; i++) {
                result.push(element);
            }
        });
        return result;
    }

    static _loop(array, length) {
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(array[i % array.length]);
        }
        return result;
    }

    createBanksOrder(ignitions, banks) {
        const banksCount = new Set(banks).size;
        const bankIds = banksCount === 1 ? ["C"] : banksCount === 2 ? ["L", "R"] : banksCount === 3 ? ["L", "C", "R"] : Combinations.range(1, banksCount).map(x => "B" + x);
        const angles = Object.keys(ignitions).sort((x, y) => x - y);
        return angles.map(angle => ignitions[angle] - 1).map(cylinderNumber => bankIds[cylinderNumber % bankIds.length]);
    }

    createTdcs(crankshaftZero, banks) {
        return crankshaftZero.map((angle, index) => {
            const tdc = (360 - angle + banks[index]) % 360;
            return tdc < 0 ? 360 + tdc : tdc;
        });
    }

    createTdcsZero(tdcs) {
        return tdcs.map(angle => {
            const tdcsZero = angle - tdcs[0];
            return tdcsZero < 0 ? 360 + tdcsZero : tdcsZero;
        });
    }

    createTdcsZero720(tdcsZero) {
        const result = [...tdcsZero];
        tdcsZero.forEach(angle => {
            result.push(360 + angle);
        });
        return result;
    }

    createBdcs() {
        return this.tdcs.map(angle => {
            return (180 + angle) % 360;
        });
    }

    createTdcsAtAngles(tdcsZero720, angleDiffs) {
        const find = (array, value) => {
            const found = [];
            array.forEach((element, index) => {
                if (element === value) {
                    found.push(index);
                }
            });
            return found;
        };

        const results = [];
        // i=-1 because second stoke is the first angle difference
        for (let angle = 0, i = -1; angle < 720; i++, angle += angleDiffs[i % angleDiffs.length]) {
            const foundTdcs = find(tdcsZero720, angle);
            console.log(this.name + ", tdcs[" + angle + "]: " + JSON.stringify(foundTdcs));
            // if (foundTdcs.length > 0) {
            results.push(foundTdcs);
            // }
        }
        return results;
    }

    createIgnitions(tdcsZero720, angleDiffs) {
        const deepCopy = array => {
            const result = [];
            array.forEach(elements => {
                const internal = [];
                elements.forEach(element => internal.push(element));
                result.push(internal);
            });
            return result;
        };

        // enforceValue([[3,4,5],[],[6,4],[4]], 4, 1) === [[3,5],[4],[6],[]]
        const enforceValue = (array, value, position) => {
            const result = deepCopy(array).map(e => e.filter(a => a !== value));
            result[position] = [value];
            return result;
        };

        const flatten = arrays => arrays.reduce((x, y) => x + y[0], "");

        const is1d = arrays => arrays.reduce((x, y) => x && y.length === 1, true);

        const reduceDepth = arrays => arrays.map(a => a[0]);

        const areAllNotEmpty = arrays => arrays.reduce((x, y) => x && y.length > 0, true);

        const hasNoDuplicates = arrays => {
            const reduced = reduceDepth(arrays);
            return reduced.reduce((x, y) => x && reduced.indexOf(y) === reduced.lastIndexOf(y), true);
        };

        const expand = (array, callback = x => x) => {
            if (is1d(array)) {
                callback(array);
            } else {
                array.forEach((external, eI) => {
                    if (external.length > 1) {
                        external.forEach((internal, iI) => {
                            const result = enforceValue(array, internal, eI);
                            callback(result);
                            expand(result, callback)
                        });
                    }
                });
            }
        };

        const foundTdcsList = this.createTdcsAtAngles(tdcsZero720, angleDiffs);
        console.log(this.name + ", foundTdcs: " + JSON.stringify(foundTdcsList));

        const flatResults = [];
        const results = [];

        if (foundTdcsList.length === tdcsZero720.length / 2 && areAllNotEmpty(foundTdcsList)) {
            // console.log(this.name + ", angleDiffs: " + angleDiffs.join(","));
            const normalizedResults = foundTdcsList.map(a => a.map(b => 1 + b % (tdcsZero720.length / 2)));

            expand(normalizedResults, array => {
                if (is1d(array) && hasNoDuplicates(array)) {
                    const setup = {};
                    for (let angle = 0, i = 0; i < tdcsZero720.length / 2; i++, angle += angleDiffs[(i - 1) % angleDiffs.length]) {
                        setup[angle] = array[i][0];
                    }
                    const flat = JSON.stringify(setup);

                    if (flatResults.indexOf(flat) === -1 && setup[0] === 1) {
                        console.log(this.name + ", angleDiffs: " + angleDiffs.join(",") + ", ignitions: " + array.join(",") + ", setup: " + flat);
                        flatResults.push(flat);
                        results.push(setup);
                    }
                }
            });
        } else {
            console.log(this.name + ", invalid length or empty tdcs");
        }
        return results;
    }

    createIgnitionsEven(tdcsZero720, evenAngleDiff) {
        return this.createIgnitions(tdcsZero720, [evenAngleDiff]);
    }

    createIgnitionsUneven(tdcsZero720) {
        const tdcsDiffs = [];

        tdcsZero720.forEach(a => {
            tdcsZero720.forEach(b => {
                let diff = a - b;
                if (diff < 0) {
                    diff = 360 - diff;
                }
                diff = diff % 720;
                if (diff > 0 && tdcsDiffs.indexOf(diff) === -1) {
                    tdcsDiffs.push(diff);
                }
            });

        });

        tdcsDiffs.sort((x, y) => x - y);
        console.log(this.name + ", TDC angle differences: " + tdcsDiffs.join(","));

        const flatResults = [];
        const results = [];
        Combinations.kCombinations(tdcsDiffs, 2).forEach(tdcsDiff => {
            Combinations.permutation(tdcsDiff, tdcsDiffsPermutation => {
                console.log(this.name + ", possible angles: " + tdcsDiffsPermutation.join(","));
                const partialResults = this.createIgnitions(tdcsZero720, tdcsDiffsPermutation);
                partialResults.forEach(partialResult => {
                    const flatResult = JSON.stringify(partialResult);
                    if (flatResults.indexOf(flatResult) === -1) {
                        flatResults.push(flatResult);
                        results.push(partialResult);
                    }
                });
            });
        });

        return results;
    }

    createCrankshaftZero() {
        const results = [];
        Engine._duplicate(this.crankshaft, this.cylinders / this.crankshaft.length).forEach((angle, index) => {
            results.push((360 + angle + this.splitPins[index]) % 360);
        });
        return results;
    }

    calculateAngle(offset = 0) {
        const results = [];
        this.crankshaftZero.forEach((angle, index) => {
            results.push((360 + offset + angle + this.banks[index] + this.splitPins[index]) % 360);
        });
        return results;
    }

    getCrankshaftAngles(timestamp, zeroOnTop = false) {
        const result = [];
        this.crankshaft.forEach((element, index) => {
            result.push((this.offset + 720 - zeroOnTop * 90 + element + 360 * this.started * timestamp * this.rpm / 60000) % 720);
        });
        return result;
    }

    increaseOffset(delta) {
        this.offset += delta;
    }

    pause() {
        this.started = (this.started + 1) % 2;
    }
}