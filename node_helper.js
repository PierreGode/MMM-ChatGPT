const NodeHelper = require("node_helper");
const openai = require("openai");
const SpeechToText = require("speech-recognition");
const gtts = require("gtts");
const fs = require("fs");
const os = require("os");

module.exports = NodeHelper.create({
  // Define start sequence.
  start: function() {
    console.log("Starting module: " + this.name);
    this.connected = false;
    this.apiKey = "";
  },

  // Define required socket notification received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === "CONNECT_TO_API") {
      this.connectToApi(payload.apiKey);
    } else if (notification === "ASK_API") {
      this.askApi(payload.question, payload.maxDisplayedResults);
    }
  },

  // Define function to connect to OpenAI API.
  connectToApi: function(apiKey) {
    console.log("Connecting to OpenAI API...");
    this.apiKey = apiKey;
    openai.apiKey = apiKey;
    openai.Completion.create({
      engine: "davinci",
      prompt: "Hello world",
      maxTokens: 1
    }).then((response) => {
      this.connected = true;
      console.log("Connected to OpenAI API");
    }).catch((error) => {
      console.error("Error connecting to OpenAI API: " + error);
    });
  },

  // Define function to ask OpenAI API.
  askApi: function(question, maxDisplayedResults) {
    if (!this.connected) {
      console.error("Error: Not connected to OpenAI API");
      return;
    }

    console.log("Asking OpenAI API...");
    openai.Completion.create({
      engine: "davinci",
      prompt: question,
      maxTokens: 2048
    }).then((response) => {
      let result = response.choices[0].text.trim();

      // Split result into array of sentences
      let sentences = result.match(/[^\.!\?]+[\.!\?]+/g);

      // Limit the number of displayed results
      if (sentences.length > maxDisplayedResults) {
        sentences = sentences.slice(0, maxDisplayedResults);
      }

      // Join the sentences into a single string
      result = sentences.join(" ");

      console.log("OpenAI API response: " + result);

      // Generate audio file
      let gttsText = new gtts(result);
      let tempFile = os.tmpdir() + "/MMM-ChatGTP-audio-" + Date.now() + ".wav";
      gttsText.save(tempFile, (error) => {
        if (error) {
          console.error("Error generating audio: " + error);
          return;
        }
        let audioData = fs.readFileSync(tempFile);
        let audioBase64 = audioData.toString("base64");
        fs.unlinkSync(tempFile);

        this.sendSocketNotification("API_RESPONSE", {
          question: question,
          response: result,
          audio: audioBase64
        });
      });
    }).catch((error) => {
      console.error("Error asking OpenAI API: " + error);
    });
  }
});
