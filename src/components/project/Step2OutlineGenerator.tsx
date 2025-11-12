import { useState } from 'react'
import { Loader2, Sparkles, FileText, BookOpen } from 'lucide-react'

interface Step2OutlineGeneratorProps {
  project: any
  onNext: () => void
  onUpdate: (data: any) => void
}

export default function Step2OutlineGenerator({
  project,
  onNext,
  onUpdate
}: Step2OutlineGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [outline, setOutline] = useState(project.outline || null)
  const [formData, setFormData] = useState({
    idea: project.mode === 'idea' ? '' : '',
    scriptFile: '',
    numberOfChapters: 5,
    style: 'storytelling',
    tone: 'friendly'
  })

  const handleGenerate = async () => {
    if (project.mode === 'idea' && !formData.idea.trim()) {
      alert('Vui lòng nhập ý tưởng cho truyện')
      return
    }

    setLoading(true)
    try {
      console.log('[Step2] Generating outline with params:', formData)
      const result = await window.electronAPI.generateOutline({
        idea: formData.idea,
        numberOfChapters: formData.numberOfChapters,
        style: formData.style,
        tone: formData.tone
      })

      console.log('[Step2] Outline generated:', result)
      if (result.success) {
        setOutline(result.data)
        // Save to project
        await window.electronAPI.updateProject({
          id: project.id,
          outline: result.data
        })
        onUpdate({ outline: result.data })
      }
    } catch (error: any) {
      console.error('[Step2] Error generating outline:', error)
      alert(`Lỗi: ${error.message || 'Không thể tạo dàn ý'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadScript = async () => {
    try {
      const filePath = await window.electronAPI.selectFile([
        { name: 'Text Files', extensions: ['txt', 'md'] }
      ])

      if (filePath) {
        const content = await window.electronAPI.readFile(filePath)
        setFormData({ ...formData, scriptFile: filePath, idea: content })
      }
    } catch (error: any) {
      console.error('[Step2] Error loading script:', error)
      alert(`Lỗi: ${error.message}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-600/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Bước 2: Tạo dàn ý truyện
            </h2>
            <p className="text-slate-400">
              AI sẽ tạo dàn ý chi tiết cho {formData.numberOfChapters} chương
            </p>
          </div>
        </div>

        {!outline ? (
          <div className="space-y-6">
            {/* Input Form */}
            {project.mode === 'idea' ? (
              <div>
                <label className="label">Ý tưởng truyện của bạn *</label>
                <textarea
                  className="input"
                  rows={6}
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  placeholder="VD: Một câu chuyện về cô bé Lọ Lem phiên bản hiện đại, nơi cô là một lập trình viên tài năng..."
                  disabled={loading}
                />
              </div>
            ) : (
              <div>
                <label className="label">Tải lên kịch bản có sẵn *</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="input flex-1"
                    value={formData.scriptFile}
                    readOnly
                    placeholder="Chọn file .txt hoặc .md"
                  />
                  <button
                    onClick={handleLoadScript}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Chọn file
                  </button>
                </div>
                {formData.idea && (
                  <div className="mt-3 p-3 bg-slate-700 rounded-lg max-h-32 overflow-y-auto">
                    <p className="text-sm text-slate-300">{formData.idea.substring(0, 500)}...</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Số chương</label>
                <input
                  type="number"
                  className="input"
                  min="3"
                  max="20"
                  value={formData.numberOfChapters}
                  onChange={(e) => setFormData({ ...formData, numberOfChapters: parseInt(e.target.value) })}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Phong cách</label>
                <select
                  className="input"
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  disabled={loading}
                >
                  <option value="storytelling">Kể chuyện</option>
                  <option value="educational">Giáo dục</option>
                  <option value="documentary">Phóng sự</option>
                  <option value="entertaining">Giải trí</option>
                </select>
              </div>

              <div>
                <label className="label">Giọng điệu</label>
                <select
                  className="input"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  disabled={loading}
                >
                  <option value="friendly">Thân thiện</option>
                  <option value="professional">Chuyên nghiệp</option>
                  <option value="casual">Thoải mái</option>
                  <option value="dramatic">Kịch tính</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang tạo dàn ý...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Tạo dàn ý với AI
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display Outline */}
            <div className="bg-slate-700/50 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">{outline.title}</h3>
              <p className="text-slate-300">{outline.summary}</p>

              <div className="space-y-4 mt-6">
                <h4 className="text-lg font-semibold text-white">Các chương:</h4>
                {outline.chapters?.map((chapter: any, index: number) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-white mb-1">{chapter.title}</h5>
                        <p className="text-sm text-slate-400">{chapter.summary}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOutline(null)}
                className="btn-secondary flex-1"
              >
                Tạo lại
              </button>
              <button
                onClick={onNext}
                className="btn-primary flex-1"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
