import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function GoogleAuthTest() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for token in URL on component mount
  useEffect(() => {
    const { token } = router.query;
    if (token && typeof token === 'string') {
      setToken(token);
      localStorage.setItem('auth_token', token);
      setStatus('token_received');
    }
  }, [router.query]);

  // Test the init endpoint
  const testInit = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/google/init');
      const data = await response.json();
      setResult(data);
      setStatus('init_success');
    } catch (err) {
      console.error('Error testing init:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  // Test the callback endpoint with the test parameter
  const testCallback = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/google/callback?test=true&format=json');
      const data = await response.json();
      setResult(data);
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }
      setStatus('callback_success');
    } catch (err) {
      console.error('Error testing callback:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  // Test the callback endpoint without the code parameter to see the error
  const testCallbackError = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/google/callback');
      const data = await response.json();
      setResult(data);
      setStatus('callback_error_success');
    } catch (err) {
      console.error('Error testing callback error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  // Test the simplified test callback endpoint
  const testSimplifiedCallback = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/google/test-callback');
      const data = await response.json();
      setResult(data);
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
      }
      setStatus('simplified_callback_success');
    } catch (err) {
      console.error('Error testing simplified callback:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  // Clear the token
  const clearToken = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setStatus('token_cleared');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Google OAuth Test Page</h1>
      
      {token && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Authentication Token:</h2>
          <p className="mb-2">{token}</p>
          <button 
            onClick={clearToken}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            Clear Token
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={testInit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={status === 'loading'}
        >
          Test Init Endpoint
        </button>

        <button 
          onClick={testCallback}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          disabled={status === 'loading'}
        >
          Test Callback with Mock Data
        </button>

        <button 
          onClick={testCallbackError}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          disabled={status === 'loading'}
        >
          Test Callback Error (No Code)
        </button>

        <button 
          onClick={testSimplifiedCallback}
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          disabled={status === 'loading'}
        >
          Test Simplified Callback
        </button>
      </div>

      {status === 'loading' && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p>Loading...</p>
        </div>
      )}

      {status === 'init_success' && result && result.authUrl && (
        <div className="bg-blue-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Init Result:</h2>
          <p className="mb-2">Auth URL: <a href={result.authUrl} className="text-blue-500 hover:text-blue-700 underline">{result.authUrl}</a></p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {(status === 'callback_success' || status === 'simplified_callback_success') && result && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Callback Result:</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {status === 'callback_error_success' && result && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Expected Error Result:</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {status === 'token_received' && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Token Received from URL:</h2>
          <p>Token has been saved to localStorage.</p>
        </div>
      )}

      {status === 'token_cleared' && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Token Cleared:</h2>
          <p>Token has been removed from localStorage.</p>
        </div>
      )}

      {status === 'error' && error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Error:</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="text-blue-500 hover:text-blue-700">
          Back to Home
        </Link>
      </div>
    </div>
  );
}