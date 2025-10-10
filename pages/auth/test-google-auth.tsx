import { useState } from 'react';
import Head from 'next/head';

const TestGoogleAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [callbackResult, setCallbackResult] = useState<any>(null);

  const initiateGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/auth/google/init');
      const data = await response.json();
      
      if (data.success && data.data?.authUrl) {
        setAuthUrl(data.data.authUrl);
      } else {
        setError(data.message || 'Failed to get Google auth URL');
      }
    } catch (err: any) {
      console.error('Error initiating Google auth:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testCallbackEndpoint = async () => {
    try {
      setLoading(true);
      setError('');
      setCallbackResult(null);
      
      // Test the callback endpoint directly without a code
      const response = await fetch('/api/auth/google/callback');
      const data = await response.json();
      
      setCallbackResult({
        status: response.status,
        statusText: response.statusText,
        data
      });
    } catch (err: any) {
      console.error('Error testing callback endpoint:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>Test Google Authentication</title>
      </Head>

      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Test Google Authentication</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Step 1: Initiate Google Auth</h2>
          <button
            onClick={initiateGoogleAuth}
            disabled={loading}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Google Auth URL'}
          </button>

          {authUrl && (
            <div className="mt-4">
              <p className="mb-2 font-medium text-gray-700">Auth URL Generated:</p>
              <div className="rounded-md bg-gray-100 p-3">
                <p className="break-all text-sm text-gray-800">{authUrl}</p>
              </div>
              <a
                href={authUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Open Auth URL
              </a>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-700">Step 2: Test Callback Endpoint</h2>
          <p className="mb-4 text-gray-600">
            This will test the callback endpoint without a valid code parameter to verify error handling.
          </p>
          <button
            onClick={testCallbackEndpoint}
            disabled={loading}
            className="rounded-md bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Callback Endpoint'}
          </button>

          {callbackResult && (
            <div className="mt-4">
              <p className="mb-2 font-medium text-gray-700">Callback Response:</p>
              <div className="rounded-md bg-gray-100 p-3">
                <p className="text-sm text-gray-800">
                  <strong>Status:</strong> {callbackResult.status} {callbackResult.statusText}
                </p>
                <pre className="mt-2 overflow-auto text-sm text-gray-800">
                  {JSON.stringify(callbackResult.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-md bg-yellow-50 p-4 text-yellow-700">
          <h3 className="font-semibold">Important Notes:</h3>
          <ul className="mt-2 list-inside list-disc">
            <li>Make sure your Google OAuth credentials are properly configured in the .env file</li>
            <li>The callback URL in Google Cloud Console should match your GOOGLE_CALLBACK_URL environment variable</li>
            <li>When testing with the auth URL, Google will redirect back to your callback endpoint with a code</li>
            <li>The callback endpoint will then redirect to /auth/social-callback with a token</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestGoogleAuth;