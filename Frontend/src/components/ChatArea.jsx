import React, { useEffect } from "react";
import Nav from "./Nav";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useDispatch, useSelector } from "react-redux";
import getMessage from "../features/getMessage";
import { setArtifacts, setMessages } from "../redux/messageSlice";

function ChatArea() {
  const dispatch = useDispatch();
  const { selectedConversation } = useSelector((state) => state.conversation);
  useEffect(() => {
    const getMesg = async () => {
      if (selectedConversation) {
        if(selectedConversation.title=="New Chat"){
          dispatch(setMessages([]));   
      return;
        }
      const data = await getMessage(selectedConversation?._id);
      console.log(data);
        dispatch(setMessages(data));
        const latestArtifactMessage=[...data].reverse().find(msg=>msg.artifacts && msg.artifacts.length>0 )
        dispatch(setArtifacts(latestArtifactMessage?.artifacts) || []);
      }
    };
    
    getMesg();
  }, [selectedConversation?._id]);
  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <MessageList />
      <ChatInput />
    </div>
  );
}

export default ChatArea;
