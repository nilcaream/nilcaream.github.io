export class Snake {
    constructor(x, y, length) {
        this.tail = [{ x: x, y: y - length }];
        for (let i = 0; i < length; i++) {
            this.grow(0, 1);
        }
    }

    grow(dx, dy) {
        const head = this.getHead();
        const newHead = { x: head.x + dx, y: head.y + dy };
        this.tail.push(newHead);
        return newHead;
    }

    shrink() {
        this.tail.shift();
    }

    getHead() {
        return this.tail[this.tail.length - 1];
    }

    isEmptySpot(position, width, height) {
        if (position.x < 0 || position.y < 0 || position.x >= width || position.y >= height) {
            return false;
        } else {
            for (let i = 0; i < this.tail.length; i++) {
                if (position.x === this.tail[i].x && position.y === this.tail[i].y) {
                    return false;
                }
            }
            return true;
        }
    }

    distanceToNonEmpty(width, height) {
        const head = this.getHead();
        const xPositive = Math.min(...this.tail.filter(t => t.x > head.x && t.y === head.y).map(t => t.x), width) - head.x - 1;
        const xNegative = head.x - Math.max(...this.tail.filter(t => t.x < head.x && t.y === head.y).map(t => t.x), -1) - 1;

        const yPositive = Math.min(...this.tail.filter(t => t.y > head.y && t.x === head.x).map(t => t.y), height) - head.y - 1;
        const yNegative = head.y - Math.max(...this.tail.filter(t => t.y < head.y && t.x === head.x).map(t => t.y), -1) - 1;
        return {
            xPositive: xPositive,
            yPositive: yPositive,
            xNegative: xNegative,
            yNegative: yNegative
        }
    }
}
