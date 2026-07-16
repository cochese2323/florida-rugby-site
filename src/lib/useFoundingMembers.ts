import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { FOUNDING_MEMBER_LIMIT } from './types';

export function useFoundingMemberCount() {
  const [approvedCount, setApprovedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      const { data, error } = await supabase.rpc('get_founding_member_count');

      if (!error && data !== null) {
        setApprovedCount(data as number);
      }
      setLoading(false);
    }
    fetchCount();
  }, []);

  const spotsRemaining = Math.max(0, FOUNDING_MEMBER_LIMIT - approvedCount);

  return { approvedCount, spotsRemaining, loading, limit: FOUNDING_MEMBER_LIMIT };
}
