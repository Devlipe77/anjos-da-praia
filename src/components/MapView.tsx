import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Ocorrencia } from '../types';
import { ExternalLink, Navigation } from 'lucide-react';

interface MapViewProps {
  ocorrencias: Ocorrencia[];
  selectedOcorrencia?: Ocorrencia | null;
  onSelectOcorrencia?: (oco: Ocorrencia) => void;
}

// Coordenadas base de Guarapari (Praia do Morro)
const GUARAPARI_CENTER: [number, number] = [-20.6560, -40.4900];
const TENDA_COORDS: [number, number] = [-20.6590, -40.4950];

export const MapView: React.FC<MapViewProps> = ({ 
  ocorrencias, 
  selectedOcorrencia,
  onSelectOcorrencia 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Inicializar o mapa apenas uma vez
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // 1. Inicialização à prova de falhas com provedor homologado Esri (sem bloqueio de API Key)
      const map = L.map(mapContainerRef.current, {
        center: GUARAPARI_CENTER,
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Anjos da Praia Guarapari',
      }).addTo(map);

      // LayerGroup para gerenciar marcadores dinâmicos
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Marcador fixo da Tenda dos Anjos da Praia
      const tendaIcon = L.divIcon({
        className: 'custom-tenda-pin',
        html: `
          <div class="flex items-center justify-center w-10 h-10 bg-ocean-600 text-white rounded-full shadow-xl border-2 border-white ring-2 ring-ocean-400">
            <span class="text-xs font-bold">TENDA</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const tendaMarker = L.marker(TENDA_COORDS, { icon: tendaIcon })
        .bindPopup(`
          <div class="p-2 text-slate-800">
            <strong class="text-ocean-700 text-sm font-bold flex items-center gap-1">
              ⛺ Tenda Oficial Anjos da Praia
            </strong>
            <p class="text-xs text-slate-600 mt-1">Posto de Apoio Operacional e Reencontro</p>
            <p class="text-[11px] text-slate-500 font-medium mt-1">Praia do Morro, Guarapari - ES</p>
          </div>
        `);
      markersLayer.addLayer(tendaMarker);
    }

    // Solução Obrigatória do Relatório Técnico: disparar invalidateSize()
    const resizeTimer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, []);

  // Atualizar marcadores quando ocorrencias mudarem
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    // Limpar marcadores de ocorrências anteriores, preservando a tenda
    layer.clearLayers();

    // Recria a tenda
    const tendaIcon = L.divIcon({
      className: 'custom-tenda-pin',
      html: `
        <div class="flex items-center justify-center w-10 h-10 bg-ocean-700 text-white rounded-full shadow-xl border-2 border-white ring-2 ring-ocean-400">
          <span class="text-[11px] font-black">TENDA</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
    const tendaMarker = L.marker(TENDA_COORDS, { icon: tendaIcon })
      .bindPopup(`
        <div class="p-1 text-slate-800 font-sans">
          <div class="font-bold text-ocean-800 text-sm">⛺ Tenda Anjos da Praia</div>
          <div class="text-xs text-slate-600">Base Principal • Praia do Morro</div>
        </div>
      `);
    layer.addLayer(tendaMarker);

    // Adiciona cada ocorrência no mapa
    const bounds: L.LatLngExpression[] = [TENDA_COORDS];

    ocorrencias.forEach((oco) => {
      const isConcluido = oco.status === 'Reencontro realizado';
      const isSelected = selectedOcorrencia?.id === oco.id;

      // Cor do pino baseada no status
      let pinColor = 'bg-amber-500 ring-amber-300';
      if (oco.status === 'Equipe a caminho') pinColor = 'bg-blue-600 ring-blue-300';
      if (oco.status === 'Criança recebida') pinColor = 'bg-purple-600 ring-purple-300';
      if (isConcluido) pinColor = 'bg-emerald-600 ring-emerald-300';

      const pinIcon = L.divIcon({
        className: 'custom-alert-pin',
        html: `
          <div class="relative cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="flex items-center justify-center w-9 h-9 ${pinColor} text-white rounded-full shadow-lg border-2 border-white ring-2 ${!isConcluido ? 'animate-bounce' : ''}">
              <span class="text-xs font-black">#${oco.numero_pulseira}</span>
            </div>
            ${!isConcluido ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></div>' : ''}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${oco.latitude},${oco.longitude}`;

      const marker = L.marker([oco.latitude, oco.longitude], { icon: pinIcon })
        .bindPopup(`
          <div class="p-2 font-sans max-w-[240px]">
            <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-1 mb-1.5">
              <span class="font-extrabold text-slate-900 text-sm">Pulseira #${oco.numero_pulseira}</span>
              <span class="text-[11px] font-semibold text-ocean-700">${oco.status}</span>
            </div>
            
            ${oco.cadastro?.nome_crianca ? `
              <div class="text-xs text-slate-700 mb-0.5">
                <strong>Criança:</strong> ${oco.cadastro.nome_crianca}
              </div>
            ` : ''}

            ${oco.cadastro?.nome_responsavel ? `
              <div class="text-xs text-slate-700 mb-0.5">
                <strong>Responsável:</strong> ${oco.cadastro.nome_responsavel}
              </div>
            ` : ''}

            ${oco.cadastro?.telefone_contato ? `
              <div class="text-xs text-slate-700 mb-1">
                <strong>Contato:</strong> ${oco.cadastro.telefone_contato}
              </div>
            ` : ''}

            <div class="text-[11px] text-slate-500 mb-2">
              GPS: ${oco.latitude.toFixed(5)}, ${oco.longitude.toFixed(5)}
            </div>

            <a 
              href="${googleMapsUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center w-full gap-1.5 bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow transition-colors"
            >
              <Navigation class="w-3.5 h-3.5" />
              Traçar Rota Google Maps
            </a>
          </div>
        `);

      marker.on('click', () => {
        onSelectOcorrencia?.(oco);
      });

      layer.addLayer(marker);
      bounds.push([oco.latitude, oco.longitude]);
    });

    // Se houver ocorrência selecionada, centraliza nela
    if (selectedOcorrencia) {
      map.flyTo([selectedOcorrencia.latitude, selectedOcorrencia.longitude], 17, {
        duration: 0.8,
      });
    } else if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 });
    }
  }, [ocorrencias, selectedOcorrencia, onSelectOcorrencia]);

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />
      
      {/* Legenda de Mapa Sobreposta */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs text-slate-700 z-[400] flex flex-col gap-1 pointer-events-auto">
        <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
          <span>Legenda Operacional</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-ocean-700 border border-white"></span>
          <span>Tenda Base (Posto Fixo)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-white"></span>
          <span>Criança Localizada (Pendente)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
          <span>Equipe em Deslocamento</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></span>
          <span>Reencontro Concluído</span>
        </div>
      </div>
    </div>
  );
};
