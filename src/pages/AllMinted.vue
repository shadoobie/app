<template>

    <div>
        <h6>All Minted</h6>

        <CryptoAuth v-if="!connected" @loaded="providerLoaded" ref="cryptoAuth"/>

        <q-toggle label="Show yours only" v-model="yours" v-if="connected" />

        <div class="rounded-borders q-pa-md q-my-md bg-light-blue-1 q-card--bordered" v-if="loaded">
            <q-icon size="20px" name="info" color="primary" />Move mouse over to preload thumbs. Click to go to the watch page
        </div>

        <div class="q-pa-md row items-start q-gutter-md">
            <q-card v-if="loading" class="q-card my-card">
                <q-img fit="cover" :ratio="16/9">
                <div class="absolute-bottom text-subtitle2 text-center token_address">
                    Loading...
                </div>
                </q-img>
            </q-card>

            <q-card v-for="token in tokens" v-bind:key="token" class="q-card my-card">
                <MintedToken :token="token"/>
            </q-card>
        </div>

    </div>

</template>

<script>
import { mapGetters } from 'vuex';
import MintedToken from '../components/MintedToken';
import CryptoAuth from '../components/CryptoAuth';

export default {
	name: 'All Minted',
    path: '/allminted',
    title: 'Minted NFTs',
    authRequired: false,
	props: {
	},
    components: {
        MintedToken,
        CryptoAuth,
    },
	data() {
		return {

			isActive: false,
            tokens: [],

            loaded: false,
            loading: false,
            connected: false,

            yours: false,
		}
	},
    watch: {
        blockchainSession: function() {
            this.checkTheBlockchain();
        },
        yours: function() {
            this.tokens = [];
            this.checkTheBlockchain();
        },
    },
	methods: {
        queryTheProvider: async function(provider) {
            this.loading = true;

            const data = await provider.getAllTokens({
                    mintedByConnected: this.yours,
                    allContracts: true,
                });

            if (data.tokens) {
                this.tokens = data.tokens;
            }

            this.loaded = true;
            this.loading = false;


            // await provider.estimateGas({uluna: 1000000, instructions: {"ask_for_key":{"media": "Qme5WuoHFFfvWcbs7SVDuwEvCX5QVdhqZKbbXgEAwZUgqj", "key": "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest"}}});

        },
        providerLoaded: function(provider) {
            this.queryTheProvider(provider);
        },
        checkTheBlockchain: async function() {
            const blockchainProvider = this.$store.getters['blockchain/provider'];
            if (blockchainProvider) {
                this.connected = true;

                await this.queryTheProvider(blockchainProvider);
                // this.loading = true;

                // const data = await blockchainProvider.getAllTokens(this.yours);
                // if (data.tokens) {
                //     this.tokens = data.tokens;
                // }

                // this.loaded = true;
                // this.loading = false;
                //
                return true;
            }

            return false;
        }
	},
    mounted() {
        this.checkTheBlockchain()
            .then((success)=>{
                if (!success) {
                    this.$refs.cryptoAuth.requestTerra();
                }
            });
    },
    computed: {
        ...mapGetters({
            // map `this.doneCount` to `this.$store.getters.doneTodosCount`
            blockchainSession: 'blockchain/sessionId'
        }),
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

