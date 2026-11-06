// rolagem suave ate uma secao da pagina (links do tipo href="#id").
// Anima com easing (comeca e termina devagar) em vez do pulo seco do navegador,
// e respeita quem desativou animacoes no sistema.
const DURACAO_MS = 900
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function rolarAteSecao(evento) {
  const id = evento.currentTarget.getAttribute('href')?.replace('#', '')
  const alvo = id && document.getElementById(id)
  if (!alvo) return
  evento.preventDefault()

  // desconta o cabecalho fixo pra o titulo da secao nao ficar escondido
  const cabecalho = document.querySelector('header')
  const deslocamento = cabecalho ? cabecalho.offsetHeight : 0
  const destino = alvo.getBoundingClientRect().top + window.scrollY - deslocamento
  const inicio = window.scrollY
  const distancia = destino - inicio

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, destino)
    return
  }

  const comeco = performance.now()
  function passo(agora) {
    const progresso = Math.min((agora - comeco) / DURACAO_MS, 1)
    window.scrollTo(0, inicio + distancia * easeInOutCubic(progresso))
    if (progresso < 1) requestAnimationFrame(passo)
  }
  requestAnimationFrame(passo)
}
