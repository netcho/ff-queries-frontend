import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import axios from 'axios'
import { Ability } from '@casl/ability';

Vue.use(Vuex);

function StringUCFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default new Vuex.Store({
  state: {
    status: '',
    token: localStorage.getItem('token') || '',
    user: {},
    rules: []
  },
  mutations: {
    auth_request(state) {
      state.status = 'loading';
    },
    auth_success(state, { token, user }) {
      state.status = 'success';
      state.token = token;
      state.user = user;

      Object.keys(user.permissions).forEach((category) => {
        const actions = user.permissions[category];
        actions.forEach((action) => {
          state.rules.push({action: action, subject: StringUCFirst(category) });
        });
      });
    },
    auth_error(state) {
      state.status = 'error';
    },
    logout(state) {
      state.status = '';
      state.token = '';
      state.user = {};
      state.rules = []
    }
  },
  actions: {
    login({commit}, user) {
      return new Promise(((resolve, reject) => {
        commit('auth_request');
        axios({url: '/login', data: user, method: 'POST'})
        .then(resp => {
          const token = resp.data.token;
          const user = resp.data.user;
          axios.defaults.headers.common['Authorization'] = token;
          commit('auth_success', { token, user });
          resolve(resp);
        })
        .catch(err => {
          commit('auth_error');
          reject(err);
        })
      }));
    },
    logout({commit}) {
      return new Promise((resolve => {
        commit('logout');
        delete axios.defaults.headers.common['Authorization'];
        resolve();
      }))
    }
  },
  getters: {
    isLoggedIn: function (state) {
      return !!state.token;
    },
    authStatus: function (state) {
      return state.status;
    },
    ability: function (state) {
      return new Ability(state.rules, {
        subjectName(subject) {
          return !subject || typeof subject === 'string' ? subject : subject.__typeName;
        }
      });
    }
  },
  modules: {
  },
  plugins: [createPersistedState()]
})
