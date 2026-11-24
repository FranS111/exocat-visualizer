import { Bird, Bug, Fish, PawPrint, Shield, ShieldAlert, ShieldCheck, Turtle, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { LegalStatus, RiskLevel, TaxonGroup } from '../../types';
import { useTheme } from '../../hooks/useTheme';

const GROUP_ICONS: Record<TaxonGroup, ComponentType<LucideProps>> = {
  Fish: Fish,
  Invertebrates: Bug,
  Birds: Bird,
  Herptiles: Turtle,
  Mammals: PawPrint,
};

export function GroupIcon({ group, size = 16, ...rest }: { group: TaxonGroup } & LucideProps) {
  const Icon = GROUP_ICONS[group];
  return <Icon size={size} aria-hidden="true" {...rest} />;
}

export function GroupTag({ group }: { group: TaxonGroup }) {
  const { m } = useI18n();
  const { palette } = useTheme();
  return (
    <span className="group-tag">
      <span className="group-tag__swatch" style={{ background: palette.taxon[group] }} aria-hidden="true">
        <GroupIcon group={group} size={12} color={palette.onFill} strokeWidth={2.4} />
      </span>
      {m.taxon[group]}
    </span>
  );
}

const RISK_ICONS: Record<RiskLevel, ComponentType<LucideProps>> = {
  high: ShieldAlert,
  medium: Shield,
  low: ShieldCheck,
};

export function RiskBadge({ risk, compact = false }: { risk: RiskLevel; compact?: boolean }) {
  const { m } = useI18n();
  const Icon = RISK_ICONS[risk];
  return (
    <span className={`risk-badge risk-badge--${risk}`}>
      <Icon size={13} aria-hidden="true" strokeWidth={2.4} />
      {compact ? m.riskShort[risk] : m.risk[risk]}
    </span>
  );
}

export function LegalBadges({ legal }: { legal: LegalStatus }) {
  const { m } = useI18n();
  if (!legal.eu && !legal.spain) return <span className="legal-badge legal-badge--none">{m.legal.notListed}</span>;
  return (
    <span className="legal-badges">
      {legal.eu && (
        <span className="legal-badge" title={m.legal.euTitle}>
          EU
        </span>
      )}
      {legal.spain && (
        <span className="legal-badge" title={m.legal.esTitle}>
          ES
        </span>
      )}
    </span>
  );
}
