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
                        <v-select :items="companies"
                                  multiple
                                  v-model="chosenCompanies"
                                  label="Company">
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
                        <v-textarea v-model="notes" height="100" placeholder="Notes"></v-textarea>
                    </v-col>
                    <v-col>
                        <v-list>
                            <v-list-item two-line v-for="item in activities" :key="item.name+item.price">
                                <v-list-item-content>
                                    <v-list-item-title>{{item.name}} Price with VAT: {{item.price * 1.2}}</v-list-item-title>
                                    <v-list-item-subtitle>{{item.places}}</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn-toggle>
                                        <v-btn icon @click="showUpdateActivityDialog(item)">
                                            <v-icon>mdi-square-edit-outline</v-icon>
                                        </v-btn>
                                        <v-btn icon @click="removeActivity(item)">
                                            <v-icon>mdi-minus</v-icon>
                                        </v-btn>
                                    </v-btn-toggle>
                                </v-list-item-action>
                            </v-list-item>
                            <v-divider class="mb-6"></v-divider>
                            <v-list-item>
                                Total : {{totalPrice}}
                            </v-list-item>
                        </v-list>

                        <v-dialog v-model="showAddDialog" width="500">
                            <template v-slot:activator="{ on }">
                                <v-btn v-on="on">Add Item</v-btn>
                            </template>
                            <v-card>
                                <v-card-title>Add Activity to the query</v-card-title>
                                <v-card-text>
                                    <v-form v-model="newActivityFormValid">
                                        <v-text-field required label="Name" v-model="newActivity.name" :rules="itemNameRules"></v-text-field>
                                        <v-text-field required label="Price" type="number" v-model="newActivity.price"></v-text-field>
                                        <v-checkbox required label="VAT Included" v-model="newActivity.priceVAT"></v-checkbox>
                                        <v-text-field required label="Places" v-model="newActivity.places"></v-text-field>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="addNewActivity" :disabled="!newActivityFormValid">Save</v-btn>
                                    <v-btn text color="primary" @click="showAddDialog = false">Cancel</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                        <v-dialog v-model="showUpdatePrice" width="200">
                            <v-card>
                                <v-card-title>Update Activity Price</v-card-title>
                                <v-card-text>
                                    <v-form v-model="updateActivityPriceFormValid">
                                        <v-text-field required label="Price" type="number" v-model="updateActivityPrice"></v-text-field>
                                        <v-checkbox required label="VAT Included" v-model="updateActivityPriceVAT"></v-checkbox>
                                    </v-form>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn text color="primary" @click="saveActivityPrice" :disabled="!updateActivityPriceFormValid">Save</v-btn>
                                    <v-btn text color="primary" @click="showUpdatePrice = false">Cancel</v-btn>
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
                showAddDialog: false,
                showUpdatePrice: false,
                newActivity: {
                    name: '',
                    price: 0,
                    priceVAT: false,
                    places: ''
                },
                newActivityFormValid: false,
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
                selectedActivity: null,
                updateActivityPrice: 0,
                updateActivityPriceVAT: false,
                updateActivityPriceFormValid: false,
                notes: ''
            }
        },
        computed: {
            totalPrice: function () {
                let totalPrice = 0;

                this.activities.forEach((item) => {
                    totalPrice += Number(item.price);
                });

                return totalPrice * 1.2;
            }
        },
        methods: {
            addNewActivity: function () {
                let price = this.newActivity.priceVAT ? this.newActivity.price * 0.8 : this.newActivity.price;
                this.activities.push({name: this.newActivity.name, price: price, places: this.newActivity.places});
                this.newActivity.name = '';
                this.newActivity.price = 0;
                this.newActivity.places = '';
                this.showAddDialog = false;
            },
            removeActivity: function (activity) {
                let activityIndex = this.activities.findIndex((item) => {
                    return activity.name === item.name;
                });

                if (activityIndex !== -1) {
                    this.activities.splice(activityIndex, 1);
                }
            },
            showUpdateActivityDialog: function (activity) {
                this.selectedActivity = activity;
                this.updateActivityPrice = activity.price;
                this.showUpdatePrice = true;
            },
            saveActivityPrice: function () {
                let newPrice = this.updateActivityPriceVAT ? this.updateActivityPriceFormValid * 0.8 : this.updateActivityPrice;
                let activityIndex = this.activities.findIndex((activity) => {
                   return this.selectedActivity.name === activity.name;
                });

                if (activityIndex !== -1) {
                    this.activities[activityIndex].price = newPrice;
                }

                this.showUpdatePrice = false;
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
                                                                            companies: this.chosenCompanies,
                                                                            activities: this.activities,
                                                                            contractor: this.contragent,
                                                                            reason: this.reason,
                                                                            title: this.title,
                                                                            dateCreated: new Date().toISOString().substr(0, 10),
                                                                            payDate: this.payDate,
                                                                            status: 'pending' }).
                then(() => {
                    return this.$router.push({name: 'Queries'});
                }).
                then(() => {
                    this.$toast.show('Created Query');
                });
            }
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