import { Check } from 'lucide-react'

interface Step {
  number: number
  title: string
}

const steps: Step[] = [
  { number: 1, title: 'Khởi tạo' },
  { number: 2, title: 'Dàn ý' },
  { number: 3, title: 'Nội dung' },
  { number: 4, title: 'TTS' },
  { number: 5, title: 'Ghép Audio' },
  { number: 6, title: 'Chia cảnh' },
  { number: 7, title: 'Core Prompts' },
  { number: 8, title: 'Video Prompts' },
]

interface StepIndicatorProps {
  currentStep: number
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 overflow-x-auto">
      <div className="flex items-center gap-2 min-w-max">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                  ${
                    step.number < currentStep
                      ? 'bg-green-600 text-white'
                      : step.number === currentStep
                      ? 'bg-primary-600 text-white ring-4 ring-primary-600/20'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}
              >
                {step.number < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-xs text-slate-500">Bước {step.number}</span>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-3 transition-all ${
                  step.number < currentStep ? 'bg-green-600' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
