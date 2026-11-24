import { PawPrint } from 'lucide-react';
import { RiskTimeline } from './components/charts/RiskTimeline';
import { TaxonDonut } from './components/charts/TaxonDonut';
import { WatershedChart } from './components/charts/WatershedChart';
import { Hero } from './components/dashboard/Hero';
import { ExplorePage } from './components/explore/ExplorePage';
import { KpiStrip } from './components/dashboard/KpiStrip';
import { ActiveFilters } from './components/filters/ActiveFilters';
import { FilterPanel } from './components/filters/FilterPanel';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { SpeciesMap } from './components/map/SpeciesMap';
import { SpeciesModal } from './components/species/SpeciesModal';
import { SpeciesTable } from './components/species/SpeciesTable';
import { ExocatDataProvider } from './context/ExocatDataContext';
import { FilterProvider } from './context/FilterContext';
import { UiProvider } from './context/UiContext';
import { useExocatData } from './hooks/useExocatData';
import { useI18n } from './hooks/useI18n';
import { useUi } from './hooks/useUi';
import { I18nProvider } from './i18n/I18nContext';
import { ThemeProvider } from './theme/ThemeContext';

function Dashboard() {
  const { m } = useI18n();
  const { viewMode } = useUi();
  if (viewMode === 'explore') {
    return (
      <div className="app-shell app-shell--explore">
        <a className="skip-link" href="#main">
          {m.app.skipLink}
        </a>
        <Header />
        <ExplorePage />
      </div>
    );
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        {m.app.skipLink}
      </a>
      <Header />
      <div className="app-body">
        <FilterPanel />
        <main id="main" className="app-main" tabIndex={-1}>
          <Hero />
          <ActiveFilters />
          <KpiStrip />
          <div className="dashboard-grid">
            <SpeciesMap />
            <TaxonDonut />
            <WatershedChart />
            <RiskTimeline />
            <SpeciesTable />
          </div>
          <Footer />
        </main>
      </div>
      <SpeciesModal />
    </div>
  );
}

function LoadingScreen() {
  const { m } = useI18n();
  return (
    <div className="splash" role="status" aria-live="polite">
      <span className="splash__mark" aria-hidden="true">
        <PawPrint size={28} />
      </span>
      <p>{m.app.loading}</p>
    </div>
  );
}

function DataGate() {
  const { m } = useI18n();
  const { status, data, error, reload } = useExocatData();
  if (status === 'loading' || (!data && status !== 'error')) return <LoadingScreen />;
  if (status === 'error' || !data) {
    return (
      <div className="splash" role="alert">
        <p>{m.app.loadError(error)}</p>
        <button type="button" className="button button--primary" onClick={reload}>
          {m.app.retry}
        </button>
      </div>
    );
  }
  return (
    <FilterProvider data={data}>
      <UiProvider>
        <Dashboard />
      </UiProvider>
    </FilterProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ExocatDataProvider>
          <DataGate />
        </ExocatDataProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
