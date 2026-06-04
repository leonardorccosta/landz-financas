import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORIAS } from '../constants/categorias';

const RESPONSAVEIS = ['Leonardo', 'Zuila', 'Casal'];

export default function ContaModal({ conta, onSave, onClose }) {
  const [form, setForm] = useState({
    nome: '',
    valor: '',
    vencimento: '',
    categoria: CATEGORIAS[0].id,
    responsavel: 'Casal',
    minhaPorc: 50,
    status: 'aberto',
    observacao: '',
  });

  useEffect(() => {
    if (conta) setForm({ ...conta, minhaPorc: conta.minhaPorc ?? 50 });
  }, [conta]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      valor: parseFloat(String(form.valor).replace(',', '.')) || 0,
      minhaPorc: form.responsavel === 'Casal' ? parseInt(form.minhaPorc) : (form.responsavel === 'Leonardo' ? 100 : 0),
    });
  }

  const conjPorc = 100 - parseInt(form.minhaPorc || 0);

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{conta ? 'Editar conta' : 'Nova conta'}</h2>
          <button style={styles.closeBtn} onClick={onClose}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={{...styles.field, flex: 2}}>
              <label style={styles.label}>Nome da conta</label>
              <input style={styles.input} value={form.nome} onChange={e => set('nome', e.target.value)}
                placeholder="Ex: Aluguel, Conta de luz..." required />
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Valor (R$)</label>
              <input style={styles.input} type="text" inputMode="decimal" value={form.valor}
                onChange={e => set('valor', e.target.value)} placeholder="0,00" required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Vencimento (dia)</label>
              <input style={styles.input} type="number" min="1" max="31" value={form.vencimento}
                onChange={e => set('vencimento', e.target.value)} placeholder="Ex: 10" required />
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Categoria</label>
              <select style={styles.input} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Responsável</label>
              <select style={styles.input} value={form.responsavel} onChange={e => set('responsavel', e.target.value)}>
                {RESPONSAVEIS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {form.responsavel === 'Casal' && (
            <div style={styles.field}>
              <label style={styles.label}>
                Divisão — <span style={{color:'var(--leo)'}}>Leonardo: <strong>{form.minhaPorc}%</strong></span> · <span style={{color:'var(--zu)'}}>Zuila: <strong>{conjPorc}%</strong></span>
              </label>
              <input style={styles.range} type="range" min="0" max="100" step="5"
                value={form.minhaPorc} onChange={e => set('minhaPorc', e.target.value)} />
              <div style={styles.barWrap}>
                <div style={{...styles.barFill, width: `${form.minhaPorc}%`, background: 'var(--leo)'}}/>
                <div style={{...styles.barFill, width: `${conjPorc}%`, background: 'var(--zu)'}}/>
              </div>
            </div>
          )}

          <div style={styles.row}>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Status</label>
              <div style={styles.statusGroup}>
                {['aberto', 'pago', 'vencido'].map(s => (
                  <button key={s} type="button"
                    style={{...styles.statusBtn, ...(form.status === s ? styles[`status_${s}`] : {})}}
                    onClick={() => set('status', s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Observação (opcional)</label>
            <input style={styles.input} value={form.observacao}
              onChange={e => set('observacao', e.target.value)} placeholder="Alguma nota..." />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            <button type="submit" style={styles.saveBtn}>
              {conta ? 'Salvar alterações' : 'Adicionar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(26,23,20,.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
    maxHeight: '90dvh', overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(26,23,20,.2)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 28px 0',
  },
  title: { fontSize: 22 },
  closeBtn: {
    background: 'var(--cream2)', border: 'none', borderRadius: 8,
    padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--ink2)',
  },
  form: { padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 },
  row: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 120 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.04em' },
  input: {
    padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--cream3)',
    background: 'var(--cream)', color: 'var(--ink)', outline: 'none',
    width: '100%', appearance: 'auto',
  },
  range: { width: '100%', accentColor: 'var(--accent)' },
  barWrap: { display: 'flex', borderRadius: 4, overflow: 'hidden', height: 6, gap: 2 },
  barFill: { height: '100%', borderRadius: 4, transition: 'width .2s' },
  statusGroup: { display: 'flex', gap: 8 },
  statusBtn: {
    flex: 1, padding: '9px 0', borderRadius: 8, border: '1.5px solid var(--cream3)',
    background: 'var(--cream)', color: 'var(--ink2)', fontWeight: 500, fontSize: 13,
    cursor: 'pointer', transition: 'all .15s',
  },
  status_aberto: { background: 'var(--amber-bg)', borderColor: 'var(--amber)', color: 'var(--amber)' },
  status_pago:   { background: 'var(--green-bg)', borderColor: 'var(--green)', color: 'var(--green)' },
  status_vencido:{ background: 'var(--red-bg)',   borderColor: 'var(--red)',   color: 'var(--red)'   },
  actions: { display: 'flex', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--cream3)',
    background: 'var(--cream)', color: 'var(--ink2)', fontWeight: 500, cursor: 'pointer',
  },
  saveBtn: {
    flex: 2, padding: '12px', borderRadius: 10, background: 'var(--accent)',
    color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
  },
};
