#!/usr/bin/env python3
"""
VietTTS Wrapper Script
Wrapper for NTT123's VietTTS library to generate Vietnamese text-to-speech audio
GitHub: https://github.com/NTT123/vietTTS
"""

import argparse
import sys
import os

try:
    from vietTTS.hifigan.mel2wave import mel2wave
    from vietTTS.nat.text2mel import text2mel
    import soundfile as sf
    import torch
except ImportError as e:
    print(f"Error: Missing dependencies. Please install VietTTS:", file=sys.stderr)
    print(f"  pip install vietTTS", file=sys.stderr)
    print(f"  pip install soundfile", file=sys.stderr)
    print(f"Details: {e}", file=sys.stderr)
    sys.exit(1)


# Voice mapping to VietTTS speaker IDs
VOICE_MAPPING = {
    'northern_female_1': 0,
    'northern_male_1': 1,
    'southern_female_1': 2,
    'southern_male_1': 3,
    'central_female_1': 4,
}


def generate_speech(text: str, voice: str, speed: float, output_path: str):
    """
    Generate speech from text using VietTTS

    Args:
        text: Vietnamese text to convert to speech
        voice: Voice ID (e.g., 'northern_female_1')
        speed: Speech speed multiplier (1.0 = normal)
        output_path: Path to save the output audio file (WAV or MP3)
    """
    try:
        # Get speaker ID from voice mapping
        speaker_id = VOICE_MAPPING.get(voice, 0)  # Default to northern_female_1

        print(f"[VietTTS] Generating speech with voice: {voice} (speaker_id: {speaker_id})", file=sys.stderr)
        print(f"[VietTTS] Text length: {len(text)} characters", file=sys.stderr)

        # Convert text to mel spectrogram
        print("[VietTTS] Converting text to mel spectrogram...", file=sys.stderr)
        mel = text2mel(
            text,
            speaker_id=speaker_id,
            speed=speed
        )

        # Convert mel spectrogram to waveform
        print("[VietTTS] Converting mel to waveform...", file=sys.stderr)
        wave = mel2wave(mel)

        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save audio file
        print(f"[VietTTS] Saving audio to: {output_path}", file=sys.stderr)

        # Determine sample rate (VietTTS uses 16kHz by default)
        sample_rate = 16000

        # Save as WAV or MP3
        if output_path.lower().endswith('.mp3'):
            # For MP3, we need to convert WAV first then use ffmpeg
            # For simplicity, save as WAV and let the caller convert if needed
            wav_path = output_path.replace('.mp3', '.wav')
            sf.write(wav_path, wave, sample_rate)

            # Try to convert to MP3 using ffmpeg if available
            try:
                import subprocess
                subprocess.run(
                    ['ffmpeg', '-i', wav_path, '-codec:a', 'libmp3lame', '-qscale:a', '2', output_path, '-y'],
                    check=True,
                    capture_output=True
                )
                os.remove(wav_path)  # Remove temporary WAV file
                print(f"[VietTTS] Successfully converted to MP3: {output_path}", file=sys.stderr)
            except (subprocess.CalledProcessError, FileNotFoundError):
                # If ffmpeg not available, rename WAV to requested path
                print("[VietTTS] ffmpeg not available, saving as WAV instead", file=sys.stderr)
                if os.path.exists(output_path):
                    os.remove(output_path)
                os.rename(wav_path, output_path)
        else:
            # Save as WAV
            sf.write(output_path, wave, sample_rate)

        print(f"[VietTTS] Audio generation completed successfully!", file=sys.stderr)
        return True

    except Exception as e:
        print(f"[VietTTS] Error during generation: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(description='VietTTS Wrapper for Vietnamese TTS')
    parser.add_argument('--text', type=str, required=True, help='Text to convert to speech')
    parser.add_argument('--voice', type=str, default='northern_female_1', help='Voice ID')
    parser.add_argument('--speed', type=float, default=1.0, help='Speech speed multiplier')
    parser.add_argument('--output', type=str, required=True, help='Output audio file path')

    args = parser.parse_args()

    # Generate speech
    success = generate_speech(
        text=args.text,
        voice=args.voice,
        speed=args.speed,
        output_path=args.output
    )

    if success:
        print("SUCCESS", file=sys.stdout)
        sys.exit(0)
    else:
        print("FAILED", file=sys.stdout)
        sys.exit(1)


if __name__ == '__main__':
    main()
