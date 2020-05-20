<template>
    <v-container class="pt-5">
        <section v-if="error">
            An error occured while fetching the query
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
                                <v-list-item-title><v-icon>mdi-printer</v-icon>Print</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="approveQuery">
                                <v-list-item-title><v-icon>mdi-file-check-outline</v-icon>Approve</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="rejectQuery">
                                <v-list-item-title><v-icon>mdi-file-excel</v-icon>Reject</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-card-title>
                <v-list class="transparent">
                    <v-list-item>
                        <v-list-item-title>Type</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon>mdi-music-clef-bass</v-icon>
                        </v-list-item-icon>
                        <v-list-item-subtitle class="text-right">{{ query.type.reduce((acc, elem) => acc + ', ' + elem ) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-apps</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Category</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.category }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-selection-ellipse</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Status</v-list-item-title>
                        <v-list-item-subtitle class="text-right"><v-chip :color="getColor()">{{ query.status }}</v-chip></v-list-item-subtitle>
                    </v-list-item>
                    <v-list-group value="true" prepend-icon="mdi-hammer-screwdriver">
                        <template v-slot:activator>
                            <v-list-item-title>Activities</v-list-item-title>
                        </template>
                        <v-list-item v-for="activity in query.activities" :key="activity.name">
                            <v-list-item-content>
                                <v-list-item-title>{{activity.name}} Price with VAT: {{activity.price * 1.2}}</v-list-item-title>
                                <v-list-item-subtitle>{{activity.places}}</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-group>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-currency-usd</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Total price with VAT</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ totalPrice }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Contractor</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.contractor }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-grease-pencil</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Reason</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.reason }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-title>Companies</v-list-item-title>
                        <v-list-item-icon>
                            <v-icon>mdi-music-clef-bass</v-icon>
                        </v-list-item-icon>
                        <v-list-item-subtitle class="text-right">{{ query.companies.reduce((acc, elem) => acc + ', ' + elem ) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-calendar-blank</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Pay Date</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.payDate }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-calendar</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Date created</v-list-item-title>
                        <v-list-item-subtitle class="text-right">{{ query.dateCreated }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-note</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Notes</v-list-item-title>
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
    pdfMake.vfs = pdfFonts.pdfMake.vfs;

    function generateDefinition(query, user) {
        let definition = {
            content: [],
            styles: {
                title: {
                    fontSize: 26,
                    bold: true,
                    alignment: 'center'
                },
                titleSmall: {
                    fontSize: 20,
                    alignment: 'center'
                },
                subHeading: {
                    fontSize: 18,
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
                    fontSize: 15,
                    italics: true
                },
                signatureRight: {
                    fontSize: 15,
                    italics: true,
                    alignment: 'right'
                },
                date: {
                    fontSize: 12,
                    italics: true
                }
            },
            pageSize: 'A4',
            pageMargins: [ 40, 60, 40, 60 ]
        };

        let contragent = {
            columns: [{
                stack: [],
                fontSize: 16
            },{
                stack: [],
                fontSize: 16
            }],
            margin: [25, 10, 25, 50],
            columnGap: 18
        };

        let totalVAT = {
            columns: [{
                stack: [],
                fontSize: 16
            },{
                stack: [],
                fontSize: 16
            }],
            margin: [25, 0],
            columnGap: 18
        };

        let activities = {
            table: {
                headerRows: 1,
                widths: [ 160, 160, 160 ],

                body:[
                    [ 'Дейност', 'Обект', 'Сума без ДДС' ]
                ]
            },
            margin: [25, 10]
        };

        let totalSum = 0;
        let payDate = new Date(query.payDate);
        let dateCreated = new Date(query.dateCreated);

        definition.content.push({ text: 'За нуждите на ПЕ', style: 'subHeading'});
        definition.content.push({ text: 'ЗАЯВКА', style: 'title'});
        definition.content.push({ text: 'За отпускане на финансиране към фирмите', style: 'center'});
        definition.content.push({ text: query.companies.reduce((acc, elem) => acc + ', ' + elem ), style: 'companies'});

        contragent.columns[0].stack.push({ text: 'Контрагент' });
        contragent.columns[1].stack.push({ text: query.contractor });
        contragent.columns[0].stack.push({ text: 'Основание' });
        contragent.columns[1].stack.push({ text: query.reason });
        contragent.columns[0].stack.push({ text: 'Дата на плащане' });
        contragent.columns[1].stack.push({ text: payDate.toLocaleDateString('bg-BG')});

        query.activities.forEach((activity) => {
            activities.table.body.push([activity.name, activity.places, activity.price])
            totalSum += Number(activity.price);
        });

        totalVAT.columns[0].stack.push({ text: 'Всичко без ДДС'});
        totalVAT.columns[1].stack.push({ text: totalSum.toString(10)});
        totalVAT.columns[0].stack.push({ text: 'Всичко с ДДС'});
        totalVAT.columns[1].stack.push({ text: (totalSum * 1.2).toString(10)});

        let madeBy = user.firstName + ' ' + user.lastName;

        let signatures1 = {
            columns:[{
                text: 'Съставил:..............................', style: 'signature'
            },{
                text: 'Съгласувал:..............................', style: 'signature'
            }],
            columnGap: 40,
            margin: [25, 25, 25, 0]
        };

        let signatures2 = {
            columns:[{
                text: madeBy + '          ', style: 'signatureRight'
            },{
                text: 'Хр. Спасов           ', style: 'signatureRight'
            }],
            columnGap: 40,
            margin: [25, 0, 25, 35]
        };

        let signatures3 = {
            columns:[{
                text: 'Съгласувал:..............................', style: 'signature'
            },{
                text: 'Съгласувал:..............................', style: 'signature'
            }],
            columnGap: 40,
            margin: [25, 35, 25, 0]
        };

        let signatures4 = {
            columns:[{
                text: 'Директор Дирекция "Правна"', style: 'signatureRight'
            },{
                text: 'Директор ФСО', style: 'signatureRight'
            }],
            columnGap: 40,
            margin: [25, 0, 25, 35]
        };

        let signatures5 = {
            columns:[{
                text: 'Съгласувал:..............................', style: 'signature'
            },{
                text: 'Съгласувал:..............................', style: 'signature'
            }],
            columnGap: 40,
            margin: [25, 35, 25, 0]
        };

        let signatures6 = {
            columns:[{
                text: 'Вл. Кънчев', style: 'signatureRight'
            },{
                text: 'Вл. Николов', style: 'signatureRight'
            }],
            columnGap: 40,
            margin: [25, 0, 25, 25]
        };

        definition.content.push(activities);
        definition.content.push(totalVAT);
        definition.content.push(contragent);
        definition.content.push(signatures1, signatures2, signatures3, signatures4, signatures5, signatures6);
        definition.content.push({text: dateCreated.toLocaleDateString('bg-BG'), style: 'date', margin: 25});

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
                    totalPrice += Number(item.price);
                });

                return totalPrice * 1.2;
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
            approveQuery: function () {
                this.query.status = 'approved';
                this.updateQuery();
            },
            rejectQuery: function () {
                this.query.status = 'rejected';
                this.updateQuery();
            },
            updateQuery: function () {
                this.$http.put('http://localhost:8080/query/' + this.$route.params.id, {query: this.query}).
                then((response) => {
                    if (response.status !== 200) {
                        this.fetchQuery();
                    }
                })
            },
            fetchQuery: function () {
                this.$http.get('http://localhost:8080/query/' + this.$route.params.id).
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