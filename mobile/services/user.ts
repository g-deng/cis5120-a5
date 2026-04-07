import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser } from './api';

const USER_ID_KEY = '@yarny_user_id';

export async function getOrCreateUserId(): Promise<string> {
  const stored = await AsyncStorage.getItem(USER_ID_KEY);
  if (stored) return stored;

  const username = `user_${Date.now()}`;
  const user = await createUser(username);
  await AsyncStorage.setItem(USER_ID_KEY, user.id);
  return user.id;
}
