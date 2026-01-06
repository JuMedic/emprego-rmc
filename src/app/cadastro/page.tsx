'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, User, Building2 } from 'lucide-react';
import { Card } from '@/components/ui';
import { CandidateRegisterForm } from './CandidateRegisterForm';
import { CompanyRegisterForm } from './CompanyRegisterForm';

export default function CadastroPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('tipo') === 'empresa' ? 'company' : 'candidate';
  const [userType, setUserType] = useState<'candidate' | 'company'>(initialType);

  return (
    <div className="min-h-[80vh] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              Empregos <span className="text-blue-600">RMC</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Criar sua conta</h1>
          <p className="text-gray-600 mt-2">
            Já tem conta?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        {/* Tipo de usuário */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setUserType('candidate')}
            className={`p-4 rounded-xl border-2 transition-all ${
              userType === 'candidate'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User className={`h-8 w-8 mx-auto mb-2 ${userType === 'candidate' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className={`font-medium ${userType === 'candidate' ? 'text-blue-600' : 'text-gray-700'}`}>
              Sou Candidato
            </div>
            <p className="text-sm text-gray-500 mt-1">Busco oportunidades de emprego</p>
          </button>

          <button
            type="button"
            onClick={() => setUserType('company')}
            className={`p-4 rounded-xl border-2 transition-all ${
              userType === 'company'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Building2 className={`h-8 w-8 mx-auto mb-2 ${userType === 'company' ? 'text-purple-600' : 'text-gray-400'}`} />
            <div className={`font-medium ${userType === 'company' ? 'text-purple-600' : 'text-gray-700'}`}>
              Sou Empresa
            </div>
            <p className="text-sm text-gray-500 mt-1">Quero publicar vagas</p>
          </button>
        </div>

        {/* Formulários */}
        <Card variant="bordered">
          {userType === 'candidate' ? (
            <CandidateRegisterForm />
          ) : (
            <CompanyRegisterForm />
          )}
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Ao cadastrar, você concorda com nossos{' '}
            <Link href="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
