import NextAuth from 'next-auth';
import { authOptions as authConfig } from './auth-config';

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
