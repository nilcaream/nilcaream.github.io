class Learn {
    constructor(populationSize, generations, onEnd, weights = [], logger = console.log) {
        this.weights = weights;
        this.populationSize = populationSize;
        this.generations = generations;
        this.game = new Game(20, 20);
        this.computer = new Computer(this.game);
        this.logger = logger;
        this.best = [];
        this.onEnd = onEnd || (() => { });

        this.generation = 1;
        while (this.weights.length < populationSize) {
            this.weights.push(Neural.createWeights([8, 8, 8, 4], () => Math.random() * 100 - 50));
        }
    }

    start() {
        const packSize = 4;
        setTimeout(() => {
            this.run(packSize);
            if (this.generation < this.generations) {
                this.start();
            } else {
                this.end();
            }
        }, 0);
    }

    end() {
        this.logger("---------------------");
        this.best.forEach(best => this.log(best));
        this.onEnd(this.best);
    }

    getScore() {
        return this.game.points * 800 + this.game.age;
    }

    run(steps = 1) {
        for (let r = 0; r < steps; r++) {
            const results = [];
            for (let p = 0; p < this.populationSize; p++) {
                this.game.reset();
                while (this.game.lives > 0) {
                    this.computer.step(this.weights[p]);
                }
                results.push({
                    score: this.getScore(),
                    points: this.game.points,
                    age: this.game.age,
                    generation: this.generation,
                    weights: Neural.copyWeights(this.weights[p])
                });
            }
            results.sort((a, b) => b.score - a.score);
            this.updateBest(results);
            this.weights = this.prepareNewWeights(results);
            if (this.generation % 100 === 0) {
                this.logger(`generation:${this.generation}`);
            }
            this.generation++;
        }
    }

    log(result) {
        this.logger(`generation:${result.generation}, score:${result.score}, points:${result.points}, age:${result.age}`);
    }

    prepareNewWeights(results) {
        const weights = [];
        this.best.slice(0, 0.1 * this.populationSize).forEach(best => weights.push(best.weights));
        results.slice(0, 0.4 * this.populationSize).forEach(result => weights.push(result.weights));
        while (weights.length < this.populationSize) {
            weights.push(results[(Math.random() * this.populationSize * 0.7) | 0].weights);
        }
        for (let i = weights.length - 1; i > 0.5 * this.populationSize; i--) {
            const weightsA = weights[(Math.random() * this.populationSize * 0.5) | 0];
            const weightsB = weights[(Math.random() * this.populationSize * 0.7) | 0];
            weights[i] = Genetic.crossover(weightsA, weightsB, () => Math.random() > 0.5, (x) => Math.random() > 0.05 ? x : Math.random() * 100 - 50);
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
            weights: Neural.copyWeights(result.weights)
        }));
        this.best.sort((a, b) => b.score - a.score);
        this.best.splice(64);

        if ((currentBest || {}).score !== this.best[0].score) {
            this.log(this.best[0]);
        }
    }
}
