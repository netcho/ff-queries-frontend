<template>
    <v-container class="pt-5">
        <v-card class="mx-auto">
            <v-card-title>
                Budget Week {{ $route.params.week }}
            </v-card-title>
            <v-data-table
                    :headers="headers"
                    :items="budget.queries"
                    :items-per-page="20"
                    :loading="showProgressBar"
                    class="elevation-1 mx-auto"
            >
            <template v-slot:item.companies="{ item }">
                {{ getCompaniesFromActivities(item) }}
            </template>
            <template v-slot:item.places="{ item }">
                {{ item.places ? item.places.toString() : 'FF' }}
            </template>
            </v-data-table>
        </v-card>
        <v-row class="title ma-5">
            <v-spacer></v-spacer>
            <div>Total with VAT: {{ budget.totalSum }}</div>
        </v-row>
    </v-container>
</template>

<script>
    function getCompaniesFromActivities(query) {
        let companies = '';

        query.activities.forEach((activity, index, activities) => {
            if(!companies.includes(activity.company)) {
                companies += activity.company;

                if(index !== (activities.length -1)) {
                    companies += ', ';
                }
            }
        });

        return companies;
    }

    export default {
        name: 'ViewBudget',
        data: function () {
            return {
                headers: [
                    { text: 'Title', value: 'title' },
                    { text: 'Reason', value: 'reason' },
                    { text: 'Places', value: 'places' },
                    { text: 'Companies', value: 'companies' },
                    { text: 'Contragent', value: 'contractor' },
                    { text: 'Sum', value: 'totalSum' },
                    { text: 'Pay Date', value: 'payDate' }
                ],
                budget: {},
                error: null,
                showProgressBar: true
            }
        },
        methods: {
            getCompaniesFromActivities: function (query) {
                return getCompaniesFromActivities(query);
            }
        },
        mounted: function () {
            this.$http.get('http://localhost:8080/budget?week=' + this.$route.params.week).
            then((response) => {
                this.budget = response.data;
            }).
            catch(() => {
                this.error = true;
            }).
            finally(() => {
                this.showProgressBar = false;
            });
        }
    }
</script>

<style scoped>

</style>