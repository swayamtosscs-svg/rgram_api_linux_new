import React, { useState, useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Fix hydration issues by using client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient ? <Component {...pageProps} /> : <div style={{ visibility: 'hidden' }}><Component {...pageProps} /></div>}
    </>
  );
}

export default MyApp;