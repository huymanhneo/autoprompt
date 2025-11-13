import { GoogleGenAI } from '@google/genai'
import { APIKeyConfig } from '../ServiceManager'

export interface LLMConfig {
  provider: 'gemini' | 'openai' | 'claude'
  apiKeys: APIKeyConfig[]
  model: string
  temperature?: number
  maxTokens?: number
  rotationStrategy: 'round-robin' | 'random' | 'fallback'
}

export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export class LLMService {
  private config: LLMConfig
  private geminiClients: Map<string, GoogleGenAI> = new Map()
  private currentKeyIndex: number = 0

  constructor(config: LLMConfig) {
    this.config = config
    if (config.provider === 'gemini' && config.apiKeys.length > 0) {
      // Initialize Gemini client for each API key
      config.apiKeys.forEach((keyConfig) => {
        const client = new GoogleGenAI({ apiKey: keyConfig.key })
        this.geminiClients.set(keyConfig.id, client)
      })
    }
  }

  /**
   * Get next API key based on rotation strategy
   */
  private getNextAPIKey(): APIKeyConfig {
    const enabledKeys = this.config.apiKeys.filter((k) => k.enabled)
    if (enabledKeys.length === 0) {
      throw new Error('No enabled API keys available')
    }

    let selectedKey: APIKeyConfig

    switch (this.config.rotationStrategy) {
      case 'round-robin':
        selectedKey = enabledKeys[this.currentKeyIndex % enabledKeys.length]
        this.currentKeyIndex++
        break

      case 'random':
        const randomIndex = Math.floor(Math.random() * enabledKeys.length)
        selectedKey = enabledKeys[randomIndex]
        break

      case 'fallback':
      default:
        selectedKey = enabledKeys[0]
        break
    }

    return selectedKey
  }

  /**
   * Try API call with fallback to other keys if failed
   */
  private async tryAPICall<T>(
    fn: (keyConfig: APIKeyConfig) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    const enabledKeys = this.config.apiKeys.filter((k) => k.enabled)
    if (enabledKeys.length === 0) {
      throw new Error('No enabled API keys available')
    }

    let lastError: Error | null = null

    for (let i = 0; i < Math.min(maxRetries, enabledKeys.length); i++) {
      try {
        const keyConfig = this.getNextAPIKey()
        console.log(
          `[LLMService] Using API key: ${keyConfig.name} (attempt ${i + 1}/${maxRetries})`
        )

        const result = await fn(keyConfig)

        // Success - update stats
        keyConfig.lastUsed = new Date().toISOString()
        keyConfig.requestCount = (keyConfig.requestCount || 0) + 1

        return result
      } catch (error: any) {
        lastError = error
        console.error(`[LLMService] API call failed (attempt ${i + 1}):`, error.message)

        if (error.message?.includes('429') || error.message?.includes('quota')) {
          console.log('[LLMService] Rate limit detected, trying next key...')
          continue
        }

        throw error
      }
    }

    throw lastError || new Error('All API keys failed')
  }

  async generateText(request: LLMRequest): Promise<string> {
    switch (this.config.provider) {
      case 'gemini':
        return this.generateWithGemini(request)
      case 'openai':
        throw new Error('OpenAI not implemented yet')
      case 'claude':
        throw new Error('Claude not implemented yet')
      default:
        throw new Error(`Unknown provider: ${this.config.provider}`)
    }
  }

  private async generateWithGemini(request: LLMRequest): Promise<string> {
    if (this.geminiClients.size === 0) {
      throw new Error('Gemini not initialized. Please add API keys in settings.')
    }

    return this.tryAPICall(async (keyConfig) => {
      const client = this.geminiClients.get(keyConfig.id)
      if (!client) {
        throw new Error(`Gemini client not found for key: ${keyConfig.name}`)
      }

      const fullPrompt = request.systemPrompt
        ? `${request.systemPrompt}\n\n${request.prompt}`
        : request.prompt

      // NEW SDK API
      const response = await client.models.generateContent({
        model: this.config.model,
        contents: fullPrompt,
        config: {
          temperature: request.temperature ?? this.config.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? this.config.maxTokens ?? 4096,
          responseMimeType: 'text/plain', // Ensure plain text response
        },
      })

      return response.text || ''
    })
  }

  /**
   * Helper method to extract and clean JSON from response
   * Handles markdown code blocks, trailing commas, and comments
   */
  private extractJSON(text: string): string {
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1].trim()
    }

    // Try to find JSON object or array
    const jsonMatch = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim()
    }

    // Clean up common JSON issues
    // Remove trailing commas before closing braces/brackets
    jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1')

    // Remove single-line comments
    jsonText = jsonText.replace(/\/\/.*$/gm, '')

    // Remove multi-line comments
    jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '')

    return jsonText.trim()
  }

  // ===== SPECIALIZED METHODS =====

  /**
   * Generate story outline with multiple chapters
   */
  async generateOutline(params: {
    idea: string
    numberOfChapters: number
    style: string
    tone: string
  }): Promise<any> {
    const prompt = `Bạn là một biên kịch chuyên nghiệp. Hãy tạo dàn ý cho một câu chuyện dựa trên ý tưởng sau:

Ý tưởng: ${params.idea}

Yêu cầu:
- Tạo dàn ý cho ${params.numberOfChapters} chương
- Phong cách: ${params.style}
- Giọng điệu: ${params.tone}

Cho mỗi chương, hãy cung cấp:
1. Tiêu đề chương (title)
2. Bối cảnh (setting) - nơi diễn ra, thời gian
3. Cảm xúc trung tâm (centralEmotion) - cảm xúc chính của chương
4. Hành động chính (mainAction) - diễn biến chính
5. Cliffhanger - điểm hấp dẫn để dẫn sang chương tiếp theo (chỉ áp dụng cho các chương không phải chương cuối)

Trả về kết quả dưới dạng JSON với format sau:
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "...",
      "setting": "...",
      "centralEmotion": "...",
      "mainAction": "...",
      "cliffhanger": "..."
    },
    ...
  ]
}

CHỈ trả về JSON, không thêm bất kỳ text nào khác.`

    const response = await this.generateText({ prompt })

    // Extract JSON from response (handles markdown code blocks)
    const jsonText = this.extractJSON(response)

    try {
      return JSON.parse(jsonText)
    } catch (error: any) {
      console.error('[LLMService] Failed to parse JSON:', jsonText)
      throw new Error(`Invalid JSON response from LLM: ${error.message}`)
    }
  }

  /**
   * Generate detailed chapter content
   */
  async generateChapterContent(params: {
    outline: any
    chapterNumber: number
    style: string
    tone: string
  }): Promise<string> {
    const chapter = params.outline.chapters.find(
      (c: any) => c.chapterNumber === params.chapterNumber
    )

    if (!chapter) {
      throw new Error(`Chapter ${params.chapterNumber} not found in outline`)
    }

    const prompt = `Bạn là một nhà văn chuyên nghiệp. Hãy viết nội dung chi tiết cho chương sau:

THÔNG TIN CHƯƠNG:
- Số chương: ${chapter.chapterNumber}
- Tiêu đề: ${chapter.title}
- Bối cảnh: ${chapter.setting}
- Cảm xúc trung tâm: ${chapter.centralEmotion}
- Hành động chính: ${chapter.mainAction}
${chapter.cliffhanger ? `- Cliffhanger: ${chapter.cliffhanger}` : ''}

PHONG CÁCH:
- ${params.style}
- Giọng kể: ${params.tone}
- Giọng kể điện ảnh, ít thoại, nhịp chậm
- Giàu hình ảnh, ánh sáng, cảm xúc
- Phù hợp để chuyển thành video với AI

YÊU CẦU:
1. Viết nội dung khoảng 500-800 từ
2. Tập trung vào mô tả hình ảnh, ánh sáng, không khí
3. Sử dụng ngôn ngữ giàu cảm xúc
4. Phù hợp để chuyển thành giọng nói và video
5. Kết thúc có điểm nhấn nếu có cliffhanger

Viết nội dung (chỉ trả về nội dung văn bản, không thêm tiêu đề hay giải thích):`

    const response = await this.generateText({ prompt })
    return response.trim()
  }

  /**
   * Generate core prompts for characters and settings
   */
  async generateCorePrompts(params: {
    storyContent: string
    numberOfCharacters: number
    numberOfSettings: number
  }): Promise<any> {
    const prompt = `Bạn là một chuyên gia tạo prompts cho AI sinh video. Hãy phân tích câu chuyện sau và tạo core prompts:

NỘI DUNG CÂU CHUYỆN:
${params.storyContent}

YÊU CẦU:
1. Xác định ${params.numberOfCharacters} nhân vật chính
2. Xác định ${params.numberOfSettings} bối cảnh/địa điểm chính
3. Tạo core prompt chi tiết cho mỗi nhân vật (mô tả ngoại hình, trang phục, đặc điểm)
4. Tạo core prompt chi tiết cho mỗi bối cảnh (mô tả không gian, ánh sáng, màu sắc)
5. Đề xuất phong cách visual và camera chung

Trả về JSON với format:
{
  "characters": [
    {
      "name": "Tên nhân vật",
      "description": "Mô tả ngắn gọn",
      "appearance": "Mô tả ngoại hình",
      "corePrompt": "Detailed cinematic prompt for consistent character appearance, include: age, gender, facial features, hair, clothing, distinctive characteristics, Vietnamese context if applicable"
    }
  ],
  "settings": [
    {
      "name": "Tên địa điểm",
      "description": "Mô tả ngắn",
      "atmosphere": "Không khí, cảm giác",
      "corePrompt": "Detailed cinematic prompt for consistent setting, include: location type, environment, lighting, color palette, time of day, weather, mood, Vietnamese context if applicable"
    }
  ],
  "visualStyle": "Mô tả phong cách visual chung (cinematic, realistic, artistic, etc.)",
  "cameraStyle": "Mô tả phong cách camera (wide shots, close-ups, tracking, slow motion, etc.)"
}

CHỈ trả về JSON, không thêm text khác.`

    const response = await this.generateText({ prompt })

    const jsonText = this.extractJSON(response)

    try {
      return JSON.parse(jsonText)
    } catch (error: any) {
      console.error('[LLMService] Failed to parse core prompts JSON:', jsonText)
      throw new Error(`Invalid JSON response from LLM: ${error.message}`)
    }
  }

  /**
   * Generate video prompts for scenes
   */
  async generateVideoPrompts(params: {
    sceneTranscripts: Array<{ segmentNumber: number; transcript: string }>
    corePrompts: any
    storyContext: string
    maxPromptsPerBatch?: number
  }): Promise<any[]> {
    const maxPerBatch = params.maxPromptsPerBatch || 4
    const results: any[] = []

    for (let i = 0; i < params.sceneTranscripts.length; i += maxPerBatch) {
      const batch = params.sceneTranscripts.slice(i, i + maxPerBatch)

      const prompt = `Bạn là chuyên gia tạo video prompts cho AI. Hãy tạo prompts cho các cảnh sau:

BỐI CẢNH TỔNG QUAN CÂU CHUYỆN:
${params.storyContext}

CORE PROMPTS:
${JSON.stringify(params.corePrompts, null, 2)}

CÁC CẢNH CẦN TẠO PROMPTS:
${batch.map((s) => `Scene ${s.segmentNumber}: ${s.transcript}`).join('\n')}

YÊU CẦU:
1. Mỗi cảnh dài 8 giây
2. Sử dụng CHÍNH XÁC các core prompts cho nhân vật và bối cảnh (không được viết tắt)
3. Mô tả chi tiết hành động, chuyển động camera
4. Phong cách: Cinematic, realistic, Vietnamese context
5. Đề xuất background music và sound effects phù hợp

Trả về JSON array với format:
[
  {
    "scene_id": 1,
    "video_duration": "8s",
    "prompt": {
      "narrative": "Mô tả chi tiết cảnh quay, bao gồm: hành động, nhân vật (dùng core prompt), bối cảnh (dùng core prompt), ánh sáng, góc quay",
      "style": "Cinematic realism, Vietnamese storytelling",
      "camera": "Chi tiết góc quay: wide shot/close-up/tracking/pan/tilt, camera movement",
      "transition": "Loại chuyển cảnh: fade/cut/dissolve"
    },
    "dialogue": {
      "character": "Tên nhân vật (nếu có thoại)",
      "text": "Nội dung thoại",
      "language": "vi"
    },
    "audio": {
      "bgm": "Mô tả nhạc nền phù hợp",
      "sfx": ["Âm thanh 1", "Âm thanh 2"]
    },
    "metadata": {
      "characters": ["Tên nhân vật xuất hiện"],
      "settings": ["Tên bối cảnh"],
      "timeOfDay": "morning/afternoon/evening/night",
      "weather": "sunny/cloudy/rainy/etc"
    }
  }
]

CHỈ trả về JSON array, không thêm text khác.`

      const response = await this.generateText({ prompt })

      const jsonText = this.extractJSON(response)

      try {
        const batchResults = JSON.parse(jsonText)
        results.push(...batchResults)
      } catch (error: any) {
        console.error('[LLMService] Failed to parse video prompts JSON:', jsonText)
        throw new Error(`Invalid JSON response from LLM: ${error.message}`)
      }
    }

    return results
  }
}
