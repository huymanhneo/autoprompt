/// <reference types="vite/client" />

import { IElectronAPI } from '../electron-app/preload'

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
