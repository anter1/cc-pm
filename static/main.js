System.register(["./Tile"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function addErrorHandler() {
        window.onerror = function (msg, filename, line, column, error) {
            alert(error.name + ": " + error.message + "\n\n" + error.stack);
        };
    }
    function addTiles(count, factory) {
        for (let i = 0; i < count; ++i) {
            deck.push(factory());
        }
    }
    function main() {
        addErrorHandler();
        // Start tile is first
        addTiles(1, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, -1], null, [-1, 0, -1, 0], [-1, -1, 0, 1, 1, 1, 1, 0]); });
        addTiles(1, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, 0, 0, 0], new Set([0]), [-1, -1, -1, -1], [-1, -1, -1, -1, -1, -1, -1, -1]); });
        addTiles(1, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, -1, -1, -1], null, [0, 1, 2, 3], [0, 1, 1, 2, 2, 3, 3, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, 0, -1, 0], null, [-1, -1, -1, -1], [-1, -1, -1, -1, 0, 0, -1, -1]); });
        addTiles(1, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, 0, -1, 0], new Set([0]), [-1, -1, -1, -1], [-1, -1, -1, -1, 0, 0, -1, -1]); });
        addTiles(1, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, 0, -1, 0], null, [-1, -1, 0, -1], [-1, -1, -1, -1, 0, 1, -1, -1]); });
        addTiles(2, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, 0, -1, 0], new Set([0]), [-1, -1, 0, -1], [-1, -1, -1, -1, 0, 1, -1, -1]); });
        addTiles(4, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, -1, -1, -1], null, [-1, 0, 1, 2], [0, 0, 0, 1, 1, 2, 2, 0]); });
        addTiles(1, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, 0, -1, 0], null, [-1, -1, -1, -1], [0, 0, -1, -1, 1, 1, -1, -1]); });
        addTiles(2, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, 0, -1, 0], new Set([0]), [-1, -1, -1, -1], [0, 0, -1, -1, 1, 1, -1, -1]); });
        addTiles(8, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, -1, -1, -1], null, [0, -1, 0, -1], [0, 1, 1, 1, 1, 0, 0, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, 0], null, [-1, -1, -1, -1], [-1, -1, 0, 0, 0, 0, -1, -1]); });
        addTiles(2, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, 0], new Set([0]), [-1, -1, -1, -1], [-1, -1, 0, 0, 0, 0, -1, -1]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, 0], null, [-1, 0, 0, -1], [-1, -1, 0, 1, 1, 0, -1, -1]); });
        addTiles(2, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, 0], new Set([0]), [-1, 0, 0, -1], [-1, -1, 0, 1, 1, 0, -1, -1]); });
        addTiles(9, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, -1, -1, -1], null, [-1, -1, 0, 0], [0, 0, 0, 0, 0, 1, 1, 0]); });
        addTiles(2, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, 1, -1, -1], null, [-1, -1, -1, -1], [-1, -1, -1, -1, 0, 0, 0, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [-1, 0, -1, 0], null, [-1, -1, -1, -1], [0, 0, -1, -1, 0, 0, -1, -1]); });
        addTiles(2, function () { return new Tile_1.TileSpec(Tile_1.Feature.Monastery, [-1, -1, -1, -1], null, [-1, -1, 0, -1], [0, 0, 0, 0, 0, 0, 0, 0]); });
        addTiles(4, function () { return new Tile_1.TileSpec(Tile_1.Feature.Monastery, [-1, -1, -1, -1], null, [-1, -1, -1, -1], [0, 0, 0, 0, 0, 0, 0, 0]); });
        addTiles(5, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, -1], null, [-1, -1, -1, -1], [-1, -1, 0, 0, 0, 0, 0, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, -1], null, [-1, 0, 0, -1], [-1, -1, 0, 1, 1, 0, 0, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, -1], null, [-1, -1, 0, 0], [-1, -1, 0, 0, 0, 1, 1, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, -1], null, [-1, 0, 1, 2], [-1, -1, 0, 1, 1, 2, 2, 0]); });
        addTiles(3, function () { return new Tile_1.TileSpec(Tile_1.Feature.None, [0, -1, -1, -1], null, [-1, 0, -1, 0], [-1, -1, 0, 1, 1, 1, 1, 0]); });
        console.info(deck);
    }
    var Tile_1, deck;
    return {
        setters: [
            function (Tile_1_1) {
                Tile_1 = Tile_1_1;
            }
        ],
        execute: function () {
            deck = [];
            if (document.readyState == "complete") {
                setTimeout(main, 1);
            }
            else {
                document.addEventListener("DOMContentLoaded", main);
            }
        }
    };
});
