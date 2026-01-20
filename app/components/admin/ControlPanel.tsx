'use client';

import React, { useState } from 'react';
import { Partido, CronogramaDB } from '@/lib/types';
import FormationSelector from './FormationSelector';
import MatchInfoDisplay from './MatchInfoDisplay';

interface ControlPanelProps {
  selectedMatch: Partido | null;
  selectedGameIndex: number | null;
  formation: string;
  setFormation: (formation: string) => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
  onRandomMatch: (dateRange?: { start: string; end: string }) => void;
  onSave: () => void;
  schedules: CronogramaDB[];
  onDeleteSchedule: (id: number) => void;
  onEditSchedule: (schedule: CronogramaDB) => void;
  onCancelEdit: () => void;
  editingScheduleId: number | null;
  isSaving: boolean;
  allMatches: Partido[];
}

function ControlPanel({
  selectedMatch,
  selectedGameIndex,
  formation,
  setFormation,
  scheduleDate,
  setScheduleDate,
  onRandomMatch,
  onSave,
  schedules,
  onDeleteSchedule,
  onEditSchedule,
  onCancelEdit,
  editingScheduleId,
  isSaving,
  allMatches
}: ControlPanelProps) {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  const handleRandomMatch = () => {
    if (showDateFilter && dateFilterStart && dateFilterEnd) {
      onRandomMatch({ start: dateFilterStart, end: dateFilterEnd });
    } else {
      onRandomMatch();
    }
  };

  const canSave = selectedMatch && scheduleDate && formation;

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 rounded-lg max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-50 text-center">
        Panel de Control
      </h2>

      {/* Random Match Section */}
      <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200">
          Seleccionar Partido
        </h3>

        <button
          onClick={handleRandomMatch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all"
        >
          🎲 Partido al Azar
        </button>

        {/* Date Filter Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-date-filter"
            checked={showDateFilter}
            onChange={(e) => setShowDateFilter(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <label
            htmlFor="show-date-filter"
            className="text-sm text-slate-300 cursor-pointer"
          >
            Filtrar por rango de fechas
          </label>
        </div>

        {/* Date Filter Inputs */}
        {showDateFilter && (
          <div className="flex flex-col gap-2 mt-2 pl-4 border-l-2 border-slate-600">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Desde:</label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={dateFilterStart}
                onChange={(e) => setDateFilterStart(e.target.value)}
                className="bg-slate-700 text-slate-50 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Hasta:</label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={dateFilterEnd}
                onChange={(e) => setDateFilterEnd(e.target.value)}
                className="bg-slate-700 text-slate-50 rounded px-2 py-1 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Match Info Display */}
      <MatchInfoDisplay match={selectedMatch} gameIndex={selectedGameIndex} />

      {/* Formation Selector */}
      <div className="bg-slate-800 rounded-lg p-4">
        <FormationSelector value={formation} onChange={setFormation} />
      </div>

      {/* Schedule Date Picker */}
      <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-4">
        <label htmlFor="schedule-date" className="text-slate-200 font-semibold">
          Fecha de Programación:
        </label>
        <input
          type="text"
          id="schedule-date"
          placeholder="dd-mm-yyyy"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          className="bg-slate-700 text-slate-50 rounded-md px-4 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-slate-400">
          Formato: dd-mm-yyyy (ej: 25-12-2024)
        </p>
      </div>

      {/* Editing Mode Indicator */}
      {editingScheduleId !== null && (
        <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3 text-center">
          <p className="text-yellow-400 font-semibold text-sm">
            ✏️ Modo Edición
          </p>
          <p className="text-yellow-300/70 text-xs mt-1">
            Modificando partido programado
          </p>
        </div>
      )}

      {/* Save/Cancel Buttons */}
      <div className="flex gap-2">
        {editingScheduleId !== null && (
          <button
            onClick={onCancelEdit}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-md transition-all"
          >
            ❌ Cancelar
          </button>
        )}
        <button
          onClick={onSave}
          disabled={!canSave || isSaving}
          className={`flex-1 font-bold py-3 px-4 rounded-md transition-all ${
            canSave && !isSaving
              ? editingScheduleId !== null
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isSaving
            ? '⏳ Guardando...'
            : editingScheduleId !== null
            ? '✏️ Actualizar'
            : '💾 Programar'}
        </button>
      </div>

      {/* Scheduled Matches List */}
      <div className="flex flex-col gap-2 bg-slate-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-600 pb-2">
          Partidos Programados ({schedules.length})
        </h3>

        {schedules.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-2">
            No hay partidos programados
          </p>
        ) : (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {[...schedules].reverse().map((schedule) => {
              const match = allMatches[schedule.game_index];
              const isEditing = editingScheduleId === schedule.id;
              const hasCustomPositions = schedule.player_positions && Object.keys(schedule.player_positions).length > 0;
              return (
                <div
                  key={schedule.id}
                  className={`flex justify-between items-center rounded p-2 text-sm ${
                    isEditing ? 'bg-yellow-600/30 border border-yellow-500' : 'bg-slate-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-slate-50 font-semibold flex items-center gap-2">
                      {schedule.live_date}
                      {hasCustomPositions && (
                        <span className="text-cyan-400 text-xs" title="Posiciones personalizadas">
                          🔄
                        </span>
                      )}
                    </span>
                    {match && (
                      <span className="text-slate-300 text-xs">
                        vs. {match.rival} ({match.fecha})
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">
                      {schedule.formation} | Partido #{schedule.game_index}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditSchedule(schedule)}
                      className={`${
                        isEditing
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white font-bold px-3 py-1 rounded text-xs transition-all`}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded text-xs transition-all"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlPanel;
