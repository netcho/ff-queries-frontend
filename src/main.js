import Vue from 'vue'
import router from '@/router'
import store from '@/store'
import vuetify from '@/plugins/vuetify'
import axios from '@/plugins/axios'
import { i18n } from '@/plugins/i18n'
import Vuelidate from 'vuelidate'
import App from '@/App'

Vue.config.productionTip = false;

Vue.use(require('vue-moment'));
Vue.use(Vuelidate);

let instance = new Vue({
  vuetify,
  router,
  axios,
  i18n,
  store,
  render: h => h(App)
});

instance.$mount('#app');

if (instance.$store.getters.isLoggedIn) {
  instance.$http.defaults.headers.common['Authorization'] = instance.$store.state.token;
}
