class Computer {
    constructor(game) {
        this.game = game;
        this.diagonal = Math.sqrt(game.width * game.width + game.height * game.height);
    }

    // returns [bias, appleDistance, dxPositiveEmpty, dxNegativeEmpty, dyPositiveEmpty, dyNegativeEmpty]
    calculateInput() {
        const head = this.game.snake.getHead();
        return [
            1,
            Math.hypot(this.game.apple.x - head.x, this.game.apple.y - head.y) / this.diagonal,
            this.game.snake.contains({ x: head.x + 1, y: head.y }) || head.x + 1 === this.game.width ? 0 : 1,
            this.game.snake.contains({ x: head.x - 1, y: head.y }) || head.x - 1 === 0 ? 0 : 1,
            this.game.snake.contains({ x: head.x, y: head.y + 1 }) || head.y + 1 === this.game.height ? 0 : 1,
            this.game.snake.contains({ x: head.x, y: head.y - 1 }) || head.y - 1 === 0 ? 0 : 1
        ];
    }

    step(weights) {
        const input = this.calculateInput();
        const output = Neural.calculateOutput(input, weights);
        const max = output.indexOf(Math.max(...output));
        this.game.step((max === 0) - (max === 1), (max === 2) - (max === 3));
    }
}
