module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],

  productionSourceMap: false,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },

  runtimeCompiler: true,
  devServer: {
	  proxy: 'http://localhost:8080'
  }
};
