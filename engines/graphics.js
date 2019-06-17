'use strict';

class Graphics {
    init(canvas) {
        this._canvas = canvas[0];
        this._context = this._canvas.getContext("2d");
        this._timestamp = 0;
        this._frame = 0;
        this._unit = 100;
        this._offset = {
            cylinderWidth: 60,
            cylinderWidthGap: 4,
            cylinderHeight: 50,
            pistonHeight: 10,
        };
        this._colors = {
            rods: ["#080", "#0a0", "#0c0", "#0d0"],
        }
    }

    start() {
        requestAnimationFrame(this.draw.bind(this));
    }

    draw(timestamp) {
        this._storeFrameData(timestamp);

        const ctx = this._context;
        ctx.save();
        ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        // this._drawCrankshaft(timestamp);
        // this._drawCrankshaft2(timestamp);
        // this._drawCrankshaft4(timestamp);
        this._drawCrankshaft5(timestamp);
        // ctx.translate(this._offset.cylinderWidth, this._offset.cylinderHeight);
        // this._drawCrankshaft3(timestamp);
        ctx.restore();
        requestAnimationFrame(this.draw.bind(this));
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
        const positions = engine.getCrankshaftAngles(timestamp);
        positions.forEach((angle) => {
            const y = offset.cylinderHeight * Math.sin((angle - 90) * Math.PI / 180);

            ctx.fillStyle = "#ccc";
            ctx.fillRect(offset.cylinderWidthGap * 2, 0, offset.cylinderWidth - 3 * offset.cylinderWidthGap, y);

            ctx.fillStyle = "#333";
            ctx.fillRect(offset.cylinderWidthGap, y, offset.cylinderWidth - offset.cylinderWidthGap, offset.pistonHeight);

            ctx.translate(offset.cylinderWidth, 0);
        });
        // console.log(timestamp + " " + positions);
        ctx.restore();
    }

    _drawCrankshaft2(timestamp) {
        const ctx = this._context;
        const engine = this.engine;
        const offset = this._offset;

        ctx.save();
        ctx.translate(0, offset.cylinderWidthGap);
        const positions = engine.getCrankshaftAngles(timestamp);
        ctx.lineWidth = 2;
        positions.forEach((angle, index) => {
            ctx.strokeStyle = "#bbb";
            ctx.beginPath();
            ctx.arc(offset.cylinderWidth / 2, offset.cylinderHeight / 2, offset.cylinderWidth / 2 - offset.cylinderWidthGap, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.strokeStyle = "#822";
            ctx.beginPath();
            const start = -Math.PI / 2 + Math.PI * engine.banks[index % engine.banks.length] / 180;
            const end = Math.PI * (angle - 90) / 180;
            ctx.arc(offset.cylinderWidth / 2, offset.cylinderHeight / 2, offset.cylinderWidth / 2 - offset.cylinderWidthGap, start, start + end);
            ctx.stroke();

            // ctx.fillRect(offset.cylinderWidthGap, offset.cylinderHeight * Math.sin(angle * Math.PI / 180), offset.cylinderWidth - offset.cylinderWidthGap, offset.pistonHeight);
            ctx.translate(offset.cylinderWidth, 0);
        });
        // console.log(timestamp + " " + positions);
        ctx.restore();
    }

    _drawCrankshaft3(timestamp) {
        const ctx = this._context;
        const engine = this.engine;
        const offset = this._offset;

        ctx.save();
        ctx.translate(offset.cylinderWidth / 2, offset.cylinderHeight / 2);
        const positions = engine.getCrankshaftAngles(timestamp);
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        positions.forEach((angle, index) => {
            ctx.fillStyle = "#44a";
            ctx.fillText(Math.round((angle + 90) % 360), 0, 0);
            ctx.translate(offset.cylinderWidth, 0);
        });
        // console.log(timestamp + " " + positions);
        ctx.restore();
    }

    _drawCrankshaft4(timestamp) {
        const ctx = this._context;
        const engine = this.engine;
        const offset = this._offset;
        const banksCount = this.engine.banks.length;

        ctx.save();
        ctx.translate(0, offset.cylinderHeight);
        const positions = engine.getCrankshaftAngles(timestamp);
        positions.forEach((angle, index) => {
            const y = Math.sin((angle - 90) * Math.PI / 180);

            ctx.fillStyle = "#ccc";
            ctx.beginPath();
            const radius = (offset.cylinderWidth / 2 - offset.cylinderWidthGap) * Math.abs(y);
            ctx.arc(offset.cylinderWidth / 2, offset.cylinderHeight / 2, radius, 0, 2 * Math.PI);
            ctx.stroke();

            if (index % banksCount === banksCount - 1) {
                ctx.translate(offset.cylinderWidth, 0);
            } else {
                ctx.translate(0, offset.cylinderHeight);
            }
        });
        // console.log(timestamp + " " + positions);
        ctx.restore();
    }

    _drawCrankshaft5(timestamp) {
        const ctx = this._context;
        const engine = this.engine;
        const unit = this._unit;
        const banks = engine.banks;
        const cylindersPerPin = engine.banks.length / engine.crankpins;
        const rodLength = unit * 1.2;
        const crankshaftRadius = unit / 2;
        const colors = this._colors;

        ctx.save();
        ctx.translate(unit, unit);
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = unit / 5;
        ctx.lineCap = "round";

        const crankshaftAngles = engine.getCrankshaftAngles(timestamp);
        for (let i = 0; i < crankshaftAngles.length; i += cylindersPerPin) {
            ctx.strokeStyle = "#ccc";
            ctx.lineWidth = unit / 4;
            ctx.beginPath();
            ctx.arc(crankshaftRadius, crankshaftRadius, crankshaftRadius, 0, 2 * Math.PI);
            ctx.stroke();

            for (let j = 0; j < cylindersPerPin; j++) {
                const crankshaftAngle = crankshaftAngles[i + j];
                const crankshaftScreenAngle = (crankshaftAngle + 90) % 360;
                const bankAngle = banks[i + j];

                const crankshaftAngleRad = Math.PI * crankshaftAngle / 180;

                const cylinderX0 = (crankshaftRadius) * Math.cos(-Math.PI / 2 + Math.PI * bankAngle / 180);
                const cylinderY0 = (crankshaftRadius) * Math.sin(-Math.PI / 2 + Math.PI * bankAngle / 180);
                const cylinderX1 = (rodLength + crankshaftRadius) * Math.cos(-Math.PI / 2 + Math.PI * bankAngle / 180);
                const cylinderY1 = (rodLength + crankshaftRadius) * Math.sin(-Math.PI / 2 + Math.PI * bankAngle / 180);

                const bankRotation = Math.PI * (bankAngle) / 180;
                ctx.translate(crankshaftRadius, crankshaftRadius);

                ctx.strokeStyle = "#ccc";
                ctx.lineWidth = unit / 4;
                ctx.beginPath();
                ctx.moveTo(cylinderX0, cylinderY0);
                ctx.lineTo(cylinderX1, cylinderY1);
                ctx.stroke();

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

                ctx.rotate(-bankRotation);
                ctx.translate(-crankshaftRadius, -crankshaftRadius);
            }

            ctx.translate(2 * (crankshaftRadius + rodLength) + unit, 0);
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