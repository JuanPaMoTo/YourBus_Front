import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Marcadores dibujados con HTML/CSS (divIcon): evita los íconos PNG de Leaflet,
// que los empaquetadores suelen romper, y respeta la paleta de YourBus.
const iconoParadero = (orden, seleccionado) =>
  L.divIcon({
    className: 'marcador',
    html: `<span class="stop-marker${seleccionado ? ' sel' : ''}">${Number(orden)}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const iconoBus = (sinSenal) =>
  L.divIcon({
    className: 'marcador',
    html: `<span class="bus-marker${sinSenal ? ' sin-senal' : ''}">BUS</span>`,
    iconSize: [44, 26],
    iconAnchor: [22, 13],
  });

const iconoYo = L.divIcon({
  className: 'marcador',
  html: '<span class="me-marker"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Encuadra los paraderos al cambiar de ruta (no en cada actualización de buses,
// para que el mapa no "salte" mientras el usuario lo está mirando).
function AjustarVista({ puntos, clave }) {
  const mapa = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    mapa.fitBounds(
      puntos.map((p) => [p.lat, p.lng]),
      { padding: [40, 40], maxZoom: 16 }
    );
    // Solo cuando cambia la ruta (clave), no en cada actualización de puntos.
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapaVivo({ paraderos, buses, miPosicion, paraderoId, onSeleccionarParadero, claveRuta }) {
  const conCoordenadas = paraderos.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');

  return (
    <MapContainer
      center={[-33.4372, -70.6506]}
      zoom={12}
      scrollWheelZoom={false}
      className="mapa-leaflet"
      aria-label="Mapa de la ruta con paraderos y buses en vivo"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVista puntos={conCoordenadas} clave={claveRuta} />

      {conCoordenadas.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={iconoParadero(p.orden, p.id === paraderoId)}
          eventHandlers={{ click: () => onSeleccionarParadero(p.id) }}
        >
          <Tooltip direction="top" offset={[0, -12]}>
            {p.orden}. {p.nombre}
          </Tooltip>
        </Marker>
      ))}

      {buses.map((b) => (
        <Marker key={b.turnoId} position={[b.lat, b.lng]} icon={iconoBus(b.sinSenalReciente)} zIndexOffset={1000}>
          <Tooltip direction="top" offset={[0, -12]}>
            {b.placa}
            {b.sinSenalReciente ? ' · sin señal reciente' : ''}
          </Tooltip>
        </Marker>
      ))}

      {miPosicion && (
        <Marker position={[miPosicion.lat, miPosicion.lng]} icon={iconoYo} zIndexOffset={500}>
          <Tooltip direction="top" offset={[0, -8]}>
            Tú
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
