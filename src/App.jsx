import React, { useState } from 'react';
import './App.css';
import Level1 from './components/Level1';
import Level2 from './components/Level2';
import Level3 from './components/Level3';
import Level4 from './components/Level4';
import Level5 from './components/Level5';
import Level6 from './components/Level6';
import Level7 from './components/Level7';

function App() {
  const [level, setLevel] = useState(1);

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
  };

  return (
    <>
      {level === 1 && <Level1 onNextLevel={handleNextLevel} />}
      {level === 2 && <Level2 onNextLevel={handleNextLevel} />}
      {level === 3 && <Level3 onNextLevel={handleNextLevel} />}
      {level === 4 && <Level4 onNextLevel={handleNextLevel} />}
      {level === 5 && <Level5 onNextLevel={handleNextLevel} />}
      {level === 6 && <Level6 onNextLevel={handleNextLevel} />}
      {level === 7 && <Level7 onNextLevel={handleNextLevel} />}
      {level > 7 && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '100px 20px' }}
        >
          <h1 style={{ fontSize: '5rem', textShadow: '4px 4px 0px #ff9f43' }}>🎓 DJ MASTER ! 🎧</h1>
          <p style={{ fontSize: '2rem', color: '#666', maxWidth: '600px', margin: '20px auto' }}>
            Tu as maîtrisé le rythme, le pitch et le paysage musical. Les trains roulent maintenant en parfaite harmonie grâce à toi !
          </p>
          <button 
            className="btn-crayon play-btn" 
            style={{ marginTop: '50px', fontSize: '2.5rem', padding: '20px 50px' }}
            onClick={() => setLevel(1)}
          >
            Rejouer l'Aventure 🎠
          </button>
        </motion.div>
      )}
    </>
  );
}

export default App;
