const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'test123456';
  const hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpfQaXUIkPnXIa';
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Mot de passe valide ?', isValid);
  
  // Créer un nouveau hash
  const newHash = await bcrypt.hash(password, 12);
  console.log('Nouveau hash:', newHash);
}

testPassword();
