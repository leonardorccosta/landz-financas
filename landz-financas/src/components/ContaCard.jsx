import { Pencil, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pago:    { icon: CheckCircle, color: 'var(--green)',  bg: 'var(--green-bg)',  label: 'Pago'    },
  aberto:  { icon: Clock,       color: 'var(--amber)',  bg: 'var(--amber-bg)',  label: 'Em aberto'},
  vencido: { icon: AlertCircle, color: 'var(--red)',    bg: 'var(--red-bg)',    label: 'Vencido' },
};

export default function ContaCard({ conta, onEdit, onDelete, onToggleStatus }) {
  const cfg = STATUS_CONFIG[conta.status] || STATUS_CONFIG.aberto;
  const Icon = cfg.icon;

  const minhaParcelaVal = conta.responsavel === 'Casal'
    ? (conta.valor * (conta.minhaPorc / 100))
    : conta.responsavel === 'Leonardo' ? conta.valor : 0;

  const conjParcelaVal = conta.responsavel === 'Casal'
    ? (conta.valor * ((100 - conta.minhaPorc) / 100))
    : conta.responsavel === 'Zuila' ? conta.valor : 0;

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div style={styles.info}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{conta.nome}</span>
            <span style={styles.cat}>{conta.categoria}</span>
          </div>
          {conta.observacao && <p style={styles.obs}>{conta.observacao}</p>}
        </div>
        <div style={styles.valor}>
          R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div style={styles.mid}>
        <div style={styles.meta}>
          <span style={styles.metaItem}>📅 Dia {conta.vencimento}</span>
          <span style={styles.metaItem}>👤 {conta.responsavel}</span>
          {conta.responsavel === 'Casal' && (
            <span style={styles.metaItem}>
              <span style={{color:'var(--leo)'}}>Leonardo {conta.minhaPorc}%</span>
              {' · '}
              <span style={{color:'var(--zu)'}}>Zuila {100 - conta.minhaPorc}%</span>
            </span>
          )}
        </div>
      </div>

      {conta.responsavel === 'Casal' && (
        <div style={styles.divisao}>
          <div style={styles.divItem}>
            <span style={{...styles.divLabel, color:'var(--leo)'}}>Leonardo</span>
            <span style={{...styles.divVal, color:'var(--leo)'}}>R$ {minhaParcelaVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div style={{...styles.divBar, width: `${conta.minhaPorc}%`, background: 'var(--leo)'}} />
          <div style={styles.divItem}>
            <span style={{...styles.divLabel, color:'var(--zu)'}}>Zuila</span>
            <span style={{...styles.divVal, color:'var(--zu)'}}>R$ {conjParcelaVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}

      <div style={styles.bottom}>
        <button
          style={{...styles.statusBtn, background: cfg.bg, color: cfg.color, borderColor: cfg.color}}
          onClick={() => onToggleStatus(conta)}
        >
          <Icon size={13}/>
          {cfg.label}
        </button>
        <div style={styles.actions}>
          <button style={styles.iconBtn} onClick={() => onEdit(conta)} title="Editar">
            <Pencil size={15}/>
          </button>
          <button style={{...styles.iconBtn, color: 'var(--red)'}} onClick={() => onDelete(conta.id)} title="Excluir">
            <Trash2 size={15}/>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--cream3)',
    padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12,
    boxShadow: 'var(--shadow)', transition: 'box-shadow .2s',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  info: { flex: 1, minWidth: 0 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontWeight: 600, fontSize: 15, color: 'var(--ink)' },
  cat: {
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
    background: 'var(--cream2)', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.04em',
  },
  obs: { fontSize: 12, color: 'var(--ink3)', marginTop: 2 },
  valor: { fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--ink)', whiteSpace: 'nowrap' },
  mid: {},
  meta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  metaItem: { fontSize: 12, color: 'var(--ink3)' },
  divisao: {
    background: 'var(--cream)', borderRadius: 8, padding: '10px 12px',
    display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 8,
  },
  divItem: { display: 'flex', flexDirection: 'column', gap: 1 },
  divLabel: { fontSize: 11, color: 'var(--ink3)', fontWeight: 500 },
  divVal: { fontSize: 13, fontWeight: 600, color: 'var(--ink)' },
  divBar: {
    height: 4, background: 'var(--accent)', borderRadius: 2, maxWidth: '100%',
    justifySelf: 'center', minWidth: 4,
  },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusBtn: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
    borderRadius: 20, border: '1px solid', fontWeight: 600, fontSize: 12, cursor: 'pointer',
    transition: 'opacity .15s',
  },
  actions: { display: 'flex', gap: 4 },
  iconBtn: {
    background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer',
    padding: '6px', borderRadius: 6, display: 'flex', transition: 'background .15s',
  },
};
