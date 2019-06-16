class Graphics {
    init(canvas) {
        this._canvas = canvas[0];
        this._context = this._canvas.getContext("2d");
        this._timestamp = 0;
        this._frame = 0;
        this._offset = {
            cylinderWidth: 50,
            cylinderHeight: 50,
            pistonHeight: 20,
            crankshaftRadius: 10
        }
    }

    start() {
        requestAnimationFrame(this.draw.bind(this));
    }

    draw(timestamp) {
        this._storeFrameData(timestamp);
        if (timestamp < 10000) {
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
            this._drawCrankshaft(timestamp);
            requestAnimationFrame(this.draw.bind(this));
        }
    }

    _storeFrameData(timestamp) {
        this._frame = timestamp - this._timestamp;
        this._fps = 1000 / this._frame;
        this._timestamp = timestamp;
    }

    _drawCrankshaft(timestamp) {
        const ctx = this._context;
        const engine = this.engine;
        const offset = this._offset;
        ctx.save();
        ctx.translate(0, offset.cylinderHeight);
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, -offset.crankshaftRadius / 2 + offset.pistonHeight / 2, offset.cylinderWidth * (engine.crankshaft.length), offset.crankshaftRadius);
        ctx.fillStyle = "#333";
        const positions = engine.getCrankshaftAngles(timestamp);
        positions.forEach((angle) => {
            ctx.fillRect(0, offset.cylinderHeight * Math.sin(angle * Math.PI / 180), offset.cylinderWidth, offset.pistonHeight);
            ctx.translate(offset.cylinderWidth, 0);
        });
        // console.log(timestamp + " " + positions);
        ctx.restore();
    }

    showBusy() {
        console.log("show busy");
    }

    hideBusy() {
        console.log("hide busy");
    }
}