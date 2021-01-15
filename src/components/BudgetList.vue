<template>
    <v-container>
        <v-row v-for="n in 4" :key="n" class="d-flex justify-start">
            <v-col v-for="k in calculateColumns(n)" :key="6 * (n-1) + k">
                <v-card v-if="budgets[calculateIndex(n, k)]"
                        height="150" width="240" tile
                        @click="goToBudget(budgets[calculateIndex(n, k)].year, budgets[calculateIndex(n, k)].week)">
                    <v-card-title>
                        {{$t('Week')}}
                        {{ budgets[calculateIndex(n, k)].hasOwnProperty('number') ? budgets[calculateIndex(n, k)].number + "." : "" }}{{ budgets[calculateIndex(n, k)].week }} / {{ budgets[calculateIndex(n, k)].year }}
                    </v-card-title>
                    <v-card-text>{{ budgets[calculateIndex(n, k)].hasOwnProperty('number') ? $t('Total') : $t('TotalSumWeek')}}: {{ budgets[calculateIndex(n, k)].totalSum }}</v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn icon @click.stop="printBudget(budgets[calculateIndex(n, k)])">
                            <v-icon>mdi-printer</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <v-pagination v-model="page" :length="pages" class="mt-3"></v-pagination>
    </v-container>
</template>

<script>
    import * as pdfMake from 'pdfmake/build/pdfmake.js';
    import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
    import { all, create } from 'mathjs';

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const math = create(all);

    import { generateDefinition } from '@/utils/budgetPDFGenerator';

    export default {
        name: 'BudgetList',
        data: function() {
            return {
                page: 1,
            };
        },
        computed: {
            pages: function () {
                return math.ceil(this.budgets.length / 24);
            }
        },
        props: {
            budgets: Array
        },
        methods: {
            calculateColumns: function (rowNumber) {
                return this.budgets.length >= (rowNumber * 6) ? 6 : this.budgets.length % 6;
            },
            calculateIndex: function(rowNumber, columnNumber) {
                return (6 * (rowNumber - 1)) + (columnNumber - 1) + ((this.page - 1) * 24);
            },
            printBudget: function (budget) {
                let queryParams = { week: budget.week, year: budget.year, isUrgent: budget.number !== undefined, payDate: budget._id, number: budget.number };
                this.$http.get('/budget', { params: queryParams }).
                then((response) => {
                    pdfMake.createPdf(generateDefinition(response.data, queryParams)).open();
                })
            },
            goToBudget: function(year, week) {
                this.$router.push({ name: 'ViewBudget', params: { year: year, week: week }});
            }
        }
    }
</script>

<style scoped>

</style>
