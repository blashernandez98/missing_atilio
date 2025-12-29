import React, { useEffect, useContext, useState } from "react";
import { AppContext } from "@/app/components/App";
import Modal from '@/app/components/ui/modal'
import { Spinner } from './ui/spinner';

function InfoCard() {
  const { partido, toggleInfo, infoCard, toggleInstructions } = useContext(AppContext);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (partido["equipo"]) setLoading(false);
    console.log(partido)
  }, [partido]);

  const handlePlay = () => {
    toggleInfo();
  };

  const handleInfo = () => {
    toggleInfo();
    setTimeout(() => {
      toggleInstructions();
    }, 300);
  };

  return (
    <>
      <Modal isOpen={ infoCard } onClose={ toggleInfo }>
        <div className='flex flex-col bg-[#1e3c72] items-center justify-center text-center gap-3 sm:gap-4 p-5 sm:p-6 relative text-white rounded-xl border border-slate-600 shadow-2xl'>
          { loading && (
            <>
              <h3 className='text-xl sm:text-2xl font-bold'>Cargando Partido...</h3>
              <Spinner />
            </>
          ) }
          { !loading && (<>
            <button
              className='absolute top-3 right-3 rounded-full bg-slate-700 hover:bg-slate-600 w-8 h-8 text-white font-bold flex justify-center items-center transition-all border border-slate-600 hover:border-slate-500'
              onClick={ toggleInfo }
            >
              ✕
            </button>
            <h3 className='text-xl sm:text-2xl font-bold mt-3 sm:mt-4'>vs. { partido["rival"] }</h3>
            <p className='text-sm sm:text-md text-slate-300'>{ partido["fecha"] }</p>
            <h2 className='text-3xl sm:text-4xl font-bold text-slate-50'>{ partido["resultado"] }</h2>
            <p className='text-center text-sm sm:text-base text-slate-200'>{ partido["estadio"] }</p>
            <p className='text-center text-xs sm:text-sm text-slate-300'>{ partido["torneo"] }</p>
            <div className='grid grid-cols-2 gap-2 sm:gap-3 mt-2'>
              <button
                className='bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl'
                onClick={ handleInfo }
              >
                ℹ️ INFO
              </button>
              <button
                className='bg-blue-600 hover:bg-blue-700 border border-blue-500 hover:border-blue-400 rounded-lg px-3 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl'
                onClick={ handlePlay }
              >
                ▶️ JUGAR
              </button>
            </div>
          </>) }
        </div>
      </Modal>
    </>
  );
}

export default InfoCard;
