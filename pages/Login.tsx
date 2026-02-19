import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-top">
          {/* App Branding */}
          <div className="app-wordmark">PumpPal</div>
          <div className="app-tagline">Make Working Out Fun</div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="forgot">Forgot password?</div>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="btn-primary">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="divider">or</div>

            {/* Apple Sign In (Optional - for future) */}
            <button type="button" className="btn-outline">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              Continue with Apple
            </button>
          </form>
        </div>

        {/* Toggle Sign Up / Sign In */}
        <div className="login-bottom">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Create one'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;