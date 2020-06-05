<template>
    <v-container class="pt-5">
        <section v-if="error">
            {{$t('ErrorOnLoad')}}
        </section>
        <section v-else>
            <v-progress-circular indeterminate color="primary" v-if="showProgressBar"></v-progress-circular>
            <v-card class="mx-auto" max-width="600" v-else>
                <v-card-title class="indigo white--text">
                    <span class="headline">
                        {{ query.title }}
                    </span>
                    <v-spacer></v-spacer>
                    <v-menu bottom left>
                        <template v-slot:activator="{ on }">
                            <v-btn dark icon v-on="on">
                                <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item @click="generatePdf">
                                <v-list-item-title><v-icon>mdi-printer</v-icon>{{$t('Print')}}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="rejectQuery" v-if="query.status !== 'rejected'">
                                <v-list-item-title><v-icon>mdi-file-excel</v-icon>{{$t('Reject')}}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="redactQuery" v-if="query.status === 'rejected'">
                                <v-list-item-title><v-icon>mdi-file-document-edit</v-icon>{{$t('Edit')}}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-card-title>
                <v-list class="transparent">
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-layers</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Type')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.type.reduce((acc, elem) => acc + ', ' + elem ) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-apps</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Category')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.category }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-selection-ellipse</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Status')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right"><v-chip :color="getColor()">{{ query.status }}</v-chip></v-list-item-subtitle>
                    </v-list-item>
                    <v-list-group value="true" prepend-icon="mdi-hammer-screwdriver">
                        <template v-slot:activator>
                            <v-list-item-title>{{$t('Activities')}}</v-list-item-title>
                        </template>
                        <v-list-item v-for="(activity, index) in query.activities" :key="index">
                            <v-list-item-content>
                                <v-list-item-title>{{index + 1}}. {{activity.company}} - {{activity.name}} {{$t('PriceVAT')}}: {{ calculateVAT(activity.price) }}</v-list-item-title>
                                <v-list-item-subtitle>{{activity.places}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-group>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-currency-usd</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('TotalPriceVAT')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ totalPrice }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Contractor')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.contractor }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-grease-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Reason')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.reason }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-card-bulleted</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Companies')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.companies }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-calendar-blank</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('PayDate')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.payDate }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-cash-register</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('PaymentMethod')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.paymentMethod }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-calendar</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('DateCreated')}}</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.dateCreated }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-note</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{$t('Notes')}}</v-list-item-title>
                        <v-list-item-subtitle>{{ query.notes }}</v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-card>
        </section>
    </v-container>
</template>

<script>
    import * as pdfMake from 'pdfmake/build/pdfmake.js';
    import * as pdfFonts from 'pdfmake/build/vfs_fonts.js';
    import {all, create} from 'mathjs'

    const math = create(all);
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    function translatePayment(payment) {
        switch (payment) {
            case 'bank':
                return 'по банка';
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
            pageMargins: [ 40, 60, 40, 60 ]
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
            let name = (index + 1) + '. ' +activity.company + ' - ' + activity.name;
            activities.columns[0].stack.push(name);
            activities.columns[1].stack.push(activity.price + ' лв.');
            activities.columns[2].stack.push('без ДДС');
        });

        definition.content.push(activities);
        definition.content.push(activitiesSummary);

        contragent.columns[0].stack.push({ text: 'Контрагент: ' });
        contragent.columns[1].stack.push({ text: query.contractor });
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

        paymentInfo.columns[0].stack.push({ text: 'Дата на плащане: ' });
        paymentInfo.columns[1].stack.push({ text: payDate.toLocaleDateString('bg-BG')});
        paymentInfo.columns[0].stack.push({ text: 'Начин на плащане: ' });
        paymentInfo.columns[1].stack.push({ text: translatePayment(query.paymentMethod)});

        definition.content.push(paymentInfo);

        let madeBy = user.firstName + ' ' + user.lastName;

        let signatures1 = {
            stack: [
                { text: 'Съставил:.....................................', style: 'signature', margin: [10, 50, 10, 0] },
                { text: madeBy, style: 'signatureRight', margin: [10, 0, 90, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [10, 50, 10, 0] },
                { text: 'Доли Николова', style: 'signatureRight', margin: [10, 0, 90, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [10, 50, 10, 0] },
                { text: 'Директор Дирекция "Правна"', style: 'signatureRight', margin: [10, 0, 20, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [10, 50, 10, 0] },
                { text: 'Вл. Николов', style: 'signatureRight', margin: [10, 0, 110, 0] }
            ]
        }

        let signatures2 = {
            stack: [
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: 'Хр. Спасов', style: 'signatureRight', margin: [10, 0, 120, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: 'Вл. Кънчев', style: 'signatureRight', margin: [10, 0, 120, 0] },
                { text: 'Съгласувал:...................................', style: 'signature', margin: [0, 50, 10, 0] },
                { text: 'ФСО', style: 'signatureRight', margin: [10, 0, 140, 0] }
            ]
        }

        if (query.isUrgent) {
            signatures2.stack.push({ text: 'Одобрил:...................................', style: 'signature', margin: [0, 50, 10, 0] })
            signatures2.stack.push({ text: 'В. Николов', style: 'signatureRight', margin: [10, 0, 140, 0] });
        }

        let signatures = {
            columns: [ signatures1, signatures2 ]
        }

        definition.content.push(signatures);
        definition.content.push({text: dateCreated.toLocaleDateString('bg-BG'), style: 'date', margin: [10, 25, 0, 0]});

        return definition;
    }

    export default {
        name: "ViewQuery",
        data: () => {
            return {
                query: null,
                error: null,
                showProgressBar: true
            }
        },
        computed: {
            totalPrice: function () {
                let totalPrice = 0;

                this.query.activities.forEach((item) => {
                    totalPrice += this.calculateVAT(item.price);
                });

                return math.round(totalPrice, 2);
            }
        },
        methods: {
            generatePdf: function () {
                pdfMake.createPdf(generateDefinition(this.query, this.$store.state.user)).open();
            },
            getColor: function () {
                switch (this.query.status) {
                    case 'pending':
                        return 'orange';
                    case 'approved':
                        return 'green';
                    case 'rejected':
                        return 'red';
                }
            },
            calculateVAT: function (price) {
                let priceVAT = math.multiply(price, 1.2);
                return math.round(priceVAT, 2);
            },
            rejectQuery: function () {
                this.query.status = 'rejected';
                this.updateQuery();
            },
            redactQuery: function () {
                this.$router.push({ name: 'AddQuery', params: { templateQueryId: this.query._id, wasRejected: true} });
            },
            updateQuery: function () {
                delete this.query._id;
                this.$http.put('/query/' + this.$route.params.id, this.query).
                then((response) => {
                    if (response.status !== 200) {
                        this.fetchQuery();
                    }
                })
            },
            fetchQuery: function () {
                this.$http.get('/query/' + this.$route.params.id).
                then((response) => {
                    this.query = response.data;
                }).
                catch(() => {
                    this.error = true;
                }).
                finally(() => {
                    this.showProgressBar = false;
                });
            }
        },
        mounted: function () {
            this.fetchQuery();
        }
    }
</script>

<style scoped>

</style>