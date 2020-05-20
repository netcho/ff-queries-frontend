<template>
    <v-container class="pt-5">
        <v-card>
            <v-card-title>
                Queries
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="queries"
                :items-per-page="20"
                :loading="loading"
                :search="search"
                class="elevation-1 mx-auto"
                @click:row="viewQuery">
            <template v-slot:item.type="{ item }">
                {{ item.type.reduce((acc, elem) => acc + ', ' + elem ) }}
            </template>
            <template v-slot:item.status="{ item }">
                <v-chip :color="getColor(item)">{{ item.status }}</v-chip>
            </template>
            <template v-slot:item.dateCreated="{ item }">
                {{ new Date(item.dateCreated).toLocaleDateString() }}
            </template>
            <template v-slot:item.payDate="{ item }">
                {{ new Date(item.payDate).toLocaleDateString() }}
            </template>
            <template v-slot:item.actions="{ item }">
                <v-icon @click="createFrom(item)">
                    mdi-content-copy
                </v-icon>
            </template>
            </v-data-table>
        </v-card>
        <v-btn
                color="pink"
                dark
                large
                fab
                bottom
                right
                absolute
                link
                :to="{ name: 'AddQuery'}">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-container>
</template>

<script>
    export default {
        name: "Queries",
        data: function () {
            return {
                headers:[
                    { text: 'Type', value: 'type' },
                    { text: 'Category', value: 'category' },
                    { text: 'Title', value: 'title' },
                    { text: 'Sum', value: 'totalSum' },
                    { text: 'Status', value: 'status' },
                    { text: 'Contractor', value: 'contractor' },
                    { text: 'Reason', value: 'reason' },
                    { text: 'Companies', value: 'companies' },
                    { text: 'Pay Date', value: 'payDate' },
                    { text: 'Date Create', value: 'dateCreated' },
                    { text: 'Actions', value: 'actions', sortable: false },
                ],
                queries: [],
                loading: true,
                error: null,
                search: ''
            }
        },
        mounted: function () {
            this.$http.get('http://localhost:8080/queries').
            then((result) => {
                this.queries = result.data;
            }).
            catch((err) => {
                this.error = err;
            }).
            finally(() => this.loading = false);
        },
        methods: {
            viewQuery: function (query) {
                this.$router.push({name: 'ViewQuery', params: {id: query._id}});
            },
            createFrom: function (query) {
                this.$router.push({name: 'AddQuery', params: {templateQueryId: query._id}});
            },
            getColor: function (query) {
                switch (query.status) {
                    case 'pending':
                        return 'orange';
                    case 'approved':
                        return 'green';
                    case 'rejected':
                        return 'red';
                }
            }
        }
    }
</script>

<style scoped>

</style>