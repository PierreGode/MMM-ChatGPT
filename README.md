# MMM-ChatGPT
Chatgpt Magic mirror module

The "MMM-ChatGPT" module listens for a trigger word that the user sets, such as "elsa". When it hears the trigger word, it starts listening for the user's question. Once the user asks a question, the module sends the question to the OpenAI API and receives a response. It then displays the user's question and the API's response on the Magic Mirror in a bright, medium-sized text. The module also generates an audio response from the API's response text and plays it through the Magic Mirror's speakers.


Open your terminal and navigate to the modules folder of your Magic Mirror installation by running 

```
cd ~/MagicMirror/modules/
```

Clone the "MMM-ChatGPT" module from its Github repository by running
```
git clone https://github.com/PierreGode/MMM-ChatGPT.git
```
```
cd MMM-ChatGPT/
```
Install the necessary dependencies for the module by running the following commands in the terminal within the MMM-ChatGPT folde

```
npm install chatgpt
npm install speech-recognition
npm install gtts

```
In your Magic Mirror's config.js file, add the following configuration object for the "MMM-ChatGTP" module:

```
{
  module: "MMM-ChatGPT",
  position: "top_right",
  header: "ChatGPT"
  config: {
    apiKey: "YOUR_OPENAI_API_KEY_HERE",
    triggerWord: "elsa"
  }
}
```
