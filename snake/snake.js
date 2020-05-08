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
}
