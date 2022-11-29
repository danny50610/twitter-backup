import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  fetchTwitterUserLiked: () => ipcRenderer.invoke('fetchTwitterUserLiked'),
  // test2: () => ipcRenderer.invoke('test2'),
});
