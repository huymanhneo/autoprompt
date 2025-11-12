import { useState } from 'react'
import { Loader2, Scissors, Check } from 'lucide-react'

export default function Step6SceneSplitter({ project, onNext, onUpdate }: any) {
  const [splitting, setSplitting] = useState(false)
  const [segments, setSegments] = useState(project.audioSegments || [])

  const handleSplit = async () => {
    if (!project.mergedAudio) {
      alert('Vui lòng hoàn thành Bước 5 trước')
      return
    }

    setSplitting(true)
    try {
      const result = await window.electronAPI.splitAudioToSegments({
        inputFile: project.mergedAudio,
        segmentDuration: 8,
        outputDir: `${project.workingDirectory}/segments`
      })

      if (result.success) {
        setSegments(result.data)
        await window.electronAPI.updateProject({
          id: project.id,
          audioSegments: result.data
        })
        onUpdate({ audioSegments: result.data })
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`)
    } finally {
      setSplitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
            <Scissors className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bước 6: Chia audio thành các đoạn 8 giây</h2>
            <p className="text-slate-400">Mỗi đoạn sẽ có transcript riêng</p>
          </div>
        </div>

        {segments.length === 0 ? (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300">Độ dài mỗi đoạn: <span className="text-white font-semibold">8 giây</span></p>
            </div>

            <button onClick={handleSplit} disabled={splitting} className="btn-primary w-full">
              {splitting ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Đang chia...</> : 'Chia audio'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span>Đã chia thành {segments.length} đoạn</span>
              </div>
            </div>
            <button onClick={onNext} className="btn-primary w-full">Tiếp tục</button>
          </div>
        )}
      </div>
    </div>
  )
}
