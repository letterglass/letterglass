import { makeAutoObservable, runInAction } from 'mobx';

class MainStore {
  connected = false;

  constructor() {
    makeAutoObservable(this);

    window.wsOnOpen = () => {
      runInAction(() => {
        this.connected = true;
      });
    };
    window.wsOnClose = () => {
      runInAction(() => {
        this.connected = false;
      });
    };
  }
}

export const mainStore = new MainStore();
