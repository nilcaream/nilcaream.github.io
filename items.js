'use strict';

$(() => {
    const data = {};

    const id = () => new Date().getTime().toString(36) + Math.random().toString(36).substr(-4);

    const createItem = () => {
        const item = {
            id: id(),
            history: {},
            order: {}
        }
        item.content = item.id;
        item.history[new Date().getTime().toString()] = "created";
        return item;
    };

    const add = (ul) => {
        const item = createItem();
        data[item.id] = item;
        const li = $("<li></li>")
            .attr("data-item-id", item.id)
            .text(item.content);
        ul.append(li);
        recalculateOrders(ul);
    };

    const recalculateOrders = (ul) => {
        const listId = ul.attr("data-list-id");
        ul.find("li").each((i, element) => {
            const li = $(element);
            const itemId = li.attr("data-item-id");
            data[itemId].order[listId] = i;
        });
    };

    $(".items-container").each((i, element) => {
        const container = $(element);
        const ul = $("<ul></ul>").addClass("items").attr("data-list-id", container.attr("data-list-id"));
        const addButton = $("<button></button>").text("Add").click(() => {
            console.log("Add");
            add(ul);
        });
        container.append(ul).append(addButton);
    });

    $(".items").sortable({
        connectWith: ".items",
        dropOnEmpty: true,
        remove: (event, ui) => {
            const ul = $(event.target);
            const li = ui.item.first();
            const listId = ul.attr("data-list-id");
            const itemId = li.attr("data-item-id");
            delete data[itemId].order[listId];
            recalculateOrders(ul);
            console.log(`Removed ${itemId} from ${listId}`);
            console.log(JSON.stringify(data));
        },
        receive: (event, ui) => {
            const ul = $(event.target);
            const li = ui.item.first();
            const listId = ul.attr("data-list-id");
            const itemId = li.attr("data-item-id");
            recalculateOrders(ul);
            console.log(`Added ${itemId} to ${listId}`);
            console.log(JSON.stringify(data));
        }
    }).disableSelection();

});
