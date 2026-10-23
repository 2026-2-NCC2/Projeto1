// adesivo decorativo, as imagens ficam em public/adesivos/
// nome = qual adesivo: 'tv' | 'cd' | 'vinil' | 'estrela' | 'fita' | 'globo'
// tamanho = largura em px / rotate = inclinacao em graus / delay = atraso da flutuada em segundos
// className = onde ele fica na pagina (ex: 'right-4 top-6 hidden lg:block'), o pai precisa ser relative
// e e so enfeite: aria-hidden e nao pega clique, entao nao atrapalha formulario nenhum
export default function Sticker({ nome, tamanho = 120, rotate = 0, delay = 0, className = '' }) {
  return (
    <img
      src={`/adesivos/${nome}.webp`}
      alt=""
      aria-hidden="true"
      draggable="false"
      loading="lazy"
      width={tamanho}
      className={`tt-sticker ${className}`}
      style={{ width: tamanho, '--r': `${rotate}deg`, '--d': `${delay}s` }}
    />
  )
}
