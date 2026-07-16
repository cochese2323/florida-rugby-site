import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { ClubFund } from './types';

export function useClubFunds() {
  const [funds, setFunds] = useState<ClubFund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunds() {
      const { data, error } = await supabase
        .from('club_funds')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setFunds(data as ClubFund[]);
      }
      setLoading(false);
    }
    fetchFunds();
  }, []);

  return { funds, loading };
}
