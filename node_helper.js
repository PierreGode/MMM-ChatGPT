const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  start: function() {
    console.log("MMM-ChatGPT helper started...");
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "SEND_MESSAGE") {
      this.processMessage(payload);
    }
  },

  processMessage: function(message) {
    exec(`python3 path/to/Chat.py ${message}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }

      // Assuming the Python script prints the response text and audio file path
      const [responseText, audioFilePath] = stdout.split(":::");
      this.sendSocketNotification("CHAT_RESPONSE", {
        text: responseText,
        audioFile: audioFilePath.trim(),
      });
    });
  },
});
