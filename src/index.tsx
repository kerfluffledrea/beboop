/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';
import { AudioProvider } from './contexts/AudioContext';

render(
  () => (
    <AudioProvider>
      <App />
    </AudioProvider>
  ),
  document.getElementById('root') as HTMLElement
);
