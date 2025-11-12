import { useState } from 'react'
import { FileText, Lightbulb, Upload, ArrowRight } from 'lucide-react'

interface Step1Props {
  project: any
  onNext: () => void
  onUpdate: () => void
}

export default function Step1ProjectInit({ project, onNext, onUpdate }: Step1Props) {
  const [mode] = useState<'idea' | 'script'>(project.mode)
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    setLoading(true)
    try {
      // Update project status
      await window.electronAPI.updateProject({
        id: project.id,
        status: 'outline_generated',
      })
      onUpdate()
      onNext()
    } catch (error) {
      console.error('Error:', error)
      alert('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-4">Khởi tạo dự án</h2>
        <p className="text-slate-400 mb-6">
          Dự án đã được khởi tạo với chế độ:{' '}
          <strong className="text-primary-400">
            {mode === 'idea' ? 'Từ ý tưởng' : 'Từ kịch bản'}
          </strong>
        </p>

        <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
          {mode === 'idea' ? (
            <div className="flex items-start gap-4">
              <Lightbulb className="w-8 h-8 text-yellow-500 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Chế độ: Từ ý tưởng
                </h3>
                <p className="text-slate-300 mb-4">
                  AI sẽ tự động tạo dàn ý truyện dựa trên ý tưởng của bạn. Sau đó sẽ
                  viết nội dung chi tiết cho từng chương.
                </p>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-sm text-slate-400 mb-1">Mô tả dự án:</div>
                  <div className="text-white">{project.description}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Chế độ: Từ kịch bản
                </h3>
                <p className="text-slate-300 mb-4">
                  Tải lên file kịch bản có sẵn. Phần mềm sẽ tự động chia thành các
                  chương và chuyển sang bước xử lý âm thanh.
                </p>
                <button className="btn-secondary flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Tải lên kịch bản
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              'Đang xử lý...'
            ) : (
              <>
                Tiếp tục
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
