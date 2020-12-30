<template>
    <v-container fluid class="d-flex justify-center">
        <v-sheet elevation="7">
            <v-list>
                <v-list-item v-for="user in users" :key="user._id">
                    <v-list-item-avatar class="mx-2">
                        <v-avatar color="red">
                            <span class="white--text headline">{{user.firstName.substring(0,1)}}{{user.lastName.substring(0,1)}}</span>
                        </v-avatar>
                    </v-list-item-avatar>
                    <v-list-item-content class="mx-2">
                        <v-list-item-title v-text="user.firstName + ' ' + user.lastName"></v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="ml-8">
                        <v-icon @click="editUser(user._id)" v-if="$can('update', 'User')">mdi-account-edit</v-icon>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-sheet>
    </v-container>
</template>

<script>
    export default {
        name: "Users",
        data: function () {
            return {
                users: [],
            }
        },
        methods: {
            editUser: function (id) {
                this.$router.push({ name: 'EditUser', params: { id: id }});
            }
        },
        created: function () {
            this.$http.get('/users').
            then((response) => {
                this.users = response.data;
            })
        }
    }
</script>

<style scoped>

</style>