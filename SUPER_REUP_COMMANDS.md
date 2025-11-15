# 🎬 SUPER REUP VIDEO - ONE-LINER COMMANDS

## 🚀 Copy và dán để sử dụng ngay!

### ⭐ PHIÊN BẢN PRO (KHUYÊN DÙNG) - Random mỗi lần chạy

```bash
cd tmp/n8n/youtubehuymanh/ && \
if [ ! -f "output-final.srt" ]; then echo "ERROR: output-final.srt not found!"; exit 1; fi && \
SRT_PATH=$(pwd)/output-final.srt && \
BRIGHTNESS=$(awk -v min=0.02 -v max=0.06 'BEGIN{srand(); print min+rand()*(max-min)}') && \
CONTRAST=$(awk -v min=1.08 -v max=1.14 'BEGIN{srand(); print min+rand()*(max-min)}') && \
SATURATION=$(awk -v min=1.12 -v max=1.20 'BEGIN{srand(); print min+rand()*(max-min)}') && \
GAMMA=$(awk -v min=1.00 -v max=1.05 'BEGIN{srand(); print min+rand()*(max-min)}') && \
CROP_FACTOR=$(awk -v min=0.88 -v max=0.92 'BEGIN{srand(); print min+rand()*(max-min)}') && \
SPEED_VIDEO=$(awk -v min=0.96 -v max=0.98 'BEGIN{srand(); print min+rand()*(max-min)}') && \
SPEED_AUDIO=$(awk -v min=1.02 -v max=1.04 'BEGIN{srand(); print min+rand()*(max-min)}') && \
VOICE_VOLUME=$(awk -v min=1.02 -v max=1.08 'BEGIN{srand(); print min+rand()*(max-min)}') && \
BG_VOLUME=$(awk -v min=0.38 -v max=0.48 'BEGIN{srand(); print min+rand()*(max-min)}') && \
ZOOM_SPEED=$(awk -v min=0.0006 -v max=0.0010 'BEGIN{srand(); print min+rand()*(max-min)}') && \
BLUR_SIZE_1=$(awk -v min=15 -v max=20 'BEGIN{srand(); print int(min+rand()*(max-min))}') && \
BLUR_SIZE_2=$(awk -v min=10 -v max=14 'BEGIN{srand(); print int(min+rand()*(max-min))}') && \
VIGNETTE=$(awk -v min=4.2 -v max=5.0 'BEGIN{srand(); print min+rand()*(max-min)}') && \
echo "🎯 Random params: Brightness=$BRIGHTNESS, Contrast=$CONTRAST, Saturation=$SATURATION" && \
find . -maxdepth 1 -name "*.mp3" -not -name "bgrmusic.mp3" -printf "file '%p'\n" | sort > mylist.txt && \
ffmpeg -y -f concat -safe 0 -i mylist.txt -c copy merged_voiceover.mp3 && \
ffmpeg -y -i video_download.mp4 -i merged_voiceover.mp3 -stream_loop -1 -i bgrmusic.mp3 \
-filter_complex "
[0:v]setpts=${SPEED_VIDEO}*PTS,
eq=brightness=${BRIGHTNESS}:contrast=${CONTRAST}:saturation=${SATURATION}:gamma=${GAMMA},
hflip,
crop=iw*${CROP_FACTOR}:ih*${CROP_FACTOR},
scale=iw*1.03:ih*1.03,
zoompan=z='min(zoom+${ZOOM_SPEED},1.06)':d=1:x='iw/2-(iw/zoom/2)+sin(on/30)*20':y='ih/2-(ih/zoom/2)+cos(on/40)*15':s=1080x1920:fps=30,
unsharp=5:5:1.2:5:5:0.0,
curves=all='0/0 0.1/0.15 0.3/0.35 0.5/0.52 0.7/0.72 0.9/0.88 1/1',
colorbalance=rs=0.04:gs=-0.02:bs=-0.04:rm=0.03:gm=0.01:bm=-0.03:rh=0.02:gh=-0.01:bh=-0.02,
colorchannelmixer=rr=1.05:gg=0.98:bb=1.02,
vignette=PI/${VIGNETTE}:0.35,
noise=alls=7:allf=t+u,
smartblur=lr=0.3:ls=-0.5[v_base];
[v_base]split=4[main][blur1][blur2][blur3];
[blur1]crop=iw:220:0:ih-220,boxblur=${BLUR_SIZE_1}:8,curves=all='0/0 0.5/0.35 1/1',eq=brightness=-0.08[blurred1];
[blur2]crop=iw:180:0:0,boxblur=${BLUR_SIZE_2}:6,eq=brightness=-0.06:saturation=0.8[blurred2];
[blur3]crop=iw*0.25:ih*0.15:iw*0.38:ih*0.02,boxblur=25:10,eq=brightness=-0.1[blurred3];
[main][blurred2]overlay=0:0[temp1];
[temp1][blurred3]overlay=W*0.38:H*0.02[temp2];
[temp2][blurred1]overlay=0:H-220[v_composed];
[v_composed]subtitles='$SRT_PATH':force_style='FontName=Impact,FontSize=21,PrimaryColour=&H00FFFFFF,SecondaryColour=&H00FFFF00,OutlineColour=&H00000000,BackColour=&H80000000,Outline=3,Shadow=2,Bold=1,Italic=0,Alignment=2,MarginV=30',
gblur=sigma=0.4,
eq=contrast=1.02,
setsar=1[v];
[1:a]atempo=${SPEED_AUDIO},
highpass=f=80,
lowpass=f=15000,
equalizer=f=120:width_type=h:width=200:g=3,
equalizer=f=250:width_type=h:width=150:g=1.5,
equalizer=f=1000:width_type=h:width=500:g=0.5,
equalizer=f=3000:width_type=h:width=1000:g=1.2,
equalizer=f=8000:width_type=h:width=2000:g=0.8,
equalizer=f=12000:width_type=h:width=2000:g=-1.5,
volume=${VOICE_VOLUME},
acompressor=threshold=-16dB:ratio=4:attack=15:release=180:makeup=2,
alimiter=limit=0.96:attack=5:release=50[voice];
[2:a]atempo=${SPEED_AUDIO},
highpass=f=40,
lowpass=f=12000,
equalizer=f=60:width_type=h:width=120:g=5,
equalizer=f=200:width_type=h:width=150:g=2,
equalizer=f=8000:width_type=h:width=2000:g=-2,
volume=${BG_VOLUME},
acompressor=threshold=-22dB:ratio=3:attack=25:release=220[bg];
[voice][bg]amix=inputs=2:duration=first:dropout_transition=3,
acompressor=threshold=-14dB:ratio=2:attack=10:release=150,
alimiter=limit=0.98:attack=3:release=30[a]" \
-map "[v]" -map "[a]" \
-c:v libx264 -preset slower -crf 19 -profile:v high -level 4.2 \
-x264-params ref=5:bframes=4:b-adapt=2:direct=auto:me=umh:subme=8:trellis=2:aq-mode=3:aq-strength=0.9:psy-rd=1.0,0.15 \
-c:a aac -b:a 320k -ar 48000 \
-r 30 -pix_fmt yuv420p -movflags +faststart -map_metadata -1 -shortest final_video.mp4 && \
rm -f mylist.txt merged_voiceover.mp3 && \
echo "✅ DONE! Super Reup PRO completed!"
```

---

### 🎨 PHIÊN BẢN STANDARD - Hiệu ứng cố định, chất lượng cao

```bash
cd tmp/n8n/youtubehuymanh/ && \
if [ ! -f "output-final.srt" ]; then echo "ERROR: output-final.srt not found!"; exit 1; fi && \
SRT_PATH=$(pwd)/output-final.srt && \
find . -maxdepth 1 -name "*.mp3" -not -name "bgrmusic.mp3" -printf "file '%p'\n" | sort > mylist.txt && \
ffmpeg -y -f concat -safe 0 -i mylist.txt -c copy merged_voiceover.mp3 && \
ffmpeg -y -i video_download.mp4 -i merged_voiceover.mp3 -stream_loop -1 -i bgrmusic.mp3 \
-filter_complex "
[0:v]setpts=0.97*PTS,
eq=brightness=0.04:contrast=1.10:saturation=1.15:gamma=1.02,
hflip,
crop=iw*0.90:ih*0.90,
scale=iw*1.02:ih*1.02,
zoompan=z='min(zoom+0.0008,1.05)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,
unsharp=5:5:1.0:5:5:0.0,
curves=vintage,
colorbalance=rs=0.03:gs=-0.02:bs=-0.03:rm=0.02:gm=0.01:bm=-0.02,
vignette=PI/4.5:0.3,
noise=alls=6:allf=t+u[v_base];
[v_base]split=3[main][blur1][blur2];
[blur1]crop=iw:200:0:ih-200,boxblur=18:7,curves=all='0/0 0.5/0.4 1/1'[blurred1];
[blur2]crop=iw:150:0:0,boxblur=12:5,eq=brightness=-0.05[blurred2];
[main][blurred2]overlay=0:0[temp1];
[temp1][blurred1]overlay=0:H-200[v_composed];
[v_composed]subtitles='$SRT_PATH':force_style='FontName=Arial Black,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,Outline=2.5,Shadow=1.5,Bold=1,Alignment=2,MarginV=25',
gblur=sigma=0.3,
setsar=1[v];
[1:a]atempo=1.03,
equalizer=f=100:width_type=h:width=200:g=2,
equalizer=f=3000:width_type=h:width=1000:g=1,
equalizer=f=10000:width_type=h:width=2000:g=-1,
volume=1.05,
acompressor=threshold=-18dB:ratio=3:attack=20:release=200,
alimiter=limit=0.95[voice];
[2:a]atempo=1.03,
equalizer=f=60:width_type=h:width=100:g=4,
highpass=f=100,
volume=0.42,
acompressor=threshold=-20dB:ratio=2.5:attack=30:release=250[bg];
[voice][bg]amix=inputs=2:duration=first:dropout_transition=2[a]" \
-map "[v]" -map "[a]" \
-c:v libx264 -preset slow -crf 20 -profile:v high -level 4.2 \
-x264-params ref=4:bframes=3:direct=auto:aq-mode=3:aq-strength=0.8 \
-c:a aac -b:a 256k -ar 48000 \
-r 30 -pix_fmt yuv420p -movflags +faststart -map_metadata -1 -shortest final_video.mp4 && \
rm -f mylist.txt merged_voiceover.mp3 && \
echo "✅ DONE! Super Reup Standard completed!"
```

---

### 🏃 PHIÊN BẢN FAST - Render nhanh hơn, vẫn đẹp

```bash
cd tmp/n8n/youtubehuymanh/ && \
if [ ! -f "output-final.srt" ]; then echo "ERROR: output-final.srt not found!"; exit 1; fi && \
SRT_PATH=$(pwd)/output-final.srt && \
find . -maxdepth 1 -name "*.mp3" -not -name "bgrmusic.mp3" -printf "file '%p'\n" | sort > mylist.txt && \
ffmpeg -y -f concat -safe 0 -i mylist.txt -c copy merged_voiceover.mp3 && \
ffmpeg -y -i video_download.mp4 -i merged_voiceover.mp3 -stream_loop -1 -i bgrmusic.mp3 \
-filter_complex "
[0:v]setpts=0.97*PTS,
eq=brightness=0.04:contrast=1.10:saturation=1.15,
hflip,
crop=iw*0.90:ih*0.90,
zoompan=z='min(zoom+0.0008,1.04)':d=1:s=1080x1920:fps=30,
unsharp=5:5:0.8:5:5:0.0,
vignette=PI/4.5[v_base];
[v_base]split=2[main][blur1];
[blur1]crop=iw:200:0:ih-200,boxblur=16:6[blurred1];
[main][blurred1]overlay=0:H-200[v_composed];
[v_composed]subtitles='$SRT_PATH':force_style='FontName=Arial,FontSize=19,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Bold=1,Alignment=2,MarginV=25',
setsar=1[v];
[1:a]atempo=1.03,volume=1.05,acompressor=threshold=-18dB:ratio=3[voice];
[2:a]atempo=1.03,volume=0.42,highpass=f=100[bg];
[voice][bg]amix=inputs=2:duration=first[a]" \
-map "[v]" -map "[a]" \
-c:v libx264 -preset medium -crf 21 -profile:v high \
-c:a aac -b:a 192k -ar 48000 \
-r 30 -pix_fmt yuv420p -movflags +faststart -map_metadata -1 -shortest final_video.mp4 && \
rm -f mylist.txt merged_voiceover.mp3 && \
echo "✅ DONE! Super Reup Fast completed!"
```

---

## 📝 Ghi chú

### Khuyến nghị sử dụng:
1. **Reup nhiều lần khác nhau**: Dùng **PRO version** (random mỗi lần)
2. **Chất lượng cao, stable**: Dùng **Standard version**
3. **Render nhanh**: Dùng **Fast version**

### Customize nhanh:
Để thay đổi các thông số trong command, tìm và sửa:
- `crf 19` → `crf 21` (file nhẹ hơn)
- `preset slower` → `preset medium` (nhanh hơn)
- `b:a 320k` → `b:a 192k` (audio nhẹ hơn)
- Font subtitle: `FontName=Impact` → `FontName=Arial` hoặc `FontName=Verdana`

### Tips:
- Copy toàn bộ command (kể cả dấu xuống dòng `\`)
- Paste vào terminal và Enter
- Đợi xử lý hoàn tất
- Video output: `tmp/n8n/youtubehuymanh/final_video.mp4`

---

*Happy reup! 🎉*
