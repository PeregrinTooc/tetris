// Advanced Cypress optimizations for maximum speed
const { defineConfig } = require("cypress");

module.exports = (on, config) => {
  // Browser launch optimizations
  on("before:browser:launch", (browser, launchOptions) => {
    if (browser.family === "chromium" && browser.name !== "electron") {
      // Chrome/Edge optimizations
      launchOptions.args.push(
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-web-security",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-features=TranslateUI",
        "--disable-ipc-flooding-protection",
        "--memory-pressure-off",
        "--max_old_space_size=4096"
      );
    }

    if (browser.name === "electron") {
      // Electron optimizations (fastest for headless)
      launchOptions.args["disable-dev-shm-usage"] = true;
      launchOptions.args["disable-gpu"] = true;
      launchOptions.args["no-sandbox"] = true;
    }

    return launchOptions;
  });

  // Task optimizations
  on("task", {
    log(message) {
      console.log(message);
      return null;
    },
  });

  return config;
};
