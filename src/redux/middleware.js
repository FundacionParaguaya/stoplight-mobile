import {submitDraft} from './actions';

export const submitDraftWithImages = store => next => action => {

  if (action.type === 'LOAD_IMAGES_COMMIT') {
    console.log('LOAD IMAGES COMMIT');
    let payload = JSON.stringify(action.payload);

    let reduce = submitDraft(action.env, action.token, action.id, {
      ...action.draft,
      pictures: JSON.parse(payload),
    });

    store.dispatch(reduce);
  }

  if (action.type === 'LOAD_IMAGES_ROLLBACK') {
    //Submit draft without pictures anyway
    console.log('LOAD IMAGES ROLLBACK');
    console.log('Sending draf without images');
    console.log(action);
    /* let reduce = submitDraft(action.env, action.token, action.id, {
      ...action.draft,
      pictures: []
    })
    
    store.dispatch(reduce)*/
  }

  let result = next(action);
  return result;
};
