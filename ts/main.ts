import {TileSpec,TileFeature} from "./Tile";
import {RealTile, Board, BoardRenderer} from "./Board";
import {Game} from "./Game"
import {CurrentTileRenderer} from "./CurrentTile";
import {Menu} from "./Menu"

function addErrorHandler() {
  window.onerror = function(msg:string, filename:string, line: number, column: number, error:Error) {
   // alert(error.name + ": " + error.message + "\n\n" + error.stack);
  }
}

function addTiles(count:number, factory:()=>TileSpec): Array<TileSpec> {
  let result = Array<TileSpec>();
  for (let i=0;i<count;++i) {
    result.push(factory());
  }
  return result;
}

function createDeck() {
  let deck = Array<TileSpec>();
     
  // Start tile is first
  deck = deck.concat(addTiles(1, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,-1],   null          , [-1,0,-1,0]   , [-1,-1,0,1,1,1,1,0]       , "city1rwe")} ));
  
  deck = deck.concat(addTiles(1, function() { return new TileSpec(TileFeature.None,      [0,0,0,0],      new Set([0])  , [-1,-1,-1,-1] , [-1,-1,-1,-1,-1,-1,-1,-1] , "city4")} ));
  deck = deck.concat(addTiles(1, function() { return new TileSpec(TileFeature.None,      [-1,-1,-1,-1],  null          , [0,1,2,3]     , [0,1,1,2,2,3,3,0]         , "road4")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,0,-1,0],     null          , [-1,-1,-1,-1] , [-1,-1,-1,-1,0,0,-1,-1]   , "city3")} ));
  deck = deck.concat(addTiles(1, function() { return new TileSpec(TileFeature.None,      [0,0,-1,0],     new Set([0])  , [-1,-1,-1,-1] , [-1,-1,-1,-1,0,0,-1,-1]   , "city3s")} ));
  deck = deck.concat(addTiles(1, function() { return new TileSpec(TileFeature.None,      [0,0,-1,0],     null          , [-1,-1,0,-1]  , [-1,-1,-1,-1,0,1,-1,-1]   , "city3r")} ));
  deck = deck.concat(addTiles(2, function() { return new TileSpec(TileFeature.None,      [0,0,-1,0],     new Set([0])  , [-1,-1,0,-1]  , [-1,-1,-1,-1,0,1,-1,-1]   , "city3sr")} ));
  deck = deck.concat(addTiles(4, function() { return new TileSpec(TileFeature.None,      [-1,-1,-1,-1],  null          , [-1,0,1,2]    , [0,0,0,1,1,2,2,0]         , "road3")} ));
  deck = deck.concat(addTiles(1, function() { return new TileSpec(TileFeature.None,      [-1,0,-1,0],    null          , [-1,-1,-1,-1] , [0,0,-1,-1,1,1,-1,-1]     , "city2we")} ));
  deck = deck.concat(addTiles(2, function() { return new TileSpec(TileFeature.None,      [-1,0,-1,0],    new Set([0])  , [-1,-1,-1,-1] , [0,0,-1,-1,1,1,-1,-1]     , "city2wes")} ));
  deck = deck.concat(addTiles(8, function() { return new TileSpec(TileFeature.None,      [-1,-1,-1,-1],  null          , [0,-1,0,-1]   , [0,1,1,1,1,0,0,0]         , "road2ns")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,0],    null          , [-1,-1,-1,-1] , [-1,-1,0,0,0,0,-1,-1]     , "city2nw")} ));
  deck = deck.concat(addTiles(2, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,0],    new Set([0])  , [-1,-1,-1,-1] , [-1,-1,0,0,0,0,-1,-1]     , "city2nws")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,0],    null          , [-1,0,0,-1]   , [-1,-1,0,1,1,0,-1,-1]     , "city2nwr")} ));
  deck = deck.concat(addTiles(2, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,0],    new Set([0])  , [-1,0,0,-1]   , [-1,-1,0,1,1,0,-1,-1]     , "city2nwsr")} ));
  deck = deck.concat(addTiles(9, function() { return new TileSpec(TileFeature.None,      [-1,-1,-1,-1],  null          , [-1,-1,0,0]   , [0,0,0,0,0,1,1,0]         , "road2sw")} ));
  deck = deck.concat(addTiles(2, function() { return new TileSpec(TileFeature.None,      [0,1,-1,-1],    null          , [-1,-1,-1,-1] , [-1,-1,-1,-1,0,0,0,0]     , "city11ne")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [-1,0,-1,0],    null          , [-1,-1,-1,-1] , [0,0,-1,-1,0,0,-1,-1]     , "city11we")} ));
  deck = deck.concat(addTiles(2, function() { return new TileSpec(TileFeature.Monastery, [-1,-1,-1,-1],  null          , [-1,-1,0,-1]  , [0,0,0,0,0,0,0,0]         , "cloisterr")} ));
  deck = deck.concat(addTiles(4, function() { return new TileSpec(TileFeature.Monastery, [-1,-1,-1,-1],  null          , [-1,-1,-1,-1] , [0,0,0,0,0,0,0,0]         , "cloister")} ));
  deck = deck.concat(addTiles(5, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,-1],   null          , [-1,-1,-1,-1] , [-1,-1,0,0,0,0,0,0]       , "city1")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,-1],   null          , [-1,0,0,-1]   , [-1,-1,0,1,1,0,0,0]       , "city1rse")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,-1],   null          , [-1,-1,0,0]   , [-1,-1,0,0,0,1,1,0]       , "city1rsw")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,-1],   null          , [-1,0,1,2]    , [-1,-1,0,1,1,2,2,0]       , "city1rswe")} ));
  deck = deck.concat(addTiles(3, function() { return new TileSpec(TileFeature.None,      [0,-1,-1,-1],   null          , [-1,0,-1,0]   , [-1,-1,0,1,1,1,1,0]       , "city1rwe")} ));
  
  return deck;
}

function main() {
  addErrorHandler();
  
  let deck = createDeck();
  
  let game = new Game(
    deck,
    2, // numPlayers
    0, // localPlayerPosition
    board => new BoardRenderer(board, document.getElementById('board')),
    new CurrentTileRenderer(document.getElementById('player1Container')),
    new Menu(document.getElementById('menu')));
  
  game.start();
}

if (document.readyState == "complete") {
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}