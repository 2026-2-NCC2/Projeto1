import React from 'react';
import icon from '../assets/branding/logos/logo_navbar_web.png';

function Footer() {
  return (
    <footer className="w-full bg-[#1A2E4A] px-6 py-[30px] flex flex-col items-center justify-center border-t border-white/5 box-border">
      <div className="w-full max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
        
        {/* Bloco da Esquerda: Agrupa a Logo e o Texto corrido na mesma linha */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 text-center md:text-left">
          <img 
            src={icon} 
            alt="TrocaTicket Logo" 
            /* Aumentado de h-11 para h-16 (Você também pode testar h-20 se quiser ainda maior) */
            className="h-20 w-auto object-contain shrink-0" 
          />
          <p className="text-white/60 text-[13px] leading-1.6 m-0 font-light">
            Plataforma certificada de troca e revenda segura de ingressos com custódia antifraude e validação garantida de titularidade.
          </p>
        </div>

        {/* Bloco da Direita: Copyright dinâmico alinhado na extremidade */}
        <p className="text-white/30 text-[11px] m-0 text-center md:text-right shrink-0">
          &copy; {new Date().getFullYear()} TrocaTicket. Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
}

export default Footer;
