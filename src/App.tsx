import './App.css';
import { Soundboard } from './components/Soundboard';
import { useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/auth/AuthScreen';

function App() {
  const { user, loading } = useAuth();

  if (loading()) {
    return <span>Loading...</span>;
  }

  if (!user()) {
    return <AuthScreen />;
  }

  return (
    <main class="container">
      <Soundboard />
    </main>
  );
}

export default App;
