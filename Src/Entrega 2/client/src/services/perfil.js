// perfil do usuario logado + usuarios de demonstracao
// o Login salva o usuario em localStorage ('usuario'); o seletor "Ver como" salva um desses usuarios demo no mesmo lugar
// perfis (iguais ao ENUM usuario.perfil do banco): 'admin' | 'organizador' | 'cliente' | 'fornecedor'

// usuarios falsos pra testar cada visao sem precisar cadastrar
// o organizador usa o id 99, o mesmo "dono" dos eventos de exemplo do painel
export const PERFIS_DEMO = [
  // cada perfil tem: o codigo do perfil, o nome que aparece, um emoji, a pagina principal e o usuario falso
  { perfil: 'admin',       label: 'Administrador', emoji: '🛡️', home: '/AdminDashboard',            usuario: { id_usuario: 1,  nome: 'Ana Administradora', email: 'admin@demo.trocaticket', perfil: 'admin', demo: true } },
  { perfil: 'organizador', label: 'Organizador',   emoji: '🎪', home: '/PainelDeEventos?tab=meus',  usuario: { id_usuario: 99, nome: 'Otávio Organizador', email: 'organizador@demo.trocaticket', perfil: 'organizador', demo: true } },
  { perfil: 'cliente',     label: 'Usuário',       emoji: '👤', home: '/PainelDeEventos',           usuario: { id_usuario: 3,  nome: 'Carla Cliente', email: 'cliente@demo.trocaticket', perfil: 'cliente', demo: true } },
  { perfil: 'fornecedor',  label: 'Fornecedor',    emoji: '🏢', home: '/PainelFornecedor',          usuario: { id_usuario: 4,  nome: 'Felipe Fornecedor', email: 'fornecedor@demo.trocaticket', perfil: 'fornecedor', demo: true } },
];

// le o usuario salvo ({ id_usuario, nome, email, perfil }) ou null se ninguem entrou
export function lerUsuario() {
  // try/catch = se der erro (ex: nada salvo ou navegador bloqueando), devolve null em vez de quebrar
  try {
    // localStorage guarda texto, entao o JSON.parse transforma de volta em objeto
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
}

// perfil atual em minusculo, ou 'visitante' se ninguem entrou
export function lerPerfil() {
  // ?. = se nao tiver usuario ou perfil, nao da erro, so devolve vazio
  return lerUsuario()?.perfil?.toLowerCase() || 'visitante';
}

// troca pro usuario demo do perfil escolhido (ou sai, se for 'visitante')
export function entrarComoDemo(perfil) {
  try {
    // procura o perfil escolhido na lista
    const demo = PERFIS_DEMO.find((p) => p.perfil === perfil);
    // achou: salva o usuario falso como se tivesse feito login
    if (demo) localStorage.setItem('usuario', JSON.stringify(demo.usuario));
    // nao achou (Visitante): apaga o usuario, como um logout
    else localStorage.removeItem('usuario');
  } catch {
    // sem localStorage (ex: aba anonima bloqueada) a troca so nao fica salva
  }
}

// sai da conta
export function sair() {
  try {
    // apaga o usuario salvo
    localStorage.removeItem('usuario');
  } catch {
    // ignora
  }
}
