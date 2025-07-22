import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, name, password, role, enable2FA } = body;
  
  // Vérifier si l'email existe déjà
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single();
    
  if (existing) {
    return NextResponse.json(
      { error: 'Cet email est déjà utilisé' },
      { status: 400 }
    );
  }
  
  // Hash du mot de passe
  const passwordHash = await bcrypt.hash(password, 12);
  
  let userData: any = {
    email,
    name,
    password_hash: passwordHash,
    role: role || 'admin',
    is_active: true
  };
  
  let qrCode = null;
  let secret = null;
  
  // Si 2FA activé, générer le secret
  if (enable2FA) {
    const secretData = speakeasy.generateSecret({
      name: `GoZo Authentic (${email})`,
      issuer: 'GoZo Authentic',
      length: 32
    });
    
    userData.two_factor_secret = secretData.base32;
    userData.two_factor_enabled = true;
    secret = secretData.base32;
    
    // Générer le QR code en SVG
    try {
      qrCode = await QRCode.toString(secretData.otpauth_url!, {
        type: 'svg',
        width: 200,
        margin: 0
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }
  
  // Créer l'utilisateur
  const { data: user, error } = await supabase
    .from('admin_users')
    .insert([userData])
    .select()
    .single();
    
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    qrCode,
    secret
  });
}
