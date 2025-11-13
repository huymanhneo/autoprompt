import Store from 'electron-store'
import { LLMService } from './llm/LLMService'
import { TTSService } from './tts/TTSService'
import { AudioService } from './audio/AudioService'
import { StorageService } from './storage/StorageService'
import { AudioTranscriberService } from './transcriber/AudioTranscriberService'
import { v4 as uuidv4 } from 'uuid'

export interface APIKeyConfig {
  id: string
  name: string // Tên gợi nhớ: "Key chính", "Key backup", etc.
  key: string
  proxy?: string // Optional proxy URL (http://proxy:port hoặc http://user:pass@proxy:port)
  enabled: boolean
  lastUsed?: string // ISO timestamp
  requestCount?: number // Số requests đã dùng
}

export interface AppSettings {
  llm: {
    provider: 'gemini' | 'openai' | 'claude'
    apiKeys: APIKeyConfig[] // CHANGED: from single apiKey to multiple apiKeys
    model: string
    temperature: number
    rotationStrategy: 'round-robin' | 'random' | 'fallback' // Chiến lược rotation
  }
  tts: {
    provider: 'google' | 'elevenlabs' | 'fpt' | 'viettel'
    apiKey: string // Keep simple for TTS
    voice: string
    speed: number
  }
  audio: {
    defaultSegmentDuration: number
    defaultBitrate: string
  }
}

const defaultSettings: AppSettings = {
  llm: {
    provider: 'gemini',
    apiKeys: [], // Start with empty array, user will add keys
    model: 'gemini-1.5-flash-8b',
    temperature: 0.7,
    rotationStrategy: 'round-robin',
  },
  tts: {
    provider: 'google',
    apiKey: '',
    voice: 'vi-VN-Standard-A',
    speed: 1.0,
  },
  audio: {
    defaultSegmentDuration: 8,
    defaultBitrate: '192k',
  },
}

export class ServiceManager {
  private store: Store<AppSettings>
  private llmService: LLMService | null = null
  private ttsService: TTSService | null = null
  private audioService: AudioService
  private storageService: StorageService
  private transcriberService: AudioTranscriberService | null = null

  constructor() {
    this.store = new Store<AppSettings>({
      defaults: defaultSettings,
    })

    // Migrate old settings to new format (if needed)
    this.migrateOldSettings()

    // Initialize services
    this.audioService = new AudioService()
    this.storageService = new StorageService()

    // Initialize LLM and TTS with settings
    this.initializeLLM()
    this.initializeTTS()
    this.initializeTranscriber()
  }

  /**
   * Migrate old single API key format to new multiple keys format
   */
  private migrateOldSettings() {
    const settings = this.store.store as any

    // Check if old format exists (single apiKey instead of apiKeys array)
    if (settings.llm && typeof settings.llm.apiKey === 'string') {
      console.log('[ServiceManager] Migrating old settings format to new format')

      const oldApiKey = settings.llm.apiKey

      // Create new format with single key
      const newLLMSettings = {
        ...settings.llm,
        apiKeys: oldApiKey
          ? [
              {
                id: uuidv4(),
                name: 'API Key chính',
                key: oldApiKey,
                enabled: true,
                requestCount: 0,
              } as APIKeyConfig,
            ]
          : [],
        rotationStrategy: 'round-robin' as const,
      }

      // Remove old apiKey field
      delete newLLMSettings.apiKey

      // Save migrated settings
      this.store.set('llm', newLLMSettings as any)
      console.log('[ServiceManager] Migration completed successfully')
    }
  }

  private initializeTranscriber() {
    const settings = this.store.get('llm')
    // Use first enabled API key for Google Speech-to-Text
    const firstKey = settings.apiKeys.find((k) => k.enabled)
    if (firstKey) {
      this.transcriberService = new AudioTranscriberService(firstKey.key, firstKey.proxy)
    }
  }

  private initializeLLM() {
    const settings = this.store.get('llm')
    // Initialize with all enabled API keys
    const enabledKeys = settings.apiKeys.filter((k) => k.enabled)
    if (enabledKeys.length > 0) {
      this.llmService = new LLMService({
        provider: settings.provider,
        apiKeys: enabledKeys, // Pass all enabled keys
        model: settings.model,
        temperature: settings.temperature,
        rotationStrategy: settings.rotationStrategy,
      })
    }
  }

  private initializeTTS() {
    const settings = this.store.get('tts')
    this.ttsService = new TTSService({
      provider: settings.provider,
      apiKey: settings.apiKey,
      voice: settings.voice,
      speed: settings.speed,
    })
  }

  // ===== GETTERS =====

  getLLMService(): LLMService {
    if (!this.llmService) {
      throw new Error('LLM Service not initialized. Please configure API key in settings.')
    }
    return this.llmService
  }

  getTTSService(): TTSService {
    if (!this.ttsService) {
      throw new Error('TTS Service not initialized.')
    }
    return this.ttsService
  }

  getAudioService(): AudioService {
    return this.audioService
  }

  getStorageService(): StorageService {
    return this.storageService
  }

  getTranscriberService(): AudioTranscriberService {
    if (!this.transcriberService) {
      throw new Error('Transcriber Service not initialized. Please configure API key in settings.')
    }
    return this.transcriberService
  }

  // ===== SETTINGS =====

  getSettings(): AppSettings {
    return this.store.store
  }

  updateSettings(settings: Partial<AppSettings>): void {
    try {
      console.log('[ServiceManager] Updating settings:', settings)

      if (settings.llm) {
        const currentLLM = this.store.get('llm')
        const newLLM = { ...currentLLM, ...settings.llm }
        console.log('[ServiceManager] Saving LLM settings:', newLLM)
        this.store.set('llm', newLLM)
        this.initializeLLM()
        this.initializeTranscriber() // Transcriber uses same API key as LLM
      }

      if (settings.tts) {
        const currentTTS = this.store.get('tts')
        const newTTS = { ...currentTTS, ...settings.tts }
        console.log('[ServiceManager] Saving TTS settings:', newTTS)
        this.store.set('tts', newTTS)
        this.initializeTTS()
      }

      if (settings.audio) {
        const currentAudio = this.store.get('audio')
        const newAudio = { ...currentAudio, ...settings.audio }
        console.log('[ServiceManager] Saving Audio settings:', newAudio)
        this.store.set('audio', newAudio)
      }

      console.log('[ServiceManager] Settings updated successfully')
    } catch (error: any) {
      console.error('[ServiceManager] Error updating settings:', error)
      throw new Error(`Failed to update settings: ${error.message}`)
    }
  }

  // ===== CLEANUP =====

  cleanup(): void {
    this.storageService.close()
  }
}

// Singleton instance
let serviceManagerInstance: ServiceManager | null = null

export function getServiceManager(): ServiceManager {
  if (!serviceManagerInstance) {
    serviceManagerInstance = new ServiceManager()
  }
  return serviceManagerInstance
}

export function cleanupServiceManager(): void {
  if (serviceManagerInstance) {
    serviceManagerInstance.cleanup()
    serviceManagerInstance = null
  }
}
