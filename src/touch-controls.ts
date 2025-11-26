export class TouchControlsManager {
	private container: HTMLElement;
	private eventListeners: Map<HTMLElement, { event: string; handler: EventListener }[]>;

	constructor(container: HTMLElement) {
		this.container = container;
		this.eventListeners = new Map();
		this.initialize();
	}

	private initialize(): void {
		const buttonMappings: { selector: string; key: string }[] = [
			{ selector: "[data-touch-left]", key: "ArrowLeft" },
			{ selector: "[data-touch-right]", key: "ArrowRight" },
			{ selector: "[data-touch-down]", key: "ArrowDown" },
			{ selector: "[data-touch-rotate]", key: "ArrowUp" },
			{ selector: "[data-touch-hard-drop]", key: " " },
			{ selector: "[data-touch-hold]", key: "h" },
			{ selector: "[data-touch-pause]", key: "p" },
		];

		buttonMappings.forEach(({ selector, key }) => {
			const button = this.container.querySelector(selector) as HTMLElement;
			if (button) {
				this.attachEventListeners(button, key);
			}
		});
	}

	private attachEventListeners(button: HTMLElement, key: string): void {
		const handlers: { event: string; handler: EventListener }[] = [];

		const clickHandler = (e: Event) => {
			e.preventDefault();
			this.dispatchKeyboardEvent(key);
		};

		const touchHandler = (e: Event) => {
			e.preventDefault();
			this.dispatchKeyboardEvent(key);
		};

		button.addEventListener("click", clickHandler);
		button.addEventListener("touchstart", touchHandler);

		handlers.push({ event: "click", handler: clickHandler });
		handlers.push({ event: "touchstart", handler: touchHandler });

		this.eventListeners.set(button, handlers);
	}

	private dispatchKeyboardEvent(key: string): void {
		const event = new KeyboardEvent("keydown", {
			key: key,
			bubbles: true,
			cancelable: true,
		});
		document.dispatchEvent(event);
	}

	show(): void {
		this.container.style.display = "block";
	}

	hide(): void {
		this.container.style.display = "none";
	}

	destroy(): void {
		this.eventListeners.forEach((handlers, button) => {
			handlers.forEach(({ event, handler }) => {
				button.removeEventListener(event, handler);
			});
		});
		this.eventListeners.clear();
	}

	static isTouchDevice(): boolean {
		return "ontouchstart" in window || navigator.maxTouchPoints > 0;
	}
}
