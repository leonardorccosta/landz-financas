import { TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

export default function Resumo({ contas }) {
  const total       = contas.reduce((s, c) => s + c.valor, 0);
  const totalPago   = contas.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);
  const totalAberto = contas.filter(c => c.status !== 'pago').reduce((s, c) => s + c.valor, 0);
  const totalVencido= contas.filter(c => c.status === 'vencido').reduce((s, c) => s + c.valor, 0);

  const minhaTotal = contas.reduce((s, c) => {
    if (c.responsavel === 'Leonardo') return s + c.valor;
    if (c.responsavel === 'Casal') return s + c.valor * (c.minhaPorc / 100);
    return s;
  }, 0);

  const conjTotal = contas.reduce((s, c) => {
    if (c.responsavel === 'Zuila') return s + c.valor;
    if (c.responsavel === 'Casal') return s + c.valor * ((100 - c.minhaPorc) / 100);
    return s;
  }, 0);

  const fmt = v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const pagoPct = total > 0 ? (totalPago / total) * 100 : 0;

  return (
    <div style={styles.wrap}>
      <h2 style={styles.sectionTitle}>Resumo do mês</h2>

      <div style={styles.grid}>
        {/* Total geral */}
        <div style={styles.bigCard}>
          <div style={styles.bigLabel}>Total de contas</div>
          <div style={styles.bigVal}>{fmt(total)}</div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${pagoPct}%`}}/>
          </div>
          <div style={styles.progressLabel}>{pagoPct.toFixed(0)}% pago</div>
        </div>

        {/* Leonardo */}
        <div style={{...styles.partCard, borderColor: 'var(--leo)'}}>
          <div style={styles.partIcon}>🔵</div>
          <div style={{...styles.partLabel, color: 'var(--leo)'}}>Leonardo</div>
          <div style={{...styles.partVal, color: 'var(--leo)'}}>{fmt(minhaTotal)}</div>
        </div>

        {/* Zuila */}
        <div style={{...styles.partCard, borderColor: 'var(--zu)'}}>
          <div style={styles.partIcon}>🌸</div>
          <div style={{...styles.partLabel, color: 'var(--zu)'}}>Zuila</div>
          <div style={{...styles.partVal, color: 'var(--zu)'}}>{fmt(conjTotal)}</div>
        </div>
      </div>

      {/* Status row */}
      <div style={styles.statusRow}>
        <div style={styles.statusItem}>
          <CheckCircle size={15} color="var(--green)"/>
          <span style={{color:'var(--green)', fontWeight:600}}>{fmt(totalPago)}</span>
          <span style={styles.statusLabel}>pago</span>
        </div>
        <div style={styles.divider}/>
        <div style={styles.statusItem}>
          <TrendingDown size={15} color="var(--amber)"/>
          <span style={{color:'var(--amber)', fontWeight:600}}>{fmt(totalAberto)}</span>
          <span style={styles.statusLabel}>em aberto</span>
        </div>
        {totalVencido > 0 && <>
          <div style={styles.divider}/>
          <div style={styles.statusItem}>
            <AlertCircle size={15} color="var(--red)"/>
            <span style={{color:'var(--red)', fontWeight:600}}>{fmt(totalVencido)}</span>
            <span style={styles.statusLabel}>vencido</span>
          </div>
        </>}
      </div>
    </div>
  );
}

const styles = {
  wrap: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 },
  bigCard: {
    gridColumn: '1 / -1',
    background: 'var(--accent)', borderRadius: 'var(--radius)',
    padding: '20px 24px', color: '#fff',
  },
  bigLabel: { fontSize: 12, fontWeight: 600, opacity: .75, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 },
  bigVal: { fontFamily: 'DM Serif Display, serif', fontSize: 32, marginBottom: 16 },
  progressBar: { background: 'rgba(255,255,255,.25)', borderRadius: 4, height: 6, marginBottom: 6 },
  progressFill: { background: '#fff', height: '100%', borderRadius: 4, transition: 'width .4s' },
  progressLabel: { fontSize: 12, opacity: .8 },
  partCard: {
    background: '#fff', borderRadius: 'var(--radius)', padding: '16px 18px',
    border: '2px solid', display: 'flex', flexDirection: 'column', gap: 4,
    boxShadow: 'var(--shadow)',
  },
  partIcon: { fontSize: 18 },
  partLabel: { fontSize: 11, color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' },
  partVal: { fontFamily: 'DM Serif Display, serif', fontSize: 20, marginTop: 2 },
  statusRow: {
    background: '#fff', borderRadius: 10, padding: '14px 20px',
    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
    border: '1px solid var(--cream3)', boxShadow: 'var(--shadow)',
  },
  statusItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 },
  statusLabel: { color: 'var(--ink3)', fontSize: 12 },
  divider: { width: 1, height: 20, background: 'var(--cream3)' },
};
