'use client';

import React from 'react';

interface FormationSelectorProps {
  value: string;
  onChange: (formation: string) => void;
}

const AVAILABLE_FORMATIONS = ['4-4-2', '4-2-3-1', '4-2-4', '4-1-2-2-1', '4-3-3'];

function FormationSelector({ value, onChange }: FormationSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="formation" className="text-slate-200 font-semibold">
        Formación:
      </label>

      {/* Dropdown version */}
      <select
        id="formation"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-700 text-slate-50 rounded-md px-4 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
      >
        {AVAILABLE_FORMATIONS.map((formation) => (
          <option key={formation} value={formation}>
            {formation}
          </option>
        ))}
      </select>

      {/* Button group version (alternative) */}
      {/* <div className="grid grid-cols-2 gap-2">
        {AVAILABLE_FORMATIONS.map((formation) => (
          <button
            key={formation}
            onClick={() => onChange(formation)}
            className={`px-4 py-2 rounded-md font-semibold transition-all ${
              value === formation
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {formation}
          </button>
        ))}
      </div> */}
    </div>
  );
}

export default FormationSelector;
