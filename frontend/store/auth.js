import { defineStore } from 'pinia';
import { AuthClient } from '@dfinity/auth-client';
import { createActor, user_index } from '~/user_index';
import router from '@/router';
import { toRaw } from 'vue';
import { HttpAgent } from '@dfinity/agent';
import { useAssetsStore } from './assets';
import { useQAStore } from './qa';
import { useResponseStore } from '@/store/response';
import { decodeCredential } from 'vue3-google-login';

const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider: process.env.II_URI,
    maxTimeToLive: BigInt(process.env.II_LIFETIME),
  },
};

function createActorFromIdentity(identity) {
  return createActor(process.env.USER_INDEX_CANISTER_ID, {
    agentOptions: {
      identity,
    },
  });
}

export const useAuthStore = defineStore('auth', {
  id: 'auth',
  state: () => {
    return {
      actor: null,
      authClient: null,
      isReady: false,
      isAuthenticated: false,
      identity: null,
      principal: null,
      user: null,
    };
  },
  actions: {
    async init() {
      if (
        localStorage.authenticationProvider !== '' &&
        localStorage.authenticationProvider !== undefined
      ) {
        await this.initWeb2Auth();
      } else {
        await this.initII();
      }

      if (this.isAuthenticated) {
        await this.actor
          ?.findUser(this.getPrincipal)
          .then(async (res) => {
            if (res.length) {
              this.setUser(res[0]);

              await this.initStores();
            } else {
              this.isAuthenticated = false;

              this.setAuthenticationStorage(false);

              await router.push('/login');
            }
          })
          .catch(async () => await this.logout());
      } else {
        await router.push('/login');
      }

      this.isReady = true;
    },
    async initWeb2Auth() {
      this.actor = user_index;

      this.isAuthenticated = true;
      this.principal = localStorage.extraCharacter;

      await this.initStores();
    },
    async initII() {
      const authClient = await AuthClient.create(defaultOptions.createOptions);
      this.authClient = authClient;

      const isAuthenticated = await authClient.isAuthenticated();
      const identity = isAuthenticated ? authClient.getIdentity() : null;
      const agent = identity ? new HttpAgent({ identity }) : null;
      const actor = identity ? createActorFromIdentity(identity) : null;
      const principal = identity ? await agent.getPrincipal() : null;

      this.isAuthenticated = isAuthenticated;
      this.identity = identity;
      this.actor = actor;
      this.principal = principal;
    },
    async initStores() {
      await useQAStore().init();
      await useAssetsStore().init();
      await useResponseStore().init();
    },
    async loginWithII() {
      if (this.authClient === null) {
        await this.initII();
      }

      const authClient = toRaw(this.authClient);

      await authClient.login({
        ...defaultOptions.loginOptions,
        onSuccess: async () => {
          this.isAuthenticated = await authClient.isAuthenticated();
          this.identity = this.isAuthenticated ? authClient.getIdentity() : null;

          const agent = this.identity ? new HttpAgent({ identity: this.identity }) : null;

          this.actor = this.identity ? createActorFromIdentity(this.identity) : null;
          this.principal = this.identity ? await agent.getPrincipal() : null;

          this.setAuthenticationStorage(this.isAuthenticated);

          await this.initStores();

          await router.push('/sign-up');
        },
      });
    },
    async loginWithGoogle(credential) {
      const { email } = decodeCredential(credential);

      this.actor = user_index;

      this.setAuthenticationStorage(true, 'google', email);

      this.principal = localStorage.extraCharacter;
      this.isAuthenticated = localStorage.isAuthenticated = true;

      await this.initStores();

      await router.push('/sign-up');
    },
    async logout() {
      const authClient = toRaw(this.authClient);

      await authClient?.logout();

      this.setAuthenticationStorage(false);

      this.isAuthenticated = false;
      this.identity = this.actor = this.principal = null;

      this.setUser();

      window.location.reload();
    },
    register({ username, fullName }) {
      const provider = localStorage.authenticationProvider;

      return this.actor?.register(
        { username, fullName, provider },
        {
          character: localStorage.extraCharacter,
          identity: process.env.DFX_ASSET_PRINCIPAL,
        },
      );
    },
    setAuthenticationStorage(isAuthenticated, provider = '', character = '') {
      if (isAuthenticated) {
        localStorage.isAuthenticated = isAuthenticated;
        localStorage.extraCharacter = character;
        localStorage.authenticationProvider = provider;
      } else {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('extraCharacter');
        localStorage.removeItem('authenticationProvider');
      }
    },
    setUser(user = null) {
      if (user == null) {
        this.user = null;
      } else {
        const { fullName, provider, username } = user;

        this.user = { fullName, provider, username };
      }
    },
  },
  getters: {
    getIdentity: ({ identity }) => identity,
    getPrincipal: ({ principal }) => localStorage.extraCharacter || principal?.toText() || null,
    getUser: ({ user }) => user,
  },
});
