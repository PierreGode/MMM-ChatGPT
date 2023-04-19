const NodeHelper = require("node_helper");
const openai = require("openai");
const fs = require("fs");
const gtts = require("gtts");

module.exports = NodeHelper.create({

  start: function () {
    console.log("Starting module: " + this.name);
    this.config = {};
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      openai.apiKey = this.config.apiKey;
    } else if (notification === "QUESTION") {
      openai.completions.create({
        engine: "davinci",
        prompt: payload,
        maxTokens: 150,
        n: 1,
        stop: "\n",
      }).then((response) => {
        let answer = response.data.choices[0].text.trim();
        let tts = new gtts(answer);
        tts.save("audio.mp3", () => {
          let audio = fs.readFileSync("audio.mp3").toString("base64");
          this.sendSocketNotification("RESPONSE", {
            question: payload,
            answer: answer,
            audio: audio
          });
        });
      }).catch((error) => {
        console.error(error);
      });
    }
  }
});
