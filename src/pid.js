#!/usr/bin/env node

/**
 * PID management module - Handles atomic PID file operations and validation
 *
 * This module provides functions to:
 * - Atomically read/write PID files
 * - Validate if a PID belongs to a caffeine server process
 * - Clean up stale PID files
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const lockfile = require('proper-lockfile');

const CLAUDE_PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT;
const CONFIG_DIR = CLAUDE_PLUGIN_ROOT
  ? CLAUDE_PLUGIN_ROOT
  : path.join(os.homedir(), '.claude', 'plugins', 'cc-caffeine');
const PID_FILE = path.join(CONFIG_DIR, 'server.pid');

/**
 * Ensure config directory exists
 */
const ensureConfigDir = async () => {
  try {
    await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
};

/**
 * Write PID to file atomically
 * @param {number} pid - Process ID to write
 */
const writePidFile = async pid => {
  await ensureConfigDir();

  try {
    // Acquire lock on PID file
    const release = await lockfile.lock(PID_FILE, {
      retries: 0,
      stale: 1000 // 1 second
    });

    try {
      await fs.promises.writeFile(PID_FILE, pid.toString(), 'utf8');
    } finally {
      await release();
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, create it without locking
      await fs.promises.writeFile(PID_FILE, pid.toString(), 'utf8');
    } else {
      throw error;
    }
  }
};

/**
 * Read PID from file atomically
 * @returns {number|null} PID if found and valid, null otherwise
 */
const readPidFile = async () => {
  try {
    const release = await lockfile.lock(PID_FILE, {
      retries: 3,
      stale: 10000 // 10 seconds
    });

    try {
      const pidStr = await fs.promises.readFile(PID_FILE, 'utf8');
      const pid = parseInt(pidStr.trim(), 10);

      if (isNaN(pid) || pid <= 0) {
        return null;
      }

      return pid;
    } finally {
      await release();
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
};

/**
 * Remove PID file atomically
 */
const removePidFile = async () => {
  try {
    const release = await lockfile.lock(PID_FILE, {
      retries: 3,
      stale: 10000 // 10 seconds
    });

    try {
      await fs.promises.unlink(PID_FILE);
    } finally {
      await release();
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File already doesn't exist, that's fine
      return;
    }
    throw error;
  }
};

/**
 * Check if a process with given PID exists and is a caffeine server
 * @param {number} pid - Process ID to check
 * @returns {Promise<boolean>} True if process exists and is caffeine server
 */
const validatePid = async pid => {
  return new Promise(resolve => {
    // First check if process exists
    try {
      process.kill(pid, 0); // Signal 0 just checks if process exists
    } catch (error) {
      if (error.code === 'ESRCH') {
        // Process doesn't exist
        resolve(false);
        return;
      }
      // Other errors (like EPERM) mean process exists but we can't signal it
    }

    // Process exists, now check if it's a caffeine server
    const isWindows = os.platform() === 'win32';
    const psCommand = isWindows
      ? spawn('wmic', ['process', 'where', `processid=${pid}`, 'get', 'commandline'], {
        stdio: 'pipe'
      })
      : spawn('ps', ['-p', pid, '-o', 'command='], { stdio: 'pipe' });

    let output = '';

    psCommand.stdout.on('data', data => {
      output += data.toString();
    });

    psCommand.on('close', code => {
      if (code !== 0) {
        resolve(false);
        return;
      }

      const commandLine = output.trim().toLowerCase();

      // Check if command line contains both "caffeine" and "server"
      const isCaffeineServer =
        commandLine.includes('caffeine server') || commandLine.includes('caffeine.js server');

      resolve(isCaffeineServer);
    });

    psCommand.on('error', () => {
      resolve(false);
    });
  });
};

/**
 * Check if caffeine server is running using PID file
 * @returns {Promise<boolean>} True if server is running
 */
const isServerRunning = async () => {
  try {
    const pid = await readPidFile();

    if (!pid) {
      return false;
    }

    const isValid = await validatePid(pid);

    if (!isValid) {
      // PID is stale, clean it up
      await removePidFile();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking if server is running:', error);
    return false;
  }
};

/**
 * Get the PID of running caffeine server
 * @returns {Promise<number|null>} PID if server is running, null otherwise
 */
const getServerPid = async () => {
  try {
    const pid = await readPidFile();

    if (!pid) {
      return null;
    }

    const isValid = await validatePid(pid);

    if (!isValid) {
      // PID is stale, clean it up
      await removePidFile();
      return null;
    }

    return pid;
  } catch (error) {
    console.error('Error getting server PID:', error);
    return null;
  }
};

module.exports = {
  writePidFile,
  readPidFile,
  removePidFile,
  validatePid,
  isServerRunning,
  getServerPid,
  CONFIG_DIR,
  PID_FILE
};
