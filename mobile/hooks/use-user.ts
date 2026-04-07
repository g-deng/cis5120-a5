import { useEffect, useState } from 'react';
import { getOrCreateUserId } from '@/services/user';

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateUserId()
      .then(setUserId)
      .finally(() => setLoading(false));
  }, []);

  return { userId, loading };
}
