<template>
    <v-container class="pt-5">
        <v-card>
            <v-card-title>
                {{$t('Queries')}}
                <v-spacer></v-spacer>
                <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        :label="$t('Search')"
                        single-line
                        hide-details
                ></v-text-field>
            </v-card-title>
            <v-data-table
                :headers="headers"
                :items="queries"
                :items-per-page="10"
                :loading="loading"
                :search="search"
                item-key="_id"
                calculate-widths
                class="elevation-1 mx-auto"
                @click:row="viewQuery">
            <template v-slot:item.type="{ item }">
                {{ translateType(item) }}
            </template>
            <template v-slot:item.companies="{ item }">
                {{ getCompanies(item) }}
            </template>
            <template v-slot:item.status="{ item }">
                <v-chip :color="getColor(item)">{{ $t(item.status) }}</v-chip>
            </template>
            <template v-slot:item.dateCreated="{ item }">
                {{ item.dateCreated | moment('D.M.YYYY') }}
            </template>
            <template v-slot:item.payDate="{ item }">
                {{ item.payDate | moment('D.M.YYYY') }}
            </template>
            <template v-slot:item.totalSum="{ item }">
                {{ new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(item.totalSum)}}
            </template>
            <template v-slot:item.actions="{ item }">
                <v-row justify="space-around" class="flex-nowrap">
                    <v-icon class="mr-3" @click.stop="generatePdf(item)">
                        mdi-printer
                    </v-icon>
                    <v-icon @click.stop="createFrom(item)" v-if="$can('create', 'Query')">
                        mdi-content-copy
                    </v-icon>
                    <v-icon class="ml-3" @click.stop="editQuery(item)" v-if="$can('update', 'Query') && isQueryFromCurrentBudget(item)">
                        mdi-pencil
                    </v-icon>
                </v-row>
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
                v-if="$can('create', 'Query')"
                :to="{ name: 'AddQuery'}">
            <v-icon>mdi-plus</v-icon>
        </v-btn>
    </v-container>
</template>

<script>
    import * as pdfMake from 'pdfmake/build/pdfmake.js';
    import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
    //import { create, all } from 'mathjs';

    //const math = create(all);

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    function translatePayment(payment) {
        switch (payment) {
            case 'bank':
                return 'по банка - с/у ф-ра';
            case 'cash':
                return 'на каса';
        }
    }

    function getCompaniesFromActivities(query, pdf = false) {
        let companies = '';

        query.activities.forEach((activity, index, activities) => {
            if(!companies.includes(activity.company)) {
                if(index < activities.length && index > 0) {
                    companies += ', ';
                }

                if (pdf) {
                    companies += activity.company + ' ЕООД';
                }
                else {
                    companies += activity.company;
                }
            }
        });

        return companies;
    }

    function generateDefinition(query, user) {
        let definition = {
            content: [],
            styles: {
                title: {
                    fontSize: 24,
                    bold: true,
                    alignment: 'center'
                },
                subHeading: {
                    fontSize: 11,
                    bold: true,
                    alignment: 'right'
                },
                companies: {
                    fontSize: 10,
                    alignment: 'center'
                },
                signature: {
                    fontSize: 9,
                    italics: true
                },
                signatureRight: {
                    fontSize: 8,
                    italics: true,
                    alignment: 'right'
                },
                date: {
                    fontSize: 9,
                    italics: true,
                    alignment: 'right'
                },
                mainText: {
                    fontSize: 10
                },
                mainTextBold: {
                    fontSize: 10,
                    bold: true
                },
                rightAlign: {
                    alignment: 'right',
                    fontSize: 10
                },
                rightAlignBold: {
                    fontSize: 10,
                    alignment: 'right',
                    bold: true
                },
                totalSumRight: {
                    fontSize: 13,
                    bold: true,
                    alignment: 'right'
                },
                totalSum: {
                    fontSize: 13,
                    bold: true
                }
            },
            pageSize: 'A4',
            pageMargins: [ 30, 20, 30, 20 ]
        };

        let payDate = new Date(query.payDate);
        let dateCreated = new Date(query.dateCreated);

        definition.content.push({ text: 'За нуждите на ЕП', style: 'subHeading', margin: [0, 0, 0, 10]});
        definition.content.push({ text: 'З А Я В К А', style: 'title'});

        let main1 = {
            columns: [
                { text: 'За отпускане на средства за: ', style: 'mainText', width: 'auto' },
                { text: query.title, style: 'mainTextBold', width: 'auto' }
            ],
            columnGap: 3
        }

        definition.content.push(main1);

        let activities = {
            layout: 'noBorders',
            table: {
                widths: [400, 60, 40],
                body: []
            },
            margin: [ 15, 10, 15, 0 ]
        }

        query.activities.forEach((activity, index) => {
            let row = [];
            row.push({ text: (index + 1) + '. ' + activity.company + ' - ' + activity.name + (activity.places ? ' : ' + activity.places : ''), style: 'mainText' });
            row.push({ text: new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(activity.price), style: 'rightAlignBold' });
            row.push({ text: 'без ДДС', style: 'mainText' });
            activities.table.body.push(row);
        });

        let totalSumWithoutVAT = 0;

        query.activities.forEach((activity) => {
            totalSumWithoutVAT += Number(activity.price);
        });

        let activitiesSummary = [
            { text: 'Всичко :', style: 'rightAlignBold', margin: [ 0, 10 ] },
            { text: new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(totalSumWithoutVAT), style: 'rightAlignBold', margin: [ 0 , 10 ] },
            { text: 'без ДДС', style: 'mainTextBold', margin: [ 0, 10 ] }
        ];

        activities.table.body.push(activitiesSummary);

        definition.content.push(activities);

        let contragent = {
            columns: [{
                stack: [],
                width: 'auto',
                style: 'mainText'
            },{
                stack: [],
                width: 'auto',
                style: 'mainTextBold'
            }],
            columnGap: 8,
            margin: [15, 10, 15, 0]
        };

        contragent.columns[0].stack.push({ text: 'Контрагент: ', margin: [ 0, 0, 0, 10 ] });
        contragent.columns[1].stack.push({ text: query.contractor, margin: [ 0, 0, 0, 10 ] });
        contragent.columns[0].stack.push({ text: 'Основание - съгласно: ' });
        contragent.columns[1].stack.push({ text: query.reason });

        definition.content.push(contragent);

        let payTotal = {
            columns: [
                { text: 'За плащане:', style: 'totalSumRight', width: 'auto' },
                { text: new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(query.totalSum) + ' с ДДС', width: '*', style: 'totalSum' }
            ],
            columnGap: 25,
            margin: [ 165, 20, 15, 10 ]
        };

        definition.content.push(payTotal);

        let paymentInfo = {
            columns: [{
                stack: [],
                width: 'auto',
                style: 'mainText'
            },{
                stack: [],
                width: 'auto',
                style: 'mainTextBold'
            }],
            columnGap: 8,
            margin: [15, 10, 15, 0]
        }

        paymentInfo.columns[0].stack.push({ text: 'Дата на плащане: ', margin: [ 0, 0, 0, 10 ] });
        paymentInfo.columns[1].stack.push({ text: payDate.toLocaleDateString('bg-BG'), margin: [ 0, 0, 0, 10 ]});
        paymentInfo.columns[0].stack.push({ text: 'Начин на плащане: ' });
        paymentInfo.columns[1].stack.push({ text: translatePayment(query.paymentMethod)});

        if (query.notes.length) {
            paymentInfo.columns[0].stack.push({ text: 'Забележки: ', margin: [ 0, 0, 0, 10 ] });
            paymentInfo.columns[1].stack.push({ text: query.notes});
        }

        definition.content.push(paymentInfo);

        let madeBy = '/' + user.firstName.substring(0, 1) + '. ' + user.lastName + '/';

        let signatures1 = {
            stack: [
                { text: 'Съставил:.....................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: madeBy, style: 'signatureRight', margin: [0, 0, 60, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/В. Божева/', style: 'signatureRight', margin: [0, 0, 60, 0] }
            ]
        }

        let signatures2 = {
            stack: [
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Хр. Спасов/', style: 'signatureRight', margin: [0, 0, 65, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Ян. Стойчев/', style: 'signatureRight', margin: [10, 0, 60, 0] },
            ]
        }

        let signatures3 = {
            stack: [
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Вл. Кънчев/', style: 'signatureRight', margin: [0, 0, 60, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Вл. Николов/', style: 'signatureRight', margin: [0, 0, 60, 0] }
            ]
        }

        if (query.isUrgent) {
            signatures2.stack.push({ text: 'Одобрил:...................................', style: 'signature', margin: [0, 50, 10, 0] })
            signatures2.stack.push({ text: 'В. Николов', style: 'signatureRight', margin: [0, 0, 40, 0] });
        }

        let signatures = {
            columns: [ signatures1, signatures2, signatures3 ]
        };

        definition.content.push(signatures);
        definition.content.push({text: dateCreated.toLocaleDateString('bg-BG'), style: 'date', margin: [0, 30, 0, 0]});

        return definition;
    }

    export default {
        name: "Queries",
        data: function () {
            return {
                headers: [],
                queries: [],
                loading: true,
                showDeleteDialog: false,
                error: null,
                search: ''
            }
        },
        created: function () {
            this.headers = [
                { text: this.$t('Type'), value: 'type' },
                { text: this.$t('Category'), value: 'category' },
                { text: this.$t('Title'), value: 'title' },
                { text: this.$t('Sum'), value: 'totalSum', align: 'end' },
                { text: this.$t('Status'), value: 'status' },
                { text: this.$t('Contractor'), value: 'contractor' },
                { text: this.$t('Reason'), value: 'reason' },
                { text: this.$t('Companies'), value: 'companies' },
                { text: this.$t('PayDate'), value: 'payDate', align: 'end' },
                { text: this.$t('DateCreated'), value: 'dateCreated', align: 'end' },
                { text: this.$t('Actions'), value: 'actions', sortable: false },
            ]
        },
        mounted: function () {
            this.$http.get('/queries').
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
            editQuery: function(query) {
                this.$router.push({ name: 'AddQuery', params: { templateQueryId: query._id, edit: true }});
            },
            createFrom: function (query) {
                this.$router.push({name: 'AddQuery', params: { templateQueryId: query._id }});
            },
            isQueryFromCurrentBudget: function (query) {
                let lastThursday = this.$moment().isoWeekday(4).isoWeek(this.$moment().isoWeek() - 1);
                return this.$moment(query.payDate).isAfter(lastThursday);
            },
            generatePdf: function (query) {
                pdfMake.createPdf(generateDefinition(query, this.$store.state.user)).open();
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
            },
            translateType: function (query) {
                let type = '';

                query.type.forEach((elem, index) => {
                    if( index > 0 && index < query.type.length) {
                        type += ', ';
                    }

                    type += this.$t(elem);
                });

                return type;
            },
            getCompanies: function (query) {
                return getCompaniesFromActivities(query);
            }
        }
    }
</script>

<style scoped>

</style>