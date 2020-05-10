class Net {
    constructor(unit, canvasId) {
        this.unit = unit;
        this.ctx = this.createContext(canvasId);
    }

    createContext(canvasId) {
        const ctx = $("#" + canvasId)
            .css("border", "1px solid black")
            .css("background-color", "rgba(255,255,255,0.95)")
            .attr("width", 800)
            .attr("height", 500)[0].getContext("2d");
        ctx.font = "12px monospace";
        return ctx;
    }

    draw(input, weights, layers) {
        this.ctx.save();
        this.ctx.fillStyle = "rgb(0,0,0)";
        this.ctx.clearRect(0, 0, 800, 500);
        this.ctx.font = "12px monospace";
        this.ctx.translate(5 * this.unit, this.unit);
        
        input.forEach((value, i) => {
            this.ctx.fillText(`I:${Number(value).toFixed(2)}`, 3 * -1 * this.unit, i * this.unit);
        });
        layers[0].forEach((value, i) => {
            this.ctx.fillText(`I:${Number(value).toFixed(2)}`, 3 * 0 * this.unit, i * this.unit);
        });
        for (let i = 0; i < layers.length; i++) {
            for (let j = 0; j < layers[i].length; j++) {
                const layer = layers[i][j];
                if (i === layers.length - 1) {
                    this.ctx.fillText(`O:${layer.toFixed(2)}`, 3 * i * this.unit, j * this.unit);
                } else if (i !== 0) {
                    this.ctx.fillText(`H:${layer.toFixed(2)}`, 3 * i * this.unit, j * this.unit);
                }
            }
        }

        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights[i].length; j++) {
                const layer = layers[i][j];
                if (i === weights.length - 1) {
                    //this.ctx.fillText(`O:${layer.toFixed(2)}`, 3 * i * this.unit, j * this.unit);
                } else if (i !== 0) {
                   // this.ctx.fillText(`H:${layer.toFixed(2)}`, 3 * i * this.unit, j * this.unit);
                }
                this.ctx.save();
                for (let k = 0; k < weights[i][j].length; k++) {
                    const weight = weights[i][j][k];
                    const line = {
                        r: Math.floor(Math.max(0, -weight)),
                        g: Math.floor(Math.max(0, weight)),
                        b: 0,
                        p0: { x: 3 * (i - 1) * this.unit, y: (i === 0 ? j : k) * this.unit },
                        p1: { x: 3 * i * this.unit, y: j * this.unit }
                    };
                    line.w = 0.5 * this.unit * (line.r + line.g + line.b) / (3 * 255);
                    this.ctx.strokeStyle = `rgb(${line.r},${line.g},${line.b})`
                    this.ctx.lineWidth = line.w;
                    this.ctx.beginPath();
                    this.ctx.moveTo(line.p0.x, line.p0.y);
                    this.ctx.lineTo(line.p1.x, line.p1.y);
                    this.ctx.stroke();

                    //this.ctx.fillText(`W:${weight.toPrecision(2)}`, i * this.unit, j * this.unit + this.unit + k * this.unit);
                }
                this.ctx.restore();
            }
        }
        this.ctx.restore();
    }
}
