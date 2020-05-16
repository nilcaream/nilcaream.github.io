class Learn {
    constructor() {
        this.game = new Game(20, 20);
        this.computer = new Computer(this.game);
        this.boardSize = Math.max(this.game.width, this.game.height);
        this.ageWeight = 10 * Math.max(this.game.width, this.game.height);
        this.network = [this.computer.inputLength(), this.computer.inputLength(), this.computer.inputLength(), this.computer.inputLength(), this.computer.outputLength()];
        this.running = false;
        this.logger = console.log;
        this.randomRange = 256;
    }

    random() {
        return Math.random() * this.randomRange - this.randomRange / 2;
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
        this.running = true;
        setTimeout(() => {
            this.run(1);
            if (this.generation < this.generations && this.running) {
                this.start();
            } else {
                this.stop();
                this.end();
            }
        }, 10);
    }

    stop() {
        this.running = false;
    }

    end() {
        this.logger("--------------------- end");
        this.best.slice(0, 32).forEach(best => this.log(best));
    }

    getScore() {
        const genFactor = (this.boardSize - this.game.points) / this.boardSize;
        return this.game.points + Math.max(0, genFactor) * this.game.age / this.ageWeight;
    }

    run(totalTries = 1) {
        const results = [];
        for (let p = 0; p < this.populationSize; p++) {

            const tries = [];
            for (let t = 0; t < totalTries; t++) {
                this.game.reset();
                while (this.game.lives > 0) {
                    this.moves++;
                    this.computer.step(this.weights[p]);
                }
                tries.push({
                    score: this.getScore(),
                    points: this.game.points,
                    age: this.game.age
                });
            }
            tries.sort((a, b) => b.score - a.score);

            const average = tries[Math.floor(totalTries / 2)];
            results.push({
                score: average.score,
                points: average.points,
                age: average.age,
                generation: this.generation,
                weights: this.weights[p] //Neural.copyWeights(this.weights[p])
            });
        }
        results.sort((a, b) => b.score - a.score);
        this.updateBest(results.slice(0, 0.1 * this.populationSize));
        this.weights = this.prepareNewWeights(results);
        this.movesPerMs = this.moves / (new Date().getTime() - this.time);
        this.moves = 0;
        this.time = new Date().getTime();
        this.generation++;
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
            weights[i] = Genetic.crossover(weightsA, weightsB, () => Math.random() > 0.5, (x) => Math.random() > 0.05 ? x : this.random());
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

        if (currentBest && currentBest.score !== this.best[0].score) {
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
