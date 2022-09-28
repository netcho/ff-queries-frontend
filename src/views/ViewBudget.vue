<template>
    <v-container class="pt-5">
        <v-card class="mx-auto">
            <v-card-title>
                {{$t('BudgetWeek')}} {{ $route.params.week }}
                <v-spacer></v-spacer>
            </v-card-title>
            <v-data-table
                    :headers="headers"
                    :items="budget.queries"
                    :items-per-page="10"
                    :loading="showProgressBar"
                    class="elevation-1 mx-auto"
                    @click:row="viewQuery">
            <template v-slot:item.companies="{ item }">
                {{ getCompaniesFromActivities(item) }}
            </template>
            <template v-slot:item.places="{ item }">
                {{ item.places ? item.places.toString() : 'FF' }}
            </template>
            <template v-slot:item.payDate="{ item }">
                {{ item.payDate | moment('ll') }}
            </template>
            </v-data-table>
        </v-card>
        <v-row class="title ma-5">
            <v-spacer></v-spacer>
            <div class="ml-16">{{$t('TotalSumVAT')}}: {{ budget.totalSum }}</div>
        </v-row>
    </v-container>
</template>

<script>
    function getCompaniesFromActivities(query, pdf = false) {
        let companies = '';

        if (query.activities.length > 1) {
            query.activities.forEach((activity, index, activities) => {
                let companyName = pdf ? truncateCompanyName(activity.company) : activity.company;
                if(!companies.includes(companyName)) {
                    companies += companyName;

                    if(index !== (activities.length -1)) {
                        companies += ', ';
                    }
                }
            });
        }
        else {
            companies = query.activities[0].company;
        }

        return companies;
    }

    function truncateCompanyName(name) {
        let result = '';

        switch (name) {
            case 'ВАН Холдинг': {
                result = 'В.Х.';
                break;
            }
            case 'Европа-ВН': {
                result = 'Е ВН';
                break;
            }
            case 'Винтерко-БГ': {
                result = 'В-БГ';
                break;
            }
            case 'ЕвроХарт': {
                result = 'Е.Х.';
                break;
            }
            case 'Фантастико Груп': {
                result = 'Ф. Г.';
                break;
            }
        }

        return result;
    }

    export default {
        name: 'ViewBudget',
        data: function () {
            return {
                headers: [],
                budget: {},
                error: null,
                showProgressBar: true
            }
        },
        methods: {
            getCompaniesFromActivities: function (query) {
                return getCompaniesFromActivities(query);
            },
            viewQuery: function (query) {
                this.$router.push({name: 'ViewQuery', params: {id: query._id}});
            }
        },
        created: function () {
            this.headers = [
                { text: this.$t('Title'), value: 'title' },
                { text: this.$t('Reason'), value: 'reason' },
                { text: this.$t('Places'), value: 'places' },
                { text: this.$t('Companies'), value: 'companies' },
                { text: this.$t('Contractor'), value: 'contractor' },
                { text: this.$t('Sum'), value: 'totalSum', align: 'end' },
                { text: this.$t('PayDate'), value: 'payDate' }
            ];
        },
        mounted: function () {
            this.$http.get('/budget', { params:{ year: this.$route.params.year, week: this.$route.params.week}}).
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
