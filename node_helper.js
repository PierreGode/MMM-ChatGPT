const NodeHelper = require("node_helper");
const { ChatGPTAPI } = require("chatgpt");
const gtts = require("gtts");
const fs = require("fs");

module.exports = NodeHelper.create({

  start: function () {
    console.log("Starting module: " + this.name);
    this.config = {};
    this.chatgpt = null;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      this.chatgpt = new ChatGPTAPI({ apiKey: this.config.apiKey });
    } else if (notification === "SEND_MESSAGE") {
      this.chatgpt.sendMessage(payload).then((response) => {
        let answer = response.text.trim();
        let tts = new gtts(answer);
        tts.save("audio.mp3", () => {
          let audio = fs.readFileSync("audio.mp3").toString("base64");
          this.sendSocketNotification("MESSAGE_RECEIVED", {
            message: answer,
            audio: audio
          });
        });
      }).catch((error) => {
        console.error(error);
      });
    }
  }
});
