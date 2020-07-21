<template>
    <v-form v-model="valid" ref="addForm">
        <v-card class="ma-5">
            <v-card-title>{{$t('NewQuery')}}</v-card-title>
            <v-container>
                <v-row class="mb-6" align="center">
                    <v-col :cols="6">
                        <v-chip-group multiple active-class="primary--text" v-model="type">
                            <v-chip :value="'Repair'">{{$t('Repair')}}</v-chip>
                            <v-chip :value="'Support'">{{$t('Support')}}</v-chip>
                            <v-chip :value="'Investment'">{{$t('Investment')}}</v-chip>
                            <v-chip :value="'Transport'">{{$t('Transport')}}</v-chip>
                        </v-chip-group>
                        <v-combobox v-model="category"
                                    :items="categories"
                                    :label="$t('Category')"
                                    :error-messages="categoryErrors"
                                    @input="$v.category.$touch()"
                                    @blur="$v.category.$touch()">
                        </v-combobox>
                        <v-text-field v-model="title"
                                      :label="$t('Title')"
                                      :error-messages="titleErrors"
                                      @input="$v.title.$touch()"
                                      @blur="$v.title.$touch()"></v-text-field>
                        <v-combobox v-model="contragent"
                                        :items="contragents"
                                        :label="$t('Contractor')"
                                        :error-messages="contragentErrors"
                                        @input="$v.contragent.$touch()"
                                        @blur="$v.contragent.$touch()">
                        </v-combobox>
                        <v-text-field v-model="reason"
                                      :label="$t('Reason')"
                                      :error-messages="reasonErrors"
                                      @input="$v.reason.$touch()"
                                      @blur="$v.reason.$touch()"></v-text-field>
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
                    <v-col :cols="6">
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
                                {{$t('Total')}}: {{totalPrice}} лв. с ДДС
                            </v-list-item>
                        </v-list>
                        <v-dialog v-model="showActivityDialog" width="500">
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on" @click="showAddActivityDialog">{{$t('AddActivity')}}</v-btn>
                            </template>
                            <v-card>
                                <v-card-title>{{$t('AddActivityTitle')}}</v-card-title>
                                <v-card-text>
                                    <v-form v-model="newActivityFormValid" ref="activityForm">
                                        <v-select :items="companies" :label="$t('Company')" v-model="newActivity.company"></v-select>
                                        <v-text-field :label="$t('Title')" v-model="newActivity.name"></v-text-field>
                                        <v-text-field :label="$t('Price')" type="number" v-model="newActivity.price"></v-text-field>
                                        <v-checkbox :label="$t('VATIncluded')" v-model="newActivity.priceVAT"></v-checkbox>
                                        <v-text-field :label="$t('Places')" v-model="newActivity.places"></v-text-field>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" v-if="showAddButton" @click="addActivity" :disabled="!newActivityFormValid">{{$t('Add')}}</v-btn>
                                    <v-btn text color="primary" v-else @click="updateActivity" :disabled="!newActivityFormValid">{{$t('Save')}}</v-btn>
                                    <v-btn text color="primary" @click="closeActivityDialog">{{$t('Cancel')}}</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn large
                       color="primary"
                       v-if="!$route.params.edit"
                       :disabled="!valid || activities.length === 0 || type.length === 0"
                       @click="saveQuery">
                    {{$t('Create')}}
                </v-btn>
                <v-btn large
                       color="primary"
                       v-else
                       :disabled="!valid || activities.length === 0  || type.length === 0"
                       @click="redactQuery">
                    {{$t('Save')}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>
    import { all, create } from 'mathjs'
    import { required, minLength, maxLength } from 'vuelidate/lib/validators'

    const math = create(all);

    function constructQueryObject(type, category, title, activities, contractor, reason, paymentMethod, isUrgent, notes, status) {
        return Object({
            type: type,
            category: category,
            title: title,
            activities: activities,
            contractor: contractor,
            reason: reason,
            paymentMethod: paymentMethod,
            isUrgent: isUrgent,
            notes: notes,
            status: status });
    }

    export default {
        name: "AddQuery",
        data: function () {
            return {
                valid: true,
                activities: [],
                companies: ['ВАН Холдинг', 'Винтерко-БГ', 'Европа-ВН', 'ЕвроХарт'],
                categories: [],
                type: [],
                category: '',
                title: '',
                contragent: '',
                reason: '',
                status: '',
                paymentMethod: 'bank',
                isRepair: false,
                isSupport: false,
                isInvest: false,
                isTransport: false,
                isUrgent: false,
                payDate: null,
                dateCreated: null,
                menu2: false,
                contragents: [],
                notes: '',
                newActivity: {},
                newActivityFormValid: false,
                updateActivityIndex: null,
                showActivityDialog: false,
                showAddButton: false
            }
        },
        validations: {
            category: {
                required,
                minLength: minLength(3)
            },
            title: {
                required,
                minLength: minLength(4),
                maxLength: maxLength(56)
            },
            contragent: {
                required,
                minLength: minLength(6)
            },
            reason: {
                required,
                minLength: minLength(10),
                maxLength: maxLength(30)
            },
            newActivity: {
                name: {
                    required,
                    minLength: minLength(3),
                    maxLength: maxLength(50)
                },
                price: {
                    required
                },
                company: {
                    required
                }
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
            titleErrors: function () {
                const errors = [];
                if (!this.$v.title.$dirty)
                    return errors;
                !this.$v.title.required && errors.push(this.$t('TitleRequired'));
                !this.$v.title.maxLength && errors.push(this.$t('TitleTooLong'));
                return errors;
            },
            categoryErrors: function () {
                const errors = [];
                if (!this.$v.category.$dirty)
                    return errors;
                !this.$v.category.required && errors.push(this.$t('CategoryRequired'));
                return errors;
            },
            contragentErrors: function () {
                const errors = [];
                if (!this.$v.contragent.$dirty)
                    return errors;
                !this.$v.contragent.required && errors.push(this.$t('ContragentRequired'));
                return errors;
            },
            reasonErrors: function () {
                const errors = [];
                if (!this.$v.reason.$dirty)
                    return errors;
                !this.$v.reason.required && errors.push(this.$t('ReasonRequired'));
                !this.$v.reason.maxLength && errors.push(this.$t('ReasonTooLong'));
                return errors;
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
                let price = 0;

                if (this.newActivity.priceVAT) {
                    price = math.chain(this.newActivity.price).divide(1.2).round(2).done();
                }
                else {
                    price = Number(this.newActivity.price);
                }

                this.activities.push({company: this.newActivity.company, name: this.newActivity.name, price: price, places: this.newActivity.places});
                this.closeActivityDialog();
            },
            removeActivity: function (index) {
                this.activities.splice(index, 1);
            },
            updateActivity: function () {
                if (this.newActivity.priceVAT) {
                    this.newActivity.price = math.chain(this.newActivity.price).divide(1.2).round(2).done();
                }
                else {
                    this.newActivity.price = Number(this.newActivity.price);
                }

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
                payDateValue.week(payDateValue.week() + (payDateValue.isoWeekday() < 4 ? 1 : 2));
                payDateValue.isoWeekday(4);
                this.payDate = payDateValue.format('YYYY-MM-DD');
            },
            saveQuery: function () {
                let query = constructQueryObject(this.type, this.category, this.title, this.activities, this.contragent, this.reason, this.paymentMethod, this.isUrgent, this.notes,'approved');
                query.payDate = this.payDate;
                query.dateCreated = new Date().toISOString().substr(0, 10);
                query.createdBy = this.$store.state.user._id;
                this.$http.post('/query', query).
                then(() => {
                    this.$router.push({name: 'Queries'});
                });
            },
            redactQuery: function () {
                let query = constructQueryObject(this.type, this.category, this.title, this.activities, this.contragent, this.reason, this.paymentMethod, this.isUrgent, this.notes, 'approved');
                query.dateCreated = this.dateCreated;
                query.createdBy = this.$store.state.user._id;
                let payDate = this.$moment(this.payDate);
                payDate.week(payDate.week() + (this.status === 'rejected' ? 1 : 0));
                query.payDate = payDate.format('YYYY-MM-DD');
                this.$http.put('/query/' + this.$route.params.templateQueryId, query).
                then(() => this.$router.push({ name: 'Queries' }));
            }
        },
        created: function () {
            this.calculateNextPayDate();
            this.initNewActivity();
        },
        mounted: function () {
            this.$http.get('/contragents').then((response) => {
                this.contragents = response.data;
            });
            this.$http.get('/categories').then((response) => {
                this.categories = response.data;
            });
            if(this.$route.params.templateQueryId) {
                this.$http.get('/query/' + this.$route.params.templateQueryId).
                then((response) => {
                    this.type = response.data.type;
                    this.category = response.data.category;
                    this.title = response.data.title;
                    this.contragent = response.data.contractor;
                    this.reason = response.data.reason;
                    this.activities = response.data.activities;
                    this.isUrgent = response.data.isUrgent;
                    this.notes = response.data.notes;

                    if(this.$route.params.edit) {
                        this.payDate = response.data.payDate;
                        this.dateCreated = response.data.dateCreated;
                        this.status = response.data.status;
                    }
                }).
                catch(() => {
                    this.error = true;
                }).
                finally(() => {
                    this.showProgressBar = false;
                });
            }
        }
    }
</script>

<style scoped>

</style>