import { Tetromino, Block } from "./tetromino-base";

export class TetrominoS extends Tetromino {

	getClassName(): string {
		return "tetromino tetromino-s";
	}

	 getBlocks(): Block[] {
	 let blocks: Block[];
	 switch (this.rotation % 2) {
	 case 0:
	 blocks = [
	 new Block({ x: this.left, y: this.top, parent: this }),
	 new Block({ x: this.left - 1, y: this.top, parent: this }),
	 new Block({ x: this.left, y: this.top + 1, parent: this }),
	 new Block({ x: this.left + 1, y: this.top + 1, parent: this })
	 ];
	 break;
	 default:
	 blocks = [
	 new Block({ x: this.left, y: this.top, parent: this }),
	 new Block({ x: this.left, y: this.top + 1, parent: this }),
	 new Block({ x: this.left - 1, y: this.top, parent: this }),
	 new Block({ x: this.left - 1, y: this.top - 1, parent: this })
	 ];
	 }
	 this.blocks = blocks;
	 return blocks;
	 }
}
