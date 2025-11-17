export class SizingConfig {
	static readonly BLOCK_SIZE = 24;
	static readonly BOARD_WIDTH_BLOCKS = 10;
	static readonly BOARD_HEIGHT_BLOCKS = 20;
	static readonly PREVIEW_BOARD_WIDTH = 112;
	static readonly HOLD_BOARD_WIDTH = 112;
	static readonly HOLD_CONTAINER_SIZE = 112;

	static get BOARD_WIDTH_PX(): number {
		return this.BLOCK_SIZE * this.BOARD_WIDTH_BLOCKS;
	}

	static get BOARD_HEIGHT_PX(): number {
		return this.BLOCK_SIZE * this.BOARD_HEIGHT_BLOCKS;
	}
}
