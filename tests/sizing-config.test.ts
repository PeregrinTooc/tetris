import { describe, it, expect } from "@jest/globals";
import { SizingConfig } from "../src/sizing-config";

describe("SizingConfig", () => {
	it("should define block size constant", () => {
		expect(SizingConfig.BLOCK_SIZE).toBe(24);
	});

	it("should define board dimensions in blocks", () => {
		expect(SizingConfig.BOARD_WIDTH_BLOCKS).toBe(11);
		expect(SizingConfig.BOARD_HEIGHT_BLOCKS).toBe(20);
	});

	it("should calculate board width in pixels including padding", () => {
		// 11 blocks * 24px = 264px (desktop), 11 blocks * 16px = 176px (mobile)
		const expectedWidth = SizingConfig.isMobileViewport() ? 176 : 264;
		expect(SizingConfig.BOARD_WIDTH_PX).toBe(expectedWidth);
	});

	it("should calculate board height in pixels including padding", () => {
		// 20 blocks * 24px = 480px
		expect(SizingConfig.BOARD_HEIGHT_PX).toBe(480);
	});

	it("should define preview board dimensions", () => {
		expect(SizingConfig.PREVIEW_BOARD_WIDTH).toBe(112);
		expect(SizingConfig.HOLD_BOARD_WIDTH).toBe(112);
	});

	it("should define hold container dimensions", () => {
		expect(SizingConfig.HOLD_CONTAINER_SIZE).toBe(112);
	});
});
