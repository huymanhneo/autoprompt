import { useState } from 'react'
import { Check, Loader2, Sparkles, Key, Mic, Settings as SettingsIcon } from 'lucide-react'

interface SetupWizardProps {
  onComplete: () => void
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    llm: {
      provider: 'gemini' as const,
      apiKey: '',
      model: 'gemini-pro',
      temperature: 0.7,
    },
    tts: {
      provider: 'google' as const,
      apiKey: '',
      voice: 'vi-VN-Standard-A',
      speed: 1.0,
    },
    audio: {
      defaultSegmentDuration: 8,
      defaultBitrate: '192k',
    },
  })

  const handleNext = async () => {
    if (step === 1) {
      if (!config.llm.apiKey) {
        alert('Vui lòng nhập Google Gemini API Key')
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
    } else {
      // Final step - save and complete
      setLoading(true)
      try {
        console.log('Saving settings:', config)
        const result = await window.electronAPI.updateSettings(config)
        console.log('Settings saved successfully:', result)
        setTimeout(() => {
          onComplete()
        }, 1500)
      } catch (error: any) {
        console.error('Error saving settings:', error)
        alert(`Lỗi khi lưu cấu hình:\n${error?.message || error}`)
        setLoading(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="relative max-w-2xl w-full mx-4">
        {/* Welcome Screen */}
        {step === 0 && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <Sparkles className="w-24 h-24 text-primary-500 mx-auto mb-6 animate-bounce" />
              <h1 className="text-5xl font-bold text-white mb-4">
                YouTube Video Automation
              </h1>
              <p className="text-xl text-slate-300">
                Tự động hóa quy trình tạo nội dung video từ A-Z
              </p>
            </div>
            <button onClick={() => setStep(1)} className="btn-primary text-lg px-8 py-4">
              Bắt đầu cài đặt
            </button>
          </div>
        )}

        {/* Setup Steps */}
        {step > 0 && step <= 3 && (
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700 p-8 shadow-2xl">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-400">
                  Bước {step}/3
                </span>
                <span className="text-sm text-primary-400 font-medium">
                  {Math.round((step / 3) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: LLM API Key */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Key className="w-8 h-8 text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Cấu hình AI Content Generation
                  </h2>
                  <p className="text-slate-400">
                    Nhập Google Gemini API key để tạo nội dung tự động
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Provider</label>
                    <select
                      className="input"
                      value={config.llm.provider}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          llm: { ...config.llm, provider: e.target.value as any },
                        })
                      }
                    >
                      <option value="gemini">Google Gemini (Khuyên dùng)</option>
                      <option value="openai">OpenAI (Coming soon)</option>
                      <option value="claude">Claude (Coming soon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">API Key *</label>
                    <input
                      type="password"
                      className="input font-mono"
                      value={config.llm.apiKey}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          llm: { ...config.llm, apiKey: e.target.value },
                        })
                      }
                      placeholder="AIza..."
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Lấy API key tại:{' '}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:underline"
                      >
                        https://makersuite.google.com/app/apikey
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="label">Model</label>
                    <select
                      className="input"
                      value={config.llm.model}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          llm: { ...config.llm, model: e.target.value },
                        })
                      }
                    >
                      <option value="gemini-pro">Gemini Pro</option>
                      <option value="gemini-pro-vision">Gemini Pro Vision</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">
                      Temperature: {config.llm.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.llm.temperature}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          llm: {
                            ...config.llm,
                            temperature: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>Chính xác</span>
                      <span>Sáng tạo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: TTS Configuration */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-8 h-8 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Cấu hình Text-to-Speech
                  </h2>
                  <p className="text-slate-400">
                    Chọn provider chuyển văn bản thành giọng nói
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">Provider</label>
                    <select
                      className="input"
                      value={config.tts.provider}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          tts: { ...config.tts, provider: e.target.value as any },
                        })
                      }
                    >
                      <option value="google">Google TTS (Miễn phí)</option>
                      <option value="elevenlabs">ElevenLabs (Trả phí, chất lượng cao)</option>
                      <option value="fpt">FPT AI (Miễn phí, giọng Việt)</option>
                      <option value="viettel">Viettel AI (Miễn phí, giọng Việt)</option>
                    </select>
                  </div>

                  {config.tts.provider !== 'google' && (
                    <div>
                      <label className="label">API Key (Tùy chọn)</label>
                      <input
                        type="password"
                        className="input font-mono"
                        value={config.tts.apiKey}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            tts: { ...config.tts, apiKey: e.target.value },
                          })
                        }
                        placeholder="Để trống nếu không có"
                      />
                    </div>
                  )}

                  <div>
                    <label className="label">Giọng đọc mặc định</label>
                    <select
                      className="input"
                      value={config.tts.voice}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          tts: { ...config.tts, voice: e.target.value },
                        })
                      }
                    >
                      <option value="vi-VN-Standard-A">Tiếng Việt - Nữ A</option>
                      <option value="vi-VN-Standard-B">Tiếng Việt - Nam B</option>
                      <option value="vi-VN-Standard-C">Tiếng Việt - Nữ C</option>
                      <option value="vi-VN-Standard-D">Tiếng Việt - Nam D</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Tốc độ đọc: {config.tts.speed}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={config.tts.speed}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          tts: { ...config.tts, speed: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Audio Settings */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SettingsIcon className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Cấu hình Audio
                  </h2>
                  <p className="text-slate-400">
                    Điều chỉnh các thông số xử lý audio
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="label">
                      Độ dài mỗi cảnh video (giây)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={config.audio.defaultSegmentDuration}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          audio: {
                            ...config.audio,
                            defaultSegmentDuration: parseInt(e.target.value),
                          },
                        })
                      }
                      min="5"
                      max="30"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Khuyến nghị: 8 giây (phù hợp cho AI video generation)
                    </p>
                  </div>

                  <div>
                    <label className="label">Bitrate Audio</label>
                    <select
                      className="input"
                      value={config.audio.defaultBitrate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          audio: { ...config.audio, defaultBitrate: e.target.value },
                        })
                      }
                    >
                      <option value="128k">128 kbps (Tiêu chuẩn)</option>
                      <option value="192k">192 kbps (Khuyên dùng)</option>
                      <option value="256k">256 kbps (Chất lượng cao)</option>
                      <option value="320k">320 kbps (Studio)</option>
                    </select>
                  </div>

                  <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-green-300 font-medium mb-1">
                          Tất cả đã sẵn sàng!
                        </p>
                        <p className="text-green-400/80">
                          Nhấn "Hoàn tất" để bắt đầu sử dụng ứng dụng
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Quay lại
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : step === 3 ? (
                  'Hoàn tất'
                ) : (
                  'Tiếp tục'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Copyright Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-slate-400 text-sm">
          © 2024 YouTube Video Automation | Phát triển bởi{' '}
          <span className="text-primary-400 font-semibold">
            Mr.Mạnh
          </span>{' '}
          | <a href="tel:0979121097" className="hover:text-primary-300 transition-colors">0979.121.097</a>
        </p>
      </div>
    </div>
  )
}
