export const CATEGORIAS = [
  // Moradia
  { id: 'Aluguel',      icon: '🏠', label: 'Aluguel',              grupo: 'Moradia' },
  { id: 'Condomínio',   icon: '🏢', label: 'Condomínio',           grupo: 'Moradia' },
  { id: 'Porto Seguro', icon: '🚗', label: 'Seguro do Carro',      grupo: 'Moradia' },
  // Utilidades
  { id: 'Internet',     icon: '📡', label: 'Internet',             grupo: 'Utilidades' },
  { id: 'Energia',      icon: '⚡', label: 'Energia Elétrica',     grupo: 'Utilidades' },
  // Cartões — Léo
  { id: 'Cartão C6 - Léo',      icon: '💳', label: 'C6 Bank · Léo',         grupo: 'Cartões Léo' },
  { id: 'Cartão C6 - Pais Léo', icon: '💳', label: 'C6 Bank · Pais do Léo', grupo: 'Cartões Léo' },
  { id: 'Cartão Itau - Léo',    icon: '💳', label: 'Itaú · Léo',            grupo: 'Cartões Léo' },
  { id: 'Cartão Nubank - Léo',  icon: '💜', label: 'Nubank · Léo',          grupo: 'Cartões Léo' },
  // Cartões — Zu
  { id: 'Cartão BB - Zu',   icon: '💳', label: 'Banco do Brasil · Zu', grupo: 'Cartões Zu' },
  { id: 'C6 Zu',             icon: '💳', label: 'C6 Bank · Zu',        grupo: 'Cartões Zu' },
  { id: 'Cartão Itaú - Zu', icon: '💳', label: 'Itaú · Zu',           grupo: 'Cartões Zu' },
  // Pessoal & Educação
  { id: 'Celular - Zu', icon: '📱', label: 'Celular · Zu',       grupo: 'Pessoal' },
  { id: 'Inglês Zu',    icon: '📖', label: 'Inglês · Zu',        grupo: 'Educação' },
  { id: 'Inglês Leo',   icon: '📖', label: 'Inglês · Léo',       grupo: 'Educação' },
  { id: 'Unisul',       icon: '🎓', label: 'Faculdade · Unisul', grupo: 'Educação' },
  { id: 'Creche She',   icon: '🐶', label: 'Creche · She',       grupo: 'Educação' },
  // Saúde & Bem-estar
  { id: 'Elase',     icon: '🏋️', label: 'Academia · Elase', grupo: 'Saúde' },
  { id: 'Tenis Leo', icon: '🎾', label: 'Tênis · Léo',       grupo: 'Saúde' },
];

export function catLabel(id) {
  const c = CATEGORIAS.find(x => x.id === id);
  return c ? `${c.icon} ${c.label}` : id;
}
