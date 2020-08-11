module.exports = {
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      // entry 找到默认的打包入口，调用 clear 则是删除默认的打包入口
      // add 添加新的打包入口
      config.entry('app').clear().add('./src/main-prod.js')

      // 使用 externals 设置排除项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 使用插件
      config.plugin('html').tap(args => {
        // 添加参数isProd
        args[0].isProd = true
        return args
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      // entry 找到默认的打包入口，调用 clear 则是删除默认的打包入口
      // add 添加新的打包入口
      config.entry('app').clear().add('./src/main-dev.js')

      // 使用插件
      config.plugin('html').tap(args => {
        // 添加参数isProd
        args[0].isProd = false
        return args
      })
    })
  }
}
