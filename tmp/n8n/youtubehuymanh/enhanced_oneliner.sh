cd tmp/n8n/youtubehuymanh/ && \
if [ ! -f "output-final.srt" ]; then echo "ERROR: output-final.srt not found!"; exit 1; fi && \
SRT_PATH=$(pwd)/output-final.srt && \
find . -maxdepth 1 -name "*.mp3" -not -name "bgrmusic.mp3" -printf "file '%p'\n" | sort > mylist.txt && \
ffmpeg -y -f concat -safe 0 -i mylist.txt -c copy merged_voiceover.mp3 && \
ffmpeg -y -i video_download.mp4 -i merged_voiceover.mp3 -stream_loop -1 -i bgrmusic.mp3 \
-filter_complex "\
[0:v]scale=iw*1.1:ih*1.1,zoompan=z='if(lte(zoom,1.0),1.05,max(1.00,zoom-0.0015))':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,eq=brightness=0.05:contrast=1.15:saturation=1.18:gamma=1.05,curves=vintage,hue=s=1.1,colorchannelmixer=rr=1.05:gg=0.98:bb=0.95,hflip,crop=iw*0.88:ih*0.88,unsharp=7:7:1.2:7:7:0.0,noise=alls=8:allf=t,vibrance=intensity=0.15,gblur=sigma=0.3,sharpen=luma_msize_x=5:luma_msize_y=5:luma_amount=0.8,vignette=PI/4.5:mode=forward,drawbox=x=0:y=0:w=iw:h=ih:color=black@0.02:t=fill,perspective=x0=0:y0=10:x1=W:y1=0:x2=0:y2=H-10:x3=W:y3=H:interpolation=linear[v1];\
[v1]split[main][blur];\
[blur]crop=iw:200:0:ih-200,boxblur=20:7,colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3[blurred];\
[main][blurred]overlay=0:H-200[v2];\
[v2]subtitles='$SRT_PATH':force_style='FontName=Arial Black,FontSize=28,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,Outline=2.5,Shadow=1.5,Bold=1,Alignment=2,MarginV=35',drawbox=x=(iw-iw*0.95)/2:y=(ih-ih*0.95)/2:w=iw*0.95:h=ih*0.95:color=white@0.05:t=3,setpts=0.97*PTS,format=yuv420p,setsar=1[v_final];\
[1:a]atempo=1.03,asetrate=48000*1.01,aresample=48000,volume=1.05,equalizer=f=200:width_type=h:width=100:g=2,equalizer=f=3000:width_type=h:width=1000:g=1,highpass=f=80,lowpass=f=15000,acompressor=threshold=-20dB:ratio=3:attack=5:release=50,aphaser=in_gain=0.4:out_gain=0.7:delay=3:decay=0.4:speed=0.5[voice];\
[2:a]atempo=1.03,asetrate=48000*1.01,aresample=48000,volume=0.38,bass=g=4:f=110:width_type=h:width=100,treble=g=-1:f=8000,highpass=f=60,acompressor=threshold=-25dB:ratio=4:attack=10:release=100[bg];\
[voice][bg]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.95:attack=7:release=50,volume=1.0[a_final]" \
-map "[v_final]" -map "[a_final]" \
-c:v libx264 -preset slow -profile:v high -level 4.2 -crf 18 \
-x264-params ref=4:bframes=3:b-adapt=2:direct=auto:me=umh:subme=8:trellis=2:psy-rd=1.0,0.15 \
-movflags +faststart \
-c:a aac -b:a 256k -ar 48000 \
-r 29.97 -pix_fmt yuv420p \
-color_primaries bt709 -color_trc bt709 -colorspace bt709 \
-map_metadata -1 -shortest final_video_enhanced.mp4 && \
rm mylist.txt merged_voiceover.mp3
