import React, { useEffect, useContext, useState } from "react";
import PropTypes from "prop-types";
import { AppContext } from "@/app/components/App";
import { Formaciones, Formation } from '@/lib/Football';
import Jugador from "./Jugador";

interface FieldProps {
  formation: string;
}

function Field({ formation }: FieldProps) {
  const { solved, toggleGameOver, toggleInfo, toggleInstructions } = useContext(AppContext);

  const coordenadas: Formation = Formaciones[formation];

  useEffect(() => {
    if (Object.keys(solved).length === 11) toggleGameOver();
  }, [solved]);
  return (
    <div className="flex flex-col items-center p-5">
      <div className="flex flex-row justify-center items-center text-slate-50 gap-5 font-bold mb-4">
        <button onClick={ toggleInfo } className="rounded-md hover:scale-110 bg-gradient-to-r from-rose-600 to-red-500 p-2 shadow-md">
          Datos Partido
        </button>
        <button
          className="rounded-md hover:scale-110 bg-gradient-to-r from-rose-600 to-red-500 p-2 shadow-md"
          onClick={ toggleInstructions }>Como Jugar</button>
      </div>
      <div id='cancha' className="relative flex flex-col w-[310px] sm:w-[550px] md:w-[700px] aspect-[2/3]">
        <div className="absolute inset-0 bg-football-field bg-no-repeat bg-contain opacity-50"></div>
        <div className="relative z-10 grid grid-rows-6 grid-cols-5 place-items-center py-5 h-[90%] sm:h-[80%]">
          { Array.from({ length: 11 }).map((_, i) => (
            <Jugador key={ i } position={ i + 1 } locationX={ coordenadas[i + 1][0] } locationY={ coordenadas[i + 1][1] } />
          )) }

        </div>
      </div>
    </div>
  );
}

Field.proptypes = { formation: PropTypes.string.isRequired };

export default Field;
