import { ipcMain, dialog } from 'electron'
import fs from 'fs/promises'
import { getServiceManager } from '../services/ServiceManager'

// LLM Handlers
ipcMain.handle('llm:generateOutline', async (_event, params) => {
  try {
    const llmService = getServiceManager().getLLMService()
    const result = await llmService.generateOutline(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error generating outline:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('llm:generateChapterContent', async (_event, params) => {
  try {
    const llmService = getServiceManager().getLLMService()
    const result = await llmService.generateChapterContent(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error generating chapter content:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('llm:generateCorePrompts', async (_event, params) => {
  try {
    const llmService = getServiceManager().getLLMService()
    const result = await llmService.generateCorePrompts(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error generating core prompts:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('llm:generateVideoPrompts', async (_event, params) => {
  try {
    const llmService = getServiceManager().getLLMService()
    const result = await llmService.generateVideoPrompts(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error generating video prompts:', error)
    throw new Error(error.message)
  }
})

// TTS Handlers
ipcMain.handle('tts:generate', async (_event, params) => {
  try {
    const ttsService = getServiceManager().getTTSService()
    const result = await ttsService.generateSpeech(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error generating TTS:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('tts:getVoices', async () => {
  try {
    const ttsService = getServiceManager().getTTSService()
    const voices = await ttsService.getVoices()
    return { success: true, data: voices }
  } catch (error: any) {
    console.error('Error getting voices:', error)
    throw new Error(error.message)
  }
})

// Audio Handlers
ipcMain.handle('audio:merge', async (_event, params) => {
  try {
    const audioService = getServiceManager().getAudioService()
    const result = await audioService.mergeAudioFiles(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error merging audio:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('audio:split', async (_event, params) => {
  try {
    const audioService = getServiceManager().getAudioService()
    const result = await audioService.splitAudioIntoSegments(params)
    return { success: true, data: result }
  } catch (error: any) {
    console.error('Error splitting audio:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('audio:getDuration', async (_event, filePath) => {
  try {
    const audioService = getServiceManager().getAudioService()
    const duration = await audioService.getDuration(filePath)
    return duration
  } catch (error: any) {
    console.error('Error getting audio duration:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('audio:transcribe', async (_event, filePath) => {
  try {
    const transcriber = getServiceManager().getTranscriberService()
    const result = await transcriber.transcribeAudio(filePath)
    return result
  } catch (error: any) {
    console.error('Error transcribing audio:', error)
    throw new Error(error.message)
  }
})

// Storage Handlers
ipcMain.handle('storage:createProject', async (_event, params) => {
  try {
    const storageService = getServiceManager().getStorageService()
    const project = storageService.createProject(params)
    return { success: true, data: project }
  } catch (error: any) {
    console.error('Error creating project:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('storage:getProject', async (_event, projectId) => {
  try {
    const storageService = getServiceManager().getStorageService()
    const project = storageService.getProject(projectId)
    return { success: true, data: project }
  } catch (error: any) {
    console.error('Error getting project:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('storage:updateProject', async (_event, params) => {
  try {
    const storageService = getServiceManager().getStorageService()
    storageService.updateProject(params.id, params)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating project:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('storage:listProjects', async () => {
  try {
    const storageService = getServiceManager().getStorageService()
    const projects = storageService.listProjects()
    return { success: true, data: projects }
  } catch (error: any) {
    console.error('Error listing projects:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('storage:deleteProject', async (_event, projectId) => {
  try {
    const storageService = getServiceManager().getStorageService()
    storageService.deleteProject(projectId)
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting project:', error)
    throw new Error(error.message)
  }
})

// Chapter Handlers
ipcMain.handle('storage:listChapters', async (_event, projectId) => {
  try {
    const storageService = getServiceManager().getStorageService()
    const chapters = storageService.listChapters(projectId)
    return { success: true, data: chapters }
  } catch (error: any) {
    console.error('Error listing chapters:', error)
    throw new Error(error.message)
  }
})

ipcMain.handle('storage:saveChapter', async (_event, params) => {
  try {
    const storageService = getServiceManager().getStorageService()

    // Check if chapter exists
    const existing = storageService.listChapters(params.projectId).find(
      (ch) => ch.chapter_number === params.chapterNumber
    )

    if (existing) {
      // Update existing chapter
      storageService.updateChapter(existing.id, {
        title: params.title,
        content: params.content,
      })
      return { success: true, data: storageService.getChapter(existing.id) }
    } else {
      // Create new chapter
      const chapter = storageService.createChapter({
        projectId: params.projectId,
        chapterNumber: params.chapterNumber,
        title: params.title,
        content: params.content,
      })
      return { success: true, data: chapter }
    }
  } catch (error: any) {
    console.error('Error saving chapter:', error)
    throw new Error(error.message)
  }
})

// File System Handlers
ipcMain.handle('fs:selectDirectory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('fs:selectFile', async (_event, filters) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: filters || [],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('fs:saveFile', async (_event, { content, defaultPath, filters }) => {
  const result = await dialog.showSaveDialog({
    defaultPath,
    filters: filters || [],
  })

  if (result.canceled || !result.filePath) {
    return false
  }

  await fs.writeFile(result.filePath, content, 'utf-8')
  return true
})

ipcMain.handle('fs:readFile', async (_event, filePath) => {
  const content = await fs.readFile(filePath, 'utf-8')
  return content
})

// Settings Handlers
ipcMain.handle('settings:get', async () => {
  try {
    console.log('[IPC] Getting settings...')
    const settings = getServiceManager().getSettings()
    console.log('[IPC] Settings retrieved:', settings)
    return settings
  } catch (error: any) {
    console.error('[IPC] Error getting settings:', error)
    throw new Error(error.message || 'Failed to get settings')
  }
})

ipcMain.handle('settings:update', async (_event, settings) => {
  try {
    console.log('[IPC] Updating settings with:', settings)
    getServiceManager().updateSettings(settings)
    console.log('[IPC] Settings updated successfully')
    return { success: true }
  } catch (error: any) {
    console.error('[IPC] Error updating settings:', error)
    throw new Error(error.message || 'Failed to update settings')
  }
})
