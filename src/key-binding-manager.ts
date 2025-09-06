export interface KeyBinding {
    action: "moveLeft" | "moveRight" | "rotateClockwise" | "rotateCounterClockwise" | "softDrop" | "hardDrop";
    key: string;
}

export class KeyBindingManager {
    private bindings: Map<string, KeyBinding["action"]>;
    private static readonly STORAGE_KEY = "tetris-key-bindings";
    private static readonly DEFAULT_BINDINGS: KeyBinding[] = [
        { action: "moveLeft", key: "ArrowLeft" },
        { action: "moveRight", key: "ArrowRight" },
        { action: "rotateClockwise", key: "ArrowUp" },
        { action: "rotateCounterClockwise", key: "z" },
        { action: "softDrop", key: "ArrowDown" },
        { action: "hardDrop", key: " " }
    ];

    constructor() {
        this.bindings = new Map();
        this.loadBindings();
    }

    private loadBindings() {
        const savedBindings = localStorage.getItem(KeyBindingManager.STORAGE_KEY);
        const bindings: KeyBinding[] = savedBindings
            ? JSON.parse(savedBindings)
            : KeyBindingManager.DEFAULT_BINDINGS;

        this.bindings.clear();
        bindings.forEach(binding => {
            this.bindings.set(binding.key.toLowerCase(), binding.action);
        });
    }

    getActionForKey(key: string): KeyBinding["action"] | undefined {
        return this.bindings.get(key.toLowerCase());
    }

    getCurrentBindings(): KeyBinding[] {
        return Array.from(this.bindings.entries()).map(([key, action]) => ({
            action,
            key
        }));
    }

    rebindKey(action: KeyBinding["action"], newKey: string) {
        // Remove any existing binding for this key
        const lowerKey = newKey.toLowerCase();
        for (const [key] of this.bindings.entries()) {
            if (key.toLowerCase() === lowerKey) {
                this.bindings.delete(key);
            }
        }

        // Remove old binding for this action
        for (const [key, boundAction] of this.bindings.entries()) {
            if (boundAction === action) {
                this.bindings.delete(key);
            }
        }

        // Set new binding
        this.bindings.set(lowerKey, action);
        this.saveBindings();
    }

    private saveBindings() {
        localStorage.setItem(
            KeyBindingManager.STORAGE_KEY,
            JSON.stringify(this.getCurrentBindings())
        );
    }
}
