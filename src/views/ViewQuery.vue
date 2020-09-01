<template>
    <v-container class="pt-5">
        <section v-if="error">
            {{$t('ErrorOnLoad')}}
        </section>
        <section v-else>
            <v-progress-circular indeterminate color="primary" v-if="showProgressBar"></v-progress-circular>
            <v-card class="mx-auto" max-width="800" v-else>
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
                            <v-list-item @click="rejectQuery" v-if="$can('update', 'Query')">
                                <v-list-item-title><v-icon>mdi-file-excel</v-icon>{{$t('Reject')}}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="redactQuery" v-if="$can('update', 'Query')">
                                <v-list-item-title><v-icon>mdi-file-document-edit</v-icon>{{$t('Edit')}}</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="deleteQuery">
                                <v-list-item-title><v-icon>mdi-trash-can</v-icon>{{$t('Delete')}}</v-list-item-title>
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
                        <v-list-item-subtitle class="text-right">
                            {{ translateType() }}
                        </v-list-item-subtitle>
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
                                <v-list-item-title>
                                    {{index + 1}}. {{activity.company}} - {{activity.name}} {{$t('PriceVAT')}}: {{ calculateVAT(activity.price) }}
                                </v-list-item-title>
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
    import {all, create} from 'mathjs'

    const math = create(all);

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
            translateType: function () {
                let type = '';

                this.query.type.forEach((elem, index, array) => {
                    if( index > 0 && index < array.length) {
                        type += ', ';
                    }

                    type += this.$t(elem);
                });

                return type;
            },
            rejectQuery: function () {
                this.query.status = 'rejected';
                delete this.query._id;
                this.$http.put('/query/' + this.$route.params.id, this.query).
                then((response) => {
                    if (response.status !== 200) {
                        this.fetchQuery();
                    }
                })
            },
            redactQuery: function () {
                this.$router.push({ name: 'AddQuery', params: { templateQueryId: this.$route.params.id, edit: true} });
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
            },
            deleteQuery: function () {
                this.$dialog.confirm({ text: this.$t('DeleteConfirm'), title: this.$t('DeleteQueryTitle')}).
                then(() => {
                    return this.$http.delete('/query/' + this.query._id);
                }).
                then(() => {
                    return this.$router.push({ name: 'Queries' });
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