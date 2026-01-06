import Link from 'next/link';
import { MapPin, Users, Building2, Target, Heart, Zap } from 'lucide-react';
import { Card, CardContent, Button } from '@/components/ui';

const cities = [
  'Campinas', 'Americana', 'Sumaré', 'Hortolândia', 'Indaiatuba',
  'Valinhos', 'Vinhedo', 'Paulínia', 'Jaguariúna', 'Monte Mor',
  'Nova Odessa', 'Santa Bárbara d\'Oeste', 'Pedreira', 'Holambra',
  'Artur Nogueira', 'Cosmópolis', 'Engenheiro Coelho', 'Santo Antônio de Posse'
];

export const metadata = {
  title: 'Sobre',
  description: 'Conheça o portal Empregos RMC, o maior site de empregos da Região Metropolitana de Campinas',
};

export default function SobrePage() {
  return (
    <div className="container-app py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Sobre o <span className="text-blue-600">Empregos RMC</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          O portal de empregos focado exclusivamente na Região Metropolitana de Campinas, 
          conectando talentos locais às melhores oportunidades da região.
        </p>
      </div>

      {/* Mission */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nossa Missão</h3>
            <p className="text-gray-600">
              Facilitar a conexão entre profissionais qualificados e empresas da RMC, 
              fortalecendo o mercado de trabalho regional.
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nossos Valores</h3>
            <p className="text-gray-600">
              Transparência, acessibilidade e foco no desenvolvimento 
              profissional de toda a comunidade da região.
            </p>
          </CardContent>
        </Card>
        <Card variant="bordered" className="text-center">
          <CardContent className="pt-6">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nossa Visão</h3>
            <p className="text-gray-600">
              Ser a principal referência em recrutamento e seleção 
              da Região Metropolitana de Campinas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Why Us */}
      <div className="bg-blue-50 rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Por que o Empregos RMC?
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Foco Regional</h3>
              <p className="text-gray-600">
                Diferente de portais genéricos, somos especializados nas 18 cidades 
                da Região Metropolitana de Campinas, oferecendo vagas relevantes 
                para quem vive e trabalha aqui.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Candidatos Qualificados</h3>
              <p className="text-gray-600">
                Nossa base de candidatos é composta por profissionais da região, 
                prontos para começar imediatamente sem necessidade de mudança.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Empresas Verificadas</h3>
              <p className="text-gray-600">
                Todas as empresas passam por um processo de verificação, 
                garantindo segurança para os candidatos.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tecnologia Inteligente</h3>
              <p className="text-gray-600">
                Utilizamos inteligência artificial para fazer o matching 
                entre candidatos e vagas, aumentando a eficiência do processo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cities */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          18 Cidades Atendidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/vagas/${city.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/'/g, '')}`}
              className="flex items-center justify-center p-3 bg-white border rounded-lg hover:border-blue-500 hover:shadow-sm transition-all"
            >
              <MapPin className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">{city}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gray-900 text-white rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-4">
          Pronto para começar?
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Seja você candidato buscando uma oportunidade ou empresa procurando 
          talentos, o Empregos RMC é o lugar certo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cadastro?tipo=candidato">
            <Button size="lg" className="w-full sm:w-auto">
              Cadastrar Currículo
            </Button>
          </Link>
          <Link href="/cadastro?tipo=empresa">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900">
              Cadastrar Empresa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
