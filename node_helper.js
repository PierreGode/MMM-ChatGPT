const NodeHelper = require("node_helper");
const { spawn } = require("child_process");
const path = require("path");

module.exports = NodeHelper.create({
  start: function() {
    console.log("MMM-ChatGPT helper started...");
    this.apiKey = null;
    this.scriptPath = path.join(__dirname, "Chat.py");
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "INIT_CHAT") {
      this.apiKey = payload;
    } else if (notification === "SEND_MESSAGE") {
      this.processMessage(payload);
    }
  },

  processMessage: function(message) {
    const pythonProcess = spawn("python3", [this.scriptPath, message], {
      env: { ...process.env, OPENAI_API_KEY: this.apiKey },
    });

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error(`Chat.py exited with code ${code}: ${stderr}`);
        return;
      }
      const [responseText, audioFilePath] = stdout.split(":::");
      this.sendSocketNotification("CHAT_RESPONSE", {
        text: responseText,
        audioFile: audioFilePath && audioFilePath.trim(),
      });
    });
  },
});
