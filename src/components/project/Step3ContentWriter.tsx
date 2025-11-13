import { useState } from 'react'
import { Loader2, Sparkles, FileEdit, Check, Play } from 'lucide-react'

interface Step3ContentWriterProps {
  project: any
  onNext: () => void
  onUpdate: (data: any) => void
}

export default function Step3ContentWriter({
  project,
  onNext,
  onUpdate
}: Step3ContentWriterProps) {
  // Convert database chapters to UI format
  const initChapters = () => {
    if (!project.outline?.chapters) return []
    return project.outline.chapters.map((_: any, index: number) => {
      const dbChapter = project.chapters?.find((ch: any) => ch.chapter_number === index + 1)
      return dbChapter ? {
        number: dbChapter.chapter_number,
        title: dbChapter.title,
        content: dbChapter.content
      } : null
    })
  }

  const [chapters, setChapters] = useState<any[]>(initChapters())
  const [generatingChapter, setGeneratingChapter] = useState<number | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number>(0)
  const [saving, setSaving] = useState(false)

  const handleGenerateChapter = async (chapterNumber: number) => {
    if (!project.outline) {
      alert('Vui lòng tạo dàn ý trước')
      return
    }

    setGeneratingChapter(chapterNumber)
    try {
      console.log('[Step3] Generating chapter', chapterNumber)
      const result = await window.electronAPI.generateChapterContent({
        outline: project.outline,
        chapterNumber: chapterNumber + 1,
        style: 'storytelling',
        tone: 'friendly'
      })

      if (result.success) {
        const newChapter = {
          number: chapterNumber + 1,
          title: project.outline.chapters[chapterNumber].title,
          content: result.data
        }

        // Save to database immediately
        await window.electronAPI.saveChapter({
          projectId: project.id,
          chapterNumber: chapterNumber + 1,
          title: newChapter.title,
          content: newChapter.content
        })

        // Update UI state
        const updatedChapters = [...chapters]
        updatedChapters[chapterNumber] = newChapter
        setChapters(updatedChapters)

        // Check if all chapters are generated
        const allGenerated = project.outline.chapters.every(
          (_: any, idx: number) => idx === chapterNumber || updatedChapters[idx]?.content
        )

        // Update project status if all chapters are done
        if (allGenerated) {
          await window.electronAPI.updateProject({
            id: project.id,
            status: 'content_generated'
          })
        }

        // Reload project data
        await onUpdate()
        console.log('[Step3] Chapter generated and saved')
      }
    } catch (error: any) {
      console.error('[Step3] Error generating chapter:', error)
      alert(`Lỗi: ${error.message || 'Không thể tạo nội dung'}`)
    } finally {
      setGeneratingChapter(null)
    }
  }

  const handleGenerateAll = async () => {
    if (!project.outline?.chapters) return

    for (let i = 0; i < project.outline.chapters.length; i++) {
      if (!chapters[i]?.content) {
        await handleGenerateChapter(i)
      }
    }
  }

  const allChaptersGenerated = project.outline?.chapters?.every(
    (_: any, index: number) => chapters[index]?.content
  )

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Save all existing chapters
      for (let i = 0; i < chapters.length; i++) {
        if (chapters[i]?.content) {
          await window.electronAPI.saveChapter({
            projectId: project.id,
            chapterNumber: i + 1,
            title: chapters[i].title,
            content: chapters[i].content
          })
        }
      }

      // Update project status if all done
      if (allChaptersGenerated) {
        await window.electronAPI.updateProject({
          id: project.id,
          status: 'content_generated'
        })
      }

      await onUpdate()
      alert('Đã lưu tất cả nội dung!')
    } catch (error: any) {
      console.error('[Step3] Error saving:', error)
      alert(`Lỗi khi lưu: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <FileEdit className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Bước 3: Viết nội dung chi tiết
            </h2>
            <p className="text-slate-400">
              AI sẽ viết nội dung đầy đủ cho từng chương
            </p>
          </div>
        </div>

        {!project.outline ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              Vui lòng hoàn thành Bước 2 (Tạo dàn ý) trước
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chapter List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Các chương ({chapters.filter(c => c?.content).length}/{project.outline.chapters.length})
                </h3>
                {!allChaptersGenerated && (
                  <button
                    onClick={handleGenerateAll}
                    disabled={generatingChapter !== null}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <Play className="w-3 h-3" />
                    Tạo tất cả
                  </button>
                )}
              </div>

              {project.outline.chapters.map((chapter: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedChapter === index
                      ? 'bg-primary-600/20 border-primary-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedChapter(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white mb-1 truncate">{chapter.title}</h5>
                      {chapters[index]?.content && (
                        <div className="flex items-center gap-1 text-xs text-green-400">
                          <Check className="w-3 h-3" />
                          <span>Đã tạo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chapter Content */}
            <div className="lg:col-span-2 space-y-4">
              {project.outline.chapters[selectedChapter] && (
                <>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-xl font-bold text-white mb-2">
                      Chương {selectedChapter + 1}: {project.outline.chapters[selectedChapter].title}
                    </h4>
                    <p className="text-sm text-slate-400">
                      {project.outline.chapters[selectedChapter].summary}
                    </p>
                  </div>

                  {chapters[selectedChapter]?.content ? (
                    <div className="bg-slate-700/30 rounded-lg p-6">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {chapters[selectedChapter].content}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-600">
                        <button
                          onClick={() => handleGenerateChapter(selectedChapter)}
                          disabled={generatingChapter !== null}
                          className="btn-secondary"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Tạo lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-700/30 rounded-lg p-12 text-center">
                      <p className="text-slate-400 mb-4">
                        Chương này chưa có nội dung
                      </p>
                      <button
                        onClick={() => handleGenerateChapter(selectedChapter)}
                        disabled={generatingChapter !== null}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        {generatingChapter === selectedChapter ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tạo nội dung...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Tạo nội dung với AI
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Save and Navigation Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex gap-3">
            {/* Save button - always visible if any content exists */}
            {chapters.some(ch => ch?.content) && (
              <button
                onClick={handleSaveAll}
                disabled={saving || generatingChapter !== null}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Lưu tất cả
                  </>
                )}
              </button>
            )}

            {/* Next button - only visible when all chapters are done */}
            {allChaptersGenerated && (
              <button
                onClick={onNext}
                disabled={saving || generatingChapter !== null}
                className="btn-primary flex-1 text-lg py-3"
              >
                Tiếp tục sang Bước 4
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
