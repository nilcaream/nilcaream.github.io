class Computer {
    constructor(game) {
        this.game = game;
        this.normalization = Math.max(game.width, game.height);
    }

    calculateInput() {
        const head = this.game.snake.getHead();
        const distance = this.game.getDistance();
        const distances = this.game.snake.distanceToNonEmpty(this.game.width, this.game.height);
        return [
            1,
            Math.atan2(head.y - this.game.apple.y, head.x - this.game.apple.x),
            distance / this.normalization,
            this.game.snake.tail.length,
            this.game.lives,
            (head.x - this.game.apple.x) / this.game.width,
            (head.y - this.game.apple.y) / this.game.height,
            distances.xPositive / this.game.width,
            distances.xNegative / this.game.width,
            distances.yPositive / this.game.height,
            distances.yNegative / this.game.height,
            // this.game.snake.isEmptySpot({ x: head.x + 1, y: head.y }),
            // this.game.snake.isEmptySpot({ x: head.x - 1, y: head.y }),
            // this.game.snake.isEmptySpot({ x: head.x, y: head.y + 1 }),
            // this.game.snake.isEmptySpot({ x: head.x, y: head.y - 1 }),
        ];
    }

    step(weights) {
        const input = this.calculateInput();
        const layers = Neural.calculateLayers(input, weights);
        const output = layers[weights.length - 1];
        const max = output.indexOf(Math.max(...output));
        this.game.step((max === 0) - (max === 1), (max === 2) - (max === 3));
        return layers;
    }
}
