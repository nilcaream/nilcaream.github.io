$(() => {
    const world = { width: 20, height: 20, unit: 30, pad: 1 };
    const gameUi = new GameUi(world, "board");

    Human.register("keydown", (dx, dy) => {
        gameUi.game.step(dx, dy);
        const head = gameUi.game.snake.getHead();
        const distances = gameUi.game.snake.distanceToNonEmpty(world.width, world.height);
        gameUi.source = `H:(${head.x},${head.y}), dx:[${distances.xNegative},${distances.xPositive}], dy:[${distances.yNegative},${distances.yPositive}]`;
        gameUi.draw();
    });
    gameUi.draw();
});
