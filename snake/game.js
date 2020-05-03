class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.snake = new Snake(Math.floor(width / 2), Math.floor(height / 2), 4);
        this.apple = this.createApple();
        this.points = 0;
        this.lives = Math.max(width, height);
    }

    createApple() {
        let point = this.createRandomPoint();
        while (this.snake.contains(point)) {
            point = this.createRandomPoint();
        }
        return point;
    }

    createRandomPoint() {
        return { x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height) };
    }

    step(dx, dy) {
        const head = this.snake.grow(dx, dy);
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.points++;
            this.lives += Math.max(this.width, this.height);
            this.apple = this.createApple();
        } else if (this.snake.hasEatenTail() || this.snake.hasHitWall(0, this.width, 0, this.height)) {
            this.lives = 0;
        } else {
            this.snake.shrink();
            this.lives--;
        }
        return this.lives > 0;
    }
}
