import { useEffect, useState } from 'react'
import { solicitar } from '../services/api'

export default function FornecedoresConfirmados({ eventoId }) {
 const [dados,setDados]=useState(null)
 const [erro,setErro]=useState('')
 useEffect(()=>{
  let ativo=true
  solicitar(`/eventos/${eventoId}/fornecedores`).then(d=>{if(ativo)setDados(d)}).catch(e=>{if(ativo)setErro(e.message)})
  return()=>{ativo=false}
 },[eventoId])
 const empresas=Object.values((dados||[]).reduce((grupos,item)=>{
  (grupos[item.id_fornecedor]??={nome:item.nome_organizacao,itens:[]}).itens.push(item)
  return grupos
 },{}))
 return <section className="mt-6 border-t border-tt-azul-marinho/10 pt-5">
  <h2 className="text-xl font-bold">Fornecedores confirmados</h2>
  {erro?<p role="alert" className="mt-3">{erro}</p>:dados===null?<p role="status">Carregando fornecedores…</p>:!empresas.length?<p className="mt-3 text-sm">Nenhuma proposta aceita até o momento.</p>:<div className="mt-4 space-y-3">{empresas.map(e=><article key={e.nome+e.itens[0].id} className="rounded-xl bg-tt-verde-claro p-4"><h3 className="font-bold">{e.nome}</h3><ul className="mt-2 space-y-1 text-sm">{e.itens.map(i=><li key={i.id}>{i.quantidade} × {i.descricao_detalhada} — {i.produto}</li>)}</ul></article>)}</div>}
 </section>
}
