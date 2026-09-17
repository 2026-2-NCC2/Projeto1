import '../styles/trocaticket.css'
import icon from '../assets/branding/integrations/TrocaTicket-logo-stripe.jpg'

function Footer() {
   return(
      <footer>
         <img src={icon} alt="" class="h-10" />
         <p className="">Plataforma certificada de troca e revenda segura de ingressos com custódia antifraude e validação garantida de titularidade.</p>
      </footer>
   )
}

export default Footer