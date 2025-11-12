# YouTube Video Automation Desktop App

🎬 Ứng dụng desktop tự động hóa toàn bộ quy trình tạo nội dung video YouTube - từ ý tưởng đến video prompts.

## ✨ Tính năng

### Workflow tự động hóa 8 bước:

1. **Khởi tạo dự án** - Chọn mode: Từ ý tưởng hoặc Từ kịch bản
2. **Tạo dàn ý** - AI tự động tạo dàn ý nhiều chương
3. **Viết nội dung** - Tạo nội dung chi tiết cho từng chương
4. **Text-to-Speech** - Chuyển văn bản thành âm thanh (hỗ trợ 4 providers)
5. **Ghép audio** - Ghép các đoạn audio thành file hoàn chỉnh
6. **Chia cảnh** - Tự động chia thành các cảnh 8 giây + transcription
7. **Core Prompts** - Tạo prompts cho nhân vật, bối cảnh
8. **Video Prompts** - Tạo prompts video chi tiết cho từng cảnh

### Công nghệ

- **Frontend**: Electron + React + TypeScript + TailwindCSS + Vite
- **Backend**: Node.js + TypeScript
- **AI/LLM**: Google Gemini (có thể mở rộng OpenAI, Claude)
- **TTS**:
  - Google Cloud TTS (miễn phí, tiếng Việt tốt)
  - ElevenLabs (trả phí, chất lượng cao)
  - FPT AI (miễn phí, giọng Việt)
  - Viettel AI (miễn phí, giọng Việt)
- **Audio Processing**: FFmpeg
- **Database**: SQLite (better-sqlite3)
- **Build**: Electron Builder (support Windows/macOS/Linux)

## 📋 Yêu cầu hệ thống

### Cài đặt trước:

1. **Node.js** >= 18.0.0
   ```bash
   # Kiểm tra version
   node --version
   ```

2. **FFmpeg** (bắt buộc cho xử lý audio)

   **Windows:**
   ```bash
   # Dùng Chocolatey
   choco install ffmpeg

   # Hoặc tải từ: https://ffmpeg.org/download.html
   ```

   **macOS:**
   ```bash
   brew install ffmpeg
   ```

   **Linux:**
   ```bash
   sudo apt install ffmpeg  # Ubuntu/Debian
   sudo dnf install ffmpeg  # Fedora
   ```

   Kiểm tra:
   ```bash
   ffmpeg -version
   ```

3. **API Keys**
   - **Google Gemini API Key** (bắt buộc): https://makersuite.google.com/app/apikey
   - Google Cloud TTS API Key (tùy chọn - có thể dùng Gemini key)
   - ElevenLabs API Key (tùy chọn): https://elevenlabs.io
   - FPT AI API Key (tùy chọn): https://fpt.ai
   - Viettel AI API Key (tùy chọn): https://viettelai.vn

## 🚀 Cài đặt và chạy

### ⚡ Cài đặt 1-Click (Khuyến nghị)

#### **Windows:**
1. Mở Command Prompt hoặc PowerShell
2. Chạy script cài đặt tự động:
   ```cmd
   install.bat
   ```

#### **macOS / Linux:**
1. Mở Terminal
2. Chạy script cài đặt tự động:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

Script sẽ tự động:
- ✅ Kiểm tra Node.js
- ✅ Cài đặt FFmpeg (nếu chưa có)
- ✅ Cài đặt tất cả dependencies
- ✅ Sẵn sàng để chạy!

---

### 🔧 Cài đặt thủ công (Nếu script không hoạt động)

#### 1. Clone repository

```bash
git clone <repository-url>
cd autoprompt
```

#### 2. Cài đặt dependencies

```bash
npm install --legacy-peer-deps
```

**Lưu ý**: Quá trình cài đặt có thể mất 5-10 phút do cần tải Electron binary (~100MB).

#### 3. Chạy ứng dụng

```bash
npm run electron:dev
```

---

### 🎯 Cấu hình lần đầu

Khi mở app lần đầu, **Setup Wizard** sẽ tự động xuất hiện và hướng dẫn bạn:

1. **Bước 1**: Nhập Google Gemini API Key
   - Lấy API key miễn phí tại: https://makersuite.google.com/app/apikey

2. **Bước 2**: Chọn TTS Provider (Text-to-Speech)
   - Google TTS (miễn phí, khuyến nghị)
   - ElevenLabs (trả phí, chất lượng cao)
   - FPT AI / Viettel AI (miễn phí, giọng Việt)

3. **Bước 3**: Điều chỉnh cài đặt Audio
   - Độ dài mỗi cảnh video (mặc định 8 giây)
   - Bitrate audio (khuyến nghị 192kbps)

**Hoàn tất!** - App sẽ tự động lưu cấu hình và sẵn sàng sử dụng.

> ⚙️ Bạn có thể thay đổi cấu hình bất kỳ lúc nào trong **Settings**.

## 📦 Build ứng dụng

### Build cho platform hiện tại:

```bash
npm run build
```

### Build cho từng platform cụ thể:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

File output sẽ ở trong thư mục `release/`.

### Kích thước ước tính:

- Windows (NSIS installer): ~150-200 MB
- macOS (DMG): ~170-220 MB
- Linux (AppImage): ~160-210 MB

## 📂 Cấu trúc dự án

```
youtube-video-automation/
├── electron-app/              # Electron main process
│   ├── main.ts               # Entry point
│   ├── preload.ts            # IPC bridge
│   ├── ipc/
│   │   └── handlers.ts       # IPC handlers
│   └── services/
│       ├── ServiceManager.ts # Service manager
│       ├── llm/
│       │   └── LLMService.ts # AI content generation
│       ├── tts/
│       │   └── TTSService.ts # Text-to-Speech
│       ├── audio/
│       │   └── AudioService.ts # Audio processing (FFmpeg)
│       └── storage/
│           └── StorageService.ts # SQLite database
│
├── src/                      # React frontend
│   ├── components/
│   │   ├── Layout.tsx        # Main layout
│   │   └── project/
│   │       ├── StepIndicator.tsx
│   │       ├── Step1ProjectInit.tsx
│   │       ├── Step2OutlineGenerator.tsx
│   │       ├── Step3ContentWriter.tsx
│   │       ├── Step4TTSGenerator.tsx
│   │       ├── Step5AudioMerger.tsx
│   │       ├── Step6SceneSplitter.tsx
│   │       ├── Step7CorePrompts.tsx
│   │       └── Step8VideoPrompts.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ProjectPage.tsx
│   │   └── SettingsPage.tsx
│   ├── App.tsx
│   └── main.tsx
│
├── shared/                   # Shared types
│   └── types/
│       └── index.ts
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Sử dụng

### 1. Tạo dự án mới

1. Mở app → Click **"Dự án mới"**
2. Nhập thông tin:
   - Tên dự án
   - Mô tả ngắn
   - Chọn mode: **Từ ý tưởng** hoặc **Từ kịch bản**
   - Chọn thư mục lưu dự án
3. Click **"Tạo dự án"**

### 2. Workflow tự động

#### Mode 1: Từ ý tưởng

```
Ý tưởng → AI tạo dàn ý → AI viết nội dung → TTS → Ghép audio →
Chia cảnh → Tạo core prompts → Tạo video prompts → Export JSON
```

**Bước 2: Tạo dàn ý**
- Nhập ý tưởng câu chuyện
- Cài đặt: Số chương, phong cách, giọng điệu
- AI tự động tạo dàn ý chi tiết

**Bước 3: Viết nội dung**
- Chọn chương → Click "Sinh nội dung"
- AI viết toàn bộ nội dung theo phong cách điện ảnh
- Có thể chỉnh sửa trực tiếp

#### Mode 2: Từ kịch bản

```
Tải kịch bản → Tự động chia chương → TTS → Ghép audio →
Chia cảnh → Tạo core prompts → Tạo video prompts → Export JSON
```

**Bước 1: Upload kịch bản**
- Tải file .txt hoặc .docx
- Tự động chia thành các chương

### 3. Xử lý audio (Bước 4-6)

**Bước 4: Text-to-Speech**
- Chọn TTS provider
- Chọn giọng đọc
- Điều chỉnh tốc độ
- Tạo audio cho từng chương

**Bước 5: Ghép audio**
- Tự động ghép các đoạn audio thành file hoàn chỉnh
- Xem preview waveform

**Bước 6: Chia cảnh**
- Tự động chia thành các cảnh 8 giây
- Transcribe mỗi cảnh
- Export danh sách scenes

### 4. Tạo video prompts (Bước 7-8)

**Bước 7: Core Prompts**
- AI phân tích và tạo prompts cho:
  - Nhân vật chính (ngoại hình, trang phục)
  - Bối cảnh (địa điểm, ánh sáng, màu sắc)
  - Phong cách visual
  - Camera style

**Bước 8: Video Prompts**
- AI tạo video prompts chi tiết cho từng cảnh:
  - Narrative (mô tả cảnh)
  - Style (phong cách)
  - Camera (góc quay, chuyển động)
  - Dialogue (thoại nếu có)
  - Audio (nhạc nền, âm thanh)
  - Metadata

### 5. Export kết quả

Click **"Export JSON"** để xuất:

```json
{
  "project": {...},
  "scenes": [
    {
      "scene_id": 1,
      "video_duration": "8s",
      "prompt": {
        "narrative": "...",
        "style": "Cinematic realism, Vietnamese storytelling",
        "camera": "Wide shot, slow pan",
        "transition": "fade"
      },
      "dialogue": {...},
      "audio": {...},
      "metadata": {...}
    }
  ]
}
```

Sử dụng JSON này với các tool sinh video AI:
- Runway ML
- Pika Labs
- Leonardo Motion
- Kaiber AI

## 🛠️ Development

### Cấu trúc code

- **Services**: Business logic (LLM, TTS, Audio, Storage)
- **IPC Handlers**: Bridge giữa Electron và React
- **React Components**: UI/UX
- **Shared Types**: Type definitions cho TypeScript

### Thêm LLM provider mới

```typescript
// electron-app/services/llm/LLMService.ts

async generateWithOpenAI(request: LLMRequest): Promise<string> {
  // Implement OpenAI logic
}

async generateWithClaude(request: LLMRequest): Promise<string> {
  // Implement Claude logic
}
```

### Thêm TTS provider mới

```typescript
// electron-app/services/tts/TTSService.ts

private async generateWithNewProvider(
  text: string,
  voice: string,
  speed: number,
  outputPath: string
): Promise<string> {
  // Implement new TTS provider
}
```

## 🐛 Troubleshooting

### Lỗi: "FFmpeg not found"

```bash
# Kiểm tra FFmpeg đã cài chưa
ffmpeg -version

# Nếu chưa có, cài lại theo hướng dẫn ở mục "Yêu cầu hệ thống"
```

### Lỗi: "LLM Service not initialized"

- Vào **Settings**
- Nhập Gemini API key
- Save và khởi động lại app

### Lỗi: "Cannot find module 'better-sqlite3'"

```bash
# Rebuild native modules
npm rebuild better-sqlite3

# Hoặc cài lại
npm install
```

### App không mở được

```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install
```

## 📝 TODO (PHASE 1 - MVP đã hoàn thành)

- [x] Setup Electron + React + Vite
- [x] Implement LLM Service (Gemini)
- [x] Implement TTS Service (4 providers)
- [x] Implement Audio Service (FFmpeg)
- [x] Implement Storage Service (SQLite)
- [x] UI Layout + Navigation
- [ ] Implement Step 2: Outline Generator
- [ ] Implement Step 3: Content Writer
- [ ] Implement Step 4-6: Audio workflow
- [ ] Implement Step 7-8: Video prompts
- [ ] Fetch Audio Transcriber từ branch `claude/audio-segment-transcription-011CV3pZ7JopRsNGH8J1ciK8`

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 🙏 Acknowledgments

- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [FFmpeg](https://ffmpeg.org/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)
- [TailwindCSS](https://tailwindcss.com/)

---

**Phát triển bởi**: Mr.Mạnh
**Liên hệ**: [0979.121.097](tel:0979121097)
**Version**: 1.0.0 (MVP - PHASE 1-2 Completed)
**Copyright**: © 2024 YouTube Video Automation. All Rights Reserved.
