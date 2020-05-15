class Net {
    constructor(width, height, canvasId, weights, outputTexts, inputTexts) {

        this.gridX = weights.length + 1;
        this.gridY = Math.max(...weights.map(w => w.length));

        this.outputTexts = outputTexts;
        this.inputTexts = inputTexts;
        this.ctx = this.createContext(canvasId, width, height);

        const pad = 0.55 * height / this.gridY;
        this.ctx.translate(pad, pad);
        this.width = width - 2 * pad;
        this.height = height - 2 * pad;
    }

    createContext(canvasId, width, height) {
        const ctx = $("#" + canvasId)
            .css("border", "1px solid black")
            .css("background-color", "rgba(255,255,255,0.95)")
            .attr("width", width)
            .attr("height", height)[0].getContext("2d");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        return ctx;
    }

    circle(x, y, color, text) {
        const unit = 0.5 * this.height / this.gridY;
        this.ctx.save();
        this.ctx.font = ((0.4 * unit).toFixed()) + "px monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.beginPath();
        this.ctx.arc(x, y, unit, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 0.05 * unit;
        this.ctx.strokeStyle = "black";
        this.ctx.stroke();
        this.ctx.fillStyle = "black";
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }

    line(parameters) {
        this.ctx.save();
        if (parameters.lineDash) {
            this.ctx.setLineDash([0.05 * this.width / this.gridX, 0.05 * this.width / this.gridX]);
        } else {
            this.ctx.setLineDash([]);
        }
        this.ctx.strokeStyle = parameters.color || `rgb(${parameters.r},${parameters.g},${parameters.b})`
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

        // weight min/max
        let weightMin = 9999999;
        let weightMax = -9999999;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights[i].length; j++) {
                for (let k = 0; k < weights[i][j].length; k++) {
                    const weight = weights[i][j][k];
                    weightMin = Math.min(weightMin, weight);
                    weightMax = Math.max(weightMax, weight);
                }
            }
        }
        const weightBound = Math.max(Math.abs(weightMin), Math.abs(weightMax));

        // layers weights
        this.ctx.save();
        this.ctx.translate(this.width / this.gridX, 0);
        for (let i = 1; i < weights.length; i++) {
            for (let j = 0; j < weights[i].length; j++) {
                for (let k = 0; k < weights[i][j].length; k++) {
                    const weight = weights[i][j][k];
                    const line = {
                        r: Math.floor(255 * Math.max(0, -weight) / weightBound),
                        g: Math.floor(255 * Math.max(0, weight) / weightBound),
                        b: 0,
                        p0: {
                            x: (i - 1) * this.width / this.gridX,
                            y: k * this.height / (weights[i - 1].length - 1)
                        },
                        p1: {
                            x: (i - 0) * this.width / this.gridX,
                            y: j * this.height / (weights[i - 0].length - 1)
                        }
                    };

                    line.w = Math.max(1, 0.05 * (Math.abs(weight) / weightBound) * this.width / this.gridX);
                    line.lineDash = (Math.abs(weight) / weightBound) < 0.1;
                    this.line(line);
                }
            }
        }
        this.ctx.restore();

        // input weights
        this.ctx.save();
        this.ctx.translate(this.width / this.gridX, 0);
        for (let j = 0; j < weights[0].length; j++) {
            for (let k = 0; k < weights[0][j].length; k++) {
                const weight = weights[0][j][k];
                const line = {
                    r: Math.floor(255 * Math.max(0, -weight) / weightBound),
                    g: Math.floor(255 * Math.max(0, weight) / weightBound),
                    b: 0,
                    p0: {
                        x: (0 - 1) * this.width / this.gridX,
                        y: j * this.height / (input.length - 1)
                    },
                    p1: {
                        x: (0 - 0) * this.width / this.gridX,
                        y: j * this.height / (input.length - 1)
                    }
                };
                line.w = Math.max(1, 0.05 * (Math.abs(weight) / weightBound) * this.width / this.gridX);
                line.lineDash = (Math.abs(weight) / weightBound) < 0.1;
                this.line(line);
            }
        }
        this.ctx.restore();

        // output weights
        this.ctx.save();
        this.ctx.translate(this.width, 0);
        for (let i = 0; i < outputTexts.length; i++) {
            const outputText = outputTexts[i];
            const line = {
                p0: {
                    x: -this.width / this.gridX,
                    y: i * this.height / (outputTexts.length - 1)
                },
                p1: {
                    x: 0,
                    y: i * this.height / (outputTexts.length - 1)
                },
                color: outputText.color,
                w: 0.05 * this.width / this.gridX
            };
            this.line(line);
        }
        this.ctx.restore();

        // input values
        this.ctx.save();
        if (this.inputTexts) {
            this.inputTexts(input).forEach((text, i) => {
                this.circle(0, i * this.height / (this.inputTexts.length - 1), "white", text);
            });
        } else {
            input.forEach((value, i) => {
                this.circle(0, i * this.height / (input.length - 1), "white", `${Number(value).toPrecision(3)}`);
            });
        }
        this.ctx.restore();

        // output labels
        this.ctx.save();
        this.ctx.translate(this.width, 0);
        outputTexts.forEach((outputText, i) => {
            this.circle(0, i * this.height / (layers[layers.length - 1].length - 1), "white", outputText.label);
        });
        this.ctx.restore();

        // layers values
        this.ctx.save();
        for (let i = 0; i < layers.length; i++) {
            this.ctx.translate(this.width / this.gridX, 0);
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
                this.circle(0, j * this.height / (layers[i].length - 1), color, `${layer.toPrecision(3)}`);
            }
        }
        this.ctx.restore();

        this.ctx.restore();
    }
}
