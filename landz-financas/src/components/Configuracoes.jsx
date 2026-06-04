import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, Save, Info } from 'lucide-react';

const CATEGORIAS = [
  'Aluguel', 'Condomínio', 'Porto Seguro', 'Internet', 'Energia',
  'Cartão C6 - Léo', 'Cartão C6 - Pais Léo', 'Cartão Itau - Léo',
  'Cartão Nubank - Léo', 'Cartão BB - Zu', 'C6 Zu', 'Cartão Itaú - Zu',
  'Celular - Zu', 'Inglês Zu', 'Inglês Leo', 'Elase', 'Tenis Leo',
  'Unisul', 'Creche She',
];

const styleEl = document.createElement('style');
styleEl.textContent = `
  .cfg-cell:hover { background: var(--cream) !important; }
  .cfg-cell:focus { background: var(--cream2) !important; border-color: var(--cream3) !important; outline: none; }
  .cfg-row:hover td { background: rgba(42,107,74,.035); }
  .cfg-save:hover:not(:disabled) { opacity: .85 !important; }
  .cfg-back:hover { background: var(--cream3) !important; }
`;
document.head.appendChild(styleEl);

const DEFAULTS = { valor: '', responsavel: 'Casal', divisao: 60 };

function get(config, cat, field) {
  return config[cat]?.[field] ?? DEFAULTS[field];
}

export default function Configuracoes({ user, onVoltar }) {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid, 'configuracoes', 'categorias'));
        if (snap.exists()) setConfig(snap.data());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.uid]);

  function upd(cat, field, val) {
    setConfig(c => ({
      ...c,
      [cat]: { ...DEFAULTS, ...c[cat], [field]: val },
    }));
  }

  async function salvar() {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'configuracoes', 'categorias'), config);
      onVoltar();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={S.page}>
        <div style={S.centered}><div style={S.spinner}/></div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.hInner}>
          <div style={S.hLeft}>
            <button className="cfg-back" style={S.backBtn} onClick={onVoltar} title="Voltar">
              <ChevronLeft size={20}/>
            </button>
            <div>
              <h1 style={S.logo}>
                Landz<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Finanças</em>
              </h1>
              <p style={S.sub}>Configuração de Categorias</p>
            </div>
          </div>
          <button
            className="cfg-save"
            style={{ ...S.saveBtn, opacity: saving ? .6 : 1 }}
            onClick={salvar}
            disabled={saving}
          >
            <Save size={15}/> {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.hint}>
          <Info size={14} color="var(--ink3)"/>
          <span>
            Defina os valores padrão de cada categoria. Deixe o valor em branco para preencher
            manualmente no Lançamento Mensal.
          </span>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <colgroup>
              <col style={{ minWidth: 180 }}/>
              <col style={{ minWidth: 130 }}/>
              <col style={{ minWidth: 120 }}/>
              <col style={{ minWidth: 88 }}/>
            </colgroup>
            <thead>
              <tr>
                <th style={S.th}>Categoria</th>
                <th style={S.th}>Valor padrão R$</th>
                <th style={S.th}>Responsável</th>
                <th style={S.th}>Div. %</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIAS.map(cat => {
                const resp = get(config, cat, 'responsavel');
                return (
                  <tr key={cat} className="cfg-row" style={S.tr}>
                    <td style={{ ...S.td, ...S.catCell }}>{cat}</td>
                    <td style={S.td}>
                      <input
                        className="cfg-cell" style={S.cell}
                        type="text" inputMode="decimal"
                        placeholder="Livre"
                        value={get(config, cat, 'valor')}
                        onChange={e => upd(cat, 'valor', e.target.value)}
                      />
                    </td>
                    <td style={S.td}>
                      <select
                        className="cfg-cell" style={S.cell}
                        value={resp}
                        onChange={e => upd(cat, 'responsavel', e.target.value)}
                      >
                        <option>Leonardo</option>
                        <option>Zuila</option>
                        <option>Casal</option>
                      </select>
                    </td>
                    <td style={S.td}>
                      {resp === 'Casal'
                        ? <input
                            className="cfg-cell"
                            style={{ ...S.cell, textAlign: 'center' }}
                            type="number" min="0" max="100"
                            value={get(config, cat, 'divisao')}
                            onChange={e => upd(cat, 'divisao', e.target.value)}
                          />
                        : <span style={S.dash}>—</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={S.footer}>
          <button
            className="cfg-save"
            style={{ ...S.saveBtn, opacity: saving ? .6 : 1 }}
            onClick={salvar}
            disabled={saving}
          >
            <Save size={15}/> {saving ? 'Salvando…' : 'Salvar configurações'}
          </button>
        </div>
      </main>
    </div>
  );
}

const S = {
  page:    { minHeight: '100dvh', background: 'var(--cream)' },
  centered:{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--cream3)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' },
  header:  { background: '#fff', borderBottom: '1px solid var(--cream3)', position: 'sticky', top: 0, zIndex: 100 },
  hInner:  { maxWidth: 760, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hLeft:   { display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'var(--cream2)', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', display: 'flex', color: 'var(--ink2)', transition: 'background .15s' },
  logo:    { fontSize: 20, letterSpacing: '-0.3px' },
  sub:     { fontSize: 11, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginTop: 1 },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--accent)', color: '#fff', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'opacity .15s', border: 'none' },

  main:    { maxWidth: 760, margin: '0 auto', padding: '28px 20px 80px' },
  hint:    { display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fff', border: '1px solid var(--cream3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--ink3)', lineHeight: 1.5 },

  tableWrap: { overflowX: 'auto', borderRadius: 14, border: '1px solid var(--cream3)', background: '#fff', boxShadow: 'var(--shadow-lg)', marginBottom: 16 },
  table:     { width: '100%', borderCollapse: 'collapse', minWidth: 520 },
  th:        { padding: '12px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--cream)', borderBottom: '1.5px solid var(--cream3)', whiteSpace: 'nowrap' },
  tr:        { borderBottom: '1px solid var(--cream3)' },
  td:        { padding: '3px 3px' },
  catCell:   { padding: '0 12px', fontSize: 14, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap' },
  cell:      { width: '100%', border: '1.5px solid transparent', background: 'transparent', padding: '9px 8px', fontSize: 13, color: 'var(--ink)', borderRadius: 6, fontFamily: 'DM Sans, sans-serif' },
  dash:      { display: 'block', textAlign: 'center', color: 'var(--ink3)', lineHeight: '38px' },

  footer:    { display: 'flex', justifyContent: 'flex-end' },
};
