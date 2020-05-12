class Learn {
    constructor(populationSize, generations, weights, logger = console.log, onEnd) {
        this.game = new Game(20, 20);
        this.computer = new Computer(this.game);
        this.logger = logger;
        this.onEnd = onEnd || (() => { });
        this.ageWeight = 10 * Math.max(this.game.width, this.game.height);
        this.network = [11, 8, 8, 4];
        this.reset(populationSize, generations, weights);
    }

    random() {
        return Math.random() * 512 - 256;
    }

    reset(populationSize, generations, weights) {
        this.weights = Neural.copyWeights(weights || this.weights || []).filter(weight => {
            const lenghts = weight.map(w => w.length);
            for (let i = 0; i < Math.min(lenghts.length, this.network.length); i++) {
                if (lenghts[i] !== this.network[i]) {
                    return false;
                }
            }
            return lenghts.length === this.network.length;
        });
        this.populationSize = populationSize || this.populationSize || 500;
        this.generations = generations || this.generations || 1000;
        this.best = [];
        this.generation = 1;
        this.game.reset();
        this.moves = 0;
        this.movesPerMs = 0;
        this.time = new Date().getTime();
        this.logger(`--------------------- reset p:${this.populationSize} g:${this.generations} w:${this.weights.length}`);
        while (this.weights.length < this.populationSize) {
            this.weights.push(Neural.createWeights(this.network, () => this.random()));
        }
    }

    start() {
        setTimeout(() => {
            this.run(1);
            if (this.generation < this.generations) {
                this.start();
            } else {
                this.end();
            }
        }, 10);
    }

    end() {
        this.logger("--------------------- end");
        this.best.slice(0, 32).forEach(best => this.log(best));
        this.onEnd(this.best);
    }

    getScore() {
        return this.game.points + this.game.age / this.ageWeight;
    }

    run(steps = 1) {
        for (let r = 0; r < steps; r++) {
            const results = [];
            for (let p = 0; p < this.populationSize; p++) {
                this.game.reset();
                while (this.game.lives > 0) {
                    this.moves++;
                    this.computer.step(this.weights[p]);
                }
                results.push({
                    score: this.getScore(),
                    points: this.game.points,
                    age: this.game.age,
                    generation: this.generation,
                    weights: this.weights[p] //Neural.copyWeights(this.weights[p])
                });
            }
            results.sort((a, b) => b.score - a.score);
            this.updateBest(results.slice(0, 0.1 * this.populationSize));
            this.weights = this.prepareNewWeights(results);
            if (this.generation % 10 === 0) {
                this.movesPerMs = this.moves / (new Date().getTime() - this.time);
                this.moves = 0;
                this.time = new Date().getTime();
            }
            this.generation++;
        }
    }

    log(result) {
        this.logger(`generation:${result.generation}, score:${result.score.toFixed(2)}, points:${result.points}, age:${result.age}, id:${Learn.identify(result)}`);
    }

    prepareNewWeights(results) {
        const weights = [];
        this.best.slice(0, 0.1 * this.populationSize).forEach(best => weights.push(best.weights));
        results.slice(0, 0.4 * this.populationSize).forEach(result => weights.push(result.weights));
        while (weights.length < this.populationSize) {
            weights.push(results[(Math.random() * this.populationSize * 0.75) | 0].weights);
        }
        for (let i = weights.length - 1; i > 0.5 * this.populationSize; i--) {
            const weightsA = weights[(Math.random() * 0.5 * this.populationSize) | 0];
            const weightsB = weights[(Math.random() * this.populationSize) | 0];
            weights[i] = Genetic.crossover(weightsA, weightsB, () => Math.random() > 0.75, (x) => Math.random() > 0.01 ? x : this.random());
        }
        return weights;
    }

    updateBest(results) {
        const currentBest = this.best[0];

        results.forEach(result => this.best.push({
            score: result.score,
            points: result.points,
            age: result.age,
            generation: result.generation,
            weights: Neural.copyWeights(result.weights),
            id: Learn.hash(result.weights)
        }));
        this.best.sort((a, b) => b.score - a.score);
        this.best.splice(0.25 * this.populationSize);

        if ((currentBest || {}).score !== this.best[0].score) {
            this.log(this.best[0]);
        }
    }

    // https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript#comment67396297_6122571
    static hash(weights) {
        const b = JSON.stringify(weights);
        for (var a = 0, c = b.length; c--;)a += b.charCodeAt(c), a += a << 10, a ^= a >> 6; a += a << 3; a ^= a >> 11; return ((a + (a << 15) & 4294967295) >>> 0).toString(16)
    };

    static identify(result) {
        return `${Learn.hash(result.weights)}:p${result.points}:a${result.age}`;
    }
}
