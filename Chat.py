import speech_recognition as sr

def record_audio():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening for a command...")
        audio_data = recognizer.listen(source)
        print("Recording complete.")
        
        try:
            # Recognize speech using Google Speech Recognition (offline engines can be substituted)
            text = recognizer.recognize_google(audio_data)
            print(f"You said: {text}")
            return text
        except sr.UnknownValueError:
            print("Speech recognition could not understand the audio")
        except sr.RequestError as e:
            print(f"Could not request results from the speech recognition service; {e}")

if __name__ == "__main__":
    transcript = record_audio()
    if transcript:
        print(transcript)
