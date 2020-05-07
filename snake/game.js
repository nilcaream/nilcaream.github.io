class Game {
    constructor(width, height, seed) {
        this.width = width;
        this.height = height;
        this.random = Math.random;
        this.reset(seed);
    }

    reset(seed) {
        //this.updateSeed(seed);
        this.reward = 2 * Math.max(this.width, this.height);
        this.snake = new Snake(Math.floor(this.width / 2), Math.floor(this.height / 2), 4);
        this.apple = this.createApple();
        this.points = 0;
        this.lives = this.reward;
        this.age = 0;
    }

    updateSeed(seed) {
        this.seed = seed || this.seed || Math.random() * new Date().getTime();
        this.random = Game.mulberry32(this.seed);
    }

    getDistance() {
        const head = this.snake.getHead();
        return Math.hypot(this.apple.x - head.x, this.apple.y - head.y);
    }

    createApple() {
        let point = this.createRandomPoint();
        while (this.snake.contains(point)) {
            point = this.createRandomPoint();
        }
        return point;
    }

    createRandomPoint() {
        return { x: Math.floor(this.random() * this.width), y: Math.floor(this.random() * this.height) };
    }

    step(dx, dy) {
        const head = this.snake.grow(dx, dy);
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.points++;
            this.lives += this.reward;
            this.apple = this.createApple();
        } else if (this.snake.hasEatenTail() || this.snake.hasHitWall(0, this.width, 0, this.height)) {
            this.lives = 0;
        } else {
            this.snake.shrink();
            this.lives--;
        }
        this.age++;
        return this.lives > 0;
    }

    // https://stackoverflow.com/a/47593316
    static mulberry32(a) {
        return function () {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }
}
