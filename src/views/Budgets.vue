<template>
    <v-item-group>
        <v-container>
            <v-row v-for="n in rows" :key="n" class="d-flex align-start">
                <v-col v-for="k in calculateColumns(n)" :key="5* (n-1) + k">
                    <v-card height="200" width="300" tile @click="goToBudget(budgets[5*(n-1)+k-1]._id)">
                        <v-card-title>{{$t('Week')}} {{ budgets[5*(n-1)+k-1]._id }}</v-card-title>
                        <v-card-text>{{$t('TotalSumWeek')}}: {{ budgets[5*(n-1)+k-1].totalSum }}</v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn icon @click.stop="printBudget(budgets[5*(n-1)+k-1]._id)">
                                <v-icon>mdi-printer</v-icon>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </v-item-group>
</template>

<script>
    import {all, create} from 'mathjs'
    import * as pdfMake from 'pdfmake/build/pdfmake.js';
    import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
    import moment from 'moment';

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    const math = create(all);

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
        }

        return result;
    }

    function generateQueryRows(queries) {
        let segment = {
            table: {
                widths: [ 240, 100, 60, 70, 105, 34, 30],
                body: []
            }
        }

        queries.forEach((query) => {
            let row = [];
            row.push({ text: query.title, style: 'row' });
            row.push({ text: query.reason, style: 'row' });
            let places = 'ФФ';
            if (query.places) {
                let result = query.places.toString();

                if (result.length < 20)
                    places = result
            }

            row.push({ text: places, style: 'row' });
            row.push({ text: getCompaniesFromActivities(query, true), style: 'row' });
            row.push({ text: query.contractor, style: 'row' });
            let payDate = moment(query.payDate);
            row.push({ text: query.totalSum, style: 'sumCell' });
            row.push({ text: payDate.format('D.M'), style: 'row' });
            segment.table.body.push(row);
        });

        return segment;
    }

    function generateSubTotal(queries) {
        let price = 0;

        queries.forEach((query) => {
            price += Number(query.totalSum);
        });

        return {
            table: {
                widths: [611, 73],
                body: [
                    [
                        { text: 'Общо', style: 'rowRightBold' },
                        { text: price + ' лв.', style: 'rowRightBold', margin: [ 0, 0, 26, 0] }
                    ]
                ]
            }
        }
    }

    function generateDefinition(budget, week, user) {
        let definition = {
            content: [{
                columns: []
            }],
            styles: {
                title: {
                    fontSize: 8,
                    bold: true,
                    alignment: 'center'
                },
                titleLeft: {
                    fontSize: 8,
                    bold: true,
                    alignment: 'left'
                },
                row: {
                    fontSize: 8
                },
                rowRightBold: {
                    fontSize: 8,
                    alignment: 'right',
                    bold: true
                },
                rowBold: {
                    fontSize: 8,
                    bold: true
                },
                name: {
                    fontSize: 8,
                    italics: true
                },
                sumCell: {
                    fontSize: 8,
                    alignment: 'right'
                }
            },
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [ 15, 15, 15, 15 ]
        }

        let headerColumns = {
            stack: [{
                table: {
                    widths: [611, 29, 35],
                    body: [
                        [ { text: 'Договорни, фактурирани и очаквани плащания от дирекция "ЕП"', style: 'title' },
                            { text: new Date().getFullYear(), style: 'title' },
                            { text: 'плащане', style: 'title' }
                        ]
                    ]
                }
            }]
        }

        let subheaderColumns = {
            table: {
                widths: [ 240, 100, 60, 70, 105, 34, 30],
                body: [
                    [ { text: 'Основание', style: 'title' },
                        { text: '№ по ред плащане - чл., ал. от договора', style: 'title' },
                        { text: 'обект', style: 'title' },
                        { text: 'фирма ФФ', style: 'title' },
                        { text: 'контрагент', style: 'title' },
                        { text: 'сума', style: 'title' },
                        { text: 'дата', style: 'title' }
                    ]
                ]
            }
        }

        headerColumns.stack.push(subheaderColumns);

        let autoQueries = budget.queries.filter((query) => { return query.type.includes('Transport')});

        if (autoQueries.length) {
            let autoSubheader = {
                table: {
                    widths: [690],
                    body: [
                        [
                            { text: 'АВТОПАРК', style: 'titleLeft'}
                        ]
                    ]
                }
            }
            headerColumns.stack.push(autoSubheader);
            headerColumns.stack.push(generateQueryRows(autoQueries));
            headerColumns.stack.push(generateSubTotal(autoQueries));
        }

        let supportQueries = budget.queries.filter((query) => { return !query.type.includes('Transport')});

        if (supportQueries.length) {
            let supportSubheader = {
                table: {
                    widths: [693],
                    body: [
                        [
                            { text: 'ПОДДРЪЖКА', style: 'titleLeft'}
                        ]
                    ]
                }
            }
            headerColumns.stack.push(supportSubheader);
            headerColumns.stack.push(generateQueryRows(supportQueries));
            headerColumns.stack.push(generateSubTotal(supportQueries));
        }

        let signatureColumns = {
            stack: [
                { text: '......................................................', style: 'row', margin: [5, 35, 0, 0] },
                { text: 'Одобрил: В. Николов', style: 'row', margin: [5, 0, 0, 0] },
                { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
                { text: 'Съгласувал: Вл. Николов', style: 'name', margin: [5, 0, 0, 0] },
                { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
                { text: 'Съгласувал: Ян. Стойчев', style: 'name', margin: [5, 0, 0, 0] },
                { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
                { text: 'Съгласувал: В. Божева', style: 'name', margin: [5, 0, 0, 0] },
                { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
                { text: 'Съгласувал: Вл. Кънчев', style: 'name', margin: [5, 0, 0, 0] },
                { text: '......................................................', style: 'row', margin: [5, 40, 0, 0] },
                { text: 'Съгласувал: Хр. Спасов', style: 'name', margin: [5, 0, 0, 0] }
            ]
        }

        let madeBy = user.firstName.substring(0, 1) + ' ' + user.lastName;
        signatureColumns.stack.push({ text: '......................................................', style: 'row', margin: [5, 40, 0, 0] });
        signatureColumns.stack.push({ text: 'Изготвил: ' + madeBy, style: 'name', margin: [5, 0, 0, 0]});

        let dateCreated = moment();
        dateCreated.week(week - 1);
        dateCreated.isoWeekday(4);

        let total = 0;

        budget.queries.forEach((query) => {
            total += Number(query.totalSum);
        });

        let footer = {
            columns: [
                { text: dateCreated.format('D.MM.YYYY'), style: 'row', margin: [10, 10, 0, 0] },
                { text: 'Седмичен бюджет №' + week, style: 'rowBold', margin: [10, 10, 10, 0] },
                { text: 'Всичко с ДДС: ' + total + ' лв.', style: 'rowBold', margin: [ 112, 3, 10, 0] }
            ]
        }

        headerColumns.stack.push(footer);

        definition.content[0].columns.push(headerColumns);
        definition.content[0].columns.push(signatureColumns);

        return definition;
    }

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
            printBudget: function (week) {
                this.$http.get('/budget?week=' + week).
                then((response) => {
                    pdfMake.createPdf(generateDefinition(response.data, week, this.$store.state.user)).open();
                })
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