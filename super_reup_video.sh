#!/bin/bash

################################################################################
# SUPER REUP VIDEO SCRIPT - PHIÊN BẢN NÂNG CAP
# Các tính năng nâng cao:
# - Motion effects (zoom, pan)
# - Advanced color grading (cinematic look)
# - Multiple blur zones
# - Film grain effect
# - Professional audio processing
# - Random variations để tránh phát hiện trùng lặp
################################################################################

# Đường dẫn làm việc
WORK_DIR="tmp/n8n/youtubehuymanh"
cd "$WORK_DIR" || exit 1

# Kiểm tra file SRT tồn tại
if [ ! -f "output-final.srt" ]; then
    echo "ERROR: output-final.srt not found!"
    exit 1
fi

# Lấy đường dẫn tuyệt đối
SRT_PATH=$(pwd)/output-final.srt

echo "🎬 Bắt đầu xử lý SUPER REUP VIDEO..."

# Bước 1: Tạo merged voiceover
echo "🎵 Merge voiceover files..."
find . -maxdepth 1 -name "*.mp3" -not -name "bgrmusic.mp3" -printf "file '%p'\n" | sort > mylist.txt
ffmpeg -y -f concat -safe 0 -i mylist.txt -c copy merged_voiceover.mp3

# Bước 2: SUPER REUP với nhiều hiệu ứng nâng cao
echo "🎨 Áp dụng hiệu ứng SUPER REUP..."

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
-r 30 \
-pix_fmt yuv420p \
-movflags +faststart \
-map_metadata -1 \
-shortest final_video.mp4

# Cleanup
echo "🧹 Dọn dẹp files tạm..."
rm -f mylist.txt merged_voiceover.mp3

echo "✅ HOÀN THÀNH! Video đã được reup với hiệu ứng SUPER REUP!"
echo "📹 Output: $WORK_DIR/final_video.mp4"
