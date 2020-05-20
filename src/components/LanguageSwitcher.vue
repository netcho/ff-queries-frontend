<template>
    <div class="text-center">
        <v-menu offset-y>
            <template v-slot:activator="{ on }">
                <v-btn rounded depressed v-on="on">
                    <v-icon>mdi-earth</v-icon>
                    {{$i18n.locale}}
                </v-btn>
            </template>
            <v-list>
                <v-list-item v-for="language in languages" :key="language" @click="changeLanguage(language)">
                    {{ language }}
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
    import { loadLanguageAsync } from "@/plugins/i18n";

    export default {
        name: "LanguageSwitcher",
        data: () => ({ languages: [ 'en', 'bg' ]}),
        methods: {
            changeLanguage: function (language) {
                loadLanguageAsync(language)
            }
        }
    }
</script>

<style scoped>

</style>