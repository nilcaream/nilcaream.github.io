class Snake {
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

    contains(point) {
        return this.tail.filter(e => e.x === point.x && e.y === point.y).length > 0;
    }

    hasEatenTail() {
        const head = this.getHead();
        for (let i = 0; i < this.tail.length - 1; i++) {
            if (head.x === this.tail[i].x && head.y === this.tail[i].y) {
                return true;
            }
        }
        return false;
    }

    hasHitWall(minX, maxX, minY, maxY) {
        const head = this.getHead();
        return head.x < minX || head.x > maxX || head.y < minY || head.y > maxY;
    }
}
