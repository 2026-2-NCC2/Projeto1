// useEffect = roda a busca quando o endereco muda / useState = guarda o resultado da busca
import { useEffect, useState } from "react";

// ─── Mapa do evento (OpenStreetMap) ───────────────────────────────────────────
// usa o Nominatim (geocodificador gratuito do OpenStreetMap) pra transformar o endereco
// em latitude/longitude e depois mostra o mapa embutido do proprio OSM com um marcador
// nao precisa de chave de API nem de biblioteca extra

// guarda os enderecos ja buscados pra nao repetir a requisicao
// (a politica do Nominatim pede no maximo 1 requisicao por segundo)
const cacheCoordenadas = new Map();

// faz uma busca no Nominatim e devolve { lat, lon } ou null se nao achar
async function consultarNominatim(texto) {
  // monta os parametros da busca: texto, formato JSON, so 1 resultado, so no Brasil e em portugues
  const params = new URLSearchParams({
    q: texto,
    format: "json",
    limit: "1",
    countrycodes: "br",
    "accept-language": "pt-BR",
  });
  // faz a busca no site do Nominatim
  const resposta = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
  // se o servidor responder com erro, dispara um erro
  if (!resposta.ok) throw new Error("Falha ao buscar o endereço");

  // le a lista de resultados
  const dados = await resposta.json();
  // se veio algum resultado, pega a latitude e a longitude do primeiro; senao devolve null
  return dados.length ? { lat: parseFloat(dados[0].lat), lon: parseFloat(dados[0].lon) } : null;
}

// descobre as coordenadas de um endereco (usando o cache e tentando de novo sem acento)
async function buscarCoordenadas(endereco) {
  // se ja buscou esse endereco antes, devolve o que esta guardado
  if (cacheCoordenadas.has(endereco)) return cacheCoordenadas.get(endereco);

  // primeira tentativa: o endereco do jeito que veio
  let coords = await consultarNominatim(endereco);
  // o Nominatim as vezes nao acha nomes com acento (ex: "Autódromo"),
  // entao tenta de novo sem acentos e troca o travessao por virgula
  const semAcento = endereco.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s*[—–]\s*/g, ", ");
  if (!coords && semAcento !== endereco) coords = await consultarNominatim(semAcento);

  // se nao achar nada guarda null pra mostrar a mensagem de "nao encontrado"
  cacheCoordenadas.set(endereco, coords);
  return coords;
}

// monta a url do mapa embutido, o bbox e a area visivel ao redor do ponto
// a largura e ~1.91x a altura pra bater com a proporcao 1200x630
function urlMapaEmbutido({ lat, lon }) {
  // tamanho da area em volta do ponto (quanto maior, mais longe o zoom)
  const dLat = 0.006;
  const dLon = dLat * 1.91;
  // bbox = os 4 cantos da area: esquerda, baixo, direita, cima
  const bbox = [lon - dLon, lat - dLat, lon + dLon, lat + dLat].join(",");
  // endereco do mapa do OpenStreetMap com a area e o marcador no ponto
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
}

// recebe o endereco do evento e mostra o texto + o mapinha
export default function MapaEvento({ endereco }) {
  // resultado = { endereco, coords, erro } da ultima busca que terminou
  const [resultado, setResultado] = useState(null);

  // busca de novo sempre que o endereco mudar (ex: depois de editar o evento)
  useEffect(() => {
    // vira true se o endereco mudar antes da busca terminar
    let cancelado = false;
    // faz a busca; quando terminar guarda o resultado (ou o erro)
    buscarCoordenadas(endereco)
      .then((coords) => { if (!cancelado) setResultado({ endereco, coords, erro: false }); })
      .catch(() => { if (!cancelado) setResultado({ endereco, coords: null, erro: true }); });
    // evita atualizar o estado de uma busca antiga se o endereco mudou no meio
    return () => { cancelado = true; };
  }, [endereco]);

  // se o resultado guardado e de outro endereco, ainda ta carregando o novo
  // status = "carregando" | "ok" | "nao-encontrado" | "erro"
  const coords = resultado?.endereco === endereco ? resultado.coords : null;
  // decide o que mostrar: carregando, mapa, nao encontrado ou erro
  const status =
    resultado?.endereco !== endereco ? "carregando"
    : resultado.erro ? "erro"
    : coords ? "ok"
    : "nao-encontrado";

  return (
    // no celular o mapa fica embaixo do texto, em tela maior fica do lado
    <section className="grid items-center gap-5 rounded-2xl border border-tt-azul-marinho/12 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      {/* lado do texto */}
      <div className="min-w-0">
        {/* etiqueta, titulo e o endereco */}
        <span className="inline-block text-xs font-extrabold uppercase leading-[1.4] tracking-[0.1em] text-tt-roxo-principal">Como chegar</span>
        <h2 className="mb-0 mt-1.5 text-base font-bold text-tt-azul-marinho">Localização no mapa</h2>
        <p className="mt-1 text-[13px] leading-[1.6] text-tt-grafite/75">{endereco}</p>
        {/* link pra abrir o mapa grande no site do OpenStreetMap (so quando achou o endereco) */}
        {status === "ok" && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=16/${coords.lat}/${coords.lon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-[13px] font-bold text-tt-azul-principal no-underline hover:text-tt-azul-marinho"
          >
            Abrir no OpenStreetMap <span aria-hidden="true">↗</span>
          </a>
        )}
        {/* credito obrigatorio do OpenStreetMap (a licenca pede) */}
        <p className="mt-3 text-[11px] text-tt-grafite/60">
          Dados do mapa © colaboradores do <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
        </p>
      </div>

      {/* mapa pequeno com proporcao 1.91:1 (ate 420x220), em tela menor diminui mantendo a proporcao */}
      <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-xl border border-tt-azul-marinho/12 bg-tt-cinza-claro">
        {/* achou: mostra o mapa dentro de um iframe (uma "janelinha" de outro site) */}
        {status === "ok" ? (
          <iframe
            title={`Mapa: ${endereco}`}
            src={urlMapaEmbutido(coords)}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
          />
        ) : (
          // nao achou ainda / nao achou / deu erro: mostra a mensagem certa
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-tt-grafite/75">
            {status === "carregando" && "Carregando mapa..."}
            {status === "nao-encontrado" && "Endereço não encontrado no mapa."}
            {status === "erro" && "Não foi possível carregar o mapa agora."}
          </div>
        )}
      </div>
    </section>
  );
}
