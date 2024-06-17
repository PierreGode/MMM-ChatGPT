# MMM-ChatGPT
Chatgpt Magic mirror module


NOT WORKING YET 2024  WIP 2024-06-17
 
The "MMM-ChatGPT" powered by GPT-4o module listens for a trigger word that the user sets, such as "elsa". When it hears the trigger word, it starts listening for the user's question. Once the user asks a question, the module sends the question to the [chatgpt](https://www.npmjs.com/package/chatgpt#cli) and receives a response. It then displays the user's question and the API's response on the Magic Mirror in a bright, medium-sized text. The module also generates an audio response from the API's response text and plays it through the Magic Mirror's speakers.


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/J3J2EARPK)

Open your terminal and navigate to the modules folder of your Magic Mirror installation by running 

```
cd ~/MagicMirror/modules/
```

Clone the "MMM-ChatGPT" module from Github repository by running
```
git clone https://github.com/PierreGode/MMM-ChatGPT.git
```
```
cd MMM-ChatGPT/
```
Install the necessary dependencies for the module by running the following commands in the terminal within the MMM-ChatGPT folde

```
pip3 install openai googletrans==4.0.0-rc1 gtts SpeechRecognition
sudo sudo apt-get install portaudio19-dev
```
In your Magic Mirror's config.js file, add the following configuration object for the "MMM-ChatGTP" module:

```
{
  module: "MMM-ChatGPT",
  position: "bottom_center",
  config: {
    apiKey: "YOUR API KEY HERE",
    triggerWord: "elsa",
    maxQuestions: 5,
    cooldownTime: 300,
  },
},


```
