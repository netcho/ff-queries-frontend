<template>
  <v-app id="inspire">
      <v-navigation-drawer v-model="drawer" app>
        <v-list dense>
          <v-list-item link :to="{ name: 'Home' }">
            <v-list-item-action>
              <v-icon>mdi-home</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{$t('Home')}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link :to="{ name: 'Queries' }">
            <v-list-item-action>
              <v-icon>mdi-currency-usd</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{$t('Queries')}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link :to="{ name: 'Budgets' }">
            <v-list-item-action>
              <v-icon>mdi-file-table</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{$t('Budgets')}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-item link :to="{ name: 'Inquiry' }">
                <v-list-item-action>
                    <v-icon>mdi-folder-table</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                    <v-list-item-title>{{$t('Inquiries')}}</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
          <v-list-item link :to="{ name: 'Users' }" v-if="$can('read', 'User')">
              <v-list-item-action>
                  <v-icon>mdi-account-group</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                  <v-list-item-title>{{$t('Users')}}</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
          <v-list-item @click="logout">
              <v-list-item-action>
                  <v-icon>mdi-logout</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                  <v-list-item-title>{{$t('Logout')}}</v-list-item-title>
              </v-list-item-content>
          </v-list-item>
        </v-list>
        <template v-slot:append>
          <language-switcher></language-switcher>
        </template>
      </v-navigation-drawer>
      <v-app-bar app color="indigo" dark>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-toolbar-title>Application</v-toolbar-title>
      </v-app-bar>
      <v-main>
        <router-view></router-view>
      </v-main>
      <v-footer color="indigo" app>
        <span class="white--text">&copy; 2019</span>
      </v-footer>
  </v-app>
</template>

<script>
  import LanguageSwitcher from "@/components/LanguageSwitcher";

  export default {
    data: () => {
      return {
        drawer: false
      }
    },
    components: {
      LanguageSwitcher
    },
    methods: {
        logout: function () {
            this.$store.dispatch('logout').then(() => {
                this.$ability.update(this.$store.state.rules);
                this.$router.push({ name: 'Login'});
            });
        }
    }
  }
</script>

<style>
#inspire {
    background-color: #E8EAF6;
}
</style>
