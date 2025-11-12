#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo -e "  YouTube Video Automation Installer"
echo -e "  Developed by Mr.Mạnh - 0979.121.097"
echo -e "========================================${NC}"
echo ""

# Check Node.js
echo -e "${BLUE}[1/4] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed!${NC}"
    echo "Please install Node.js from: https://nodejs.org"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check FFmpeg
echo ""
echo -e "${BLUE}[2/4] Checking FFmpeg...${NC}"
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}WARNING: FFmpeg is not installed!${NC}"
    echo ""
    echo "Attempting to install FFmpeg..."

    # Detect OS and install
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ffmpeg
        else
            echo -e "${RED}Homebrew not found. Please install FFmpeg manually:${NC}"
            echo "brew install ffmpeg"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y ffmpeg
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y ffmpeg
        elif command -v yum &> /dev/null; then
            sudo yum install -y ffmpeg
        else
            echo -e "${RED}Package manager not found. Please install FFmpeg manually.${NC}"
            exit 1
        fi
    fi
fi
echo -e "${GREEN}✓ FFmpeg found: $(ffmpeg -version | head -n1)${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}[3/4] Installing dependencies (this may take 5-10 minutes)...${NC}"
npm install --legacy-peer-deps
if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Failed to install dependencies!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Success
echo ""
echo -e "${BLUE}[4/4] Installation complete!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  READY TO USE!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To start the application, run:"
echo -e "${YELLOW}  npm run electron:dev${NC}"
echo ""
echo "First-time setup wizard will guide you through API configuration."
echo ""
echo -e "${BLUE}Developed by Mr.Mạnh - 0979.121.097${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
