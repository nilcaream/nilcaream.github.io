import * as jQuery from "./scripts/jquery-3.5.0.min.js"
import { Storage } from "./scripts/storage.js"
import { Learn } from "./scripts/learn.js"

$(() => {
    let running = true;
    const now = () => { let d = new Date(); return new Date(d.getTime() - 60 * 1000 * d.getTimezoneOffset()).toISOString().replace(/[TZ]/g, " ").trim(); };
    const log = (text) => $("#results").prepend($("<div></div>").text(`${now()} ${text}`));
    window.addEventListener("error", (e) => log(`Error ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`));
    if (window.location.hash.indexOf("delete") !== -1) {
        Storage.save([]);
    }
    const loadWeights = (amount) => Storage.load().slice(0, amount).map(x => x.weights)
    const weights = window.location.hash.indexOf("reset") !== -1 ? [] : loadWeights(10);
    const learn = new Learn(100, 1000, weights, log, () => running = false);

    learn.start();
    setInterval(() => Storage.add(learn.best), 5000);

    const updateStatus = () => {
        $("#status").empty()
            .text(`${now()} generation:${learn.generation}/${learn.generations}, populationSize:${learn.populationSize}, movesPerMs: ${learn.movesPerMs.toPrecision(3)}, score: ${(learn.best[0] || { score: 0 }).score.toFixed(2)}, running: ${running}`);
    };

    const addButton = (text, action) => $("#controlls").append($("<a></a>").addClass("pr05").attr("href", "#").text(text).click(action));
    addButton("P:50", () => learn.reset(50, 0, loadWeights(5)));
    addButton("P:100", () => learn.reset(100, 0, loadWeights(10)));
    addButton("P:500", () => learn.reset(500, 0, loadWeights(50)));
    addButton("P:1000", () => learn.reset(1000, 0, loadWeights(100)));
    addButton("P:5000", () => learn.reset(5000, 0, loadWeights(500)));
    addButton("P:10000", () => learn.reset(10000, 0, loadWeights(1000)));
    $("#controlls").append($("<span></span>").text("|"));
    addButton("G:100", () => learn.reset(0, 100, loadWeights(0.1 * learn.populationSize)));
    addButton("G:1000", () => learn.reset(0, 1000, loadWeights(0.1 * learn.populationSize)));
    addButton("G:10000", () => learn.reset(0, 10000, loadWeights(0.1 * learn.populationSize)));
    addButton("G:100000", () => learn.reset(0, 100000, loadWeights(0.1 * learn.populationSize)));
    $("#controlls").append($("<span></span>").text("|"));
    addButton("Clear", () => $("#results").empty());
    addButton("Restart", () => learn.reset(0, 0, loadWeights(0.1 * learn.populationSize)));
    addButton("Start", () => {
        if (!running) {
            learn.start();
            running = true;
        }
    });
    addButton("Stop", () => learn.generations = 0);
    addButton("Reset", () => learn.reset(0, 0, []));
    addButton("Delete", () => { learn.best = []; Storage.save([]); });

    setInterval(() => updateStatus(), 500);
});
