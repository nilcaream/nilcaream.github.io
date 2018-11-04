function State(canvasId, debugDivId, hudBackCanvasId, hudFrontCanvasId, pointsDivId, levelDivId) {
    this.canvas = document.getElementById(canvasId);

    this.startTime = 0;
    this.enemies = [];
    this.explosives = [];
    this.updateHud = true;
    this.absoluteMove = true;

    this.player = new Player();
    this.explosion = new Explosion();

    this.utils = new Utils();
    this.levels = new Levels();
    this.debug = new Debug(debugDivId);
    this.graphics = new Graphics(canvasId, hudBackCanvasId, hudFrontCanvasId, pointsDivId, levelDivId);
    this.controller = new Controller(this.graphics.main.width, this.graphics.main.height);

    this.lastRefreshTimestamp = 0;
    this.worldSize = this.graphics.worldSize;

    this._registerKeyboardListeners();
    this._registerTouchListeners();
    this._startIntervalJobs();
}

State.prototype = {
    constructor: State,

    onInitialized: function (callback) {
        return this.graphics.onInitialized(callback);
    },

    showStartGame: function () {
        this._resetGame(0);
        this.player.health = 0;

        var modalInfo = document.getElementById("modalInfo");
        modalInfo.style.width = window.innerWidth + "px";
        modalInfo.style.height = window.innerHeight + "px";
        modalInfo.style.display = "block";

        var startGame = document.getElementById("startGame");
        startGame.style.display = "block";
        startGame.style.marginTop = (modalInfo.offsetHeight / 2 - startGame.offsetHeight / 2) + "px";
    },

    isRunning: function () {
        return this.player.health > 0;
    },

    updateState: function (timestamp) {
        var time = timestamp - this.lastRefreshTimestamp;
        this.controller.update();

        if (this.isRunning()) {
            if (this.controller.type === "mobile") {
                this._updatePlayerAngle(time, timestamp);
            } else if (this.absoluteMove) {
                this._updatePlayerVelocityAbsolute(time);
            } else {
                this._updatePlayerVelocityRelative(time, timestamp);
            }

            this._updatePositions(time, timestamp);
            this._updateGameState(time, timestamp);
        }

        if (this.debug.enabled) {
            this.debug.update(timestamp, this.player, this.explosion, this.controller, this.enemies, this.explosives, time, this.worldSize, this.canvas);
        }

        this.lastRefreshTimestamp = timestamp;
    },

    updateGraphics: function (timestamp) {
        if (this.isRunning()) {
            this.graphics.drawMain(timestamp, this.player, this.explosion, this.enemies, this.explosives);
        }
        if (this.updateHud) {
            this.updateHud = false;
            var controllers;
            if (this.controller.type === "mobile") {
                controllers = ["mobile"];
            } else {
                controllers = [this.absoluteMove ? "moveAbsolute" : "moveRelative", this.controller.type];
            }
            this.graphics.drawHudFront(this.player.explosives, this.levels.current.explosives, this.player.health, this.levels.current.health, this.player.points, controllers);
        }
    },

    _registerKeyboardListeners: function () {
        var caller = this;
        document.onkeydown = function (e) {
            caller.controller.keyPressed[e.keyCode] = true;
        };
        document.onkeyup = function (e) {
            caller.controller.keyPressed[e.keyCode] = false;
        };
        document.onkeypress = function (e) {
            if (caller.debug.enabled) {
                console.log(e);
            }
            if (e.code === "Backslash") {
                caller.controller.toggle();
                caller.updateHud = true;
            } else if (e.code === "KeyA") {
                caller.absoluteMove = !caller.absoluteMove;
                caller.updateHud = true;
            } else if (e.code === "KeyM") {
                caller.mobile = !caller.mobile;
                if (caller.mobile) {
                    caller.player.x = caller.canvas.width / 2;
                    caller.player.y = caller.canvas.height / 2;
                    caller.absoluteMove = false;
                }
                caller.updateHud = true;
            } else if (e.code === "Backquote") {
                if (caller.debug.toggle()) {
                    document.getElementById("wrapper").style.cursor = "default";
                } else {
                    document.getElementById("wrapper").style.cursor = "none";
                }
            } else if (e.code === "Enter") {
                caller._resetGame(caller.levels.number);
            } else if (e.code.startsWith("Digit")) {
                var digit = parseInt(e.code.substring("Digit".length));
                caller._resetGame(digit === 0 ? 9 : digit - 1);
            }
        };
    },

    _registerTouchListeners: function () {
        var caller = this;
        var processTouch = function (event) {
            // console.log(event);
            // console.log(event.type);
            // console.log(event.touches);
            caller.controller.touches = event.touches;
        };

        var pane = document.getElementById("hudFront");
        pane.addEventListener('touchmove', processTouch, false);
        pane.addEventListener('touchstart', processTouch, false);
        pane.addEventListener('touchend', processTouch, false);
    },

    _interpretHash: function () {
        var state = this;
        var hashes = window.location.hash.substring(1).split(":");
        if (hashes.indexOf("mobile") !== -1) {
            this.controller.type = "mobile";
        }
        hashes.forEach(function (hash) {
            if (hash.startsWith("level")) {
                var digit = parseInt(hash.substring("level".length));
                state._resetGame(digit === 0 ? 9 : digit - 1);
            }
        });
    },

    _startIntervalJobs: function () {
        var caller = this;

        setInterval(function () {
            if (caller.controller.start) {
                caller._resetGame(caller.levels.number);
                caller.updateHud = true;
            } else if (caller.controller.select) {
                caller.absoluteMove = !caller.absoluteMove;
                caller.updateHud = true;
            }
            if (caller.enemies.length < caller.levels.current.enemiesCount && caller.player.health > 0) {
                caller._addEnemy();
            }
        }, 1000);

        setInterval(function () {
            if (caller.explosives.length + caller.player.explosives < caller.levels.current.explosives && caller.player.health > 0) {
                caller._addExplosive();
            }
        }, 2000);
    },

    _shootBullet: function (enemy) {
        var player = this.player;
        var bullet = new Enemy();

        bullet.x = enemy.x;
        bullet.y = enemy.y;
        bullet.speed = this.levels.current.bulletSpeed;
        bullet.angle = 90 + Math.atan2(player.y - enemy.y, player.x - enemy.x) * 180 / Math.PI;

        enemy.bullet = bullet;
    },

    _showEndGame: function () {
        var modalInfo = document.getElementById("modalInfo");
        modalInfo.style.display = "block";

        document.getElementById("startGame").style.display = "none";
        var endGame = document.getElementById("endGame");
        endGame.style.display = "block";
        endGame.style.marginTop = (modalInfo.offsetHeight / 2 - endGame.offsetHeight / 2) + "px";

        var playTime = new Date(new Date().getTime() - this.startTime);
        document.getElementById("endTime").innerText = playTime.getUTCMinutes() + ":" + this.utils.leadingZero(playTime.getUTCSeconds(), 100) + "." + this.utils.leadingZero(playTime.getUTCMilliseconds(), 1000);
        document.getElementById("endLevel").innerText = this.levels.number + 1;
        document.getElementById("endPoints").innerText = this.player.points.toString();
        document.getElementById("endPointsPerMinute").innerText = (this.player.points / (playTime.getTime() / (1000 * 60))).toFixed(2);
    },

    _resetGame: function (newLevel) {
        this.startTime = new Date().getTime();
        document.getElementById("modalInfo").style.display = "none";
        console.log("Reset game - level " + newLevel);

        this.levels.set(newLevel);
        this.enemies = [];
        this.explosives = [];
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.speed = 0;
        this.player.angle = 0;
        this.player.health = this.levels.current.health;
        this.player.explosives = this.levels.current.explosives;
        this.player.points = 0;

        this.graphics.drawHudBack(this.levels.current.explosives, this.levels.current.health, this.levels.number + 1);
        this.updateHud = true;

        while (this.enemies.length < this.levels.current.enemiesCount) {
            this._addEnemy();
            console.log("add");
        }
    },

    _updateGameState: function (time, timestamp) {
        var player = this.player;
        var enemies = this.enemies;
        var explosion = this.explosion;

        var i;
        var enemy;
        var explosive;
        var bullet;

        // kill enemies
        if (explosion.startTime > 0) {
            for (i = 0; i < enemies.length; i++) {
                enemy = enemies[i];
                if (enemy.playerDistance < explosion.radius + 20) {
                    enemies.splice(i, 1);
                    if (this.debug.enabled) {
                        console.log("+" + explosion.points + " points");
                    }
                    player.points += explosion.points;
                    explosion.points++;
                    this.updateHud = true;
                }
            }
        }

        // kill bullets
        if (explosion.startTime > 0) {
            for (i = 0; i < enemies.length; i++) {
                enemy = enemies[i];
                bullet = enemy.bullet;
                if (bullet && bullet.playerDistance < explosion.radius + 20) {
                    enemy.bullet = null;
                }
            }
        }

        // hurt player by enemies
        for (i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            if (enemy.playerDistance < 50) {
                player.health--;
                enemies.splice(i, 1);
                this.updateHud = true;
            }
        }

        // hurt player by bullets
        for (i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            bullet = enemy.bullet;
            if (bullet && bullet.playerDistance < 50) {
                player.health--;
                enemy.bullet = null;
                this.updateHud = true;
            }
        }

        // enable explosion
        if (this.controller.fire && explosion.startTime === 0 && player.explosives > 0) {
            explosion.points = 1;
            explosion.startTime = timestamp;
            player.explosives--;
            this.updateHud = true;
        }

        // disable explosion
        if (explosion.startTime > 0 && explosion.radius > this.levels.current.explosionRadius) {
            explosion.startTime = 0;
            explosion.radius = 0;
        }

        // update explosion position
        if (explosion.startTime > 0) {
            explosion.x = player.x;
            explosion.y = player.y;
        }

        // collect explosives
        for (i = 0; i < this.explosives.length; i++) {
            explosive = this.explosives[i];
            if (explosive.playerDistance < 50 || explosive.playerDistance < explosion.radius + 10) {
                player.explosives++;
                this.explosives.splice(i, 1);
                this.updateHud = true;
            }
        }

        // remove off-radar enemies
        for (i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            if (enemy.playerDistance > this.worldSize - 20) {
                enemies.splice(i, 1);
                this.updateHud = true;
            }
        }

        // remove off-radar explosives
        for (i = 0; i < this.explosives.length; i++) {
            explosive = this.explosives[i];
            if (explosive.playerDistance > Math.max(this.canvas.width, this.canvas.height, this.worldSize / 2)) {
                this.explosives.splice(i, 1);
                this.updateHud = true;
            }
        }

        // remove off-radar bullets
        for (i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            if (enemy.bullet && enemy.bullet.playerDistance > this.worldSize - 20) {
                enemy.bullet = null;
            }
        }

        // shoot bullets
        for (i = 0; i < enemies.length; i++) {
            enemy = enemies[i];
            if (!enemy.bullet && enemy.playerDistance < 450 && Math.abs(enemy.swing) < 3 && Math.random() > this.levels.current.bulletChance) {
                this._shootBullet(enemy);
                break;
            }
        }

        // show end game
        if (player.health === 0) {
            this._showEndGame();
        }
    },

    _updatePlayerAngle: function (time, timestamp) {
        var player = this.player;
        var controller = this.controller;

        var angleDiff = Math.abs(player.angle - controller.angle);
        var delta = ((time / 5) - player.speed / 10);

        if (controller.angle > player.angle) {
            if (angleDiff < 180) {
                player.angle = Math.min(player.angle + delta, controller.angle);
            } else {
                player.angle -= delta;
            }
        } else {
            if (angleDiff < 180) {
                player.angle = Math.max(player.angle - delta, controller.angle);
            } else {
                player.angle += delta;
            }
        }

        if (controller.touches.length > 0) {
            player.speed += time / 200;
        } else {
            player.speed -= time / 400;
        }
    },

    _updatePlayerVelocityRelative: function (time, timestamp) {
        var result = {angle: this.player.angle, speed: 0};
        var controller = this.controller;

        // LEFT
        if (controller.left > 0 && controller.up === 0 && controller.down === 0) {
            result = this._calculateRelativeAngle(time, [controller.left], 90, 270, 90, 270);
        } else if (controller.left > 0 && controller.up > 0) {
            result = this._calculateRelativeAngle(time, [controller.left, controller.up], 135, 315, 135, 315);
        } else if (controller.left > 0 && controller.down > 0) {
            result = this._calculateRelativeAngle(time, [controller.left, controller.down], 45, 225, 45, 225);
            // RIGHT
        } else if (controller.right > 0 && controller.up === 0 && controller.down === 0) {
            result = this._calculateRelativeAngle(time, [controller.right], 270, 360, 0, 90);
        } else if (controller.right > 0 && controller.up > 0) {
            result = this._calculateRelativeAngle(time, [controller.right, controller.up], 235, 360, 0, 45);
        } else if (controller.right > 0 && controller.down > 0) {
            result = this._calculateRelativeAngle(time, [controller.right, controller.down], 315, 360, 0, 135);
            // UP
        } else if (controller.up > 0 && controller.left === 0 && controller.right === 0) {
            result = this._calculateRelativeAngle(time, [controller.up], 180, 360, 180, 360);
            // DOWN
        } else if (controller.down > 0 && controller.left === 0 && controller.right === 0) {
            result = this._calculateRelativeAngle(time, [controller.down], 0, 180, 0, 180);
        }

        this.player.angle = result.angle;
        if (result.speed > 0) {
            this.player.speed += result.speed * time / 200;
        } else {
            this.player.speed -= time / 400;
        }
    },

    _calculateRelativeAngle: function (time, keys, min1, max1, min2, max2) {
        var player = this.player;
        var result = {};
        result.speed = keys[0];
        if (keys.length === 2) {
            result.speed = (result.speed + keys[1]) / 2;
        }
        var delta = result.speed * ((time / 5) - player.speed / 10);

        if ((player.angle > min1 && player.angle <= max1) || (player.angle > min2 && player.angle <= max2)) {
            result.angle = player.angle + delta;
            if (result.angle > 360) {
                result.angle -= 360;
            } else if (result.angle < 0) {
                result.angle += 360;
            }
            if ((result.angle > min1 && result.angle <= max1) || (result.angle > min2 && result.angle <= max2)) {
                // OK
            } else {
                result.angle = max2;
            }
        } else {
            result.angle = player.angle - delta
        }

        return result;
    },

    _updatePlayerVelocityAbsolute: function (time) {
        this.player.angle -= this.controller.left * ((time / 5) - this.player.speed / 10);
        this.player.angle += this.controller.right * ((time / 5) - this.player.speed / 10);

        if (this.controller.up > 0) {
            this.player.speed += this.controller.up * time / 200;
        } else {
            this.player.speed -= time / 400;
        }
    },

    _updatePositions: function (time, timestamp) {
        var player = this.player;
        var canvas = this.canvas;
        var moveAll = {};

        var borderWidth = 50;
        var minDistance = 100;

        var noGo = minDistance;
        var zone = minDistance + borderWidth;

        if (player.angle > 360) {
            player.angle -= 360;
        } else if (player.angle < 0) {
            player.angle += 360;
        }

        player.speed = Math.max(0, Math.min(5, player.speed));

        player.diffX = player.speed * Math.sin(player.angle * Math.PI / 180) * time / 16;
        player.diffY = -player.speed * Math.cos(player.angle * Math.PI / 180) * time / 16;

        player.distX = Math.min(player.x, canvas.width - player.x);
        player.distY = Math.min(player.y, canvas.height - player.y);

        if ((player.x < zone && player.diffX > 0) || (canvas.width - player.x < zone && player.diffX < 0)) {
            player.borderX += Math.abs(player.diffX) / noGo;
            player.borderX = Math.min((zone - noGo) / zone, player.borderX);
        } else {
            player.borderX = (player.distX - noGo) / zone;
        }
        player.borderX = Math.min(0.8, player.borderX);

        if ((player.y < zone && player.diffY > 0) || (canvas.height - player.y < zone && player.diffY < 0)) {
            player.borderY += Math.abs(player.diffY) / noGo;
            player.borderY = Math.min((zone - noGo) / zone, player.borderY);
        } else {
            player.borderY = (player.distY - noGo) / zone;
        }
        player.borderY = Math.min(0.8, player.borderY);

        if (this.controller.type === "mobile") {
            player.borderX = 0;
            player.borderY = 0;
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
        } else {
            player.x += player.borderX * player.diffX;
            player.y += player.borderY * player.diffY;
        }

        moveAll.x = (1 - player.borderX) * player.diffX;
        moveAll.y = (1 - player.borderY) * player.diffY;

        this._moveAll(moveAll.x, moveAll.y);
        this.graphics.moveSky(time / 256, 0, -time / 512, 0);

        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            enemy.playerDistance = this.utils.distance(enemy, player);
            enemy.speed = Math.max(2, Math.min(this.levels.current.enemySpeed, this.levels.current.enemySpeed * 200 / enemy.playerDistance));
            enemy.angle = 90 + Math.atan2(player.y - enemy.y, player.x - enemy.x) * 180 / Math.PI;
            enemy.swing = 30 * (Math.sin(enemy.swingOffset * Math.PI + timestamp / (300 + 100 * enemy.swingOffset)));
            enemy.angle = enemy.angle + enemy.swing;
            enemy.x += enemy.speed * Math.sin(enemy.angle * Math.PI / 180) * time / 16;
            enemy.y += -enemy.speed * Math.cos(enemy.angle * Math.PI / 180) * time / 16;

            if (enemy.bullet) {
                var bullet = enemy.bullet;
                bullet.playerDistance = this.utils.distance(bullet, player);
                bullet.x += bullet.speed * Math.sin(bullet.angle * Math.PI / 180) * time / 16;
                bullet.y += -bullet.speed * Math.cos(bullet.angle * Math.PI / 180) * time / 16;
                bullet.rotation += time / 5;
            }
        }

        for (var i = 0; i < this.explosives.length; i++) {
            var explosive = this.explosives[i];
            explosive.rotation += time / 20;
            explosive.playerDistance = this.utils.distance(explosive, player);
        }

        return moveAll;
    },

    _moveAll: function (x, y) {
        for (var i = 0; i < this.enemies.length; i++) {
            var enemy = this.enemies[i];
            enemy.move(-x, -y);
        }
        for (var i = 0; i < this.explosives.length; i++) {
            var explosive = this.explosives[i];
            explosive.move(-x, -y);
        }
        this.graphics.moveSky(-x, -y, -x, -y);
    },

    _addEnemy: function () {
        var enemy = new Enemy();
        var position = this.utils.generateDistantPoint(this.worldSize / 2, 0.05);
        enemy.x = position.x + this.player.x;
        enemy.y = position.y + this.player.y;
        enemy.speed = 2;
        enemy.swingOffset = Math.random();
        this.enemies.push(enemy);
        this.updateHud = true;
    }
    ,

    _addExplosive: function () {
        var explosive = new Explosive();
        var position = this.utils.generateDistantPoint(this.worldSize / 4, 0.2);
        explosive.x = position.x + this.player.x;
        explosive.y = position.y + this.player.y;
        this.explosives.push(explosive);
        this.updateHud = true;
    }

};

function Particle() {
}

Particle.prototype = {
    constructor: Particle,

    x: 0,
    y: 0,
    angle: 0,
    rotation: 0,
    speed: 0,
    playerDistance: 0,

    move: function (dx, dy) {
        this.x += dx;
        this.y += dy;
    }
};

function Explosive() {
}

Explosive.prototype = {
    __proto__: Particle.prototype,
    constructor: Explosive
};

function Player() {
}

Player.prototype = {
    __proto__: Particle.prototype,
    constructor: Player,

    health: 0,
    explosives: 0,
    points: 0,

    distX: 0,
    diffX: 0,
    borderX: 0,

    distY: 0,
    diffY: 0,
    borderY: 0

};

function Explosion() {
}

Explosion.prototype = {
    __proto__: Particle.prototype,
    constructor: Explosion,

    startTime: 0,
    radius: 0,
    points: 0,
    time: 0
};

function Enemy() {
}

Enemy.prototype = {
    __proto__: Particle.prototype,
    constructor: Enemy,

    swing: 0,
    swingOffset: 0,
    bullet: null,

    move: function (dx, dy) {
        Particle.prototype.move.call(this, dx, dy);
        if (this.bullet) {
            this.bullet.move(dx, dy);
        }
    }
};