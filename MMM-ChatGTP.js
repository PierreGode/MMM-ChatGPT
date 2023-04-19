Module.register("MMM-ChatGTP", {
  
  defaults: {
    apiKey: "",
    triggerWord: "elsa",
  },

  start: function() {
    console.log("Starting module: " + this.name);
    this.answer = "";
    this.question = "";
    this.recognizing = false;
    this.triggered = false;
    this.audio = null;
    this.listening = false;
    this.connected = false;
    this.checkDependencies();
  },
  checkDependencies: function() {
    //Check for necessary dependencies
    const dependencies = ["@google-cloud/speech", "openai", "gtts", "speaker", "lame"];
    let missingDependencies = [];
    for(let i = 0; i < dependencies.length; i++) {
      try {
        require.resolve(dependencies[i]);
      }
      catch(e) {
        missingDependencies.push(dependencies[i]);
      }
    }
    if(missingDependencies.length > 0) {
      console.error(`[${this.name}] ERROR: Missing dependencies: ${missingDependencies.join(", ")}.`);
      return;
    }
    this.connected = true;
    this.recognize();
  },
  recognize: function() {
    //Set up speech recognition
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();
    const request = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
      interimResults: false,
    };
    const recognizeStream = client.streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      if(data.results[0] && data.results[0].alternatives[0]) {
        const transcript = data.results[0].alternatives[0].transcript.toLowerCase();
        if(transcript.includes(this.config.triggerWord) && !this.triggered) {
          this.triggered = true;
          this.sendSocketNotification("TRIGGERED", {});
          this.listening = true;
          this.startRecognition();
        }
      }
    });
  },
