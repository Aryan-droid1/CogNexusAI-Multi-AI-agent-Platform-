import React from 'react'
import api from "../utils/axios"

 async function sendMessage(payload) {
  try{ 
    const {data}=await api.post("/api/agent/chat",payload)
    return data

  }catch (err) {
    console.log(err);
    console.log(err.response?.data);
}

}

export default sendMessage