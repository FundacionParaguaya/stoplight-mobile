import * as _ from 'lodash';

import { SUBMIT_DRAFT, setHydrated } from './actions';
import { applyMiddleware, compose, createStore } from 'redux';
import { autoRehydrate, getStoredState, persistStore } from 'redux-persist';

import AsyncStorage from '@react-native-community/async-storage';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import { composeWithDevTools } from 'redux-devtools-extension';
import defaultQueue from '@redux-offline/redux-offline/lib/defaults/queue';
import { offline } from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/defaults';
import { rootReducer } from './reducer';
import { setLanguage } from '../i18n';
import { submitDraftWithImages } from './middleware';
import thunk from 'redux-thunk';

let rehydrated = false;

export const getHydrationState = () => rehydrated;

const setHydratedState = () => store.dispatch(setHydrated());

const reduxOfflineConfig = {
  persist: null,
  ...offlineConfig,
  retry: (action, retries) => action.meta.urgent ? 100 : 1500 * (retries + 1),
  persistOptions: {
    blacklist: ['hydration'],
  },
  queue: {
    ...defaultQueue,
    enqueue(outbox, incomingAction, context) {
      if (incomingAction.type == SUBMIT_DRAFT) {
        return outbox
          .filter(outboxAction => ((outboxAction.id !== incomingAction.id) || (outboxAction.type !== incomingAction.type)))
          .concat(incomingAction);
      }
      return [...outbox, incomingAction];
    },

    
   /*  peek(outbox, action, { offline }) {
      console.log('peek action',action)
      if(action.type == 'SUBMIT_INTERVENTION'){
        return false;
      }
    } */
  },
  // this fires after store hydration is done
  persistCallback: () => {
    setLanguage();
    setHydratedState();
  },
  retry: () => 300000, // retry  every 5 minutes
};
const middlewaresToApply = [thunk, submitDraftWithImages];
const store = createStore(
  rootReducer,
  composeWithDevTools(
    offline(reduxOfflineConfig),
    applyMiddleware(...middlewaresToApply),
    autoRehydrate(),
  ),
);

const fsPersistor = persistStore(
  store,
  {
    blacklist: ['hydration'],
    debounce: 500,
    storage: FilesystemStorage,
  },
  async (fsError, fsResult) => {
    if (_.isEmpty(fsResult)) {
      try {
        const asyncState = await getStoredState({ storage: AsyncStorage });
        if (!_.isEmpty(asyncState)) {
          fsPersistor.rehydrate(asyncState, { serial: false });
        }
      } catch (getStateError) {
        console.warn('getStoredState error', getStateError);
      }
    }
  },
);

export default store;
