import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { companyRegisterSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validationResult = companyRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await prisma.company.findUnique({
      where: { cnpj: data.cnpj.replace(/\D/g, '') },
    });

    if (existingCnpj) {
      return NextResponse.json(
        { success: false, error: 'Este CNPJ já está cadastrado' },
        { status: 400 }
      );
    }

    // Criar usuário e empresa
    const passwordHash = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'COMPANY',
        consentedAt: new Date(),
        consentVersion: '1.0',
        company: {
          create: {
            legalName: data.legalName,
            tradeName: data.tradeName,
            cnpj: data.cnpj.replace(/\D/g, ''),
            phone: data.phone,
            segmentId: data.segmentId || null,
            cities: {
              create: data.cityIds.map((cityId) => ({
                cityId,
              })),
            },
          },
        },
      },
      include: {
        company: {
          include: {
            cities: true,
          },
        },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'Company',
        entityId: user.company?.id,
        details: { email: data.email, cnpj: data.cnpj },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde aprovação.',
      data: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Erro no registro de empresa:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
