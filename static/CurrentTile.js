System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var CurrentTileRenderer;
    return {
        setters: [],
        execute: function () {
            CurrentTileRenderer = class CurrentTileRenderer {
                constructor(container) {
                    this.container = container;
                    let currentTileElement = this.container.getElementsByClassName("currentTile")[0];
                    this.leftRotateElement = this.container.getElementsByClassName("leftTurn")[0];
                    this.rightRotateElement = this.container.getElementsByClassName("rightTurn")[0];
                    if (!currentTileElement || !this.leftRotateElement || !this.rightRotateElement) {
                        throw new Error("Invalid container for CurrentTileRenderer");
                    }
                    currentTileElement.style.backgroundColor = "lightGray";
                    this.currentTileImgElement = container.ownerDocument.createElement("img");
                    this.currentTileImgElement.style.width = "100%";
                    this.currentTileImgElement.style.height = "100%";
                    currentTileElement.appendChild(this.currentTileImgElement);
                    this.leftRotateElement.addEventListener("click", () => {
                        if (this.onLeftRotateClick) {
                            this.onLeftRotateClick();
                        }
                    });
                    this.rightRotateElement.addEventListener("click", () => {
                        if (this.onRightRotateClick) {
                            this.onRightRotateClick();
                        }
                    });
                    this.render();
                }
                render() {
                    if (!this.tileSpec) {
                        this.currentTileImgElement.style.display = "none";
                    }
                    else {
                        this.currentTileImgElement.src = this.tileSpec.imgUrl();
                        this.currentTileImgElement.style.transform = "rotate(" + (this.rot * 90) + "deg)";
                        this.currentTileImgElement.style.display = "block";
                    }
                }
                setTileSpec(tileSpec, rot) {
                    this.tileSpec = tileSpec;
                    this.rot = rot;
                    this.render();
                }
            };
            exports_1("CurrentTileRenderer", CurrentTileRenderer);
        }
    };
});
