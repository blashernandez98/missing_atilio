'use client';

import React, { useState, useEffect } from 'react';
import { Partido, CronogramaDB, PlayerScheduleDB, Player } from '@/lib/types';
import AdminField from '@/app/components/admin/AdminField';
import ControlPanel from '@/app/components/admin/ControlPanel';
import partidosData from '@/app/data/partidos.json';
import playersData from '@/app/data/players.json';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'players'>('matches');

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

  const partidos: Partido[] = partidosData as Partido[];
  const players: Player[] = playersData as Player[];

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
    fetchNextAvailableDate();
    fetchPlayerSchedules();
    fetchNextAvailableDateForPlayer();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/cronograma?includeMetadata=true');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      } else {
        console.error('Failed to fetch schedules');
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchNextAvailableDate = async () => {
    try {
      const res = await fetch('/api/cronograma/next-available-date');
      if (res.ok) {
        const data = await res.json();
        setScheduleDate(data.nextAvailableDate);
      } else {
        console.error('Failed to fetch next available date');
      }
    } catch (error) {
      console.error('Error fetching next available date:', error);
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
      const res = await fetch('/api/cronograma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          live_date: scheduleDate,
          formation: formation,
          game_index: selectedGameIndex,
        }),
      });

      if (res.ok) {
        alert('✅ Partido programado exitosamente!');
        // Refresh schedules and get next available date
        await fetchSchedules();
        await fetchNextAvailableDate();
        // Clear selection
        setSelectedMatch(null);
        setSelectedGameIndex(null);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.error || 'No se pudo programar el partido'}`);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('❌ Error al guardar. Ver consola para detalles.');
    } finally {
      setIsSaving(false);
    }
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
        await fetchNextAvailableDate();
      } else {
        alert('❌ Error al eliminar el partido');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('❌ Error al eliminar. Ver consola para detalles.');
    }
  };

  // Player scheduling functions
  const fetchPlayerSchedules = async () => {
    try {
      const res = await fetch('/api/player-schedule?includeMetadata=true');
      if (res.ok) {
        const data = await res.json();
        setPlayerSchedules(data);
      } else {
        console.error('Failed to fetch player schedules');
      }
    } catch (error) {
      console.error('Error fetching player schedules:', error);
    }
  };

  const fetchNextAvailableDateForPlayer = async () => {
    try {
      const res = await fetch('/api/player-schedule/next-available-date');
      if (res.ok) {
        const data = await res.json();
        setPlayerScheduleDate(data.nextAvailableDate);
      } else {
        console.error('Failed to fetch next available date for player');
      }
    } catch (error) {
      console.error('Error fetching next available date for player:', error);
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
        await fetchNextAvailableDateForPlayer();
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
        await fetchNextAvailableDateForPlayer();
      } else {
        alert('❌ Error al eliminar el jugador');
      }
    } catch (error) {
      console.error('Error deleting player schedule:', error);
      alert('❌ Error al eliminar. Ver consola para detalles.');
    }
  };

  // Helper function to parse dates in dd/mm/yyyy format
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <div className="flex flex-col gap-6 px-4">
      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab('matches')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'matches'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Programar Partidos (Missing11)
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'players'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Programar Jugadores (Adivina el Jugador)
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
                isSaving={isSaving}
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
                    {playerSchedules.map((schedule) => {
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
    </div>
  );
}
