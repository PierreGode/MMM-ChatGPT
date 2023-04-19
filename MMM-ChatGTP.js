Module.register("MMM-ChatGTP", {
  defaults: {
    apiKey: "",
    triggerWord: "elsa"
  },

  start: function() {
    Log.info("Starting module: " + this.name);

    // initialize the API client with your API key
    openai.api_key = this.config.apiKey;

    // initialize the speech recognition engine
    this.recognizer = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    this.recognizer.continuous = true;
    this.recognizer.interimResults = false;

    // function to generate audio from text
    this.generateAudioFromText = function(text) {
      var tts = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(tts);
    };
  },

  getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "medium bright";

    var self = this;

    // function to convert voice commands to text
    var transcribeSpeechToText = function() {
      self.recognizer.start();
      console.log("Listening...");

      self.recognizer.onresult = function(event) {
        var result = event.results[event.results.length - 1][0].transcript;
        console.log("Question: " + result);

        // send text request to OpenAI API
        var response = openai.Completion.create({
          engine: "text-davinci-002",
          prompt: result,
          maxTokens: 1024,
          n: 1,
          stop: null,
          temperature: 0.5
        });

        // extract response text from API response
        var responseText = response.choices[0].text;
        console.log("Response: " + responseText);

        // generate audio from response text
        self.generateAudioFromText(responseText);

        // display response on the mirror
        var responseWrapper = document.createElement("div");
        responseWrapper.innerHTML = "<p><span style='color: #ff0000;'>Question: </span>" + result + "</p>" + "<p><span style='color: #00ff00;'>Answer: </span>" + responseText + "</p>";
        wrapper.appendChild(responseWrapper);
      };
    };

    // function to check if trigger word is spoken
    var checkTriggerWord = function(event) {
      var result = event.results[event.results.length - 1][0].transcript;
      if (result.toLowerCase().indexOf(self.config.triggerWord) !== -1) {
        transcribeSpeechToText();
      }
    };

    // start listening for trigger word
    this.recognizer.start();
    this.recognizer.onresult = checkTriggerWord;
    this.recognizer.onerror = function(event) {
      console.error(event.error);
    };

    return wrapper;
  }
});
