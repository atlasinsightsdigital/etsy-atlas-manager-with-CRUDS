import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect directly to the dashboard since there's no authentication.
  redirect('/dashboard');
}
