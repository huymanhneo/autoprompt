import { useState, useEffect } from 'react'
import { Save, Key, Mic, Brain, Music } from 'lucide-react'

interface Settings {
  llm: {
    provider: 'gemini' | 'openai' | 'claude'
    apiKey: string
    model: string
    temperature: number
  }
  tts: {
    provider: 'google' | 'elevenlabs' | 'fpt' | 'viettel'
    apiKey: string
    voice: string
  }
  audio: {
    defaultSegmentDuration: number
    defaultBitrate: string
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.getSettings()
      setSettings(result)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await window.electronAPI.updateSettings(settings)
      alert('Đã lưu cài đặt thành công!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Lỗi khi lưu cài đặt')
    } finally {
      setSaving(false)
    }
  }

  if (!settings) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cài đặt</h1>
        <p className="text-slate-400">
          Cấu hình API keys và tùy chỉnh các thông số hệ thống
        </p>
      </div>

      <div className="space-y-6">
        {/* LLM Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-white">
              Cài đặt AI tạo nội dung (LLM)
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Provider</label>
              <select
                className="input"
                value={settings.llm.provider}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    llm: {
                      ...settings.llm,
                      provider: e.target.value as any,
                    },
                  })
                }
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Anthropic Claude</option>
              </select>
            </div>

            <div>
              <label className="label flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key
              </label>
              <input
                type="password"
                className="input font-mono"
                value={settings.llm.apiKey}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    llm: { ...settings.llm, apiKey: e.target.value },
                  })
                }
                placeholder="Nhập API key của bạn"
              />
            </div>

            <div>
              <label className="label">Model</label>
              <input
                type="text"
                className="input"
                value={settings.llm.model}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    llm: { ...settings.llm, model: e.target.value },
                  })
                }
                placeholder="VD: gemini-1.5-flash"
              />
            </div>

            <div>
              <label className="label">Temperature: {settings.llm.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.llm.temperature}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    llm: {
                      ...settings.llm,
                      temperature: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Chính xác (0)</span>
                <span>Sáng tạo (2)</span>
              </div>
            </div>
          </div>
        </div>

        {/* TTS Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-white">
              Cài đặt Text-to-Speech
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Provider</label>
              <select
                className="input"
                value={settings.tts.provider}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tts: {
                      ...settings.tts,
                      provider: e.target.value as any,
                    },
                  })
                }
              >
                <option value="google">Google TTS (Miễn phí)</option>
                <option value="elevenlabs">ElevenLabs (Trả phí)</option>
                <option value="fpt">FPT AI (Miễn phí)</option>
                <option value="viettel">Viettel AI (Miễn phí)</option>
              </select>
            </div>

            {settings.tts.provider !== 'google' && (
              <div>
                <label className="label flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </label>
                <input
                  type="password"
                  className="input font-mono"
                  value={settings.tts.apiKey}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      tts: { ...settings.tts, apiKey: e.target.value },
                    })
                  }
                  placeholder="Nhập API key (nếu có)"
                />
              </div>
            )}

            <div>
              <label className="label">Giọng đọc mặc định</label>
              <input
                type="text"
                className="input"
                value={settings.tts.voice}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tts: { ...settings.tts, voice: e.target.value },
                  })
                }
                placeholder="VD: vi-VN-Standard-A"
              />
            </div>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-white">Cài đặt Audio</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                Độ dài mặc định của mỗi cảnh (giây)
              </label>
              <input
                type="number"
                className="input"
                value={settings.audio.defaultSegmentDuration}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    audio: {
                      ...settings.audio,
                      defaultSegmentDuration: parseInt(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div>
              <label className="label">Bitrate mặc định</label>
              <select
                className="input"
                value={settings.audio.defaultBitrate}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    audio: {
                      ...settings.audio,
                      defaultBitrate: e.target.value,
                    },
                  })
                }
              >
                <option value="128k">128 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="256k">256 kbps</option>
                <option value="320k">320 kbps</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu cài đặt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
