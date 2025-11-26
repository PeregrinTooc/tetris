export class SizingConfig {
	static readonly DESKTOP_BLOCK_SIZE = 24;
	static readonly MOBILE_BLOCK_SIZE = 16;
	static readonly BOARD_WIDTH_BLOCKS = 11;
	static readonly BOARD_HEIGHT_BLOCKS = 20;
	static readonly PREVIEW_BOARD_WIDTH = 112;
	static readonly HOLD_BOARD_WIDTH = 112;
	static readonly HOLD_CONTAINER_SIZE = 112;

	static get BLOCK_SIZE(): number {
		return this.isMobileViewport() ? this.MOBILE_BLOCK_SIZE : this.DESKTOP_BLOCK_SIZE;
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
		return Math.floor(
			this.PREVIEW_BOARD_WIDTH * (this.MOBILE_BLOCK_SIZE / this.DESKTOP_BLOCK_SIZE)
		);
	}

	static getMobileHoldWidth(): number {
		return Math.floor(
			this.HOLD_BOARD_WIDTH * (this.MOBILE_BLOCK_SIZE / this.DESKTOP_BLOCK_SIZE)
		);
	}
}
