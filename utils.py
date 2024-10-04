import pygame
import sys
import time

def play_audio(file_path):
    pygame.mixer.init()
    pygame.mixer.music.load(file_path)
    pygame.mixer.music.play()

    while pygame.mixer.music.get_busy():
        time.sleep(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 utils.py <audio_file_path>")
        sys.exit(1)
    
    audio_file_path = sys.argv[1]
    play_audio(audio_file_path)
