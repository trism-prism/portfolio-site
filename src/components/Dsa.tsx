import { leetcode, type Difficulty } from '../content/leetcode';
import { buildHeatmap } from '../lib/heatmap';
import { CodeIcon, ExternalIcon } from './Icons';
import { Section } from './Section';
import styles from './Dsa.module.css';

const dash = '—';
const fmt = (n: number | null) => (n === null ? dash : n.toLocaleString('en-US'));

const R = 52;
const C = 2 * Math.PI * R;

function Ring({ rows }: { rows: { key: string; d: Difficulty; color: string }[] }) {
  const solved = rows.map((r) => r.d.solved ?? 0);
  const totals = rows.map((r) => r.d.total ?? 0);
  const allSolved = solved.reduce((a, b) => a + b, 0);
  const allTotal = totals.reduce((a, b) => a + b, 0);
  const known = rows.every((r) => r.d.solved !== null && r.d.total !== null) && allTotal > 0;
  let offset = 0;
  return (
    <div className={styles.ring}>
      <svg viewBox="0 0 120 120" width="136" height="136" role="img" aria-label={known ? `${allSolved} of ${allTotal} problems solved` : 'No problems recorded yet'}>
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--border)" strokeWidth="9" />
        {known &&
          rows.map((r, i) => {
            const len = (solved[i] / allTotal) * C;
            const el = (
              <circle
                key={r.key}
                cx="60"
                cy="60"
                r={R}
                fill="none"
                stroke={r.color}
                strokeWidth="9"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 60 60)"
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className={styles.ringText}>
        <strong>{known ? allSolved.toLocaleString('en-US') : dash}</strong>
        <span className="mono">{known ? `/${allTotal.toLocaleString('en-US')}` : '/—'}</span>
        <span className={`mono ${styles.solved}`}>Solved</span>
      </div>
    </div>
  );
}

export function Dsa() {
  const lc = leetcode;
  const rows = [
    { key: 'Easy', d: lc.easy, color: 'var(--easy)' },
    { key: 'Medium', d: lc.medium, color: 'var(--medium)' },
    { key: 'Hard', d: lc.hard, color: 'var(--hard)' },
  ];
  // Built at deploy time, so the grid ends on the week of the last build.
  const heat = buildHeatmap(lc.submissions, new Date());
  const total = heat.total; // only days inside the 52-week window

  return (
    <Section id="dsa" eyebrow="Problem Solving" title="Data Structures & Algorithms" icon={<CodeIcon size={16} />}>
      <div className={styles.stack}>
        <div className={`card ${styles.stats}`} data-reveal>
          <div>
            <p className={styles.k}>Max Rating</p>
            <p className={styles.v}>{fmt(lc.maxRating)}</p>
          </div>
          <div>
            <p className={styles.k}>Level</p>
            <p className={`${styles.v} ${styles.level}`}>{lc.level ?? dash}</p>
          </div>
          <div>
            <p className={styles.k}>Global Ranking</p>
            <p className={styles.v}>{fmt(lc.globalRanking)}</p>
          </div>
          <div>
            <p className={styles.k}>Attended</p>
            <p className={styles.v}>{fmt(lc.attended)}</p>
          </div>
        </div>

        <div className={styles.cols}>
          <div className={`card ${styles.overview}`} data-reveal>
            <div className={styles.ovHead}>
              <h3>Overview</h3>
              {lc.url && (
                <a href={lc.url} target="_blank" rel="noopener noreferrer" className="extLink">
                  View Profile <ExternalIcon size={13} />
                </a>
              )}
            </div>
            <div className={styles.ovBody}>
              <Ring rows={rows} />
              <ul className={styles.levels}>
                {rows.map((r) => (
                  <li key={r.key} className={styles.level_row}>
                    <span style={{ color: r.color }}>{r.key}</span>
                    <span>
                      <strong>{fmt(r.d.solved)}</strong>
                      <span className={`mono ${styles.of}`}> /{fmt(r.d.total)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`card ${styles.heat}`} data-reveal>
            <div className={styles.heatHead}>
              <p>
                <strong>{total ? total.toLocaleString('en-US') : dash}</strong> submissions in the past year
              </p>
              <p className={`mono ${styles.meta}`}>
                Total active days: <strong>{fmt(lc.activeDays)}</strong> · Max streak: <strong>{fmt(lc.maxStreak)}</strong>
              </p>
            </div>
            <div className={styles.scroll}>
              <div className={styles.months} style={{ gridTemplateColumns: `repeat(${heat.weeks.length}, 1fr)` }} aria-hidden="true">
                {heat.months.map((m) => (
                  <span key={`${m.label}-${m.week}`} style={{ gridColumnStart: m.week + 1 }}>
                    {m.label}
                  </span>
                ))}
              </div>
              <div className={styles.grid} role="img" aria-label={total ? 'Submission heatmap for the past year' : 'Submission heatmap, no submissions recorded yet'}>
                {heat.weeks.flat().map((c) => (
                  <i key={c.date} className={styles[`l${c.level}`]} title={`${c.date}: ${c.count}`} />
                ))}
              </div>
            </div>
            <div className={`mono ${styles.legend}`} aria-hidden="true">
              Less
              {[0, 1, 2, 3, 4].map((l) => (
                <i key={l} className={styles[`l${l}`]} />
              ))}
              More
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
