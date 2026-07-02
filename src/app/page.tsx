import { redirect } from 'next/navigation';
import archiveData from '../../data/archive.json';

export default function HomePage() {
  const latestWeek = archiveData.weeks[0]?.week;
  if (latestWeek) {
    redirect(`/week/${latestWeek}?lang=zh`);
  }
  // Fallback if no weeks available
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--muted)' }}>
      <p>No data available.</p>
    </div>
  );
}
