<template>
    <v-item-group>
        <v-container>
            <v-row v-for="n in rows" :key="n" class="d-flex justify-between">
                <v-col v-for="k in calculateColumns(n)" :key="k">
                    <v-card height="200" width="300" tile @click="goToBudget(budgets[(n*k)-1]._id)">
                        <v-card-title>{{$t('Week')}} {{ budgets[(n*k)-1]._id }}</v-card-title>
                        <v-card-text>{{$t('TotalSumWeek')}}: {{ budgets[(n*k)-1].totalSum }}</v-card-text>
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
                return math.mod(this.budgets.length, 5) ? math.chain(this.budgets.length).subtract(rowNumber * 5).mod(5).done() : 5;
            },
            goToBudget: function(week) {
                this.$router.push({ name: 'ViewBudget', params: { week: week }});
            }
        },
        mounted: function () {
            this.$http.get('/api/budgets').
            then((response) => {
                this.budgets = response.data;
                this.rows = math.ceil(this.budgets.length / 5);
            });
        }
    }
</script>

<style scoped>

</style>