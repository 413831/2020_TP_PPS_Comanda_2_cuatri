import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Mesa } from '../clases/mesa';
import { CodigoQRService } from './codigo-qr.service';

@Injectable({
  providedIn: 'root'
})
export class MesaService
{
  public static mesas: Mesa[] = [];

  constructor(public firebase: AngularFireDatabase, private escanerQR: CodigoQRService) { }

  /**
   * Método para realizar Alta en DB
   * @param mesa instancia de Mesa
   */
  public crear(mesa: Mesa): Promise<any>
  {
    console.log(mesa);
    mesa.isActive = true;
    mesa.isAvailable = true;

    return this.firebase.database.ref('mesas')
      .push(mesa)
      .then((snapshot) => mesa.id = snapshot.key)
      .then(() => this.actualizar(mesa))
      .catch(console.error);
  }

  /**
   * Método para realizar Modificacion en DB
   * @param mesa instancia de Mesa
   */
  public actualizar(mesa: Mesa): Promise<any>
  {
    return new Promise((resolve, reject) =>
    {
      //Generacion de QR
      // this.escanerQR.generar(mesa, mesa.id).then(() => 
      // {
      // }).catch(error => reject(error));
      this.firebase.database.ref('mesas/' + mesa.id).update(mesa);
      resolve;
    })

  }

  /**
   * Método para realizar Baja lógica en DB
   * @param mesa instancia de Mesa
   */
  public borrar(mesa: Mesa): Promise<any>
  {
    mesa.isActive = false;

    return this.firebase.database.ref('mesas/' + mesa.id).update(mesa);
  }

  /**
   * Método para realizar Fetch de todas las mesas en DB
   */
  public leer()
  {
    let mesas: Mesa[] = [];
    console.info("Fetch de todas las mesas");

    const fetch = new Promise<Mesa[]>(resolve =>
    {
      this.firebase.database.ref('mesas').on('value', (snapshot) =>
      {
        mesas = [];
        snapshot.forEach((child) =>
        {
          var data: Mesa = child.val();
          mesas.push(Mesa.CrearMesa(data.id, data.numero, data.comensales, data.tipo,
            data.foto, data.codigoQR, data.isAvailable,
            data.isActive));
        });
        MesaService.mesas = mesas.filter(mesa => mesa.isActive);
        resolve(MesaService.mesas);
      })
    });
    return fetch;
  }

  /**
   * Método para realizar Fetch de una mesa en DB
   * @param id UID del registro a obtener
   */
  public fetch(id: string)
  {
    return this.firebase.database.ref(`mesas/${id}`).once('value');
  }
}
