import { useState } from 'react'
import { Loader2, Film, Check, Download } from 'lucide-react'

export default function Step8VideoPrompts({ project, onUpdate }: any) {
  const [generating, setGenerating] = useState(false)
  const [videoPrompts, setVideoPrompts] = useState(project.videoPrompts || [])

  const handleGenerate = async () => {
    if (!project.audioSegments || !project.corePrompts) {
      alert('Vui lòng hoàn thành các bước trước')
      return
    }

    setGenerating(true)
    try {
      const sceneTranscripts = project.audioSegments.map((seg: any) => ({
        segmentNumber: seg.segmentNumber,
        transcript: seg.transcript
      }))

      const result = await window.electronAPI.generateVideoPrompts({
        sceneTranscripts,
        corePrompts: project.corePrompts,
        storyContext: project.outline?.summary || ''
      })

      if (result.success) {
        setVideoPrompts(result.data)
        await window.electronAPI.updateProject({
          id: project.id,
          videoPrompts: result.data,
          status: 'completed'
        })
        await onUpdate()
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleExport = async () => {
    const jsonContent = JSON.stringify(videoPrompts, null, 2)
    await window.electronAPI.saveFile({
      content: jsonContent,
      defaultPath: 'video_prompts.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center">
            <Film className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bước 8: Tạo Video Prompts</h2>
            <p className="text-slate-400">Prompts chi tiết cho từng cảnh video (JSON format)</p>
          </div>
        </div>

        {videoPrompts.length === 0 ? (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300">Số cảnh cần tạo: <span className="text-white font-semibold">{project.audioSegments?.length || 0}</span></p>
            </div>

            <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
              {generating ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Đang tạo prompts...</> : 'Tạo Video Prompts với AI'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span>Đã tạo {videoPrompts.length} video prompts</span>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {videoPrompts.slice(0, 5).map((prompt: any, i: number) => (
                <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary-400">Cảnh {prompt.scene_id}</span>
                    <span className="text-xs text-slate-400">({prompt.video_duration})</span>
                  </div>
                  <p className="text-sm text-slate-300">{prompt.prompt.narrative}</p>
                </div>
              ))}
              {videoPrompts.length > 5 && (
                <p className="text-center text-sm text-slate-400">...và {videoPrompts.length - 5} cảnh khác</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Xuất JSON
              </button>
              <button onClick={() => alert('Dự án hoàn thành!')} className="btn-primary flex-1">
                Hoàn thành
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
