const path = require('path');
const util = require('util');
const { spawn } = require('child_process');
const execAsync = util.promisify(require('child_process').exec);
const fs = require('fs');

const fastapiDir = path.join(__dirname, 'servers/fastapi');
const nextjsDir = path.join(__dirname, 'servers/nextjs');

const isDev = process.env.NODE_ENV === 'development';
const canChangeKeys = process.env.CAN_CHANGE_KEYS !== 'false';

const localhost = '0.0.0.0';
const fastapiPort = 8000;
const nextjsPort = 3000;

const userConfigPath = path.join(process.env.APP_DATA_DIRECTORY, 'userConfig.json');
const userDataDir = path.dirname(userConfigPath);

// Create user_data directory if it doesn't exist
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
}

process.env.USER_CONFIG_PATH = userConfigPath;

//? UserConfig is only setup if API Keys can be changed
const setupUserConfigFromEnv = () => {

  let existingConfig = {};
  if (fs.existsSync(userConfigPath)) {
    existingConfig = JSON.parse(fs.readFileSync(userConfigPath, 'utf8'));
  }
  const userConfig = {
    LLM: process.env.LLM || existingConfig.LLM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || existingConfig.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || existingConfig.GOOGLE_API_KEY,
  };

  fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
}

const startServers = async () => {

  const fastApiProcess = spawn(
    "python",
    [isDev ? "server_autoreload.py" : "server.py", "--port", fastapiPort.toString()],
    {
      cwd: fastapiDir,
      stdio: "inherit",
      env: process.env,
    }
  );

  fastApiProcess.on("error", err => {
    console.error("FastAPI process failed to start:", err);
  });

  const nextjsProcess = spawn(
    "npm",
    ["run", isDev ? "dev" : "start", "--", "-p", nextjsPort.toString()],
    {
      cwd: nextjsDir,
      stdio: "inherit",
      env: process.env,
    }
  );

  nextjsProcess.on("error", err => {
    console.error("Next.js process failed to start:", err);
  });

  // Keep the Node process alive until both servers exit
  const exitCode = await Promise.race([
    new Promise(resolve => fastApiProcess.on("exit", resolve)),
    new Promise(resolve => nextjsProcess.on("exit", resolve)),
  ]);

  console.log(`One of the processes exited. Exit code: ${exitCode}`);
  process.exit(exitCode);
};

if (canChangeKeys) {
  setupUserConfigFromEnv();
}
startServers();
