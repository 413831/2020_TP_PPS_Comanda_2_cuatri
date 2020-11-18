import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Cliente } from '../../clases/cliente';
import { UIVisualService } from "src/app/services/uivisual.service"
import { ModalController } from '@ionic/angular';
import { CodigoQRService } from 'src/app/services/codigo-qr.service';
import { LoginPage } from '../login/login.page';
import { Imagen } from 'src/app/clases/imagen';
import { ImagenService } from 'src/app/services/imagen.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { INotificacion } from 'src/app/interfaces/INotification';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit
{
  cliente: Cliente = new Cliente()
  auxiliarFoto: Imagen
  imgPreview: string

  constructor(private authService: AuthService, private UIVisual: UIVisualService,
    private modalController: ModalController, private codigoQRService: CodigoQRService,
    private imagenService: ImagenService,private notificationService:NotificationsService) { }

  ngOnInit()
  {
  }

  async sacarFoto()
  {
    const foto = await this.imagenService.sacarFoto()

    this.imgPreview = `data:image/jpeg;base64,${foto.base64}`

    this.auxiliarFoto = new Imagen();
    this.auxiliarFoto.base64 = foto.base64;
    this.auxiliarFoto.fecha = foto.fecha;
  }

  async onRegister()
  {
    if (this.cliente && !this.cliente.id)
    {
      // Se guarda imagen en DB y Storage
      const imagenGuardada = await this.imagenService.crearUnaImagen(
        this.auxiliarFoto,
        '/clientes'
      )
      this.cliente.foto = imagenGuardada;

      this.authService
        .onRegisterCliente(this.cliente)
        .then(() =>
        {
          let notificacion: INotificacion = {
            title: "Un cliente se ha registrado",
            body: `El cliente ${this.cliente.nombre} ${this.cliente.apellido} esta esperando su aprobación`
          };
          this.notificationService.sendNotification(notificacion, 'jefes').then(data =>
          {
            console.log('RESPUESTA: ', data);
          });
          UIVisualService.presentToast('Alta exitosa');
          this.cerrar();
          this.presentLoginModal();
        })
        .catch(() => UIVisualService.presentToast('No se pudo realizar el alta'))
    }
    else
    {
      UIVisualService.presentToast('Cliente existente')
    }
  }

  async onScanDNI()
  {
    let barcodeQR: string
    this.codigoQRService.escanear("Escanee su DNI", "PDF_417").then(obj =>
    {
      barcodeQR = obj.text
      let barcodeQRData = barcodeQR.split("@")

      this.cliente.apellido = barcodeQRData[1]
      this.cliente.nombre = barcodeQRData[2]
      this.cliente.dni = barcodeQRData[4]

      console.log(this.cliente)
    })
  }

  cerrar()
  {
    this.modalController.dismiss();
  }

  async presentLoginModal()
  {
    const modal = await this.modalController.create({
      component: LoginPage,
    });

    await modal.present();

  }
}
