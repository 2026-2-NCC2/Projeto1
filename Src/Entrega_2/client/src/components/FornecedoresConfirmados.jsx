import { useEffect, useState } from 'react'
import { solicitar } from '../services/api'

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
    if (erro) return <p role="alert" className="mt-3">{erro}</p>
    if (dados === null) return <p role="status">Carregando fornecedores…</p>
    if (!empresas.length) return <p className="mt-3 text-sm">Nenhuma proposta aceita até o momento.</p>

    return (
      <div className="mt-4 space-y-3">
        {empresas.map((empresa) => (
          <article key={empresa.nome + empresa.itens[0].id} className="rounded-xl bg-tt-verde-claro p-4">
            <h3 className="font-bold">{empresa.nome}</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {empresa.itens.map((item) => (
                <li key={item.id}>{item.quantidade} × {item.descricao_detalhada} — {item.produto}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    )
  }

  return (
    <section className="mt-6 border-t border-tt-azul-marinho/10 pt-5">
      <h2 className="text-xl font-bold">Fornecedores confirmados</h2>
      {conteudo()}
    </section>
  )
}
