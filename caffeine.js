#!/usr/bin/env node

/**
 * Main entry point for CC-Caffeine application
 *
 * This file contains the main() function and orchestrates all modules.
 * All functionality has been split into separate modules for better organization.
 */

const { handleCaffeinate, handleUncaffeinate, handleStatus, showUsage } = require('./src/commands');
const { handleServer } = require('./src/server');

// Re-export key functions for backward compatibility and testing
const {
  getSystemTray,
  enableCaffeine,
  disableCaffeine,
  updateCaffeineStatus,
  shutdownServer
} = require('./src/system-tray');

const { isServerRunning, ensureServer } = require('./src/commands');

/**
 * Main application entry point
 * Handles command routing and delegates to appropriate modules
 */
const main = async () => {
  const command = process.argv[2];

  switch (command) {
  case 'caffeinate':
    handleCaffeinate();
    break;
  case 'uncaffeinate':
    handleUncaffeinate();
    break;
  case 'server':
    handleServer();
    break;
  case 'status':
    handleStatus();
    break;
  default:
    showUsage();
  }
};

// Handle uncaught errors gracefully
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Export functions for testing or external use
module.exports = {
  // System tray functionality (from system-tray.js)
  getSystemTray,
  enableCaffeine,
  disableCaffeine,
  updateCaffeineStatus,
  shutdownServer,

  // Client utilities (from commands.js)
  isServerRunning,
  ensureServer,

  // Server functionality (from server.js)
  handleServer,

  // Command handlers (from commands.js)
  handleCaffeinate,
  handleUncaffeinate,
  handleStatus,
  showUsage
};
