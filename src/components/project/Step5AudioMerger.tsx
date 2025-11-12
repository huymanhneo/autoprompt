import { useState } from 'react'
import { Loader2, Waves, Check } from 'lucide-react'

export default function Step5AudioMerger({ project, onNext, onUpdate }: any) {
  const [merging, setMerging] = useState(false)
  const [mergedFile, setMergedFile] = useState(project.mergedAudio || '')

  const handleMerge = async () => {
    if (!project.audioFiles || project.audioFiles.length === 0) {
      alert('Vui lòng hoàn thành Bước 4 trước')
      return
    }

    setMerging(true)
    try {
      const result = await window.electronAPI.mergeAudioFiles({
        inputFiles: project.audioFiles,
        outputPath: `${project.workingDirectory}/merged_audio.mp3`
      })

      if (result.success) {
        setMergedFile(result.data)
        await window.electronAPI.updateProject({
          id: project.id,
          mergedAudio: result.data
        })
        onUpdate({ mergedAudio: result.data })
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`)
    } finally {
      setMerging(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Waves className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bước 5: Ghép các file audio</h2>
            <p className="text-slate-400">Gộp tất cả chương thành một file audio duy nhất</p>
          </div>
        </div>

        {!mergedFile ? (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-300">Số file cần ghép: <span className="text-white font-semibold">{project.audioFiles?.length || 0}</span></p>
            </div>

            <button onClick={handleMerge} disabled={merging} className="btn-primary w-full">
              {merging ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Đang ghép...</> : 'Ghép audio'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span>Đã ghép thành công!</span>
              </div>
            </div>
            <button onClick={onNext} className="btn-primary w-full">Tiếp tục</button>
          </div>
        )}
      </div>
    </div>
  )
}
