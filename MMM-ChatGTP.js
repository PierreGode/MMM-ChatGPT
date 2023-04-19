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
          this.startRecognition();
        }
      }
    });
  },

  startRecognition: function() {
    //Start listening for user's question
    this.recognizing = true;
    this.question = "";
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
        const transcript = data.results[0].alternatives[0].transcript;
        this.question += transcript;
        if(transcript.endsWith("?")) {
          this.recognizing = false;
          this.sendSocketNotification("QUESTION", this.question);
          this.answerQuestion(this.question);
        }
      }
    });
  },

  answerQuestion: async function(question) {
    //Send question to OpenAI API and get answer
    const openai = require('openai');
    const api_key = this.config.apiKey;
    const prompt = `Q: ${question}\nA:`;
    const model = 'davinci';
    const response = await openai.Completion.create({
      engine: model,
      prompt: prompt,
      maxTokens: 1024,
      n: 1,
      stop: '\n',
      apiKey: api_key,
    });
    this.answer = response.choices[0].text;
    console.log("Answer: " + this.answer);
    this.sendSocketNotification("ANSWER", this.answer);
    this.generateAudioResponse(this.answer);
  },
  generateAudioResponse: function(answer) {
    //Generate audio response from text
    const gtts = require('gtts');
    const filename = "modules/MMM-ChatGTP/response.mp3";
    const tts = new gtts(answer, 'en');
    tts.save(filename, function(err, result) {
      if(err) {
        console.log(err);
      }
      else {
        this.audio = fs.readFileSync(filename);
        this.sendSocketNotification("AUDIO", this.audio);
        this.playAudioResponse();
      }
    });
  },

  playAudioResponse: function() {
    //Play audio response through speakers
    const Speaker = require('speaker');
    const lame = require('lame');
    const decoder = new lame.Decoder();
    const speaker = new Speaker();
    decoder.on('format', function(format) {
      speaker.format = format;
    });
    decoder.pipe(speaker);
    decoder.write(this.audio);
  },

  socketNotificationReceived: function(notification, payload) {
    if(notification === "CONFIG") {
      this.config = payload;
    }
  },

});
