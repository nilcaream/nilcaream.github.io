import * as jQuery from "./scripts/jquery-3.5.0.min.js"
import { GameUi } from "./scripts/game-ui.js"
import { Human } from "./scripts/human.js"

$(() => {
    const world = { width: 20, height: 20, unit: 30, pad: 1 };
    const gameUi = new GameUi(world, "board");

    Human.register("keydown", (dx, dy) => { gameUi.game.step(dx, dy); gameUi.draw(); });
    gameUi.draw();
});
