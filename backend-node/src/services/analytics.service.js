const { readCsv } = require('./csv.service');

const EARTH_RADIUS_M = 6371000.0;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dphi = toRad(lat2 - lat1);
  const dlambda = toRad(lon2 - lon1);

  const a = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function sanitizeTimestamp(ts) {
  if (!ts) return null;
  // CSV usa formato "YYYY-MM-DD HH:MM:SS" – convertemos para ISO
  const isoLike = ts.replace(' ', 'T');
  const date = new Date(isoLike);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isStopFlag(point) {
  if (!point) return false;
  if ((point.tipo || '').toLowerCase() !== 'flag') return false;
  const nome = (point.nome || '').trim().toLowerCase();
  return nome && nome !== 'origem' && nome !== 'destino';
}

function parsePoints(rows) {
  const points = [];

  for (const row of rows) {
    const tipo = (row['Tipo'] || '').trim().toLowerCase();
    if (tipo === 'polygon') {
      continue; // ignora vértices de áreas proibidas
    }

    const ts = sanitizeTimestamp(row['Timestamp']);
    if (!ts) continue;

    const lat = Number.parseFloat(row['Latitude']);
    const lon = Number.parseFloat(row['Longitude']);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    points.push({
      idx: Number.parseInt(row['ID do Ponto'], 10) || points.length + 1,
      lat,
      lon,
      ts,
      tipo: row['Tipo'] || '',
      nome: row['Nome'] || '',
    });
  }

  return points.sort((a, b) => a.ts - b.ts);
}

function analysePoints(points) {
  if (points.length < 2) {
    throw new Error('CSV deve conter pelo menos dois pontos válidos');
  }

  let distanceMeters = 0;
  let stoppedSeconds = 0;
  let movingSeconds = 0;
  const stopsBreakdown = {};

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const segmentSeconds = (next.ts - current.ts) / 1000;
    if (!Number.isFinite(segmentSeconds) || segmentSeconds <= 0) continue;

    const segmentMeters = haversineMeters(current.lat, current.lon, next.lat, next.lon);
    distanceMeters += segmentMeters;
    movingSeconds += segmentSeconds;

    if (isStopFlag(current)) {
      stoppedSeconds += segmentSeconds;
      movingSeconds -= segmentSeconds;
      const key = current.nome.trim();
      stopsBreakdown[key] = (stopsBreakdown[key] || 0) + segmentSeconds;
    }
  }

  const start = points[0];
  const end = points[points.length - 1];
  const totalSeconds = Math.max(0, (end.ts - start.ts) / 1000);

  const distanceKm = distanceMeters / 1000;
  const averageSpeed = totalSeconds > 0 ? distanceKm / (totalSeconds / 3600) : 0;
  const movingSpeed = movingSeconds > 0 ? distanceKm / (movingSeconds / 3600) : 0;

  return {
    points: points.length,
    startTime: start.ts,
    endTime: end.ts,
    totalSeconds,
    totalMinutes: totalSeconds / 60,
    distanceKm,
    averageSpeedKmh: averageSpeed,
    movingSeconds,
    movingMinutes: movingSeconds / 60,
    movingSpeedKmh: movingSpeed,
    stoppedSeconds,
    stoppedMinutes: stoppedSeconds / 60,
    stops: Object.fromEntries(
      Object.entries(stopsBreakdown).map(([nome, seconds]) => [nome, {
        seconds,
        minutes: seconds / 60,
      }]),
    ),
  };
}

async function getRouteMetrics(routeName) {
  if (!routeName) {
    throw new Error('Nome da rota é obrigatório');
  }
  const rows = await readCsv(routeName);
  const points = parsePoints(rows);
  if (!points.length) {
    throw new Error(`Nenhum ponto válido encontrado para a rota '${routeName}'`);
  }
  const metrics = analysePoints(points);
  return { route: routeName, metrics };
}

async function compareRoutes(routeNames = []) {
  const uniqueNames = Array.from(new Set(routeNames.filter(Boolean)));
  if (!uniqueNames.length) {
    throw new Error('Informe pelo menos uma rota para comparação');
  }
  const results = await Promise.all(uniqueNames.map(async (name) => {
    try {
      return await getRouteMetrics(name);
    } catch (err) {
      return { route: name, error: err.message };
    }
  }));
  return results;
}

module.exports = {
  getRouteMetrics,
  compareRoutes,
};
