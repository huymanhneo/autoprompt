import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

// Import step components (will be created later)
import StepIndicator from '../components/project/StepIndicator'
import Step1ProjectInit from '../components/project/Step1ProjectInit'
import Step2OutlineGenerator from '../components/project/Step2OutlineGenerator'
import Step3ContentWriter from '../components/project/Step3ContentWriter'
import Step4TTSGenerator from '../components/project/Step4TTSGenerator'
import Step5AudioMerger from '../components/project/Step5AudioMerger'
import Step6SceneSplitter from '../components/project/Step6SceneSplitter'
import Step7CorePrompts from '../components/project/Step7CorePrompts'
import Step8VideoPrompts from '../components/project/Step8VideoPrompts'

export default function ProjectPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      const result = await window.electronAPI.getProject(projectId!)
      if (result.success) {
        setProject(result.data)
        // Determine current step based on project status
        const stepMap: Record<string, number> = {
          initializing: 1,
          outline_generated: 2,
          content_generated: 3,
          audio_generated: 4,
          scenes_split: 6,
          prompts_generated: 8,
        }
        setCurrentStep(stepMap[result.data.status] || 1)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Không tìm thấy dự án
          </h2>
          <p className="text-slate-400">Dự án có thể đã bị xóa hoặc không tồn tại</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-white mb-2">{project.name}</h1>
        <p className="text-slate-400">{project.description}</p>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step Content */}
      <div className="flex-1 overflow-auto p-6">
        {currentStep === 1 && (
          <Step1ProjectInit
            project={project}
            onNext={() => setCurrentStep(2)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 2 && (
          <Step2OutlineGenerator
            project={project}
            onNext={() => setCurrentStep(3)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 3 && (
          <Step3ContentWriter
            project={project}
            onNext={() => setCurrentStep(4)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 4 && (
          <Step4TTSGenerator
            project={project}
            onNext={() => setCurrentStep(5)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 5 && (
          <Step5AudioMerger
            project={project}
            onNext={() => setCurrentStep(6)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 6 && (
          <Step6SceneSplitter
            project={project}
            onNext={() => setCurrentStep(7)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 7 && (
          <Step7CorePrompts
            project={project}
            onNext={() => setCurrentStep(8)}
            onUpdate={loadProject}
          />
        )}
        {currentStep === 8 && (
          <Step8VideoPrompts
            project={project}
            onNext={() => alert('Hoàn thành!')}
            onUpdate={loadProject}
          />
        )}
      </div>
    </div>
  )
}
