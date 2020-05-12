class Net {
    constructor(width, height, canvasId, weights, outputTexts, inputTexts) {
        this.unit = width / (weights.length + 0.5);
        this.padX = this.unit;
        this.radius = 0.15 * this.unit;
        this.maxLayers = Math.max(...weights.map(w => w.length));

        this.padY = height ? (height + this.radius) / this.maxLayers : this.padX * 0.8;

        this.width = width;
        this.height = height || (this.maxLayers - 0.4) * this.padY;
        this.outputTexts = outputTexts;
        this.inputTexts = inputTexts;
        this.ctx = this.createContext(canvasId);
    }

    createContext(canvasId) {
        const ctx = $("#" + canvasId)
            .attr("width", this.width)
            .attr("height", this.height)[0].getContext("2d");
        ctx.font = ((this.unit / 3).toFixed()) + "px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        return ctx;
    }

    circle(x, y, color, text) {
        this.ctx.save();
        this.ctx.font = ((this.radius / 2).toFixed()) + "px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = this.radius / 12;
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
        this.ctx.fillStyle = "black";
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    line(parameters) {
        this.ctx.save();
        if (parameters.w < 2) {
            this.ctx.setLineDash([this.unit / 32, this.unit / 16]);
        } else {
            this.ctx.setLineDash([]);
        }
        this.ctx.strokeStyle = `rgb(${parameters.r},${parameters.g},${parameters.b})`
        this.ctx.lineWidth = parameters.w;
        this.ctx.beginPath();
        this.ctx.moveTo(parameters.p0.x, parameters.p0.y);
        this.ctx.lineTo(parameters.p1.x, parameters.p1.y);
        this.ctx.stroke();
        this.ctx.restore();
    }

    draw(input, weights, layers) {
        const output = layers[layers.length - 1];
        const outputTexts = this.outputTexts(output);

        this.ctx.save();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.translate(1.5 * this.radius + this.padX / 2, 1.5 * this.radius);

        // layers weights
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights[i].length; j++) {
                this.ctx.save();
                const y0 = 0.5 * (this.maxLayers - layers[Math.max(0, i - 1)].length) * this.padY;
                const y1 = 0.5 * (this.maxLayers - layers[i].length) * this.padY;
                for (let k = 0; k < weights[i][j].length; k++) {
                    const weight = weights[i][j][k];
                    const line = {
                        r: Math.floor(Math.max(0, -weight)),
                        g: Math.floor(Math.max(0, weight)),
                        b: 0,
                        p0: { x: (i === 0 ? -0.5 : i - 1) * this.padX, y: (i === 0 ? j : k) * this.padY + y0 },
                        p1: { x: i * this.padX, y: j * this.padY + y1 }
                    };
                    line.w = Math.max(1, 0.14 * this.unit * (line.r + line.g + line.b) / (3 * 255));
                    this.line(line);
                }
                this.ctx.restore();
            }
        }

        // output weights
        this.ctx.save();
        this.ctx.translate(0, 0.5 * (this.maxLayers - layers[layers.length - 1].length) * this.padY);
        for (let i = 0; i < outputTexts.length; i++) {
            const outputText = outputTexts[i];
            const line = {
                p0: { x: (layers.length - 1) * this.padX, y: i * this.padY },
                p1: { x: (layers.length - 0.5) * this.padX - this.radius, y: i * this.padY }
            };
            this.ctx.strokeStyle = outputText.color;
            this.ctx.lineWidth = this.unit / 32;
            this.ctx.beginPath();
            this.ctx.moveTo(line.p0.x, line.p0.y);
            this.ctx.lineTo(line.p1.x, line.p1.y);
            this.ctx.stroke();
        }
        this.ctx.restore();

        // input values
        this.ctx.save();
        this.ctx.translate(0, 0.5 * (this.maxLayers - input.length) * this.padY);
        if (this.inputTexts) {
            this.inputTexts(input).forEach((text, i) => {
                this.circle(-0.5 * this.padX, i * this.padY, "white", text);
            });
        } else {
            input.forEach((value, i) => {
                this.circle(-0.5 * this.padX, i * this.padY, "white", `${Number(value).toFixed(2)}`);
            });
        }
        this.ctx.restore();

        // output labels
        outputTexts.forEach((outputText, i) => {
            this.ctx.save();
            this.ctx.translate(0, 0.5 * (this.maxLayers - layers[layers.length - 1].length) * this.padY);
            this.circle((layers.length - 0.5) * this.padX, i * this.padY, "white", outputText.label);
            this.ctx.restore();
        });

        // layers values
        for (let i = 0; i < layers.length; i++) {
            for (let j = 0; j < layers[i].length; j++) {
                const layer = layers[i][j];
                let color;
                if (layer > 0.505) {
                    color = "rgb(180,255,180)";
                } else if (layer < 0.495) {
                    color = "rgb(255,180,180)";
                } else {
                    color = "rgb(180,180,255)";
                }
                this.ctx.save();
                this.ctx.translate(0, 0.5 * (this.maxLayers - layers[i].length) * this.padY);
                this.circle(i * this.padX, j * this.padY, color, `${layer.toFixed(2)}`);
                this.ctx.restore();
            }
        }

        this.ctx.restore();
    }
}
