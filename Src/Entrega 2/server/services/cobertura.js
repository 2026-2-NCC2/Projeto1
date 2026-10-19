// O evento deve estar bloqueado com FOR UPDATE antes de validar um envio/aceite.
export async function consultarCobertura(db, eventoId) {
 const [itens] = await db.query(`SELECT i.*, COALESCE(c.coberta,0) AS quantidade_coberta,
 GREATEST(0,i.quantidade-COALESCE(c.coberta,0)) AS quantidade_restante
 FROM itemcusto i LEFT JOIN (
 SELECT p.id_item_custo_fk,SUM(p.quantidade) AS coberta
 FROM produto_solicitacao p JOIN solicitacao_fornecimento s ON s.id=p.id_solicitacao_fk
 WHERE s.id_evento_fk=? AND s.status='aceita' GROUP BY p.id_item_custo_fk
 ) c ON c.id_item_custo_fk=i.id_item_custo WHERE i.id_evento_fk=?`,[eventoId,eventoId])
 return itens.map(i=>({...i,quantidade_coberta:Number(i.quantidade_coberta),quantidade_restante:Number(i.quantidade_restante)}))
}
export function conflitoCobertura(itens, produtos) {
 return produtos.some(p=>{
  const item=itens.find(i=>Number(i.id_item_custo)===Number(p.itemId ?? p.id_item_custo_fk))
  return !item || Number(p.quantidade)>item.quantidade_restante
 })
}
