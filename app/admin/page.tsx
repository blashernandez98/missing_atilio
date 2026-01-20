'use client';

import React, { useState, useEffect } from 'react';
import { Partido, CronogramaDB, PlayerScheduleDB, Player, GameMode, LeaderboardEntry } from '@/lib/types';
import AdminField from '@/app/components/admin/AdminField';
import ControlPanel from '@/app/components/admin/ControlPanel';
import partidosData from '@/app/data/partidos.json';
import playersData from '@/app/data/players.json';
import { getTomorrowStringUruguay, parseDDMMYYYYToDate, formatDateToDDMMYYYY } from '@/lib/date';

const GAME_MODE_LABELS: Record<GameMode, string> = {
  'wordle': 'Missing 11',
  'versus': '¿Quién tiene más?',
  'guess_player_scheduled': 'Adivina el Jugador (Diario)',
  'guess_player_random': 'Adivina el Jugador (Aleatorio)',
};

interface StatsSummary {
  gameMode: GameMode;
  totalPlays: number;
  totalWins: number;
  avgScore: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'stats'>('matches');

  // Match scheduling state
  const [selectedMatch, setSelectedMatch] = useState<Partido | null>(null);
  const [selectedGameIndex, setSelectedGameIndex] = useState<number | null>(null);
  const [formation, setFormation] = useState<string>('4-4-2');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [schedules, setSchedules] = useState<CronogramaDB[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedLineup, setModifiedLineup] = useState<{ [key: number]: string } | null>(null);

  // Player scheduling state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerScheduleDate, setPlayerScheduleDate] = useState<string>('');
  const [playerSchedules, setPlayerSchedules] = useState<PlayerScheduleDB[]>([]);
  const [isPlayerSaving, setIsPlayerSaving] = useState(false);

  // Stats state
  const [leaderboards, setLeaderboards] = useState<Record<GameMode, LeaderboardEntry[]>>({
    'wordle': [],
    'versus': [],
    'guess_player_scheduled': [],
    'guess_player_random': [],
  });
  const [statsSummary, setStatsSummary] = useState<StatsSummary[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const partidos: Partido[] = partidosData as Partido[];
  const players: Player[] = playersData as Player[];

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
    fetchPlayerSchedules();
  }, []);

  // Calculate next available date from schedules array (Uruguay timezone)
  const calculateNextAvailableDate = (schedulesList: CronogramaDB[]) => {
    if (schedulesList.length === 0) {
      // No schedules, return tomorrow in Uruguay timezone
      return getTomorrowStringUruguay();
    }

    // Parse all dates and find the maximum
    const dates = schedulesList.map(schedule => parseDDMMYYYYToDate(schedule.live_date));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add 1 day to the maximum date
    maxDate.setDate(maxDate.getDate() + 1);
    return formatDateToDDMMYYYY(maxDate);
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/cronograma?includeMetadata=true');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
        // Calculate next available date from the fetched schedules
        setScheduleDate(calculateNextAvailableDate(data));
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const selectRandomMatch = (dateRange?: { start: string; end: string }) => {
    let filteredPartidos = partidos;

    // Apply date filter if provided
    if (dateRange && dateRange.start && dateRange.end) {
      filteredPartidos = partidos.filter((partido) => {
        const matchDate = parseDate(partido.fecha);
        const startDate = parseDate(dateRange.start);
        const endDate = parseDate(dateRange.end);

        return matchDate >= startDate && matchDate <= endDate;
      });

      if (filteredPartidos.length === 0) {
        alert('No hay partidos en el rango de fechas especificado');
        return;
      }
    }

    const randomIndex = Math.floor(Math.random() * filteredPartidos.length);
    const selectedPartido = filteredPartidos[randomIndex];

    // Find the original index in the full array
    const originalIndex = partidos.findIndex(
      (p) =>
        p.fecha === selectedPartido.fecha &&
        p.rival === selectedPartido.rival &&
        p.estadio === selectedPartido.estadio
    );

    setSelectedMatch(selectedPartido);
    setSelectedGameIndex(originalIndex);
    setModifiedLineup(null); // Reset lineup changes when selecting new match
  };

  const handleLineupChange = (newLineup: { [key: number]: string }) => {
    setModifiedLineup(newLineup);
  };

  // State for editing existing schedules
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!selectedMatch || !scheduleDate || !formation) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (selectedGameIndex === null) {
      alert('Error: No se pudo determinar el índice del partido');
      return;
    }

    setIsSaving(true);

    try {
      // Check if we're editing or creating
      const isEditing = editingScheduleId !== null;
      const url = isEditing ? `/api/cronograma/${editingScheduleId}` : '/api/cronograma';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          live_date: scheduleDate,
          formation: formation,
          game_index: selectedGameIndex,
          player_positions: modifiedLineup || undefined,
        }),
      });

      if (res.ok) {
        alert(isEditing ? '✅ Partido actualizado exitosamente!' : '✅ Partido programado exitosamente!');
        // Refresh schedules (which will recalculate next available date)
        await fetchSchedules();
        // Clear selection
        setSelectedMatch(null);
        setSelectedGameIndex(null);
        setModifiedLineup(null);
        setEditingScheduleId(null);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error || 'No se pudo guardar el partido'}`);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('❌ Error al guardar. Ver consola para detalles.');
    } finally {
      setIsSaving(false);
    }
  };

  // Load an existing schedule for editing
  const handleEditSchedule = (schedule: CronogramaDB) => {
    const partido = partidos[schedule.game_index];
    if (!partido) {
      alert('Error: No se pudo encontrar el partido');
      return;
    }

    setSelectedMatch(partido);
    setSelectedGameIndex(schedule.game_index);
    setFormation(schedule.formation);
    setScheduleDate(schedule.live_date);
    setEditingScheduleId(schedule.id);

    // Load custom player positions if they exist
    if (schedule.player_positions) {
      setModifiedLineup(schedule.player_positions);
    } else {
      setModifiedLineup(null);
    }
  };

  // Cancel editing and reset to new schedule mode
  const handleCancelEdit = () => {
    setSelectedMatch(null);
    setSelectedGameIndex(null);
    setModifiedLineup(null);
    setEditingScheduleId(null);
    // Recalculate next available date
    setScheduleDate(calculateNextAvailableDate(schedules));
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este partido programado?')) {
      return;
    }

    try {
      const res = await fetch(`/api/cronograma/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Partido eliminado exitosamente!');
        await fetchSchedules();
      } else {
        alert('❌ Error al eliminar el partido');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('❌ Error al eliminar. Ver consola para detalles.');
    }
  };

  // Player scheduling functions (Uruguay timezone)
  const calculateNextAvailableDateForPlayer = (schedulesList: PlayerScheduleDB[]) => {
    if (schedulesList.length === 0) {
      // No schedules, return tomorrow in Uruguay timezone
      return getTomorrowStringUruguay();
    }

    // Parse all dates and find the maximum
    const dates = schedulesList.map(schedule => parseDDMMYYYYToDate(schedule.live_date));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add 1 day to the maximum date
    maxDate.setDate(maxDate.getDate() + 1);
    return formatDateToDDMMYYYY(maxDate);
  };

  const fetchPlayerSchedules = async () => {
    try {
      const res = await fetch('/api/player-schedule?includeMetadata=true');
      if (res.ok) {
        const data = await res.json();
        setPlayerSchedules(data);
        // Calculate next available date from the fetched schedules
        setPlayerScheduleDate(calculateNextAvailableDateForPlayer(data));
      } else {
        console.error('Failed to fetch player schedules');
      }
    } catch (error) {
      console.error('Error fetching player schedules:', error);
    }
  };

  const selectRandomPlayer = () => {
    const randomIndex = Math.floor(Math.random() * players.length);
    setSelectedPlayer(players[randomIndex]);
  };

  const handlePlayerSave = async () => {
    if (!selectedPlayer || !playerScheduleDate) {
      alert('Por favor selecciona un jugador y una fecha');
      return;
    }

    setIsPlayerSaving(true);

    try {
      const res = await fetch('/api/player-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          live_date: playerScheduleDate,
          player_id: selectedPlayer.id,
        }),
      });

      if (res.ok) {
        alert('✅ Jugador programado exitosamente!');
        await fetchPlayerSchedules();
        setSelectedPlayer(null);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error || 'No se pudo programar el jugador'}`);
      }
    } catch (error) {
      console.error('Error saving player schedule:', error);
      alert('❌ Error al guardar. Ver consola para detalles.');
    } finally {
      setIsPlayerSaving(false);
    }
  };

  const handleDeletePlayerSchedule = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este jugador programado?')) {
      return;
    }

    try {
      const res = await fetch(`/api/player-schedule/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('✅ Jugador eliminado exitosamente!');
        await fetchPlayerSchedules();
      } else {
        alert('❌ Error al eliminar el jugador');
      }
    } catch (error) {
      console.error('Error deleting player schedule:', error);
      alert('❌ Error al eliminar. Ver consola para detalles.');
    }
  };

  // Helper function to parse dates in dd/mm/yyyy format (for partidos.json)
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Fetch stats and leaderboards for all game modes
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const gameModes: GameMode[] = ['wordle', 'versus', 'guess_player_scheduled', 'guess_player_random'];

      // Fetch leaderboards and summary in parallel
      const [leaderboardResults, summaryRes] = await Promise.all([
        Promise.all(
          gameModes.map(async (mode) => {
            const res = await fetch(`/api/stats/leaderboard?gameMode=${mode}&limit=20`);
            if (res.ok) {
              const data = await res.json();
              return { mode, data };
            }
            return { mode, data: [] };
          })
        ),
        fetch('/api/stats/summary')
      ]);

      const newLeaderboards: Record<GameMode, LeaderboardEntry[]> = {
        'wordle': [],
        'versus': [],
        'guess_player_scheduled': [],
        'guess_player_random': [],
      };

      leaderboardResults.forEach(({ mode, data }) => {
        newLeaderboards[mode] = data;
      });

      setLeaderboards(newLeaderboards);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setStatsSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch stats when tab is selected
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-6 px-4">
      {/* Tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'matches'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Programar Partidos
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'players'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Programar Jugadores
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Estadísticas
        </button>
      </div>

      {/* Match Scheduling */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex justify-center">
            <AdminField
              match={selectedMatch}
              formation={formation}
              onLineupChange={handleLineupChange}
              initialLineup={modifiedLineup}
            />
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ControlPanel
                selectedMatch={selectedMatch}
                selectedGameIndex={selectedGameIndex}
                formation={formation}
                setFormation={setFormation}
                scheduleDate={scheduleDate}
                setScheduleDate={setScheduleDate}
                onRandomMatch={selectRandomMatch}
                onSave={handleSave}
                schedules={schedules}
                onDeleteSchedule={handleDeleteSchedule}
                onEditSchedule={handleEditSchedule}
                onCancelEdit={handleCancelEdit}
                editingScheduleId={editingScheduleId}
                isSaving={isSaving}
                allMatches={partidos}
              />
            </div>
          </div>
        </div>
      )}

      {/* Player Scheduling */}
      {activeTab === 'players' && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex flex-col gap-4 p-4 bg-slate-900 rounded-lg">
            <h2 className="text-2xl font-bold text-slate-50 text-center">
              Programar Jugador para Adivina el Jugador
            </h2>

            {/* Select Player */}
            <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-200">
                Seleccionar Jugador
              </h3>
              <button
                onClick={selectRandomPlayer}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all"
              >
                🎲 Jugador al Azar
              </button>

              {selectedPlayer && (
                <div className="mt-2 p-3 bg-slate-700 rounded-md">
                  <p className="text-white font-bold">{selectedPlayer.name}</p>
                  <p className="text-slate-400 text-sm">ID: {selectedPlayer.id}</p>
                </div>
              )}
            </div>

            {/* Schedule Date */}
            <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-4">
              <label className="text-slate-200 font-semibold">
                Fecha (dd-mm-aaaa):
              </label>
              <input
                type="text"
                value={playerScheduleDate}
                onChange={(e) => setPlayerScheduleDate(e.target.value)}
                placeholder="dd-mm-aaaa"
                className="bg-slate-700 text-slate-50 rounded px-3 py-2"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handlePlayerSave}
              disabled={isPlayerSaving || !selectedPlayer || !playerScheduleDate}
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-all"
            >
              {isPlayerSaving ? 'Guardando...' : '💾 Programar Jugador'}
            </button>

            {/* Scheduled Players List */}
            <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-200">
                Jugadores Programados ({playerSchedules.length})
              </h3>
              <div className="max-h-96 overflow-y-auto">
                {playerSchedules.length === 0 ? (
                  <p className="text-slate-400 text-sm">No hay jugadores programados aún.</p>
                ) : (
                  <div className="space-y-2">
                    {[...playerSchedules].reverse().map((schedule) => {
                      const player = players.find(p => p.id === schedule.player_id);
                      return (
                        <div
                          key={schedule.id}
                          className="flex justify-between items-center bg-slate-700 rounded p-3"
                        >
                          <div>
                            <p className="text-white font-semibold">
                              {player?.name || `ID: ${schedule.player_id}`}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {schedule.live_date}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeletePlayerSchedule(schedule.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {activeTab === 'stats' && (
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-6 p-4 bg-slate-900 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-50">
                Estadísticas
              </h2>
              <button
                onClick={fetchStats}
                disabled={isLoadingStats}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold py-2 px-4 rounded-md transition-all"
              >
                {isLoadingStats ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {/* Summary Stats */}
            <div className="bg-slate-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-400 mb-4">
                Resumen General
              </h3>
              {statsSummary.length === 0 ? (
                <p className="text-slate-500 text-sm">No hay datos aún.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['wordle', 'versus', 'guess_player_scheduled', 'guess_player_random'] as GameMode[]).map((mode) => {
                    const stats = statsSummary.find(s => s.gameMode === mode);
                    const winRate = stats && stats.totalPlays > 0
                      ? ((stats.totalWins / stats.totalPlays) * 100).toFixed(1)
                      : '0';
                    const isVersus = mode === 'versus';
                    return (
                      <div key={mode} className="bg-slate-700 rounded-lg p-3">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2 truncate">
                          {GAME_MODE_LABELS[mode]}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Partidas:</span>
                            <span className="text-white font-bold">{stats?.totalPlays || 0}</span>
                          </div>
                          {!isVersus && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Victorias:</span>
                                <span className="text-green-400 font-bold">{stats?.totalWins || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">% Victoria:</span>
                                <span className="text-cyan-400 font-bold">{winRate}%</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-400">{isVersus ? 'Prom. Racha:' : 'Prom. Score:'}</span>
                            <span className="text-yellow-400 font-bold">{stats?.avgScore.toFixed(1) || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Leaderboards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['versus', 'wordle', 'guess_player_scheduled', 'guess_player_random'] as GameMode[]).map((mode) => (
                <div key={mode} className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                    🏆 {GAME_MODE_LABELS[mode]}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">
                    {mode === 'versus' ? 'Mayor racha = mejor' : 'Menos intentos = mejor'}
                  </p>

                  {leaderboards[mode].length === 0 ? (
                    <p className="text-slate-500 text-sm">No hay registros aún.</p>
                  ) : (
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {leaderboards[mode].map((entry, index) => (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-3 p-2 rounded ${
                            index < 3 ? 'bg-yellow-900/30' : 'bg-slate-700/50'
                          }`}
                        >
                          <span className={`w-6 text-center font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-slate-300' :
                            index === 2 ? 'text-amber-600' :
                            'text-slate-500'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {entry.playerName || 'Anónimo'}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {entry.targetDate && `${entry.targetDate} • `}
                              {new Date(entry.createdAt).toLocaleDateString('es-UY')}
                            </p>
                          </div>
                          <span className="text-lg font-bold text-cyan-400">
                            {entry.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
