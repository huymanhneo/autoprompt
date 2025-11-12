import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs/promises'
import path from 'path'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

export interface AudioSegment {
  id: string
  segmentNumber: number
  startTime: number
  endTime: number
  duration: number
  audioFile: string
  transcript?: string
}

export interface MergeOptions {
  inputFiles: string[]
  outputFile: string
  bitrate?: string
  sampleRate?: number
}

export interface SplitOptions {
  inputFile: string
  segmentDuration: number // in seconds
  outputDir: string
  outputPrefix: string
}

export class AudioService {
  /**
   * Get audio file duration in seconds
   */
  async getDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err)
        } else {
          resolve(metadata.format.duration || 0)
        }
      })
    })
  }

  /**
   * Merge multiple audio files into one
   */
  async mergeAudioFiles(options: MergeOptions): Promise<string> {
    const { inputFiles, outputFile, bitrate = '192k', sampleRate = 44100 } = options

    if (inputFiles.length === 0) {
      throw new Error('No input files provided')
    }

    // Create a text file listing all input files for ffmpeg concat
    const listFilePath = path.join(path.dirname(outputFile), 'file_list.txt')
    const listContent = inputFiles.map((file) => `file '${file}'`).join('\n')
    await fs.writeFile(listFilePath, listContent, 'utf-8')

    try {
      return await new Promise((resolve, reject) => {
        ffmpeg()
          .input(listFilePath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions([
            '-c copy', // Copy codec for faster processing
            `-ab ${bitrate}`,
            `-ar ${sampleRate}`,
          ])
          .output(outputFile)
          .on('end', () => {
            // Clean up list file
            fs.unlink(listFilePath).catch(console.error)
            resolve(outputFile)
          })
          .on('error', (err) => {
            fs.unlink(listFilePath).catch(console.error)
            reject(err)
          })
          .run()
      })
    } catch (error: any) {
      throw new Error(`Failed to merge audio files: ${error.message}`)
    }
  }

  /**
   * Split audio file into fixed-duration segments
   */
  async splitAudioIntoSegments(options: SplitOptions): Promise<AudioSegment[]> {
    const { inputFile, segmentDuration, outputDir, outputPrefix } = options

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true })

    // Get total duration
    const totalDuration = await this.getDuration(inputFile)
    const numberOfSegments = Math.ceil(totalDuration / segmentDuration)

    const segments: AudioSegment[] = []

    for (let i = 0; i < numberOfSegments; i++) {
      const startTime = i * segmentDuration
      const endTime = Math.min((i + 1) * segmentDuration, totalDuration)
      const duration = endTime - startTime

      const outputFile = path.join(outputDir, `${outputPrefix}_segment_${i + 1}.mp3`)

      await this.extractSegment(inputFile, outputFile, startTime, duration)

      segments.push({
        id: `segment_${i + 1}`,
        segmentNumber: i + 1,
        startTime,
        endTime,
        duration,
        audioFile: outputFile,
      })
    }

    return segments
  }

  /**
   * Extract a segment from audio file
   */
  private async extractSegment(
    inputFile: string,
    outputFile: string,
    startTime: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputFile)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })
  }

  /**
   * Add background music to audio
   */
  async addBackgroundMusic(
    voiceFile: string,
    musicFile: string,
    outputFile: string,
    musicVolume: number = 0.2 // 0.0 to 1.0
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(voiceFile)
        .input(musicFile)
        .complexFilter([
          // Adjust music volume
          `[1:a]volume=${musicVolume}[music]`,
          // Mix voice and music
          '[0:a][music]amix=inputs=2:duration=first:dropout_transition=2',
        ])
        .output(outputFile)
        .on('end', () => resolve(outputFile))
        .on('error', (err) => reject(err))
        .run()
    })
  }

  /**
   * Convert audio format
   */
  async convertFormat(
    inputFile: string,
    outputFile: string,
    format: 'mp3' | 'wav' | 'aac' | 'ogg'
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .toFormat(format)
        .output(outputFile)
        .on('end', () => resolve(outputFile))
        .on('error', (err) => reject(err))
        .run()
    })
  }

  /**
   * Adjust audio speed
   */
  async adjustSpeed(
    inputFile: string,
    outputFile: string,
    speed: number // 0.5 = half speed, 2.0 = double speed
  ): Promise<string> {
    if (speed <= 0 || speed > 2) {
      throw new Error('Speed must be between 0 and 2')
    }

    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .audioFilters(`atempo=${speed}`)
        .output(outputFile)
        .on('end', () => resolve(outputFile))
        .on('error', (err) => reject(err))
        .run()
    })
  }

  /**
   * Normalize audio volume
   */
  async normalizeVolume(inputFile: string, outputFile: string): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputFile)
        .audioFilters('loudnorm')
        .output(outputFile)
        .on('end', () => resolve(outputFile))
        .on('error', (err) => reject(err))
        .run()
    })
  }

  /**
   * Get audio waveform data (for visualization)
   */
  async getWaveformData(
    filePath: string,
    samples: number = 1000
  ): Promise<number[]> {
    try {
      // Use ffmpeg to extract audio samples
      const tempFile = path.join(path.dirname(filePath), 'temp_waveform.txt')

      await new Promise<void>((resolve, reject) => {
        ffmpeg(filePath)
          .audioFilters(`aresample=${samples}`)
          .format('s16le')
          .output(tempFile)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run()
      })

      // Read and parse waveform data
      const buffer = await fs.readFile(tempFile)
      const waveform: number[] = []

      for (let i = 0; i < buffer.length; i += 2) {
        waveform.push(buffer.readInt16LE(i))
      }

      // Clean up
      await fs.unlink(tempFile)

      return waveform
    } catch (error: any) {
      throw new Error(`Failed to get waveform data: ${error.message}`)
    }
  }

  /**
   * Check if FFmpeg is installed
   */
  async checkFFmpegInstalled(): Promise<boolean> {
    try {
      await execAsync('ffmpeg -version')
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Get FFmpeg version
   */
  async getFFmpegVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync('ffmpeg -version')
      const match = stdout.match(/ffmpeg version ([^\s]+)/)
      return match ? match[1] : 'unknown'
    } catch (error) {
      return 'not installed'
    }
  }
}
