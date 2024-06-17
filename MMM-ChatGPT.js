Module.register("MMM-ChatGPT", {
  defaults: {
    apiKey: "",
    triggerWord: "elsa",
    maxQuestions: 5,
    cooldownTime: 300,
  },

  start: function() {
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("INIT_CHAT", this.config.apiKey);
    this.response = "";
    this.lastActivityTime = 0;
    this.questionsAsked = 0;
    this.initializeVoiceRecognition();
  },

  initializeVoiceRecognition: function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;

    this.recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
      if (transcript.includes(this.config.triggerWord.toLowerCase())) {
        this.sendSocketNotification("SEND_MESSAGE", "Your message to ChatGPT");
      }
    };

    this.recognition.start();
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === "CHAT_RESPONSE") {
      this.response = payload;
      this.updateDom();
      this.playAudioResponse(payload.audioFile);
      this.refreshLastActivityTime();
      this.checkQuestionLimit();
    }
  },

  playAudioResponse: function(audioFile) {
    if (audioFile) {
      const audio = new Audio(audioFile);
      audio.play();
    }
  },

  refreshLastActivityTime: function() {
    this.lastActivityTime = new Date().getTime() / 1000;
  },

  checkQuestionLimit: function() {
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

  getDom: function() {
    const wrapper = document.createElement("div");
    if (this.response) {
      wrapper.innerHTML = this.response;
    } else {
      wrapper.innerHTML = "MMM-ChatGPT is running. Say the trigger word to start the conversation.";
    }
    return wrapper;
  },
});
