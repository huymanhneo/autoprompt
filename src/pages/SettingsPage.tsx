import { useState, useEffect } from 'react'
import { Save, Key, Mic, Brain, Music, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Globe } from 'lucide-react'

interface APIKeyConfig {
  id: string
  name: string
  key: string
  proxy?: string
  enabled: boolean
  lastUsed?: string
  requestCount?: number
}

interface Settings {
  llm: {
    provider: 'gemini' | 'openai' | 'claude'
    apiKeys: APIKeyConfig[]
    model: string
    temperature: number
    rotationStrategy: 'round-robin' | 'random' | 'fallback'
  }
  tts: {
    provider: 'google' | 'gemini' | 'viettts' | 'elevenlabs' | 'fpt' | 'viettel'
    apiKey: string
    googleCredentialsPath?: string
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
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [showAddKey, setShowAddKey] = useState(false)
  const [newKey, setNewKey] = useState<Partial<APIKeyConfig>>({
    name: '',
    key: '',
    proxy: '',
    enabled: true,
  })

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

  const handleSelectGoogleCredentials = async () => {
    try {
      const result = await window.electronAPI.selectGoogleCredentials()
      if (result.success && result.path) {
        const updatedSettings = {
          ...settings!,
          tts: {
            ...settings!.tts,
            googleCredentialsPath: result.path,
          },
        }

        setSettings(updatedSettings)

        // Auto-save settings after uploading credentials
        await window.electronAPI.updateSettings(updatedSettings)

        alert('✅ Đã tải lên và lưu credentials file thành công!')
      }
    } catch (error) {
      console.error('Error selecting credentials:', error)
      alert('❌ Lỗi khi chọn credentials file: ' + error)
    }
  }

  const handleAddKey = () => {
    if (!newKey.name || !newKey.key) {
      alert('Vui lòng nhập tên và API key')
      return
    }

    const apiKeyConfig: APIKeyConfig = {
      id: crypto.randomUUID(),
      name: newKey.name,
      key: newKey.key,
      proxy: newKey.proxy || undefined,
      enabled: newKey.enabled !== false,
      requestCount: 0,
    }

    setSettings({
      ...settings!,
      llm: {
        ...settings!.llm,
        apiKeys: [...settings!.llm.apiKeys, apiKeyConfig],
      },
    })

    setNewKey({ name: '', key: '', proxy: '', enabled: true })
    setShowAddKey(false)
  }

  const handleDeleteKey = (keyId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa API key này?')) return

    setSettings({
      ...settings!,
      llm: {
        ...settings!.llm,
        apiKeys: settings!.llm.apiKeys.filter((k) => k.id !== keyId),
      },
    })
  }

  const handleToggleKey = (keyId: string) => {
    setSettings({
      ...settings!,
      llm: {
        ...settings!.llm,
        apiKeys: settings!.llm.apiKeys.map((k) =>
          k.id === keyId ? { ...k, enabled: !k.enabled } : k
        ),
      },
    })
  }

  const handleUpdateKey = (keyId: string, updates: Partial<APIKeyConfig>) => {
    setSettings({
      ...settings!,
      llm: {
        ...settings!.llm,
        apiKeys: settings!.llm.apiKeys.map((k) =>
          k.id === keyId ? { ...k, ...updates } : k
        ),
      },
    })
    setEditingKey(null)
  }

  if (!settings) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Cài đặt</h1>
        <p className="text-slate-400">
          Cấu hình API keys và tùy chỉnh các thông số hệ thống
        </p>
      </div>

      <div className="space-y-6">
        {/* LLM Settings - API Keys Management */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-primary-500" />
            <h2 className="text-xl font-semibold text-white">
              Quản lý API Keys (LLM)
            </h2>
          </div>

          {/* API Keys List */}
          <div className="space-y-4 mb-6">
            {settings.llm.apiKeys.length === 0 ? (
              <div className="bg-slate-700/30 rounded-lg p-6 text-center">
                <Key className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">Chưa có API key nào</p>
                <button
                  onClick={() => setShowAddKey(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm API Key đầu tiên
                </button>
              </div>
            ) : (
              <>
                {settings.llm.apiKeys.map((keyConfig) => (
                  <div
                    key={keyConfig.id}
                    className={`bg-slate-700/30 rounded-lg p-4 border-2 transition-colors ${
                      keyConfig.enabled
                        ? 'border-primary-600/40'
                        : 'border-slate-600/30'
                    }`}
                  >
                    {editingKey === keyConfig.id ? (
                      // Edit Mode
                      <div className="space-y-3">
                        <div>
                          <label className="label text-xs">Tên gợi nhớ</label>
                          <input
                            type="text"
                            className="input text-sm"
                            value={keyConfig.name}
                            onChange={(e) =>
                              handleUpdateKey(keyConfig.id, { name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="label text-xs">API Key</label>
                          <input
                            type="password"
                            className="input font-mono text-sm"
                            value={keyConfig.key}
                            onChange={(e) =>
                              handleUpdateKey(keyConfig.id, { key: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label className="label text-xs flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Proxy (Tùy chọn)
                          </label>
                          <input
                            type="text"
                            className="input font-mono text-sm"
                            value={keyConfig.proxy || ''}
                            onChange={(e) =>
                              handleUpdateKey(keyConfig.id, {
                                proxy: e.target.value || undefined,
                              })
                            }
                            placeholder="http://proxy:port hoặc http://user:pass@proxy:port"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingKey(null)}
                            className="btn-secondary text-sm px-3 py-1"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="btn-primary text-sm px-3 py-1"
                          >
                            Xong
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-white text-sm">
                              {keyConfig.name}
                            </h3>
                            {keyConfig.proxy && (
                              <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                Proxy
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-slate-400 truncate mb-2">
                            {keyConfig.key.substring(0, 20)}...
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>
                              Requests: {keyConfig.requestCount || 0}
                            </span>
                            {keyConfig.lastUsed && (
                              <span>
                                Dùng lần cuối:{' '}
                                {new Date(keyConfig.lastUsed).toLocaleString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleKey(keyConfig.id)}
                            className="p-2 hover:bg-slate-600/30 rounded transition-colors"
                            title={keyConfig.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {keyConfig.enabled ? (
                              <ToggleRight className="w-5 h-5 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingKey(keyConfig.id)}
                            className="p-2 hover:bg-slate-600/30 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteKey(keyConfig.id)}
                            className="p-2 hover:bg-red-600/30 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add New Key Button */}
                {!showAddKey && (
                  <button
                    onClick={() => setShowAddKey(true)}
                    className="w-full bg-slate-700/30 hover:bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm API Key mới
                  </button>
                )}
              </>
            )}

            {/* Add New Key Form */}
            {showAddKey && (
              <div className="bg-slate-700/30 rounded-lg p-4 border-2 border-primary-600/40">
                <h3 className="font-semibold text-white mb-3">Thêm API Key mới</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label text-xs">Tên gợi nhớ *</label>
                    <input
                      type="text"
                      className="input text-sm"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      placeholder="VD: Key chính, Key backup..."
                    />
                  </div>
                  <div>
                    <label className="label text-xs">API Key *</label>
                    <input
                      type="password"
                      className="input font-mono text-sm"
                      value={newKey.key}
                      onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                      placeholder="AIza..."
                    />
                  </div>
                  <div>
                    <label className="label text-xs flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Proxy (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      className="input font-mono text-sm"
                      value={newKey.proxy}
                      onChange={(e) => setNewKey({ ...newKey, proxy: e.target.value })}
                      placeholder="http://proxy:port"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Hỗ trợ format: http://proxy:port hoặc http://user:pass@proxy:port
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newKeyEnabled"
                      checked={newKey.enabled !== false}
                      onChange={(e) => setNewKey({ ...newKey, enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="newKeyEnabled" className="text-sm text-slate-300">
                      Kích hoạt ngay
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => {
                        setShowAddKey(false)
                        setNewKey({ name: '', key: '', proxy: '', enabled: true })
                      }}
                      className="btn-secondary text-sm"
                    >
                      Hủy
                    </button>
                    <button onClick={handleAddKey} className="btn-primary text-sm">
                      <Plus className="w-4 h-4 inline mr-1" />
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LLM Provider and Model Settings */}
          <div className="space-y-4 pt-6 border-t border-slate-700">
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
              <label className="label">Model</label>
              <select
                className="input"
                value={settings.llm.model}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    llm: { ...settings.llm, model: e.target.value },
                  })
                }
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng)</option>
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Nhanh nhất)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Mạnh nhất)</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
              </select>
            </div>

            <div>
              <label className="label">Chiến lược Rotation</label>
              <select
                className="input"
                value={settings.llm.rotationStrategy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    llm: {
                      ...settings.llm,
                      rotationStrategy: e.target.value as any,
                    },
                  })
                }
              >
                <option value="round-robin">Round Robin - Luân phiên tuần tự</option>
                <option value="random">Random - Chọn ngẫu nhiên</option>
                <option value="fallback">Fallback - Dùng key đầu, key khác dự phòng</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {settings.llm.rotationStrategy === 'round-robin' &&
                  'Sử dụng các key theo thứ tự, phân bổ đều tải'}
                {settings.llm.rotationStrategy === 'random' &&
                  'Chọn ngẫu nhiên key mỗi lần request'}
                {settings.llm.rotationStrategy === 'fallback' &&
                  'Luôn dùng key đầu tiên, tự động chuyển sang key khác nếu bị lỗi/limit'}
              </p>
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
                <option value="gemini">Gemini TTS (Đơn giản - Chỉ API key, Tiếng Anh)</option>
                <option value="viettts">VietTTS (Miễn phí - Open Source, Offline, Tiếng Việt tự nhiên)</option>
                <option value="google">Google Cloud TTS (Phức tạp - Service Account, Tiếng Việt)</option>
                <option value="elevenlabs">ElevenLabs (Trả phí - Chất lượng cao)</option>
                <option value="fpt">FPT AI (Miễn phí - API, Tiếng Việt)</option>
                <option value="viettel">Viettel AI (Miễn phí - API, Tiếng Việt)</option>
              </select>
            </div>

            {settings.tts.provider === 'viettts' ? (
              <div>
                <label className="label flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  VietTTS - Open Source Offline
                  <span className="text-xs text-green-400">(Miễn phí - Không cần API key)</span>
                </label>

                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-xs text-slate-400 space-y-3">
                  <p className="font-semibold text-slate-300 mb-2">📦 Cài đặt VietTTS:</p>

                  <div className="bg-slate-800/50 rounded p-2 font-mono text-xs space-y-1">
                    <p className="text-green-400"># Bước 1: Cài Git (nếu chưa có)</p>
                    <p className="text-slate-400"># Windows: https://git-scm.com/download/win</p>
                    <p className="text-green-400 mt-2"># Bước 2: Clone VietTTS từ GitHub</p>
                    <p className="text-white">git clone https://github.com/NTT123/vietTTS.git</p>
                    <p className="text-white">cd vietTTS</p>
                    <p className="text-green-400 mt-2"># Bước 3: Cài đặt</p>
                    <p className="text-white">pip install -e .</p>
                    <p className="text-white">pip install soundfile</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-300">✨ Ưu điểm:</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>✅ Hoàn toàn miễn phí & Open Source</li>
                      <li>✅ Chạy offline - Không cần internet sau khi cài</li>
                      <li>✅ Giọng Việt tự nhiên - Nhiều giọng Bắc/Nam/Trung</li>
                      <li>✅ Không giới hạn sử dụng</li>
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-slate-300">⚠️ Lưu ý:</p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>Cần cài Python trên máy</li>
                      <li>Lần đầu chạy sẽ tải models (~500MB)</li>
                      <li>Chạy chậm hơn API (nhưng miễn phí!)</li>
                      <li>Khuyên dùng GPU (CPU cũng được nhưng rất chậm)</li>
                    </ul>
                  </div>

                  <p className="text-amber-400 mt-2">
                    💡 Sau khi cài xong, chỉ cần chọn giọng và bấm "Lưu cài đặt"!
                  </p>
                </div>
              </div>
            ) : settings.tts.provider === 'gemini' ? (
              <div>
                <label className="label flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Gemini API Key
                  <span className="text-xs text-green-400">(Đơn giản - Chỉ cần API key)</span>
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
                  placeholder="Nhập Gemini API key"
                />
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mt-3 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300 mb-2">💡 Hướng dẫn lấy Gemini API Key:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Vào <a href="https://aistudio.google.com/apikey" target="_blank" className="text-primary-400 hover:underline">Google AI Studio</a></li>
                    <li>Click "Create API Key" → Chọn project</li>
                    <li>Copy API key và paste vào ô trên</li>
                    <li>Click "Lưu cài đặt" → Xong!</li>
                  </ol>
                  <p className="text-green-400 mt-2">✅ Có thể dùng cùng API key với LLM (nếu đã có)</p>
                </div>
              </div>
            ) : settings.tts.provider === 'google' ? (
              <div>
                <label className="label flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Google Service Account Credentials
                  <span className="text-xs text-amber-400">(Bắt buộc)</span>
                </label>

                <div className="space-y-3">
                  {settings.tts.googleCredentialsPath ? (
                    <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-3">
                      <p className="text-xs text-green-400 mb-1">✓ Credentials file đã được tải lên:</p>
                      <p className="text-xs text-slate-300 font-mono break-all">
                        {settings.tts.googleCredentialsPath}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-3">
                      <p className="text-xs text-amber-400">
                        ⚠️ Chưa có credentials file. Vui lòng upload file JSON từ Google Cloud Console.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSelectGoogleCredentials}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    {settings.tts.googleCredentialsPath ? 'Thay đổi Credentials File' : 'Upload Credentials File'}
                  </button>

                  <div className="bg-slate-700/30 rounded-lg p-3 text-xs text-slate-400 space-y-2">
                    <p className="font-semibold text-slate-300">📖 Hướng dẫn chi tiết:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li><strong>Enable API:</strong> Vào <a href="https://console.cloud.google.com/apis/library/texttospeech.googleapis.com" target="_blank" className="text-primary-400 hover:underline">Cloud Text-to-Speech API</a> → Enable</li>
                      <li><strong>Tạo Service Account:</strong> <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" className="text-primary-400 hover:underline">IAM & Admin → Service Accounts</a></li>
                      <li>Click "Create Service Account" → Đặt tên (VD: tts-service) → Create and Continue</li>
                      <li><strong>Grant role:</strong> Chọn "Editor" hoặc "Owner" (nếu không thấy role TTS cụ thể) → Continue → Done</li>
                      <li><strong>Tạo Key:</strong> Click vào Service Account vừa tạo → Tab "Keys" → Add Key → Create new key</li>
                      <li>Chọn <strong>JSON</strong> → Create → File JSON sẽ tự động download</li>
                      <li><strong>Upload:</strong> Click nút "Upload Credentials File" bên trên và chọn file JSON vừa download</li>
                    </ol>
                    <p className="text-amber-400 mt-2">💡 Tip: Nếu không tìm thấy role "Cloud Text-to-Speech", chọn role "Editor" - nó có đủ quyền cho TTS.</p>
                  </div>
                </div>
              </div>
            ) : (
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
                  placeholder="Nhập API key"
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
                placeholder={
                  settings.tts.provider === 'gemini'
                    ? 'VD: Puck, Charon, Kore, Fenrir, Aoede'
                    : settings.tts.provider === 'viettts'
                    ? 'VD: northern_female_1, southern_male_1'
                    : settings.tts.provider === 'google'
                    ? 'VD: vi-VN-Standard-A'
                    : 'VD: leminh, banmai'
                }
              />
              {settings.tts.provider === 'gemini' && (
                <p className="text-xs text-slate-400 mt-1">
                  💡 Giọng Gemini: Puck, Charon (Nam) | Kore, Aoede (Nữ) | Fenrir (Mạnh mẽ)
                </p>
              )}
              {settings.tts.provider === 'viettts' && (
                <p className="text-xs text-slate-400 mt-1">
                  💡 Giọng VietTTS: northern_female_1, northern_male_1 (Bắc) | southern_female_1, southern_male_1 (Nam) | central_female_1 (Trung)
                </p>
              )}
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
