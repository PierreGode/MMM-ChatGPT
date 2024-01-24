const NodeHelper = require("node_helper");
const axios = require("axios");
const record = require("node-record-lpcm16"); // Added for audio input
const speaker = require("node-speaker"); // Added for audio output
const fs = require("fs"); // Added for audio file handling

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting MMM-ChatGPT node helper...");
    this.apiKey = "";
  },

  socketNotificationReceived: function (notification, payload) {
    console.log("Received socket notification:", notification, "with payload:", payload);

    if (notification === "INIT_CHAT") {
      this.apiKey = payload;
    } else if (notification === "SEND_MESSAGE") {
      this.handleChatGPTRequest(payload);
    }
  },

  handleChatGPTRequest: function (message) {
    if (this.apiKey === "") {
      console.error("API key is not set. Check your Magic Mirror's config.js file.");
      return;
    }

    // Create an audio stream from the microphone
    const audioStream = record.start({
      sampleRate: 16000,
      threshold: 0,
    });

    // Handle audio data
    audioStream.on("data", (audioData) => {
      // Process audio data here (e.g., send it to a speech recognition API)
      
      // You can also save audio data to a file if needed
      // fs.writeFileSync("audio.wav", audioData);
    });

    axios
      .post("https://api.openai.com/v1/engines/davinci-codex/completions", {
        prompt: message,
        max_tokens: 150,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })
      .then((response) => {
        const chatResponse = response.data.choices[0].text.trim();

        // Send the chat response to be played through the headset
        this.playAudioResponse(chatResponse);
        
        // You can also send the chat response to the display module if needed
        // this.sendSocketNotification("CHAT_RESPONSE", chatResponse);
      })
      .catch((error) => {
        console.error("Error contacting ChatGPT API:", error);
      });
  },

  playAudioResponse: function (audioData) {
    // Create a writable stream to the headphones
    const audioOutput = new speaker();

    // Play the audio data to the headphones
    audioOutput.write(audioData);

    // Close the audio output stream when done
    audioOutput.end();
  },
});
