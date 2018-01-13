export class TurnResult {
  static notPlacedResult(): TurnResult {
    return {tilePlaced:false,y:0,x:0,rot:0};
  }
  
  tilePlaced: boolean;
  y: number;
  x: number;
  rot: number;
}
