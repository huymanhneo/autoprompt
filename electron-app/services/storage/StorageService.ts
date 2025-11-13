import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'

export interface Project {
  id: string
  name: string
  description: string
  mode: 'idea' | 'script'
  status: ProjectStatus
  created_at: string
  updated_at: string
  working_directory: string
  settings: string // JSON string
  outline?: string // JSON string
  core_prompts?: string // JSON string
}

export type ProjectStatus =
  | 'initializing'
  | 'outline_generated'
  | 'content_generated'
  | 'audio_generated'
  | 'scenes_split'
  | 'prompts_generated'
  | 'completed'

export interface Chapter {
  id: string
  project_id: string
  chapter_number: number
  title: string
  content: string
  word_count: number
  audio_file?: string
  audio_duration?: number
  status: string
  created_at: string
  updated_at: string
}

export interface Scene {
  id: string
  project_id: string
  scene_number: number
  duration: number
  audio_segment_id: string
  video_prompt: string // JSON string
  status: string
  created_at: string
}

export class StorageService {
  private db: Database.Database

  constructor(dbPath?: string) {
    const defaultPath = path.join(app.getPath('userData'), 'youtube-automation.db')
    this.db = new Database(dbPath || defaultPath)
    this.initDatabase()
  }

  private initDatabase() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        mode TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        working_directory TEXT NOT NULL,
        settings TEXT NOT NULL,
        outline TEXT,
        core_prompts TEXT
      );

      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        chapter_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        word_count INTEGER DEFAULT 0,
        audio_file TEXT,
        audio_duration REAL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS audio_segments (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        segment_number INTEGER NOT NULL,
        start_time REAL NOT NULL,
        end_time REAL NOT NULL,
        duration REAL NOT NULL,
        audio_file TEXT NOT NULL,
        transcript TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scenes (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        scene_number INTEGER NOT NULL,
        duration REAL NOT NULL,
        audio_segment_id TEXT NOT NULL,
        video_prompt TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (audio_segment_id) REFERENCES audio_segments(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_chapters_project ON chapters(project_id);
      CREATE INDEX IF NOT EXISTS idx_audio_segments_project ON audio_segments(project_id);
      CREATE INDEX IF NOT EXISTS idx_scenes_project ON scenes(project_id);
    `)
  }

  // ===== PROJECT CRUD =====

  createProject(data: {
    name: string
    description: string
    mode: 'idea' | 'script'
    workingDirectory: string
    settings?: any
  }): Project {
    const id = uuidv4()
    const now = new Date().toISOString()

    const defaultSettings = {
      llm: {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        temperature: 0.7,
      },
      tts: {
        provider: 'google',
        voice: 'vi-VN-Standard-A',
        speed: 1.0,
      },
      story: {
        numberOfChapters: 5,
        style: 'Cinematic Vietnamese storytelling',
        tone: 'Narrative, emotional, visual-rich',
      },
      video: {
        segmentDuration: 8,
        aspectRatio: '16:9',
        style: 'Cinematic realism',
      },
    }

    const settings = JSON.stringify(data.settings || defaultSettings)

    const stmt = this.db.prepare(`
      INSERT INTO projects (
        id, name, description, mode, status, created_at, updated_at,
        working_directory, settings
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.name,
      data.description,
      data.mode,
      'initializing',
      now,
      now,
      data.workingDirectory,
      settings
    )

    return this.getProject(id)!
  }

  getProject(id: string): Project | null {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE id = ?')
    const project = stmt.get(id) as any

    if (!project) return null

    // Parse JSON fields
    if (project.outline && typeof project.outline === 'string') {
      try {
        project.outline = JSON.parse(project.outline)
      } catch (error) {
        console.error('[StorageService] Failed to parse outline JSON:', error)
        project.outline = null
      }
    }

    if (project.settings && typeof project.settings === 'string') {
      try {
        project.settings = JSON.parse(project.settings)
      } catch (error) {
        console.error('[StorageService] Failed to parse settings JSON:', error)
        project.settings = null
      }
    }

    if (project.core_prompts && typeof project.core_prompts === 'string') {
      try {
        project.core_prompts = JSON.parse(project.core_prompts)
      } catch (error) {
        console.error('[StorageService] Failed to parse core_prompts JSON:', error)
        project.core_prompts = null
      }
    }

    return project as Project
  }

  listProjects(): Project[] {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY updated_at DESC')
    const projects = stmt.all() as any[]

    // Parse JSON fields for each project
    return projects.map((project) => {
      if (project.outline && typeof project.outline === 'string') {
        try {
          project.outline = JSON.parse(project.outline)
        } catch (error) {
          console.error('[StorageService] Failed to parse outline JSON:', error)
          project.outline = null
        }
      }

      if (project.settings && typeof project.settings === 'string') {
        try {
          project.settings = JSON.parse(project.settings)
        } catch (error) {
          console.error('[StorageService] Failed to parse settings JSON:', error)
          project.settings = null
        }
      }

      if (project.core_prompts && typeof project.core_prompts === 'string') {
        try {
          project.core_prompts = JSON.parse(project.core_prompts)
        } catch (error) {
          console.error('[StorageService] Failed to parse core_prompts JSON:', error)
          project.core_prompts = null
        }
      }

      return project as Project
    })
  }

  updateProject(id: string, data: Partial<Project>): void {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }
    if (data.settings !== undefined) {
      updates.push('settings = ?')
      values.push(typeof data.settings === 'string' ? data.settings : JSON.stringify(data.settings))
    }
    if (data.outline !== undefined) {
      updates.push('outline = ?')
      values.push(typeof data.outline === 'string' ? data.outline : JSON.stringify(data.outline))
    }
    if (data.core_prompts !== undefined) {
      updates.push('core_prompts = ?')
      values.push(typeof data.core_prompts === 'string' ? data.core_prompts : JSON.stringify(data.core_prompts))
    }

    if (updates.length === 0) return

    updates.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE projects SET ${updates.join(', ')} WHERE id = ?
    `)

    stmt.run(...values)
  }

  deleteProject(id: string): void {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ?')
    stmt.run(id)
  }

  // ===== CHAPTER CRUD =====

  createChapter(data: {
    projectId: string
    chapterNumber: number
    title: string
    content: string
  }): Chapter {
    const id = uuidv4()
    const now = new Date().toISOString()
    const wordCount = data.content.split(/\s+/).length

    const stmt = this.db.prepare(`
      INSERT INTO chapters (
        id, project_id, chapter_number, title, content, word_count,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.projectId,
      data.chapterNumber,
      data.title,
      data.content,
      wordCount,
      'pending',
      now,
      now
    )

    return this.getChapter(id)!
  }

  getChapter(id: string): Chapter | null {
    const stmt = this.db.prepare('SELECT * FROM chapters WHERE id = ?')
    return stmt.get(id) as Chapter | null
  }

  listChapters(projectId: string): Chapter[] {
    const stmt = this.db.prepare(
      'SELECT * FROM chapters WHERE project_id = ? ORDER BY chapter_number ASC'
    )
    return stmt.all(projectId) as Chapter[]
  }

  updateChapter(id: string, data: Partial<Chapter>): void {
    const updates: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.content !== undefined) {
      updates.push('content = ?')
      values.push(data.content)
      updates.push('word_count = ?')
      values.push(data.content.split(/\s+/).length)
    }
    if (data.audio_file !== undefined) {
      updates.push('audio_file = ?')
      values.push(data.audio_file)
    }
    if (data.audio_duration !== undefined) {
      updates.push('audio_duration = ?')
      values.push(data.audio_duration)
    }
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }

    if (updates.length === 0) return

    updates.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE chapters SET ${updates.join(', ')} WHERE id = ?
    `)

    stmt.run(...values)
  }

  // ===== AUDIO SEGMENT CRUD =====

  createAudioSegment(data: {
    projectId: string
    segmentNumber: number
    startTime: number
    endTime: number
    duration: number
    audioFile: string
    transcript?: string
  }): any {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO audio_segments (
        id, project_id, segment_number, start_time, end_time,
        duration, audio_file, transcript, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.projectId,
      data.segmentNumber,
      data.startTime,
      data.endTime,
      data.duration,
      data.audioFile,
      data.transcript || null,
      now
    )

    return { id, ...data }
  }

  listAudioSegments(projectId: string): any[] {
    const stmt = this.db.prepare(
      'SELECT * FROM audio_segments WHERE project_id = ? ORDER BY segment_number ASC'
    )
    return stmt.all(projectId)
  }

  updateAudioSegment(id: string, data: { transcript?: string }): void {
    if (data.transcript !== undefined) {
      const stmt = this.db.prepare('UPDATE audio_segments SET transcript = ? WHERE id = ?')
      stmt.run(data.transcript, id)
    }
  }

  // ===== SCENE CRUD =====

  createScene(data: {
    projectId: string
    sceneNumber: number
    duration: number
    audioSegmentId: string
    videoPrompt: any
  }): Scene {
    const id = uuidv4()
    const now = new Date().toISOString()

    const stmt = this.db.prepare(`
      INSERT INTO scenes (
        id, project_id, scene_number, duration, audio_segment_id,
        video_prompt, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      data.projectId,
      data.sceneNumber,
      data.duration,
      data.audioSegmentId,
      JSON.stringify(data.videoPrompt),
      'pending',
      now
    )

    return this.getScene(id)!
  }

  getScene(id: string): Scene | null {
    const stmt = this.db.prepare('SELECT * FROM scenes WHERE id = ?')
    return stmt.get(id) as Scene | null
  }

  listScenes(projectId: string): Scene[] {
    const stmt = this.db.prepare(
      'SELECT * FROM scenes WHERE project_id = ? ORDER BY scene_number ASC'
    )
    return stmt.all(projectId) as Scene[]
  }

  updateScene(id: string, data: Partial<Scene>): void {
    if (data.video_prompt !== undefined || data.status !== undefined) {
      const updates: string[] = []
      const values: any[] = []

      if (data.video_prompt !== undefined) {
        updates.push('video_prompt = ?')
        values.push(
          typeof data.video_prompt === 'string'
            ? data.video_prompt
            : JSON.stringify(data.video_prompt)
        )
      }
      if (data.status !== undefined) {
        updates.push('status = ?')
        values.push(data.status)
      }

      values.push(id)

      const stmt = this.db.prepare(`
        UPDATE scenes SET ${updates.join(', ')} WHERE id = ?
      `)

      stmt.run(...values)
    }
  }

  // ===== UTILITY METHODS =====

  close(): void {
    this.db.close()
  }

  vacuum(): void {
    this.db.exec('VACUUM')
  }
}
