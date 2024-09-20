import React, { useEffect, useContext } from "react";
import { AppContext } from "@/app/components/App";
import Jugador from "./Jugador";

function Field() {
  const { solved, toggleGameOver, toggleInfo, toggleInstructions } = useContext(AppContext);

  useEffect(() => {
    if (Object.keys(solved).length === 11) toggleGameOver();
  }, [solved]);
  return (
    <div className="flex flex-col gap-8 p-5">
      <div className="flex flex-row justify-center items-center w-full h-10 text-slate-50 gap-5">
        <button onClick={ toggleInfo } className="rounded-md h-12 hover:scale-110 bg-gradient-to-r from-rose-600 to-red-500 p-2 shadow-md">
          Datos Partido
        </button>
        <button
          className="rounded-md h-12 hover:scale-110 bg-gradient-to-r from-rose-600 to-red-500 p-2 shadow-md"
          onClick={ toggleInstructions }>Como Jugar</button>
      </div>
      <div className="relative flex flex-col gap-8 h-[600px]">
        <div className="absolute inset-0 bg-football-field bg-no-repeat bg-center bg-contain h-full opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-evenly h-full">
          <div className="flex flex-row w-full gap-5 items-center justify-center">
            <Jugador position={ 1 } />
          </div>
          <div className="flex flex-row w-full gap-5 items-center justify-center">
            <Jugador position={ 2 } />
            <Jugador position={ 3 } />
            <Jugador position={ 4 } />
            <Jugador position={ 5 } />
          </div>
          <div className="flex flex-row w-full gap-5 items-center justify-center">
            <Jugador position={ 6 } />
            <Jugador position={ 7 } />
            <Jugador position={ 8 } />
            <Jugador position={ 9 } />
          </div>
          <div className="flex flex-row w-full gap-5 items-center justify-center">
            <Jugador position={ 10 } />
            <Jugador position={ 11 } />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Field;
