class LearnProxy {
    constructor(worker, populationSize, generations, weights, logger = console.log, onEnd) {
        this.worker = worker;
        this.worker.onmessage = (event) => this.onmessage(event.data);
        this.logger = logger;
        this.onEnd = onEnd || (() => { });
        this.populationSize = populationSize;
        this.generations = generations;
        this.best = [];
        this.generation = 1;
        this.movesPerMs = 0;
        this.weights = weights;
        this.reset(populationSize, generations, weights);
    }

    onmessage(data) {
        // console.log("LearnProxy onmessage");
        // console.log(data);
        if (data.property) {
            this[data.property] = data.value;
        } else if (data.method) {
            this[data.method](...data.arguments);
        }
    }

    reset(...args) {
        this.worker.postMessage({
            method: "reset",
            arguments: args
        });
    }

    start() {
        this.worker.postMessage({
            method: "start",
            arguments: []
        });
    }

    stop() {
        this.worker.postMessage({
            method: "stop",
            arguments: []
        });
    }
}
