import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface TTSConfig {
  provider: 'google' | 'elevenlabs' | 'fpt' | 'viettel'
  apiKey?: string
  voice: string
  speed?: number
}

export interface TTSRequest {
  text: string
  outputPath: string
  voice?: string
  speed?: number
}

export interface TTSVoice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  preview?: string
}

export class TTSService {
  private config: TTSConfig

  constructor(config: TTSConfig) {
    this.config = config
  }

  async generateSpeech(request: TTSRequest): Promise<string> {
    const voice = request.voice || this.config.voice
    const speed = request.speed || this.config.speed || 1.0

    switch (this.config.provider) {
      case 'google':
        return this.generateWithGoogle(request.text, voice, speed, request.outputPath)
      case 'elevenlabs':
        return this.generateWithElevenLabs(request.text, voice, speed, request.outputPath)
      case 'fpt':
        return this.generateWithFPT(request.text, voice, speed, request.outputPath)
      case 'viettel':
        return this.generateWithViettel(request.text, voice, speed, request.outputPath)
      default:
        throw new Error(`Unknown TTS provider: ${this.config.provider}`)
    }
  }

  async getVoices(): Promise<TTSVoice[]> {
    switch (this.config.provider) {
      case 'google':
        return this.getGoogleVoices()
      case 'elevenlabs':
        return this.getElevenLabsVoices()
      case 'fpt':
        return this.getFPTVoices()
      case 'viettel':
        return this.getViettelVoices()
      default:
        return []
    }
  }

  // ===== GOOGLE TTS =====
  private async generateWithGoogle(
    text: string,
    voice: string,
    speed: number,
    outputPath: string
  ): Promise<string> {
    try {
      // Google Cloud Text-to-Speech API
      const response = await axios.post(
        'https://texttospeech.googleapis.com/v1/text:synthesize',
        {
          input: { text },
          voice: {
            languageCode: voice.startsWith('vi') ? 'vi-VN' : 'en-US',
            name: voice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speed,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.config.apiKey || process.env.GOOGLE_API_KEY || '',
          },
        }
      )

      // Decode base64 audio content
      const audioContent = Buffer.from(response.data.audioContent, 'base64')
      await fs.writeFile(outputPath, audioContent)

      return outputPath
    } catch (error: any) {
      console.error('Google TTS Error:', error.response?.data || error.message)
      throw new Error(`Google TTS failed: ${error.message}`)
    }
  }

  private getGoogleVoices(): TTSVoice[] {
    return [
      {
        id: 'vi-VN-Standard-A',
        name: 'Vi-VN Standard A (Nữ)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'vi-VN-Standard-B',
        name: 'Vi-VN Standard B (Nam)',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'vi-VN-Standard-C',
        name: 'Vi-VN Standard C (Nữ)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'vi-VN-Standard-D',
        name: 'Vi-VN Standard D (Nam)',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'vi-VN-Wavenet-A',
        name: 'Vi-VN Wavenet A (Nữ, Chất lượng cao)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'vi-VN-Wavenet-B',
        name: 'Vi-VN Wavenet B (Nam, Chất lượng cao)',
        language: 'vi-VN',
        gender: 'male',
      },
    ]
  }

  // ===== ELEVENLABS TTS =====
  private async generateWithElevenLabs(
    text: string,
    voice: string,
    speed: number,
    outputPath: string
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('ElevenLabs API key is required')
    }

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: speed,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.config.apiKey,
          },
          responseType: 'arraybuffer',
        }
      )

      await fs.writeFile(outputPath, response.data)
      return outputPath
    } catch (error: any) {
      console.error('ElevenLabs TTS Error:', error.response?.data || error.message)
      throw new Error(`ElevenLabs TTS failed: ${error.message}`)
    }
  }

  private async getElevenLabsVoices(): Promise<TTSVoice[]> {
    if (!this.config.apiKey) {
      return []
    }

    try {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.config.apiKey,
        },
      })

      return response.data.voices.map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        language: v.labels?.language || 'unknown',
        gender: v.labels?.gender || 'neutral',
        preview: v.preview_url,
      }))
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error)
      return []
    }
  }

  // ===== FPT AI TTS =====
  private async generateWithFPT(
    text: string,
    voice: string,
    speed: number,
    outputPath: string
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('FPT AI API key is required')
    }

    try {
      // FPT AI Text-to-Speech API
      const response = await axios.post(
        'https://api.fpt.ai/hmi/tts/v5',
        text,
        {
          headers: {
            'Content-Type': 'text/plain',
            'api-key': this.config.apiKey,
            voice: voice,
            speed: speed.toString(),
          },
          responseType: 'arraybuffer',
        }
      )

      await fs.writeFile(outputPath, response.data)
      return outputPath
    } catch (error: any) {
      console.error('FPT TTS Error:', error.response?.data || error.message)
      throw new Error(`FPT TTS failed: ${error.message}`)
    }
  }

  private getFPTVoices(): TTSVoice[] {
    return [
      {
        id: 'leminh',
        name: 'Lê Minh (Nam, Miền Bắc)',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'banmai',
        name: 'Ban Mai (Nữ, Miền Bắc)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'thuminh',
        name: 'Thu Minh (Nữ, Miền Bắc)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'giahuy',
        name: 'Gia Huy (Nam, Miền Nam)',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'ngoclam',
        name: 'Ngọc Lam (Nữ, Miền Nam)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'myan',
        name: 'Mỹ An (Nữ, Miền Trung)',
        language: 'vi-VN',
        gender: 'female',
      },
    ]
  }

  // ===== VIETTEL AI TTS =====
  private async generateWithViettel(
    text: string,
    voice: string,
    speed: number,
    outputPath: string
  ): Promise<string> {
    if (!this.config.apiKey) {
      throw new Error('Viettel AI API key is required')
    }

    try {
      // Viettel AI Text-to-Speech API
      const response = await axios.post(
        'https://viettelai.vn/tts/api/v1/synthesize',
        {
          text,
          voice: voice,
          speed: speed,
          format: 'mp3',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          responseType: 'arraybuffer',
        }
      )

      await fs.writeFile(outputPath, response.data)
      return outputPath
    } catch (error: any) {
      console.error('Viettel TTS Error:', error.response?.data || error.message)
      throw new Error(`Viettel TTS failed: ${error.message}`)
    }
  }

  private getViettelVoices(): TTSVoice[] {
    return [
      {
        id: 'hn-female-xuanmai',
        name: 'Xuân Mai (Nữ, Hà Nội)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'hn-male-manhdung',
        name: 'Mạnh Dũng (Nam, Hà Nội)',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'hcm-female-thuminh',
        name: 'Thu Minh (Nữ, TP.HCM)',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'hcm-male-namminh',
        name: 'Nam Minh (Nam, TP.HCM)',
        language: 'vi-VN',
        gender: 'male',
      },
    ]
  }

  // ===== HELPER METHODS =====

  /**
   * Split long text into chunks to avoid API limits
   */
  splitTextIntoChunks(text: string, maxLength: number = 5000): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    const chunks: string[] = []
    let currentChunk = ''

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = sentence
      } else {
        currentChunk += sentence
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    return chunks
  }

  /**
   * Generate speech for long text (split into chunks)
   */
  async generateLongSpeech(
    text: string,
    outputDir: string,
    baseFileName: string
  ): Promise<string[]> {
    const chunks = this.splitTextIntoChunks(text)
    const outputPaths: string[] = []

    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(outputDir, `${baseFileName}_chunk_${i + 1}.mp3`)
      await this.generateSpeech({
        text: chunks[i],
        outputPath: chunkPath,
      })
      outputPaths.push(chunkPath)
    }

    return outputPaths
  }
}
