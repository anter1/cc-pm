import * as Utils from "./Utils"
import {Board, RealTile, BoardRenderer} from "./Board"
import {TileSpec} from "./Tile"
import {CurrentTileRenderer} from "./CurrentTile"
import {TurnResult} from "./Turn"

abstract class Player {
  abstract makeTurn(tileSpec: TileSpec): Promise<TurnResult>;
}

class LocalPlayer extends Player {
  constructor(boardRenderer: BoardRenderer, currentTileRenderer: CurrentTileRenderer) {
    super();
    this.currentTileRenderer = currentTileRenderer;
    this.boardRenderer = boardRenderer;
    
    this.currentTileRenderer.onLeftRotateClick = this.onLeftRotateClick;
    this.currentTileRenderer.onRightRotateClick = this.onRightRotateClick;
    this.boardRenderer.onClick = this.onBoardTileClick;
  }
  
  async makeTurn(tileSpec: TileSpec): Promise<TurnResult> {
    if (this.isActivated()) {
      throw new Error("Trying to execute a turn when the previous one hasn't finished");
    }
    this.currentTileRenderer.setTileSpec(tileSpec);
    
    return new Promise<TurnResult>(resolve => {this.promiseResolve = resolve; });
  }
  
  isActivated(): boolean {
    return this.promiseResolve != null;
  }
  
  onLeftRotateClick = () => {
    if (!this.isActivated()) { return; }
    
    this.currentTileRenderer.setRot((this.currentTileRenderer.rot + 3) % 4);
    this.boardRenderer.board.updateTemporaryRot(this.currentTileRenderer.rot);
  }
  
  onRightRotateClick = () => {
    if (!this.isActivated()) { return; }
  
    this.currentTileRenderer.setRot((this.currentTileRenderer.rot + 1) % 4);
    this.boardRenderer.board.updateTemporaryRot(this.currentTileRenderer.rot);
  }
  
  onBoardTileClick = (y:number, x:number) => {
    if (!this.isActivated()) { return; }
    
    this.boardRenderer.board.tryPlaceTemporaryTile(y, x, this.currentTileRenderer.tileSpec, this.currentTileRenderer.rot);
  }
  
  currentTileRenderer: CurrentTileRenderer;
  boardRenderer: BoardRenderer;
  
  promiseResolve: (TurnResult) => void;
}

class NoopPlayer extends Player {
  async makeTurn(tileSpec: TileSpec): Promise<TurnResult> {
    await Utils.sleep(1);
    return TurnResult.notPlacedResult();
  }  
}

export class Game {
  constructor(
      deck: Array<TileSpec>,
      numPlayers:number,
      localPlayerPosition:number,
      boardRendererFactory: (board: Board) => BoardRenderer,
      currentTileRenderer: CurrentTileRenderer) {
    this.board = new Board(new RealTile(deck[0], 0));
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
  
  start(): void {
    this.turn = 0;
    
    let currentTileSpec = this.deck[0];
    this.deck = this.deck.slice(1);
    
    this.allPlayers[this.turn].makeTurn(currentTileSpec).then(this.turnFinished);
  }
  
  turnFinished = (TurnResult) => {
    
  }
  
  board: Board;
  deck: Array<TileSpec>;
  turn: number;
  
  localPlayer: LocalPlayer;
  allPlayers: Array<Player>;
  
  boardRenderer: BoardRenderer;
}