/**
 * Electron module - Handles all Electron-specific functionality
 */

let electron, Tray, Menu, powerSaveBlocker, nativeImage, app;
let isElectron = false;

/**
 * Load Electron modules only when needed
 */
const loadElectron = () => {
  if (isElectron) {
    return;
  }

  try {
    electron = require('electron');
    Tray = electron.Tray;
    Menu = electron.Menu;
    powerSaveBlocker = electron.powerSaveBlocker;
    nativeImage = electron.nativeImage;
    app = electron.app;
    isElectron = true;
  } catch (error) {
    console.error('Failed to load Electron:', error.message);
    console.error('Make sure to use Electron: npx electron caffeine.js server');
    process.exit(1);
  }
};

/**
 * Get Electron modules
 */
const getElectron = () => {
  if (!isElectron) {
    loadElectron();
  }
  return {
    electron,
    Tray,
    Menu,
    powerSaveBlocker,
    nativeImage,
    app
  };
};

/**
 * Check if running inside Electron
 */
const isRunningInElectron = () => {
  return !!process.versions.electron;
};

/**
 * Hide app from dock on macOS
 */
const hideFromDock = () => {
  const { app } = getElectron();
  if (app.dock && typeof app.dock.hide === 'function') {
    try {
      app.dock.hide();
    } catch (error) {
      // Silently ignore if not macOS or other error
    }
  }
};

/**
 * Prevent any window from being created
 */
const preventWindowCreation = () => {
  const { app } = getElectron();
  app.on('browser-window-created', (event, window) => {
    window.hide();
  });
};

/**
 * Setup Electron app event handlers
 */
const setupAppEventHandlers = shutdownCallback => {
  const { app } = getElectron();

  app.on('window-all-closed', () => {
    // Don't quit on window close since we're running in background
  });

  app.on('before-quit', () => {
    // Cleanup handled by shutdown callback
  });

  app.on('activate', () => {
    // No window to restore, we're system tray only
  });

  process.on('SIGINT', () => {
    if (shutdownCallback) {
      shutdownCallback();
    } else {
      process.exit(0);
    }
  });

  process.on('SIGTERM', () => {
    if (shutdownCallback) {
      shutdownCallback();
    } else {
      process.exit(0);
    }
  });
};

/**
 * Wait for Electron app to be ready
 */
const whenReady = () => {
  const { app } = getElectron();
  return app.whenReady();
};

/**
 * Quit Electron app
 */
const quit = () => {
  const { app } = getElectron();
  if (app && typeof app.quit === 'function') {
    app.quit();
  } else {
    process.exit(0);
  }
};

module.exports = {
  loadElectron,
  getElectron,
  isRunningInElectron,
  hideFromDock,
  preventWindowCreation,
  setupAppEventHandlers,
  whenReady,
  quit
};
