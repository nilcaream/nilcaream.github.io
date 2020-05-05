// heavily inspired by https://github.com/mlruzic/jake-the-snake 

class Neural {

    static calculateOutput(input, weights, f = Neural.sigmoid) {
        if (input.length !== weights[0].length) {
            throw "Invalid input length";
        }

        let layer = input.map((e, i) => f(e * weights[0][i][0]));

        for (let i = 1; i < weights.length; i++) {
            const outputs = [];
            for (let j = 0; j < weights[i].length; j++) {
                let output = 0;
                for (let k = 0; k < weights[i][j].length; k++) {
                    output += weights[i][j][k] * layer[k];
                }
                outputs.push(f(output));
            }
            layer = outputs;
        }

        return layer;
    }

    // neuronCounts - array of neron counts per layer e.g. [2,4,4,5]
    // returns array of per-layer arrays with weights where values are determined by value function
    static createWeights(neuronCounts, value) {
        const result = [];
        for (let i = 0; i < neuronCounts.length; i++) {
            const previousCount = neuronCounts[i - 1] || 1;
            const currentCount = neuronCounts[i];
            const layerWeights = [];
            for (let j = 0; j < currentCount; j++) {
                const weights = [];
                for (let k = 0; k < previousCount; k++) {
                    weights.push(value(i, j, k));
                }
                layerWeights.push(weights);
            }
            result.push(layerWeights);
        }
        return result;
    }

    static sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static test() {
        const assert = (actual, expected) => {
            const actualJson = JSON.stringify(actual);
            const expectedJson = JSON.stringify(expected);
            if (actualJson !== expectedJson) {
                throw `Fail: actual='${actualJson}', expected='${expectedJson}'`;
            }
        }
        // --------
        let x = 0;
        let weights = Neural.createWeights([2, 3, 4, 5], () => ++x);
        assert(weights, [[[1], [2]], [[3, 4], [5, 6], [7, 8]], [[9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20]], [[21, 22, 23, 24], [25, 26, 27, 28], [29, 30, 31, 32], [33, 34, 35, 36], [37, 38, 39, 40]]]);
        weights = Neural.createWeights([3, 2, 5], (i, j, k) => `${i}j${j}k${k}`);
        assert(weights, [[["0j0k0"], ["0j1k0"], ["0j2k0"]], [["1j0k0", "1j0k1", "1j0k2"], ["1j1k0", "1j1k1", "1j1k2"]], [["2j0k0", "2j0k1"], ["2j1k0", "2j1k1"], ["2j2k0", "2j2k1"], ["2j3k0", "2j3k1"], ["2j4k0", "2j4k1"]]]);
        weights = Neural.createWeights([3, 2, 2, 4], (i) => i);
        assert(weights, [[[0], [0], [0]], [[1, 1, 1], [1, 1, 1]], [[2, 2], [2, 2]], [[3, 3], [3, 3], [3, 3], [3, 3]]]);
        // --------
        x = 0;
        weights = Neural.createWeights([2, 3], () => ++x);
        let output = Neural.calculateOutput([-2, 2], weights, (x) => x);
        assert(output, [3 * (1 * -2) + 4 * (2 * 2), 5 * (1 * -2) + 6 * (2 * 2), 7 * (1 * -2) + 8 * (2 * 2)]);
        // --------
        x = 0;
        weights = Neural.createWeights([2, 3], () => ++x);
        output = Neural.calculateOutput([-2, 2], weights, (x) => 7 * x);
        assert(output, [7 * 3 * (7 * 1 * -2) + 7 * 4 * (7 * 2 * 2), 7 * 5 * (7 * 1 * -2) + 7 * 6 * (7 * 2 * 2), 7 * 7 * (7 * 1 * -2) + 7 * 8 * (7 * 2 * 2)]);
    }
}

Neural.test();
