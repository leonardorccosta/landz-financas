import { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Plus, ChevronLeft, Save } from 'lucide-react';
import { CATEGORIAS, catLabel } from '../constants/categorias';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const styleEl = document.createElement('style');
styleEl.textContent = `
  .lm-cell:hover { background: var(--cream) !important; }
  .lm-cell:focus { background: var(--cream2) !important; border-color: var(--cream3) !important; outline: none; }
  .lm-row:hover td { background: rgba(42,107,74,.035); }
  .lm-del:hover { color: var(--red) !important; background: var(--red-bg) !important; }
  .lm-add:hover { background: var(--cream2) !important; border-color: var(--accent) !important; color: var(--accent) !important; }
  .lm-save:hover:not(:disabled) { opacity: .85 !important; }
  .lm-back:hover { background: var(--cream3) !important; }
`;
document.head.appendChild(styleEl);

let _uid = 1;
const novaLinha = (categoria = CATEGORIAS[0].id, preset = {}) => ({
  _id: _uid++,
  categoria,
  valor: preset.valor ?? '',
  vencimento: '',
  responsavel: preset.responsavel ?? 'Casal',
  divisao: preset.divisao ?? 60,
  status: 'aberto',
});


export default function LancamentoMensal({ user, onVoltar, initialMes, initialAno }) {
  const now = new Date();
  const [mes, setMes] = useState(initialMes ?? now.getMonth() + 1);
  const [ano, setAno] = useState(initialAno ?? now.getFullYear());
  const [linhas, setLinhas] = useState([]);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'configuracoes', 'categorias'));
        const cfg = snap.exists() ? snap.data() : {};
        if (!cancelled) setLinhas(CATEGORIAS.map(c => novaLinha(c.id, cfg[c.id] || {})));
      } catch {
        if (!cancelled) setLinhas(CATEGORIAS.map(c => novaLinha(c.id)));
      } finally {
        if (!cancelled) setConfigLoaded(true);
      }
    }
    loadConfig();
    return () => { cancelled = true; };
  }, [user.uid]);

  const upd = (id, f, v) =>
    setLinhas(ls => ls.map(l => l._id === id ? { ...l, [f]: v } : l));

  const totals = linhas.reduce((a, l) => {
    const v = parseFloat(String(l.valor || '').replace(',', '.')) || 0;
    a.total += v;
    if (l.responsavel === 'Leonardo') {
      a.eu += v;
    } else if (l.responsavel === 'Zuila') {
      a.conj += v;
    } else {
      const p = Math.min(100, Math.max(0, parseInt(l.divisao) || 0));
      a.eu += v * p / 100;
      a.conj += v * (100 - p) / 100;
    }
    return a;
  }, { total: 0, eu: 0, conj: 0 });

  async function salvar() {
    const validas = linhas.filter(l => pv(l.valor) > 0);
    if (!validas.length) {
      alert('Adicione pelo menos uma conta com valor.');
      return;
    }
    setSaving(true);
    try {
      const col = collection(db, 'users', user.uid, 'contas');
      await Promise.all(validas.map(l => addDoc(col, {
        nome: catLabel(l.categoria),
        categoria: l.categoria,
        valor: pv(l.valor),
        vencimento: parseInt(l.vencimento) || 1,
        responsavel: l.responsavel,
        minhaPorc: l.responsavel === 'Casal'
          ? (parseInt(l.divisao) || 0)
          : (l.responsavel === 'Leonardo' ? 100 : 0),
        status: l.status,
        observacao: '',
        mes,
        ano,
        criadoEm: new Date().toISOString(),
      })));
      onVoltar();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const fmt = v => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const anos = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const pv = v => parseFloat(String(v || '').replace(',', '.')) || 0;
  const nContas = linhas.filter(l => pv(l.valor) > 0).length;

  if (!configLoaded) {
    return (
      <div style={S.page}>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--cream3)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }}/>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.hInner}>
          <div style={S.hLeft}>
            <button className="lm-back" style={S.backBtn} onClick={onVoltar} title="Voltar">
              <ChevronLeft size={20}/>
            </button>
            <div>
              <h1 style={S.logo}>
                Landz<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Finanças</em>
              </h1>
              <p style={S.sub}>Lançamento Mensal</p>
            </div>
          </div>
          <button
            className="lm-save"
            style={{ ...S.saveBtn, opacity: saving ? .6 : 1 }}
            onClick={salvar}
            disabled={saving}
          >
            <Save size={15}/> {saving ? 'Salvando…' : 'Salvar tudo'}
          </button>
        </div>
      </header>

      <main style={S.main}>
        {/* Seletor de mês/ano */}
        <div style={S.mesRow}>
          <span style={S.mesLabel}>Mês de referência</span>
          <select style={S.mesSelect} value={mes} onChange={e => setMes(+e.target.value)}>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select style={S.mesSelect} value={ano} onChange={e => setAno(+e.target.value)}>
            {anos.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {/* Tabela */}
        <div style={S.tableWrap}>
          <table style={S.table}>
            <colgroup>
              <col style={{ minWidth: 180 }}/>
              <col style={{ minWidth: 100 }}/>
              <col style={{ minWidth: 68 }}/>
              <col style={{ minWidth: 110 }}/>
              <col style={{ minWidth: 68 }}/>
              <col style={{ minWidth: 96 }}/>
              <col style={{ width: 44 }}/>
            </colgroup>
            <thead>
              <tr>
                <th style={S.th}>Categoria</th>
                <th style={S.th}>Valor R$</th>
                <th style={S.th}>Venc.</th>
                <th style={S.th}>Responsável</th>
                <th style={S.th}>Div. %</th>
                <th style={S.th}>Status</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(l => (
                <tr key={l._id} className="lm-row" style={S.tr}>
                  <td style={S.td}>
                    <select
                      className="lm-cell" style={S.cell}
                      value={l.categoria}
                      onChange={e => upd(l._id, 'categoria', e.target.value)}
                    >
                      {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </td>
                  <td style={S.td}>
                    <input
                      className="lm-cell" style={S.cell}
                      type="text" inputMode="decimal" placeholder="0,00"
                      value={l.valor}
                      onChange={e => upd(l._id, 'valor', e.target.value)}
                    />
                  </td>
                  <td style={S.td}>
                    <input
                      className="lm-cell" style={S.cell}
                      type="number" min="1" max="31" placeholder="Dia"
                      value={l.vencimento}
                      onChange={e => upd(l._id, 'vencimento', e.target.value)}
                    />
                  </td>
                  <td style={S.td}>
                    <select
                      className="lm-cell" style={S.cell}
                      value={l.responsavel}
                      onChange={e => upd(l._id, 'responsavel', e.target.value)}
                    >
                      <option>Leonardo</option>
                      <option>Zuila</option>
                      <option>Casal</option>
                    </select>
                  </td>
                  <td style={S.td}>
                    {l.responsavel === 'Casal'
                      ? <input
                          className="lm-cell" style={{ ...S.cell, textAlign: 'center' }}
                          type="number" min="0" max="100"
                          value={l.divisao}
                          onChange={e => upd(l._id, 'divisao', e.target.value)}
                        />
                      : <span style={S.dash}>—</span>
                    }
                  </td>
                  <td style={S.td}>
                    <select
                      className="lm-cell"
                      style={{ ...S.cell, ...statusStyle(l.status) }}
                      value={l.status}
                      onChange={e => upd(l._id, 'status', e.target.value)}
                    >
                      <option value="aberto">Aberto</option>
                      <option value="pago">Pago</option>
                      <option value="vencido">Vencido</option>
                    </select>
                  </td>
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    <button
                      className="lm-del" style={S.delBtn}
                      onClick={() => setLinhas(ls => ls.filter(x => x._id !== l._id))}
                      title="Remover linha"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={S.tfRow}>
                <td style={S.tfLabel}>
                  Totais — {nContas} conta{nContas !== 1 ? 's' : ''}
                </td>
                <td style={S.tfTotal}>{fmt(totals.total)}</td>
                <td/>
                <td colSpan={3} style={S.tfSub}>
                  <span style={{ color: 'var(--leo)', fontWeight: 700 }}>
                    🔵 Leonardo: {fmt(totals.eu)}
                  </span>
                  <span style={{ color: 'var(--ink3)', margin: '0 8px' }}>·</span>
                  <span style={{ color: 'var(--zu)', fontWeight: 700 }}>
                    🌸 Zuila: {fmt(totals.conj)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          className="lm-add" style={S.addBtn}
          onClick={() => setLinhas(ls => [...ls, novaLinha()])}
        >
          <Plus size={14}/> Adicionar linha
        </button>
      </main>
    </div>
  );
}

function statusStyle(s) {
  if (s === 'pago')    return { color: 'var(--green)',  fontWeight: 600 };
  if (s === 'vencido') return { color: 'var(--red)',    fontWeight: 600 };
  return                      { color: 'var(--amber)',  fontWeight: 600 };
}

const S = {
  page:    { minHeight: '100dvh', background: 'var(--cream)' },
  header:  { background: '#fff', borderBottom: '1px solid var(--cream3)', position: 'sticky', top: 0, zIndex: 100 },
  hInner:  { maxWidth: 1280, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hLeft:   { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'var(--cream2)', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', color: 'var(--ink2)', transition: 'background .15s' },
  logo:    { fontSize: 20, letterSpacing: '-0.3px' },
  sub:     { fontSize: 11, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginTop: 1 },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'opacity .15s', border: 'none' },

  main:      { maxWidth: 1280, margin: '0 auto', padding: '28px 20px 80px' },
  mesRow:    { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  mesLabel:  { fontSize: 12, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em' },
  mesSelect: { padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--cream3)', background: '#fff', fontSize: 14, color: 'var(--ink)', cursor: 'pointer', outline: 'none', fontFamily: 'DM Sans, sans-serif' },

  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid var(--cream3)', background: '#fff', boxShadow: 'var(--shadow-lg)', marginBottom: 12 },
  table:     { width: '100%', borderCollapse: 'collapse', minWidth: 600 },
  th:        { padding: '12px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--cream)', borderBottom: '1.5px solid var(--cream3)', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid var(--cream3)' },
  td:        { padding: '3px 3px' },
  cell:      { width: '100%', border: '1.5px solid transparent', background: 'transparent', padding: '7px 8px', fontSize: 13, color: 'var(--ink)', borderRadius: 6, fontFamily: 'DM Sans, sans-serif' },
  dash:      { display: 'block', textAlign: 'center', color: 'var(--ink3)', lineHeight: '34px' },
  delBtn:    { background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', padding: '7px', borderRadius: 6, display: 'flex', transition: 'all .15s' },

  tfRow:   { background: 'var(--cream)', borderTop: '2px solid var(--cream3)' },
  tfLabel: { padding: '13px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.04em' },
  tfTotal: { padding: '13px 10px', fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--ink)' },
  tfSub:   { padding: '13px 10px', fontSize: 13 },

  addBtn: { display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px dashed var(--cream3)', color: 'var(--ink2)', borderRadius: 10, padding: '10px 18px', fontWeight: 500, fontSize: 14, cursor: 'pointer', transition: 'all .15s', marginTop: 4 },
};
