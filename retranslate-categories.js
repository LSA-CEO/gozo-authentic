async function retranslateCategories() {
  console.log('🌐 Re-traduction des catégories avec le système Groq...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/translate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: 'categories'
      })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
    
    if (result.success) {
      console.log('\n✅ Les catégories devraient maintenant être traduites correctement !');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

retranslateCategories();
