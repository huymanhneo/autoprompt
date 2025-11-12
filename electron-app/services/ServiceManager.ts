import Store from 'electron-store'
import { LLMService } from './llm/LLMService'
import { TTSService } from './tts/TTSService'
import { AudioService } from './audio/AudioService'
import { StorageService } from './storage/StorageService'

export interface AppSettings {
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
    apiKey: '',
    model: 'gemini-pro',
    temperature: 0.7,
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

  constructor() {
    this.store = new Store<AppSettings>({
      defaults: defaultSettings,
    })

    // Initialize services
    this.audioService = new AudioService()
    this.storageService = new StorageService()

    // Initialize LLM and TTS with settings
    this.initializeLLM()
    this.initializeTTS()
  }

  private initializeLLM() {
    const settings = this.store.get('llm')
    if (settings.apiKey) {
      this.llmService = new LLMService({
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        temperature: settings.temperature,
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

  // ===== SETTINGS =====

  getSettings(): AppSettings {
    return this.store.store
  }

  updateSettings(settings: Partial<AppSettings>): void {
    if (settings.llm) {
      this.store.set('llm', { ...this.store.get('llm'), ...settings.llm })
      this.initializeLLM()
    }

    if (settings.tts) {
      this.store.set('tts', { ...this.store.get('tts'), ...settings.tts })
      this.initializeTTS()
    }

    if (settings.audio) {
      this.store.set('audio', { ...this.store.get('audio'), ...settings.audio })
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
