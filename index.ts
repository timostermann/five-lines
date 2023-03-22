const TILE_SIZE = 30;
const FPS = 30;
const SLEEP = 1000 / FPS;

interface FallingState {
  isFalling(): boolean;
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number): void;
  drop(map: Map, tile: Tile, x: number, y: number): void;
}

class Falling implements FallingState {
  isFalling() {
    return true;
  }
  moveHorizontal() {}
  drop(map: Map, tile: Tile, x: number, y: number) {
    map.drop(tile, x, y);
  }
}

class Resting implements FallingState {
  isFalling() {
    return false;
  }
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) {
    player.pushHorizontal(map, tile, dx);
  }
  drop() {}
}

class FallStrategy {
  constructor(private falling: FallingState) {}
  moveHorizontal(map: Map, player: Player, tile: Tile, dx: number) {
    this.falling.moveHorizontal(map, player, tile, dx);
  }
  update(map: Map, tile: Tile, x: number, y: number) {
    this.falling = map.getBlockOnTopState(x, y + 1);
    this.falling.drop(map, tile, x, y);
  }
}

class RemoveStrategy {
  constructor(private id: number) {}
  check(tile: Tile) {
    return tile.fits(this.id);
  }
}

class KeyConfiguration {
  constructor(
    private color: string,
    private id: number,
    private removeStrategy: RemoveStrategy
  ) {}
  getColor() {
    return this.color;
  }
  getId() {
    return this.id;
  }
  getRemoveStrategy() {
    return this.removeStrategy;
  }
}

const YELLOW_KEY = new KeyConfiguration("#ffcc00", 1, new RemoveStrategy(1));
const BLUE_KEY = new KeyConfiguration("#00ccff", 2, new RemoveStrategy(2));

interface RawTileValue {
  transform(): Tile;
}
class AirValue implements RawTileValue {
  transform() {
    return new Air();
  }
}
class FluxValue implements RawTileValue {
  transform() {
    return new Flux();
  }
}
class UnbreakableValue implements RawTileValue {
  transform() {
    return new Unbreakable();
  }
}
class PlayerValue implements RawTileValue {
  transform() {
    return new PlayerTile();
  }
}
class StoneValue implements RawTileValue {
  transform() {
    return new Stone(new Resting());
  }
}
class FallingStoneValue implements RawTileValue {
  transform() {
    return new Stone(new Falling());
  }
}
class BoxValue implements RawTileValue {
  transform() {
    return new Box(new Resting());
  }
}
class FallingBoxValue implements RawTileValue {
  transform() {
    return new Box(new Falling());
  }
}
class Key1Value implements RawTileValue {
  transform() {
    return new Key(YELLOW_KEY);
  }
}
class Lock1Value implements RawTileValue {
  transform() {
    return new LockTile(YELLOW_KEY);
  }
}
class Key2Value implements RawTileValue {
  transform() {
    return new Key(BLUE_KEY);
  }
}
class Lock2Value implements RawTileValue {
  transform() {
    return new LockTile(BLUE_KEY);
  }
}
class RawTile {
  static readonly AIR = new RawTile(new AirValue());
  static readonly FLUX = new RawTile(new FluxValue());
  static readonly UNBREAKABLE = new RawTile(new UnbreakableValue());
  static readonly PLAYER = new RawTile(new PlayerValue());
  static readonly STONE = new RawTile(new StoneValue());
  static readonly FALLING_STONE = new RawTile(new FallingStoneValue());
  static readonly BOX = new RawTile(new BoxValue());
  static readonly FALLING_BOX = new RawTile(new FallingBoxValue());
  static readonly KEY1 = new RawTile(new Key1Value());
  static readonly LOCK1 = new RawTile(new Lock1Value());
  static readonly KEY2 = new RawTile(new Key2Value());
  static readonly LOCK2 = new RawTile(new Lock2Value());
  private constructor(private value: RawTileValue) {}
  transform() {
    return this.value.transform();
  }
}

const RAW_TILES = [
  RawTile.AIR,
  RawTile.FLUX,
  RawTile.UNBREAKABLE,
  RawTile.PLAYER,
  RawTile.STONE,
  RawTile.FALLING_STONE,
  RawTile.BOX,
  RawTile.FALLING_BOX,
  RawTile.KEY1,
  RawTile.LOCK1,
  RawTile.KEY2,
  RawTile.LOCK2,
];

interface Tile {
  isAir(): boolean;
  fits(id: number): boolean;
  draw(g: CanvasRenderingContext2D, x: number, y: number): void;
  moveHorizontal(map: Map, player: Player, dx: number): void;
  moveVertical(map: Map, player: Player, dy: number): void;
  update(map: Map, x: number, y: number): void;
  getBlockOnTopState(): FallingState;
}

class Air implements Tile {
  isAir() {
    return true;
  }
  fits() {
    return false;
  }
  draw() {}
  moveHorizontal(map: Map, player: Player, dx: number) {
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number) {
    player.move(map, 0, dy);
  }
  update() {}
  getBlockOnTopState() {
    return new Falling();
  }
}

class Flux implements Tile {
  isAir() {
    return false;
  }
  fits() {
    return false;
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#ccffcc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number) {
    player.move(map, 0, dy);
  }
  update() {}
  getBlockOnTopState() {
    return new Resting();
  }
}

class Unbreakable implements Tile {
  isAir() {
    return false;
  }
  fits() {
    return false;
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#999999";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal() {}
  moveVertical() {}
  update() {}
  getBlockOnTopState() {
    return new Resting();
  }
}

class PlayerTile implements Tile {
  isAir() {
    return false;
  }
  fits() {
    return false;
  }
  draw() {}
  moveHorizontal() {}
  moveVertical() {}
  update() {}
  getBlockOnTopState() {
    return new Resting();
  }
}

class Stone implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir() {
    return false;
  }
  fits() {
    return false;
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#0000cc";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(map, player, this, dx);
  }
  moveVertical() {}
  update(map: Map, x: number, y: number) {
    this.fallStrategy.update(map, this, x, y);
  }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Box implements Tile {
  private fallStrategy: FallStrategy;
  constructor(falling: FallingState) {
    this.fallStrategy = new FallStrategy(falling);
  }
  isAir() {
    return false;
  }
  fits() {
    return false;
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = "#8b4513";
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number) {
    this.fallStrategy.moveHorizontal(map, player, this, dx);
  }
  moveVertical() {}
  update(map: Map, x: number, y: number) {
    this.fallStrategy.update(map, this, x, y);
  }
  getBlockOnTopState() {
    return new Resting();
  }
}

class Key implements Tile {
  constructor(private keyConf: KeyConfiguration) {}
  isAir() {
    return false;
  }
  fits() {
    return false;
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.keyConf.getColor();
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, player: Player, dx: number): void {
    map.remove(this.keyConf.getRemoveStrategy());
    player.move(map, dx, 0);
  }
  moveVertical(map: Map, player: Player, dy: number): void {
    map.remove(this.keyConf.getRemoveStrategy());
    player.move(map, 0, dy);
  }
  update() {}
  getBlockOnTopState() {
    return new Resting();
  }
}

class LockTile implements Tile {
  constructor(private keyConf: KeyConfiguration) {}
  isAir() {
    return false;
  }
  fits(id: number) {
    return id === this.keyConf.getId();
  }
  draw(g: CanvasRenderingContext2D, x: number, y: number) {
    g.fillStyle = this.keyConf.getColor();
    g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal() {}
  moveVertical() {}
  update() {}
  getBlockOnTopState() {
    return new Resting();
  }
}

interface Input {
  isRight(): boolean;
  isLeft(): boolean;
  isUp(): boolean;
  isDown(): boolean;
  handle(map: Map, player: Player): void;
}

class Right implements Input {
  isRight() {
    return true;
  }
  isLeft() {
    return false;
  }
  isUp() {
    return false;
  }
  isDown() {
    return false;
  }
  handle(map: Map, player: Player) {
    player.moveHorizontal(map, 1);
  }
}

class Left implements Input {
  isRight() {
    return false;
  }
  isLeft() {
    return true;
  }
  isUp() {
    return false;
  }
  isDown() {
    return false;
  }
  handle(map: Map, player: Player) {
    player.moveHorizontal(map, -1);
  }
}

class Up implements Input {
  isRight() {
    return false;
  }
  isLeft() {
    return false;
  }
  isUp() {
    return true;
  }
  isDown() {
    return false;
  }
  handle(map: Map, player: Player) {
    player.moveVertical(map, -1);
  }
}

class Down implements Input {
  isRight() {
    return false;
  }
  isLeft() {
    return false;
  }
  isUp() {
    return false;
  }
  isDown() {
    return true;
  }
  handle(map: Map, player: Player) {
    player.moveVertical(map, 1);
  }
}

class Player {
  private x = 1;
  private y = 1;
  drawPlayer(g: CanvasRenderingContext2D) {
    g.fillStyle = "#ff0000";
    g.fillRect(this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
  moveHorizontal(map: Map, dx: number) {
    map.moveHorizontal(this, this.x, this.y, dx);
  }
  moveVertical(map: Map, dy: number) {
    map.moveVertical(this, this.x, this.y, dy);
  }
  move(map: Map, dx: number, dy: number) {
    this.moveToTile(map, this.x + dx, this.y + dy);
  }
  pushHorizontal(map: Map, tile: Tile, dx: number) {
    map.pushHorizontal(this, tile, this.x, this.y, dx);
  }
  moveToTile(map: Map, newx: number, newy: number) {
    map.movePlayer(this.x, this.y, newx, newy);
    this.x = newx;
    this.y = newy;
  }
}

class Map {
  private map: Tile[][];
  private setTile(x: number, y: number, tile: Tile) {
    this.map[y][x] = tile;
  }
  constructor() {
    this.map = new Array(rawMap.length);
    for (let y = 0; y < rawMap.length; y++) {
      this.map[y] = new Array(rawMap[y].length);
      for (let x = 0; x < rawMap[y].length; x++) {
        this.map[y][x] = RAW_TILES[rawMap[y][x]].transform();
      }
    }
  }
  update() {
    for (let y = this.map.length - 1; y >= 0; y--) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].update(map, x, y);
      }
    }
  }
  draw(g: CanvasRenderingContext2D) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        this.map[y][x].draw(g, x, y);
      }
    }
  }
  drop(tile: Tile, x: number, y: number) {
    this.setTile(x, y + 1, tile);
    this.setTile(x, y, new Air());
  }
  getBlockOnTopState(x: number, y: number) {
    return this.map[y][x].getBlockOnTopState();
  }
  isAir(x: number, y: number) {
    return this.map[y][x].isAir();
  }
  movePlayer(x: number, y: number, newx: number, newy: number) {
    this.setTile(x, y, new Air());
    this.setTile(newx, newy, new PlayerTile());
  }
  moveHorizontal(player: Player, x: number, y: number, dx: number) {
    this.map[y][x + dx].moveHorizontal(this, player, dx);
  }
  moveVertical(player: Player, x: number, y: number, dy: number) {
    this.map[y + dy][x].moveVertical(this, player, dy);
  }
  remove(shouldRemove: RemoveStrategy) {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (shouldRemove.check(this.map[y][x])) {
          this.setTile(x, y, new Air());
        }
      }
    }
  }
  pushHorizontal(player: Player, tile: Tile, x: number, y: number, dx: number) {
    if (this.isAir(x + dx + dx, y) && !this.isAir(x + dx, y + 1)) {
      this.setTile(x + dx + dx, y, tile);
      player.moveToTile(this, x + dx, y);
    }
  }
}

let player = new Player();
let rawMap: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2],
  [2, 3, 0, 1, 1, 2, 0, 2],
  [2, 4, 2, 6, 1, 2, 0, 2],
  [2, 8, 4, 1, 1, 2, 0, 2],
  [2, 4, 1, 1, 1, 9, 0, 2],
  [2, 2, 2, 2, 2, 2, 2, 2],
];

let map = new Map();

let inputs: Input[] = [];

function update(map: Map, player: Player) {
  handleInputs(map, player);
  map.update();
}

function handleInputs(map: Map, player: Player) {
  while (inputs.length > 0) {
    let current = inputs.pop();
    current.handle(map, player);
  }
}

function createGraphics() {
  let canvas = document.getElementById("GameCanvas") as HTMLCanvasElement;
  let g = canvas.getContext("2d");
  g.clearRect(0, 0, canvas.width, canvas.height);
  return g;
}

function draw(map: Map, player: Player) {
  const g = createGraphics();

  map.draw(g);
  player.drawPlayer(g);
}

function gameLoop(map: Map, player: Player) {
  let before = Date.now();
  update(map, player);
  draw(map, player);
  let after = Date.now();
  let frameTime = after - before;
  let sleep = SLEEP - frameTime;
  setTimeout(() => gameLoop(map, player), sleep);
}

window.onload = () => {
  gameLoop(map, player);
};

const LEFT_KEY = "ArrowLeft";
const UP_KEY = "ArrowUp";
const RIGHT_KEY = "ArrowRight";
const DOWN_KEY = "ArrowDown";
window.addEventListener("keydown", (e) => {
  if (e.key === LEFT_KEY || e.key === "a") inputs.push(new Left());
  else if (e.key === UP_KEY || e.key === "w") inputs.push(new Up());
  else if (e.key === RIGHT_KEY || e.key === "d") inputs.push(new Right());
  else if (e.key === DOWN_KEY || e.key === "s") inputs.push(new Down());
});
