import speech_recognition as sr
import pygame
import time

def record_audio(file_path):
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Please say something...")
        audio_data = recognizer.listen(source)
        print("Recording complete.")
        with open(file_path, "wb") as audio_file:
            audio_file.write(audio_data.get_wav_data())

def play_audio(file_path):
    pygame.mixer.init()
    pygame.mixer.music.load(file_path)
    pygame.mixer.music.play()

    # Wait until the audio is finished playing
    while pygame.mixer.music.get_busy():
        time.sleep(1)
