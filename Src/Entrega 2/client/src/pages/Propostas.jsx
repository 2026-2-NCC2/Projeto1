import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { solicitar } from '../services/api'
import { brl, campo, botao } from '../styles/propostas'
export default function Propostas(){
 const {perfil,usuario}=useAuth()
 const [dados,setDados]=useState([]),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true),[ocupado,setOcupado]=useState(null),[filtro,setFiltro]=useState('todas'),[aviso,setAviso]=useState('')
 const permitido=['fornecedor','organizador'].includes(perfil)
 useEffect(()=>{let ativo=true
 if(permitido)solicitar('/propostas').then(d=>{if(ativo)setDados(d)}).catch(e=>{if(ativo)setErro(e.message)}).finally(()=>{if(ativo)setCarregando(false)})
 return()=>{ativo=false}
 },[permitido,usuario?.id_usuario])
 async function responder(id,status){setOcupado(id);setErro('');setAviso('')
 try{await solicitar(`/propostas/${id}`,{method:'PATCH',body:JSON.stringify({status})});setDados(prev=>prev.map(p=>p.id===id?{...p,status}:p));setAviso(`Proposta ${status} com sucesso.`)}catch(e){setErro(e.message)}finally{setOcupado(null)}
 }
 if(!permitido)return <main className="mx-auto max-w-5xl p-8"><h1 className="text-2xl font-bold">Acesso restrito</h1><p>Esta área é exclusiva de fornecedores e organizadores.</p><Link to="/Login" className="text-tt-azul-principal underline">Entrar</Link></main>
 return <main className="min-h-screen bg-tt-cinza-claro text-tt-azul-marinho">
 <section className="bg-tt-azul-marinho px-5 py-10 text-tt-branco"><div className="mx-auto max-w-5xl"><p className="text-sm font-bold text-tt-laranja-principal">NEGÓCIOS NO TROCATICKET</p><h1 className="mt-2 text-3xl font-extrabold">{perfil==='fornecedor'?'Propostas enviadas':'Propostas recebidas'}</h1><p className="mt-3 text-tt-branco/70">{perfil==='fornecedor'?'Acompanhe suas ofertas e as respostas dos organizadores.':'Confira os produtos, compare os custos e responda aos fornecedores.'}</p></div></section>
 <div className="mx-auto max-w-5xl space-y-5 px-5 py-8"><Link className="text-sm font-bold text-tt-azul-principal" to="/PainelDeEventos">← Painel de eventos</Link>
 <label className="block max-w-xs text-sm font-bold">Status<select className={`${campo} mt-2`} value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="todas">Todas as propostas</option><option value="enviada">Aguardando resposta</option><option value="aceita">Aceitas</option><option value="recusada">Recusadas</option></select></label>
 {erro&&<p role="alert" className="rounded-xl bg-tt-rosa-claro p-4 text-tt-rosa-principal">{erro}</p>}{aviso&&<p role="status" className="rounded-xl bg-tt-verde-claro p-4">{aviso}</p>}
 {carregando?<p role="status">Carregando propostas…</p>:!dados.filter(p=>filtro==='todas'||p.status===filtro).length?<div className="rounded-2xl bg-tt-branco p-10 text-center"><h2 className="text-xl font-bold">Nenhuma proposta por aqui</h2><p className="mt-2 text-tt-grafite/70">{perfil==='fornecedor'?'Acesse os custos de um evento para enviar sua primeira proposta.':'As propostas dos fornecedores aparecerão aqui.'}</p></div>:dados.filter(p=>filtro==='todas'||p.status===filtro).map(p=><article key={p.id} className="rounded-2xl border border-tt-azul-marinho/10 bg-tt-branco p-5 shadow-sm sm:p-7">
 <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-tt-grafite/70">Proposta #{p.id} · {new Date(p.criada_em).toLocaleDateString('pt-BR')}</p><h2 className="mt-1 text-xl font-bold">{p.titulo_evento}</h2><p className="mt-1 text-sm">{perfil==='fornecedor'?`Para: ${p.organizador}`:`De: ${p.fornecedor}`}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${p.status==='aceita'?'bg-tt-verde-claro':p.status==='recusada'?'bg-tt-rosa-claro text-tt-rosa-principal':'bg-tt-laranja-claro'}`}>{p.status==='enviada'?'Aguardando resposta':p.status==='aceita'?'Aceita':'Recusada'}</span></div>
 <ul className="my-5 divide-y divide-tt-azul-marinho/10">{p.produtos.map(i=><li key={i.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span><strong>{i.produto}</strong><br/>{i.quantidade} × {brl(i.valor_unitario)}</span><strong>{brl(i.quantidade*Number(i.valor_unitario))}</strong></li>)}</ul>
 <div className="flex justify-between rounded-xl bg-tt-cinza-claro p-4 font-bold"><span>Total da proposta</span><span>{brl(p.produtos.reduce((s,i)=>s+i.quantidade*Math.round(Number(i.valor_unitario)*100),0)/100)}</span></div><p className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-tt-azul-marinho/10 p-4 text-sm">{p.mensagem}</p>
 {perfil==='organizador'&&p.status==='enviada'&&<div className="mt-5 flex flex-wrap justify-end gap-3"><button disabled={ocupado===p.id} onClick={()=>responder(p.id,'recusada')} className="rounded-xl border border-tt-rosa-principal px-4 py-2 text-sm font-bold text-tt-rosa-principal disabled:opacity-50">Recusar proposta</button><button disabled={ocupado===p.id} onClick={()=>responder(p.id,'aceita')} className={botao}>{ocupado===p.id?'Salvando…':'Aceitar proposta'}</button></div>}
 </article>)}
 </div></main>
}
