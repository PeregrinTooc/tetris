import { Tetromino, Block } from "./tetromino-base";

export class TetrominoT extends Tetromino {


	getClassName(): string {
		return "tetromino tetromino-t";
	}

	 getBlocks(): Block[] {
	 let blocks: Block[];
	 switch (this.rotation % 4) {
	 case 0:
	 blocks = [
	 new Block({ x: this.left, y: this.top, parent: this }),
	 new Block({ x: this.left - 1, y: this.top, parent: this }),
	 new Block({ x: this.left + 1, y: this.top, parent: this }),
	 new Block({ x: this.left, y: this.top + 1, parent: this }),
	 ];
	 break;
	 case 1:
	 blocks = [
	 new Block({ x: this.left, y: this.top, parent: this }),
	 new Block({ x: this.left, y: this.top - 1, parent: this }),
	 new Block({ x: this.left, y: this.top + 1, parent: this }),
	 new Block({ x: this.left + 1, y: this.top, parent: this }),
	 ];
	 break;
	 case 2:
	 blocks = [
	 new Block({ x: this.left, y: this.top, parent: this }),
	 new Block({ x: this.left - 1, y: this.top, parent: this }),
	 new Block({ x: this.left + 1, y: this.top, parent: this }),
	 new Block({ x: this.left, y: this.top - 1, parent: this }),
	 ];
	 break;
	 default:
	 blocks = [
	 new Block({ x: this.left, y: this.top, parent: this }),
	 new Block({ x: this.left, y: this.top - 1, parent: this }),
	 new Block({ x: this.left, y: this.top + 1, parent: this }),
	 new Block({ x: this.left - 1, y: this.top, parent: this }),
	 ];
	 }
	 this.blocks = blocks;
	 return blocks;
	 }
}
