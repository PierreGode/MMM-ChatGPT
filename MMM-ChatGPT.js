Module.register("MMM-ChatGPT", {
  defaults: {
    apiKey: "",
    triggerWord: "elsa",
    maxQuestions: 5,
    cooldownTime: 300,
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("INIT_CHAT", this.config.apiKey);
    this.response = "";
    this.lastActivityTime = 0;
    this.questionsAsked = 0;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "RESPONSE_TEXT") {
      this.response = payload;
      this.updateDom();
      this.playAudioResponse();
      this.refreshLastActivityTime();
      this.checkQuestionLimit();
    }
  },

  playAudioResponse: function () {
    if (this.response) {
      const audio = new Audio(`modules/${this.name}/response.mp3`);
      audio.play();
    }
  },

  refreshLastActivityTime: function () {
    this.lastActivityTime = new Date().getTime() / 1000;
  },

  checkQuestionLimit: function () {
    const elapsed = new Date().getTime() / 1000 - this.lastActivityTime;
    if (elapsed > this.config.cooldownTime) {
      this.questionsAsked = 0;
    }
    if (this.response && ++this.questionsAsked >= this.config.maxQuestions) {
      this.sendNotification("SHOW_ALERT", {
        title: "ChatGPT",
        message: "Conversation limit reached. Wait for cooldown.",
        type: "notification",
        timer: 5000,
      });
      this.questionsAsked = 0;
    }
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    if (this.response) {
      wrapper.innerHTML = this.response;
    } else {
      wrapper.innerHTML = "MMM-ChatGPT is running. Say the trigger word to start the conversation.";
    }
    return wrapper;
  },
});
