const NodeHelper = require("node_helper");
const { spawn } = require("child_process");

module.exports = NodeHelper.create({
  start: function () {
    this.pythonProcess = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START_CHATGPT") {
      this.startPythonScript();
    }
  },

  startPythonScript: function () {
    const self = this;
    const pythonScript = "../MMM-ChatGPT/Chat.py";
    this.pythonProcess = spawn("python3", [pythonScript]);

    this.pythonProcess.stdout.on("data", (data) => {
      self.sendSocketNotification("CHATGPT_RESPONSE", data.toString());
    });

    this.pythonProcess.stderr.on("data", (data) => {
      console.error(`Python script error: ${data}`);
    });

    this.pythonProcess.on("close", (code) => {
      console.log(`Python script exited with code ${code}`);
    });
  },

  stop: function () {
    if (this.pythonProcess) {
      this.pythonProcess.kill();
    }
  },
});
