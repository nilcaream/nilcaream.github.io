'use strict';

$(() => {
    const configuration = {
        data: {
            columns: {
                name: "Columns",
                type: "columns",
                lists: [
                    {
                        id: "list-a",
                        name: "List A",
                        size: 1
                    },
                    {
                        id: "list-b",
                        name: "List B",
                        size: 2
                    },
                    {
                        id: "list-c",
                        name: "List C",
                        size: 3
                    }
                ]
            },
            rows: {
                name: "Rows",
                type: "rows",
                lists: [
                    {
                        id: "list-a",
                        name: "List A",
                        size: 1
                    },
                    {
                        id: "list-b",
                        name: "List B",
                        size: 2
                    },
                    {
                        id: "list-c",
                        name: "List C",
                        size: 3
                    }
                ]
            },
            grid: {
                name: "Grid",
                type: "grid",
                cells: [
                    [{
                        type: "columns",
                        lists: [
                            {
                                id: "list-a",
                                name: "List A - Top-Left",
                                size: 1
                            },
                            {
                                id: "list-b",
                                name: "List B - Top-Left",
                                size: 2
                            }
                        ]
                    }, {
                        type: "rows",
                        lists: [
                            {
                                id: "list-a",
                                name: "List A - Top-Right",
                                size: 4
                            },
                            {
                                id: "list-b",
                                name: "List B - Top-Right",
                                size: 5
                            },
                            {
                                id: "list-c",
                                name: "List C - Top-Right",
                                size: 6
                            }
                        ]
                    }],
                    [{
                        type: "rows",
                        lists: [
                            {
                                id: "list-a",
                                name: "List A - Bottom-Left",
                                size: 2
                            },
                            {
                                id: "list-b",
                                name: "List B - Bottom-Left",
                                size: 3
                            }
                        ]
                    }, {
                        type: "columns",
                        lists: [
                            {
                                id: "list-a",
                                name: "List A - Bottom-Right",
                                size: 2
                            },
                            {
                                id: "list-b",
                                name: "List B - Bottom-Right",
                                size: 1
                            }
                        ]
                    }]
                ]
            }
        },

        load() {
            this.data = JSON.parse(window.localStorage.getItem("nc.configuration") || JSON.stringify(this.data));
        },

        save() {
            window.localStorage.setItem("nc.configuration", JSON.stringify(this.data));
        }

    }

    const storage = {
        data: {},

        modified: false,

        startAutoSave() {
            const that = this;
            setInterval(() => {
                if (that.modified) {
                    that.save();
                }
            }, 2000);
        },

        load() {
            this.data = JSON.parse(window.localStorage.getItem("nc.items") || "{}");
            this.modified = false;
            console.log(`Loaded ${Object.keys(this.data).length} items`);
        },

        save() {
            window.localStorage.setItem("nc.items", JSON.stringify(this.data || {}));
            this.modified = false;
            console.log(`Saved ${Object.keys(this.data).length} items`);
        },

        addToHistory(item, message) {
            item.history[new Date().getTime().toString()] = message;
            this.modified = true;
        },

        createItem() {
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

        getItems(listId) {
            return Object.values(this.data)
                .filter(item => item.order[listId])
                .sort((i0, i1) => i0.order[listId] - i1.order[listId]);
        },

        getOtherItems(listIds) {
            return Object.values(this.data)
                .filter(item => !Object.keys(item.order).some(r => listIds.indexOf(r) !== -1));
        },

        setOrder(itemId, listId, order) {
            this.data[itemId].order[listId] = order;
            this.modified = true;
        },

        removeOrder(itemId, listId) {
            delete this.data[itemId].order[listId];
            this.modified = true;
        },

        getItemIdToListIds() {
            // filter removes blanks
            return Object.values(this.data).map(item => ({itemId: item.id, listIds: Object.keys(item.order).filter(o => o).sort()}));
        },

        log() {
            Object.values(this.data).forEach((item, i) => console.log(`storage.data[${i}] = ${JSON.stringify(item)}`));
        }
    };

    const view = {
        renderItem(ul, item) {
            const setContent = (item, contentDiv) => {
                contentDiv.attr("contenteditable", "false");
                const content = contentDiv.text().trim();
                if (content !== item.content) {
                    storage.addToHistory(item, "modified: " + item.content);
                    item.content = content;
                    $(`li[data-item-id=${item.id}] div.content`).text(item.content);
                    storage.modified = true;
                }
            };

            const li = $("<li></li>").addClass("item").attr("data-item-id", item.id);
            const contentDiv = $("<div></div>").addClass("content").text(item.content)
                .focusout(() => setContent(item, contentDiv))
                .on("keydown", e => e.code === "Enter" ? setContent(item, contentDiv) : undefined);
            const infoDiv = $("<div></div>").addClass("info");
            const ordersDiv = $("<div></div>").addClass("orders");
            const editDiv = $("<div></div>").addClass("edit").html("&crarr;").click(() => {
                if (contentDiv.attr("contenteditable") === "true") {
                    setContent(item, contentDiv);
                } else {
                    contentDiv.attr("contenteditable", "true");
                    contentDiv.focus();
                }
            });

            infoDiv.append(ordersDiv).append(editDiv);
            li.append(contentDiv).append(infoDiv);
            ul.append(li);

            return li;
        },

        createItem(ul) {
            const item = storage.createItem();
            const li = this.renderItem(ul, item);
            this.updateOrders(ul);
            this.renderOrders();
            li.find(".edit").click();
        },

        updateOrders(ul) {
            const listId = ul.attr("data-list-id");
            ul.find("li").each((i, element) => {
                const li = $(element);
                const itemId = li.attr("data-item-id");
                if (listId) {
                    storage.setOrder(itemId, listId, 100 + i);
                }
            });
        },

        renderOrders() {
            storage.getItemIdToListIds().forEach(entry => {
                const itemId = entry.itemId;
                const orders = entry.listIds.join(" | ");
                $(`li[data-item-id=${itemId}] div.orders`).text(orders);
            });
        },

        initializeTabs(configuration) {
            const root = $("#items");
            const ul = $("<ul></ul>");
            root.append(ul);

            const addLi = (id, name) => ul.append($("<li></li>").append($("<a></a>").attr("href", "#" + id).text(name)));
            const addItemContainer = (parent, listId, listName, size) => parent.append($("<div></div>").addClass(["items-container", "size-" + size]).attr("data-list-id", listId).attr("data-list-name", listName));

            for (const [tabId, tabDefinition] of Object.entries(configuration)) {
                addLi(tabId, tabDefinition.name);
                const div = $("<div></div>").attr("id", tabId);
                div.addClass(tabDefinition.type).addClass("item-tab");
                if (tabDefinition.lists) {
                    div.addClass("container");
                    tabDefinition.lists.forEach(list => addItemContainer(div, list.id, list.name, list.size));
                } else if (tabDefinition.cells) {
                    tabDefinition.cells.forEach(row => {
                        const container = $("<div></div>").addClass(`size-${row.length}`);
                        row.forEach(column => {
                            const cell = $("<div></div>").addClass([column.type, "container"]);
                            column.lists.forEach(list => addItemContainer(cell, list.id, list.name, list.size));
                            container.append(cell);
                        });
                        div.append(container);
                    });
                }
                root.append(div);
            }
        },

        initializeContainers() {
            const that = this;

            $(".items-container").each((i, element) => {
                const updateClass = (container, clsPrefix, min, max, delta) => {
                    const classes = container.attr("class").split(" ").filter(c => c.indexOf(clsPrefix) === 0);
                    container.removeClass(classes);
                    const current = parseInt(classes.map(c => c.replace(clsPrefix, ""))[0] || "1");
                    const updated = Math.max(min, Math.min(max, current + delta));
                    container.addClass(clsPrefix + updated);
                };

                const container = $(element);
                const listId = container.attr("data-list-id");
                const ul = $("<ul></ul>").addClass("items").attr("data-list-id", listId);
                const menu = $("<div></div>").addClass("menu");
                const addMenu = $("<div></div>").text("+").addClass("add").click(() => that.createItem(ul));
                const title = $("<div></div>").text(container.attr("data-list-name")).addClass("title");
                const widthUp = $("<div></div>").text("W+").addClass("plus").click(() => updateClass(container, "size-", 1, 7, 1));
                const widthDown = $("<div></div>").text("W-").addClass("minus").click(() => updateClass(container, "size-", 1, 7, -1));

                const ulWrapper = $("<div></div>").addClass("wrapper").append(ul);
                menu.append(addMenu).append(title).append(widthUp).append(widthDown);
                container.append(menu).append(ulWrapper);

                if (listId) {
                    storage.getItems(listId).forEach(item => this.renderItem(ul, item));
                } else {
                    const orders = container.closest(".item-tab").find(".items-container").get().map(a => a.getAttribute("data-list-id")).filter(a => a);
                    storage.getOtherItems(orders).forEach(item => this.renderItem(ul, item));
                }
            });

            $(".items").sortable({
                connectWith: ".items",
                dropOnEmpty: true,
                placeholder: "placeholder",
                containment: "#items",
                cursor: "move",
                tolerance: "pointer",
                remove: (event, ui) => {
                    const ul = $(event.target);
                    const li = ui.item.first();
                    const listId = ul.attr("data-list-id");
                    const itemId = li.attr("data-item-id");
                    storage.removeOrder(itemId, listId);
                    console.log(`Removed ${itemId} from ${listId}`);
                },
                receive: (event, ui) => {
                    const ul = $(event.target);
                    const li = ui.item.first();
                    const listId = ul.attr("data-list-id");
                    const itemId = li.attr("data-item-id");
                    that.updateOrders(ul);
                    console.log(`Added ${itemId} to ${listId}`);
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
                    that.updateOrders(ul);
                    that.renderOrders();
                    console.log(`Stop ${itemId} from ${listId || "(others)"}`);
                }
            });//.disableSelection();
        },

        initializeSetup(data) {
            const itemsDiv = $("#items").toggle();
            const configurationDiv = $("#configuration");
            const json = configurationDiv.find(".json").text(JSON.stringify(data));
            const setupButton = $("#setup").click(() => {
                setupButton.toggleClass("mirror");
                itemsDiv.toggle();
                configurationDiv.toggle();
            });

            configurationDiv.find(".format").click(() => json.text(JSON.stringify(JSON.parse(json.text()), null, 2))).click();
            configurationDiv.find(".save").click(() => {
                configuration.data = JSON.parse(json.text());
                configuration.save();
            });

            const download = configurationDiv.find(".download a");
            download.click(() => {
                const content = {
                    "version": 1,
                    "configuration": JSON.parse(json.text()),
                    "items": storage.data
                }
                const href = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], {type: "application/json"}));
                download.attr("href", href);
                setTimeout(() => URL.revokeObjectURL(href), 1000);
            });
        }
    };

    storage.load();
    storage.startAutoSave();
    configuration.load();
    view.initializeTabs(configuration.data);
    view.initializeContainers();
    view.renderOrders();

    $("#items").tabs();

    view.initializeSetup(configuration.data);
});
