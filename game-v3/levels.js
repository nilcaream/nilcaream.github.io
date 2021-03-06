function Levels() {
    this.number = 0;
    this.current = null;

    this.available = [
        new Level(10, 10, 3, 4, 150, 3, 4.0),
        new Level(9, 9, 3.5, 5, 145, 4, 4.2),
        new Level(8, 8, 3.7, 6, 140, 5, 4.4),
        new Level(7, 7, 4.1, 6, 135, 6, 4.7),
        new Level(6, 6, 4.4, 7, 130, 7, 5.0),
        new Level(5, 5, 4.7, 9, 125, 8, 5.3),
        new Level(4, 4, 5.0, 8, 120, 8, 5.6),
        new Level(3, 3, 5.2, 8, 120, 8, 5.9),
        new Level(2, 2, 5.5, 9, 120, 8, 6.2),
        new Level(2, 1, 5.5, 9, 120, 8, 6.5)
    ];

    this.set(0);
}

Levels.prototype = {
    constructor: Levels,

    set: function (id) {
        this.number = id;
        this.current = this.available[id];
    }
};

function Level(explosives, health, enemySpeed, enemiesCount, explosionRadius, bulletChance, bulletSpeed) {
    this.explosives = explosives;
    this.health = health;
    this.enemySpeed = enemySpeed;
    this.enemiesCount = enemiesCount;
    this.explosionRadius = explosionRadius;
    this.bulletChance = bulletChance;
    this.bulletSpeed = bulletSpeed;
}
