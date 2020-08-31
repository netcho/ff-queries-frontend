<template>
    <v-item-group>
        <v-container>
            <v-row v-for="n in rows" :key="n" class="d-flex align-start">
                <v-col v-for="k in calculateColumns(n)" :key="5* (n-1) + k">
                    <v-card height="200" width="300" tile @click="goToBudget(budgets[5*(n-1)+k-1]._id)">
                        <v-card-title>{{$t('Week')}} {{ budgets[5*(n-1)+k-1]._id }}</v-card-title>
                        <v-card-text>{{$t('TotalSumWeek')}}: {{ budgets[5*(n-1)+k-1].totalSum }}</v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-item-group>
</template>

<script>
    import {all, create} from 'mathjs'

    const math = create(all);

    export default {
        name: 'Budgets',
        data: function() {
            return {
                rows: 0,
                budgets: []
            };
        },
        methods: {
            calculateColumns: function (rowNumber) {
                return (rowNumber * 5) < this.budgets.length ? 5 : (rowNumber * 5) - this.budgets.length - 1;
            },
            goToBudget: function(week) {
                this.$router.push({ name: 'ViewBudget', params: { week: week }});
            }
        },
        created: function () {
            this.$http.get('/budgets').
            then((response) => {
                this.budgets = response.data;
                this.rows = math.ceil(this.budgets.length / 5);
            });
        }
    }
</script>

<style scoped>

</style>