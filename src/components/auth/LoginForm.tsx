import { createSignal } from 'solid-js';
import { useAuth } from '../../contexts/AuthContext';

export function LoginForm(props: { onToggle: () => void }) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email(), password());

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div class="max-w-md">
      <div class="flex items-center justify-center">
        <h2 class="text-2xl">Sign In</h2>
      </div>

      {error() && <div>{error()}</div>}

      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <div class="relative">
            <input
              type="email"
              value={email()}
              onInput={e => setEmail(e.currentTarget.value)}
              class="w-full"
              placeholder="email"
              required
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <input
              type="password"
              value={password()}
              onInput={e => setPassword(e.currentTarget.value)}
              class="w-full"
              placeholder="password"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading()} class="w-full">
          {loading() ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button onClick={props.onToggle} type="button" class="font-medium">
          Sign up
        </button>
      </p>
    </div>
  );
}
