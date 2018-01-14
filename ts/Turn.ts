import {TileSpec} from "./Tile"

export class TurnResult {
  static notPlacedResult(): TurnResult {
    return {tilePlaced:false,y:-1,x:-1,rot:0,tileSpec:null};
  }
  
  tilePlaced: boolean;
  tileSpec: TileSpec|null;
  y: number;
  x: number;
  rot: number;
}
