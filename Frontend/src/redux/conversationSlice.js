import { createSlice } from "@reduxjs/toolkit";

const conversationSlice=createSlice({
  name:"conversation",
  initialState:{
    conversations:[],
    selectedConversation:null
},
reducers:{
     setConversations:(state,action)=>{ //this reducer will used for getConversation in which we update entiire conversation
      state.conversations=action.payload
     }, //unshift function help to add element in beginning of array and this reducer use when we create a conversation
     addConversation:(state,action)=>{
      state.conversations.unshift(action.payload)
     },
     setSelectedConversation:(state,action)=>{
      state.selectedConversation=action.payload
     },

     setConvTitle:(state,action)=>{
      const {title,conversationId} = action.payload 
      state.conversations=state.conversations.map((conv)=>(
        conv._id==conversationId?(
          {
            ...conv,title
          } 
        ):conv
      ))

      if(state.selectedConversation?._id==conversationId){
        state.selectedConversation={...state.selectedConversation,title}
      }
     }
     
  }

})
export const {setConversations,addConversation,setSelectedConversation,setConvTitle}=conversationSlice.actions;
export default conversationSlice.reducer;