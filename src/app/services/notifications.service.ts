import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import
{
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';
import { FCM } from '@capacitor-community/fcm';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';
import { Usuario } from '../clases/usuario';
import { JefeService } from './jefe.service';
import { EmpleadoService } from './empleado.service';
import { ClienteService } from './cliente.service';
import { Jefe } from '../clases/jefe';
import { Empleado } from '../clases/empleado';
import { Cliente } from '../clases/cliente';
import { INotificacion, Respuesta } from '../interfaces/INotification';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UIVisualService } from './uivisual.service';

const fcm = new FCM();
const { PushNotifications } = Plugins;
const { Http } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationsService
{
  API = 'https://server-push-notifications.herokuapp.com/';
  constructor(
    private router: Router,
    private auth: AuthService,
    private rolesService: RolesService,
    private jefeService: JefeService,
    private empleadoService: EmpleadoService,
    private clienteService: ClienteService,
    private http: HttpClient
  ) { }

  public initPush()
  {
    if (Capacitor.platform != 'web')
    {
      this.registerPush();
      console.log('Registrando...');
    }
  }

  private registerPush()
  {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result =>
    {
      if (result.granted)
      {
        PushNotifications.register();
        if (this.rolesService.isJefe(AuthService.usuario)) { this.subcribirseAUnTema('jefes') }
        if (this.rolesService.isEmpleadoMozo(AuthService.usuario)) { this.subcribirseAUnTema('mozos') }
        if (this.rolesService.isEmpleadoCocinero(AuthService.usuario)) { this.subcribirseAUnTema('cocineros') }
        if (this.rolesService.isEmpleadoBartender(AuthService.usuario)) { this.subcribirseAUnTema('bartenders') }

      } else
      {
        // Show some error
      }
    });

    PushNotifications.addListener(
      'registration',
      (token: PushNotificationToken) =>
      {
        if (this.nuevoToken(AuthService.usuario, token.value))
        {
          AuthService.usuario.tokenNotification.push(token.value);
          this.actualizarUsuario(AuthService.usuario);
        }
      },
    );

    PushNotifications.addListener('registrationError', (error: any) =>
    {
      console.error('Error al subcribirse a las notificaciones', error);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotification) =>
      {
        console.log('pushNotificationReceived', notification);
        this.manejarNotificacionPrimerPlano(notification, AuthService.usuario);
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) =>
      {
        console.log('pushNotificationActionPerformed', notification);
        this.manejarNotificacionSegundoPlano(notification.notification, AuthService.usuario);
      },
    );
  }
  subcribirseAUnTema(tema: string)
  {
    fcm
      .subscribeTo({ topic: tema })
      .then((r) => console.log(`subscribed to ${tema}`))
      .catch((err) => console.error(err));
  }

  /**
   * Funcion booleana para saber si un usuario ya tiene un token registrado
   * @param usuario 
   * @param token 
   */
  nuevoToken(usuario, token)
  {
    if (usuario.tokenNotification)
    {
      let nuevoToken = true;
      usuario.tokenNotification.forEach(tokenRegistrado =>
      {
        if (tokenRegistrado == token.value)
        {
          nuevoToken = false;
        }
      })
      return nuevoToken;
    }
  }

  actualizarUsuario(usuario: Usuario)
  {
    if (this.rolesService.isCliente(usuario))
    {
      this.clienteService.actualizar(usuario as Cliente)
    }
    else if (this.rolesService.isEmpleado(usuario))
    {
      this.empleadoService.actualizar(usuario as Empleado)
    }
    else
    {
      this.jefeService.actualizar(usuario as Jefe)
    }

  }
  async enviarNotificacion(titulo: string, mensaje: string, ruta: string, topic: string)
  {
    let payload: INotificacion =
    {
      notification:
      {
        title: titulo,
        body: mensaje
      },
      data:
      {
        ruta: ruta
      }
    }
    let url = `${this.API}${topic}`;
    console.log(payload);

    const response: Respuesta = await Http.request(
      {
        method: 'POST',
        url: url,
        headers: { 'Content-Type': 'application/json' },
        data: payload

      });

    console.log(response.data);
    return response.data;

  }

  manejarNotificacionPrimerPlano(notificacion: PushNotification, usuario: Usuario)
  {
    if (this.rolesService.isCliente(usuario))
    {
      UIVisualService.presentAlert(notificacion.title, notificacion.body);
    }
    else if (this.rolesService.isEmpleado(usuario))
    {
      UIVisualService.presentAlert(notificacion.title, notificacion.body);
    }
    else//Jefe
    {
      UIVisualService.presentAlert(notificacion.title, notificacion.body);
    }
  }

  manejarNotificacionSegundoPlano(notificacion: PushNotification, usuario: Usuario)
  {
    this.router.navigate([notificacion.data.ruta]);
  }


}
