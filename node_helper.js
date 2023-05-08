const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const path = require("path");
const tail = require("tail-file");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting MMM-ChatGPT node helper...");
    this.apiKey = "";
    this.logPath = path.join(__dirname, "chatgpt.log");
    this.lastLogLine = "";
  },

  socketNotificationReceived: function (notification, payload) {
    console.log("Received socket notification:", notification, "with payload:", payload);
    if (notification === "INIT_CHAT") {
      this.apiKey = payload;
      this.startPythonProcess();
    } else if (notification === "GET_LAST_LOG_LINE") {
      this.sendSocketNotification("LAST_LOG_LINE", this.lastLogLine);
    }
  },

  startPythonProcess: function () {
    console.log("Starting Python process...");
    const pythonPath = path.join(__dirname, "Chat.py");
    this.pythonProcess = spawn("python3", [pythonPath, this.apiKey]);
    this.bindPythonProcessEvents();
  },

  bindPythonProcessEvents: function () {
    console.log("Binding Python process events...");
    this.pythonProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    this.pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    this.pythonProcess.on("close", (code) => {
      console.log(`Python process exited with code ${code}`);
    });

    // Listen for changes in the log file and emit the last line to the client
    tail.onNewLine(this.logPath, (line) => {
      console.log(`Log line: ${line}`);
      this.lastLogLine = line;
      this.sendSocketNotification("NEW_LOG_LINE", line);
    });
  },
});
