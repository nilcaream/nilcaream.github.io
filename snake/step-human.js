class StepHuman {
    constructor(stepCallback) {
        $(document).keyup(event => {
            if (event.code === "ArrowRight") {
                stepCallback(1, 0);
            } else if (event.code === "ArrowLeft") {
                stepCallback(-1, 0);
            } else if (event.code === "ArrowUp") {
                stepCallback(0, -1);
            } else if (event.code === "ArrowDown") {
                stepCallback(0, 1);
            }
        });
    }
}
