#!/usr/bin/env node

/**
 * Commands module - Handles all command-line interface functionality
 */

const { spawn } = require('child_process');
const { addSessionWithLock, removeSessionWithLock } = require('./session');
const { isServerRunning: isServerRunningPid } = require('./pid');

/**
 * Check if caffeine server is currently running
 * Uses PID file for fast and reliable detection
 */
const isServerRunning = async () => {
  return await isServerRunningPid();
};

/**
 * Start server process using npm
 */
const startServerProcess = async () => {
  console.error('Starting caffeine server...');

  const serverProcess = spawn('npm', ['run', 'server'], {
    detached: true,
    stdio: 'ignore'
  });

  serverProcess.unref();

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 500));

  return true;
};

/**
 * Ensure server is running, start if needed
 */
const ensureServer = async () => {
  const isRunning = await isServerRunning();
  if (isRunning) {
    console.error('Server is already running');
    return;
  }

  console.error('Server not running, starting...');
  await startServerProcess();
};

/**
 * Handle session commands with JSON input from Claude Code hooks
 */
const handleSessionCommand = async (action, sessionOperation) => {
  try {
    // Read session_id from stdin (Claude Code hook format)
    let input = '';
    process.stdin.setEncoding('utf8');

    await new Promise((resolve, reject) => {
      process.stdin.on('data', chunk => (input += chunk));
      process.stdin.on('end', resolve);
      process.stdin.on('error', reject);
    });

    const data = JSON.parse(input);
    const sessionId = data.session_id;

    if (!sessionId) {
      console.error('Error: session_id required in JSON input');
      process.exit(1);
    }

    // Execute the session operation
    const result = await sessionOperation(sessionId);

    // For caffeinate command, ensure server is running
    if (action === 'caffeinate') {
      await ensureServer();
    }

    console.error(
      `${action === 'caffeinate' ? 'Enabled' : 'Disabled'} caffeine for session: ${sessionId}`
    );

    // Log cleanup results if any
    if (result.cleaned_sessions > 0) {
      console.error(`Cleaned up ${result.cleaned_sessions} expired sessions`);
    }

    return result;
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

/**
 * Handle caffeinate command
 */
const handleCaffeinate = () => {
  return handleSessionCommand('caffeinate', addSessionWithLock);
};

/**
 * Handle uncaffeinate command
 */
const handleUncaffeinate = () => {
  return handleSessionCommand('uncaffeinate', removeSessionWithLock);
};

/**
 * Handle status command - show current sessions and server status
 */
const handleStatus = async () => {
  try {
    const { getActiveSessionsWithLock } = require('./session');
    const { isServerRunning } = require('./pid');

    const serverRunning = await isServerRunning();
    const activeSessions = await getActiveSessionsWithLock();

    console.error('=== CC-Caffeine Status ===');
    console.error(`Server Status: ${serverRunning ? '✅ Running' : '❌ Stopped'}`);
    console.error(`Active Sessions: ${activeSessions.length}`);

    if (activeSessions.length > 0) {
      console.error('\nActive Sessions:');
      activeSessions.forEach((session, index) => {
        const created = new Date(session.created_at).toLocaleString();
        const lastActivity = new Date(session.last_activity).toLocaleString();
        console.error(`  ${index + 1}. ${session.id}`);
        console.error(`     Created: ${created}`);
        console.error(`     Last Activity: ${lastActivity}`);
        if (session.project_dir) {
          console.error(`     Project: ${session.project_dir}`);
        }
      });
    }

    console.error('\nSession timeout: 15 minutes of inactivity');
  } catch (error) {
    console.error('Error getting status:', error.message);
    process.exit(1);
  }
};

/**
 * Show usage help
 */
const showUsage = () => {
  console.error('Usage: npx electron caffeine.js [caffeinate|uncaffeinate|server|status]');
  console.error('');
  console.error('Commands:');
  console.error('  caffeinate [session_id]   - Enable caffeine for current session');
  console.error('  uncaffeinate [session_id] - Disable caffeine for current session');
  console.error('  server                    - Start caffeine server with system tray');
  console.error('  status                    - Show current status and active sessions');
  process.exit(1);
};

// Export command handlers and utilities
module.exports = {
  // Command handlers
  handleCaffeinate,
  handleUncaffeinate,
  handleStatus,
  showUsage,

  // Client utilities
  isServerRunning,
  ensureServer,
  startServerProcess,

  // Session operations
  handleSessionCommand
};
