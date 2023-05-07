const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const path = require("path");

module.exports = NodeHelper.create({
  start: function () {
    this.apiKey = "";
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "INIT_CHAT") {
      this.apiKey = payload;
      this.startPythonProcess();
    }
  },

  startPythonProcess: function () {
    const pythonPath = path.join(__dirname, "Chat.py");
    this.pythonProcess = spawn("python3", [pythonPath, this.apiKey]);
    this.bindPythonProcessEvents();
  },

  bindPythonProcessEvents: function () {
    this.pythonProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    this.pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    this.pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
    });
  },
});
