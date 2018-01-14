System.register(["./Utils", "./Board", "./Turn"], function (exports_1, context_1) {
    "use strict";
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __moduleName = context_1 && context_1.id;
    var Utils, Board_1, Turn_1, Player, LocalPlayer, NoopPlayer, Game;
    return {
        setters: [
            function (Utils_1) {
                Utils = Utils_1;
            },
            function (Board_1_1) {
                Board_1 = Board_1_1;
            },
            function (Turn_1_1) {
                Turn_1 = Turn_1_1;
            }
        ],
        execute: function () {
            Player = class Player {
            };
            LocalPlayer = class LocalPlayer extends Player {
                constructor(boardRenderer, currentTileRenderer, endTurnEnabledCallback) {
                    super();
                    this.onLeftRotateClick = () => {
                        if (!this.isActivated()) {
                            return;
                        }
                        this.currentTurnResult.rot = (this.currentTurnResult.rot + 3) % 4;
                        this.renderTurn();
                    };
                    this.onRightRotateClick = () => {
                        if (!this.isActivated()) {
                            return;
                        }
                        this.currentTurnResult.rot = (this.currentTurnResult.rot + 1) % 4;
                        this.renderTurn();
                    };
                    this.onBoardTileClick = (y, x) => {
                        if (!this.isActivated()) {
                            return;
                        }
                        if (this.boardRenderer.board.tryPlaceTemporaryTile(y, x, this.currentTurnResult.tileSpec, this.currentTurnResult.rot)) {
                            this.currentTurnResult.y = y;
                            this.currentTurnResult.x = x;
                            this.currentTurnResult.tilePlaced = true;
                        }
                        this.renderTurn();
                    };
                    this.onEndTurnClick = () => {
                        if (!this.isActivated()) {
                            return;
                        }
                        if (this.boardRenderer.board.tempTileValid) {
                            let resolve = this.promiseResolve;
                            let currentTurnResult = this.currentTurnResult;
                            this.promiseResolve = null;
                            this.currentTurnResult = Turn_1.TurnResult.notPlacedResult();
                            this.renderTurn();
                            resolve(currentTurnResult);
                        }
                    };
                    this.currentTileRenderer = currentTileRenderer;
                    this.boardRenderer = boardRenderer;
                    this.endTurnEnabledCallback = endTurnEnabledCallback;
                    this.currentTileRenderer.onLeftRotateClick = this.onLeftRotateClick;
                    this.currentTileRenderer.onRightRotateClick = this.onRightRotateClick;
                    this.boardRenderer.onClick = this.onBoardTileClick;
                }
                makeTurn(tileSpec) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (this.isActivated()) {
                            throw new Error("Trying to execute a turn when the previous one hasn't finished");
                        }
                        this.currentTurnResult = Turn_1.TurnResult.notPlacedResult();
                        this.currentTurnResult.tileSpec = tileSpec;
                        this.renderTurn();
                        return new Promise(resolve => { this.promiseResolve = resolve; });
                    });
                }
                isActivated() {
                    return this.promiseResolve != null;
                }
                renderTurn() {
                    this.currentTileRenderer.setTileSpec(this.currentTurnResult.tileSpec, this.currentTurnResult.rot);
                    this.boardRenderer.board.tryPlaceTemporaryTile(this.currentTurnResult.y, this.currentTurnResult.x, this.currentTurnResult.tilePlaced ? this.currentTurnResult.tileSpec : null, this.currentTurnResult.rot);
                    this.endTurnEnabledCallback(this.boardRenderer.board.tempTileValid);
                }
            };
            NoopPlayer = class NoopPlayer extends Player {
                constructor(board) {
                    super();
                    this.board = board;
                }
                *getRandomPositions() {
                    for (let i = 0; i < 5000; ++i) {
                        let y = Math.floor(Math.random() * (this.board.height + 1));
                        let x = Math.floor(Math.random() * (this.board.width + 1));
                        let rot = Math.floor(Math.random() * (4 + 1));
                        yield [y, x, rot];
                    }
                }
                *getAllPositions() {
                    for (let y = 0; y < this.board.height; ++y) {
                        for (let x = 0; x < this.board.width; ++x) {
                            for (let rot = 0; rot < 4; ++rot) {
                                yield [y, x, rot];
                            }
                        }
                    }
                }
                *getPositions() {
                    for (let v of this.getRandomPositions()) {
                        yield v;
                    }
                    for (let v of this.getAllPositions()) {
                        yield v;
                    }
                }
                makeTurn(tileSpec) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield Utils.sleep(1);
                        for (let [y, x, rot] of this.getPositions()) {
                            if (this.board.tryPlaceTemporaryTile(y, x, tileSpec, rot)) {
                                if (this.board.isTileValid(y, x)) {
                                    return {
                                        tilePlaced: true,
                                        tileSpec: tileSpec,
                                        rot: rot,
                                        y: y,
                                        x: x,
                                    };
                                }
                            }
                        }
                        return Turn_1.TurnResult.notPlacedResult();
                    });
                }
            };
            Game = class Game {
                constructor(deck, numPlayers, localPlayerPosition, boardRendererFactory, currentTileRenderer, menu) {
                    this.turnFinished = (turnResult) => {
                        if (turnResult.tilePlaced) {
                            let valid = this.board.placeTile(turnResult.y, turnResult.x, turnResult.tileSpec, turnResult.rot);
                            if (!valid) {
                                alert("The game is trying to allow a player to place an invalid tile. Skipping turn.");
                            }
                        }
                        this.nextTurn();
                    };
                    this.menu = menu;
                    this.board = new Board_1.Board(new Board_1.RealTile(deck[0], 0));
                    this.deck = deck.slice(1);
                    this.boardRenderer = boardRendererFactory(this.board);
                    this.localPlayer = new LocalPlayer(this.boardRenderer, currentTileRenderer, menu.setEndTurnEnabled);
                    menu.onEndTurnButtonClicked = this.localPlayer.onEndTurnClick;
                    this.allPlayers = [];
                    for (let i = 0; i < numPlayers - 1; ++i) {
                        this.allPlayers.push(new NoopPlayer(this.board));
                    }
                    this.allPlayers.splice(localPlayerPosition, 0, this.localPlayer);
                    this.turn = -1;
                }
                start() {
                    this.turn = -1;
                    this.nextTurn();
                }
                nextTurn() {
                    if (this.deck.length > 0) {
                        let currentTileSpec = this.deck[0];
                        this.deck = this.deck.slice(1);
                        this.turn = (this.turn + 1) % this.allPlayers.length;
                        this.allPlayers[this.turn].makeTurn(currentTileSpec).then(this.turnFinished);
                    }
                }
            };
            exports_1("Game", Game);
        }
    };
});
