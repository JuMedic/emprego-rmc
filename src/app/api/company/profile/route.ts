import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Buscar perfil da empresa
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        segment: true,
        cities: {
          include: {
            city: true,
          },
        },
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar perfil da empresa
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tradeName,
      description,
      phone,
      whatsapp,
      website,
      logoUrl,
      segmentId,
      currentPassword,
      newPassword,
    } = body;

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    // Atualizar senha se fornecida
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, company.user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: hashedPassword },
      });
    }

    // Atualizar dados da empresa
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        tradeName: tradeName || undefined,
        description: description || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        website: website || undefined,
        logoUrl: logoUrl || undefined,
        segmentId: segmentId || undefined,
      },
      include: {
        segment: true,
      },
    });

    return NextResponse.json({ company: updatedCompany });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
