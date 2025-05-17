const mongoose = require('mongoose');
const JobOffer = require('./model/JobOffer');

mongoose.connect('mongodb://localhost:27017/jobmatcher', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connecté à MongoDB');
  
  try {
    const count = await JobOffer.countDocuments();
    console.log(`Nombre total d'offres dans la base de données : ${count}`);
    
    if (count > 0) {
      const sample = await JobOffer.find().limit(1);
      console.log('Exemple d\'offre :', JSON.stringify(sample[0], null, 2));
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des données:', error);
  } finally {
    mongoose.connection.close();
  }
})
.catch(err => {
  console.error('Erreur de connexion à MongoDB:', err);
}); 