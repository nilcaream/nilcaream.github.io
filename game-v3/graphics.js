function Graphics(mainCanvasId, hudBackCanvasId, hudFrontCanvasId, pointsDivId, levelDivId) {
    this.hud = new Hud();
    this.skyFront = new Sky();
    this.skyBack = new Sky();

    this.images = new Images();
    this.utils = new Utils();

    this.main = document.getElementById(mainCanvasId);
    this.main.width = window.innerWidth;
    this.main.height = window.innerHeight;
    this.main.ctrContext = this.main.getContext("2d");

    this.hudBack = document.getElementById(hudBackCanvasId);
    this.hudBack.width = window.innerWidth;
    this.hudBack.height = window.innerHeight;
    this.hudBack.ctrContext = this.hudBack.getContext("2d");

    this.hudFront = document.getElementById(hudFrontCanvasId);
    this.hudFront.width = window.innerWidth;
    this.hudFront.height = window.innerHeight;
    this.hudFront.ctrContext = this.hudFront.getContext("2d");

    this.points = document.getElementById(pointsDivId);
    this.points.style.left = Math.ceil(this.main.width / 2 - this.points.offsetWidth / 2) + "px";

    this.level = document.getElementById(levelDivId);
    // this.level.style.left = Math.ceil(this.main.width / 2 - this.points.offsetWidth / 2) + "px";

    this._generateSky(this.skyBack.pixels, this.main.width * this.main.height / (120 * 120), 0);
    this._generateSky(this.skyFront.pixels, this.main.width * this.main.height / (100 * 100), 100);

    this.images.load("player", "rocket.png");
    this.images.load("enemy", "alien.png");
    this.images.load("explosive", "radiation.png");
    this.images.load("keyboard", "keyboard.png");
    this.images.load("gamepad", "gamepad.png");
    this.images.load("moveAbsolute", "move-absolute.png");
    this.images.load("moveRelative", "move-relative.png");
    this.images.load("bullet", "connection.png");
    this.images.load("mobile", "tablet.png");
    this.images.load("touch", "movement.png");

    this.worldSize = Math.sqrt(this.main.width * this.main.width + this.main.height * this.main.height) * 3 / 2;
    this.hud.radar.scale = this.worldSize / this.hud.radar.radius;
}

function Hud() {
    this.height = 50;
    this.border = 4;
    this.radar = {scale: 15, offset: 140, radius: 120};
}

function Sky() {
    this.x = 0;
    this.y = 0;
    this.pixels = [];
}

Graphics.prototype = {
    constructor: Graphics,

    onInitialized: function (callback) {
        return this.images.onInitialized(callback);
    },

    drawMain: function (timestamp, player, explosion, enemies, explosives, bullets) {
        this.main.ctrContext.clearRect(0, 0, this.main.width, this.main.height);

        this._drawSkies();
        this._drawExplosives(explosives);
        this._drawEnemies(enemies);
        this._drawBullets(bullets);
        if (explosion.startTime > 0) {
            this._drawExplosion(timestamp, explosion);
        }
        this._drawPlayer(player);
        this._drawRadar(player, enemies, explosives, bullets);
    },

    drawHudBack: function (maxExplosives, maxHealth, levelNumber) {
        var canvas = this.hudBack;
        var context = this.hudBack.ctrContext;

        context.clearRect(0, 0, canvas.width, canvas.height);

        // explosive
        context.save();
        context.translate(5, 5);
        var explosiveWidth = 2 * this.hud.border + maxExplosives * (10 + this.images.get("explosive").width);
        context.fillStyle = "rgba(0,255,0,0.15)";
        context.fillRect(0, 0, explosiveWidth, this.hud.height);
        context.fillStyle = "rgba(0,0,0,0.15)";
        context.fillRect(this.hud.border, this.hud.border, explosiveWidth - 2 * this.hud.border, this.hud.height - 2 * this.hud.border);
        context.restore();

        // health
        context.save();
        var playerImage = this.images.get("player");
        var playerHeight = this.hud.height - 2 * this.hud.border;
        var playerWidth = playerHeight * playerImage.width / playerImage.height;
        var healthHeight = this.hud.height;
        var healthWidth = maxHealth * playerWidth;
        context.translate(canvas.width - healthWidth - 5, 5);
        context.fillStyle = "rgba(0,255,0,0.15)";
        context.fillRect(0, 0, healthWidth, healthHeight);
        context.fillStyle = "rgba(0,0,0,0.15)";
        context.fillRect(this.hud.border, this.hud.border, healthWidth - 2 * this.hud.border, healthHeight - 2 * this.hud.border);
        context.restore();

        // radar
        context.save();
        context.translate(this.hud.radar.offset, canvas.height - this.hud.radar.offset);

        context.fillStyle = "white";
        context.fillRect(-1, -1, 3, 3);

        context.beginPath();
        context.arc(0, 0, this.hud.radar.radius, 0, 2 * Math.PI);
        context.closePath();
        context.fillStyle = "rgba(0,255,0,0.15)";
        context.fill();

        context.beginPath();
        context.arc(0, 0, this.hud.radar.radius, 0, 2 * Math.PI);
        context.closePath();
        context.lineWidth = 2;
        context.strokeStyle = "rgba(0,255,0,0.2)";
        context.stroke();

        context.beginPath();
        context.arc(0, 0, this.hud.radar.radius / 2, 0, 2 * Math.PI);
        context.closePath();
        context.lineWidth = 2;
        context.strokeStyle = "rgba(0,255,0,0.12)";
        context.stroke();

        context.restore();

        this.level.innerText = "Level " + levelNumber;
    },

    drawHudFront: function (currentExplosives, maxExplosives, currentHealth, maxHealth, points, controllers) {
        var canvas = this.hudFront;
        var context = this.hudFront.ctrContext;

        context.clearRect(0, 0, canvas.width, this.hud.height + 20);

        // explosive
        context.save();
        context.translate(5, 5);
        context.translate(this.hud.height / 2, this.hud.height / 2);
        var explosiveImage = this.images.get("explosive");
        for (var i = 0; i < currentExplosives; i++) {
            context.drawImage(explosiveImage, -explosiveImage.width / 2, -explosiveImage.height / 2);
            context.translate(explosiveImage.width + 10, 0);
        }
        context.globalAlpha = 0.1;
        for (var i = currentExplosives; i < maxExplosives; i++) {
            context.drawImage(explosiveImage, -explosiveImage.width / 2, -explosiveImage.height / 2);
            context.translate(explosiveImage.width + 10, 0);
        }
        context.restore();

        // health
        context.save();
        var playerImage = this.images.get("player");
        var playerHeight = this.hud.height - 2 * this.hud.border;
        var playerWidth = playerHeight * playerImage.width / playerImage.height;
        context.translate(canvas.width - 5, 5 + this.hud.border);
        for (var i = 0; i < currentHealth; i++) {
            context.translate(-playerWidth, 0);
            context.drawImage(playerImage, 0, 0, playerImage.width, playerImage.height, 0, 0, playerWidth, playerHeight);
        }
        context.globalAlpha = 0.1;
        for (var i = currentHealth; i < maxHealth; i++) {
            context.translate(-playerWidth, 0);
            context.drawImage(playerImage, 0, 0, playerImage.width, playerImage.height, 0, 0, playerWidth, playerHeight);
        }
        context.restore();

        // controllers
        context.save();
        context.clearRect(canvas.width - 100, canvas.height - 50, 100, 50);
        context.translate(canvas.width - 5, canvas.height - 5);
        for (var i = 0; i < controllers.length; i++) {
            var image = this.images.get(controllers[i]);
            context.drawImage(image, -image.width, -image.height);
            context.translate(-image.width - 5, 0);
        }
        context.restore();

        var border = 128;
        context.save();
        context.clearRect(canvas.width - 192 - border / 2, canvas.height / 2 - border / 2, border, border);
        if (controllers.indexOf("mobile") !== -1) {
            context.translate(canvas.width - 192, canvas.height / 2);
            var image = this.images.get("touch");
            context.drawImage(image, -image.width / 2, -image.height / 2);
        }
        context.restore();

        // points
        this.points.innerText = points;
    },

    moveSky: function (frontX, frontY, backX, backY) {
        this.skyFront.x += frontX;
        this.skyFront.y += frontY;
        this.skyBack.x += backX;
        this.skyBack.y += backY;
    },

    _generateSky: function (pixels, count, baseColor) {
        for (var i = 0; i < count; i++) {
            var pixel = {};
            pixel.x = Math.ceil(Math.random() * this.main.width);
            pixel.y = Math.ceil(Math.random() * this.main.height);
            var color = Math.floor(baseColor + 155 * Math.random()).toString(16);
            if (color.length === 1) {
                color = "0" + color;
            }
            pixel.color = "#" + color + color + color;
            pixels.push(pixel);
        }
    },

    _drawRadar: function (player, enemies, explosives, bullets) {
        var canvas = this.hudFront;
        var context = this.hudFront.ctrContext;

        context.clearRect(0, canvas.height - this.hud.radar.offset - this.hud.radar.radius - 5, this.hud.radar.offset + this.hud.radar.radius + 5, canvas.height);

        // radar
        context.save();
        context.translate(this.hud.radar.offset, canvas.height - this.hud.radar.offset);

        context.fillStyle = "red";
        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            context.fillRect(Math.ceil((enemy.x - player.x) / this.hud.radar.scale - 1), Math.ceil((enemy.y - player.y) / this.hud.radar.scale - 1), 3, 3);
        }

        context.fillStyle = "#8888ff";
        for (var i = 0; i < bullets.length; i++) {
            var bullet = bullets[i];
            context.fillRect(Math.ceil((bullet.x - player.x) / this.hud.radar.scale - 1), Math.ceil((bullet.y - player.y) / this.hud.radar.scale - 1), 3, 3);
        }

        context.fillStyle = "green";
        for (var i = 0; i < explosives.length; i++) {
            var explosive = explosives[i];
            context.fillRect(Math.ceil((explosive.x - player.x) / this.hud.radar.scale - 1), Math.ceil((explosive.y - player.y) / this.hud.radar.scale - 1), 3, 3);
        }

        context.restore();
    },

    _drawPlayer: function (player) {
        var image = this.images.get("player");
        this.main.ctrContext.save();
        this.main.ctrContext.translate(player.x, player.y);
        this.main.ctrContext.rotate(player.angle * Math.PI / 180);
        this.main.ctrContext.drawImage(image, -image.width / 2, -image.height / 2);
        this.main.ctrContext.restore();
    },

    _drawEnemies: function (enemies) {
        var image = this.images.get("enemy");
        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];
            this.main.ctrContext.save();
            this.main.ctrContext.translate(enemy.x, enemy.y);
            this.main.ctrContext.rotate(enemy.angle * Math.PI / 180);
            this.main.ctrContext.drawImage(image, -image.width / 2, -image.height / 2);
            this.main.ctrContext.restore();
        }
    },

    _drawBullets: function (bullets) {
        var image = this.images.get("bullet");
        var context = this.main.ctrContext;
        for (var i = 0; i < bullets.length; i++) {
            var bullet = bullets[i];
            context.save();
            context.translate(bullet.x, bullet.y);
            context.rotate(bullet.rotation * Math.PI / 180);
            context.drawImage(image, -image.width / 2, -image.height / 2);
            context.restore();
        }
    },

    _drawExplosives: function (explosives) {
        var image = this.images.get("explosive");
        var context = this.main.ctrContext;
        for (var i = 0; i < explosives.length; i++) {
            var explosive = explosives[i];
            context.save();
            context.translate(explosive.x, explosive.y);
            context.rotate(explosive.rotation * Math.PI / 180);
            context.drawImage(image, -image.width / 2, -image.height / 2);
            context.restore();
        }
    },

    _drawSky: function (sky) {
        this.main.ctrContext.save();
        var bx = Math.ceil(sky.x);
        var by = Math.ceil(sky.y);
        for (var i = 0; i < sky.pixels.length; i++) {
            var pixel = sky.pixels[i];
            var x = this.utils.mod(pixel.x + bx, this.main.width);
            var y = this.utils.mod(pixel.y + by, this.main.height);
            this.main.ctrContext.fillStyle = pixel.color;
            this.main.ctrContext.fillRect(x, y, 1, 1);
        }
        this.main.ctrContext.restore();
    },

    _drawSkies: function () {
        this._drawSky(this.skyBack);
        this._drawSky(this.skyFront);
    },

    _drawExplosion: function (timestamp, explosion) {
        explosion.time = timestamp - explosion.startTime;
        var context = this.main.ctrContext;

        context.save();
        context.translate(explosion.x, explosion.y);

        explosion.radius = 40 + explosion.time / 5;

        context.beginPath();
        context.arc(0, 0, explosion.radius, 0, 2 * Math.PI);
        context.closePath();

        var gradient = context.createRadialGradient(0, 0, 0, 0, 0, explosion.radius);
        gradient.addColorStop(0, '#001100');
        gradient.addColorStop(0.7, '#002200');
        gradient.addColorStop(0.9, 'red');
        gradient.addColorStop(1, 'yellow');
        context.fillStyle = gradient;
        context.fill();

        context.restore();
    }
};