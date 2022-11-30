import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  fetchTwitterUserLiked: () => ipcRenderer.invoke('fetchTwitterUserLiked'),
  getTweet: (beforeId: string | null = null, beforeCreatedAt: string | null = null) => ipcRenderer.invoke('getTweet', beforeId, beforeCreatedAt),
});
