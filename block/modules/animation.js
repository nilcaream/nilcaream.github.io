class Animation {
    constructor(fps) {
        this.fps = fps;
        this.timestamp = 0;
    }

    start(loop) {
        const go = timestamp => {
            const diff = timestamp - this.timestamp;
            if (this.fps && diff >= 1000 / this.fps) {
                loop(timestamp, diff);
                this.timestamp = timestamp;
            }
            requestAnimationFrame(go);
        }
        requestAnimationFrame(go);
    }

    stop() {
        this.fps = 0;
    }
}

export {Animation}
