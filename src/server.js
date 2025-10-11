/**
 * Server module - Handles server process management and startup
 */

const { spawn } = require('child_process');
const { initSessionsFile } = require('./session');
const { getSystemTray, startPolling, shutdownServer } = require('./system-tray');
const {
  isRunningInElectron,
  hideFromDock,
  preventWindowCreation,
  setupAppEventHandlers,
  whenReady,
  quit
} = require('./electron');
const { isServerRunning } = require('./commands');
const { writePidFile } = require('./pid');

const CHECK_INTERVAL = 5 * 1000; // 10 seconds

/**
 * Start the caffeine server with system tray
 */
const startServer = async () => {
  try {
    // Check if server is already running before starting
    const alreadyRunning = await isServerRunning();
    if (alreadyRunning) {
      console.error('Caffeine server is already running');
      return null;
    }

    // Write PID file before starting server operations
    await writePidFile(process.pid);

    await initSessionsFile();
    const state = getSystemTray();
    startPolling(state, CHECK_INTERVAL);
    console.error('Caffeine server started successfully with system tray');
    return state;
  } catch (error) {
    console.error('Failed to start caffeine server:', error);
    throw error;
  }
};

/**
 * Handle server command - start Electron server or delegate
 */
const handleServer = async () => {
  // First check if server is already running
  const alreadyRunning = await isServerRunning();
  if (alreadyRunning) {
    console.error('Caffeine server is already running');
    return;
  }

  if (isRunningInElectron()) {
    console.error('Already running inside Electron, starting server...');
    return await startServerInsideElectron();
  } else {
    console.error('Not running inside Electron, spawning Electron process...');
    return spawnElectronProcess();
  }
};

/**
 * Start server when already inside Electron
 */
const startServerInsideElectron = async () => {
  console.error('Loading Electron...');

  // Prevent any window from being created
  preventWindowCreation();

  // Setup event handlers with shutdown callback
  setupAppEventHandlers(() => {
    // We'll handle shutdown in the main process
    process.exit(0);
  });

  // Wait for app to be ready before starting system tray
  await whenReady();

  // Hide app from dock on macOS
  hideFromDock();

  // Start the actual server
  try {
    const state = await startServer();

    // Only setup signal handlers if server actually started
    if (state) {
      // Handle process termination for Electron process
      process.on('SIGINT', async () => {
        console.error('Received SIGINT, shutting down server...');
        await shutdownServer(state);
        quit();
      });

      process.on('SIGTERM', async () => {
        console.error('Received SIGTERM, shutting down server...');
        await shutdownServer(state);
        quit();
      });
    }

    return state;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Spawn new Electron process for server
 */
const spawnElectronProcess = () => {
  const electronProcess = spawn('npx', ['electron', 'caffeine.js', 'server'], {
    stdio: 'inherit',
    shell: true,
    detached: false
  });

  electronProcess.on('exit', code => {
    process.exit(code || 0);
  });

  electronProcess.on('error', error => {
    console.error('Failed to spawn Electron process:', error);
    process.exit(1);
  });

  return electronProcess;
};

module.exports = {
  startServer,
  handleServer,
  startServerInsideElectron,
  spawnElectronProcess
};
