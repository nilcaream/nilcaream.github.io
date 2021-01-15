'use strict';

$(() => {
    const data = [];

    const id = () => new Date().getTime().toString(36) + Math.random().toString(36).substr(-4);

    const draw = (items) => {
        const target = $(".items").first().empty();
        items.forEach(item => {
            const element = $("<li></li>").text(item.content + " " + item.id);

            target.append(element);
        });
    };

    $(".add-item").click(() => {
        console.log("add item");
        const item = {
            "id": id(),
            "content": "new item",
            "history": {}
        }
        item.history[new Date().getTime().toString()] = "created";
        data.push(item);
        draw(data);
    });

    $(".items").sortable({
        connectWith: ".items",
        dropOnEmpty: true
    }).disableSelection();
});
