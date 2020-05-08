class GameUi {
    constructor(world, boardId) {
        this.world = world;
        this.game = new Game(world.width, world.height);
        this.ctx = this.createContext(boardId);
    }

    createContext(boardId) {
        const ctx = $("#" + boardId)
            .css("border", "1px solid black")
            .css("background-color", "rgba(255,255,255,0.95)")
            .attr("width", this.world.width * this.world.unit)
            .attr("height", this.world.height * this.world.unit)[0].getContext("2d");
        ctx.font = "14px monospace";
        return ctx;
    }

    static animate(onFrame, interval) {
        let time = 0;
        const animate = (timestamp) => {
            if (timestamp - time > interval) {
                onFrame();
                time = timestamp;
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    drawPixel(positionX, positionY) {
        this.ctx.fillRect(positionX * this.world.unit + this.world.pad, positionY * this.world.unit + this.world.pad, this.world.unit - 2 * this.world.pad, this.world.unit - 2 * this.world.pad);
    }

    draw() {
        const head = this.game.snake.getHead();
        this.ctx.clearRect(0, 0, this.world.width * this.world.unit, this.world.height * this.world.unit);
        this.game.snake.tail.forEach((e, i) => {
            const index = this.game.snake.tail.length - i;
            if (i === this.game.snake.tail.length - 1) {
                this.ctx.fillStyle = "yellow";
            } else {
                this.ctx.fillStyle = `rgb(${100 + 100 * Math.sin(index / 17)},${200 + 50 * Math.cos(index / 8)},${150 + 100 * Math.sin(index / 13)})`;
            }
            this.drawPixel(e.x, e.y);
        });
        this.ctx.fillStyle = "rgb(255,0,0)";
        this.drawPixel(this.game.apple.x, this.game.apple.y);
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`Points: ${this.game.points}`, 2, 14);
        this.ctx.fillText(`Lives: ${this.game.lives}`, 2, 28);
        this.ctx.fillText(`Age: ${this.game.age}`, 2, 42);
        this.ctx.fillText(`Distance: ${this.game.getDistance().toFixed(2)}`, 2, 56);
        this.ctx.fillText(`Head: (${head.x},${head.y})`, 2, 70);
    }
}
