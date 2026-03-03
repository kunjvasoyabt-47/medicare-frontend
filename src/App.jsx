import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main>
      {isLogin ? (
        <Login togglePage={() => setIsLogin(false)} />
      ) : (
        <Register togglePage={() => setIsLogin(true)} />
      )}
    </main>
  );
}

export default App;