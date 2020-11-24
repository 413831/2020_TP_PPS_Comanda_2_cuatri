import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Mensaje } from 'src/app/clases/mensaje';
import { Usuario } from 'src/app/clases/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { MensajesService } from 'src/app/services/mensajes.service';

@Component({
  selector: 'app-sala-chat',
  templateUrl: './sala-chat.page.html',
  styleUrls: ['./sala-chat.page.scss'],
})
export class SalaChatPage implements OnInit, DoCheck
{
  usuario: Usuario = AuthService.usuario;
  mensaje: Mensaje;
  mensajes: Mensaje[];
  textoAuxiliar: string;
  @Input() chatID: string;
  @Input() mesa: number;

  constructor(private mensajeService: MensajesService,
    private modalController: ModalController) 
  {
  }

  ngOnInit()
  {
    this.mensajeService.leer()
      .then(mensajes => 
      {
        this.mensajes = mensajes.filter(mensaje => mensaje.chatId == this.chatID);
        console.log(this.mensajes);
      });
  }

  ngDoCheck(): void
  {
    this.mensajes = MensajesService.mensajes.filter(mensaje => mensaje.chatId == this.chatID);
  }

  enviar()
  {
    this.mensaje = new Mensaje();

    if (this.textoAuxiliar)
    {
      this.mensaje = Mensaje.CrearMensaje(" ", this.textoAuxiliar, this.usuario,
        new Date().toString(), this.chatID, this.mesa);
      this.textoAuxiliar = null;
    }
  }

  cerrar()
  {
    this.modalController.dismiss();
  }




}
