import { useEffect, useState } from 'react'
import { solicitar } from '../services/api'
import Aviso from './ui/Aviso'
import { IconCheck } from './ui/Icones'

// lista as empresas que tiveram proposta aceita no evento (GET /eventos/:id/fornecedores)
// o servidor nao manda preco nem mensagem, so o que foi confirmado
export default function FornecedoresConfirmados({ eventoId }) {
  const [dados, setDados] = useState(null) // null = ainda carregando
  const [erro, setErro] = useState('')

  // busca os fornecedores quando a tela abre
  useEffect(() => {
    async function carregar() {
      try {
        setDados(await solicitar(`/eventos/${eventoId}/fornecedores`))
      } catch (e) {
        setErro(e.message)
      }
    }
    carregar()
  }, [eventoId])

  // o servidor manda uma linha por produto, aqui junta tudo por empresa
  const grupos = {}
  for (const item of dados || []) {
    if (!grupos[item.id_fornecedor]) {
      grupos[item.id_fornecedor] = { nome: item.nome_organizacao, itens: [] }
    }
    grupos[item.id_fornecedor].itens.push(item)
  }
  const empresas = Object.values(grupos)

  function conteudo() {
    if (erro) return <Aviso tipo="erro" className="mt-4">{erro}</Aviso>
    if (dados === null) return <p role="status" className="mt-4 text-sm text-tinta/65">Carregando fornecedores…</p>
    if (!empresas.length) return <p className="mt-4 rounded-none border border-dashed border-tinta/20 px-4 py-5 text-sm text-tinta/65">Nenhuma proposta aceita até o momento.</p>

    return (
      <div className="mt-4 divide-y divide-tinta/10 overflow-hidden rounded-none border border-tinta/12 bg-papel">
        {empresas.map((empresa) => (
          <article key={empresa.nome + empresa.itens[0].id} className="flex gap-3 px-4 py-4">
            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-none bg-gel-verde text-tinta"><IconCheck tamanho={14} strokeWidth="2.6" /></span>
            <div className="min-w-0">
              <h3 className="font-bold">{empresa.nome}</h3>
              <ul className="tabular mt-1.5 space-y-1 text-sm text-tinta/70">
                {empresa.itens.map((item) => (
                  <li key={item.id}>{item.quantidade} × {item.descricao_detalhada} — {item.produto}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <section className="mt-2" aria-labelledby="titulo-fornecedores">
      <h2 id="titulo-fornecedores" className="text-2xl font-black tracking-[-0.015em]">Fornecedores confirmados</h2>
      {conteudo()}
    </section>
  )
}
