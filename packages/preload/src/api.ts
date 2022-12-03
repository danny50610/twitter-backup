import { ipcRenderer } from 'electron';

export function fetchTwitterUserLiked() {
  return ipcRenderer.invoke('fetchTwitterUserLiked');
}

export function getTweet(beforeId: string | null = null, beforeCreatedAt: string | null = null) {
  return ipcRenderer.invoke('getTweet', beforeId, beforeCreatedAt);
}
