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
        console.log(`Created item ${item.id}`);

        const save = (content) => {
            content.attr("contenteditable", "false");
            item.content = content.text().trim();
        };

        const li = $("<li></li>").attr("data-item-id", item.id);
        const content = $("<div></div>").addClass("content").text(item.content).focusout(() => save(content));
        const info = $("<div></div>").addClass("info");
        const orders = $("<div></div>").addClass("orders");
        const edit = $("<div></div>").addClass("edit").text("Edit").click(() => {
            content.toggleClass("editable");
            if (content.hasClass("editable")) {
                content.attr("contenteditable", "true");
                content.focus();
            } else {
                save(content);
            }
        });

        info.append(orders).append(edit);
        li.append(content).append(info);
        ul.append(li);
        recalculateOrders(ul);
    };

    const recalculateOrders = (ul) => {
        const listId = ul.attr("data-list-id");
        ul.find("li").each((i, element) => {
            const li = $(element);
            const itemId = li.attr("data-item-id");
            data[itemId].order[listId] = i;

            const orders = li.find("div.orders").empty();
            const keys = Object.keys(data[itemId].order);
            orders.text(keys.join(" | "));
        });
        console.log(JSON.stringify(data));
    };

    $(".items-container").each((i, element) => {
        const container = $(element);
        const ul = $("<ul></ul>").addClass("items").attr("data-list-id", container.attr("data-list-id"));
        const menu = $("<div></div>").addClass("menu");
        const addMenu = $("<span></span>").text("+").addClass("add").click(() => add(ul));
        const title = $("<span></span>").text(container.attr("data-list-name")).addClass("title");
        menu.append(addMenu).append(title);
        container.append(menu).append(ul);
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
            console.log(`Removed ${itemId} from ${listId}`);
            recalculateOrders(ul);
        },
        receive: (event, ui) => {
            const ul = $(event.target);
            const li = ui.item.first();
            const listId = ul.attr("data-list-id");
            const itemId = li.attr("data-item-id");
            console.log(`Added ${itemId} to ${listId}`);
            recalculateOrders(ul);
        },
        stop: (event, ui) => {
            const ul = $(event.target);
            const li = ui.item.first();
            const listId = ul.attr("data-list-id");
            const itemId = li.attr("data-item-id");
            console.log(`Stop ${itemId} from ${listId}`);
            recalculateOrders(ul);
        }
    });//.disableSelection();

});
