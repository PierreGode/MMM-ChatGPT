import openai
import speech_recognition as sr
from gtts import gTTS
import time
import logging
from os import system

# Initialize the API client with your API key
openai.api_key = "YOUR API KEY HERE"

# Initialize the speech recognition engine
r = sr.Recognizer()

# Initialize the logger
logging.basicConfig(filename='chatgpt.log', level=logging.INFO,
                    format='%(asctime)s:%(levelname)s:%(message)s')

# Function to convert voice commands to text
def transcribe_speech_to_text():
    with sr.Microphone(device_index=YOUR_DEVICE_INDEX) as source:
        logging.info("Listening for voice command...")
        print("Listening for voice command...")
        audio = r.listen(source)
    try:
        return r.recognize_google(audio)
    except Exception as e:
        logging.error("Error transcribing speech: %s" % e)
        print("Error transcribing speech: ", e)
        return None

# Function to generate audio from text
def generate_audio_from_text(text):
    tts = gTTS(text)
    tts.save("response.mp3")

# Main loop to continuously listen for voice
# commands and generate audio responses
conversation_history = []
last_activity_time = time.time()

def main():
    global conversation_history
    global last_activity_time

    # Start conversation
    logging.info("Starting conversation...")
    print("Starting conversation...")

    while True:
        # Check for inactivity and reset the conversation history after 5 minutes
        if time.time() - last_activity_time >= 300:
            conversation_history = []
            last_activity_time = time.time()

        # Transcribe voice command to text
        voice_command = transcribe_speech_to_text()
        if voice_command and "elsa" in voice_command.lower():
            print("Processing request...")
            
            # Append the user's command to the conversation history
            conversation_history.append({"role": "user", "content": voice_command})
            
            # Send text request to OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=conversation_history
            )
            
            # Extract response text from API response
            response_text = response.choices[0].message["content"].strip()
            
            # Check if the response is empty or not understood
            if not response_text:
                response_text = "I'm sorry, I didn't understand what you said. Can you please repeat?"

            # Log chatbot response
            logging.info(f"Chatbot response: {response_text}")
            print("CHATGPT_RESPONSE: ", response_text)
            
            # Append ChatGPT's response to the conversation history
            conversation_history.append({"role": "assistant", "content": response_text})
            
            # Generate audio from response text
            generate_audio_from_text(response_text)
            # Play the audio file
            system("mpg321 response.mp3")

            # Refresh the last activity time
            last_activity_time = time.time()

        elif voice_command:
            response_text = "I'm sorry, I didn't understand what you said. Can you please repeat?"
            logging.info(f"Chatbot response: {response_text}")
            print("CHATGPT_RESPONSE: ", response_text)
            # Generate audio from response text
            generate_audio_from_text(response_text)
            # Play the audio file
            system("mpg321 response.mp3")

if __name__ == "__main__":
    main()
