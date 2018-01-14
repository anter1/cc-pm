import * as Utils from "./Utils"
import {Board, RealTile, BoardRenderer} from "./Board"
import {TileSpec} from "./Tile"
import {CurrentTileRenderer} from "./CurrentTile"
import {TurnResult} from "./Turn"
import {Menu} from "./Menu"

abstract class Player {
  abstract makeTurn(tileSpec: TileSpec): Promise<TurnResult>;
}

class LocalPlayer extends Player {
  constructor(boardRenderer: BoardRenderer, currentTileRenderer: CurrentTileRenderer, endTurnEnabledCallback: (enabled:boolean)=>void) {
    super();
    this.currentTileRenderer = currentTileRenderer;
    this.boardRenderer = boardRenderer;
    this.endTurnEnabledCallback = endTurnEnabledCallback;
    
    this.currentTileRenderer.onLeftRotateClick = this.onLeftRotateClick;
    this.currentTileRenderer.onRightRotateClick = this.onRightRotateClick;
    this.boardRenderer.onClick = this.onBoardTileClick;
  }
  
  async makeTurn(tileSpec: TileSpec): Promise<TurnResult> {
    if (this.isActivated()) {
      throw new Error("Trying to execute a turn when the previous one hasn't finished");
    }
    
    this.currentTurnResult = TurnResult.notPlacedResult();
    this.currentTurnResult.tileSpec = tileSpec;
    
    this.renderTurn();
    return new Promise<TurnResult>(resolve => {this.promiseResolve = resolve; });
  }
  
  isActivated(): boolean {
    return this.promiseResolve != null;
  }
  
  renderTurn(): void {
    this.currentTileRenderer.setTileSpec(this.currentTurnResult.tileSpec, this.currentTurnResult.rot);
    this.boardRenderer.board.tryPlaceTemporaryTile(this.currentTurnResult.y, this.currentTurnResult.x, this.currentTurnResult.tilePlaced ? this.currentTurnResult.tileSpec : null, this.currentTurnResult.rot);
    this.endTurnEnabledCallback(this.boardRenderer.board.tempTileValid);
  }
  
  onLeftRotateClick = () => {
    if (!this.isActivated()) { return; }
    
    this.currentTurnResult.rot = (this.currentTurnResult.rot + 3) % 4;
    this.renderTurn();
  }
  
  onRightRotateClick = () => {
    if (!this.isActivated()) { return; }
  
    this.currentTurnResult.rot = (this.currentTurnResult.rot + 1) % 4;
    this.renderTurn();
  }
  
  onBoardTileClick = (y:number, x:number) => {
    if (!this.isActivated()) { return; }
    
    if (this.boardRenderer.board.tryPlaceTemporaryTile(y, x, this.currentTurnResult.tileSpec, this.currentTurnResult.rot)) {
      this.currentTurnResult.y = y;
      this.currentTurnResult.x = x;
      this.currentTurnResult.tilePlaced = true;
    }
    
    this.renderTurn();
  }
  
  onEndTurnClick = () => {
    if (!this.isActivated()) { return; }
    
    if (this.boardRenderer.board.tempTileValid) {
      let resolve = this.promiseResolve;
      let currentTurnResult = this.currentTurnResult;
      
      this.promiseResolve = null;
      this.currentTurnResult = TurnResult.notPlacedResult();
      this.renderTurn();
      
      resolve(currentTurnResult);
    }
  }
  
  currentTileRenderer: CurrentTileRenderer;
  boardRenderer: BoardRenderer;
  endTurnEnabledCallback: (enabled:boolean)=>void;
    
  promiseResolve: (turnResult:TurnResult) => void;
  currentTurnResult: TurnResult;
  
}

class NoopPlayer extends Player {
  constructor(board: Board) {
    super();
    this.board = board;
  }
  
  *getRandomPositions(): IterableIterator<[number, number, number]> {
    for (let i = 0; i < 5000; ++i) {
      let y = Math.floor(Math.random() * (this.board.height + 1));
      let x = Math.floor(Math.random() * (this.board.width + 1));
      let rot = Math.floor(Math.random() * (4 + 1));
      yield [y,x,rot];
    }
  }
  
  *getAllPositions(): IterableIterator<[number, number, number]> {
    for (let y = 0; y < this.board.height; ++y) {
      for (let x = 0; x < this.board.width; ++x) {
        for (let rot = 0; rot < 4; ++rot) {
          yield [y,x,rot];          
        }
      }
    }
  }
  
  *getPositions(): IterableIterator<[number, number, number]> {
    for (let v of this.getRandomPositions()) {
      yield v;
    }
    for (let v of this.getAllPositions()) {
      yield v;
    }
  }
  
  async makeTurn(tileSpec: TileSpec): Promise<TurnResult> {
    await Utils.sleep(1);
    for (let [y,x,rot] of this.getPositions()) {
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
    return TurnResult.notPlacedResult();
  }
  
  board: Board;
}

export class Game {
  constructor(
      deck: Array<TileSpec>,
      numPlayers:number,
      localPlayerPosition:number,
      boardRendererFactory: (board: Board) => BoardRenderer,
      currentTileRenderer: CurrentTileRenderer,
      menu: Menu) {
    this.menu = menu;
    this.board = new Board(new RealTile(deck[0], 0));
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
  
  start(): void {
    this.turn = -1;
    
    this.nextTurn();
  }
  
  turnFinished = (turnResult:TurnResult) => {
    if (turnResult.tilePlaced) {
      let valid = this.board.placeTile(turnResult.y, turnResult.x, turnResult.tileSpec, turnResult.rot);
      if (!valid) {
        alert("The game is trying to allow a player to place an invalid tile. Skipping turn.");
      }
    }
    
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
  
  board: Board;
  deck: Array<TileSpec>;
  turn: number;
  
  localPlayer: LocalPlayer;
  allPlayers: Array<Player>;
  
  boardRenderer: BoardRenderer;
  menu: Menu;
}