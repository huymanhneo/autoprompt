import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderOpen, Trash2, Calendar } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const result = await window.electronAPI.listProjects()
      if (result.success) {
        setProjects(result.data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Bạn có chắc muốn xóa dự án này?')) return

    try {
      await window.electronAPI.deleteProject(projectId)
      loadProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Lỗi khi xóa dự án')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      initializing: 'Đang khởi tạo',
      outline_generated: 'Đã tạo dàn ý',
      content_generated: 'Đã tạo nội dung',
      audio_generated: 'Đã tạo âm thanh',
      scenes_split: 'Đã chia cảnh',
      prompts_generated: 'Đã tạo prompts',
      completed: 'Hoàn thành',
    }
    return statusMap[status] || status
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Dự án của bạn</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Quản lý và tạo các dự án video YouTube tự động
          </p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-lg shadow-lg shadow-primary-500/50 hover:shadow-primary-500/70 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Dự án mới
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            Chưa có dự án nào
          </h3>
          <p className="text-slate-400 mb-6">
            Tạo dự án đầu tiên để bắt đầu sản xuất video
          </p>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="btn-primary"
          >
            Tạo dự án đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card hover:border-primary-500 transition-all cursor-pointer group"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-primary-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteProject(project.id)
                  }}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Calendar className="w-3 h-3" />
                {formatDate(project.createdAt)}
              </div>

              <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-600/20 text-primary-400 border border-primary-600/30">
                {getStatusText(project.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreated={(projectId) => {
            setShowNewProjectModal(false)
            navigate(`/project/${projectId}`)
          }}
        />
      )}
    </div>
  )
}

// New Project Modal Component
function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (projectId: string) => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mode: 'idea' as 'idea' | 'script',
    workingDirectory: '',
  })

  const handleSelectDirectory = async () => {
    const dir = await window.electronAPI.selectDirectory()
    if (dir) {
      setFormData({ ...formData, workingDirectory: dir })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.workingDirectory) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const result = await window.electronAPI.createProject(formData)
      if (result.success) {
        onCreated(result.data.id)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Lỗi khi tạo dự án')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Tạo dự án mới</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Tên dự án</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Video câu chuyện cổ tích Việt Nam"
            />
          </div>

          <div>
            <label className="label">Mô tả ngắn</label>
            <textarea
              className="input"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn gọn về dự án của bạn"
            />
          </div>

          <div>
            <label className="label">Chế độ tạo nội dung</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`p-4 rounded-lg border transition-all ${
                  formData.mode === 'idea'
                    ? 'bg-primary-600 border-primary-500'
                    : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setFormData({ ...formData, mode: 'idea' })}
              >
                <div className="font-medium mb-1">Từ ý tưởng</div>
                <div className="text-xs text-slate-300">
                  AI sẽ tạo dàn ý và nội dung
                </div>
              </button>

              <button
                type="button"
                className={`p-4 rounded-lg border transition-all ${
                  formData.mode === 'script'
                    ? 'bg-primary-600 border-primary-500'
                    : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setFormData({ ...formData, mode: 'script' })}
              >
                <div className="font-medium mb-1">Từ kịch bản</div>
                <div className="text-xs text-slate-300">
                  Tải lên kịch bản có sẵn
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="label">Thư mục lưu dự án</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={formData.workingDirectory}
                readOnly
                placeholder="Chọn thư mục..."
              />
              <button
                type="button"
                onClick={handleSelectDirectory}
                className="btn-secondary"
              >
                Chọn
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Hủy
            </button>
            <button type="submit" className="btn-primary flex-1">
              Tạo dự án
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
