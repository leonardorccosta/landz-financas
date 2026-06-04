import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { ChevronLeft, ChevronRight, Plus, Settings, LogOut, List } from 'lucide-react';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const fmt  = v => v > 0 ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
const zero = () => ({ total: 0, pago: 0, aberto: 0, vencido: 0, leo: 0, zu: 0, count: 0 });

const styleEl = document.createElement('style');
styleEl.textContent = `
  .vm-row { cursor: pointer; transition: background .12s; }
  .vm-row:hover td { background: rgba(42,107,74,.04) !important; }
  .vm-lancar:hover { background: var(--accent) !important; color: #fff !important; border-color: var(--accent) !important; }
  .vm-yearbtn:hover { background: var(--cream3) !important; }
  .vm-iconbtn:hover { background: var(--cream3) !important; }
  .vm-listbtn:hover { background: var(--cream2) !important; }
`;
document.head.appendChild(styleEl);

export default function VisaoMensal({ user, onLancar, onConfiguracoes, onSignOut, onContas }) {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [dados, setDados] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'users', user.uid, 'contas'), where('ano', '==', ano))
        );
        const grouped = {};
        snap.forEach(doc => {
          const c = doc.data();
          const m = c.mes;
          if (!m) return;
          if (!grouped[m]) grouped[m] = zero();
          const v = c.valor || 0;
          grouped[m].total += v;
          grouped[m].count += 1;
          if (c.status === 'pago')         grouped[m].pago    += v;
          else if (c.status === 'vencido') grouped[m].vencido += v;
          else                             grouped[m].aberto  += v;
          const lp = c.minhaPorc ?? (c.responsavel === 'Leonardo' ? 100 : c.responsavel === 'Zuila' ? 0 : 60);
          grouped[m].leo += v * lp / 100;
          grouped[m].zu  += v * (100 - lp) / 100;
        });
        if (!cancelled) setDados(grouped);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user.uid, ano]);

  const anual = Object.values(dados).reduce(
    (a, m) => ({
      total:   a.total   + m.total,
      pago:    a.pago    + m.pago,
      aberto:  a.aberto  + m.aberto,
      vencido: a.vencido + m.vencido,
      leo:     a.leo     + m.leo,
      zu:      a.zu      + m.zu,
    }),
    { total: 0, pago: 0, aberto: 0, vencido: 0, leo: 0, zu: 0 }
  );

  return (
    <div style={S.page}>
      <header style={S.header}>
        <div style={S.hInner}>
          <div>
            <h1 style={S.logo}>
              Landz<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>Finanças</em>
            </h1>
            <p style={S.sub}>Visão Mensal</p>
          </div>
          <div style={S.hActions}>
            <button className="vm-listbtn" style={S.listBtn} onClick={onContas} title="Ver todas as contas">
              <List size={15}/> Contas
            </button>
            <button className="vm-iconbtn" style={S.iconBtn} onClick={onConfiguracoes} title="Configurações">
              <Settings size={16}/>
            </button>
            <button className="vm-iconbtn" style={S.iconBtn} onClick={onSignOut} title="Sair">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </header>

      <main style={S.main}>
        {/* Navegação de ano */}
        <div style={S.yearRow}>
          <button className="vm-yearbtn" style={S.yearBtn} onClick={() => setAno(a => a - 1)}>
            <ChevronLeft size={18}/>
          </button>
          <span style={S.yearLabel}>{ano}</span>
          <button className="vm-yearbtn" style={S.yearBtn} onClick={() => setAno(a => a + 1)}>
            <ChevronRight size={18}/>
          </button>
        </div>

        {/* Cards resumo anual */}
        <div style={S.cards}>
          <div style={S.card}>
            <span style={S.cardLabel}>Total {ano}</span>
            <span style={S.cardBig}>{fmt(anual.total)}</span>
          </div>
          <div style={{ ...S.card, borderLeft: '3px solid var(--green)' }}>
            <span style={S.cardLabel}>✅ Pago</span>
            <span style={{ ...S.cardBig, color: 'var(--green)' }}>{fmt(anual.pago)}</span>
          </div>
          <div style={{ ...S.card, borderLeft: '3px solid var(--amber)' }}>
            <span style={S.cardLabel}>⏳ Em aberto</span>
            <span style={{ ...S.cardBig, color: 'var(--amber)' }}>{fmt(anual.aberto)}</span>
          </div>
          <div style={{ ...S.card, borderLeft: '3px solid var(--red)' }}>
            <span style={S.cardLabel}>⚠️ Vencido</span>
            <span style={{ ...S.cardBig, color: 'var(--red)' }}>{fmt(anual.vencido)}</span>
          </div>
        </div>

        {/* Tabela mensal */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={S.spinnerWrap}><div style={S.spinner}/></div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Mês</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Contas</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Total</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>✅ Pago</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>⏳ Aberto</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>⚠️ Vencido</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>🔵 Léo</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>🌸 Zu</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((nome, idx) => {
                  const m  = idx + 1;
                  const d  = dados[m];
                  const isCurrent = m === now.getMonth() + 1 && ano === now.getFullYear();
                  return (
                    <tr
                      key={m}
                      className="vm-row"
                      style={{ ...S.tr, ...(isCurrent ? S.trCurrent : {}) }}
                      onClick={() => onLancar(m, ano)}
                    >
                      <td style={S.tdMes}>
                        {isCurrent && <span style={S.badgeAtual}>Atual</span>}
                        <span style={{ fontWeight: isCurrent ? 700 : 500 }}>{nome}</span>
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: 'var(--ink3)' }}>
                        {d ? d.count : '—'}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: d ? 600 : 400 }}>
                        {fmt(d?.total ?? 0)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: d?.pago > 0 ? 'var(--green)' : 'var(--ink3)' }}>
                        {fmt(d?.pago ?? 0)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: d?.aberto > 0 ? 'var(--amber)' : 'var(--ink3)' }}>
                        {fmt(d?.aberto ?? 0)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: d?.vencido > 0 ? 'var(--red)' : 'var(--ink3)' }}>
                        {fmt(d?.vencido ?? 0)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: 'var(--leo)' }}>
                        {fmt(d?.leo ?? 0)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'right', color: 'var(--zu)' }}>
                        {fmt(d?.zu ?? 0)}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center' }}>
                        <button
                          className="vm-lancar"
                          style={S.lancarBtn}
                          onClick={e => { e.stopPropagation(); onLancar(m, ano); }}
                          title={`Lançar ${nome}`}
                        >
                          <Plus size={13}/> Lançar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={S.tfRow}>
                  <td style={S.tfLabel} colSpan={2}>Total {ano}</td>
                  <td style={{ ...S.tfNum, fontWeight: 700, color: 'var(--ink)' }}>{fmt(anual.total)}</td>
                  <td style={{ ...S.tfNum, color: 'var(--green)' }}>{fmt(anual.pago)}</td>
                  <td style={{ ...S.tfNum, color: 'var(--amber)' }}>{fmt(anual.aberto)}</td>
                  <td style={{ ...S.tfNum, color: 'var(--red)' }}>{fmt(anual.vencido)}</td>
                  <td style={{ ...S.tfNum, color: 'var(--leo)' }}>{fmt(anual.leo)}</td>
                  <td style={{ ...S.tfNum, color: 'var(--zu)' }}>{fmt(anual.zu)}</td>
                  <td/>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

const S = {
  page:    { minHeight: '100dvh', background: 'var(--cream)' },
  header:  { background: '#fff', borderBottom: '1px solid var(--cream3)', position: 'sticky', top: 0, zIndex: 100 },
  hInner:  { maxWidth: 1100, margin: '0 auto', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo:    { fontSize: 22, letterSpacing: '-0.3px' },
  sub:     { fontSize: 11, color: 'var(--ink3)', marginTop: 1, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 },
  hActions:{ display: 'flex', alignItems: 'center', gap: 8 },
  listBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--cream2)', color: 'var(--ink2)', borderRadius: 10, padding: '9px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer', border: 'none', transition: 'background .15s' },
  iconBtn: { background: 'var(--cream2)', border: 'none', borderRadius: 8, padding: '9px 10px', cursor: 'pointer', display: 'flex', color: 'var(--ink2)', transition: 'background .15s' },

  main:    { maxWidth: 1100, margin: '0 auto', padding: '28px 20px 60px' },

  yearRow:  { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  yearBtn:  { background: 'var(--cream2)', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', display: 'flex', color: 'var(--ink2)', transition: 'background .15s' },
  yearLabel:{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--ink)', letterSpacing: '-0.5px' },

  cards:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 },
  card:     { background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--cream3)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 6 },
  cardLabel:{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.05em' },
  cardBig:  { fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.3px' },

  tableWrap:{ overflowX: 'auto', borderRadius: 14, border: '1px solid var(--cream3)', background: '#fff', boxShadow: 'var(--shadow-lg)' },
  table:    { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th:       { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--cream)', borderBottom: '1.5px solid var(--cream3)', whiteSpace: 'nowrap' },
  tr:       { borderBottom: '1px solid var(--cream3)' },
  trCurrent:{ background: 'rgba(42,107,74,.04)' },
  td:       { padding: '13px 14px', fontSize: 14, color: 'var(--ink)' },
  tdMes:    { padding: '13px 14px', fontSize: 14, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' },
  badgeAtual:{ background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, letterSpacing: '.04em', textTransform: 'uppercase' },

  lancarBtn:{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--cream3)', background: '#fff', color: 'var(--ink2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' },

  tfRow:    { background: 'var(--cream)', borderTop: '2px solid var(--cream3)' },
  tfLabel:  { padding: '14px 14px', fontSize: 12, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.04em' },
  tfNum:    { padding: '14px 14px', textAlign: 'right', fontSize: 14, fontWeight: 600 },

  spinnerWrap: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  spinner:     { width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--cream3)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' },
};
