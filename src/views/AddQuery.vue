<template>
    <v-form v-model="valid">
        <v-card class="ma-5">
            <v-card-title>New Query</v-card-title>
            <v-container>
                <v-row class="mb-6" align="center">
                    <v-col :cols="6">
                        <v-row justify="space-around">
                            <v-checkbox v-model="isRepair"
                                        :label="$t('Repair')">
                            </v-checkbox>
                            <v-checkbox v-model="isSupport"
                                        :label="$t('Support')">
                            </v-checkbox>
                            <v-checkbox v-model="isInvest"
                                        :label="$t('Investment')">
                            </v-checkbox>
                            <v-checkbox v-model="isTransport"
                                        :label="$t('Transport')">
                            </v-checkbox>
                        </v-row>
                        <v-select :items="categories"
                                  v-model="chosenCategories"
                                  :label="$t('Category')">
                        </v-select>
                        <v-text-field v-model="title" :label="$t('Title')"></v-text-field>
                        <v-combobox v-model="contragent"
                                        :items="contragents"
                                        :label="$t('Contractor')">
                        </v-combobox>
                        <v-text-field v-model="reason" :label="$t('Reason')"></v-text-field>
                        <v-menu v-model="menu2"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                        v-model="payDate"
                                        :label="$t('PayDate')"
                                        prepend-icon="mdi-calendar"
                                        v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="payDate" @input="menu2 = false"></v-date-picker>
                        </v-menu>
                        <v-row justify="space-around">
                            <v-radio-group :label="$t('PaymentMethod')" v-model="paymentMethod" row>
                                <v-radio :label="$t('Bank')" value="bank"></v-radio>
                                <v-radio :label="$t('InCash')" value="cash"></v-radio>
                            </v-radio-group>
                            <v-checkbox v-model="isUrgent"
                                        :label="$t('Urgent')">
                            </v-checkbox>
                        </v-row>
                        <v-textarea v-model="notes" height="100" :placeholder="$t('Notes')"></v-textarea>
                    </v-col>
                    <v-col>
                        <v-list>
                            <v-list-item two-line v-for="(activity, index) in activities" :key="index">
                                <v-list-item-content>
                                    <v-list-item-title>{{activity.company}} - {{activity.name}} {{$t('PriceVAT')}}: {{calculateVAT(activity.price)}}</v-list-item-title>
                                    <v-list-item-subtitle>{{activity.places}}</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn-toggle>
                                        <v-btn icon @click="showUpdateActivityDialog(index)">
                                            <v-icon>mdi-square-edit-outline</v-icon>
                                        </v-btn>
                                        <v-btn icon @click="removeActivity(index)">
                                            <v-icon>mdi-trash-can</v-icon>
                                        </v-btn>
                                    </v-btn-toggle>
                                </v-list-item-action>
                            </v-list-item>
                            <v-divider class="mb-6"></v-divider>
                            <v-list-item>
                                {{$t('Total')}} : {{totalPrice}} лв с ДДС
                            </v-list-item>
                        </v-list>

                        <v-dialog v-model="showActivityDialog" width="500">
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on" @click="showAddActivityDialog">{{$t('AddActivity')}}</v-btn>
                            </template>
                            <v-card>
                                <v-card-title>{{$t('AddActivityTitle')}}</v-card-title>
                                <v-card-text>
                                    <v-form v-model="newActivityFormValid">
                                        <v-select required :items="companies" :label="$t('Company')" v-model="newActivity.company"></v-select>
                                        <v-text-field required :label="$t('Title')" v-model="newActivity.name" :rules="itemNameRules"></v-text-field>
                                        <v-text-field required :label="$t('Price')" type="number" v-model="newActivity.price"></v-text-field>
                                        <v-checkbox required :label="$t('VATIncluded')" v-model="newActivity.priceVAT"></v-checkbox>
                                        <v-text-field required :label="$t('Places')" v-model="newActivity.places"></v-text-field>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" v-if="showAddButton" @click="addActivity" :disabled="!newActivityFormValid">{{$t('Add')}}</v-btn>
                                    <v-btn text color="primary" v-else-if="showUpdateButton" @click="updateActivity" :disabled="!newActivityFormValid">{{$t('Save')}}</v-btn>
                                    <v-btn text color="primary" @click="closeActivityDialog">{{$t('Cancel')}}</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="ma-2" tile color="indigo" dark v-if="showCreateButton" @click="saveQuery" large>{{$t('Create')}}</v-btn>
                <v-btn class="ma-2" tile color="indigo" dark v-else @click="redactQuery" large>{{$t('Save')}}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>
    import {all, create} from 'mathjs'

    const math = create(all);

    function constructQueryObject(type, category, title, activities, contractor, reason, paymentMethod, isUrgent, status) {
        return Object({
            type: type,
            category: category,
            title: title,
            activities: activities,
            contractor: contractor,
            reason: reason,
            paymentMethod: paymentMethod,
            isUrgent: isUrgent,
            status: status });
    }

    export default {
        name: "AddQuery",
        data: function () {
            return {
                valid: false,
                activities: [],
                companies: ['ВАН Холдинг', 'Винтерко', 'Европа ВН', 'ЕвроХарт'],
                categories: ['Auto', 'Clima', 'Resources', 'Kitchenware'],
                chosenCategories: null,
                title: '',
                contragent: '',
                reason: '',
                paymentMethod: 'bank',
                isRepair: false,
                isSupport: false,
                isInvest: false,
                isTransport: false,
                isUrgent: false,
                payDate: null,
                menu2: false,
                contragents: [],
                notes: '',
                templateQuery: {},
                newActivity: {},
                newActivityFormValid: false,
                updateActivityIndex: null,
                itemNameRules: [
                    v => !!v || 'Name is required'
                ],
                showActivityDialog: false,
                showAddButton: false,
                showUpdateButton: false,
                showCreateButton: true,
            }
        },
        computed: {
            totalPrice: function () {
                let totalPrice = 0;

                this.activities.forEach((item) => {
                    totalPrice += this.calculateVAT(item.price);
                });

                return math.round(totalPrice, 2);
            },
            type: function () {
                let type = [];

                if(this.isRepair)
                    type.push('Repair');

                if(this.isSupport)
                    type.push('Support');

                if(this.isInvest)
                    type.push('Invest');

                if(this.isTransport)
                    type.push('Transport');

                return type;
            }
        },
        methods: {
            initNewActivity: function () {
                this.newActivity.name = '';
                this.newActivity.price = 0;
                this.newActivity.places = '';
                this.newActivity.company = '';
                this.newActivity.priceVAT = false;
            },
            addActivity: function () {
                let price = this.newActivity.priceVAT ? this.newActivity.price * 0.83 : this.newActivity.price;
                this.activities.push({company: this.newActivity.company, name: this.newActivity.name, price: Number(price), places: this.newActivity.places});
                this.closeActivityDialog();
            },
            removeActivity: function (index) {
                this.activities.splice(index, 1);
            },
            updateActivity: function () {
                this.newActivity.price = Number(this.newActivity.priceVAT ? this.newActivity.price * 0.83 : this.newActivity.price);
                this.activities.splice(this.updateActivityIndex, 1, Object.assign({}, this.newActivity));
                this.closeActivityDialog();
            },
            showAddActivityDialog: function() {
                this.newActivity = Object.assign({}, {});
                this.showAddButton = true;
                this.showActivityDialog = true;
            },
            showUpdateActivityDialog: function (index) {
                this.newActivity = Object.assign({}, this.activities[index]);
                this.updateActivityIndex = index;
                this.showActivityDialog = true;
                this.showUpdateButton = true;
            },
            closeActivityDialog: function () {
                this.showActivityDialog = false;
                this.showAddButton = false;
                this.showUpdateButton = false;
                this.initNewActivity();
            },
            calculateVAT: function (price) {
                let priceVAT = math.multiply(price, 1.2);
                return math.round(priceVAT, 2);
            },
            calculateNextPayDate: function() {
                let payDateValue = this.$moment();
                payDateValue.week(payDateValue.week()+1);
                payDateValue.isoWeekday(4);
                this.payDate = payDateValue.format('YYYY-MM-DD');
            },
            saveQuery: function () {
                let query = constructQueryObject(this.type, this.chosenCategories, this.title, this.activities, this.contragent, this.reason, this.paymentMethod, this.isUrgent, 'approved');
                query.payDate = this.payDate;
                query.dateCreated = new Date().toISOString().substr(0, 10);
                this.axios.post('/api/query', query).
                then(() => {
                    this.$router.push({name: 'Queries'});
                });
            },
            redactQuery: function () {
                this.$http.get('/api/query/' + this.$route.params.templateQueryId).
                then((response) => {
                    if(response.data.totalSum <= this.totalPrice) {
                        let query = constructQueryObject(this.type, this.chosenCategories, this.title, this.activities, this.contragent, this.reason, this.paymentMethod, this.isUrgent, 'approved');
                        let payDate = this.$moment(response.data.payDate);
                        payDate.week(payDate.week() + 1);
                        query.payDate = payDate.format('YYYY-MM-DD');
                        query.dateCreated = response.data.dateCreated;
                        this.$http.put('/api/query/' + this.$route.params.templateQueryId, query).
                        then(() => this.$router.push({ name: 'Queries' }));
                    }
                    else {
                        this.calculateNextPayDate();
                        this.saveQuery();
                    }
                });
            }
        },
        created: function () {
            this.calculateNextPayDate();
            this.initNewActivity();
        },
        mounted: function () {
            if(this.$route.params.templateQueryId) {
                this.$http.get('/api/query/' + this.$route.params.templateQueryId).
                then((response) => {
                    this.isSupport = response.data.type.findIndex((type) => type === 'Support') !== -1;
                    this.isRepair = response.data.type.findIndex((type) => type === 'Repair') !== -1;
                    this.isInvest = response.data.type.findIndex((type) => type === 'Invest') !== -1;
                    this.isTransport = response.data.type.findIndex((type) => type === 'Transport') !== -1;
                    this.chosenCategories = response.data.category;
                    this.title = response.data.title;
                    this.contragent = response.data.contractor;
                    this.reason = response.data.reason;
                    this.activities = response.data.activities;
                    this.isUrgent = response.data.isUrgent;

                    this.templateQuery = response.data;

                    if(this.$route.params.wasRejected) {
                        this.showCreateButton = false;
                        this.payDate = response.data.payDate;
                    }
                }).
                catch(() => {
                    this.error = true;
                }).
                finally(() => {
                    this.showProgressBar = false;
                });
            }
            this.$http.get('/api/contragents').then((response) => {
                this.contragents = response.data;
            });
        }
    }
</script>

<style scoped>

</style>