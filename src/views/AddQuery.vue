<template>
    <v-form v-model="valid">
        <v-card class="ma-5">
            <v-card-title>New Query</v-card-title>
            <v-container>
                <v-row class="mb-6" align="center">
                    <v-col :cols="6">
                        <v-row justify="space-around">
                            <v-checkbox v-model="isRepair"
                                        :label="`Repair`"
                            ></v-checkbox>
                            <v-checkbox v-model="isSupport"
                                        :label="`Support`"></v-checkbox>
                            <v-checkbox v-model="isInvest"
                                        :label="`Investment`">
                            </v-checkbox>
                        </v-row>
                        <v-select :items="categories"
                                  v-model="chosenCategories"
                                  label="Category">
                        </v-select>
                        <v-text-field v-model="title" label="Title"></v-text-field>
                        <v-combobox v-model="contragent"
                                        :items="contragents"
                                        label="Contragent">
                        </v-combobox>
                        <v-text-field v-model="reason" label="Reason"></v-text-field>

                        <v-menu v-model="menu2"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                offset-y
                                min-width="290px">
                            <template v-slot:activator="{ on }">
                                <v-text-field
                                        v-model="payDate"
                                        label="Date of payment"
                                        prepend-icon="mdi-calendar"
                                        v-on="on">
                                </v-text-field>
                            </template>
                            <v-date-picker v-model="payDate" @input="menu2 = false"></v-date-picker>
                        </v-menu>
                        <v-radio-group label="Payment method" v-model="paymentMethod" row>
                            <v-radio label="Bank" value="bank"></v-radio>
                            <v-radio label="In cash" value="cash"></v-radio>
                        </v-radio-group>
                        <v-textarea v-model="notes" height="100" placeholder="Notes"></v-textarea>
                    </v-col>
                    <v-col>
                        <v-list>
                            <v-list-item two-line v-for="(activity, index) in activities" :key="index">
                                <v-list-item-content>
                                    <v-list-item-title>{{activity.company}} - {{activity.name}} price with VAT: {{calculateVAT(activity.price)}}</v-list-item-title>
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
                                Total : {{totalPrice}}
                            </v-list-item>
                        </v-list>

                        <v-dialog v-model="showActivityDialog" width="500">
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on" @click="showAddButton = true">Add Item</v-btn>
                            </template>
                            <v-card>
                                <v-card-title>Add Activity to the query</v-card-title>
                                <v-card-text>
                                    <v-form v-model="newActivityFormValid">
                                        <v-select required :items="companies" v-model="newActivity.company" label="Company"></v-select>
                                        <v-text-field required label="Name" v-model="newActivity.name" :rules="itemNameRules"></v-text-field>
                                        <v-text-field required label="Price" type="number" v-model="newActivity.price"></v-text-field>
                                        <v-checkbox required label="VAT Included" v-model="newActivity.priceVAT"></v-checkbox>
                                        <v-text-field required label="Places" v-model="newActivity.places"></v-text-field>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" v-if="showAddButton" @click="addActivity" :disabled="!newActivityFormValid">Add</v-btn>
                                    <v-btn text color="primary" v-else-if="showUpdateButton" @click="updateActivity" :disabled="!newActivityFormValid">Save</v-btn>
                                    <v-btn text color="primary" @click="closeActivityDialog">Cancel</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-col>
                </v-row>
            </v-container>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn class="ma-2" tile color="indigo" dark @click="saveQuery" large>Create</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>
    import {all, create} from 'mathjs'

    const math = create(all);

    export default {
        name: "AddQuery",
        data: function () {
            return {
                valid: false,
                companies: ['Van Holding', 'Vinterko', 'Evropa VN'],
                categories: ['Auto', 'Clima', 'Resources', 'Kitchenware'],
                chosenCompanies: [],
                chosenCategories: null,
                activities: [],
                contragent: '',
                reason: '',
                paymentMethod: 'bank',
                showActivityDialog: false,
                showAddButton: false,
                showUpdateButton: false,
                newActivity: {},
                newActivityFormValid: false,
                updateActivityIndex: null,
                itemNameRules: [
                    v => !!v || 'Name is required'
                ],
                isRepair: false,
                isSupport: false,
                isInvest: false,
                title: '',
                payDate: new Date().toISOString().substr(0, 10),
                menu2: false,
                contragents: [],
                notes: ''
            }
        },
        computed: {
            totalPrice: function () {
                let totalPrice = 0;

                this.activities.forEach((item) => {
                    totalPrice += this.calculateVAT(item.price);
                });

                return math.round(totalPrice, 2);
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
            saveQuery: function () {
                let type = [];

                if(this.isRepair)
                    type.push('Repair');

                if(this.isSupport)
                    type.push('Support');

                if(this.isInvest)
                    type.push('Invest');

                this.axios.post('http://localhost:8080/query', { type: type,
                                                                            category: this.chosenCategories,
                                                                            title: this.title,
                                                                            activities: this.activities,
                                                                            contractor: this.contragent,
                                                                            reason: this.reason,
                                                                            payDate: this.payDate,
                                                                            paymentMethod: this.paymentMethod,
                                                                            dateCreated: new Date().toISOString().substr(0, 10),
                                                                            status: 'approved' }).
                then(() => {
                    return this.$router.push({name: 'Queries'});
                }).
                then(() => {
                    this.$toast.show('Created Query');
                });
            }
        },
        create: function () {
            this.initNewActivity();
        },
        mounted: function () {
            if(this.$route.params.templateQueryId) {
                this.$http.get('http://localhost:8080/query/' + this.$route.params.templateQueryId).
                then((response) => {
                    this.isSupport = response.data.type.findIndex((type) => type === 'Support') !== -1;
                    this.isRepair = response.data.type.findIndex((type) => type === 'Repair') !== -1;
                    this.isInvest = response.data.type.findIndex((type) => type === 'Invest') !== -1;
                    this.chosenCompanies = response.data.companies;
                    this.chosenCategories = response.data.category;
                    this.title = response.data.title;
                    this.contragent = response.data.contractor;
                    this.reason = response.data.reason;
                    this.activities = response.data.activities;

                    this.query = response.data;
                }).
                catch(() => {
                    this.error = true;
                }).
                finally(() => {
                    this.showProgressBar = false;
                });
            }
            this.$http.get('http://localhost:8080/contragents').then((response) => {
                this.contragents = response.data;
            });
        }
    }
</script>

<style scoped>

</style>