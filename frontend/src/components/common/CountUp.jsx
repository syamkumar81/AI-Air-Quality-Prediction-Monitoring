import React, { useEffect, useState } from 'react';

/**
 * Robust CountUp Component
 * Accepts either `value` or `end` prop.
 * Handles decimals, integer comma formatting, prefixes, and suffixes.
 */
export default function CountUp({
  value,
  end,
  duration = 800,
  decimals,
  prefix = '',
  suffix = '',
  className = ''
}) {
  const targetRaw = value !== undefined ? value : end;
  const num = targetRaw !== null && targetRaw !== undefined && targetRaw !== '' ? Number(targetRaw) : NaN;

  // Determine decimals: if specified, use it; else detect from targetRaw
  const resolvedDecimals = (() => {
    if (decimals !== undefined && decimals !== null) return decimals;
    if (typeof targetRaw === 'string' && targetRaw.includes('.')) {
      return targetRaw.split('.')[1].length;
    }
    if (typeof targetRaw === 'number' && !Number.isInteger(targetRaw)) {
      const parts = targetRaw.toString().split('.');
      return parts.length > 1 ? parts[1].length : 0;
    }
    return 0;
  })();

  const [displayVal, setDisplayVal] = useState(() => (isNaN(num) ? targetRaw : 0));

  useEffect(() => {
    if (isNaN(num)) {
      setDisplayVal(targetRaw);
      return;
    }

    let startTimestamp = null;
    const startValue = 0;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic: 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (num - startValue) * easeProgress;

      setDisplayVal(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayVal(num);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [num, duration, targetRaw]);

  if (targetRaw === null || targetRaw === undefined || isNaN(num)) {
    return <span className={className}>{targetRaw ?? '—'}</span>;
  }

  const currentNumeric = typeof displayVal === 'number' ? displayVal : num;

  const formatted = resolvedDecimals > 0
    ? currentNumeric.toFixed(resolvedDecimals)
    : Math.round(currentNumeric).toLocaleString();

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
