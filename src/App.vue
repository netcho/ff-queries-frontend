<template>
    <component v-bind:is="layout"></component>
</template>

<script>
    import AppLayout from './layouts/main'
    import SimpleLayout from './layouts/simple'

    export default {
        computed: {
          layout: function () {
              return this.$store.getters.isLoggedIn ? 'AppLayout' : 'SimpleLayout';
          }
        },
        components: {
            'AppLayout': AppLayout,
            'SimpleLayout': SimpleLayout
        },
        created: function () {
            this.$http.interceptors.response.use((response) => {
                return response
            }, (err) => {
                return new Promise((resolve, reject) => {
                    if (err.response.status === 401) {
                        this.$store.dispatch('logout');
                        this.$router.push({name: 'Login'});
                        resolve();
                    }
                    reject(err);
                });
            });
        }
    }
</script>

<style scoped>

</style>