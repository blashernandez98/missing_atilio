import React, { useContext } from "react";
import PropTypes from "prop-types";
import { WordleContext } from "./Wordle";

interface KeyProps {
  keyVal: string;
  disabledKey: boolean;
}

function Key({ keyVal, disabledKey }: KeyProps) {
  const { selectLetter, onDelete, onEnter, letterStates } =
    useContext(WordleContext);

  const handlekey = () => {
    if (keyVal === "ENTER") {
      onEnter();
    } else if (keyVal === "DEL") {
      onDelete();
    } else {
      selectLetter(keyVal);
    }
  };

  const specialKeyClasses = keyVal === "ENTER" || keyVal === "DEL" ? "w-16 h-10 px-3 text-xs" : "w-10 aspect-square text-sm"
  const disabledClasses = letterStates[keyVal] === 'error' ? 'bg-zinc-500/80 opacity-50' : 'bg-slate-700/80 hover:bg-slate-600';

  return (
    <div
      className={ `${letterStates[keyVal]} ${specialKeyClasses} ${disabledClasses} flex justify-center items-center cursor-pointer text-white font-semibold rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-150 shadow-md hover:shadow-lg active:scale-95` }
      onClick={ handlekey }
    >
      { keyVal }
    </div>
  );
}

Key.propTypes = { keyVal: PropTypes.string.isRequired };

export default Key;
