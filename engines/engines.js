'use strict';

class Engines {
    constructor() {
    }

    init() {
        const dis = this;
        return fetch('settings.json')
            .then(function (response) {
                return response.json();
            }).then((json) => {
                dis.settings = json;
                dis.current = new Configuration(dis.settings.configurations[3]);
                console.log(dis.current.name);
            });
    }
}

class Configuration {
    constructor(source) {
        this.name = source.name;
        this.banks = source.banks;
        this.crankshaft = source.crankshaft;
        this.crankpins = source.crankpins;
        this.firingOrder = source.firingOrder;
        this.numbering = source.numbering;
        this.rpm = 5;
        this.spark = 0;
        this.offset = 0;
        this.started = 1;
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

        permute([1, 2, 3, 4, 5, 6, 7], array => {
            let ok = true;
            let tdc = results.topDeadCenters[0];

            const diffs = [];

            for (let i = 0; i < array.length && ok; i++) {
                const next = results.topDeadCenters[array[this.numbering[i] - 1]];
                const diff = (720 + tdc - next) % 360;
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
        console.log(results);
    }

}