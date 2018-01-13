System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function createTileRenderer(tile) {
        switch (tile.tileType()) {
            case TileType.Empty:
                return new EmptyTileRenderer(tile);
            case TileType.Real:
                return new RealTileRenderer(tile);
        }
        throw new Error("Unsupported tileType: " + tile.tileType);
    }
    var TileType, EmptyTile, RealTile, Board, TileRenderer, EmptyTileRenderer, RealTileRenderer, BoardRenderer;
    return {
        setters: [],
        execute: function () {
            (function (TileType) {
                TileType[TileType["Empty"] = 0] = "Empty";
                TileType[TileType["Real"] = 1] = "Real";
            })(TileType || (TileType = {}));
            exports_1("TileType", TileType);
            EmptyTile = class EmptyTile {
                tileType() {
                    return TileType.Empty;
                }
            };
            exports_1("EmptyTile", EmptyTile);
            RealTile = class RealTile {
                constructor(tileSpec, rot) {
                    this.tileSpec = tileSpec;
                    this.rot = rot;
                }
                tileType() {
                    return TileType.Real;
                }
            };
            exports_1("RealTile", RealTile);
            Board = class Board {
                constructor(initialTile) {
                    this.tiles = [
                        [new EmptyTile(), new EmptyTile(), new EmptyTile()],
                        [new EmptyTile(), initialTile, new EmptyTile()],
                        [new EmptyTile(), new EmptyTile(), new EmptyTile()]
                    ];
                    this.width = 3;
                    this.height = 3;
                    this.tempTileY = -1;
                    this.tempTileX = -1;
                    this.tempTile = null;
                    this.tempTileValid = null;
                }
                tryPlaceTemporaryTile(y, x, tileSpec, rot) {
                    if (y < 0 || x < 0 || x >= this.width || y >= this.height) {
                        return false;
                    }
                    if (this.tiles[y][x].tileType() !== TileType.Empty && !(this.tempTile && this.tempTileY === y && this.tempTileX === x)) {
                        return false;
                    }
                    if (this.tempTile) {
                        this.tiles[this.tempTileY][this.tempTileX] = new EmptyTile();
                    }
                    this.tempTileY = y;
                    this.tempTileX = x;
                    this.tiles[y][x] = this.tempTile = new RealTile(tileSpec, rot);
                    this.tempTileValid = this.isTempTileValid();
                    this.onDirty();
                    return true;
                }
                updateTemporaryRot(rot) {
                    if (!this.tempTile) {
                        return false;
                    }
                    return this.tryPlaceTemporaryTile(this.tempTileY, this.tempTileX, this.tempTile.tileSpec, rot);
                }
                isTemporary(y, x) {
                    return y == this.tempTileY && x == this.tempTileX;
                }
                isTempTileValid() {
                    let tile = this.tempTile;
                    let foundNeighbor = false;
                    for (let edgeSpec of tile.tileSpec.allEdgeSpecs.values()) {
                        for (let tileEdge of edgeSpec.getEdges(tile.rot)) {
                            let [dy, dx, nedge] = edgeSpec.oppositeEdge(tileEdge);
                            let ny = this.tempTileY + dy;
                            let nx = this.tempTileX + dx;
                            if (ny >= 0 && nx >= 0 && ny < this.height && nx < this.width) {
                                let nTile = this.tiles[ny][nx];
                                if (nTile.tileType() == TileType.Real) {
                                    foundNeighbor = true;
                                    let nTileReal = nTile;
                                    let nFeature = nTileReal.tileSpec.edgeSpecForEdge(edgeSpec.feature, nedge, nTileReal.rot);
                                    if (!nFeature) {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                    return foundNeighbor;
                }
            };
            exports_1("Board", Board);
            TileRenderer = class TileRenderer {
                constructor(tile) {
                    this.tile = tile;
                }
            };
            exports_1("TileRenderer", TileRenderer);
            EmptyTileRenderer = class EmptyTileRenderer extends TileRenderer {
                constructor(tile) {
                    super(tile);
                    this.container = document.createElement("div");
                    this.container.style.border = "1px solid grey";
                    this.container.addEventListener("click", () => {
                        if (this.onClick) {
                            this.onClick();
                        }
                    });
                }
                render() {
                    return this.container;
                }
            };
            exports_1("EmptyTileRenderer", EmptyTileRenderer);
            RealTileRenderer = class RealTileRenderer extends TileRenderer {
                constructor(tile) {
                    super(tile);
                    this.container = document.createElement("div");
                    this.container.style.border = "1px solid grey";
                    let img = document.createElement("img");
                    img.src = tile.tileSpec.imgUrl();
                    arguments;
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.transform = "rotate(" + (tile.rot * 90) + "deg)";
                    this.container.appendChild(img);
                    this.container.addEventListener("click", () => {
                        if (this.onClick) {
                            this.onClick();
                        }
                    });
                }
                render() {
                    return this.container;
                }
            };
            exports_1("RealTileRenderer", RealTileRenderer);
            BoardRenderer = class BoardRenderer {
                constructor(board, container) {
                    this.onresize = () => {
                        if (this.lastRenderedWidth != this.container.offsetWidth ||
                            this.lastRenderedHeight != this.container.offsetHeight) {
                            this.render();
                        }
                    };
                    this.onBoardDirtied = () => {
                        this.render();
                    };
                    this.board = board;
                    this.container = container;
                    this.rendererCache = new Map();
                    this.board.onDirty = this.onBoardDirtied;
                    this.render();
                    document.defaultView.addEventListener("resize", this.onresize);
                }
                render() {
                    let newRendererCache = new Map();
                    let totalWidth = this.container.offsetWidth;
                    let totalHeight = this.container.offsetHeight;
                    this.lastRenderedHeight = totalHeight;
                    this.lastRenderedWidth = totalWidth;
                    let itemWidth = totalWidth / this.board.width;
                    let itemHeight = totalHeight / this.board.height;
                    let itemSize = Math.min(itemWidth, itemHeight);
                    let offsetX = (totalWidth - itemSize * this.board.width) / 2;
                    let offsetY = (totalHeight - itemSize * this.board.height) / 2;
                    let tempTileOverlay = this.getTempTileOverlay();
                    tempTileOverlay.style.display = "none";
                    let y = 0;
                    for (let row of this.board.tiles) {
                        let x = 0;
                        for (let tile of row) {
                            let renderer = this.rendererForTile(tile);
                            newRendererCache.set(tile, renderer);
                            let cy = y;
                            let cx = x;
                            renderer.onClick = () => { if (this.onClick) {
                                this.onClick(cy, cx);
                            } };
                            let tileElement = renderer.render();
                            tileElement.style.width = itemSize + "px";
                            tileElement.style.height = itemSize + "px";
                            tileElement.style.left = x * itemSize + offsetX + "px";
                            tileElement.style.top = y * itemSize + offsetY + "px";
                            tileElement.style.position = "absolute";
                            if (this.board.isTemporary(y, x)) {
                                tempTileOverlay.style.display = "block";
                                tempTileOverlay.style.width = itemSize + "px";
                                tempTileOverlay.style.height = itemSize + "px";
                                tempTileOverlay.style.left = x * itemSize + offsetX + "px";
                                tempTileOverlay.style.top = y * itemSize + offsetY + "px";
                                if (this.board.tempTileValid) {
                                    tempTileOverlay.style.border = "10px solid blue";
                                }
                                else {
                                    tempTileOverlay.style.border = "10px solid red";
                                }
                            }
                            this.container.appendChild(tileElement);
                            ++x;
                        }
                        ++y;
                    }
                    let oldRendererCache = this.rendererCache;
                    this.rendererCache = newRendererCache;
                    for (let [tile, tileRenderer] of oldRendererCache) {
                        if (!newRendererCache.get(tile)) {
                            tileRenderer.render().remove();
                        }
                    }
                }
                rendererForTile(tile) {
                    let tileRenderer = this.rendererCache.get(tile);
                    if (!tileRenderer) {
                        tileRenderer = createTileRenderer(tile);
                    }
                    return tileRenderer;
                }
                getTempTileOverlay() {
                    if (this.tempTileOverlay) {
                        return this.tempTileOverlay;
                    }
                    this.tempTileOverlay = this.container.ownerDocument.createElement("div");
                    this.tempTileOverlay.style.backgroundColor = "#A0A000";
                    this.tempTileOverlay.style.opacity = "0.5";
                    this.tempTileOverlay.style.position = "absolute";
                    this.tempTileOverlay.style.zIndex = "1";
                    this.container.appendChild(this.tempTileOverlay);
                    return this.tempTileOverlay;
                }
            };
            exports_1("BoardRenderer", BoardRenderer);
        }
    };
});
