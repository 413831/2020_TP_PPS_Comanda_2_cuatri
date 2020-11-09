import { Component, DoCheck, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EstadoPedido, Pedido } from 'src/app/clases/pedido';
import { Usuario } from 'src/app/clases/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { RolesService } from 'src/app/services/roles.service';

@Component({
  selector: 'app-menu-pedidos',
  templateUrl: './menu-pedidos.page.html',
  styleUrls: ['./menu-pedidos.page.scss'],
})
export class MenuPedidosPage implements OnInit, DoCheck
{
  usuario: Usuario;
  opcion: string = 'Listado';
  pedidos: Pedido[] = PedidoService.pedidos;
  pedidoElegido: Pedido = new Pedido();

  constructor(private pedidoService: PedidoService, private rolService: RolesService,
    private route: ActivatedRoute) { }

  ngDoCheck(): void
  {
    this.pedidos = this.filtrarPedidos(PedidoService.pedidos);
  }

  ngOnInit()
  {
    console.log("INIT");

    // Se guarda el usuario logueado
    this.usuario = AuthService.usuario;

    // Se lee pedido recibido para ABM
    this.route.params.subscribe(params =>
    {
      console.log(params['id']);
      this.pedidoElegido = PedidoService.pedidos.filter(pedido => pedido.id == params['id'])[0];
      console.log(this.pedidoElegido);
    });

    // Leer todos los pedidos para listado - Código para mejorar
    this.pedidoService.leer().then((pedidos) =>
    {
      this.pedidos = this.filtrarPedidos(pedidos);
    });

    // Se define tab por defecto para visualizar según perfil de Usuario
    this.opcion = this.rolService.isCliente(this.usuario) ? 'Alta' : 'Listado';
  }

  /**
   * Metodo para seleccionar modo del form para ABM
   * @param event Evento con el valor que determina modo del form
   */
  seleccionarOpcion(event)
  {
    console.log(event.detail.value);
    this.opcion = event.detail.value;
  }

  /**
   * Método para recibir pedido seleccionado
   * @param pedido Pedido seleccionado desde listado 
   */
  elegirPedido(pedido)
  {
    console.log(pedido);
    this.pedidoElegido = pedido;
  }

  filtrarPedidos(pedidos: Pedido[])
  {
    let pedidosFiltrados = [];

    // Pedidos del Cliente logueado
    if (this.rolService.isClienteAceptado(this.usuario))
    {
      pedidosFiltrados = pedidos.filter(pedido => 
      {
        if (pedido.cliente)
        {
          return pedido.cliente.id === this.usuario.id;
        }
      });
    }
    else if (this.rolService.isEmpleado(this.usuario)) // Pedidos para empleados
    {
      pedidosFiltrados = pedidos.filter(pedido => pedido.estado != EstadoPedido.RESERVADO);
    }
    else if (this.rolService.isJefe(this.usuario)) // Pedidos para jefes
    {
      pedidosFiltrados = pedidos.filter(pedido => pedido.estado == EstadoPedido.RESERVADO);
    }
    return pedidosFiltrados;
  }
}
