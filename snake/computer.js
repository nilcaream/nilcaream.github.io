class Computer {
    constructor(game, neural) {
        this.game = game;
        this.neural = neural;
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

    run() {
        while (this.game.lives > 0) {
            const input = this.calculateInput();
            //console.log(input);
            const output = this.neural.calculateOutput(input);
            //console.log(output);
            const max = output.indexOf(Math.max(...output));
            this.game.step((max === 0) - (max === 1), (max === 2) - (max === 3));
        }
        return this.game.points * 100 + this.game.age;
    }
}
