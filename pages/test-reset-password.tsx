import { useState } from 'react';
import Head from 'next/head';

export default function TestResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !password) {
      setMessage('Token and password are required');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Password reset successfully!');
      } else {
        setMessage(`❌ Error: ${data.message || 'Failed to reset password'}`);
      }
    } catch (error) {
      setMessage('❌ Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Reset Password - RGram</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Test Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Test the password reset API directly
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Reset Token
                </label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter the reset token from email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Enter new password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            {message && (
              <div className={`text-center p-3 rounded-md ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : 'Test Reset Password'}
              </button>
            </div>
          </form>

          <div className="text-center">
            <a 
              href="/forgot-password" 
              className="text-purple-600 hover:text-purple-500 text-sm"
            >
              ← Back to Forgot Password
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
