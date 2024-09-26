import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "@/app/components/App";
import Modal from '@/app/components/ui/modal'
import { Spinner } from './ui/spinner';

function InfoCard() {
  const { partido, toggleInfo, infoCard, toggleInstructions } = useContext(AppContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (partido["equipo"]) setLoading(false);
  }, [partido]);

  const handlePlay = () => {
    toggleInfo();
  };

  const handleInfo = () => {
    toggleInfo();
    setTimeout(() => {
      toggleInstructions();
    }
      , 300);
  }

  return (
    <Modal isOpen={ infoCard } onClose={ toggleInfo }>
      <div className='flex flex-col bg-[#1e3c72] items-center justify-center text-center gap-3 p-3 relative text-white'>
        { loading && (
          <>
            <h3 className='text-2xl font-bold'>Cargando Partido...</h3>
            <Spinner />
          </>
        ) }
        { !loading && (<>
          <button className='absolute top-1 right-1 rounded-full bg-red-500 w-5 h-5 text-white font-bold flex justify-center items-center' onClick={ toggleInfo }>x</button>
          <h3 className='text-2xl font-bold mt-5'>vs. { partido["rival"] }</h3>
          <p className='text-md text-slate-200'>{ partido["fecha"] }</p>
          <h2 className='text-4xl font-bold'>{ partido["resultado"] }</h2>
          <p className='text-center'>{ partido["estadio"] }</p>
          <p className='text-center'>{ partido["torneo"] }</p>
          <div className='grid grid-cols-2 gap-2'>
            <button className='bg-red-500 col-span-1 rounded-md w-20 h-10 mb-5 text-white font-bold hover:scale-110 transition-all ease-in duration-75' onClick={ handleInfo }>INFO</button>
            <button className='bg-red-500 col-span-1 rounded-md w-20 h-10 mb-5 text-white font-bold hover:scale-110 transition-all ease-in duration-75' onClick={ handlePlay }>JUGAR</button>
          </div>
        </>) }
      </div>
    </Modal>
  );
}

export default InfoCard;
