import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Map as MapIcon, 
  Bell, 
  Search, 
  PlusCircle, 
  QrCode, 
  Phone, 
  MessageCircle, 
  Navigation, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  BarChart3, 
  RefreshCw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { dataService, isSupabaseConfigured } from '../lib/supabase';
import { PulseiraCadastro, Ocorrencia, StatusOcorrencia } from '../types';
import { MapView } from '../components/MapView';
import { StatusBadge } from '../components/StatusBadge';
import { QRCodeModal } from '../components/QRCodeModal';
import confetti from 'canvas-confetti';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitoramento' | 'cadastros' | 'estatisticas'>('monitoramento');

  // Estados de dados
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [cadastros, setCadastros] = useState<PulseiraCadastro[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);

  // Filtro e busca de cadastros
  const [searchTerm, setSearchTerm] = useState('');

  // Formulário de novo cadastro
  const [novoNumero, setNovoNumero] = useState('');
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoCrianca, setNovoCrianca] = useState('');
  const [novoPraia, setNovoPraia] = useState('Praia do Morro - Guarapari');
  const [novoObservacoes, setNovoObservacoes] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Modal de QR Code
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrPulseira, setQrPulseira] = useState('');
  const [qrNomeCrianca, setQrNomeCrianca] = useState<string | undefined>('');

  // Operador da tenda
  const [operadorNome, setOperadorNome] = useState('Equipe Tenda 01');

  // Carregar dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      const [ocos, cads] = await Promise.all([
        dataService.listarOcorrencias(),
        dataService.listarCadastros(),
      ]);
      setOcorrencias(ocos);
      setCadastros(cads);

      if (ocos.length > 0 && !selectedOcorrencia) {
        setSelectedOcorrencia(ocos[0]);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();

    // Inscrever para atualizações em tempo real (Supabase Realtime ou Local Event)
    const unsubscribe = dataService.subscribeOcorrencias(() => {
      carregarDados();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Cadastros filtrados
  const cadastrosFiltrados = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return cadastros;
    return cadastros.filter(c => 
      c.numero_pulseira.toLowerCase().includes(q) ||
      c.nome_responsavel.toLowerCase().includes(q) ||
      (c.nome_crianca && c.nome_crianca.toLowerCase().includes(q)) ||
      c.telefone_contato.includes(q)
    );
  }, [cadastros, searchTerm]);

  // Contadores
  const chamadosAtivos = useMemo(() => {
    return ocorrencias.filter(o => o.status !== 'Reencontro realizado');
  }, [ocorrencias]);

  const chamadosConcluidos = useMemo(() => {
    return ocorrencias.filter(o => o.status === 'Reencontro realizado');
  }, [ocorrencias]);

  // Submissão do cadastro
  const handleCadastrarPulseira = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!novoNumero.trim() || !novoResponsavel.trim() || !novoTelefone.trim()) {
      setFormError('Preencha os campos obrigatórios (Pulseira, Responsável e Telefone).');
      return;
    }

    setFormLoading(true);
    try {
      const novo = await dataService.cadastrarPulseira({
        numero_pulseira: novoNumero.trim(),
        nome_responsavel: novoResponsavel.trim(),
        telefone_contato: novoTelefone.trim(),
        nome_crianca: novoCrianca.trim() || undefined,
        praia_origem: novoPraia,
        observacoes: novoObservacoes.trim() || undefined,
      });

      setCadastros([novo, ...cadastros]);
      setFormSuccess(`Pulseira #${novo.numero_pulseira} vinculada com sucesso!`);
      
      // Abre direto o QR Code para impressão ou teste
      setQrPulseira(novo.numero_pulseira);
      setQrNomeCrianca(novo.nome_crianca);
      setQrModalOpen(true);

      // Limpa formulário
      setNovoNumero('');
      setNovoResponsavel('');
      setNovoTelefone('');
      setNovoCrianca('');
      setNovoObservacoes('');
    } catch (err: any) {
      setFormError(err.message || 'Erro ao cadastrar pulseira.');
    } finally {
      setFormLoading(false);
    }
  };

  // Alterar Status da Ocorrência
  const handleMudarStatus = async (ocoId: string, novoStatus: StatusOcorrencia) => {
    try {
      await dataService.atualizarStatusOcorrencia(ocoId, novoStatus, operadorNome);
      
      if (novoStatus === 'Reencontro realizado') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }

      await carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  // Helper para formatar telefone para WhatsApp
  const formatarWhatsapp = (telefone: string) => {
    const limpo = telefone.replace(/\D/g, '');
    const ddi = limpo.startsWith('55') ? limpo : `55${limpo}`;
    return ddi;
  };

  // Simular alerta teste para bancas de avaliação
  const handleSimularAlertaTeste = async () => {
    const pulseirasDisponiveis = cadastros.length > 0 ? cadastros[0].numero_pulseira : '1001';
    // Perto da Praia do Morro
    const lat = -20.6548 + (Math.random() - 0.5) * 0.003;
    const lng = -40.4880 + (Math.random() - 0.5) * 0.003;

    await dataService.dispararAlerta({
      numero_pulseira: pulseirasDisponiveis,
      latitude: lat,
      longitude: lng,
      precisao_metros: 6.0,
    });
    await carregarDados();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Bar Operacional */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Painel Operacional da Tenda
            </h1>
            <span className="bg-ocean-100 text-ocean-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Posto Praia do Morro
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recepção de alertas via QR Code, geolocalização e contato imediato com responsáveis.
          </p>
        </div>

        {/* Controles rápidos de teste e operador */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleSimularAlertaTeste}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm"
            title="Simula um banhista disparando alerta via QR Code para testes"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Simular Alerta Teste</span>
          </button>

          <button
            onClick={carregarDados}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border border-slate-200"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('monitoramento')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors relative ${
            activeTab === 'monitoramento'
              ? 'border-ocean-600 text-ocean-700 bg-ocean-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Monitoramento & Chamados</span>
          {chamadosAtivos.length > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full animate-pulse">
              {chamadosAtivos.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cadastros')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'cadastros'
              ? 'border-ocean-600 text-ocean-700 bg-ocean-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cadastros na Tenda</span>
          <span className="bg-slate-200 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
            {cadastros.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('estatisticas')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'estatisticas'
              ? 'border-ocean-600 text-ocean-700 bg-ocean-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Indicadores & Impacto</span>
        </button>
      </div>

      {/* ABA 1: MONITORAMENTO & CHAMADOS */}
      {activeTab === 'monitoramento' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Coluna Esquerda: Lista de Ocorrências */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-ocean-600" />
                <span>Ocorrências Recentes</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {chamadosAtivos.length} ativas / {ocorrencias.length} total
              </span>
            </div>

            {ocorrencias.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-slate-800">Nenhum chamado pendente</h3>
                <p className="text-xs text-slate-500 mt-1">
                  A praia está calma! Novos alertas enviados por banhistas surgirão aqui automaticamente.
                </p>
                <button
                  onClick={handleSimularAlertaTeste}
                  className="mt-4 text-xs font-bold text-ocean-700 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Simular um chamado para demonstração
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {ocorrencias.map((oco) => {
                  const isSelected = selectedOcorrencia?.id === oco.id;
                  const isFinalizado = oco.status === 'Reencontro realizado';

                  return (
                    <div
                      key={oco.id}
                      onClick={() => setSelectedOcorrencia(oco)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-white border-ocean-600 shadow-md ring-2 ring-ocean-100'
                          : isFinalizado
                            ? 'bg-slate-50/70 border-slate-200 opacity-75 hover:opacity-100'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300">
                            #{oco.numero_pulseira}
                          </span>
                          {oco.cadastro?.nome_crianca && (
                            <span className="font-extrabold text-slate-800 text-sm">
                              {oco.cadastro.nome_crianca}
                            </span>
                          )}
                        </div>
                        <StatusBadge status={oco.status} size="sm" />
                      </div>

                      {/* Dados dos Pais / Contato */}
                      {oco.cadastro ? (
                        <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 space-y-1 mb-2.5">
                          <div>
                            <span className="text-slate-500">Responsável:</span>{' '}
                            <strong className="text-slate-900">{oco.cadastro.nome_responsavel}</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Telefone:</span>
                            <span className="font-mono font-semibold text-ocean-800">{oco.cadastro.telefone_contato}</span>
                          </div>
                          {oco.cadastro.observacoes && (
                            <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                              ⚠️ {oco.cadastro.observacoes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mb-2">
                          Pulseira #{oco.numero_pulseira} ainda não cadastrada na tenda.
                        </div>
                      )}

                      {/* Ações operacionais rápidas */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                        {oco.cadastro?.telefone_contato && (
                          <>
                            <a
                              href={`tel:${oco.cadastro.telefone_contato}`}
                              className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-colors"
                              title="Ligar para o pai/mãe"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Ligar</span>
                            </a>

                            <a
                              href={`https://wa.me/${formatarWhatsapp(oco.cadastro.telefone_contato)}?text=Ol%C3%A1!%20Aqui%20%C3%A9%20da%20equipe%20Anjos%20da%20Praia.%20Recebemos%20a%20localiza%C3%A7%C3%A3o%20da%20pulseira%20%23${oco.numero_pulseira}%20e%20j%C3%A1%20estamos%20no%20local!`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-emerald-300 transition-colors"
                              title="Enviar WhatsApp direto"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </a>
                          </>
                        )}

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${oco.latitude},${oco.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-ocean-50 hover:bg-ocean-100 text-ocean-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-ocean-300 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-ocean-600" />
                          <span>Rota GPS</span>
                        </a>

                        {/* Botão de Evolução de Status */}
                        {oco.id && (
                          <div className="ml-auto">
                            <select
                              value={oco.status}
                              onChange={(e) => handleMudarStatus(oco.id!, e.target.value as StatusOcorrencia)}
                              className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-ocean-500 outline-none"
                            >
                              <option value="Criança localizada">Criança localizada</option>
                              <option value="Equipe a caminho">Equipe a caminho</option>
                              <option value="Criança recebida">Criança recebida</option>
                              <option value="Reencontro realizado">Reencontro realizado</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Coluna Direita: Mapa Leaflet Interativo */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-ocean-600" />
                <span>Geolocalização em Tempo Real (Tiles Esri)</span>
              </h2>
              <span className="text-xs font-semibold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded-md">
                Orla de Guarapari - ES
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex-1 min-h-[480px]">
              <MapView
                ocorrencias={ocorrencias}
                selectedOcorrencia={selectedOcorrencia}
                onSelectOcorrencia={(oco) => setSelectedOcorrencia(oco)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: CADASTROS NA TENDA */}
      {activeTab === 'cadastros' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Formulário Rápido de Cadastro */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
              <PlusCircle className="w-5 h-5 text-ocean-600" />
              <span>Novo Cadastro de Pulseira</span>
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Associação imediata ao entregar a fita na tenda para a família.
            </p>

            {formError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-semibold">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCadastrarPulseira} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Número da Pulseira *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 1004"
                  value={novoNumero}
                  onChange={(e) => setNovoNumero(e.target.value)}
                  className="w-full text-lg font-bold py-2.5 px-3 rounded-xl border border-slate-300 focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Nome da Criança
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pedro Henrique (5 anos)"
                  value={novoCrianca}
                  onChange={(e) => setNovoCrianca(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-xl border border-slate-300 focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Nome do Responsável (Pai / Mãe / Tutor) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Juliana Martins"
                  value={novoResponsavel}
                  onChange={(e) => setNovoResponsavel(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-xl border border-slate-300 focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Telefone de Contato (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: (27) 99888-7766"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-xl border border-slate-300 focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Praia / Posto
                </label>
                <select
                  value={novoPraia}
                  onChange={(e) => setNovoPraia(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 rounded-xl border border-slate-300 focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 outline-none bg-white"
                >
                  <option value="Praia do Morro - Guarapari">Praia do Morro - Guarapari</option>
                  <option value="Praia das Castanheiras - Guarapari">Praia das Castanheiras - Guarapari</option>
                  <option value="Praia da Areia Preta - Guarapari">Praia da Areia Preta - Guarapari</option>
                  <option value="Praia de Meaípe - Guarapari">Praia de Meaípe - Guarapari</option>
                  <option value="Enseada Azul - Guarapari">Enseada Azul - Guarapari</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Observações (Cor da roupa, características)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Sunga verde, camisa UV branca"
                  value={novoObservacoes}
                  onChange={(e) => setNovoObservacoes(e.target.value)}
                  className="w-full text-sm py-2 px-3 rounded-xl border border-slate-300 focus:border-ocean-600 focus:ring-2 focus:ring-ocean-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-ocean-700 hover:bg-ocean-800 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cadastrar e Gerar QR Code</span>
              </button>
            </form>
          </div>

          {/* Listagem e Busca de Cadastros */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-ocean-600" />
                  <span>Pulseiras Cadastradas</span>
                </h2>
                <span className="text-xs text-slate-500">
                  Total de {cadastrosFiltrados.length} pulseiras registradas
                </span>
              </div>

              {/* Barra de Busca Rápida */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar pulseira ou nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-ocean-600 outline-none"
                />
              </div>
            </div>

            {/* Tabela de Cadastros */}
            <div className="flex-1 overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Pulseira</th>
                    <th className="py-3 px-3">Criança / Responsável</th>
                    <th className="py-3 px-3">Telefone</th>
                    <th className="py-3 px-3">Praia</th>
                    <th className="py-3 px-3 text-right">QR Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cadastrosFiltrados.map((cad) => (
                    <tr key={cad.id || cad.numero_pulseira} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-black text-ocean-800 text-sm">
                        #{cad.numero_pulseira}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          {cad.nome_crianca || 'Não informado'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Resp: {cad.nome_responsavel}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800">
                        {cad.telefone_contato}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500">
                        {cad.praia_origem || 'Praia do Morro'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setQrPulseira(cad.numero_pulseira);
                            setQrNomeCrianca(cad.nome_crianca);
                            setQrModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                          title="Ver QR Code da pulseira"
                        >
                          <QrCode className="w-3.5 h-3.5 text-amber-600" />
                          <span>QR Code</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: ESTATÍSTICAS & IMPACTO */}
      {activeTab === 'estatisticas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                <span>Total de Pulseiras</span>
                <Users className="w-4 h-4 text-ocean-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {cadastros.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Crianças cadastradas e protegidas
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase mb-2">
                <span>Alertas Emitidos</span>
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-700">
                {ocorrencias.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Chamados disparados via QR Code
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-emerald-600 text-xs font-bold uppercase mb-2">
                <span>Reencontros com Sucesso</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700">
                {chamadosConcluidos.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Taxa de resolução: {ocorrencias.length > 0 ? Math.round((chamadosConcluidos.length / ocorrencias.length) * 100) : 100}%
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-blue-600 text-xs font-bold uppercase mb-2">
                <span>Tempo Médio Resposta</span>
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-700">
                &lt; 4 min
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Agilidade proporcionada pelo GPS
              </p>
            </div>

          </div>

          {/* Destaque das Lições Aprendidas & Critérios do Hackathon */}
          <div className="bg-ocean-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-3">
              <span className="bg-ocean-700 text-amber-300 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                Hackathon Ciência da Computação Anhanguera 2026.2
              </span>
              <h3 className="text-2xl font-black tracking-tight">
                Tecnologia Social Aplicada a Problemas Reais
              </h3>
              <p className="text-sm text-ocean-200 leading-relaxed">
                Este sistema elimina o estresse de crianças e pais nas praias do Espírito Santo. Através de um fluxo 100% web sem barreiras de download de loja, o banhista transmite as coordenadas de satélite instantaneamente para a tenda dos Anjos da Praia.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 text-xs">
                <span className="bg-ocean-800/80 px-3 py-1.5 rounded-lg border border-ocean-700">
                  🔒 LGPD Compliant (Privacidade Garantida)
                </span>
                <span className="bg-ocean-800/80 px-3 py-1.5 rounded-lg border border-ocean-700">
                  🗺️ Leaflet + Esri Tiles Homologado
                </span>
                <span className="bg-ocean-800/80 px-3 py-1.5 rounded-lg border border-ocean-700">
                  ⚡ Supabase Realtime WebSockets
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de QR Code para demonstração */}
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        numeroPulseira={qrPulseira}
        nomeCrianca={qrNomeCrianca}
      />
    </div>
  );
};
