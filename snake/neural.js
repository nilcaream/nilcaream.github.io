// heavily inspired by https://github.com/mlruzic/jake-the-snake 

class Neural {
    constructor(weights) {
        this.weights = weights;
    }

    calculateOutput(input) {
        if (input.length !== this.weights[0].length) {
            throw "Invalid input length";
        }

        const f = Neural.sigmoid;
        let layer = input.map((e, i) => f(e * this.weights[0][i][0]));

        //console.log(layer);
        for (let i = 1; i < this.weights.length; i++) {
            const outputs = [];
            for (let j = 0; j < this.weights[i].length; j++) {
                let output = 0;
                for (let k = 0; k < this.weights[i][j].length; k++) {
                    output += this.weights[i][j][k] * layer[k];
                    //console.log(`w(${i}${j}${k})=${this.weights[i][j][k]} p(k)=${layer[k]}`);
                }
                outputs.push(f(output));
            }
            //console.log(outputs);
            layer = outputs;
        }

        return layer;
    }

    // neuronCounts - array of neron counts per layer e.g. [2,4,4,5]
    // returns array of per-layer arrays with weights 
    static randomWeights(neuronCounts) {
        const result = [];
        for (let i = 0; i < neuronCounts.length; i++) {
            const previousCount = neuronCounts[i - 1] || 1;
            const currentCount = neuronCounts[i];
            const layerWeights = [];
            for (let j = 0; j < currentCount; j++) {
                const weights = [];
                for (let k = 0; k < previousCount; k++) {
                    weights.push(Math.random() * 100 - 50);
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
}
