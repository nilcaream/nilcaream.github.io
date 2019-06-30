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
        //this.ignitionsEven = this.createIgnitionsEven(this.tdcsZero720, this.evenAngleDiff);
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

    createIgnitionsEven(tdcsZero720, evenAngleDiff) {
        const find = (array, value) => {
            const found = [];
            array.forEach((element, index) => {
                if (element === value) {
                    found.push(index);
                }
            });
            return found;
        };

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

        const foundTdcsList = [];
        let alwaysFoundSomething = true;
        for (let angle = 0; angle < 720 && alwaysFoundSomething; angle += evenAngleDiff) {
            const foundTdcs = find(tdcsZero720, angle);
            alwaysFoundSomething = alwaysFoundSomething && foundTdcs.length > 0;
            foundTdcsList.push(foundTdcs);
        }

        const results = [];
        if (alwaysFoundSomething) {
            console.log(this.name + " " + evenAngleDiff);
            const normalizedResults = foundTdcsList.map(a => a.map(b => 1 + b % (tdcsZero720.length / 2)));

            // ensure that first bucket contains only first cylinder
            const input = enforceValue(normalizedResults, normalizedResults[0][0], 0);

            expand(input, array => {
                if (is1d(array)) {
                    const flat = flatten(array);
                    if (results.indexOf(flat) === -1) {
                        console.log("R: " + JSON.stringify(array));
                        results.push(flat);
                    }
                }
            });

        } else {
            console.log("Not found");
        }

        return results.map(a => a.split(""));
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