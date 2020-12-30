<template>
    <v-container fluid class="justify-center">
        <v-card elevation="7">
            <v-form v-model="formValid" ref="userForm">
                <v-container fluid>
                    <v-row class="mb-6" align="center">
                        <v-col :cols="6">
                            <v-text-field v-model="user.username"
                                          :label="$t('Username')">
                            </v-text-field>
                            <v-text-field v-model="user.password"
                                          :label="$t('Password')"
                                          type="password">
                            </v-text-field>
                            <v-text-field v-model="user.firstName"
                                          :label="$t('FirstName')">
                            </v-text-field>
                            <v-text-field v-model="user.lastName"
                                          :label="$t('LastName')">
                            </v-text-field>
                        </v-col>
                        <v-col>
                            <v-treeview selectable
                                        return-object
                                        v-model="placeholder"
                                        :items="permissions">
                            </v-treeview>
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn large
                       color="primary"
                       :disabled="!formValid"
                       @click="updateUser">
                    {{$t('Save')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
    export default {
        name: "EditUser",
        data: function () {
            return {
                formValid: false,
                user: {},
                permissions: [],
                placeholder: []
            }
        },
        methods: {
            updateUser: function () {
                const userId = this.user._id;
                const userBody = Object.assign({}, this.user);
                delete userBody._id;

                let updatedPermissions = {};
                this.placeholder.forEach((permission) => {
                    let category = permission.id.split('_')[0].toLowerCase();

                    if(updatedPermissions[category]) {
                        updatedPermissions[category].push(permission.name);
                    }
                    else {
                        updatedPermissions[category] = [permission.name];
                    }
                });
                userBody.permissions = updatedPermissions;
                this.$http.put('/user/' + userId, userBody).then(() => {
                    this.$router.push({ name: 'Users' });
                });
            }
        },
        created: function () {
            this.$http.get('/user/' + this.$route.params.id).
            then((response) => {
                this.user = response.data;
                return this.$http.get('/users/permissions');
            }).
            then((response) => {
                this.permissions = response.data.map((category) => {
                    const actions = category.actions.map((action, index) => {
                        let id = category.category + '_' + index;
                        return { id: id, name: action };
                    });
                    return {id: category._id, name: category.category, children: actions }
                });
                this.permissions.forEach((category) => {
                   category.children.forEach((action, index) => {
                       if (this.user.permissions[category.name.toLowerCase()]) {
                           const actionIndex = this.user.permissions[category.name.toLowerCase()].findIndex((elem) => {
                               return elem === action.name;
                           });

                           if (actionIndex !== -1) {
                               this.placeholder.push({id: category.name + '_' + index, name: action.name });
                           }
                       }
                   });
                });
            });
        }
    }
</script>

<style scoped>

</style>