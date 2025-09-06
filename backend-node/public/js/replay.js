// Se suas rotas estão sob '/api' (app.use('/api', routes)), mantenha:
const BASE = '/api';

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);

let track, vehicle, es;

function resetLayers() {
  if (track) { map.removeLayer(track); track = null; }
  if (vehicle) { map.removeLayer(vehicle); vehicle = null; }
}

function connect(routeName, speed) {
  if (es) { es.close(); es = null; }
  resetLayers();

  const url = `${BASE}/stream/${encodeURIComponent(routeName)}?speed=${encodeURIComponent(speed)}&minMs=300`;
  document.getElementById('status').textContent = `Conectando em: ${location.origin}${url}`;
  console.log('SSE URL:', location.origin + url);

  try {
    es = new EventSource(url);
  } catch (e) {
    document.getElementById('status').textContent = 'Falha ao abrir EventSource';
    console.error(e);
    return;
  }

  const pts = [];

  es.addEventListener('hello', () => {
    document.getElementById('status').textContent = `Conectado: ${location.origin}${url}`;
  });

  es.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    const latlng = [data.lat, data.lon];
    pts.push(latlng);

    if (!track) {
      track = L.polyline(pts, { weight: 5 }).addTo(map);
      map.fitBounds(track.getBounds(), { padding: [30,30] });
    } else {
      track.addLatLng(latlng);
    }

    if (!vehicle) {
      vehicle = L.marker(latlng, { title: 'Veículo' }).addTo(map);
    } else {
      vehicle.setLatLng(latlng);
    }

    document.getElementById('status').textContent =
      `Tick ${data.idx} • ${data.ts || ''} ${data.nome ? '• '+data.nome : ''}`;
  });

  es.addEventListener('done', () => {
    document.getElementById('status').textContent = 'Fim do replay';
    es.close(); es = null;
  });

  es.onerror = () => {
    console.warn('SSE error – readyState=', es && es.readyState);
    document.getElementById('status').textContent = `Erro no stream (estado ${es && es.readyState}).`;
  };
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnStart').onclick = () => {
    const r = document.getElementById('route').value.trim();
    const s = Number(document.getElementById('speed').value || 8);
    if (!r) { alert('Informe o nome do arquivo CSV (sem .csv)'); return; }
    connect(r, s);
  };
});
