'use client';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Login with Spotify
    </button>
  );
}