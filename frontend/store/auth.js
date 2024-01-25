import { defineStore } from 'pinia';
import { AuthClient } from '@dfinity/auth-client';
import { createActor } from '~/user_index';
import router from '../router';
import { toRaw } from 'vue';
import { HttpAgent } from '@dfinity/agent';
import { useAssetsStore } from './assets';
import { useQAStore } from './qa';
import { useResponseStore } from '@/store/response';

function createActorFromIdentity(agent) {
  return createActor(process.env.USER_INDEX_CANISTER_ID, { agent });
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
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: false,
        },
      });

      this.isAuthenticated = await this.authClient.isAuthenticated();
      this.identity = this.isAuthenticated ? this.authClient.getIdentity() : null;

      const agent = this.identity ? new HttpAgent({ identity: this.identity }) : null;

      this.actor = this.identity ? createActorFromIdentity(agent) : null;
      this.principal = this.identity ? await agent.getPrincipal() : null;

      if (this.isAuthenticated) {
        await this.actor
          .findUser(this.principal.toText())
          .then(async (res) => {
            if (res.length) {
              this.setUser(res[0]);
              sessionStorage.isAuthenticated = true;

              await useQAStore().init();
              await useAssetsStore().init();
              await useResponseStore().init();
            } else {
              sessionStorage.removeItem('isAuthenticated');

              await router.push('/login');
            }
          })
          .catch(() => this.logout());
      } else {
        await router.push('/login');
      }

      this.isReady = true;
    },
    async loginWithII() {
      const authClient = toRaw(this.authClient);

      await authClient.login({
        identityProvider: process.env.II_URI,
        onSuccess: async () => {
          this.isAuthenticated = await authClient.isAuthenticated();
          this.identity = this.isAuthenticated ? authClient.getIdentity() : null;

          const agent = this.identity ? new HttpAgent({ identity: this.identity }) : null;
      
          this.actor = this.identity ? createActorFromIdentity(agent) : null;
          this.principal = this.identity ? await agent.getPrincipal() : null;

          await useQAStore().init();
          await useAssetsStore().init();
          await useResponseStore().init();

          sessionStorage.isAuthenticated = true;

          await router.push('/sign-up');
        },
      });
    },
    async logout() {
      await this.authClient.logout();
      sessionStorage.removeItem('isAuthenticated');

      this.isAuthenticated = false;
      this.identity = this.actor = null;

      this.setUser();

      await router.push('/login');
    },
    setUser(user = null) {
      if (user == null) {
        this.user = null;
      } else {
        const { username, fullName } = user;

        this.user = { username, fullName };
      }
    },
  },
  getters: {
    getUser: ({ user }) => user,
    getIdentity: ({ identity }) => identity,
  },
});
