import { useEffect, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface Props {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  startLabel: string;
  endLabel: string;
}

/** Dual-thumb range built from two native inputs, so keyboard & screen-reader support come for free. */
export function YearRangeSlider({ min, max, value, onChange, startLabel, endLabel }: Props) {
  const [local, setLocal] = useState<[number, number]>(value);
  const debounced = useDebouncedValue(local, 120);

  useEffect(() => setLocal(value), [value]);
  useEffect(() => {
    if (debounced[0] !== value[0] || debounced[1] !== value[1]) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  return (
    <div className="year-range">
      <div className="year-range__values" aria-live="polite">
        <output>{local[0]}</output>
        <span aria-hidden="true">—</span>
        <output>{local[1]}</output>
      </div>
      <div
        className="year-range__track"
        style={{ ['--from' as string]: `${pct(local[0])}%`, ['--to' as string]: `${pct(local[1])}%` }}
      >
        <input
          type="range"
          min={min}
          max={max}
          value={local[0]}
          aria-label={startLabel}
          onChange={(e) => setLocal([Math.min(+e.target.value, local[1]), local[1]])}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={local[1]}
          aria-label={endLabel}
          onChange={(e) => setLocal([local[0], Math.max(+e.target.value, local[0])])}
        />
      </div>
      <div className="year-range__scale" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
