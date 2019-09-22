'use strict';

{
    let imageStore = false;

    class Egg {
        constructor() {
            imageStore = imageStore || new ImageStore();
            imageStore.onload(() => this.start());
        }

        start() {
            this.timestamp = 0;
            this.keys = new Set();

            this.keydown = e => {
                const key = e.key.toLowerCase();
                this.keys.add(key);
                if (!key.startsWith("f") && !key.startsWith("e")) {
                    e.preventDefault();
                }
                return false;
            }
            this.keyup = e => {
                this.keys.delete(e.key.toLowerCase());
                e.preventDefault();
                return false;
            }
            window.addEventListener("keydown", this.keydown, false);
            window.addEventListener("keyup", this.keyup, false);

            const canvas = document.createElement("canvas");
            canvas.setAttribute("width", window.innerWidth);
            canvas.setAttribute("height", window.innerHeight);
            canvas.style.backgroundColor = "rgba(255,255,255,0.5)";
            canvas.style.position = "fixed";
            canvas.style.top = 0;
            canvas.style.left = 0;
            // canvas.style.cursor = "none";
            // canvas.style["z-index"] = 30303;
            canvas.style["z-index"] = -10;

            this.canvas = canvas;
            this.context = canvas.getContext("2d");

            this.restart();

            document.getElementsByTagName("body")[0].appendChild(canvas);

            window.requestAnimationFrame((time) => {
                this.timestamp = time;
                this.frame(time);
            });
        }

        restart() {
            this.players = [
                new Car(imageStore.car, 100, this.canvas.height / 2, 0, 90),
                new Car(imageStore.car, this.canvas.width - 100, this.canvas.height / 2, -180, 90)
            ];
            this.sprites = [...this.players];
        }

        stop() {
            if (this.canvas.parentNode) {
                this.canvas.parentNode.removeChild(this.canvas);
                window.removeEventListener("keyup", this.keyup);
                window.removeEventListener("keydown", this.keydown);
                new Egg();
            }
        }

        frame(timestamp) {
            const diff = timestamp - this.timestamp;
            if (diff > 32) { // frame limiter
                this.animate(timestamp, diff);
                this.timestamp = timestamp;
            }
            window.requestAnimationFrame((time) => this.frame(time));
        }

        animate(timestamp, diff) {
            const ctx = this.context;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.players[0].move(this.keys.has("w"), this.keys.has("s"), this.keys.has("a"), this.keys.has("d"), diff);
            this.players[1].move(this.keys.has("arrowup"), this.keys.has("arrowdown"), this.keys.has("arrowleft"), this.keys.has("arrowright"), diff);

            this.fire(this.players[0], " ", timestamp);
            this.fire(this.players[1], "m", timestamp);

            this.sprites.forEach(spriteA => {
                this.sprites
                    .filter(spriteB => spriteA !== spriteB && spriteA.colides(spriteB) && spriteB.colides(spriteA))
                    .forEach(spriteB => {
                        spriteA.die(spriteB);
                        spriteB.die(spriteA);
                    });
                spriteA.fly(diff);
                spriteA.draw(ctx, diff);
            });

            this.players.forEach(player => player.draw(ctx, diff));

            if (this.keys.has("escape")) {
                this.stop();
            } else if (this.keys.has("enter")) {
                this.restart();
            }
        }

        fire(player, key, timestamp) {
            if (player.bullet) {
                if (timestamp - player.bullet.start > 2000 || player.bullet.type !== "bullet") {
                    player.bullet.die();
                    player.bullet = false;
                }
            } else if (player.alive && this.keys.has(key)) {
                const bullet = new Bullet(imageStore.bullet, player.x, player.y, player.angle, 0, player.v + player.vMax * 3);
                bullet.angleDiff = 4;
                bullet.start = timestamp;
                this.sprites.push(bullet);
                player.bullet = bullet;
            }
        }
    }

    class Sprite {
        constructor(image, x = 0, y = 0, angle = 0, angleZero = 0, v = 0) {
            this.x = x;
            this.y = y;
            this.v = v;
            this.accelerate = 4000;
            this.deccelerate = 8000;
            this.vMax = 1 / 8;
            this.angle = angle;
            this.angleZero = angleZero;
            this.angleDiff = 8;
            this.scale = 1;
            this.alive = true;
            this.image = image;
            this.growMax = 4;
            this.updateRadius();
        }

        updateRadius() {
            this.radius = this.scale * Math.max(this.image.width, this.image.height) / 2;
        }

        move(up, down, left, right, diff) {
            if (up || down) {
                this.v = Math.min(Math.max(this.v + diff * (up - down) / this.accelerate, -this.vMax), this.vMax);
            } else if (this.v !== 0) {
                this.v = this.v - Math.sign(this.v) * diff / this.deccelerate;
                this.v = Math.abs(this.v) < this.vMax / 10 ? 0 : this.v;
            }
            this.angle = this.angle + (right - left) / this.angleDiff * diff;
        }

        fly(diff) {
            this.y += Math.sin(Math.PI * this.angle / 180) * this.v * diff;
            this.x += Math.cos(Math.PI * this.angle / 180) * this.v * diff;
        }

        rotate(diff) {
            this.angleZero += diff / this.angleDiff;
        }

        grow(diff) {
            this.scale = Math.min(this.growMax, this.scale + diff / 20000);
            this.updateRadius();
        }

        distance(sprite) {
            return Math.sqrt((sprite.x - this.x) * (sprite.x - this.x) + (sprite.y - this.y) * (sprite.y - this.y))
        }

        colides(sprite) {
            return this.x > 0 && this.distance(sprite) < this.radius + sprite.radius;
        }

        draw(ctx, diff) {
            if (this.x > 0) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.PI * (this.angle + this.angleZero) / 180);
                ctx.drawImage(this.image, -this.image.width * this.scale / 2, -this.image.height * this.scale / 2, this.image.width * this.scale, this.image.height * this.scale);
                ctx.restore();
            }
        }

        die() {
            this.alive = false;
        }

        moveOut() {
            this.x = -100;
            this.y = -100;
            this.v = 0;
            this.type = "out";
        }
    }

    class Car extends Sprite {
        constructor() {
            super(...arguments);
            this.type = "car";
        }

        colides(sprite) {
            return this.bullet !== sprite && sprite.bullet !== this && super.colides(sprite);
        }

        die() {
            if (this.alive) {
                this.doDie();
                super.die();
            }
        }

        doDie() {
            this.v = 0;
            this.vMax = 0;
            this.growMax = 16;
            this.globalAlpha = 1;

            this.fly = (diff) => {
                this.angleDiff -= diff / 1000;
                this.rotate(2 * diff);
                this.grow(256 * diff);
                this.radius = 0;
            }

            this.draw = (ctx, diff) => {
                if (this.globalAlpha > 0) {
                    ctx.save();
                    this.globalAlpha -= diff / 1200;
                    ctx.globalAlpha = Math.max(0, this.globalAlpha);
                    super.draw(ctx);
                    ctx.restore();
                } else {
                    this.draw = () => {};
                    this.fly = () => {};
                    this.moveOut();
                }
            }
        }
    }

    class Bullet extends Sprite {
        constructor() {
            super(...arguments);
            this.type = "bullet";
        }

        fly(diff) {
            super.fly(diff);
            this.rotate(diff);
        }

        die(sprite) {
            if (this.alive) {
                if (sprite) {
                    if (sprite.type === "explosion" && this.type === "bullet") {
                        if (sprite.alive) {
                            sprite.scale += 0.1;
                            sprite.growMax += 0.5;
                        } else {
                            sprite.angleDiff *= 0.8;
                        }
                        this.moveOut();
                    } else if (sprite.type === "bullet" && this.type === "bullet") {
                        this.scale += 0.1;
                        this.growMax += 0.5;
                        this.doDie();
                    } else if (sprite.type === "explosion" && this.type === "explosion") {
                        this.growMax = this.scale;
                        this.alive = false;
                        sprite.growMax = sprite.scale;
                        sprite.alive = false;
                    } else {
                        this.doDie();
                    }
                } else {
                    this.doDie();
                }
            }
        }

        doDie() {
            this.type = "explosion"
            this.image = imageStore.explosion;
            this.v = 0;
            this.vMax = 0;
            this.angleDiff = 16;
            this.fly = (diff) => {
                this.rotate(diff);
                this.grow(diff);
            }
        }
    }

    class ImageStore {
        constructor() {
            this.loaded = 0;
        }

        onload(onload) {
            if (this.loaded === 3) {
                onload();
            } else {
                this.car = this.create(onload, "car.png");
                this.bullet = this.create(onload, "bullet.png");
                this.explosion = this.create(onload, "explosion.png");
            }
        }

        create(onload, imageSrc) {
            const image = new Image();
            image.onload = () => {
                this.loaded++;
                if (this.loaded === 3) {
                    onload();
                }
            };
            image.src = imageSrc;
            return image;
        }
    }

    if (document.readyState !== 'loading') {
        new Egg();
    } else {
        document.addEventListener('DOMContentLoaded', () => new Egg());
    }
}