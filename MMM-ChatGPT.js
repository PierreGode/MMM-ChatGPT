Module.register("MMM-ChatGPT", {
  // Default module config.
  defaults: {
    apiKey: "",
    triggerWord: "elsa"
  },

  start: function () {
    Log.info("Starting module: " + this.name);

    this.listening = false;

    // Load the chatgpt module.
    const ChatGPT = require("chatgpt");
    this.chatgpt = new ChatGPT(this.config.apiKey);

    // Load the speech-recognition and gtts modules.
    const SpeechRecognition = require("speech-recognition");
    this.speechRecog = new SpeechRecognition();
    this.gTTS = require("gtts");

    // Add event listener for the trigger word.
    const self = this;
    this.handler = function (transcript) {
      if (transcript.toLowerCase().includes(self.config.triggerWord)) {
        self.listening = true;
        self.sendSocketNotification("LISTENING", true);
        self.showModule();
        self.speechRecog.startListening();
      }
    };
    this.speechRecog.addEventListener("result", function (event) {
      const transcript = event.results[0][0].transcript;
      self.handleTranscript(transcript);
    });
    this.speechRecog.addEventListener("end", function (event) {
      if (self.listening) {
        self.speechRecog.startListening();
      }
    });
    this.speechRecog.addEventListener("error", function (event) {
      console.log("Speech recognition error: ", event.error);
    });
    this.speechRecog.setTriggerWords([this.config.triggerWord]);
  },

  // Override dom generator.
  getDom: function () {
    const wrapper = document.createElement("div");

    if (this.listening) {
      wrapper.innerHTML = "Listening...";
    } else {
      wrapper.innerHTML = "Say '" + this.config.triggerWord + "' to start.";
    }

    return wrapper;
  },
// Handle transcript from speech recognition.
  handleTranscript: function (transcript) {
    const self = this;
    if (transcript.toLowerCase().includes("stop")) {
      self.hideModule();
      self.speechRecog.stopListening();
      self.listening = false;
      self.sendSocketNotification("LISTENING", false);
      return;
    }
    const text = transcript.replace(self.config.triggerWord, "").trim();
    if (text) {
      self.chatgpt.sendMessage(text).then(function (response) {
        self.displayResponse(text, response.text);
        self.playAudio(response.text);
      }).catch(function (error) {
        console.log("ChatGPT error: ", error);
      });
    }
  },

  // Display response on the Magic Mirror.
  displayResponse: function (question, answer) {
    const wrapper = document.createElement("div");
    wrapper.className = "bright medium";

    const qElem = document.createElement("span");
    qElem.innerHTML = question + " ";

    const aElem = document.createElement("span");
    aElem.innerHTML = answer;

    wrapper.appendChild(qElem);
    wrapper.appendChild(aElem);

    this.sendNotification("SHOW_ALERT", { message: wrapper.innerHTML });
  },
  
  // Play audio response using gTTS.
  playAudio: function (text) {
    const self = this;
    const speech = new this.gTTS(text, "en");
    const url = "data:audio/mp3;base64,";
    speech.save("audio.mp3", function () {
      fetch(url + btoa(speech.getBase64String())).then(function (response) {
        response.blob().then(function (blob) {
          const audio = new Audio(URL.createObjectURL(blob));
          audio.play();
        });
      });
    });
  },
