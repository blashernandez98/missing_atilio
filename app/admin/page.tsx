'use client';

import React, { useState, useEffect } from 'react';
import { Partido, CronogramaDB } from '@/lib/types';
import AdminField from '@/app/components/admin/AdminField';
import ControlPanel from '@/app/components/admin/ControlPanel';
import partidosData from '@/app/data/partidos.json';

export default function AdminPage() {
  const [selectedMatch, setSelectedMatch] = useState<Partido | null>(null);
  const [selectedGameIndex, setSelectedGameIndex] = useState<number | null>(null);
  const [formation, setFormation] = useState<string>('4-4-2');
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [schedules, setSchedules] = useState<CronogramaDB[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedLineup, setModifiedLineup] = useState<{ [key: number]: string } | null>(null);

  const partidos: Partido[] = partidosData as Partido[];

  // Fetch schedules on mount
  useEffect(() => {
    fetchSchedules();
    fetchNextAvailableDate();
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

  // Helper function to parse dates in dd/mm/yyyy format
  const parseDate = (dateString: string): Date => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-4">
      {/* Left side: Field */}
      <div className="flex justify-center">
        <AdminField
          match={selectedMatch}
          formation={formation}
          onLineupChange={handleLineupChange}
        />
      </div>

      {/* Right side: Control Panel */}
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
  );
}
