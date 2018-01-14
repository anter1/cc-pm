System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var TurnResult;
    return {
        setters: [],
        execute: function () {
            TurnResult = class TurnResult {
                static notPlacedResult() {
                    return { tilePlaced: false, y: -1, x: -1, rot: 0, tileSpec: null };
                }
            };
            exports_1("TurnResult", TurnResult);
        }
    };
});
