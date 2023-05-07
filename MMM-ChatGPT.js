Module.register("MMM-ChatGPT", {
  defaults: {
    apiKey: "",
    triggerWord: "elsa",
    maxQuestions: 5,
    cooldownTime: 300,
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("START_LISTENING");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START_LISTENING") {
      this.sendSocketNotification("INIT_CHAT", this.config.apiKey);
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = "MMM-ChatGPT is running. Say the trigger word to start the conversation.";
    return wrapper;
  },
});
