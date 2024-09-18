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

  const specialKeyClasses = keyVal === "ENTER" || keyVal === "DEL" ? "w-10 sm:w-14" : "w-6 sm:w-10"
  const disabledClasses = letterStates[keyVal] === 'error' ? ' bg-zinc-400' : '';

  return (
    <div
      className={ `${letterStates[keyVal]} ${specialKeyClasses} ${disabledClasses} p-1 text-sm h-10 flex mx-1 justify-center items-center cursor-pointer text-white border-2 border-slate-50` }
      onClick={ handlekey }
    >
      { keyVal }
    </div>
  );
}

Key.propTypes = { keyVal: PropTypes.string.isRequired };

export default Key;
