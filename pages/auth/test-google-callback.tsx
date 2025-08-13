import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function TestGoogleCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Test the callback endpoint with the test parameter
  const testCallback = async () => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/google/callback?test=true');
      const data = await response.json();
      setResult(data);
      setStatus('success');
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
      setStatus('success');
    } catch (err) {
      console.error('Error testing callback:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Google OAuth Callback</h1>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={testCallback}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={status === 'loading'}
        >
          Test Callback with test=true
        </button>

        <button 
          onClick={testCallbackError}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          disabled={status === 'loading'}
        >
          Test Callback Error (No Code)
        </button>
      </div>

      {status === 'loading' && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p>Loading...</p>
        </div>
      )}

      {status === 'success' && result && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
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