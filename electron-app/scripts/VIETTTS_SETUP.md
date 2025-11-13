# VietTTS Setup Guide

## Overview
VietTTS is an open-source Vietnamese Text-to-Speech library by NTT123.
- **GitHub:** https://github.com/NTT123/vietTTS
- **Features:** High-quality Vietnamese TTS, multiple voices, offline usage
- **License:** MIT (Free for commercial use)

## Prerequisites

### 1. Install Python 3.8+
- **Windows:** Download from https://www.python.org/downloads/
- **macOS:** `brew install python3`
- **Linux:** Usually pre-installed

Verify installation:
```bash
python --version
# or
python3 --version
```

### 2. Install VietTTS

```bash
pip install vietTTS
pip install soundfile
```

**Optional (for MP3 support):**
```bash
# Install ffmpeg for MP3 conversion
# Windows: Download from https://ffmpeg.org/download.html
# macOS:
brew install ffmpeg
# Linux:
sudo apt-get install ffmpeg
```

## Available Voices

| Voice ID | Description | Gender | Region |
|----------|-------------|--------|--------|
| `northern_female_1` | Nữ Miền Bắc 1 | Female | Northern |
| `northern_male_1` | Nam Miền Bắc 1 | Male | Northern |
| `southern_female_1` | Nữ Miền Nam 1 | Female | Southern |
| `southern_male_1` | Nam Miền Nam 1 | Male | Southern |
| `central_female_1` | Nữ Miền Trung 1 | Female | Central |

## Usage in App

1. **Open Settings** → Text-to-Speech
2. **Select Provider:** VietTTS
3. **Choose Voice:** e.g., `northern_female_1`
4. **Click "Save Settings"**
5. Go to Step 4 (Text to Audio) and generate audio!

## First Run

On first run, VietTTS will download model weights (~500MB):
- Duration model
- Acoustic model
- HiFiGAN vocoder

This happens automatically and only needs to be done once.

## Performance

- **CPU:** ~5-10 seconds per sentence (slow but works)
- **GPU (CUDA):** ~1-2 seconds per sentence (recommended)

To use GPU, install PyTorch with CUDA:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Troubleshooting

### Error: "Python not found"
- Make sure Python is installed and in PATH
- Try `python3` instead of `python`

### Error: "vietTTS not found"
```bash
pip install --upgrade vietTTS
```

### Error: "Model download failed"
- Check internet connection (needed for first run)
- Models are cached in `~/.cache/vietTTS/`

### Slow generation
- Normal on CPU (5-10 sec/sentence)
- Use GPU for faster generation
- Consider using API-based TTS (Gemini, FPT) if speed is critical

## Advantages

✅ **Completely Free** - No API costs
✅ **Offline** - Works without internet after setup
✅ **Privacy** - All processing done locally
✅ **High Quality** - Natural-sounding Vietnamese voices
✅ **No Limits** - Generate unlimited audio

## Disadvantages

⚠️ **Requires Python** - Additional setup step
⚠️ **Large Models** - ~500MB download on first run
⚠️ **Slower** - 5-10 seconds per sentence on CPU
⚠️ **Technical** - May require troubleshooting for some users

## Recommended For

- Users who want **free, unlimited** TTS
- Users who need **offline** operation
- Users with **privacy concerns**
- Users with **GPU** available (for better speed)

## Not Recommended For

- Users who want **instant setup** → Use Gemini TTS or FPT AI instead
- Users without Python knowledge → Use API-based options
- Users who need **real-time** generation → Use Gemini or FPT

---

For support, visit: https://github.com/NTT123/vietTTS/issues
