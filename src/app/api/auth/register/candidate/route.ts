import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { candidateRegisterSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validationResult = candidateRegisterSchema.safeParse(body);
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

    // Verificar se cidade existe
    const city = await prisma.city.findUnique({
      where: { id: data.residenceCityId },
    });

    if (!city) {
      return NextResponse.json(
        { success: false, error: 'Cidade inválida' },
        { status: 400 }
      );
    }

    // Criar usuário e candidato
    const passwordHash = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: 'CANDIDATE',
        consentedAt: new Date(),
        consentVersion: '1.0',
        candidate: {
          create: {
            fullName: data.fullName,
            cpf: data.cpf || null,
            phone: data.phone,
            residenceCityId: data.residenceCityId,
          },
        },
      },
      include: {
        candidate: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'Candidate',
        entityId: user.candidate?.id,
        details: { email: data.email },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cadastro realizado com sucesso!',
      data: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('Erro no registro de candidato:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
