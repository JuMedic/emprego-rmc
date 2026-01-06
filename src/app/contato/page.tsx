'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Mail, Phone, Send } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Select } from '@/components/ui';

const contatoSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Selecione um assunto'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
});

type ContatoForm = z.infer<typeof contatoSchema>;

export default function ContatoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContatoForm>({
    resolver: zodResolver(contatoSchema),
  });

  const onSubmit = async (data: ContatoForm) => {
    setIsSubmitting(true);
    try {
      // Simular envio
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Contato:', data);
      setIsSuccess(true);
      reset();
    } catch {
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container-app py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mensagem Enviada!</h1>
          <p className="text-gray-600 mb-8">
            Obrigado pelo contato. Nossa equipe responderá em até 24 horas úteis.
          </p>
          <Button onClick={() => setIsSuccess(false)}>
            Enviar nova mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600">
            Estamos aqui para ajudar. Envie sua mensagem ou entre em contato diretamente.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-6">
            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">E-mail</h3>
                    <a href="mailto:contato@empregosrmc.com.br" className="text-blue-600 hover:underline text-sm">
                      contato@empregosrmc.com.br
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Telefone</h3>
                    <a href="tel:+551932001000" className="text-gray-600 text-sm">
                      (19) 3200-1000
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="bordered">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Endereço</h3>
                    <p className="text-gray-600 text-sm">
                      Campinas, SP<br />
                      Região Metropolitana
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Horário de Atendimento</h4>
              <p className="text-sm text-gray-600">
                Segunda a Sexta: 9h às 18h<br />
                Sábado: 9h às 12h
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Envie sua mensagem</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Nome completo"
                      placeholder="Seu nome"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      placeholder="seu@email.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Telefone (opcional)"
                      placeholder="(00) 00000-0000"
                      {...register('phone')}
                    />
                    <Select
                      label="Assunto"
                      error={errors.subject?.message}
                      {...register('subject')}
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="duvida">Dúvida sobre o portal</option>
                      <option value="candidato">Sou candidato</option>
                      <option value="empresa">Sou empresa</option>
                      <option value="planos">Dúvidas sobre planos</option>
                      <option value="comercial">Contato comercial</option>
                      <option value="privacidade">Privacidade/LGPD</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="outro">Outro</option>
                    </Select>
                  </div>
                  <Textarea
                    label="Mensagem"
                    placeholder="Digite sua mensagem aqui..."
                    rows={6}
                    error={errors.message?.message}
                    {...register('message')}
                  />
                  <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
