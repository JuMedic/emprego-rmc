'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { Send, CheckCircle } from 'lucide-react';

interface ApplyButtonProps {
  jobSlug: string;
}

export function ApplyButton({ jobSlug }: ApplyButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/vagas/${jobSlug}`);
      return;
    }

    if (session?.user?.role !== 'CANDIDATE') {
      setError('Apenas candidatos podem se candidatar');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/jobs/${jobSlug}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao candidatar');
      }

      setHasApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao candidatar');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasApplied) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 bg-green-100 text-green-700 rounded-lg">
        <CheckCircle className="h-5 w-5" />
        Candidatura enviada!
      </div>
    );
  }

  return (
    <div>
      <Button 
        onClick={handleApply} 
        isLoading={isLoading}
        size="lg" 
        className="w-full"
      >
        <Send className="h-4 w-4 mr-2" />
        Candidatar-se
      </Button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
