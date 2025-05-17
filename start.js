require('dotenv').config();
const path = require('path');
const util = require('util');
const { spawn, exec } = require('child_process');
const execAsync = util.promisify(exec);
const fs = require('fs');


const isDev = process.env.NODE_ENV === 'development';
const fastapiDir = path.join(__dirname, 'servers/fastapi');
const nextjsDir = path.join(__dirname, 'servers/nextjs');

const setupUserConfigFromEnv = async () => {
  const userConfigPath = process.env.USER_CONFIG_PATH;
  const userConfig = {
    LLM: process.env.LLM,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  }
  fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
}

const startServers = async () => {
  const fastApiProcess = spawn(
    isDev ? ".venv/bin/python" : "python",
    ["server.py", "--port", "8000"],
    {
      cwd: fastapiDir,
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    }
  );
  fastApiProcess.stdout.on("data", (data) => {
    console.log(`FastAPI: ${data}`);
  });
  fastApiProcess.stderr.on("data", (data) => {
    console.error(`FastAPI Error: ${data}`);
  });

  // Wait for FastAPI server to start
  await execAsync(`npx wait-on http://localhost:8000/docs`);

  // Start NextJS server
  const nextjsProcess = spawn(
    "npm",
    isDev ? ["run", "dev", "--", "-p", "3000"] : ["run", "start", "--", "-p", "3000"],
    {
      cwd: nextjsDir,
      stdio: ["inherit", "pipe", "pipe"],
      env: process.env,
    }
  );
  nextjsProcess.stdout.on("data", (data) => {
    console.log(`NextJS: ${data}`);
  });
  nextjsProcess.stderr.on("data", (data) => {
    console.error(`NextJS Error: ${data}`);
  });

  // Wait for NextJS server to start
  await execAsync(`npx wait-on http://localhost:3000`);
}

setupUserConfigFromEnv();
startServers();