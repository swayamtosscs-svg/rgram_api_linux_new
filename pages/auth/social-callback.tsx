import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const SocialCallback = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Extract token from URL parameters
    const { token } = router.query;
    
    if (token) {
      try {
        // Store the token in localStorage
        localStorage.setItem('auth_token', token as string);
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect to dashboard or home page after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (error) {
        console.error('Error storing token:', error);
        setStatus('error');
        setMessage('Failed to complete authentication. Please try again.');
      }
    } else if (router.isReady) {
      // If router is ready but no token is found
      setStatus('error');
      setMessage('No authentication token received. Please try logging in again.');
    }
  }, [router.isReady, router.query]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Head>
        <title>Authentication Callback</title>
      </Head>

      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        {status === 'loading' && (
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-blue-500 mx-auto"></div>
            <p className="text-gray-600">Completing authentication...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4 mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Authentication Successful</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4 mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Authentication Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialCallback;