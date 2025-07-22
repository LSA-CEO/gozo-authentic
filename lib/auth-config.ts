import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase avec la service key pour l'auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        console.log('🔐 Tentative de connexion pour:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // Récupérer l'utilisateur avec le client auth
          const { data: user, error } = await supabaseAuth
            .from('admin_users')
            .select('*')
            .eq('email', credentials.email)
            .eq('is_active', true)
            .single();
            
          console.log('👤 Recherche utilisateur - Erreur ?', error?.message);
          console.log('👤 Utilisateur trouvé ?', !!user);
            
          if (!user) {
            console.log('❌ Aucun utilisateur trouvé');
            return null;
          }
          
          // Vérifier le mot de passe
          console.log('🔑 Vérification du mot de passe...');
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
          console.log('🔑 Mot de passe valide ?', isValidPassword);
          
          if (!isValidPassword) {
            console.log('❌ Mot de passe incorrect');
            return null;
          }
          
          console.log('✅ Connexion réussie pour', user.email);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          };
        } catch (error) {
          console.error('❌ Erreur lors de l\'authentification:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 4 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
