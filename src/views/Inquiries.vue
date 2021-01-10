<template>
    <v-container class="pt-5">
        <v-card>
            <v-card-text>
                <v-row>
                    <v-col cols="3">
                        <v-menu v-model="showStartPicker"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                class="ml-2 mr-2"
                                transition="scale-transition"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        v-model="startDate"
                                        :label="$t('StartDate')"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="startDate"
                                    @input="showStartPicker = false"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col cols="3">
                        <v-menu v-model="showEndPicker"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                transition="scale-transition"
                                class="ml-2 mr-2"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                        v-model="endDate"
                                        :label="$t('EndDate')"
                                        prepend-icon="mdi-calendar"
                                        readonly
                                        v-bind="attrs"
                                        v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                    v-model="endDate"
                                    @input="showEndPicker = false"
                            ></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-row class="mt-4 ml-5">
                        <v-checkbox v-model="showInvestments" :label="$t('Investments')" class="ml-2 mr-2"></v-checkbox>
                        <v-checkbox v-model="showRepairs" :label="$t('Repairs')" class="ml-2 mr-2"></v-checkbox>
                        <v-checkbox v-model="showSupport" :label="$t('Support')" class="ml-2 mr-2"></v-checkbox>
                        <v-checkbox v-model="showTransport" :label="$t('Transport')" class="ml-2 mr-2"></v-checkbox>
                    </v-row>
                </v-row>
                <v-row>
                    <v-col cols="4">
                        <v-autocomplete v-model="selectedCategories"
                                        clearable
                                        multiple
                                        :items="categories"
                                        item-value="subcode"
                                        item-text="name"
                                        :label="$t('Categories')">
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="4">
                        <v-autocomplete v-model="selectedCompanies"
                                        clearable
                                        multiple
                                        :items="companies"
                                        :label="$t('Companies')">
                        </v-autocomplete>
                    </v-col>
                </v-row>
                <v-data-table :headers="tableHeaders"
                              :items="entries">
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script>
    import moment from 'moment';

    export default {
        name: "Inquiries",
        data: function () {
            return {
                entries: [],
                companies: [],
                selectedCompanies: [],
                categories: [],
                selectedCategories: [],
                startDate: "",
                endDate: "",
                showStartPicker: false,
                showEndPicker: false,
                showInvestments: true,
                showRepairs: true,
                showSupport: true,
                showTransport: true
            }
        },
        computed: {
            tableHeaders: function () {
                let result = [{ text: this.$t('Company'), value: '_id' }];

                if (this.showInvestments) {
                    result.push({ text: this.$t('Investments'), value: 'investmentSum' });
                }

                if (this.showRepairs) {
                    result.push({ text: this.$t('Repairs'), value: 'repairsSum' });
                }

                if (this.showSupport) {
                    result.push({ text: this.$t('Support'), value: 'supportSum' });
                }

                if (this.showTransport) {
                    result.push({ text: this.$t('Transport'), value: 'transportSum' });
                }

                return result;
            }
        },
        watch: {
            startDate: function () {
                this.updateEntries();
            },
            endDate: function () {
                this.updateEntries();
            },
            selectedCompanies: function () {
                this.updateEntries();
            },
            selectedCategories: function () {
                this.updateEntries();
            }
        },
        methods: {
            updateEntries: function () {
                let queryParams = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    types: [],
                    companies: [],
                    categorySubcodes: []
                };

                if (this.showInvestments) {
                    queryParams.types.push('Investment');
                }

                if (this.showRepairs) {
                    queryParams.types.push('Repair');
                }

                if (this.showSupport) {
                    queryParams.types.push('Support');
                }

                if (this.showTransport) {
                    queryParams.types.push('Transport');
                }

                if (this.selectedCompanies.length !== 0) {
                    queryParams.companies = this.selectedCompanies;
                }

                if (this.selectedCategories.length !== 0) {
                    queryParams.categorySubcodes = this.selectedCategories;
                }

                this.$http.get('/inquiry', {
                    params: queryParams
                }).then((response) => {
                   this.entries = response.data;
                });
            }
        },
        mounted: function () {
            this.startDate = moment().date(1).format('YYYY-MM-DD');
            this.endDate = moment().date(31).format('YYYY-MM-DD');
            this.$http.get('/contragents').then((response) => {
                this.companies = response.data;
            });
            this.$http.get('/categories').then((response) => {
                this.categories = response.data;
            });
            this.updateEntries();
        }
    }
</script>

<style scoped>

</style>
