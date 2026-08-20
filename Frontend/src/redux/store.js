//redus tool kit used for statemanagement once store the data and can be accessed by other services of frontend like home, chat,navbar etc i.e keep data at store that can be access by other file easilly with import and call function
//to access data from store we use two hooks:
//!) to get data from store use - useSelector and to update into silce present into store - useDispatch

import {configureStore} from '@reduxjs/toolkit';
import userReducer from "./userSlice"
import conversationReducer from "./conversationSlice"
import messageReducer from './messageSlice'
export const store= configureStore({
  reducer:{
    user:userReducer,
    conversation:conversationReducer,
    message:messageReducer
  },
})