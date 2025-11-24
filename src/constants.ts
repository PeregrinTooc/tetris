export const CELL_SIZE = 24;
export const BOARD_COLUMNS = 10;
export const BOARD_ROWS = 20; // Valid row indexes 0..BOARD_ROWS-1
export const BOTTOM_ROW_INDEX = BOARD_ROWS - 1; // 19
export const BOTTOM_ROW_PIXEL = BOTTOM_ROW_INDEX * CELL_SIZE; // 456

// Line clearing animation durations (in milliseconds)
export const LINE_CLEAR_FLASH_DURATION = 200;
export const LINE_CLEAR_FADE_DURATION = 200;
export const LINE_CLEAR_ANIMATION_DURATION = LINE_CLEAR_FLASH_DURATION + LINE_CLEAR_FADE_DURATION;
