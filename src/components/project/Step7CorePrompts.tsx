import { useState } from 'react'
import { Loader2, Users } from 'lucide-react'

export default function Step7CorePrompts({ project, onNext, onUpdate }: any) {
  const [generating, setGenerating] = useState(false)
  const [corePrompts, setCorePrompts] = useState(project.corePrompts || null)

  const handleGenerate = async () => {
    if (!project.chapters) {
      alert('Vui lòng hoàn thành các bước trước')
      return
    }

    setGenerating(true)
    try {
      const storyContent = project.chapters.map((c: any) => c.content).join('\n\n')
      const result = await window.electronAPI.generateCorePrompts({
        storyContent,
        numberOfCharacters: 3,
        numberOfSettings: 2
      })

      if (result.success) {
        setCorePrompts(result.data)
        await window.electronAPI.updateProject({
          id: project.id,
          corePrompts: result.data
        })
        await onUpdate()
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Bước 7: Tạo Core Prompts</h2>
            <p className="text-slate-400">Mô tả nhân vật và bối cảnh cho AI video generator</p>
          </div>
        </div>

        {!corePrompts ? (
          <div className="space-y-4">
            <button onClick={handleGenerate} disabled={generating} className="btn-primary w-full">
              {generating ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Đang tạo...</> : 'Tạo Core Prompts với AI'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Nhân vật:</h4>
              {corePrompts.characters?.map((char: any, i: number) => (
                <p key={i} className="text-sm text-slate-300">{i + 1}. {char}</p>
              ))}
              <h4 className="font-semibold text-white mt-4 mb-2">Bối cảnh:</h4>
              {corePrompts.settings?.map((set: any, i: number) => (
                <p key={i} className="text-sm text-slate-300">{i + 1}. {set}</p>
              ))}
            </div>
            <button onClick={onNext} className="btn-primary w-full">Tiếp tục</button>
          </div>
        )}
      </div>
    </div>
  )
}
