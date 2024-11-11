import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Playlists from '../components/Playlists';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');

  if (!accessToken) {
    redirect('/');
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Your Spotify Dashboard</h1>
      <Playlists />
    </main>
  );
}