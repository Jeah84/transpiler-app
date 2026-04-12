import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token');
      return;
    }

    api<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: { token },
      auth: false,
    })
      .then((data) => {
        setStatus('success');
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Verification failed');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <Logo className="justify-center mb-8" />
        {status === 'loading' && (
          <p className="text-gray-400 text-lg">Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-400 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
            <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300">
              Go to Dashboard
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-400 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-white mb-2">{message}</h1>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
