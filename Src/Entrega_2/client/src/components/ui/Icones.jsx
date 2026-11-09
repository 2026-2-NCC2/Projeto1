// Icones do site, todos no mesmo traco (1.8) e com currentColor (pegam a cor do texto).
// tamanho padrao 16px, da pra mudar com a prop "tamanho"
function Svg({ tamanho = 16, children, ...props }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconSol = (p) => <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></Svg>
export const IconLua = (p) => <Svg {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></Svg>
export const IconCalendario = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Svg>
export const IconLocal = (p) => <Svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>
export const IconIngresso = (p) => <Svg {...p}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M13 5v2M13 17v2M13 11v2" /></Svg>
export const IconLista = (p) => <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></Svg>
export const IconMais = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IconBusca = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
export const IconVoltar = (p) => <Svg {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Svg>
export const IconSeta = (p) => <Svg {...p}><path d="M5 12h14M12 5l7 7-7 7" /></Svg>
export const IconSetaDiagonal = (p) => <Svg {...p}><path d="M7 17 17 7M8 7h9v9" /></Svg>
export const IconCheck = (p) => <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>
export const IconX = (p) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>
export const IconRelogio = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
export const IconUsuarios = (p) => <Svg {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Svg>
export const IconRelatorio = (p) => <Svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8" /></Svg>
export const IconAlerta = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></Svg>
export const IconInfo = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>
export const IconLixeira = (p) => <Svg {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></Svg>
export const IconLapis = (p) => <Svg {...p}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></Svg>
export const IconChevron = (p) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
export const IconSom = (p) => <Svg {...p}><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></Svg>
export const IconEscudo = (p) => <Svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Svg>
export const IconPrato = (p) => <Svg {...p}><circle cx="12" cy="12" r="7" /><path d="M3 3v6a2 2 0 0 0 2 2M21 3v18" /></Svg>
export const IconPincel = (p) => <Svg {...p}><path d="M18.4 2.6a2 2 0 0 1 3 3L12 15l-4-4z" /><path d="M7 14a3 3 0 0 0-3 3c0 1.5-1 2.5-2 3 4 1 8-1 8-4a3 3 0 0 0-3-2z" /></Svg>
export const IconCamera = (p) => <Svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></Svg>
export const IconOnibus = (p) => <Svg {...p}><rect x="4" y="3" width="16" height="15" rx="2" /><path d="M4 11h16M8 18v3M16 18v3M8 14.5h.01M16 14.5h.01" /></Svg>
export const IconPalco = (p) => <Svg {...p}><path d="M2 20h20M4 20V9l8-5 8 5v11M9 20v-6h6v6" /></Svg>
export const IconPessoa = (p) => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Svg>
export const IconPredio = (p) => <Svg {...p}><rect x="4" y="2" width="16" height="20" rx="1" /><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" /></Svg>
export const IconHolofote = (p) => <Svg {...p}><path d="M9 3h6l2 6H7z" /><path d="M7 9l-3 12M17 9l3 12M12 9v12" /></Svg>
