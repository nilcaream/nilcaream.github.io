$(() => {
    const state = { dx: 0, dy: 1 };
    const world = { width: 20, height: 20, unit: 30, pad: 1, refreshInterval: 200 };
    const gameUi = new GameUi(world, "board");

    Human.register("keydown", (dx, dy) => { state.dx = dx; state.dy = dy });
    GameUi.animate(() => {
        gameUi.game.step(state.dx, state.dy);
        gameUi.draw();
    }, world.refreshInterval);
});
