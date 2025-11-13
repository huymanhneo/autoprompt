import axios from 'axios'
import fs from 'fs/promises'
import FormData from 'form-data'

export interface TranscriptionResult {
  text: string
  confidence?: number
  language?: string
  duration?: number
}

export class AudioTranscriberService {
  private apiKey: string
  private proxy?: string

  constructor(apiKey: string, proxy?: string) {
    this.apiKey = apiKey
    this.proxy = proxy
  }

  /**
   * Transcribe audio file to text using Google Speech-to-Text API
   */
  async transcribeAudio(audioFilePath: string): Promise<TranscriptionResult> {
    try {
      // Read audio file as base64
      const audioContent = await fs.readFile(audioFilePath)
      const base64Audio = audioContent.toString('base64')

      // Call Google Speech-to-Text API with proxy support
      const axiosConfig: any = {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
        },
      }

      // Add proxy if configured
      if (this.proxy) {
        const proxyUrl = new URL(this.proxy)
        axiosConfig.proxy = {
          host: proxyUrl.hostname,
          port: parseInt(proxyUrl.port) || 80,
          protocol: proxyUrl.protocol.replace(':', ''),
        }
        if (proxyUrl.username && proxyUrl.password) {
          axiosConfig.proxy.auth = {
            username: proxyUrl.username,
            password: proxyUrl.password,
          }
        }
      }

      const response = await axios.post(
        'https://speech.googleapis.com/v1/speech:recognize',
        {
          config: {
            encoding: 'MP3',
            sampleRateHertz: 44100,
            languageCode: 'vi-VN',
            enableAutomaticPunctuation: true,
            model: 'default',
          },
          audio: {
            content: base64Audio,
          },
        },
        axiosConfig
      )

      if (!response.data.results || response.data.results.length === 0) {
        return {
          text: '',
          confidence: 0,
          language: 'vi-VN',
        }
      }

      const result = response.data.results[0]
      const alternative = result.alternatives[0]

      return {
        text: alternative.transcript || '',
        confidence: alternative.confidence || 0,
        language: 'vi-VN',
      }
    } catch (error: any) {
      console.error('Transcription error:', error.response?.data || error.message)
      throw new Error(`Failed to transcribe audio: ${error.message}`)
    }
  }

  /**
   * Transcribe multiple audio segments in batch
   */
  async transcribeBatch(audioFiles: string[]): Promise<TranscriptionResult[]> {
    const results: TranscriptionResult[] = []

    for (const file of audioFiles) {
      try {
        const result = await this.transcribeAudio(file)
        results.push(result)
      } catch (error) {
        console.error(`Failed to transcribe ${file}:`, error)
        results.push({
          text: '[Transcription failed]',
          confidence: 0,
        })
      }
    }

    return results
  }

  /**
   * Check if audio file is supported
   */
  isSupportedFormat(filePath: string): boolean {
    const supportedFormats = ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
    return supportedFormats.some((ext) => filePath.toLowerCase().endsWith(ext))
  }
}
