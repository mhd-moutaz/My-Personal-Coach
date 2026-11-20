import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const GEMINI_KEY_NAME = 'mpc_gemini_key';

// In-memory fallback for web or environments where SecureStore is unavailable.
let memoryKeyFallback: string | null = null;

async function canUseSecureStore(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getGeminiKey(): Promise<string | null> {
  try {
    if (await canUseSecureStore()) {
      const stored = await SecureStore.getItemAsync(GEMINI_KEY_NAME);
      return stored && stored.trim().length > 0 ? stored.trim() : null;
    }
    return memoryKeyFallback;
  } catch {
    return memoryKeyFallback;
  }
}

export async function setGeminiKey(key: string): Promise<void> {
  const cleaned = key.trim();
  if (!cleaned) return;
  memoryKeyFallback = cleaned;
  try {
    if (await canUseSecureStore()) {
      await SecureStore.setItemAsync(GEMINI_KEY_NAME, cleaned);
    }
  } catch {
    // Fallback remains in memory only
  }
}

export async function deleteGeminiKey(): Promise<void> {
  memoryKeyFallback = null;
  try {
    if (await canUseSecureStore()) {
      await SecureStore.deleteItemAsync(GEMINI_KEY_NAME);
    }
  } catch {
    // Fallback already cleared
  }
}
