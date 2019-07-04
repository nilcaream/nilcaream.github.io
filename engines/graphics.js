'use strict';

class Graphics {

    constructor(engine, unit = 80) {
        this.engine = engine;
        this.started = false;
        this.redraw = true;
        this.baseOffset = 0;
        this.timestamp = 0;

        this.unit = unit;
        this.rodLength = this.unit;
        this.crankshaftRadius = this.unit / 2;
        this.gap = this.unit / 6;
        this.pistonHeight = this.unit / 4;

        this.positions = this.calculatePositions();

        this.colors = {
            rods: ["#080", "#0a0", "#0c0", "#0d0"],
        };

        this.canvas = $("<canvas></canvas>")
            .attr("width", this.positions.width)
            .attr("height", this.positions.height);
        this.context = this.canvas[0].getContext("2d");
        this.context.textAlign = "center";
        this.context.textBaseline = "middle";
        this.context.lineWidth = this.unit / 5;
        this.context.lineCap = "round";

        requestAnimationFrame(this.draw.bind(this));
    }

    increaseOffset(delta) {
        this.baseOffset = Math.round(this.baseOffset + delta);
        // smooth and align to zero
        this.baseOffset = this.baseOffset - this.baseOffset % delta;
        this.redraw = true;
    }

    start() {
        this.started = true;
        this.redraw = true;
    }

    stop() {
        this.started = false;
    }

    pause() {
        if (this.started) {
            this.stop();
        } else {
            this.start();
        }
    }

    draw(timestamp) {
        // frame time limiter; refresh every 30ms or more
        if ((timestamp - this.timestamp > 30 && this.started) || this.redraw) {
            this.storeFrameData(timestamp);

            const ctx = this.context;
            ctx.save();
            ctx.clearRect(0, 0, this.positions.width, this.positions.height);
            this.drawBlock();
            this.drawPistons();
            ctx.restore();

            if (this.started) {
                this.baseOffset = (this.baseOffset + this.frame / 16) % 720;
            }

            this.redraw = false;
        }
        requestAnimationFrame(this.draw.bind(this));
    }

    storeFrameData(timestamp) {
        if (this.redraw) {
            this.frame = 20;
        } else {
            this.frame = timestamp - this.timestamp;
        }
        this.fps = 1000 / this.frame;
        this.timestamp = timestamp;
    }

    calculatePositions() {
        const positions = {
            crankPins: [],
            maxLeft: 0,
            maxRight: 0,
            maxTop: 0,
            maxBottom: 0,
            width: 0,
            height: 0,
            start: this.engine.tdcs[0]
        };
        for (let crankPin = 0; crankPin < this.engine.crankpins; crankPin++) {
            const crankPinsElement = {
                crankPinRods: [],
                maxLeft: 0,
                maxRight: 0,
                maxTop: 0,
                maxBottom: 0
            };

            for (let crankPinRod = 0; crankPinRod < this.engine.crankpinsPerRod; crankPinRod++) {
                const cylinder = crankPin * this.engine.crankpinsPerRod + crankPinRod;
                const cylinderRad = -Math.PI / 2 + Math.PI * this.engine.banks[cylinder] / 180;

                const element = {
                    cylinder: {
                        x0: this.crankshaftRadius * Math.cos(cylinderRad),
                        y0: this.crankshaftRadius * Math.sin(cylinderRad),
                        x1: (this.rodLength + this.pistonHeight + this.crankshaftRadius) * Math.cos(cylinderRad),
                        y1: (this.rodLength + this.pistonHeight + this.crankshaftRadius) * Math.sin(cylinderRad)
                    }
                };
                element.cylinder.width = element.cylinder.x1 - element.cylinder.x0;
                element.cylinder.height = element.cylinder.y1 - element.cylinder.y0;

                if (element.cylinder.width >= 0) {
                    element.left = this.crankshaftRadius + this.gap;
                    element.right = Math.max(this.crankshaftRadius, element.cylinder.x1) + this.gap;
                } else {
                    element.left = Math.max(this.crankshaftRadius, -element.cylinder.x1) + this.gap;
                    element.right = this.crankshaftRadius + this.gap;
                }

                if (element.cylinder.height >= 0) {
                    element.top = this.crankshaftRadius + this.gap;
                    element.bottom = Math.max(this.crankshaftRadius, element.cylinder.y1) + this.gap;
                } else {
                    element.top = Math.max(this.crankshaftRadius, -element.cylinder.y1) + this.gap;
                    element.bottom = this.crankshaftRadius + this.gap;
                }

                crankPinsElement.crankPinRods.push(element);
            }
            crankPinsElement.crankPinRods.forEach(element => {
                crankPinsElement.maxLeft = Math.max(crankPinsElement.maxLeft, element.left);
                crankPinsElement.maxRight = Math.max(crankPinsElement.maxRight, element.right);
                crankPinsElement.maxTop = Math.max(crankPinsElement.maxTop, element.top);
                crankPinsElement.maxBottom = Math.max(crankPinsElement.maxBottom, element.bottom);
            });
            positions.crankPins.push(crankPinsElement);
        }
        positions.crankPins.forEach(element => {
            positions.maxLeft = Math.max(positions.maxLeft, element.maxLeft);
            positions.maxRight = Math.max(positions.maxRight, element.maxRight);
            positions.maxTop = Math.max(positions.maxTop, element.maxTop);
            positions.maxBottom = Math.max(positions.maxBottom, element.maxBottom);
            positions.width += element.maxLeft + element.maxRight;
        });
        // position crankshaft in a horizontal line
        positions.height = positions.maxTop + positions.maxBottom;
        return positions;
    }

    drawBlock() {
        const ctx = this.context;
        const positions = this.positions;

        ctx.save();
        ctx.translate(0, positions.maxTop);

        for (let crankPin = 0; crankPin < this.engine.crankpins; crankPin++) {
            const crankPinsElement = positions.crankPins[crankPin];

            ctx.translate(crankPinsElement.maxLeft, 0);

            // draw crankshaft at (0,0)
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = this.unit / 4;
            ctx.beginPath();
            ctx.arc(0, 0, this.crankshaftRadius, 0, 2 * Math.PI);
            ctx.stroke();

            // draw cylinders
            for (let crankPinRod = 0; crankPinRod < this.engine.crankpinsPerRod; crankPinRod++) {
                const crankPinRodsElement = crankPinsElement.crankPinRods[crankPinRod];
                const cylinderPosition = crankPinRodsElement.cylinder;

                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = this.unit / 4;
                ctx.beginPath();
                ctx.moveTo(cylinderPosition.x0, cylinderPosition.y0);
                ctx.lineTo(cylinderPosition.x1, cylinderPosition.y1);
                ctx.stroke();
            }
            ctx.translate(crankPinsElement.maxRight, 0);
        }

        ctx.restore();
    }

    drawPistons(offset = 0) {
        const ctx = this.context;
        const positions = this.positions;
        const crankshaftAngles = this.engine.crankshaftZero;

        ctx.save();
        ctx.translate(0, positions.maxTop);

        for (let crankPin = 0; crankPin < this.engine.crankpins; crankPin++) {
            const crankPinsElement = positions.crankPins[crankPin];

            // origin at crankshaft axis
            ctx.translate(crankPinsElement.maxLeft, 0);

            // base angle
            const baseAngle = Math.round(offset + this.baseOffset) % 720;
            const baseRad = (offset + this.baseOffset - 90) * Math.PI / 180;
            const baseX = this.crankshaftRadius * Math.cos(baseRad);
            const baseY = this.crankshaftRadius * Math.sin(baseRad);
            ctx.strokeStyle = "#eee";
            ctx.lineWidth = this.unit / 8;
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            ctx.lineTo(baseX, baseY);
            ctx.stroke();

            ctx.fillStyle = "#444";
            // TODO this could be cached or pre-set
            ctx.font = Math.round(this.unit / 4) + "px Arial";
            ctx.fillText(baseAngle, 0, 0);

            for (let crankPinRod = 0; crankPinRod < this.engine.crankpinsPerRod; crankPinRod++) {
                const crankPinRodsElement = crankPinsElement.crankPinRods[crankPinRod];
                const pistonNumber = crankPinRod + crankPin * this.engine.crankpinsPerRod;
                // -90 to start at the top
                const crankshaftAngle = crankshaftAngles[pistonNumber] + offset + positions.start + this.baseOffset - 90 - this.engine.banks[pistonNumber];

                const pistonX = this.crankshaftRadius * Math.cos(Math.PI * (crankshaftAngle) / 180);
                const pistonY = this.crankshaftRadius * Math.sin(Math.PI * (crankshaftAngle) / 180);
                // why +90?
                const pistonRad = Math.PI * (crankshaftAngle + 90) / 180;
                const pistonPosition = this.crankshaftRadius * Math.cos(pistonRad) + Math.sqrt(this.rodLength * this.rodLength - this.crankshaftRadius * this.crankshaftRadius * Math.sin(pistonRad) * Math.sin(pistonRad));

                ctx.save();
                ctx.rotate(this.engine.banks[pistonNumber] * Math.PI / 180);

                // piston
                ctx.strokeStyle = "#222";
                ctx.lineWidth = this.unit / 4;
                ctx.beginPath();
                ctx.moveTo(0, -pistonPosition);
                ctx.lineTo(0, -pistonPosition - this.pistonHeight);
                ctx.stroke();

                // rod
                ctx.strokeStyle = "#282";
                ctx.lineWidth = this.unit / 10;
                ctx.beginPath();
                ctx.moveTo(pistonX, pistonY);
                ctx.lineTo(0, -pistonPosition);
                ctx.stroke();

                // crank
                ctx.strokeStyle = "#822";
                ctx.lineWidth = this.unit / 5;
                ctx.beginPath();
                ctx.moveTo(pistonX, pistonY);
                ctx.lineTo(pistonX, pistonY);
                ctx.stroke();

                if (Math.abs((baseAngle + 180) % 360 - this.engine.tdcsZero[pistonNumber]) < 20) {
                    // BDC
                    ctx.strokeStyle = "#888";
                } else if (Math.abs(baseAngle % 360 - this.engine.tdcsZero[pistonNumber]) < 20) {
                    // TDC
                    ctx.strokeStyle = "#ddd";
                } else {
                    ctx.strokeStyle = "#aaa";
                }
                ctx.lineWidth = this.unit / 4;
                ctx.beginPath();
                ctx.moveTo(0, -pistonPosition);
                ctx.lineTo(0, -pistonPosition);
                ctx.stroke();

                ctx.fillText(this.engine.numbering[pistonNumber], 0, -pistonPosition);

                ctx.restore();
            }
            ctx.translate(crankPinsElement.maxRight, 0);
        }

        ctx.restore();
    }

    showBusy() {
        console.log("show busy");
    }

    hideBusy() {
        console.log("hide busy");
    }
}