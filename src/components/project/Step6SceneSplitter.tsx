import { useState } from 'react'
import { Loader2, Scissors, Check, FileText } from 'lucide-react'

export default function Step6SceneSplitter({ project, onNext, onUpdate }: any) {
  const [splitting, setSplitting] = useState(false)
  const [segments, setSegments] = useState(project.audioSegments || [])
  const [progress, setProgress] = useState(0)

  const handleSplit = async () => {
    if (!project.mergedAudio) {
      alert('Vui lòng hoàn thành Bước 5 trước')
      return
    }

    setSplitting(true)
    setProgress(0)

    try {
      console.log('[Step6] Splitting audio into segments...')

      // Step 1: Split audio into 8-second segments
      const splitResult = await window.electronAPI.splitAudioToSegments({
        inputFile: project.mergedAudio,
        segmentDuration: 8,
        outputDir: `${project.workingDirectory}/segments`
      })

      if (!splitResult.success) {
        throw new Error('Failed to split audio')
      }

      const audioSegments = splitResult.data
      setProgress(50)

      console.log(`[Step6] Split into ${audioSegments.length} segments, now transcribing...`)

      // Step 2: Transcribe each segment
      const transcribedSegments = []
      for (let i = 0; i < audioSegments.length; i++) {
        const segment = audioSegments[i]

        try {
          // Transcribe this segment
          const transcriptResult = await window.electronAPI.transcribeAudio(segment.audioFile)

          transcribedSegments.push({
            ...segment,
            transcript: transcriptResult.text || '[No speech detected]',
            confidence: transcriptResult.confidence
          })
        } catch (error) {
          console.error(`[Step6] Failed to transcribe segment ${i + 1}:`, error)
          transcribedSegments.push({
            ...segment,
            transcript: '[Transcription failed]'
          })
        }

        // Update progress
        const transcriptionProgress = 50 + ((i + 1) / audioSegments.length) * 50
        setProgress(transcriptionProgress)
      }

      setSegments(transcribedSegments)

      // Save to database
      await window.electronAPI.updateProject({
        id: project.id,
        audioSegments: transcribedSegments
      })

      onUpdate({ audioSegments: transcribedSegments })
      console.log('[Step6] All segments transcribed successfully')
    } catch (error: any) {
      console.error('[Step6] Error:', error)
      alert(`Lỗi: ${error.message}`)
    } finally {
      setSplitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
            <Scissors className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Bước 6: Chia audio + Transcribe
            </h2>
            <p className="text-slate-400">
              Chia thành các đoạn 8 giây và chuyển giọng nói thành text
            </p>
          </div>
        </div>

        {segments.length === 0 ? (
          <div className="space-y-6">
            <div className="bg-slate-700/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-3">Quy trình:</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-yellow-400" />
                  <span>Bước 1: Chia audio thành các đoạn 8 giây</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Bước 2: Transcribe từng đoạn sang text (Speech-to-Text)</span>
                </div>
              </div>
            </div>

            {splitting && (
              <div className="bg-primary-600/20 border border-primary-600/30 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
                  <span className="text-white font-medium">
                    {progress < 50 ? 'Đang chia audio...' : 'Đang transcribe...'}
                  </span>
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
              onClick={handleSplit}
              disabled={splitting}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
            >
              {splitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  Chia audio & Transcribe
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">
                  Đã chia thành {segments.length} đoạn và hoàn tất transcription
                </span>
              </div>
            </div>

            {/* Display segments with transcripts */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {segments.map((segment: any, index: number) => (
                <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">{segment.segmentNumber}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400">
                          {segment.startTime.toFixed(1)}s - {segment.endTime.toFixed(1)}s
                        </span>
                        {segment.confidence && (
                          <span className="text-xs text-green-400">
                            ({Math.round(segment.confidence * 100)}% confidence)
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {segment.transcript}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setSegments([])}
                className="btn-secondary flex-1"
              >
                Chia lại
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
