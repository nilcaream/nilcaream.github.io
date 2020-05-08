class Computer {
    constructor(game) {
        this.game = game;
        this.normalization = Math.max(game.width, game.height);
    }

    calculateInput() {
        const head = this.game.snake.getHead();
        const distance = this.game.getDistance();
        return [
            1,
            distance / this.normalization,
            (head.x - this.game.apple.x) / this.normalization,
            (head.y - this.game.apple.y) / this.normalization,
            this.game.snake.isEmptySpot({ x: head.x + 1, y: head.y }),
            this.game.snake.isEmptySpot({ x: head.x - 1, y: head.y }),
            this.game.snake.isEmptySpot({ x: head.x, y: head.y + 1 }),
            this.game.snake.isEmptySpot({ x: head.x, y: head.y - 1 }),
        ];
    }

    step(weights) {
        const input = this.calculateInput();
        const output = Neural.calculateOutput(input, weights);
        const max = output.indexOf(Math.max(...output));
        this.game.step((max === 0) - (max === 1), (max === 2) - (max === 3));
    }
}
