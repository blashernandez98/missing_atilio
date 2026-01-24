import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken, setAuthCookie, isValidUsername, isValidPassword } from '@/lib/auth';
import { createUser, isUsernameAvailable } from '@/lib/db';

/**
 * POST /api/auth/register
 * Create a new user account
 * Body: { username: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate username
    const usernameValidation = isValidUsername(username);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Check if username is available
    const available = await isUsernameAvailable(username);
    if (!available) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser(username, passwordHash);

    if (!user) {
      return NextResponse.json(
        { error: 'Error al crear la cuenta. Intenta de nuevo.' },
        { status: 500 }
      );
    }

    // Create JWT token and set cookie
    const token = await createToken({ userId: user.id, username: user.username });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
      },
      isNewUser: true,
    });
  } catch (error) {
    console.error('API Error - POST /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
