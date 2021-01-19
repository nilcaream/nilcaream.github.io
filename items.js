'use strict';

$(() => {
    const storage = {
        data: {},

        modified: false,

        startAutoSave: function () {
            const that = this;
            setInterval(() => {
                if (that.modified) {
                    that.save();
                }
            }, 2000);
        },

        load: function () {
            this.data = JSON.parse(window.localStorage.getItem("nc.items") || "{}");
            this.modified = false;
            console.log(`Loaded ${Object.keys(this.data).length} items`);
        },

        save: function () {
            window.localStorage.setItem("nc.items", JSON.stringify(this.data || {}));
            this.modified = false;
            console.log(`Saved ${Object.keys(this.data).length} items`);
        },

        addToHistory: function (item, message) {
            item.history[new Date().getTime().toString()] = message;
            this.modified = true;
        },

        createItem: function () {
            const item = {
                id: new Date().getTime().toString(36) + Math.random().toString(36).substr(-4),
                history: {},
                order: {},
                content: "New item"
            }
            this.addToHistory(item, "created");
            this.data[item.id] = item;
            console.log(`Created item ${item.id}`);
            this.modified = true;
            return item;
        },

        getItems: function (listId) {
            return Object.values(this.data)
                .filter(item => item.order[listId])
                .sort((i0, i1) => i0.order[listId] - i1.order[listId]);
        },

        getOtherItems: function (listIds) {
            return Object.values(this.data)
                .filter(item => !Object.keys(item.order).some(r => listIds.indexOf(r) !== -1));
        },

        setOrder: function (itemId, listId, order) {
            this.data[itemId].order[listId] = order;
            this.modified = true;
        },

        removeOrder: function (itemId, listId) {
            delete this.data[itemId].order[listId];
            this.modified = true;
        },

        getListIds: function (itemId) {
            return Object.keys(this.data[itemId].order).filter(a => a).sort();
        },

        log: function () {
            Object.values(this.data).forEach((item, i) => console.log(`storage.data[${i}] = ${JSON.stringify(item)}`));
        }
    };

    const view = {
        renderItem: function (ul, item) {
            const setContent = (item, contentDiv) => {
                contentDiv.attr("contenteditable", "false");
                contentDiv.removeClass("editable");
                item.content = contentDiv.text().trim();
                storage.modified = true;
            };

            const li = $("<li></li>").addClass("item").attr("data-item-id", item.id);
            const contentDiv = $("<div></div>").addClass("content").text(item.content)
                .focusout(() => setContent(item, contentDiv))
                .on("keydown", e => e.code === "Enter" ? setContent(item, contentDiv) : undefined);
            const infoDiv = $("<div></div>").addClass("info");
            const ordersDiv = $("<div></div>").addClass("orders");
            const editDiv = $("<div></div>").addClass("edit").html("&crarr;").click(() => {
                contentDiv.toggleClass("editable");
                if (contentDiv.hasClass("editable")) {
                    contentDiv.attr("contenteditable", "true");
                    contentDiv.focus();
                } else {
                    setContent(item, contentDiv);
                }
            });

            infoDiv.append(ordersDiv).append(editDiv);
            li.append(contentDiv).append(infoDiv);
            ul.append(li);
        },

        createItem: function (ul) {
            const item = storage.createItem();
            this.renderItem(ul, item);
            this.recalculateOrders(ul);
        },

        recalculateOrders: function (ul) {
            const listId = ul.attr("data-list-id");
            ul.find("li").each((i, element) => {
                const li = $(element);
                const itemId = li.attr("data-item-id");

                if (listId) {
                    storage.setOrder(itemId, listId, 100 + i);
                }

                const ordersDiv = li.find("div.orders").empty();
                ordersDiv.text(storage.getListIds(itemId).join(" | "));
            });
            storage.log();
        },

        initializeContainers: function () {
            const that = this;

            $(".items-container").each((i, element) => {
                const container = $(element);
                const listId = container.attr("data-list-id");
                const ul = $("<ul></ul>").addClass("items").attr("data-list-id", listId);
                const menu = $("<div></div>").addClass("menu");
                const addMenu = $("<span></span>").text("+").addClass("add").click(() => that.createItem(ul));
                const title = $("<span></span>").text(container.attr("data-list-name")).addClass("title");
                menu.append(addMenu).append(title);
                container.append(menu).append(ul);

                if (listId === "") {
                    const orders = container.parent().find(".items-container").get().map(a => a.getAttribute("data-list-id")).filter(a => a !== "");
                    storage.getOtherItems(orders).forEach(item => this.renderItem(ul, item));
                } else {
                    storage.getItems(listId).forEach(item => this.renderItem(ul, item));
                }

                that.recalculateOrders(ul);
            });

            $(".items").sortable({
                connectWith: ".items",
                dropOnEmpty: true,
                placeholder: "placeholder",
                // containment: "parent",
                cursor: "move",
                tolerance: "pointer",
                remove: (event, ui) => {
                    const ul = $(event.target);
                    const li = ui.item.first();
                    const listId = ul.attr("data-list-id");
                    const itemId = li.attr("data-item-id");
                    storage.removeOrder(itemId, listId);
                    console.log(`Removed ${itemId} from ${listId}`);
                    that.recalculateOrders(ul);
                },
                receive: (event, ui) => {
                    const ul = $(event.target);
                    const li = ui.item.first();
                    const listId = ul.attr("data-list-id");
                    const itemId = li.attr("data-item-id");
                    console.log(`Added ${itemId} to ${listId}`);
                    that.recalculateOrders(ul);
                },
                start: (event, ui) => {
                    const li = ui.item.first();
                    li.toggleClass("moved");
                },
                stop: (event, ui) => {
                    const ul = $(event.target);
                    const li = ui.item.first();
                    const listId = ul.attr("data-list-id");
                    const itemId = li.attr("data-item-id");
                    li.toggleClass("moved");
                    console.log(`Stop ${itemId} from ${listId}`);
                    that.recalculateOrders(ul);
                }
            });//.disableSelection();

        }
    };

    storage.load();
    storage.startAutoSave();
    view.initializeContainers();

    $("#tabs").tabs();
});
