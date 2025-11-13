import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import { GoogleAuth } from 'google-auth-library'
import { GoogleGenAI } from '@google/genai'
import { fileURLToPath } from 'url'

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const execAsync = promisify(exec)

export interface TTSConfig {
  provider: 'google' | 'gemini' | 'viettts' | 'elevenlabs' | 'fpt' | 'viettel'
  apiKey?: string
  googleCredentialsPath?: string // Path to Google Service Account JSON file (for Google Cloud TTS)
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
      case 'gemini':
        return this.generateWithGemini(request.text, voice, speed, request.outputPath)
      case 'viettts':
        return this.generateWithVietTTS(request.text, voice, speed, request.outputPath)
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
      case 'gemini':
        return this.getGeminiVoices()
      case 'viettts':
        return this.getVietTTSVoices()
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
      // Check if credentials file exists
      if (!this.config.googleCredentialsPath) {
        throw new Error('Google Service Account credentials file is required for Text-to-Speech. Please upload credentials JSON file in Settings.')
      }

      // Initialize Google Auth with Service Account
      const auth = new GoogleAuth({
        keyFile: this.config.googleCredentialsPath,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      })

      // Get access token
      const client = await auth.getClient()
      const accessToken = await client.getAccessToken()

      if (!accessToken.token) {
        throw new Error('Failed to get access token from Service Account credentials')
      }

      // Google Cloud Text-to-Speech API with OAuth2 authentication
      const url = 'https://texttospeech.googleapis.com/v1/text:synthesize'

      const response = await axios.post(
        url,
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
            'Authorization': `Bearer ${accessToken.token}`,
          },
        }
      )

      // Decode base64 audio content
      const audioContent = Buffer.from(response.data.audioContent, 'base64')
      await fs.writeFile(outputPath, audioContent)

      return outputPath
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message
      console.error('Google TTS Error:', error.response?.data || error.message)

      if (error.code === 'ENOENT') {
        throw new Error('Google Service Account credentials file not found. Please upload a valid JSON file in Settings.')
      }

      if (error.response?.status === 403) {
        throw new Error('Google TTS authentication failed. Please:\n1. Enable Cloud Text-to-Speech API in Google Cloud Console\n2. Ensure your Service Account has Text-to-Speech permissions\n3. Re-upload your credentials file')
      }

      throw new Error(`Google TTS failed: ${errorMsg}`)
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

  // ===== GEMINI TTS =====
  private async generateWithGemini(
    text: string,
    voice: string,
    speed: number,
    outputPath: string
  ): Promise<string> {
    try {
      const apiKey = this.config.apiKey || process.env.GEMINI_API_KEY || ''

      if (!apiKey) {
        throw new Error('Gemini API key is required for Text-to-Speech. Please add your API key in Settings.')
      }

      // Initialize Gemini AI
      const genAI = new GoogleGenAI({ apiKey })
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp'
      })

      // Generate audio using Gemini's TTS capability
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: text
          }]
        }],
        generationConfig: {
          responseMimeType: 'audio/mp3',
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice
              }
            }
          }
        }
      })

      // Get audio data from response
      const response = await result.response

      // Check if response has audio data
      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error('No audio generated from Gemini')
      }

      const audioData = response.candidates[0].content.parts[0].inlineData
      if (!audioData || !audioData.data) {
        throw new Error('No audio data in Gemini response')
      }

      // Decode base64 audio and save
      const audioBuffer = Buffer.from(audioData.data, 'base64')
      await fs.writeFile(outputPath, audioBuffer)

      return outputPath
    } catch (error: any) {
      console.error('Gemini TTS Error:', error)

      if (error.message?.includes('API key')) {
        throw new Error('Gemini API key invalid. Please check your API key in Settings.')
      }

      throw new Error(`Gemini TTS failed: ${error.message}`)
    }
  }

  private getGeminiVoices(): TTSVoice[] {
    return [
      {
        id: 'Puck',
        name: 'Puck (Nam, Trẻ trung)',
        language: 'en-US',
        gender: 'male',
      },
      {
        id: 'Charon',
        name: 'Charon (Nam, Trầm ấm)',
        language: 'en-US',
        gender: 'male',
      },
      {
        id: 'Kore',
        name: 'Kore (Nữ, Trẻ trung)',
        language: 'en-US',
        gender: 'female',
      },
      {
        id: 'Fenrir',
        name: 'Fenrir (Nam, Mạnh mẽ)',
        language: 'en-US',
        gender: 'male',
      },
      {
        id: 'Aoede',
        name: 'Aoede (Nữ, Dịu dàng)',
        language: 'en-US',
        gender: 'female',
      },
    ]
  }

  // ===== VIETTTS (NTT123) =====
  private async generateWithVietTTS(
    text: string,
    voice: string,
    speed: number,
    outputPath: string
  ): Promise<string> {
    try {
      // VietTTS requires Python script
      // Create Python script path
      const scriptPath = path.join(__dirname, '../../scripts/viettts_wrapper.py')

      // Check if Python script exists
      try {
        await fs.access(scriptPath)
      } catch {
        throw new Error('VietTTS Python script not found. Please run setup: pip install vietTTS')
      }

      // Escape text for command line
      const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, ' ')

      // Call Python script
      const command = `python "${scriptPath}" --text "${escapedText}" --voice "${voice}" --speed ${speed} --output "${outputPath}"`

      console.log('[VietTTS] Running command:', command)

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000, // 2 minutes timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      })

      if (stderr && !stderr.includes('UserWarning')) {
        console.warn('[VietTTS] Warning:', stderr)
      }

      // Check if output file was created
      try {
        await fs.access(outputPath)
        console.log('[VietTTS] Audio generated successfully:', outputPath)
        return outputPath
      } catch {
        throw new Error('VietTTS failed to generate audio file')
      }
    } catch (error: any) {
      console.error('VietTTS Error:', error)

      if (error.message?.includes('not found') || error.code === 'ENOENT') {
        throw new Error('Python or VietTTS not installed. Please install: pip install vietTTS')
      }

      if (error.killed || error.signal === 'SIGTERM') {
        throw new Error('VietTTS generation timeout (exceeded 2 minutes)')
      }

      throw new Error(`VietTTS failed: ${error.message}`)
    }
  }

  private getVietTTSVoices(): TTSVoice[] {
    return [
      {
        id: 'northern_female_1',
        name: 'Nữ Miền Bắc 1',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'northern_male_1',
        name: 'Nam Miền Bắc 1',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'southern_female_1',
        name: 'Nữ Miền Nam 1',
        language: 'vi-VN',
        gender: 'female',
      },
      {
        id: 'southern_male_1',
        name: 'Nam Miền Nam 1',
        language: 'vi-VN',
        gender: 'male',
      },
      {
        id: 'central_female_1',
        name: 'Nữ Miền Trung 1',
        language: 'vi-VN',
        gender: 'female',
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
