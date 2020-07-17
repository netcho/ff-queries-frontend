<template>
    <v-container class="fill-height" fluid>
        <v-row align="center"
                justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12">
                    <v-toolbar color="primary" dark flat>
                        <v-toolbar-title>{{$t('LoginForm')}}</v-toolbar-title>
                        <v-spacer />
                    </v-toolbar>
                    <v-card-text>
                        <v-form @submit="login">
                            <v-text-field :label="$t('Username')" name="login" prepend-icon="mdi-account" type="text" v-model="username"/>
                            <v-text-field :label="$t('Password')" name="password" prepend-icon="mdi-lock" type="password" v-model="password"/>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn color="primary" @click="login" type="submit">{{$t('Login')}}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        data: () => {
            return {
                username: '',
                password: ''
            }
        },
        methods: {
            login: function () {
                this.$store.dispatch('login', {username: this.username, password: this.password}).then(() => {
                    this.$ability.update(this.$store.state.rules);
                    this.$router.push({name: 'Queries'})
                }, (err) => {
                    if (err.status === 401) {
                        this.$dialog.message.error(this.$t('WrongPassword'), {
                            position: 'top-right'
                        });
                    }
                });
            }
        }
    }
</script>

<style scoped>

</style>