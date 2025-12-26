import React, { useEffect, useContext, useState } from "react";
import PropTypes from "prop-types";
import { AppContext } from "@/app/components/App";
import { Formaciones, Formation } from '@/lib/Football';
import Jugador from "./Jugador";
import TestGameOverModal from "../TestGameOverModal";

interface FieldProps {
  formation: string;
}

function Field({ formation }: FieldProps) {
  const { solved, setSolved, toggleGameOver, toggleInfo, toggleInstructions } = useContext(AppContext);
  const [showTestModal, setShowTestModal] = useState(false);

  const coordenadas: Formation = Formaciones[formation];

  useEffect(() => {
    if (Object.keys(solved).length === 11) toggleGameOver();
  }, [solved]);

  const handleTestGameOver = (solvedPlayers: number, totalGuesses: number) => {
    // Create a test solved state with custom values
    const testSolved: { [key: number]: number } = {};
    let remainingGuesses = totalGuesses;

    // Distribute guesses among solved players
    for (let i = 1; i <= 11; i++) {
      if (i <= solvedPlayers) {
        // For solved players, assign reasonable guess counts
        const guessesForPlayer = Math.min(
          Math.floor(Math.random() * 5) + 1,
          remainingGuesses - (solvedPlayers - i)
        );
        testSolved[i] = guessesForPlayer;
        remainingGuesses -= guessesForPlayer;
      } else {
        // For unsolved players, mark as failed
        testSolved[i] = 6;
      }
    }

    // Set the solved state - the useEffect will trigger the game over modal
    setSolved(testSolved);
  };
  return (
    <div className="flex flex-col items-center p-5">
      <div className="flex flex-row justify-center items-center text-slate-50 gap-3 font-semibold mb-6 flex-wrap">
        <button
          onClick={ toggleInfo }
          className="rounded-lg px-4 py-2.5 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm">
          📊 Datos Partido
        </button>
        <button
          className="rounded-lg px-4 py-2.5 bg-slate-700/80 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          onClick={ toggleInstructions }>ℹ️ Cómo Jugar</button>
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => setShowTestModal(true)}
            className="rounded-lg px-4 py-2.5 bg-purple-700/80 hover:bg-purple-600 border border-purple-600 hover:border-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm">
            🧪 Test Game Over
          </button>
        )}
      </div>
      <div id='cancha' className="relative flex flex-col w-[310px] sm:w-[550px] aspect-[2/3]">
        <div className="absolute inset-0 bg-football-field bg-no-repeat bg-contain opacity-50"></div>
        <div className="relative z-10 grid grid-rows-6 grid-cols-5 place-items-center py-5 h-[90%] sm:h-[80%]">
          { Array.from({ length: 11 }).map((_, i) => (
            <Jugador key={ i } position={ i + 1 } locationX={ coordenadas[i + 1][0] } locationY={ coordenadas[i + 1][1] } />
          )) }

        </div>
      </div>

      {/* Test Modal */}
      <TestGameOverModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        onTest={handleTestGameOver}
      />
    </div>
  );
}

Field.proptypes = { formation: PropTypes.string.isRequired };

export default Field;
