import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuthInit() {
  const { user, fetchUser } = useAuthStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current && !user) {
      hasFetched.current = true;
      fetchUser();
    }
  }, [user, fetchUser]);

  return { user };
}