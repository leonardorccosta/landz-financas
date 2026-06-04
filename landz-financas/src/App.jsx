import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import Login from './components/Login';
import ContaCard from './components/ContaCard';
import ContaModal from './components/ContaModal';
import Resumo from './components/Resumo';
import { Plus, LogOut, SlidersHorizontal, LayoutList, Settings } from 'lucide-react';
import LancamentoMensal from './components/LancamentoMensal';
import Configuracoes from './components/Configuracoes';
import './index.css';

const STATUS_ORDER = { vencido: 0, aberto: 1, pago: 2 };

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = carregando
  const [contas, setContas] = useState([]);
  const [modal, setModal] = useState(null);     // null | 'new' | conta object
  const [filtro, setFiltro] = useState('todos'); // todos | aberto | pago | vencido
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('home');

  // Auth listener
  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u ?? null));
  }, []);

  // Firestore listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'contas'), orderBy('vencimento'));
    const unsub = onSnapshot(q, snap => {
      setContas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  async function handleSave(data) {
    if (!user) return;
    const col = collection(db, 'users', user.uid, 'contas');
    if (modal?.id) {
      await updateDoc(doc(db, 'users', user.uid, 'contas', modal.id), data);
    } else {
      await addDoc(col, { ...data, criadoEm: new Date().toISOString() });
    }
    setModal(null);
  }

  async function handleDelete(id) {
    if (!user || !confirm('Excluir esta conta?')) return;
    await deleteDoc(doc(db, 'users', user.uid, 'contas', id));
  }

  async function handleToggleStatus(conta) {
    if (!user) return;
    const next = { aberto: 'pago', pago: 'vencido', vencido: 'aberto' }[conta.status] || 'aberto';
    await updateDoc(doc(db, 'users', user.uid, 'contas', conta.id), { status: next });
  }

  // Loading state
  if (user === undefined) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}/>
      </div>
    );
  }

  if (!user) return <Login />;

  if (screen === 'lancamento') {
    return <LancamentoMensal user={user} onVoltar={() => setScreen('home')}/>;
  }

  if (screen === 'configuracoes') {
    return <Configuracoes user={user} onVoltar={() => setScreen('home')}/>;
  }

  const contasFiltradas = contas
    .filter(c => filtro === 'todos' || c.status === filtro)
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1));

  const mesAtual = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.logo}>
              Landz<em style={{fontStyle:'italic', color:'var(--accent)'}}>Finanças</em>
            </h1>
            <p style={styles.mes}>{mesAtual}</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.lanceBtn} onClick={() => setScreen('lancamento')}>
              <LayoutList size={15}/> Lançamento
            </button>
            <button style={styles.addBtn} onClick={() => setModal('new')}>
              <Plus size={16}/> Nova conta
            </button>
            <button style={styles.iconBtn} onClick={() => setScreen('configuracoes')} title="Configurações">
              <Settings size={16}/>
            </button>
            <button style={styles.iconBtn} onClick={() => signOut(auth)} title="Sair">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <Resumo contas={contas} />

        {/* Filtros */}
        <div style={styles.filterRow}>
          <SlidersHorizontal size={14} color="var(--ink3)"/>
          {['todos', 'aberto', 'vencido', 'pago'].map(f => (
            <button
              key={f}
              style={{...styles.filterBtn, ...(filtro === f ? styles.filterBtnActive : {})}}
              onClick={() => setFiltro(f)}
            >
              {f === 'todos' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'todos' && (
                <span style={styles.filterCount}>
                  {contas.filter(c => c.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={styles.centered}><div style={styles.spinner}/></div>
        ) : contasFiltradas.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyTitle}>Nenhuma conta aqui</p>
            <p style={styles.emptySub}>
              {filtro === 'todos'
                ? 'Clique em "Nova conta" para começar.'
                : `Não há contas com status "${filtro}".`}
            </p>
            {filtro === 'todos' && (
              <button style={styles.emptyBtn} onClick={() => setModal('new')}>
                <Plus size={15}/> Adicionar primeira conta
              </button>
            )}
          </div>
        ) : (
          <div style={styles.list}>
            {contasFiltradas.map(c => (
              <ContaCard
                key={c.id}
                conta={c}
                onEdit={conta => setModal(conta)}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal !== null && (
        <ContaModal
          conta={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

const styles = {
  app: { minHeight: '100dvh', background: 'var(--cream)' },
  header: {
    background: '#fff', borderBottom: '1px solid var(--cream3)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: 720, margin: '0 auto', padding: '16px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: { fontSize: 22, letterSpacing: '-0.3px' },
  mes: { fontSize: 12, color: 'var(--ink3)', marginTop: 1, textTransform: 'capitalize' },
  headerActions: { display: 'flex', alignItems: 'center', gap: 8 },
  lanceBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--cream2)', color: 'var(--ink2)', borderRadius: 10,
    padding: '9px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
    border: 'none', transition: 'background .15s',
  },
  addBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--accent)', color: '#fff', borderRadius: 10,
    padding: '9px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
  },
  iconBtn: {
    background: 'var(--cream2)', border: 'none', borderRadius: 8,
    padding: '9px 10px', cursor: 'pointer', display: 'flex',
    color: 'var(--ink2)', transition: 'background .15s',
  },
  main: { maxWidth: 720, margin: '0 auto', padding: '28px 20px 60px' },
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap',
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 14px', borderRadius: 20, border: '1.5px solid var(--cream3)',
    background: '#fff', color: 'var(--ink2)', fontWeight: 500, fontSize: 13, cursor: 'pointer',
    transition: 'all .15s',
  },
  filterBtnActive: {
    background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)',
  },
  filterCount: {
    background: 'rgba(255,255,255,.25)', borderRadius: 10,
    padding: '0 6px', fontSize: 11, fontWeight: 700,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: {
    textAlign: 'center', padding: '60px 20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 20, color: 'var(--ink2)' },
  emptySub: { color: 'var(--ink3)', fontSize: 14 },
  emptyBtn: {
    marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
    background: 'var(--accent)', color: '#fff', borderRadius: 10,
    padding: '10px 20px', fontWeight: 600, cursor: 'pointer',
  },
  centered: {
    minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  spinner: {
    width: 32, height: 32, borderRadius: '50%',
    border: '3px solid var(--cream3)', borderTopColor: 'var(--accent)',
    animation: 'spin 0.8s linear infinite',
  },
};

// inject spinner animation
const styleEl = document.createElement('style');
styleEl.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(styleEl);
