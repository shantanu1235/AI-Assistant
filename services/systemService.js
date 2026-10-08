const { exec } = require('child_process');

/**
 * Windows App Commands Mapping
 */
const APP_COMMANDS = {
  chrome: 'start chrome',
  google: 'start chrome',
  browser: 'start chrome',
  notepad: 'notepad',
  calculator: 'start calc',
  calc: 'start calc',
  vscode: 'code',
  code: 'code',
  spotify: 'start spotify:',
  camera: 'start microsoft.windows.camera:',
  terminal: 'start cmd',
  cmd: 'start cmd',
  powershell: 'start powershell',
  paint: 'mspaint',
  taskmanager: 'start taskmgr',
  settings: 'start ms-settings:',
  explorer: 'explorer',
  files: 'explorer'
};

/**
 * Process Names for Closing Apps
 */
const PROCESS_NAMES = {
  chrome: 'chrome.exe',
  google: 'chrome.exe',
  browser: 'chrome.exe',
  notepad: 'notepad.exe',
  calculator: 'CalculatorApp.exe',
  calc: 'CalculatorApp.exe',
  vscode: 'Code.exe',
  code: 'Code.exe',
  spotify: 'Spotify.exe',
  paint: 'mspaint.exe',
  cmd: 'cmd.exe',
  terminal: 'cmd.exe'
};

/**
 * Common Windows Special Folders
 */
const FOLDERS = {
  downloads: 'shell:Downloads',
  documents: 'shell:Personal',
  desktop: 'shell:Desktop',
  pictures: 'shell:My Pictures',
  photos: 'shell:My Pictures',
  music: 'shell:My Music',
  videos: 'shell:My Video'
};

/**
 * Helper to execute Windows CLI command
 */
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout || stderr);
    });
  });
};

/**
 * Open an application on Windows
 */
const openApp = async (appName) => {
  const cleanName = appName.toLowerCase().trim();
  const cmd = APP_COMMANDS[cleanName] || `start ${cleanName}`;

  try {
    await runCommand(cmd);
    return { success: true, message: `Opened ${appName}` };
  } catch (error) {
    return { success: false, message: `Failed to open ${appName}: ${error.message}` };
  }
};

/**
 * Close a running application on Windows
 */
const closeApp = async (appName) => {
  const cleanName = appName.toLowerCase().trim();
  const processName = PROCESS_NAMES[cleanName] || `${cleanName}.exe`;

  try {
    await runCommand(`taskkill /IM ${processName} /F`);
    return { success: true, message: `Closed ${appName}` };
  } catch (error) {
    return { success: false, message: `Failed to close ${appName}: ${error.message}` };
  }
};

/**
 * Open a folder in Windows Explorer
 */
const openFolder = async (folderName) => {
  const cleanName = folderName.toLowerCase().trim();
  const target = FOLDERS[cleanName] || cleanName;

  try {
    await runCommand(`explorer.exe ${target}`);
    return { success: true, message: `Opened folder ${folderName}` };
  } catch (error) {
    return { success: false, message: `Failed to open folder ${folderName}: ${error.message}` };
  }
};

/**
 * Open a URL in default web browser
 */
const openWebsite = async (url) => {
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  try {
    await runCommand(`start ${cleanUrl}`);
    return { success: true, message: `Opened website: ${cleanUrl}` };
  } catch (error) {
    return { success: false, message: `Failed to open website: ${error.message}` };
  }
};

/**
 * Dispatcher to handle any system action
 */
const handleSystemAction = async (action, target) => {
  switch (action) {
    case 'OPEN_APP':
      return await openApp(target);
    case 'CLOSE_APP':
      return await closeApp(target);
    case 'OPEN_FOLDER':
      return await openFolder(target);
    case 'OPEN_WEBSITE':
      return await openWebsite(target);
    default:
      return { success: false, message: `Unknown action: ${action}` };
  }
};

module.exports = {
  openApp,
  closeApp,
  openFolder,
  openWebsite,
  handleSystemAction
};
