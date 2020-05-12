class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.reset();
    }

    reset() {
        this.reward = 2 * Math.max(this.width, this.height);
        this.snake = new Snake(Math.floor(this.width / 2), Math.floor(this.height / 2), 4);
        this.apple = this.createApple();
        this.points = 0;
        this.lives = this.reward;
        this.age = 0;
    }

    getDistance() {
        const head = this.snake.getHead();
        return Math.hypot(this.apple.x - head.x, this.apple.y - head.y);
    }

    createApple() {
        let point = this.createRandomPoint();
        while (!this.snake.isEmptySpot(point, this.width, this.height)) {
            point = this.createRandomPoint();
        }
        return point;
    }

    createRandomPoint() {
        return { x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height) };
    }

    step(dx, dy) {
        const head = this.snake.getHead();
        const newHead = { x: head.x + dx, y: head.y + dy };
        if (newHead.x === this.apple.x && newHead.y === this.apple.y) {
            this.points++;
            this.lives = Math.min(3 * this.reward, this.lives + this.reward);
            this.snake.grow(dx, dy);
            this.apple = this.createApple();
            this.age++;
        } else if (this.snake.isEmptySpot(newHead, this.width, this.height)) {
            this.snake.grow(dx, dy);
            this.snake.shrink();
            this.lives--;
            this.age++;
        } else {
            this.lives = 0;
        }

        return this.lives > 0;
    }
}
