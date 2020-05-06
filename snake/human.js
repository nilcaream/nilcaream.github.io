class Human {

    static register(eventType, callback) {
        $(document).on(eventType, event => {
            if (event.code === "ArrowRight") {
                callback(1, 0);
            } else if (event.code === "ArrowLeft") {
                callback(-1, 0);
            } else if (event.code === "ArrowUp") {
                callback(0, -1);
            } else if (event.code === "ArrowDown") {
                callback(0, 1);
            }
        });
    }
}
