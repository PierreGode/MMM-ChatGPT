import openai
import speech_recognition as sr
from gtts import gTTS
import time
import logging
from os import system

# initialize the API client with your API key
openai.api_key = "YOUR API KEY HERE"

# initialize the speech recognition engine
r = sr.Recognizer()

# initialize the logger
logging.basicConfig(filename='chatgpt.log', level=logging.ERROR)

# function to convert voice commands to text
def transcribe_speech_to_text():
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source)
    try:
        return r.recognize_google(audio)
    except Exception as e:
        print("Error transcribing speech: ", e)
        logging.error("Error transcribing speech: %s" % e)
        return None

# function to generate audio from text
def generate_audio_from_text(text):
    tts = gTTS(text)
    tts.save("response.mp3")

# main loop to continuously listen for voice
# commands and generate audio responses
conversation_history = ""
last_activity_time = time.time()

while True:
    # Check for inactivity and reset the conversation history after 5 minutes
    if time.time() - last_activity_time >= 300:
        conversation_history = ""
        last_activity_time = time.time()

    # transcribe voice command to text
    voice_command = transcribe_speech_to_text()
    if voice_command and "elsa" in voice_command.lower():
        print("Processing request...")
        
        # Append the user's command to the conversation history
        conversation_history += f"User: {voice_command}\n"
        
        # send text request to OpenAI API
        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=conversation_history,  # Pass the conversation history instead of just the voice_command
            max_tokens=1024, n=1, stop=None,
            temperature=0.5,
        )
        # extract response text from API response
        response_text = response["choices"][0]["text"].strip()
        
        # check if the response is empty or not understood
        if not response_text:
            response_text = "I'm sorry, I didn't understand what you said. Can you please repeat?"

        print("CHATGPT_RESPONSE: ", response_text)
        
        # Append ChatGPT's response to the conversation history
        conversation_history += f"ChatGPT: {response_text}\n"
        
        # generate audio from response text
        generate_audio_from_text(response_text)
        # play the audio file
        system("mpg321 response.mp3")

        # Refresh the last activity time
        last_activity_time = time.time()

    elif voice_command:
        response_text = "I'm sorry, I didn't understand what you said. Can you please repeat?"
        print("CHATGPT_RESPONSE: ", response_text)
        # generate audio from response text
        generate_audio_from_text(response_text)
        # play the audio file
        system("mpg321 response.mp3")
