import { useState } from 'react'
import { Loader2, Mic, Check, Volume2 } from 'lucide-react'

interface Step4TTSGeneratorProps {
  project: any
  onNext: () => void
  onUpdate: () => void
}

export default function Step4TTSGenerator({
  project,
  onNext,
  onUpdate
}: Step4TTSGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState<string[]>(project.audioFiles || [])
  const [progress, setProgress] = useState(0)

  const handleGenerate = async () => {
    if (!project.chapters || project.chapters.length === 0) {
      alert('Vui lòng hoàn thành Bước 3 trước')
      return
    }

    setGenerating(true)
    setProgress(0)

    try {
      const generatedFiles: string[] = []

      for (let i = 0; i < project.chapters.length; i++) {
        const chapter = project.chapters[i]
        console.log(`[Step4] Generating audio for chapter ${i + 1}`)

        const result = await window.electronAPI.textToSpeech({
          text: chapter.content,
          voice: 'vi-VN-Standard-A',
          speed: 1.0,
          outputPath: `${project.workingDirectory}/audio/chapter_${i + 1}.mp3`
        })

        if (result.success) {
          generatedFiles.push(result.data.filePath)
        }

        setProgress(((i + 1) / project.chapters.length) * 100)
      }

      setAudioFiles(generatedFiles)
      await window.electronAPI.updateProject({
        id: project.id,
        audioFiles: generatedFiles
      })

      await onUpdate()
      console.log('[Step4] All audio files generated')
    } catch (error: any) {
      console.error('[Step4] Error generating audio:', error)
      alert(`Lỗi: ${error.message || 'Không thể tạo audio'}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
            <Mic className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Bước 4: Chuyển văn bản thành giọng nói
            </h2>
            <p className="text-slate-400">
              Text-to-Speech cho {project.chapters?.length || 0} chương
            </p>
          </div>
        </div>

        {audioFiles.length === 0 ? (
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Cấu hình TTS:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Provider:</span>
                  <span className="text-white ml-2">Google TTS</span>
                </div>
                <div>
                  <span className="text-slate-400">Giọng:</span>
                  <span className="text-white ml-2">vi-VN-Standard-A</span>
                </div>
                <div>
                  <span className="text-slate-400">Số chương:</span>
                  <span className="text-white ml-2">{project.chapters?.length || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400">Tốc độ:</span>
                  <span className="text-white ml-2">1.0x</span>
                </div>
              </div>
            </div>

            {generating && (
              <div className="bg-primary-600/20 border border-primary-600/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                  <span className="text-white font-medium">Đang tạo audio...</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-400 mt-2">{Math.round(progress)}% hoàn thành</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  Tạo audio cho tất cả chương
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Đã tạo xong {audioFiles.length} file audio</span>
              </div>
            </div>

            <div className="space-y-2">
              {audioFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <Volume2 className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-slate-300 flex-1">Chương {index + 1}</span>
                  <span className="text-xs text-slate-400">{file.split('/').pop()}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setAudioFiles([])} className="btn-secondary flex-1">
                Tạo lại
              </button>
              <button onClick={onNext} className="btn-primary flex-1">
                Tiếp tục
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
