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
        // this.ignitionsEven = this.createIgnitionsEven();
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

    createIgnitionsEven() {
        const results = [];
        console.log(this.name + " even angle diff: " + this.evenAngleDiff);
        Engine.permute(Engine.range(1, this.tdcs.length - 1), array => {
            let ok = true;
            console.log("-------------");
            array.map(i => this.tdcsZero[i]).forEach((currentAngle, index) => {
                const expectedAngle = this.evenAngleDiff * (index + 1);
                ok = ok && (currentAngle === expectedAngle % 360);
                console.log("1," + array.map(a => a + 1) + " " + (index + 1) + " current: " + currentAngle + ", expected: " + expectedAngle % 360 + " (" + expectedAngle + "), ok: " + ok);
            });
            // for (let angle = gap, i = 1; angle < 720 && ok; angle += gap, i++) {
            //     ok = ok && ((angle % 360) === this.tdcsZero[i]);
            //     console.log("0," + array + " " + (angle % 360) + " " + this.tdcsZero[i] + " " + ok + " " + i);
            // }
            if (ok) {
                results.push([1, ...array.map(a => a + 1)]);
                console.log([1, ...array.map(a => a + 1)] + " ===================");
            }
            //console.log("------");
        });
        return results;
    }

    doStuff(tdcsZero720, tdcsZero) {
        const angleDiffs = new Set();
        tdcsZero720.forEach(tdcs1 => {
            tdcsZero720.forEach(tdcs2 => {
                angleDiffs.add(Math.abs(tdcs1 - tdcs2));
            });
        });
        angleDiffs.delete(0);

        const angleDiffsArray = Array.from(angleDiffs);
        console.log(angleDiffs);

        for (let anglesCount = 1; anglesCount <= 4; anglesCount++) {
            console.log(">>>>>>>>>>>>");
            const angles = Combinations.kCombinations(angleDiffsArray, anglesCount);
            console.log(angles);
            angles.forEach(ang => {
                console.log("::::::::::::::");
                Combinations.permutation(ang, p => {
                    const res = [0];
                    for (let x = 1; x < tdcsZero720.length / 2 - 1; x++) {
                        res.push(res[x - 1] + p[x % p.length]);
                    }
                    console.log(res);
                });
            });
            // Combinations.permutation(angles, anglesPermutation => {
            //     for (let ang = 0, i = 0; i < tdcsZero720.length / 2; i++) {
            //         console.log(i + " " + ang);
            //         ang += anglesPermutation[i % anglesPermutation.length];
            //     }
            // });
        }

    }

    createIgnitionsUneven() {
        const results = [];


        /*
        Engine.permute(Engine.range(1, this.tdcs.length - 1), array => {
            let ok = true;
            console.log("-------------");
            array.map(i => this.tdcsZero[i]).forEach((currentAngle, index) => {
                const expectedAngle = this.evenAngleDiff * (index + 1);
                ok = ok && (currentAngle === expectedAngle % 360);
                console.log("1," + array.map(a => a + 1) + " " + (index + 1) + " current: " + currentAngle + ", expected: " + expectedAngle % 360 + " (" + expectedAngle + "), ok: " + ok);
            });
            // for (let angle = gap, i = 1; angle < 720 && ok; angle += gap, i++) {
            //     ok = ok && ((angle % 360) === this.tdcsZero[i]);
            //     console.log("0," + array + " " + (angle % 360) + " " + this.tdcsZero[i] + " " + ok + " " + i);
            // }
            if (ok) {
                results.push([1, ...array.map(a => a + 1)]);
                console.log([1, ...array.map(a => a + 1)] + " ===================");
            }
            //console.log("------");
        });
        return results;

        // ============================

        const diffs = [];
        this.tdcsZero.forEach(tdc1 => {
            this.tdcsZero.forEach(tdc2 => {
                let diff = tdc1 - tdc2;
                diff = diff >= 0 ? diff : 360 - diff;
                if (diff !== 0 && diff !== this.evenAngleDiff && diffs.indexOf(diff) === -1) {
                    diffs.push(diff);
                }
            });
        });
        diffs.sort();
        console.log(this.name + " uneven angle diffs: " + diffs);
        */
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

    // https://stackoverflow.com/a/37580979
    static permute(input, callback) {
        callback(input);
        let length = input.length,
            c = new Array(length).fill(0),
            i = 1, k, p;

        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = input[i];
                input[i] = input[k];
                input[k] = p;
                ++c[i];
                i = 1;
                callback(input);
            } else {
                c[i] = 0;
                ++i;
            }
        }
    };

    static range(from, to) {
        const result = [];
        for (let i = from; i <= to; i++) {
            result.push(i);
        }
        return result;
    };

    getCharacteristics2() {
        const rodsPerPin = this.banks.length / this.crankpins;
        const topDeadCenters = [];
        const bottomDeadCenters = [];

        for (let i = 0; i < this.crankshaft.length; i += rodsPerPin) {
            for (let j = 0; j < rodsPerPin; j++) {
                topDeadCenters.push((720 + this.crankshaft[i + j] + this.banks[i + j]) % 360);
                bottomDeadCenters.push((topDeadCenters[i + j] + 180) % 360);
            }
        }

        console.log(topDeadCenters);
    }

    getCharacteristics() {
        const results = {
            initCrankshaftAngles: [],
            topDeadCenters: [],
            bottomDeadCenters: [],
            ignitions: []
        };
        const cylindersPerPin = this.banks.length / this.crankpins;

        this.crankshaft.forEach((element, index) => {
            results.initCrankshaftAngles.push((720 + element) % 720);
        });
        for (let i = 0; i < results.initCrankshaftAngles.length; i += cylindersPerPin) {
            for (let j = 0; j < cylindersPerPin; j++) {
                results.topDeadCenters.push((720 + results.initCrankshaftAngles[i + j] + this.banks[i + j]) % 360);
                results.bottomDeadCenters.push((results.topDeadCenters[i + j] + 180) % 360);
            }
        }

        const cylinderNumbers = (angle) => {
            const res = [];
            results.topDeadCenters.forEach((tdcAngle, index) => {
                if (tdcAngle === angle) {
                    res.push(index);
                }
            });
            return res;
        };

        for (let i = 0; i < results.topDeadCenters.length * 2; i += 1) {
            let tdc = results.topDeadCenters[i % results.topDeadCenters.length];
            if (i >= results.topDeadCenters.length) {
                tdc += 360;
            }
            console.log(tdc);
            results.ignitions.push(cylinderNumbers(tdc % 360));
        }

        // ------------------------------------------

        const isUnique = (arrayOfArrays0, arrayOfArrays1) => {
            let same = arrayOfArrays0.length === arrayOfArrays1.length;
            arrayOfArrays0.forEach((a0, i0) => {
                same = same && a0 === arrayOfArrays1[i0];
            });
            return !same;
        };

        const tdcDifferences = [];
        for (let i = 0; i < results.topDeadCenters.length; i += 1) {
            for (let j = 0; j < results.topDeadCenters.length; j += 1) {
                const difference = Math.abs(results.topDeadCenters[i] - results.topDeadCenters[j]);
                if (difference > 0 && tdcDifferences.indexOf(difference) === -1) {
                    tdcDifferences.push(difference);
                    console.log("tdc difference " + difference);
                }
            }
        }

        const uniqueTopDeadCenters = [];
        results.topDeadCenters.forEach((tdc) => {
            if (uniqueTopDeadCenters.indexOf(tdc) === -1) {
                uniqueTopDeadCenters.push(tdc);
                console.log("unique tdc " + tdc);
            }
        });

        const validOrders = [];
        tdcDifferences.forEach((tdcDiff) => {
            uniqueTopDeadCenters.forEach((tdc) => {
                const testCylinderNumbers = [];

                for (let angle = tdc, i = 0; i < results.topDeadCenters.length; angle = (angle + tdcDiff) % 360, i++) {
                    const cNumbers = cylinderNumbers(angle);
                    if (cNumbers) {
                        testCylinderNumbers.push(cNumbers);
                    }
                }
                const res1 = [];
                const res2 = [];
                testCylinderNumbers.forEach((cNumbers) => {
                    cNumbers.forEach((cn) => {
                        if (res1.indexOf(cn) === -1) {
                            res1.push(cn);
                        } else if (res2.indexOf(cn) === -1) {
                            res2.push(cn);
                        }
                    });
                });
                const ok = res1.length === res2.length && res1.length === results.topDeadCenters.length;
                console.log("tdc difference: " + tdcDiff + ", start tdc: " + tdc + ", res1.len: " + res1.length + ", res2.len: " + res2.length + ", OK: " + ok);
                if (ok && testCylinderNumbers[0].indexOf(0) !== -1) {
                    console.log(testCylinderNumbers);
                    let addNewValidOrder = true;
                    validOrders.forEach((validOrder) => {
                        addNewValidOrder = addNewValidOrder && isUnique(validOrder, testCylinderNumbers);
                    });
                    if (addNewValidOrder) {
                        validOrders.push(testCylinderNumbers);
                        console.log("added new valid order");
                    }
                }
            });
        });

        // ------------------------------------------

        // https://stackoverflow.com/a/37580979
        let permute = (input, callback) => {
            let length = input.length,
                c = new Array(length).fill(0),
                i = 1, k, p;

            while (i < length) {
                if (c[i] < i) {
                    k = i % 2 && c[i];
                    p = input[i];
                    input[i] = input[k];
                    input[k] = p;
                    ++c[i];
                    i = 1;
                    callback(input);
                } else {
                    c[i] = 0;
                    ++i;
                }
            }
        };

        const range = (from, to) => {
            const result = [];
            for (let i = from; i <= to; i++) {
                result.push(i);
            }
            return result;
        };

        console.log("======================================== firing orders");
        permute(range(1, this.crankshaft.length - 1), array => {
            let ok = true;
            let tdc = results.topDeadCenters[0];

            const diffs = [];

            for (let i = 0; i < array.length && ok; i++) {
                const next = results.topDeadCenters[array[i]];
                let diff = (720 + tdc - next) % 360;

                ok = ok && diff > 0;
                if (diffs.indexOf(diff) === -1) {
                    diffs.push(diff);
                }
                tdc = next;
            }

            if (ok && diffs.length === 1) {
                console.log("ok: " + ok + " diffs.len: " + diffs.length + " diffs: " + diffs + " array: 1," + array.map(a => a + 1));
            }
        });

        console.log("======================================== firing intervals");

        const tdcs = [];
        for (let r = 0; r < 2; r++) {
            for (let i = 0; i < this.crankshaft.length; i += cylindersPerPin) {
                for (let j = 0; j < cylindersPerPin; j++) {
                    tdcs.push((360 + this.crankshaft[i + j] + this.banks[i + j] + r * 360) % 720);
                }
            }
        }
        tdcs.sort();
        console.log(tdcs);

        const cylindersNumber = tdcs.length / 2;

        permute(tdcs.splice(1), array => {
            let ok = true;
            let tdc = tdcs[0];

            const deltas = [];
            for (let i = 0; i < array.length && ok; i++) {
                let delta = array[i] - tdc;

                ok = ok && delta > 0;
                if (deltas.indexOf(delta) === -1) {
                    deltas.push(delta);
                }
                tdc = array[i];
            }

            if (ok) {
                console.log(tdcs[0] + "," + array);
            }
        });

        console.log(results);
    }
}