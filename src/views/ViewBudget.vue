<template>
    <v-container class="pt-5">
        <v-card class="mx-auto">
            <v-card-title>
                {{$t('BudgetWeek')}} {{ $route.params.week }}
                <v-spacer></v-spacer>
                <v-btn icon @click="printBudget"><v-icon>mdi-printer</v-icon></v-btn>
            </v-card-title>
            <v-data-table
                    :headers="headers"
                    :items="budget.queries"
                    :items-per-page="20"
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
                {{ item.payDate | moment('D MMM YYYY') }}
            </template>
            </v-data-table>
        </v-card>
        <v-row class="title ma-5">
            <v-spacer></v-spacer>
            <div>{{$t('TotalSumVAT')}}: {{ budget.totalSum }}</div>
        </v-row>
    </v-container>
</template>

<script>
    import * as pdfMake from 'pdfmake/build/pdfmake.js';
    import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    function generateDefinition(budget, week, user, moment) {
        let definition = {
            content: [{
                columns: []
            }],
            styles: {
                title: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'center'
                },
                row: {
                    fontSize: 9
                },
                name: {
                    fontSize: 9,
                    italics: true
                },
                sumCell: {
                    fontSize: 9,
                    alignment: 'right'
                },
                titleSmall: {
                    fontSize: 20,
                    alignment: 'center'
                },
                subHeading: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'right'
                },
                companies: {
                    fontSize: 14,
                    alignment: 'center'
                },
                center: {
                    alignment: 'center'
                },
                names: {
                    fontSize: 17
                },
                signature: {
                    //fontSize: 15,
                    italics: true
                },
                signatureRight: {
                    //fontSize: 15,
                    italics: true,
                    alignment: 'right'
                },
                date: {
                    fontSize: 12,
                    italics: true
                },
                bold: {
                    bold: true
                },
                rightAlign: {
                    alignment: 'right'
                },
                rightAlignBold: {
                    alignment: 'right',
                    bold: true
                },
                totalSumRight: {
                    fontSize: 15,
                    bold: true,
                    alignment: 'right'
                },
                totalSum: {
                    fontSize: 15,
                    bold: true
                }
            },
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [ 10, 10, 10, 10 ]
        }

        let headerColumns = {
            stack: [{
                table: {
                    widths: [560, 45, 50, 50],
                    body: [
                        [ { text: 'Договорни, фактурирани и очаквани плащания от дирекция "ЕП"', style: 'title' },
                          { text: new Date().getFullYear(), style: 'title' },
                          { text: 'плащане', style: 'title' },
                          { text: 'документ', style: 'title' },
                        ]
                    ]
                }
            }]
        }

        let subheaderColumns = {
            table: {
                widths: [ 190, 100, 60, 70, 105, 44, 50, 50],
                body: [
                    [ { text: 'Основание', style: 'title' },
                      { text: '№ по ред плащане - чл., ал. от договора', style: 'title' },
                      { text: 'обект', style: 'title' },
                      { text: 'фирма ФФ', style: 'title' },
                      { text: 'контрагент', style: 'title' },
                      { text: 'сума', style: 'title' },
                      { text: 'дата', style: 'title' },
                      { text: '' }
                    ]
                ]
            }
        }

        budget.queries.forEach((query) => {
            let row = [];
            row.push({ text: query.title, style: 'row' });
            row.push({ text: query.reason, style: 'row' });
            row.push({ text: query.places ? query.places.toString() : 'ФФ', style: 'row' });
            row.push({ text: getCompaniesFromActivities(query), style: 'row' });
            row.push({ text: query.contractor, style: 'row' });
            let payDate = moment(query.payDate);
            row.push({ text: query.totalSum, style: 'sumCell' });
            row.push({ text: payDate.format('D MMM'), style: 'row' });
            row.push({ text: 'фактури', style: 'row' });
            subheaderColumns.table.body.push(row);
        });

        headerColumns.stack.push(subheaderColumns);

        let signatureColumns = {
            stack: [
                { text: 'Одобрил', style: 'row', margin: [5, 0, 0, 30] },
                { text: '......................', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'В. Николов', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'Съгласувал:', style: 'row', margin: [5, 5, 0, 30] },
                { text: '......................', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'Вл. Николов', style: 'name', margin: [5, 0, 0, 0] },
                { text: 'Съгласувал:', style: 'row', margin: [5, 5, 0, 30] },
                { text: '......................', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'Вл. Кънчев', style: 'name', margin: [5, 0, 0, 0] },
                { text: 'Съгласувал:', style: 'row', margin: [5, 5, 0, 30] },
                { text: '......................', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'Дирекция "Правна"', style: 'name', margin: [5, 0, 0, 0] },
                { text: 'Съгласувал:', style: 'row', margin: [5, 5, 0, 30] },
                { text: '......................', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'ФСО', style: 'name', margin: [5, 0, 0, 0] },
                { text: 'Съгласувал:', style: 'row', margin: [5, 5, 0, 30] },
                { text: '......................', style: 'row', margin: [5, 0, 0, 0] },
                { text: 'Хр. Спасов', style: 'name', margin: [5, 0, 0, 0] }
            ]
        }

        let madeBy = user.firstName.substring(0, 1) + ' ' + user.lastName;

        signatureColumns.stack.push({ text: 'Изготвил', style: 'row', margin: [0, 5, 0, 35]});
        signatureColumns.stack.push({ text: '......................', style: 'row', margin: [0, 0, 0, 0] });
        signatureColumns.stack.push({ text: madeBy, style: 'name', margin: [0, 0, 0, 0]});

        let dateCreated = moment();
        dateCreated.week(week - 1);
        dateCreated.isoWeekday(5);

        let footer = {
            columns: [
                { text: dateCreated.format('D.MM.YYYY'), style: 'row', margin: [10, 10, 0, 0] }
            ]
        }

        headerColumns.stack.push(footer);

        definition.content[0].columns.push(headerColumns);
        definition.content[0].columns.push(signatureColumns);

        return definition;
    }

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
            printBudget: function () {
                pdfMake.createPdf(generateDefinition(this.budget, this.$route.params.week, this.$store.state.user, this.$moment)).open();
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
                { text: this.$t('Sum'), value: 'totalSum' },
                { text: this.$t('PayDate'), value: 'payDate' }
            ];
        },
        mounted: function () {
            this.$http.get('/api/budget?week=' + this.$route.params.week).
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