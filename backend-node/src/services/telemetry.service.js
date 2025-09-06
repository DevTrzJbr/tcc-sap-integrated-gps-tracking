const { readCsv } = require('./csv.service');

/**
 * Converte as linhas do CSV em um array de pontos tipados/ordenados
 * Espera colunas: Latitude, Longitude, Timestamp, Tipo, Nome
 */
function normalizeCsvRows(rows) {
  const points = rows
    .map(r => ({
      lat: Number(r.Latitude),
      lon: Number(r.Longitude),
      ts:  new Date(r.Timestamp),  // Date ou NaN se inválido
      tipo: r.Tipo || 'rota',
      nome: r.Nome || null
    }))
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  // ordena por timestamp se possível; senão mantém ordem original
  points.sort((a, b) => {
    const ta = a.ts.getTime();
    const tb = b.ts.getTime();
    return Number.isFinite(ta) && Number.isFinite(tb) ? ta - tb : 0;
  });

  return points;
}

/**
 * Reproduz os pontos como um stream SSE. Atraso é calculado pela diferença
 * de timestamps do CSV e comprimido por um "speed" (acelerador).
 * - speed=1 → tempo real; speed=10 → 10x mais rápido
 * - minMs define um atraso mínimo entre mensagens (padrão 300 ms)
 */
async function playCsvAsSSE({ res, routeName, speed = 8, minMs = 300 }) {
  const rows = await readCsv(`${routeName}.csv`);
  const points = normalizeCsvRows(rows);

  // headers SSE
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  const write = (event, data) => {
    if (event) res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  write('hello', { ok: true, route: routeName, total: points.length, speed });

  if (!points.length) {
    write('done', { done: true, reason: 'no-points' });
    return res.end();
  }

  let i = 0;
  let closed = false;

  const scheduleNext = (delay) => {
    if (closed) return;
    setTimeout(tick, Math.max(minMs, delay));
  };

  const tick = () => {
    if (closed) return;
    if (i >= points.length) {
      write('done', { done: true });
      return res.end();
    }

    const p = points[i];
    write(null, { // evento "message" padrão
      idx: i + 1,
      lat: p.lat,
      lon: p.lon,
      ts: p.ts.toISOString ? p.ts.toISOString() : null,
      tipo: p.tipo,
      nome: p.nome
    });
    i++;

    if (i >= points.length) {
      write('done', { done: true });
      return res.end();
    }

    // calcula atraso a partir do CSV (com compressão por 'speed')
    const prev = p;
    const next = points[i];
    const deltaMs = (next.ts - prev.ts);
    const delay = Number.isFinite(deltaMs) && deltaMs > 0
      ? deltaMs / Math.max(1, speed)
      : minMs;

    scheduleNext(delay);
  };

  // primeiro tick imediatamente
  scheduleNext(0);

  // limpar ao fechar conexão
  res.on('close', () => { closed = true; });
}

module.exports = { playCsvAsSSE };
