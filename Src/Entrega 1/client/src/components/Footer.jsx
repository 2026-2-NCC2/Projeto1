import React from 'react';
import '../styles/trocaticket.css'; 
import icon from '../assets/branding/logos/logo_navbar_web.png';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        
        {/* Bloco da Esquerda: Agrupa a Logo e o Texto corrido na mesma linha */}
        <div className="footer-brand">
          <img 
            src={icon} 
            alt="TrocaTicket Logo" 
            className="footer-logo" 
          />
          <p className="footer-text">
            Plataforma certificada de troca e revenda segura de ingressos com custódia antifraude e validação garantida de titularidade.
          </p>
        </div>

        {/* Bloco da Direita: Copyright dinâmico alinhado na extremidade */}
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} TrocaTicket. Todos os direitos reservados.
        </p>

      </div>
    </footer>
  );
}

export default Footer;