/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { AudioProvider } from './contexts/AudioContext';
import { AuthProvider } from './contexts/AuthContext';

render(
  () => (
    <AuthProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </AuthProvider>
  ),
  document.getElementById('root') as HTMLElement
);
