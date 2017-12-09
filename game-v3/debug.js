function Debug(divId) {
    this.enabled = false;
    this.lastRefreshTimestamp = 0;
    this.refreshTime = 100;
    this.element = document.getElementById(divId);
}

Debug.prototype = {
    constructor: Debug,

    update: function (timestamp, player, explosion, controller, enemies, explosives, frameTime, worldSize, canvas) {
        if (timestamp - this.lastRefreshTimestamp > this.refreshTime) {
            this.lastRefreshTimestamp = timestamp;
            var text = "FPS = " + (1000 / frameTime).toFixed(2) + "\n";
            text += "world.(width,height,size) = " + Math.round(canvas.width) + " " + Math.round(canvas.height) + " " + Math.round(worldSize) + "\n";
            text += "--------------------\n";
            text += "player.(x,y) = " + player.x.toFixed(2) + " " + player.y.toFixed(2) + "\n";
            text += "player.(speed,angle,rotation) = " + player.speed.toFixed(2) + " " + player.angle.toFixed(2) + " " + player.rotation.toFixed(2) + "\n";
            text += "player.(health,explosives,points) = " + player.health + " " + player.explosives + " " + player.points + "\n";
            text += "--------------------\n";
            text += "player.dist(X.Y) = " + player.distX.toFixed(2) + " " + player.distY.toFixed(2) + "\n";
            text += "player.diff(X,Y) = " + player.diffX.toFixed(2) + " " + player.diffY.toFixed(2) + "\n";
            text += "player.border(X,Y) = " + player.borderX.toFixed(2) + " " + player.borderY.toFixed(2) + "\n";
            text += "--------------------\n";
            text += "explosion.(startTime,time) = " + explosion.startTime.toFixed(2) + " " + explosion.time.toFixed(2) + "\n";
            text += "explosion.(radius,points) = " + explosion.radius.toFixed(2) + " " + explosion.points + "\n";
            text += "--------------------\n";
            text += "controller.(up,down) = " + controller.up.toFixed(2) + " " + controller.down.toFixed(2) + "\n";
            text += "controller.(left,right) = " + controller.left.toFixed(2) + " " + controller.right.toFixed(2) + "\n";
            text += "controller.(fire,select,start) = " + controller.fire + " " + controller.select + " " + controller.start + "\n";
            text += "--------------------\n";

            var gamepad = controller.gamepad();
            if (gamepad) {
                text += gamepad.id.replace(/ +/g, " ") + "\n";
                for (var i = 0; i < gamepad.buttons.length; i++) {
                    text += "gamepad.buttons[" + i + "].pressed = " + gamepad.buttons[i].pressed + "\n";
                }

                for (var i = 0; i < gamepad.axes.length; i++) {
                    text += "gamepad.axes[" + i + "] = " + gamepad.axes[i] + "\n";
                }
            } else {
                text += "No gamepads\n";
            }

            for (var i = 0; i < enemies.length; i++) {
                var enemy = enemies[i];
                text += "--------------------\n";
                text += "enemy[" + i + "].(x,y) = " + enemy.x.toFixed(2) + " " + enemy.y.toFixed(2) + "\n";
                text += "enemy[" + i + "].(speed,angle) = " + enemy.speed.toFixed(2) + " " + enemy.angle.toFixed(2) + "\n";
                text += "enemy[" + i + "].(swing,rotation) = " + enemy.swing.toFixed(2) + " " + enemy.rotation.toFixed(2) + "\n";
                text += "enemy[" + i + "].playerDistance = " + enemy.playerDistance.toFixed(2) + "\n";
                var bullet = enemy.bullet;
                if (bullet) {
                    text += "enemy.bullet[" + i + "].(x,y) = " + bullet.x.toFixed(2) + " " + bullet.y.toFixed(2) + "\n";
                    text += "enemy.bullet[" + i + "].(speed,angle,rotation) = " + bullet.speed.toFixed(2) + " " + bullet.angle.toFixed(2) + " " + bullet.rotation.toFixed(2) + "\n";
                    text += "enemy.bullet[" + i + "].playerDistance = " + bullet.playerDistance.toFixed(2) + "\n";
                }
            }
            for (var i = 0; i < explosives.length; i++) {
                var explosive = explosives[i];
                text += "--------------------\n";
                text += "explosive[" + i + "].(x,y) = " + explosive.x.toFixed(2) + " " + explosive.y.toFixed(2) + "\n";
                text += "explosive[" + i + "].angle = " + explosive.angle.toFixed(2) + "\n";
                text += "explosive[" + i + "].playerDistance = " + explosive.playerDistance.toFixed(2) + "\n";
            }
            this.element.innerText = text;
        }
    },

    toggle: function () {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.element.style.display = "block";
        } else {
            this.element.style.display = "none";
        }
        return this.enabled;
    }
};
