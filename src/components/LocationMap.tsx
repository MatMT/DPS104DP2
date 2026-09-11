/**
 * Componente LocationMap:
 * Solución técnica con OpenStreetMap (OSM) y Leaflet vía react-native-webview.
 * Alternativa de código abierto que evita la facturación de Google Maps ($30 USD),
 * permitiendo renderizar marcadores georreferenciados en Expo Go sin API Key.
 */
import React, { useMemo, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { AuditEntry } from '../types/AuditEntry';

interface LocationMapProps {
  auditEntries: AuditEntry[];
  currentLocation?: { latitude: number; longitude: number } | null;
  onMarkerSelect?: (entry: AuditEntry) => void;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  auditEntries,
  currentLocation,
  onMarkerSelect,
}) => {
  const webViewRef = useRef<WebView>(null);

  // Generación del mapa interactivo con OpenStreetMap y Leaflet
  const htmlContent = useMemo(() => {
    // Centro por defecto: ubicación actual del dispositivo o primera auditoría o Campus UDB
    const centerLat =
      currentLocation?.latitude ||
      auditEntries[0]?.location.latitude ||
      13.7159;
    const centerLon =
      currentLocation?.longitude ||
      auditEntries[0]?.location.longitude ||
      -89.1537;

    const markersJson = JSON.stringify(
      auditEntries.map((e) => ({
        id: e.id,
        title: e.productTitle.replace(/'/g, "\\'"),
        actionType: e.actionType,
        lat: e.location.latitude,
        lon: e.location.longitude,
        timestamp: new Date(e.timestamp).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }))
    );

    const userMarkerJson = currentLocation
      ? JSON.stringify({
          lat: currentLocation.latitude,
          lon: currentLocation.longitude,
        })
      : 'null';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            html, body, #map {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background-color: #f8fafc;
            }
            .custom-popup .leaflet-popup-content-wrapper {
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
              padding: 4px;
            }
            .popup-title {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .popup-meta {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              font-size: 11px;
              color: #64748b;
            }
            .badge-incidence {
              display: inline-block;
              background-color: #fee2e2;
              color: #dc2626;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              margin-bottom: 4px;
            }
            .badge-check {
              display: inline-block;
              background-color: #ecfdf5;
              color: #059669;
              font-size: 10px;
              font-weight: 700;
              padding: 2px 6px;
              border-radius: 4px;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map', {
              zoomControl: true,
              attributionControl: false
            }).setView([${centerLat}, ${centerLon}], 16);

            // Capa de mosaicos libre y gratuita de OpenStreetMap
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19
            }).addTo(map);

            var markers = ${markersJson};
            var userLoc = ${userMarkerJson};
            var bounds = [];

            // Marcador de la posición actual del usuario (punto azul parpadeante)
            if (userLoc) {
              var userIcon = L.divIcon({
                className: 'user-pin',
                html: '<div style="background-color:#2563eb; width:16px; height:16px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 8px rgba(37,99,235,0.6);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              });
              L.marker([userLoc.lat, userLoc.lon], { icon: userIcon })
                .addTo(map)
                .bindPopup('<div class="popup-title">📍 Tu ubicación actual</div><div class="popup-meta">Posición del operario</div>');
              bounds.push([userLoc.lat, userLoc.lon]);
            }

            // Marcadores de las auditorías
            markers.forEach(function(item) {
              var isIncidence = item.actionType === 'INCIDENCE';
              var color = isIncidence ? '#dc2626' : '#059669';
              var label = isIncidence ? '⚠️ INCIDENCIA' : '✓ CONTEO VERIFICADO';
              var badgeClass = isIncidence ? 'badge-incidence' : 'badge-check';

              var customPin = L.divIcon({
                className: 'audit-pin',
                html: '<div style="background-color:' + color + '; width:26px; height:26px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); border:2px solid #ffffff; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.3);"><div style="width:8px; height:8px; background-color:#ffffff; border-radius:50%; transform:rotate(45deg);"></div></div>',
                iconSize: [26, 26],
                iconAnchor: [13, 26],
                popupAnchor: [0, -26]
              });

              var marker = L.marker([item.lat, item.lon], { icon: customPin }).addTo(map);
              
              var popupHtml = '<div class="custom-popup">' +
                '<div class="' + badgeClass + '">' + label + '</div>' +
                '<div class="popup-title">' + item.title + '</div>' +
                '<div class="popup-meta">Hora: ' + item.timestamp + '</div>' +
                '<div class="popup-meta">GPS: ' + item.lat.toFixed(5) + ', ' + item.lon.toFixed(5) + '</div>' +
              '</div>';

              marker.bindPopup(popupHtml);

              marker.on('click', function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_AUDIT', id: item.id }));
                }
              });

              bounds.push([item.lat, item.lon]);
            });

            // Ajustar encuadre si hay múltiples puntos
            if (bounds.length > 1) {
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
            }

            // Función expuesta para centrar
            window.centerOn = function(lat, lon, zoom) {
              map.setView([lat, lon], zoom || 16, { animate: true });
            };

            window.fitAll = function() {
              if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [40, 40] });
              }
            };
          </script>
        </body>
      </html>
    `;
  }, [auditEntries, currentLocation]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_AUDIT' && onMarkerSelect) {
        const found = auditEntries.find((e) => e.id === data.id);
        if (found) {
          onMarkerSelect(found);
        }
      }
    } catch (e) {
      console.error('Error al parsear mensaje de WebView:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        onMessage={handleMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
