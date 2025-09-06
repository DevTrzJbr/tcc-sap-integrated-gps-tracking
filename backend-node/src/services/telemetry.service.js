// src/services/telemetry.service.js
const { readCsv } = require('./csv.service');

function normalizeCsvRows(rows) {
  const points = rows
    .map(r => ({
      lat: Number(r.Latitude),
      lon: Number(r.Longitude),
      ts: new Date(r.Timestamp),
      tipo: r.Tipo || 'rota',
      nome: r.Nome || null
    }))
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  points.sort((a, b) => {
    const ta = a.ts.getTime();
    const tb = b.ts.getTime();
    return Number.isFinite(ta) && Number.isFinite(tb) ? ta - tb : 0;
  });

  return points;
}

async function playCsvAsSSE({ res, routeName, speed = 8, minMs = 300 }) {
  let rows;
  try {
    rows = await readCsv(`${routeName}.csv`);
  } catch (err) {
    console.error('[SSE] erro ao ler CSV:', err);
    if (!res.headersSent) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'CSV não encontrado', route: routeName });
      }
      return res.status(500).json({ error: 'Falha ao ler CSV', details: err.message });
    }
    return;
  }

  const points = normalizeCsvRows(rows);

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
    write(null, {
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

    const next = points[i];
    const deltaMs = (next.ts - p.ts);
    const delay = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs / Math.max(1, speed) : minMs;

    scheduleNext(delay);
  };

  scheduleNext(0);
  res.on('close', () => { closed = true; });
}

module.exports = { playCsvAsSSE };
