class Verify {
    constructor() {
        this.game = new Game(20, 20);
        this.computer = new Computer(this.game);
    }

    go(iterations, input) {
        const weights = input.weights;
        const results = [];
        for (let i = 0; i < iterations; i++) {
            this.game.reset();
            while (this.game.lives > 0) {
                this.computer.step(weights);
            }
            results.push({
                points: this.game.points,
                age: this.game.age,
                cod: this.determineCod()
            });
        }
        const cod = results.map(r => r.cod).reduce((total, current) => {
            if (total[current]) {
                total[current]++;
            } else {
                total[current] = 1;
            }
            return total;
        }, {});
        Object.keys(cod).forEach(key => cod[key] = cod[key] / results.length);
        const summary = {
            points: {
                min: Math.min(...results.map(r => r.points)),
                avg: results.map(r => r.points).reduce((a, b) => a + b, 0) / results.length,
                max: Math.max(...results.map(r => r.points))
            },
            age: {
                min: Math.min(...results.map(r => r.age)),
                avg: results.map(r => r.age).reduce((a, b) => a + b, 0) / results.length,
                max: Math.max(...results.map(r => r.age))
            },
            cod: cod,
            input: input
        }
        if (this.publish) {
            this.publish(summary);
        }
        return summary;
    }

    determineCod() {
        const head = this.game.snake.getHead();
        const neck = this.game.snake.tail[this.game.snake.tail.length - 2];
        const lastHead = this.game.lastHead;
        if (!lastHead) {
            return "STARVED";
        } else if (lastHead.x < 0) {
            return "LEFT";
        } else if (lastHead.x >= this.game.width) {
            return "RIGHT";
        } else if (lastHead.y < 0) {
            return "UP";
        } else if (lastHead.y >= this.game.height) {
            return "DOWN";
        } else if (lastHead.x === neck.x && lastHead.y === neck.y) {
            return "NECK";
        } else {
            return "TAIL";
        }
    }
}
