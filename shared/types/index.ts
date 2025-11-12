// ===== PROJECT TYPES =====
export interface Project {
  id: string
  name: string
  description: string
  mode: 'idea' | 'script'
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  workingDirectory: string
  outline?: Outline
  chapters?: Chapter[]
  corePrompts?: CorePrompts
  scenes?: Scene[]
  settings: ProjectSettings
}

export type ProjectStatus =
  | 'initializing'
  | 'outline_generated'
  | 'content_generated'
  | 'audio_generated'
  | 'scenes_split'
  | 'prompts_generated'
  | 'completed'

export interface ProjectSettings {
  llm: {
    provider: 'gemini' | 'openai' | 'claude'
    model: string
    temperature: number
  }
  tts: {
    provider: 'google' | 'elevenlabs' | 'fpt' | 'viettel'
    voice: string
    speed: number
  }
  story: {
    numberOfChapters: number
    style: string
    tone: string
  }
  video: {
    segmentDuration: number // seconds
    aspectRatio: '16:9' | '9:16' | '1:1'
    style: string
  }
}

// ===== OUTLINE TYPES =====
export interface Outline {
  chapters: OutlineChapter[]
  totalChapters: number
  generatedAt: string
}

export interface OutlineChapter {
  id: string
  chapterNumber: number
  title: string
  setting: string
  centralEmotion: string
  mainAction: string
  cliffhanger?: string
  estimatedDuration?: number
}

// ===== CHAPTER TYPES =====
export interface Chapter {
  id: string
  chapterNumber: number
  title: string
  content: string
  wordCount: number
  audioFile?: string
  audioDuration?: number
  status: ChapterStatus
}

export type ChapterStatus =
  | 'pending'
  | 'content_generated'
  | 'audio_generated'
  | 'completed'

// ===== AUDIO TYPES =====
export interface AudioSegment {
  id: string
  segmentNumber: number
  startTime: number
  endTime: number
  duration: number
  audioFile: string
  transcript: string
}

// ===== PROMPT TYPES =====
export interface CorePrompts {
  characters: CharacterPrompt[]
  settings: SettingPrompt[]
  visualStyle: string
  cameraStyle: string
}

export interface CharacterPrompt {
  id: string
  name: string
  description: string
  appearance: string
  corePrompt: string // The detailed, consistent prompt for this character
}

export interface SettingPrompt {
  id: string
  name: string
  description: string
  atmosphere: string
  corePrompt: string // The detailed, consistent prompt for this setting
}

// ===== SCENE TYPES =====
export interface Scene {
  id: string
  sceneNumber: number
  duration: number
  audioSegmentId: string
  videoPrompt: VideoPrompt
  status: SceneStatus
}

export type SceneStatus = 'pending' | 'prompt_generated' | 'video_generated' | 'completed'

export interface VideoPrompt {
  scene_id: number
  video_duration: string
  prompt: {
    narrative: string
    style: string
    camera: string
    transition: string
  }
  dialogue?: {
    character: string
    text: string
    language: string
  }
  audio?: {
    bgm: string
    sfx: string[]
  }
  metadata?: {
    characters: string[]
    settings: string[]
    timeOfDay?: string
    weather?: string
  }
}

// ===== TTS TYPES =====
export interface TTSRequest {
  text: string
  provider: 'google' | 'elevenlabs' | 'fpt' | 'viettel'
  voice: string
  speed?: number
  outputPath: string
}

export interface TTSVoice {
  id: string
  name: string
  language: string
  gender: 'male' | 'female' | 'neutral'
  provider: string
}

// ===== LLM TYPES =====
export interface LLMRequest {
  provider: 'gemini' | 'openai' | 'claude'
  model: string
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// ===== PROGRESS TYPES =====
export interface Progress {
  step: string
  current: number
  total: number
  message: string
  percentage: number
}
