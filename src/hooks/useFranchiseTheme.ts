import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FranchiseTheme {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export const useFranchiseTheme = (franchiseSlugOrName: string | undefined) => {
  const [theme, setTheme] = useState<FranchiseTheme>({
    logoUrl: null,
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#3b82f6',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      if (!franchiseSlugOrName) {
        setLoading(false);
        return;
      }

      try {
        // Buscar tema da tabela franchises usando slug ou name
        const { data, error } = await supabase
          .from('franchises')
          .select('logo_url, primary_color, secondary_color, accent_color, slug, name')
          .eq('active', true)
          .or(`slug.eq.${franchiseSlugOrName},name.eq.${franchiseSlugOrName}`)
          .maybeSingle();

        if (error) {
          console.error('Error fetching franchise theme:', error);
          setLoading(false);
          return;
        }

        if (data) {
          setTheme({
            logoUrl: data.logo_url,
            primaryColor: data.primary_color || '#2563eb',
            secondaryColor: data.secondary_color || '#1e40af',
            accentColor: data.accent_color || '#3b82f6',
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching theme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, [franchiseSlugOrName]);

  return { theme, loading };
};
