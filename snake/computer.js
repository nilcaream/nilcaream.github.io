class Computer {
    constructor(game) {
        this.game = game;
    }

    // returns [bias, appleDistance, dxPositiveEmpty, dxNegativeEmpty, dyPositiveEmpty, dyNegativeEmpty]
    calculateInput() {
        const head = this.game.snake.getHead();
        const distance = this.game.getDistance();
        return [
            1,
            distance,
            head.x === this.game.apple.x ? 1 : 0,
            head.y === this.game.apple.y ? 1 : 0,
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
