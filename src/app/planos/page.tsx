import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

async function getPlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { priceMonthly: 'asc' },
  });
}

export const metadata = {
  title: 'Planos e Preços',
  description: 'Conheça os planos para empresas do portal Empregos RMC',
};

export default async function PlanosPage() {
  const plans = await getPlans();

  const features = [
    { key: 'maxActiveJobs', label: 'Vagas ativas' },
    { key: 'maxJobDays', label: 'Duração da vaga (dias)' },
    { key: 'canHighlight', label: 'Destaque na listagem', type: 'boolean' },
    { key: 'canFeature', label: 'Vaga patrocinada', type: 'boolean' },
    { key: 'canSearchResume', label: 'Busca de currículos', type: 'boolean' },
  ];

  return (
    <div className="container-app py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Planos para Empresas
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Escolha o plano ideal para sua empresa encontrar os melhores talentos 
          da Região Metropolitana de Campinas
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan, index) => (
          <Card 
            key={plan.id} 
            variant="bordered" 
            className={`relative ${index === 2 ? 'border-blue-500 border-2' : ''}`}
          >
            {index === 2 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="info">Mais Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">
                  {Number(plan.priceMonthly) === 0 
                    ? 'Grátis' 
                    : formatCurrency(Number(plan.priceMonthly))}
                </span>
                {Number(plan.priceMonthly) > 0 && (
                  <span className="text-gray-500">/mês</span>
                )}
              </div>
              {plan.priceYearly && (
                <p className="text-sm text-green-600 mt-1">
                  {formatCurrency(Number(plan.priceYearly))}/ano (economize 17%)
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {features.map((feature) => {
                  const value = plan[feature.key as keyof typeof plan];
                  const display = feature.type === 'boolean' 
                    ? value 
                    : feature.key === 'maxActiveJobs' && value === -1 
                      ? 'Ilimitadas' 
                      : value;

                  return (
                    <li key={feature.key} className="flex items-center gap-2">
                      {feature.type === 'boolean' ? (
                        value ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )
                      ) : (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      <span className={`text-sm ${!value && feature.type === 'boolean' ? 'text-gray-400' : 'text-gray-700'}`}>
                        {feature.type === 'boolean' 
                          ? feature.label 
                          : `${display} ${feature.label.toLowerCase()}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <Link href={`/cadastro?tipo=empresa&plano=${plan.type}`}>
                <Button 
                  variant={index === 2 ? 'primary' : 'outline'} 
                  className="w-full"
                >
                  {Number(plan.priceMonthly) === 0 ? 'Começar Grátis' : 'Assinar'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Perguntas Frequentes
        </h2>
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sim! Não há fidelidade. Você pode cancelar seu plano a qualquer momento 
                e continuar usando até o final do período pago.
              </p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">Quais formas de pagamento são aceitas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Aceitamos cartão de crédito, boleto bancário e PIX para pagamentos 
                mensais e anuais.
              </p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">O que acontece se eu atingir o limite de vagas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Você precisará pausar ou encerrar uma vaga existente antes de publicar 
                uma nova, ou pode fazer upgrade para um plano superior.
              </p>
            </CardContent>
          </Card>
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">Como funciona o destaque de vagas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Vagas em destaque aparecem no topo dos resultados de busca e na 
                página inicial, recebendo mais visualizações e candidaturas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 text-center p-8 bg-blue-50 rounded-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Precisa de um plano personalizado?
        </h3>
        <p className="text-gray-600 mb-6">
          Para grandes volumes de vagas ou necessidades específicas, entre em contato 
          com nossa equipe comercial.
        </p>
        <Link href="/contato">
          <Button size="lg">Falar com Comercial</Button>
        </Link>
      </div>
    </div>
  );
}
