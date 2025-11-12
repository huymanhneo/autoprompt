import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // LLM Service
  generateOutline: (params: any) => ipcRenderer.invoke('llm:generateOutline', params),
  generateChapterContent: (params: any) => ipcRenderer.invoke('llm:generateChapterContent', params),
  generateCorePrompts: (params: any) => ipcRenderer.invoke('llm:generateCorePrompts', params),
  generateVideoPrompts: (params: any) => ipcRenderer.invoke('llm:generateVideoPrompts', params),

  // TTS Service
  textToSpeech: (params: any) => ipcRenderer.invoke('tts:generate', params),
  getVoicesList: (provider: string) => ipcRenderer.invoke('tts:getVoices', provider),

  // Audio Service
  mergeAudioFiles: (params: any) => ipcRenderer.invoke('audio:merge', params),
  splitAudioToSegments: (params: any) => ipcRenderer.invoke('audio:split', params),
  getAudioDuration: (filePath: string) => ipcRenderer.invoke('audio:getDuration', filePath),

  // Storage Service
  createProject: (params: any) => ipcRenderer.invoke('storage:createProject', params),
  getProject: (projectId: string) => ipcRenderer.invoke('storage:getProject', projectId),
  updateProject: (params: any) => ipcRenderer.invoke('storage:updateProject', params),
  listProjects: () => ipcRenderer.invoke('storage:listProjects'),
  deleteProject: (projectId: string) => ipcRenderer.invoke('storage:deleteProject', projectId),

  // File System
  selectDirectory: () => ipcRenderer.invoke('fs:selectDirectory'),
  selectFile: (filters?: any) => ipcRenderer.invoke('fs:selectFile', filters),
  saveFile: (params: any) => ipcRenderer.invoke('fs:saveFile', params),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: any) => ipcRenderer.invoke('settings:update', settings),

  // Events
  onProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('progress', (_event, progress) => callback(progress))
  },
  onError: (callback: (error: any) => void) => {
    ipcRenderer.on('error', (_event, error) => callback(error))
  },
})

// Type definitions for TypeScript
export interface IElectronAPI {
  generateOutline: (params: any) => Promise<any>
  generateChapterContent: (params: any) => Promise<any>
  generateCorePrompts: (params: any) => Promise<any>
  generateVideoPrompts: (params: any) => Promise<any>
  textToSpeech: (params: any) => Promise<any>
  getVoicesList: (provider: string) => Promise<any>
  mergeAudioFiles: (params: any) => Promise<any>
  splitAudioToSegments: (params: any) => Promise<any>
  getAudioDuration: (filePath: string) => Promise<number>
  createProject: (params: any) => Promise<any>
  getProject: (projectId: string) => Promise<any>
  updateProject: (params: any) => Promise<any>
  listProjects: () => Promise<any>
  deleteProject: (projectId: string) => Promise<any>
  selectDirectory: () => Promise<string | null>
  selectFile: (filters?: any) => Promise<string | null>
  saveFile: (params: any) => Promise<boolean>
  readFile: (filePath: string) => Promise<string>
  getSettings: () => Promise<any>
  updateSettings: (settings: any) => Promise<void>
  onProgress: (callback: (progress: any) => void) => void
  onError: (callback: (error: any) => void) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
