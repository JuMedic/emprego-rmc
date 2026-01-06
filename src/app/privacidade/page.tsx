import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export const metadata = {
  title: 'Política de Privacidade e LGPD',
  description: 'Política de privacidade e proteção de dados do portal Empregos RMC',
};

export default function PrivacidadePage() {
  return (
    <div className="container-app py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Política de Privacidade e LGPD
        </h1>

        <div className="prose prose-gray max-w-none">
          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>1. Introdução</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                A Empregos RMC está comprometida com a proteção de seus dados pessoais. 
                Esta Política de Privacidade explica como coletamos, usamos, armazenamos 
                e protegemos suas informações, em conformidade com a Lei Geral de Proteção 
                de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>2. Dados Coletados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Para Candidatos:</h4>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                  <li>Nome completo</li>
                  <li>E-mail e telefone</li>
                  <li>CPF (opcional e criptografado)</li>
                  <li>Cidade de residência</li>
                  <li>Informações profissionais (currículo, experiências, formação)</li>
                  <li>Pretensão salarial</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Para Empresas:</h4>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                  <li>Razão social e nome fantasia</li>
                  <li>CNPJ</li>
                  <li>Endereço e telefone</li>
                  <li>E-mail corporativo</li>
                  <li>Informações das vagas publicadas</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>3. Finalidade do Tratamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Seus dados são utilizados exclusivamente para:
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>Conectar candidatos a oportunidades de emprego</li>
                <li>Permitir que empresas encontrem candidatos qualificados</li>
                <li>Enviar alertas de vagas compatíveis com seu perfil</li>
                <li>Melhorar a experiência na plataforma</li>
                <li>Comunicações relacionadas aos serviços</li>
                <li>Cumprimento de obrigações legais</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>4. Seus Direitos (LGPD)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Conforme a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li><strong>Acesso:</strong> Solicitar uma cópia de todos os seus dados</li>
                <li><strong>Correção:</strong> Corrigir dados incompletos ou incorretos</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Revogação:</strong> Retirar o consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Se opor a determinados tratamentos</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>5. Segurança dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4">
                <li>Criptografia de dados sensíveis (CPF, senhas)</li>
                <li>Conexões seguras (HTTPS/SSL)</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Logs de auditoria</li>
                <li>Backups regulares</li>
                <li>Proteção contra ataques (rate limiting, sanitização)</li>
              </ul>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>6. Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Seus dados podem ser compartilhados apenas:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4">
                <li>Com empresas, quando você se candidata a uma vaga</li>
                <li>Com empresas que buscam candidatos (se você autorizar)</li>
                <li>Para cumprimento de obrigações legais</li>
                <li>Com prestadores de serviço essenciais (hospedagem, pagamento)</li>
              </ul>
              <p className="text-gray-700 mt-4">
                <strong>Nunca vendemos seus dados para terceiros.</strong>
              </p>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>7. Cookies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Utilizamos cookies essenciais para funcionamento do site e cookies 
                analíticos para melhorar a experiência. Você pode gerenciar as 
                preferências de cookies nas configurações do seu navegador.
              </p>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>8. Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Seus dados são mantidos enquanto sua conta estiver ativa ou conforme 
                necessário para cumprir obrigações legais. Após a exclusão da conta, 
                os dados são removidos em até 30 dias, exceto quando houver 
                obrigação legal de retenção.
              </p>
            </CardContent>
          </Card>

          <Card variant="bordered" className="mb-6">
            <CardHeader>
              <CardTitle>9. Como Exercer Seus Direitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Para exercer seus direitos ou esclarecer dúvidas, entre em contato:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>E-mail:</strong> privacidade@empregosrmc.com.br
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Encarregado de Dados (DPO):</strong> dpo@empregosrmc.com.br
                </p>
              </div>
              <p className="text-gray-700 mt-4">
                Você também pode gerenciar seus dados diretamente nas configurações 
                da sua conta ou solicitar a exclusão completa a qualquer momento.
              </p>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle>10. Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Esta política pode ser atualizada periodicamente. Notificaremos 
                sobre alterações significativas por e-mail ou destaque no site.
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                Última atualização: Janeiro de 2026
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
