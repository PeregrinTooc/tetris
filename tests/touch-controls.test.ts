import { TouchControlsManager } from "../src/touch-controls";

describe("TouchControlsManager", () => {
	let container: HTMLElement;
	let touchControls: TouchControlsManager;
	let dispatchedEvents: KeyboardEvent[];
	let keydownHandler: (e: Event) => void;

	beforeEach(() => {
		container = document.createElement("div");
		container.innerHTML = `
			<button data-touch-left></button>
			<button data-touch-right></button>
			<button data-touch-down></button>
			<button data-touch-rotate></button>
			<button data-touch-hard-drop></button>
			<button data-touch-hold></button>
			<button data-touch-pause></button>
		`;
		document.body.appendChild(container);

		dispatchedEvents = [];
		keydownHandler = (e: Event) => {
			dispatchedEvents.push(e as KeyboardEvent);
		};
		document.addEventListener("keydown", keydownHandler);

		touchControls = new TouchControlsManager(container);
	});

	afterEach(() => {
		touchControls.destroy();
		document.removeEventListener("keydown", keydownHandler);
		document.body.removeChild(container);
		dispatchedEvents = [];
	});

	describe("button clicks", () => {
		it("dispatches ArrowLeft on left button click", () => {
			const button = container.querySelector("[data-touch-left]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("ArrowLeft");
		});

		it("dispatches ArrowRight on right button click", () => {
			const button = container.querySelector("[data-touch-right]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("ArrowRight");
		});

		it("dispatches ArrowDown on down button click", () => {
			const button = container.querySelector("[data-touch-down]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("ArrowDown");
		});

		it("dispatches ArrowUp on rotate button click", () => {
			const button = container.querySelector("[data-touch-rotate]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("ArrowUp");
		});

		it("dispatches Space on hard drop button click", () => {
			const button = container.querySelector("[data-touch-hard-drop]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe(" ");
		});

		it("dispatches H on hold button click", () => {
			const button = container.querySelector("[data-touch-hold]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("h");
		});

		it("dispatches P on pause button click", () => {
			const button = container.querySelector("[data-touch-pause]") as HTMLButtonElement;
			button.click();

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("p");
		});
	});

	describe("touch events", () => {
		it("dispatches event on touchstart for left button", () => {
			const button = container.querySelector("[data-touch-left]") as HTMLButtonElement;
			const touchEvent = new TouchEvent("touchstart", {
				bubbles: true,
				cancelable: true,
				touches: [{ clientX: 0, clientY: 0 } as Touch],
			});
			button.dispatchEvent(touchEvent);

			expect(dispatchedEvents).toHaveLength(1);
			expect(dispatchedEvents[0].key).toBe("ArrowLeft");
		});

		it("prevents default behavior on touchstart", () => {
			const button = container.querySelector("[data-touch-left]") as HTMLButtonElement;
			const touchEvent = new TouchEvent("touchstart", {
				bubbles: true,
				cancelable: true,
				touches: [{ clientX: 0, clientY: 0 } as Touch],
			});

			const preventDefaultSpy = jest.spyOn(touchEvent, "preventDefault");
			button.dispatchEvent(touchEvent);

			expect(preventDefaultSpy).toHaveBeenCalled();
		});
	});

	describe("visibility control", () => {
		it("shows controls when show() is called", () => {
			touchControls.hide();
			touchControls.show();

			expect(container.style.display).not.toBe("none");
		});

		it("hides controls when hide() is called", () => {
			touchControls.hide();

			expect(container.style.display).toBe("none");
		});
	});

	describe("cleanup", () => {
		it("removes event listeners on destroy", () => {
			const button = container.querySelector("[data-touch-left]") as HTMLButtonElement;
			touchControls.destroy();

			button.click();

			expect(dispatchedEvents).toHaveLength(0);
		});
	});

	describe("isTouchDevice detection", () => {
		it("returns true when ontouchstart exists", () => {
			const originalOntouchstart = window.ontouchstart;
			(window as any).ontouchstart = null;

			const result = TouchControlsManager.isTouchDevice();

			expect(result).toBe(true);

			if (originalOntouchstart === undefined) {
				delete (window as any).ontouchstart;
			} else {
				window.ontouchstart = originalOntouchstart;
			}
		});
	});
});
