import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const msgs = {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Usuário não encontrado.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/email-already-in-use': 'E-mail já cadastrado.',
        'auth/weak-password': 'A senha precisa ter ao menos 6 caracteres.',
        'auth/invalid-email': 'E-mail inválido.',
      };
      setError(msgs[err.code] || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>₢</span>
          <h1 style={styles.logoText}>Landz<em style={{fontStyle:'italic',color:'var(--accent)'}}>Finanças</em></h1>
        </div>
        <p style={styles.tagline}>Controle financeiro do casal, simples e juntos.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-mail</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p style={styles.toggle}>
          {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem conta?'}{' '}
          <button
            style={styles.link}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Criar agora' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'var(--cream)',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '48px 40px',
    width: '100%',
    maxWidth: 400,
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--cream3)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 28,
    color: 'var(--accent)',
    fontFamily: 'DM Serif Display, serif',
  },
  logoText: {
    fontSize: 26,
    letterSpacing: '-0.5px',
  },
  tagline: {
    color: 'var(--ink3)',
    fontSize: 14,
    marginBottom: 32,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--ink2)' },
  input: {
    padding: '11px 14px',
    borderRadius: 10,
    border: '1.5px solid var(--cream3)',
    background: 'var(--cream)',
    color: 'var(--ink)',
    transition: 'border-color .15s',
    outline: 'none',
  },
  error: {
    color: 'var(--red)',
    fontSize: 13,
    background: 'var(--red-bg)',
    padding: '10px 14px',
    borderRadius: 8,
  },
  btn: {
    marginTop: 8,
    padding: '13px',
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 15,
    transition: 'opacity .15s',
    letterSpacing: '0.01em',
  },
  toggle: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 13,
    color: 'var(--ink3)',
  },
  link: {
    background: 'none',
    color: 'var(--accent)',
    fontWeight: 600,
    fontSize: 13,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};
