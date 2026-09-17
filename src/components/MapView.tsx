import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Ocorrencia, Tenda } from '../types';
import { Navigation } from 'lucide-react';

interface MapViewProps {
  ocorrencias: Ocorrencia[];
  tendas?: Tenda[];
  selectedOcorrencia?: Ocorrencia | null;
  onSelectOcorrencia?: (oco: Ocorrencia) => void;
}

const GUARAPARI_DEFAULT_CENTER: [number, number] = [-20.6560, -40.4900];

export const MapView: React.FC<MapViewProps> = ({ 
  ocorrencias, 
  tendas = [],
  selectedOcorrencia,
  onSelectOcorrencia 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Provedor homologado Esri World Street Map (sem restrição 403 de OSM nem API Key de CARTO)
      const map = L.map(mapContainerRef.current, {
        center: GUARAPARI_DEFAULT_CENTER,
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Anjos da Praia Guarapari',
      }).addTo(map);

      const layersGroup = L.layerGroup().addTo(map);
      layersGroupRef.current = layersGroup;
      mapInstanceRef.current = map;
    }

    const resizeTimer = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
    };
  }, []);

  // Atualizar marcadores (Tendas + Ocorrências)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = layersGroupRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    // 1. Plotar Tendas / Postos de Apoio com Raio Geodésico de Cobertura Visual
    tendas.forEach((tenda) => {
      const isAtiva = tenda.ativa !== false;

      // Raio de Cobertura Visual de 350m (Buffer Geodésico Operacional da Tenda)
      if (isAtiva) {
        const circle = L.circle([tenda.latitude, tenda.longitude], {
          radius: 350,
          color: '#0B6EFD',
          fillColor: '#0B6EFD',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6',
        }).bindTooltip(`Zona de Cobertura Visual: ${tenda.nome} (350m)`, {
          sticky: true,
          direction: 'top',
          className: 'text-xs font-bold'
        });
        layer.addLayer(circle);
      }

      const tendaIcon = L.divIcon({
        className: 'custom-tenda-pin',
        html: `
          <div class="flex items-center justify-center w-10 h-10 ${isAtiva ? 'bg-[#0B6EFD]' : 'bg-[#6B7280]'} text-white rounded-xl shadow-lg border-2 border-white ring-2 ring-[#0857CC]/30 font-bold">
            <span class="text-[10px] tracking-tight text-center leading-none">POSTO<br/>${tenda.praia.substring(0, 5)}</span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([tenda.latitude, tenda.longitude], { icon: tendaIcon })
        .bindPopup(`
          <div class="p-2 font-sans max-w-[220px]">
            <span class="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0B6EFD] bg-[#EFF6FF] px-2 py-0.5 rounded-md mb-1">
              Posto Oficial
            </span>
            <div class="font-bold text-[#1A1D1F] text-sm leading-tight">${tenda.nome}</div>
            <div class="text-xs text-[#6B7280] mt-1">${tenda.praia}</div>
            <div class="text-[11px] text-[#0B6EFD] font-semibold mt-1">Raio de Patrulha: 350m</div>
            ${tenda.responsavel_posto ? `<div class="text-xs text-[#1A1D1F] mt-1"><strong>Resp:</strong> ${tenda.responsavel_posto}</div>` : ''}
            ${tenda.telefone_posto ? `<div class="text-xs text-[#0B6EFD] font-mono mt-0.5">${tenda.telefone_posto}</div>` : ''}
          </div>
        `);

      layer.addLayer(marker);
      bounds.push([tenda.latitude, tenda.longitude]);
    });

    // 2. Plotar Ocorrências
    ocorrencias.forEach((oco) => {
      const isConcluido = oco.status === 'Reencontro realizado';
      const isSelected = selectedOcorrencia?.id === oco.id;

      // Cores por status usando a paleta oficial
      let pinBg = 'bg-[#FF6B35] ring-[#FF6B35]/40'; // Coral (Localizada)
      if (oco.status === 'Equipe a caminho') pinBg = 'bg-[#0B6EFD] ring-[#0B6EFD]/40'; // Azul
      if (oco.status === 'Criança recebida') pinBg = 'bg-[#9333EA] ring-[#9333EA]/40'; // Roxo (Na tenda)
      if (oco.status === 'Responsáveis localizados') pinBg = 'bg-[#0284C7] ring-[#0284C7]/40'; // Azul Claro (Pais contatados)
      if (isConcluido) pinBg = 'bg-[#16A34A] ring-[#16A34A]/40'; // Verde (Reencontro realizado)

      const alertIcon = L.divIcon({
        className: 'custom-alert-pin',
        html: `
          <div class="relative cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="flex items-center justify-center w-10 h-10 ${pinBg} text-white rounded-full shadow-xl border-2 border-white ring-4 ${!isConcluido ? 'animate-bounce' : ''}">
              <span class="text-xs font-black">#${oco.numero_pulseira}</span>
            </div>
            ${!isConcluido ? '<div class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#DC2626] rounded-full animate-ping"></div>' : ''}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${oco.latitude},${oco.longitude}`;

      const marker = L.marker([oco.latitude, oco.longitude], { icon: alertIcon })
        .bindPopup(`
          <div class="p-2 font-sans max-w-[250px]">
            <div class="flex items-center justify-between gap-2 border-b border-[#E5E7EB] pb-1.5 mb-1.5">
              <span class="font-extrabold text-[#1A1D1F] text-sm">Pulseira #${oco.numero_pulseira}</span>
              <span class="text-[11px] font-bold text-[#FF6B35]">${oco.status}</span>
            </div>

            ${oco.cadastro?.nome_crianca ? `
              <div class="text-xs text-[#1A1D1F] mb-0.5">
                <span class="text-[#6B7280]">Criança:</span> <strong>${oco.cadastro.nome_crianca}</strong>
              </div>
            ` : ''}

            ${oco.cadastro?.nome_responsavel ? `
              <div class="text-xs text-[#1A1D1F] mb-0.5">
                <span class="text-[#6B7280]">Responsável:</span> <strong>${oco.cadastro.nome_responsavel}</strong>
              </div>
            ` : ''}

            ${oco.cadastro?.telefone_contato ? `
              <div class="text-xs text-[#0B6EFD] font-mono mb-1.5">
                ${oco.cadastro.telefone_contato}
              </div>
            ` : ''}

            ${oco.tendaMaisProxima ? `
              <div class="bg-[#EFF6FF] text-[#1D4ED8] text-[11px] p-1.5 rounded-lg mb-2 border border-[#BFDBFE]">
                📍 <strong>Tenda mais próxima:</strong><br/>
                ${oco.tendaMaisProxima.tenda.nome} (~${oco.tendaMaisProxima.distanciaMetros}m)
              </div>
            ` : ''}

            <a 
              href="${googleMapsUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: flex; align-items: center; justify-content: center; width: 100%; gap: 6px; background-color: #FF6B35; color: #FFFFFF !important; font-size: 12px; font-weight: 700; padding: 9px 12px; border-radius: 10px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); white-space: nowrap; margin-top: 6px;"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              <span>Traçar Rota no Google Maps</span>
            </a>
          </div>
        `, { maxWidth: 300, minWidth: 240 });

      marker.on('click', () => {
        onSelectOcorrencia?.(oco);
      });

      layer.addLayer(marker);
      bounds.push([oco.latitude, oco.longitude]);
    });

    if (selectedOcorrencia) {
      map.flyTo([selectedOcorrencia.latitude, selectedOcorrencia.longitude], 17, { duration: 0.8 });
    } else if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 16 });
    }
  }, [ocorrencias, tendas, selectedOcorrencia, onSelectOcorrencia]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex-1 rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
      
      {/* Legenda Operacional */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-xl shadow-md border border-[#E5E7EB] text-xs text-[#1A1D1F] z-[30] flex flex-col gap-1.5 pointer-events-auto">
        <div className="font-bold text-[#1A1D1F] pb-1 border-b border-[#E5E7EB]">
          Legenda Operacional
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-[#0B6EFD]"></span>
          <span className="text-[11px]">Tenda / Posto de Apoio</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-[#0B6EFD] bg-[#0B6EFD]/20"></span>
          <span className="text-[11px]">Raio de Patrulha (350m)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF6B35]"></span>
          <span className="text-[11px]">Criança localizada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#0B6EFD]"></span>
          <span className="text-[11px]">Equipe a caminho</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#9333EA]"></span>
          <span className="text-[11px]">Criança na tenda</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#0284C7]"></span>
          <span className="text-[11px]">Pais contatados</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#16A34A]"></span>
          <span className="text-[11px]">Reencontro realizado 🎉</span>
        </div>
      </div>
    </div>
  );
};
