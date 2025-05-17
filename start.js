require('dotenv').config();
const path = require('path');
const util = require('util');
const { spawn, exec } = require('child_process');
const execAsync = util.promisify(exec);
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');


const isDev = process.env.NODE_ENV === 'development';
const fastapiDir = path.join(__dirname, 'servers/fastapi');
const nextjsDir = path.join(__dirname, 'servers/nextjs');

const staticServerPort = 3001;
const staticServerUrl = `http://localhost:${staticServerPort}`;
process.env.NEXT_PUBLIC_STATIC_SERVER_URL = staticServerUrl;
process.env.STATIC_SERVER_URL = staticServerUrl;

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

  // Wait for NextJS server to start
  await execAsync(`npx wait-on http://localhost:3000`);

  // Start App Data Static Server
  const staticServer = http.createServer((req, res) => {
    return handler(req, res, {
      public: process.env.APP_DATA_DIRECTORY,
    });
  })
  staticServer.listen(staticServerPort, () => {
    console.log(`Static Server: ${staticServerUrl}`);
  })
}

setupUserConfigFromEnv();
startServers();