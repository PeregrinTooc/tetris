export class SizingConfig {
	static readonly DESKTOP_BLOCK_SIZE = 24;
	static readonly BOARD_WIDTH_BLOCKS = 11;
	static readonly BOARD_HEIGHT_BLOCKS = 20;
	static readonly PREVIEW_BOARD_WIDTH = 112;
	static readonly HOLD_BOARD_WIDTH = 112;
	static readonly HOLD_CONTAINER_SIZE = 112;

	static readonly MOBILE_GAME_WIDTH_VW = 47;

	static get BLOCK_SIZE(): number {
		if (!this.isMobileViewport()) {
			return this.DESKTOP_BLOCK_SIZE;
		}

		const viewportWidth = window.innerWidth;
		const gameWidthPx = (viewportWidth * this.MOBILE_GAME_WIDTH_VW) / 100;
		return Math.floor(gameWidthPx / this.BOARD_WIDTH_BLOCKS);
	}

	static isMobileViewport(): boolean {
		return window.innerWidth <= 768;
	}

	static get BOARD_WIDTH_PX(): number {
		return this.BLOCK_SIZE * this.BOARD_WIDTH_BLOCKS;
	}

	static get BOARD_HEIGHT_PX(): number {
		return this.BLOCK_SIZE * this.BOARD_HEIGHT_BLOCKS;
	}

	static getMobilePreviewWidth(): number {
		if (!this.isMobileViewport()) {
			return this.PREVIEW_BOARD_WIDTH;
		}
		const blockSize = this.BLOCK_SIZE;
		return Math.floor(blockSize * 6);
	}

	static getMobileHoldWidth(): number {
		if (!this.isMobileViewport()) {
			return this.HOLD_BOARD_WIDTH;
		}
		const blockSize = this.BLOCK_SIZE;
		return Math.floor(blockSize * 6);
	}
}
