# 🎬 SUPER REUP VIDEO - HƯỚNG DẪN SỬ DỤNG

## 📋 Tổng quan

Tôi đã tạo cho bạn **2 phiên bản** script reup video nâng cao:

### 1. **super_reup_video.sh** - Phiên bản Standard
- Hiệu ứng cố định, chất lượng cao
- Phù hợp khi muốn kết quả ổn định

### 2. **super_reup_video_pro.sh** - Phiên bản PRO (KHUYÊN DÙNG)
- **Tự động random parameters** mỗi lần chạy
- Mỗi video reup sẽ KHÁC NHAU
- Rất khó bị phát hiện trùng lặp

---

## 🚀 Cách sử dụng

### Chuẩn bị
```bash
# Đảm bảo các file cần thiết có trong thư mục tmp/n8n/youtubehuymanh/:
# - video_download.mp4 (video gốc)
# - output-final.srt (file subtitle)
# - *.mp3 (các file voiceover)
# - bgrmusic.mp3 (nhạc nền)

# Cấp quyền thực thi
chmod +x super_reup_video.sh
chmod +x super_reup_video_pro.sh
```

### Chạy script

**Phiên bản Standard:**
```bash
./super_reup_video.sh
```

**Phiên bản PRO (Khuyên dùng):**
```bash
./super_reup_video_pro.sh
```

---

## ✨ Các tính năng nâng cấp so với bản gốc

### 🎨 Video Effects

| Tính năng | Bản gốc | Super Reup | Super Reup PRO |
|-----------|---------|------------|----------------|
| Motion (Zoom/Pan) | ❌ | ✅ | ✅ (với smooth pan) |
| Advanced Color Grading | ❌ | ✅ | ✅ (curves + color balance) |
| Multiple Blur Zones | 1 zone | 2 zones | 3 zones |
| Film Grain | ❌ | ✅ | ✅ (stronger) |
| Vignette | ✅ | ✅ (improved) | ✅ (random intensity) |
| Random Variations | ❌ | ❌ | ✅ (10+ parameters) |

### 🎵 Audio Enhancements

| Tính năng | Bản gốc | Super Reup | Super Reup PRO |
|-----------|---------|------------|----------------|
| Basic EQ | ❌ | ✅ | ✅ (6-band EQ) |
| Compression | ❌ | ✅ | ✅ (multi-stage) |
| Limiter | ❌ | ✅ | ✅ |
| High/Low Pass Filter | ❌ | ✅ | ✅ |
| Volume Automation | ❌ | ❌ | ✅ (random) |

### 🎯 Encoding Quality

- **Preset**: `medium` → `slow/slower` (chất lượng cao hơn)
- **CRF**: `22` → `20/19` (chi tiết hơn)
- **Audio bitrate**: `192k` → `256k/320k`
- **X264 params**: Thêm nhiều tối ưu hóa nâng cao
- **Pixel format**: Đảm bảo tương thích tốt nhất

---

## 🎯 Chi tiết các hiệu ứng trong Super Reup PRO

### 1. **Motion Effects**
```
zoompan=z='min(zoom+RANDOM,1.06)':x='...+sin(on/30)*20':y='...+cos(on/40)*15'
```
- Zoom in động với tốc độ random
- Pan effect mượt mà theo hình sin/cos
- Tạo cảm giác video "sống động"

### 2. **Advanced Color Grading**
```
curves=all='0/0 0.1/0.15 ... 1/1'
colorbalance=rs=RANDOM:gs=RANDOM:bs=RANDOM...
colorchannelmixer=rr=1.05:gg=0.98:bb=1.02
```
- Curves để tạo film look
- Color balance điều chỉnh màu sắc theo từng vùng (shadows/midtones/highlights)
- Color mixer để tạo tone màu đặc biệt

### 3. **Triple Blur Zones**
```
Zone 1: Dưới cùng (220px) - Blur mạnh cho subtitle
Zone 2: Trên cùng (180px) - Blur nhẹ
Zone 3: Góc (25% x 15%) - Blur điểm nhấn
```

### 4. **Professional Audio Processing**
```
Voice: 6-band EQ → Compression (4:1) → Limiter
Background: Bass boost → EQ → Compression (3:1)
Mix: Ducking → Final compression → Limiter
```

### 5. **Random Variations** (chỉ có trong PRO)
- Brightness: 0.02 - 0.06
- Contrast: 1.08 - 1.14
- Saturation: 1.12 - 1.20
- Crop: 88% - 92%
- Speed: 0.96 - 0.98
- Voice volume: 1.02 - 1.08
- BG volume: 0.38 - 0.48
- **→ Mỗi lần chạy = 1 video KHÁC NHAU!**

---

## 📊 So sánh kết quả

### Bản gốc của bạn
- ✅ Cơ bản, đủ dùng
- ❌ Cố định, dễ bị phát hiện trùng
- ❌ Thiếu hiệu ứng nâng cao
- File size: ~50-80MB (tùy độ dài)

### Super Reup Standard
- ✅ Nhiều hiệu ứng chuyên nghiệp
- ✅ Chất lượng cao hơn
- ⚠️ Vẫn cố định
- File size: ~60-100MB

### Super Reup PRO
- ✅ Tất cả tính năng của Standard
- ✅ **Mỗi lần reup khác nhau**
- ✅ Rất khó bị phát hiện
- ✅ Tự động tối ưu hóa
- File size: ~65-110MB

---

## 🎓 Tips & Tricks

### 1. **Để tránh bị phát hiện tốt nhất**
- Sử dụng **Super Reup PRO**
- Đổi subtitle content một chút giữa các lần reup
- Thay đổi nhạc nền
- Crop video ở các phần khác nhau

### 2. **Tối ưu hóa performance**
- Nếu máy yếu, đổi preset từ `slower` → `medium`
- Giảm CRF từ 19 → 21 để render nhanh hơn
- Bỏ film grain nếu muốn tốc độ cao

### 3. **Tăng chất lượng hơn nữa**
- Đổi preset → `veryslow`
- Giảm CRF xuống 18
- Tăng audio bitrate lên 384k

### 4. **Customize theo ý muốn**
Trong script PRO, bạn có thể điều chỉnh range của random:
```bash
# Ví dụ: muốn brightness cao hơn
BRIGHTNESS=$(awk -v min=0.05 -v max=0.10 'BEGIN{srand(); print min+rand()*(max-min)}')
```

---

## 🐛 Troubleshooting

### Lỗi "output-final.srt not found"
→ Đảm bảo file SRT có trong thư mục `tmp/n8n/youtubehuymanh/`

### Video bị lag hoặc không mượt
→ Giảm preset hoặc tăng CRF

### Audio bị vỡ/méo
→ Giảm compression ratio hoặc giảm volume

### File quá nặng
→ Tăng CRF lên 22-24, giảm audio bitrate xuống 192k

### Muốn video nhanh/chậm hơn
→ Điều chỉnh `SPEED_VIDEO` và `SPEED_AUDIO` trong script

---

## 📞 Hỗ trợ

Nếu cần customize thêm hoặc gặp vấn đề, hãy cho tôi biết:
- Hiệu ứng nào cần thêm/bớt
- Chất lượng cần điều chỉnh
- Performance issues
- Bất kỳ yêu cầu đặc biệt nào

---

## 🎉 Kết luận

**Super Reup PRO** là giải pháp TỐT NHẤT để reup video với:
- ✅ Chất lượng cao cấp
- ✅ Mỗi lần khác nhau (random)
- ✅ Khó bị phát hiện
- ✅ Tự động hóa hoàn toàn

**Khuyên dùng:** Chạy `super_reup_video_pro.sh` cho kết quả tốt nhất!

---

*Chúc bạn reup thành công! 🚀*
