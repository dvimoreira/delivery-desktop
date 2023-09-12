const { defineConfig } = require('@vue/cli-service')
module.exports = {
  pluginOptions: {
    electronBuilder: {
      externals: ['electron-pos-printer'],
      nodeIntegration: true,
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'digital.sejavisto.deliveryApp',
        productName: 'MenuPedido - Gestor',
        win: {
          icon: './src/assets/images/icon.ico'
        }
      }
    }
  }
}
