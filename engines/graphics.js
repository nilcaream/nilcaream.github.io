'use strict';

class Graphics {

    constructor(engine, unit = 80) {
        this.engine = engine;
        this.started = true;
        this.baseOffset = 0;
        this.timestamp = 0;

        this.unit = unit;
        this.rodLength = this.unit * 1.2;
        this.crankshaftRadius = this.unit / 2;
        this.gap = this.unit / 6;

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

        console.log(this);
    }

    increaseOffset(delta) {
        this.baseOffset = Math.round(this.baseOffset + delta);
        // smooth and align to zero
        this.baseOffset = this.baseOffset - this.baseOffset % delta;
    }

    start() {
        this.started = true;
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
        requestAnimationFrame(this.draw.bind(this));
    }

    storeFrameData(timestamp) {
        this.frame = timestamp - this.timestamp;
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
                        x1: (this.rodLength + this.crankshaftRadius) * Math.cos(cylinderRad),
                        y1: (this.rodLength + this.crankshaftRadius) * Math.sin(cylinderRad)
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
                const crankshaftAngle = crankshaftAngles[pistonNumber] + offset + this.baseOffset - 90 - this.engine.banks[pistonNumber];

                const pistonX = this.crankshaftRadius * Math.cos(Math.PI * (crankshaftAngle) / 180);
                const pistonY = this.crankshaftRadius * Math.sin(Math.PI * (crankshaftAngle) / 180);
                // why +90?
                const pistonRad = Math.PI * (crankshaftAngle + 90) / 180;
                const pistonPosition = this.crankshaftRadius * Math.cos(pistonRad) + Math.sqrt(this.rodLength * this.rodLength - this.crankshaftRadius * this.crankshaftRadius * Math.sin(pistonRad) * Math.sin(pistonRad));

                ctx.save();
                ctx.rotate(this.engine.banks[pistonNumber] * Math.PI / 180);

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

                const minPistonPosition = this.rodLength - this.crankshaftRadius;
                const maxPistonPosition = this.rodLength + this.crankshaftRadius;

                if (pistonPosition - minPistonPosition < this.unit / 64) {
                    // BDC
                    ctx.strokeStyle = "#2f2";
                    ctx.lineWidth = this.unit / 4;
                    ctx.beginPath();
                    ctx.moveTo(0, -pistonPosition);
                    ctx.lineTo(0, -pistonPosition);
                    ctx.stroke();

                } else if (maxPistonPosition - pistonPosition < this.unit / 32) {
                    // TDC
                    ctx.strokeStyle = "#22f";
                    ctx.lineWidth = this.unit / 4;
                    ctx.beginPath();
                    ctx.moveTo(0, -pistonPosition);
                    ctx.lineTo(0, -pistonPosition);
                    ctx.stroke();
                }

                ctx.restore();
            }
            ctx.translate(crankPinsElement.maxRight, 0);
        }

        ctx.restore();
    }

    drawCrankshaft5(timestamp) {
        const ctx = this.context;
        const engine = this.engine;
        const unit = this.unit;

        const banks = engine.banks;
        const cylindersPerPin = engine.banks.length / engine.crankpins;
        const rodLength = unit * 1.2;
        const crankshaftRadius = unit / 2;
        const gap = unit / 5;
        const colors = this.colors;

        ctx.save();
        ctx.translate(-crankshaftRadius, rodLength + gap);
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = unit / 5;
        ctx.lineCap = "round";

        const crankshaftAngles = engine.getCrankshaftAngles(timestamp, true);
        for (let i = 0; i < crankshaftAngles.length; i += cylindersPerPin) {
            // move by left cylinder
            let minBankAngle = 0;
            for (let j = 0; j < cylindersPerPin; j++) {
                minBankAngle = Math.min(minBankAngle, banks[i + j]);
            }
            ctx.translate(gap + crankshaftRadius + rodLength * Math.abs(Math.sin(Math.PI * minBankAngle / 180)), 0);

            // draw crankshaft at (0,0)
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = unit / 4;
            ctx.beginPath();
            ctx.arc(crankshaftRadius, crankshaftRadius, crankshaftRadius, 0, 2 * Math.PI);
            ctx.stroke();

            // draw cylinders
            for (let j = 0; j < cylindersPerPin; j++) {
                const rad = -Math.PI / 2 + Math.PI * banks[i + j] / 180;

                const cylinderX0 = (crankshaftRadius) * Math.cos(rad);
                const cylinderY0 = (crankshaftRadius) * Math.sin(rad);
                const cylinderX1 = (rodLength + crankshaftRadius) * Math.cos(rad);
                const cylinderY1 = (rodLength + crankshaftRadius) * Math.sin(rad);

                ctx.save();

                ctx.translate(crankshaftRadius, crankshaftRadius);

                // crankshaft angle
                ctx.fillStyle = "#44a";
                ctx.fillText(Math.round((crankshaftAngles[i] + 90) % 720), 0, 0);

                // cylinders
                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = unit / 4;
                ctx.beginPath();
                ctx.moveTo(cylinderX0, cylinderY0);
                ctx.lineTo(cylinderX1, cylinderY1);
                ctx.stroke();

                // cylinder numbers
                ctx.fillStyle = "#44a";
                ctx.fillText(engine.numbering[i + j], cylinderX1, cylinderY1);

                ctx.restore();
            }


            // draw moving parts
            for (let j = 0; j < cylindersPerPin; j++) {
                const crankshaftAngle = crankshaftAngles[i + j];
                const crankshaftScreenAngle = (crankshaftAngle + 90) % 720;
                const bankAngle = banks[i + j];
                const bankRotation = Math.PI * (bankAngle) / 180;

                ctx.save();

                ctx.translate(crankshaftRadius, crankshaftRadius);
                ctx.rotate(bankRotation);

                ctx.strokeStyle = colors.rods[j];

                const pistonX = crankshaftRadius * Math.cos(Math.PI * (crankshaftAngle - bankAngle) / 180);
                const pistonY = crankshaftRadius * Math.sin(Math.PI * (crankshaftAngle - bankAngle) / 180);
                const pistonRad = Math.PI * (crankshaftAngle + 90 - bankAngle) / 180;
                const pistonPosition = crankshaftRadius * Math.cos(pistonRad) + Math.sqrt(rodLength * rodLength - crankshaftRadius * crankshaftRadius * Math.sin(pistonRad) * Math.sin(pistonRad));

                const minPistonPosition = rodLength - crankshaftRadius;
                const maxPistonPosition = rodLength + crankshaftRadius;

                if (pistonPosition - minPistonPosition < unit / 64) {
                    // BDC
                    ctx.lineWidth = unit / 4;
                    ctx.beginPath();
                    ctx.moveTo(0, -pistonPosition);
                    ctx.lineTo(0, -pistonPosition);
                    ctx.stroke();

                } else if (maxPistonPosition - pistonPosition < unit / 32) {
                    // TDC
                    ctx.lineWidth = unit / 4;
                    ctx.beginPath();
                    ctx.moveTo(0, -pistonPosition);
                    ctx.lineTo(0, -pistonPosition);
                    ctx.stroke();
                }

                // rod
                ctx.strokeStyle = colors.rods[j];
                ctx.lineWidth = unit / 10;
                ctx.beginPath();
                ctx.moveTo(pistonX, pistonY);
                ctx.lineTo(0, -pistonPosition);
                ctx.stroke();

                ctx.strokeStyle = "#f00";
                ctx.lineWidth = unit / 5;
                ctx.beginPath();
                ctx.moveTo(pistonX, pistonY);
                ctx.lineTo(pistonX, pistonY);
                ctx.stroke();

                // ignition
                const angleX = Math.round((crankshaftAngles[i + j] - bankAngle + 90) % 720);
                const shot = Math.floor((crankshaftAngles[0]) / 90);


                const current = i + j;
                if ((angleX % 360 < 10)) {//&& Math.round(angleX / 90) === engine.firingOrder[i + j]) {
                    ctx.strokeStyle = "#ff0";
                    ctx.lineWidth = unit / 4;
                    ctx.beginPath();
                    ctx.moveTo(0, -pistonPosition);
                    ctx.lineTo(0, -pistonPosition);
                    ctx.stroke();
                    // number engine.numbering[i + j]
                    // console.log("IGN " + (current) + " | " + shot + " : " + engine.firingOrder[shot]);
                }
                ctx.rotate(-bankRotation);
                // ctx.fillStyle = "#444";
                // ctx.fillText(engine.firingOrder[shot], 0, crankshaftRadius);
                //
                // ctx.fillStyle = "#444";
                // ctx.fillText(angleX, 0, crankshaftRadius + unit / 2);

                ctx.restore();
            }

            // move by right cylinder
            let maxBankAngle = 0;
            for (let j = 0; j < cylindersPerPin; j++) {
                maxBankAngle = Math.max(maxBankAngle, banks[i + j]);
            }
            ctx.translate(gap + crankshaftRadius + rodLength * Math.abs(Math.sin(Math.PI * minBankAngle / 180)), 0);
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