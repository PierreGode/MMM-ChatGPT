# MMM-ChatGTP
Chatgpt Magic mirror module

Open your terminal and navigate to the modules folder of your Magic Mirror installation by running cd ~/MagicMirror/modules/.

Clone the "MMM-ChatGTP" module from its Github repository by running
```
git clone https://github.com/PierreGode/MMM-ChatGTP.git.
```
Install the necessary dependencies for the module by running the following commands in the terminal within the MMM-ChatGTP folde

```
npm install openai
npm install speech-recognition
npm install gtts

```
In your Magic Mirror's config.js file, add the following configuration object for the "MMM-ChatGTP" module:

```
{
  module: "MMM-ChatGTP",
  position: "top_right",
  config: {
    apiKey: "YOUR_OPENAI_API_KEY_HERE",
    triggerWord: "elsa"
  }
}
```
