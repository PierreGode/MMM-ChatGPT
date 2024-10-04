const { exec } = require("child_process");

Module.register("MMM-ChatGPT", {
  defaults: {
    triggerWord: "elsa",
    maxQuestions: 5,
    cooldownTime: 300,
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.response = "";
    this.lastActivityTime = 0;
    this.questionsAsked = 0;
    this.listenForVoiceCommand();
  },

  listenForVoiceCommand: function () {
    // Call the Python script for voice command
    exec("python3 " + this.file("Chat.py"), (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return;
      }
      const transcript = stdout.trim().toLowerCase();
      if (transcript.includes(this.config.triggerWord.toLowerCase())) {
        this.sendSocketNotification("SEND_MESSAGE", transcript);
      }
    });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CHAT_RESPONSE") {
      this.response = payload.text;
      this.updateDom();
      this.playAudioResponse(payload.audioFile);
      this.refreshLastActivityTime();
      this.checkQuestionLimit();
    }
  },

  playAudioResponse: function (audioFile) {
    // Call the Python script for audio playback
    exec(`python3 ${this.file("utils.py")} ${audioFile}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error playing audio: ${error}`);
        return;
      }
      console.log("Audio played successfully.");
    });
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
      wrapper.innerHTML = "Waiting for voice command...";
    }
    return wrapper;
  },
});
