import { createSignal } from 'solid-js';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthScreen() {
  const [isLogin, setIsLogin] = createSignal(true);

  return (
    <div class="min-h-screen">
      {isLogin() ? (
        <LoginForm onToggle={() => setIsLogin(false)} />
      ) : (
        <SignupForm onToggle={() => setIsLogin(true)} />
      )}
    </div>
  );
}
