import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Buscar perfil do candidato
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        residenceCity: true,
        experiences: {
          orderBy: { startDate: 'desc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
        area: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar perfil do candidato
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      residenceCityId,
      desiredPosition,
      level,
      areaId,
      experienceYears,
      education,
      salaryMin,
      salaryMax,
      resumeUrl,
      isPublicProfile,
      receiveAlerts,
      currentPassword,
      newPassword,
    } = body;

    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    // Atualizar senha se fornecida
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, candidate.user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: hashedPassword },
      });
    }

    // Atualizar dados do candidato
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
        residenceCityId: residenceCityId || undefined,
        desiredPosition: desiredPosition || undefined,
        level: level || undefined,
        areaId: areaId || undefined,
        experienceYears: experienceYears !== undefined ? experienceYears : undefined,
        education: education || undefined,
        salaryMin: salaryMin !== undefined ? salaryMin : undefined,
        salaryMax: salaryMax !== undefined ? salaryMax : undefined,
        resumeUrl: resumeUrl || undefined,
        isPublicProfile: isPublicProfile !== undefined ? isPublicProfile : undefined,
        receiveAlerts: receiveAlerts !== undefined ? receiveAlerts : undefined,
      },
      include: {
        residenceCity: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_PROFILE',
        entity: 'Candidate',
        entityId: candidate.id,
        details: body,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ candidate: updatedCandidate });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir conta (LGPD)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { password, reason } = body;

    if (!password) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { candidate: true },
    });

    if (!user || !user.candidate) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 400 });
    }

    // Anonimizar dados (LGPD)
    await prisma.$transaction([
      // Anonimizar candidato
      prisma.candidate.update({
        where: { id: user.candidate.id },
        data: {
          fullName: 'Usuário Removido',
          cpf: null,
          phone: 'REMOVED',
          resumeUrl: null,
          resumeText: null,
          skills: [],
        },
      }),
      // Desativar usuário
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          email: `deleted_${session.user.id}@removed.local`,
          passwordHash: 'DELETED',
          isActive: false,
          dataDeletedAt: new Date(),
        },
      }),
      // Log de auditoria
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'DELETE_ACCOUNT',
          entity: 'User',
          entityId: session.user.id,
          details: { reason },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      }),
    ]);

    return NextResponse.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
