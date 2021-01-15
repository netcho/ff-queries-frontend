<template>
    <v-container>
        <v-tabs v-model="tab" background-color="blue darken-2" color="white">
            <v-tab>{{$t('RegularBudgets')}}</v-tab>
            <v-tab>{{$t('UrgentBudgets')}}</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="tab-items">
            <v-tab-item>
                <budget-list :budgets="regularBudgets"></budget-list>
            </v-tab-item>
            <v-tab-item>
                <budget-list :budgets="urgentBudgets"></budget-list>
            </v-tab-item>
        </v-tabs-items>
    </v-container>
</template>

<script>
    import BudgetList from '@/components/BudgetList'

    export default {
        name: 'Budgets',
        data: function() {
            return {
                tab: null,
                regularBudgets: [],
                urgentBudgets: []
            };
        },
        created: function () {
            this.$http.get('/budgets').
            then((response) => {
                this.regularBudgets = response.data;
            });
            this.$http.get('/budgets/urgent').
            then((response) => {
                this.urgentBudgets = response.data;
            })
        },
        components: {
            BudgetList,
        }
    }
</script>

<style scoped>
.tab-items {
    background-color: #E8EAF6;
}
</style>
