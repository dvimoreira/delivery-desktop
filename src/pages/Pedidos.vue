<template>
    <div id="page-pedidos">
      <div id="page-pedidos">
        <el-row>
          <el-col :span="6" v-for="item in data" :key="item.id">
            <el-card class="box-card">
              <h1>Pedido #{{ item.codigo_pedido }}</h1>
              
              <ul>
                <li><b>Cliente: </b>{{ item.cli_name }}</li>
                <li><b>Telefone: </b>{{ item.phone }}</li>
                <li><b>Tipo de Pedido: </b>{{ (item.tipo_pedido === 'delivery') ? 'Entrega' : 'Comer na Praça' }}</li>
                <li><b>Forma de Pagamento: </b>{{ (item.payment_type === 'money') ? 'Dinheiro' : 'Cartão' }}</li>
                <li><b>Troco para: </b> R$ {{ item.troco }}</li>
              </ul>

              <hr>

              <ul>
                <li v-show="item.tipo_pedido === 'delivery'"><b>Taxa de Entrega: </b>R$ {{ item.total_frete }}</li>
                <li><b>Valor do Pedido: </b>R$ {{ item.total_pedido }}</li>
                <li><b>Valor Total: </b>R$ {{ item.total_soma }}</li>
              </ul>

              <hr>

              <ul v-show="item.tipo_pedido === 'delivery'">
                <li><b>Endereço: </b>{{ item.rua }}</li>
                <li><b>Bairro: </b>{{ item.bairro }}</li>
                <li><b>Complemento: </b>{{ item.complemento }}</li>
                <li><b>CEP: </b>{{ item.cep }}</li>
              </ul>

              <hr v-show="item.tipo_pedido === 'delivery'">

              <ul v-show="item.observacao">
                <li><b>Observação: </b>{{ item.observacao }}</li>
              </ul>

              <br>

              <hr>
              <b>Itens Pedidos</b>
              <hr>

              <table>
                <tr>
                  <th>Item</th>
                  <th>Qtd</th>
                  <th>Total</th>
                </tr>

                <tr v-for="itemPedido in JSON.parse(item.pedido_itens)" :key="itemPedido.id">
                  <td>{{ itemPedido.item }}</td>
                  <td>{{ itemPedido.qtd }}</td>
                  <td>R$ {{ itemPedido.price }}</td>
                </tr>
              </table>

              <br>

              <el-button-group v-show="item.status === 0">
                <el-button type="success" size="large" @click="onUpdate(item.id, 'accept')">Aceitar</el-button>
                <el-button type="danger" size="large" @click="onUpdate(item.id, 'recuse')">Recusar</el-button>
              </el-button-group>

              <el-button-group v-show="item.status === 1">
                <el-button type="primary" size="large" @click="onPrint(item)">Imprimir</el-button>
                <el-button type="success" size="large" @click="onUpdate(item.id, 'dispatched')">Despachar</el-button>
              </el-button-group>

              <el-button type="danger" size="large" v-show="item.status === 2" disabled>Pedido cancelado</el-button>
              <el-button type="info" size="large" v-show="item.status === 3" disabled>Pedido despachado</el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </template>
    
<script>
  import { ElNotification } from 'element-plus'
	import OrderComposable from '../composables/orders'
  import { useIpcRenderer } from '@vueuse/electron'

  export default {
    name: 'PedidosPage',
    data () {
      return {
        restaurant: JSON.parse(localStorage.getItem('restaurant')),
        data: [],
        audio: new Audio('./notification.mp3')
      }
    },

    mounted () {
      this.onList()

      setInterval(() => {
        return this.onList()
      }, 20000)
    },

    methods: {
      async onList () {
        try {
          const result = await OrderComposable.onList(this.restaurant.id)

          if (result.status === 200) {
            this.data = result.data.data
				    let getOrders = result.data.data
				    let checkOrders = getOrders.some((item) => item.status === 0)

            if (checkOrders) {
              this.audio.play()
              this.audio.loop = true
            }

            return
          } else if (result.status === 422) {
            for (const key in result.data.errors) {
              if (result.data.errors[key]) {
                throw Error(result.data.errors[key])
              }
            }

            return
          }

          throw Error(result.data.message)
        } catch (e) {
          ElNotification({
            title: 'Notificação',
            message: e.message,
            type: 'error',
          })
        }
      },

      async onUpdate (id, action) {
        try {
          if (action === 'recuse') {
            this.audio.pause()
            this.audio.loop = false

            const result = await OrderComposable.onUpdate({ id: id, status: 2 })
            
            if (result.status === 200) {
              ElNotification({
                title: 'Notificação',
                message: 'Pedido cancelado com sucesso!',
                type: 'success',
              })
              this.onList()

              return
            } else if (result.status === 422) {
              for (const key in result.data.errors) {
                if (result.data.errors[key]) {
                  throw Error(result.data.errors[key])
                }
              }
              return
            }
            
            throw Error(result.data.message)
          } else if (action === 'accept') {
            this.audio.pause()
            this.audio.loop = false

            const result = await OrderComposable.onUpdate({ id: id, status: 1 })
            
            if (result.status === 200) {
              ElNotification({
                title: 'Notificação',
                message: 'Pedido aceito com sucesso!',
                type: 'success',
              })
              this.onList()

              return
            } else if (result.status === 422) {
              for (const key in result.data.errors) {
                if (result.data.errors[key]) {
                  throw Error(result.data.errors[key])
                }
              }
            
              return
            }
            
            throw Error(result.data.message)
          } else {
            const result = await OrderComposable.onUpdate({ id: id, status: 3 })
            
            if (result.status === 200) {
              ElNotification({
                title: 'Notificação',
                message: 'Pedido aceito com sucesso!',
                type: 'success',
              })
              this.onList()

              return
            } else if (result.status === 422) {
              for (const key in result.data.errors) {
                if (result.data.errors[key]) {
                  throw Error(result.data.errors[key])
                }
              }

              return
            }
            
            throw Error(result.data.message)
          }
        } catch (e) {
          ElNotification({
            title: 'Notificação',
            message: e.message,
            type: 'error',
          })
        }
      },

      async onPrint (data) {
        try {
          let obj = {
            item: data,
            printer: localStorage.getItem('impressora_selecionada')
          }
          
          const ipcRenderer = useIpcRenderer()
          let printers = await ipcRenderer.invoke('print-data-order', JSON.stringify(obj))
          console.log(printers)
        } catch (e) {
          ElNotification({
            title: 'Notificação',
            message: e.message,
            type: 'error',
          })
        }
      }
    }
  }
</script>

<style lang="scss">
#page-pedidos {
  h1 {
    font-size: 20px;
    display: block;
    margin: 0 0 40px 0;
  }

  ul {
    padding: 0;
    margin: 0;
    li {
      list-style: none;
      font-size: 14px;
      display: block;
      margin-bottom: 10px;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
    th, td {
      border: 1px solid #000000;
      border-collapse: collapse;
      padding: 5px;
      font-size: 14px;
    }
  }

  .el-button-group {
    text-align: center;
    width: 100%;
    align-items: center;
    justify-content: center;
    display: flex;
  }

  .el-button {
    margin: 0;
    width: 100%;
  }
}
</style>