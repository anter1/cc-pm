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
                constructor(boardRenderer, currentTileRenderer) {
                    super();
                    this.onLeftRotateClick = () => {
                        if (!this.isActivated()) {
                            return;
                        }
                        this.currentTileRenderer.setRot((this.currentTileRenderer.rot + 3) % 4);
                        this.boardRenderer.board.updateTemporaryRot(this.currentTileRenderer.rot);
                    };
                    this.onRightRotateClick = () => {
                        if (!this.isActivated()) {
                            return;
                        }
                        this.currentTileRenderer.setRot((this.currentTileRenderer.rot + 1) % 4);
                        this.boardRenderer.board.updateTemporaryRot(this.currentTileRenderer.rot);
                    };
                    this.onBoardTileClick = (y, x) => {
                        if (!this.isActivated()) {
                            return;
                        }
                        this.boardRenderer.board.tryPlaceTemporaryTile(y, x, this.currentTileRenderer.tileSpec, this.currentTileRenderer.rot);
                    };
                    this.currentTileRenderer = currentTileRenderer;
                    this.boardRenderer = boardRenderer;
                    this.currentTileRenderer.onLeftRotateClick = this.onLeftRotateClick;
                    this.currentTileRenderer.onRightRotateClick = this.onRightRotateClick;
                    this.boardRenderer.onClick = this.onBoardTileClick;
                }
                makeTurn(tileSpec) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (this.isActivated()) {
                            throw new Error("Trying to execute a turn when the previous one hasn't finished");
                        }
                        this.currentTileRenderer.setTileSpec(tileSpec);
                        return new Promise(resolve => { this.promiseResolve = resolve; });
                    });
                }
                isActivated() {
                    return this.promiseResolve != null;
                }
            };
            NoopPlayer = class NoopPlayer extends Player {
                makeTurn(tileSpec) {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield Utils.sleep(1);
                        return Turn_1.TurnResult.notPlacedResult();
                    });
                }
            };
            Game = class Game {
                constructor(deck, numPlayers, localPlayerPosition, boardRendererFactory, currentTileRenderer) {
                    this.turnFinished = (TurnResult) => {
                    };
                    this.board = new Board_1.Board(new Board_1.RealTile(deck[0], 0));
                    this.deck = deck.slice(1);
                    this.boardRenderer = boardRendererFactory(this.board);
                    this.localPlayer = new LocalPlayer(this.boardRenderer, currentTileRenderer);
                    this.allPlayers = [];
                    for (let i = 0; i < numPlayers - 1; ++i) {
                        this.allPlayers.push(new NoopPlayer());
                    }
                    this.allPlayers.splice(localPlayerPosition, 0, this.localPlayer);
                    this.turn = 0;
                }
                start() {
                    this.turn = 0;
                    let currentTileSpec = this.deck[0];
                    this.deck = this.deck.slice(1);
                    this.allPlayers[this.turn].makeTurn(currentTileSpec).then(this.turnFinished);
                }
            };
            exports_1("Game", Game);
        }
    };
});
