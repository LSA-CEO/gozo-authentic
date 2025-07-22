async function translateSiteContent() {
  console.log('🌐 Traduction automatique du contenu du site...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'site_content'
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

translateSiteContent();
