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
                :items-per-page="20"
                :loading="loading"
                :search="search"
                class="elevation-1 mx-auto"
                @click:row="viewQuery">
            <template v-slot:item.type="{ item }">
                {{ item.type.reduce((acc, elem) => acc + ', ' + $t(elem) ) }}
            </template>
            <template v-slot:item.status="{ item }">
                <v-chip :color="getColor(item)">{{ $t(item.status) }}</v-chip>
            </template>
            <template v-slot:item.dateCreated="{ item }">
                {{ item.dateCreated | moment('D MMM YYYY') }}
            </template>
            <template v-slot:item.payDate="{ item }">
                {{ item.payDate | moment('D MMM YYYY') }}
            </template>
            <template v-slot:item.actions="{ item }">
                <v-icon class="mr-3" @click.stop="generatePdf(item)">
                    mdi-printer
                </v-icon>
                <v-icon @click.stop="createFrom(item)">
                    mdi-content-copy
                </v-icon>
                <v-icon class="ml-3" @click.stop="showDeleteDialog = !showDeleteDialog">
                    mdi-trash-can-outline
                </v-icon>
                <v-dialog v-model="showDeleteDialog" persistent max-width="290">
                    <v-card>
                        <v-card-title class="headline">{{$t('DeleteQueryTitle')}}</v-card-title>
                        <v-card-text>{{$t('DeleteConfirm')}}</v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn text @click="showDeleteDialog = !showDeleteDialog">{{$t('Cancel')}}</v-btn>
                            <v-btn text @click="deleteQuery(item)">{{$t('Delete')}}</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
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
    import * as pdfMake from 'pdfmake/build/pdfmake.js';
    import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';

    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    function translatePayment(payment) {
        switch (payment) {
            case 'bank':
                return 'по банка - с/у ф-ра';
            case 'cash':
                return 'на каса';
        }
    }

    function generateDefinition(query, user) {
        let definition = {
            content: [],
            styles: {
                title: {
                    fontSize: 28,
                    bold: true,
                    alignment: 'center'
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
                    fontSize: 11,
                    italics: true
                },
                signatureRight: {
                    fontSize: 10,
                    italics: true,
                    alignment: 'right'
                },
                date: {
                    fontSize: 10,
                    italics: true,
                    alignment: 'right'
                },
                queryTitle: {
                    bold: true,
                    //alignment: 'left'
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
            pageMargins: [ 30, 20, 30, 20 ]
        };

        let contragent = {
            columns: [{
                stack: [],
                width: 'auto'
            },{
                stack: [],
                width: 'auto',
                style: 'queryTitle'
            }],
            columnGap: 8,
            margin: [15, 20, 15, 0]
        };


        let payDate = new Date(query.payDate);
        let dateCreated = new Date(query.dateCreated);

        definition.content.push({ text: 'За нуждите на ЕП', style: 'subHeading', margin: [0, 0, 0, 10]});
        definition.content.push({ text: 'З А Я В К А', style: 'title'});
        definition.content.push({ text: query.companies, style: 'companies', margin: [25, 0, 25, 50]});

        let main1 = {
            columns: [
                { text: 'За отпускане на средства за: ', width: 'auto' },
                { text: query.title, style: 'queryTitle', width: 'auto' }
            ],
            columnGap: 3
        }

        definition.content.push(main1);

        let activities = {
            columns: [{
                stack: [],
                width: '78%'
            }, {
                stack: [],
                width: '12%',
                style: 'queryTitle'
            }, {
                stack: [],
                width: '*'
            }],
            columnGap: 3,
            margin: [ 15, 0, 15, 0 ]
        }

        let totalSumWithoutVAT = 0;

        query.activities.forEach((activity) => {
            totalSumWithoutVAT += Number(activity.price);
        });

        let activitiesSummary = {
            columns: [
                { text: 'Всичко без ДДС: ', style: 'rightAlign', width: '77%' },
                { text: totalSumWithoutVAT + ' лв.', width: '*', style: 'queryTitle' }
            ],
            columnGap: 7,
            margin: [ 15, 10, 15, 0 ]
        }

        query.activities.forEach((activity, index) => {
            let name = (index + 1) + '. ' +activity.company + ' ( ' + activity.places + ' ) - ' + activity.name;
            activities.columns[0].stack.push(name);
            activities.columns[1].stack.push(activity.price + ' лв.');
            activities.columns[2].stack.push('без ДДС');
        });

        definition.content.push(activities);
        definition.content.push(activitiesSummary);

        contragent.columns[0].stack.push({ text: 'Контрагент: ', margin: [ 0, 0, 0, 10 ] });
        contragent.columns[1].stack.push({ text: query.contractor, margin: [ 0, 0, 0, 10 ] });
        contragent.columns[0].stack.push({ text: 'Основание - съгласно: ' });
        contragent.columns[1].stack.push({ text: query.reason });

        definition.content.push(contragent);

        let payTotal = {
            columns: [
                { text: 'За плащане:', style: 'totalSumRight', width: 'auto' },
                { text: query.totalSum + ' лв.', width: '*', style: 'totalSum' }
            ],
            columnGap: 25,
            margin: [ 165, 20, 15, 0 ]
        };

        definition.content.push(payTotal);

        let paymentInfo = {
            columns: [{
                stack: [],
                width: 'auto'
            },{
                stack: [],
                width: 'auto',
                style: 'queryTitle'
            }],
            columnGap: 8,
            margin: [15, 20, 15, 0]
        }

        paymentInfo.columns[0].stack.push({ text: 'Дата на плащане: ', margin: [ 0, 0, 0, 10 ] });
        paymentInfo.columns[1].stack.push({ text: payDate.toLocaleDateString('bg-BG'), margin: [ 0, 0, 0, 10 ]});
        paymentInfo.columns[0].stack.push({ text: 'Начин на плащане: ' });
        paymentInfo.columns[1].stack.push({ text: translatePayment(query.paymentMethod)});

        definition.content.push(paymentInfo);

        let madeBy = '/' + user.firstName.substring(0, 1) + '. ' + user.lastName + '/';

        let signatures1 = {
            stack: [
                { text: 'Съставил:.....................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: madeBy, style: 'signatureRight', margin: [0, 0, 40, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Доли Николова/', style: 'signatureRight', margin: [0, 0, 30, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Вл. Николов/', style: 'signatureRight', margin: [0, 0, 40, 0] }
            ]
        }

        let signatures2 = {
            stack: [
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Хр. Спасов/', style: 'signatureRight', margin: [0, 0, 45, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Директор Дирекция "Правна"/', style: 'signatureRight', margin: [10, 0, 20, 0] },
            ]
        }

        let signatures3 = {
            stack: [
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/Вл. Кънчев/', style: 'signatureRight', margin: [0, 0, 30, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: '/отдел ФСО/', style: 'signatureRight', margin: [0, 0, 40, 0] }
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
        definition.content.push({text: dateCreated.toLocaleDateString('bg-BG'), style: 'date', margin: [0, 15, 0, 0]});

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
                { text: this.$t('Sum'), value: 'totalSum' },
                { text: this.$t('Status'), value: 'status' },
                { text: this.$t('Contractor'), value: 'contractor' },
                { text: this.$t('Reason'), value: 'reason' },
                { text: this.$t('Companies'), value: 'companies' },
                { text: this.$t('PayDate'), value: 'payDate' },
                { text: this.$t('DateCreated'), value: 'dateCreated' },
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
            deleteQuery: function (query) {
                this.$http.delete('/query/' + query._id).then(() => {
                    let queryIndex = this.queries.findIndex((elem) => {
                        return elem._id === query._id;
                    });
                    this.queries.splice(queryIndex, 1);
                    this.showDeleteDialog = false;
                })
            },
            createFrom: function (query) {
                this.$router.push({name: 'AddQuery', params: {templateQueryId: query._id}});
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
            }
        }
    }
</script>

<style scoped>

</style>