class Computer {
    constructor(game) {
        this.game = game;
        this.normalization = Math.max(game.width, game.height);
        this.position = { x: 0, y: 1 };
    }

    inputLength() {
        return 7;
    }

    outputLength() {
        return 4;
    }

    calculateInput() {
        const head = this.game.snake.getHead();
        const distance = this.game.getDistance();
        const distances = this.game.snake.distanceToNonEmpty(this.game.width, this.game.height);
        return [
            Math.atan2(head.y - this.game.apple.y, head.x - this.game.apple.x) / Math.PI,
            (head.x - this.game.apple.x) / this.game.width,
            (head.y - this.game.apple.y) / this.game.height,
            distances.xPositive / this.game.width,
            distances.xNegative / this.game.width,
            distances.yPositive / this.game.height,
            distances.yNegative / this.game.height
        ];
    }

    step(weights) {
        const input = this.calculateInput();
        const layers = Neural.calculateLayers(input, weights);
        const output = layers[weights.length - 1];
        const m = Math.max(...output);

        const offset = input.length - 4;
        const res = output
            .map((outputValue, index) => {
                return {
                    outputValue: outputValue === m ? m : 0,
                    inputValue: input[offset + index],
                    index: index
                }
            })
            .filter(o => o.outputValue === m)
            .filter(o => o.inputLength > 0)
            .sort(() => Math.random() - 0.5);

        const max = res.length === 0 ? output.indexOf(m) : res[0].index;
        this.game.step((max === 0) - (max === 1), (max === 2) - (max === 3));
        return layers;
    }

    stepV2(weights) {
        const input = this.calculateInput();
        const layers = Neural.calculateLayers(input, weights);
        const output = layers[weights.length - 1];
        const max = output.indexOf(Math.max(...output));
        if (max === 0) {
            // continue same path
        } else if (this.position.x === 0 && max === 1) { // vertical path to left
            this.position.x = -1;
            this.position.y = 0;
        } else if (this.position.x === 0 && max === 2) { // vertical path to right
            this.position.x = 1;
            this.position.y = 0;
        } else if (this.position.y === 0 && max === 1) { // horizontal path to up
            this.position.x = 0;
            this.position.y = -1;
        } else if (this.position.y === 0 && max === 2) { // horizontal path to down
            this.position.x = 0;
            this.position.y = 1;
        }
        this.game.step(this.position.x, this.position.y);
        return layers;
    }
}
