import Dashboard from '@/components/Dashboard';
import { classes, models, records, scenarios, speciesList } from '@/lib/data';

export default function DashboardPage() {
  const species = speciesList
    .map((s) => ({ slug: s.slug, label: s.label, genus: s.genus }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Dashboard
      species={species}
      records={records}
      classes={classes}
      scenarios={scenarios}
      models={models}
    />
  );
}
