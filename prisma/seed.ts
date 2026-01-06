import { PrismaClient, PlanType, JobLevel, EducationLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ==========================================
  // CIDADES DA RMC
  // ==========================================
  const cities = [
    { name: 'Campinas', slug: 'campinas' },
    { name: 'Americana', slug: 'americana' },
    { name: 'Sumaré', slug: 'sumare' },
    { name: 'Hortolândia', slug: 'hortolandia' },
    { name: 'Indaiatuba', slug: 'indaiatuba' },
    { name: 'Valinhos', slug: 'valinhos' },
    { name: 'Vinhedo', slug: 'vinhedo' },
    { name: 'Paulínia', slug: 'paulinia' },
    { name: 'Jaguariúna', slug: 'jaguariuna' },
    { name: 'Monte Mor', slug: 'monte-mor' },
    { name: 'Nova Odessa', slug: 'nova-odessa' },
    { name: 'Santa Bárbara d\'Oeste', slug: 'santa-barbara-doeste' },
    { name: 'Pedreira', slug: 'pedreira' },
    { name: 'Holambra', slug: 'holambra' },
    { name: 'Artur Nogueira', slug: 'artur-nogueira' },
    { name: 'Cosmópolis', slug: 'cosmopolis' },
    { name: 'Engenheiro Coelho', slug: 'engenheiro-coelho' },
    { name: 'Santo Antônio de Posse', slug: 'santo-antonio-de-posse' },
  ];

  console.log('📍 Inserindo cidades da RMC...');
  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: {},
      create: city,
    });
  }

  // ==========================================
  // ÁREAS DE ATUAÇÃO
  // ==========================================
  const areas = [
    { name: 'Tecnologia da Informação', slug: 'ti' },
    { name: 'Indústria', slug: 'industria' },
    { name: 'Saúde', slug: 'saude' },
    { name: 'Administrativo', slug: 'administrativo' },
    { name: 'Comércio', slug: 'comercio' },
    { name: 'Serviços', slug: 'servicos' },
    { name: 'Logística', slug: 'logistica' },
    { name: 'Marketing', slug: 'marketing' },
    { name: 'Recursos Humanos', slug: 'rh' },
    { name: 'Financeiro', slug: 'financeiro' },
    { name: 'Engenharia', slug: 'engenharia' },
    { name: 'Educação', slug: 'educacao' },
    { name: 'Jurídico', slug: 'juridico' },
    { name: 'Construção Civil', slug: 'construcao-civil' },
    { name: 'Agronegócio', slug: 'agronegocio' },
  ];

  console.log('📂 Inserindo áreas de atuação...');
  for (const area of areas) {
    await prisma.jobArea.upsert({
      where: { slug: area.slug },
      update: {},
      create: area,
    });
  }

  // ==========================================
  // SEGMENTOS DE EMPRESA
  // ==========================================
  const segments = [
    { name: 'Tecnologia', slug: 'tecnologia' },
    { name: 'Varejo', slug: 'varejo' },
    { name: 'Indústria', slug: 'industria' },
    { name: 'Saúde', slug: 'saude' },
    { name: 'Educação', slug: 'educacao' },
    { name: 'Alimentos e Bebidas', slug: 'alimentos-bebidas' },
    { name: 'Construção', slug: 'construcao' },
    { name: 'Transporte e Logística', slug: 'transporte-logistica' },
    { name: 'Consultoria', slug: 'consultoria' },
    { name: 'Serviços Financeiros', slug: 'servicos-financeiros' },
    { name: 'Agronegócio', slug: 'agronegocio' },
    { name: 'Telecomunicações', slug: 'telecomunicacoes' },
  ];

  console.log('🏢 Inserindo segmentos de empresa...');
  for (const segment of segments) {
    await prisma.segment.upsert({
      where: { slug: segment.slug },
      update: {},
      create: segment,
    });
  }

  // ==========================================
  // PLANOS
  // ==========================================
  const plans = [
    {
      name: 'Gratuito',
      type: PlanType.FREE,
      maxActiveJobs: 2,
      maxJobDays: 30,
      canHighlight: false,
      canFeature: false,
      canSearchResume: false,
      priceMonthly: 0,
    },
    {
      name: 'Básico',
      type: PlanType.BASIC,
      maxActiveJobs: 5,
      maxJobDays: 45,
      canHighlight: true,
      canFeature: false,
      canSearchResume: false,
      priceMonthly: 99.90,
      priceYearly: 999.90,
    },
    {
      name: 'Profissional',
      type: PlanType.PROFESSIONAL,
      maxActiveJobs: 15,
      maxJobDays: 60,
      canHighlight: true,
      canFeature: true,
      canSearchResume: true,
      priceMonthly: 199.90,
      priceYearly: 1999.90,
    },
    {
      name: 'Premium',
      type: PlanType.PREMIUM,
      maxActiveJobs: -1, // Ilimitado
      maxJobDays: 90,
      canHighlight: true,
      canFeature: true,
      canSearchResume: true,
      priceMonthly: 399.90,
      priceYearly: 3999.90,
    },
  ];

  console.log('💳 Inserindo planos...');
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { type: plan.type },
      update: {},
      create: plan,
    });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
