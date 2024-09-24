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

  const specialKeyClasses = keyVal === "ENTER" || keyVal === "DEL" ? "w-16 h-8 sm:w-20 sm:h-10 p-2" : "w-8 sm:w-12 aspect-square p-1"
  const disabledClasses = letterStates[keyVal] === 'error' ? ' bg-zinc-400' : '';

  return (
    <div
      className={ `${letterStates[keyVal]} ${specialKeyClasses} ${disabledClasses} text-sm flex mx-1 justify-center items-center cursor-pointer text-white border-2 border-slate-50` }
      onClick={ handlekey }
    >
      { keyVal }
    </div>
  );
}

Key.propTypes = { keyVal: PropTypes.string.isRequired };

export default Key;
