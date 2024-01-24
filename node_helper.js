const NodeHelper = require("node_helper");
const axios = require("axios");

module.exports = NodeHelper.create({
  start: function() {
    console.log("Starting MMM-ChatGPT node helper...");
    this.apiKey = "";
  },

  socketNotificationReceived: function(notification, payload) {
    console.log("Received socket notification:", notification, "with payload:", payload);

    if (notification === "INIT_CHAT") {
      this.apiKey = payload;
    } else if (notification === "SEND_MESSAGE") {
      this.handleChatGPTRequest(payload);
    }
  },

  handleChatGPTRequest: function(message) {
    if (this.apiKey === "") {
      console.error("API key is not set. Check your Magic Mirror's config.js file.");
      return;
    }

    axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: message,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    })
    .then(response => {
      const chatResponse = response.data.choices[0].text.trim();
      this.sendSocketNotification("CHAT_RESPONSE", chatResponse);
    })
    .catch(error => {
      console.error("Error contacting ChatGPT API:", error);
    });
  },
});
