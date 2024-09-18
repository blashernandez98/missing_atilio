import React, { useEffect, useContext } from "react";
import { AppContext } from "@/app/components/App";
import Modal from '@/app/components/ui/modal'

function InfoCard() {
  const { partido, toggleInfo, infoCard } = useContext(AppContext);

  useEffect(() => {
    console.log(partido);
  }, [partido]);

  const handleClick = () => {
    toggleInfo();
  };

  return (
    <Modal isOpen={ infoCard } onClose={ toggleInfo }>
      <div className='flex flex-col items-center justify-center gap-3 p-3'>
        <h3 className='text-2xl font-bold'>Vs. { partido["rival"] }</h3>
        <p className='text-md text-zinc-500'>{ partido["fecha"] }</p>
        <h2 className='text-4xl font-bold'>{ partido["resultado"] }</h2>
        <p>{ partido["torneo"] }</p>
        <p>{ partido["estadio"] }</p>

        <button className='bg-red-500 rounded-md w-20 h-10 text-white hover:scale-110 transition-all ease-in duration-75' onClick={ handleClick }>Jugar</button>
      </div>
    </Modal>
  );
}

export default InfoCard;
