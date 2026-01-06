import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const cities = [
  'Campinas', 'Americana', 'Sumaré', 'Hortolândia', 'Indaiatuba',
  'Valinhos', 'Vinhedo', 'Paulínia', 'Jaguariúna'
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">
                Empregos <span className="text-blue-500">RMC</span>
              </span>
            </div>
            <p className="text-sm mb-4">
              O maior portal de empregos da Região Metropolitana de Campinas. 
              Conectamos talentos a oportunidades locais.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                contato@empregosrmc.com.br
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                (19) 99999-9999
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Campinas, SP
              </div>
            </div>
          </div>

          {/* Para Candidatos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Para Candidatos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/vagas" className="hover:text-white transition-colors">
                  Buscar Vagas
                </Link>
              </li>
              <li>
                <Link href="/cadastro?tipo=candidato" className="hover:text-white transition-colors">
                  Cadastrar Currículo
                </Link>
              </li>
              <li>
                <Link href="/candidato/alertas" className="hover:text-white transition-colors">
                  Alertas de Vagas
                </Link>
              </li>
              <li>
                <Link href="/dicas" className="hover:text-white transition-colors">
                  Dicas de Carreira
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Empresas */}
          <div>
            <h3 className="text-white font-semibold mb-4">Para Empresas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cadastro?tipo=empresa" className="hover:text-white transition-colors">
                  Cadastrar Empresa
                </Link>
              </li>
              <li>
                <Link href="/empresa/vagas/nova" className="hover:text-white transition-colors">
                  Publicar Vaga
                </Link>
              </li>
              <li>
                <Link href="/planos" className="hover:text-white transition-colors">
                  Planos e Preços
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-white transition-colors">
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Cidades */}
          <div>
            <h3 className="text-white font-semibold mb-4">Vagas por Cidade</h3>
            <ul className="space-y-2 text-sm">
              {cities.map((city) => (
                <li key={city}>
                  <Link 
                    href={`/vagas/${city.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                    className="hover:text-white transition-colors"
                  >
                    {city}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/vagas" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Ver todas →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              © {new Date().getFullYear()} Empregos RMC. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/termos" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link href="/privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/lgpd" className="hover:text-white transition-colors">
                LGPD
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
