import { SessionData } from '../types';

const STORAGE_KEY_PREFIX = 'humanity_training_data_';

export const saveSessionToHistory = (data: SessionData) => {
  const key = `${STORAGE_KEY_PREFIX}${data.taskId}`;
  try {
    const existing = localStorage.getItem(key);
    const history: SessionData[] = existing ? JSON.parse(existing) : [];
    
    // Append new session
    history.push(data);
    
    localStorage.setItem(key, JSON.stringify(history));
    console.log(`[Storage] Saved session for ${data.taskId}. Total records: ${history.length}`);
  } catch (e) {
    console.error("Failed to save session to local storage", e);
  }
};

export const getSessionHistory = (taskId: string): SessionData[] => {
  const key = `${STORAGE_KEY_PREFIX}${taskId}`;
  const existing = localStorage.getItem(key);
  return existing ? JSON.parse(existing) : [];
};

export const clearTrainingData = () => {
  Object.keys(localStorage).forEach(key => {
    if(key.startsWith(STORAGE_KEY_PREFIX)) localStorage.removeItem(key);
  });
  alert("Training data cleared!");
};