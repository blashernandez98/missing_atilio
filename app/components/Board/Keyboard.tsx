import React from "react";
import Key from "./Key";
import { useEffect, useContext } from "react";
import { WordleContext } from "./Wordle";
import { AppContext } from "@/app/components/App";

export function Keyboard() {
  const keys1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
  const keys2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  const keys3 = ["Z", "X", "C", "V", "B", "N", "M"];

  const { onDelete, onEnter, selectLetter, currentPlayerName } = useContext(WordleContext);
  const { toggleFieldMode, guesses, currentPlayer } = useContext(AppContext);

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "BACKSPACE") onDelete();
      else if (key === "ENTER") onEnter();
      else if (keys1.includes(key) || keys2.includes(key) || keys3.includes(key))
        selectLetter(key);
      else if (key === "ESCAPE") toggleFieldMode();
    }
    document.addEventListener("keydown", handleKeyboard);

    return () => {
      document.removeEventListener("keydown", handleKeyboard);
    };
  });

  const activeLetter = (letter: string) => {
    // Check for enter and delete keys
    if (letter === "ENTER" || letter === "DEL") return false;
    // Check for unused letter
    if (!guesses[currentPlayer].flat().includes(letter.toUpperCase())) return false;
    // Check for wrong letter
    const correct = currentPlayerName.includes(letter.toLowerCase());
    return correct ? false : true;
  }


  return (
    <div className="flex flex-col w-full items-center justify-center gap-5">
      <div className="grid grid-cols-10 rounded-sm">
        { keys1.map((key) => {
          let disabledKey = activeLetter(key);
          return <Key key={ `line1_${key}` } keyVal={ key } disabledKey={ disabledKey } />;
        }) }
      </div>
      <div className="grid grid-cols-9 rounded-sm">
        { keys2.map((key) => {
          let disabledKey = activeLetter(key);
          return <Key key={ `line2_${key}` } keyVal={ key } disabledKey={ disabledKey } />;
        }) }
      </div>
      <div className="grid grid-cols-9 rounded-sm place-items-center">
        <Key keyVal="ENTER" disabledKey={ false } />
        { keys3.map((key) => {
          let disabledKey = activeLetter(key);
          return <Key key={ `line2_${key}` } keyVal={ key } disabledKey={ disabledKey } />;
        }) }
        <Key keyVal="DEL" disabledKey={ false } />
      </div>
    </div>
  );
}
