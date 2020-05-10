import * as jQuery from "./scripts/jquery-3.5.0.min.js"
import { Storage } from "./scripts/storage.js"
import { GameUi } from "./scripts/game-ui.js"
import { Computer } from "./scripts/computer.js"
import { Net } from "./scripts/net.js"
import { Learn } from "./scripts/learn.js"

$(() => {
    if (window.innerWidth > window.innerHeight) {
        $("#board").parent().addClass("fl");
    }

    let result = Storage.load()[0];
    const size = Math.min(window.innerWidth, window.innerHeight) - 5;
    const netWidth = window.innerWidth > window.innerHeight ? window.innerWidth / 2 : window.innerWidth - 5;
    const netHeight = window.innerWidth > window.innerHeight ? window.innerHeight - 5 : 0;

    const ui = new GameUi({ width: 20, height: 20, unit: size / 20, pad: 1 }, "board");
    const computer = new Computer(ui.game);
    const inputTexts = (input) => [
        "Bias",
        Number(input[1]).toFixed(2),
        Number(input[2]).toFixed(2),
        Number(input[3]).toFixed(2),
        input[4] > 0.5 ? "RIGHT" : "-",
        input[5] > 0.5 ? "LEFT" : "-",
        input[6] > 0.5 ? "DOWN" : "-",
        input[7] > 0.5 ? "UP" : "-",

    ];
    const outputTexts = (output) => {
        const results = [];
        const max = output.indexOf(Math.max(...output));
        const labels = ["RIGHT", "LEFT", "DOWN", "UP"];
        output.forEach((o, i) => {
            results.push({
                color: `rgb(${i !== max ? 255 : 0},${i === max ? 255 : 0},0)`,
                label: i === max ? labels[i] : "-"
            });
        });
        return results;
    }
    const net = new Net(netWidth, netHeight, "net", result.weights, outputTexts, inputTexts);

    ui.source = Learn.identify(result);

    GameUi.animate(() => {
        const input = computer.calculateInput();
        const layers = computer.step(result.weights);
        ui.draw();
        net.draw(input, result.weights, layers);
        if (ui.game.lives <= 0) {
            result = Storage.load()[0];
            ui.source = Learn.identify(result);
            ui.game.reset();
        }
    }, 100);
});
