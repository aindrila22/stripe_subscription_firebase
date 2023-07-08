import React from "react";
import { useState } from "react";
import firebase from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";

const Register = () => {

  const[fullname, setFullName] = useState("");
  const[email, setEmail] = useState("");
  const[password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async(e) =>{
    e.preventDefault();

    try{
      if(!email || !fullname || !password){
        console.log("please fill all the fields");
      }
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if(!emailRegex.test(email)){
        console.log("please provide a valid email");
        return
       }
  
       const response = await firebase.auth().createUserWithEmailAndPassword(email, password);
       if(response.user){
        await response.user.updateProfile({
          displayName: fullname
        })
        const uid = response.user.uid;
        const userRef = firebase.database().ref('users/'+ uid);
        await userRef.set({
          uid:uid,
          email: email,
          username: fullname
        });
  
        setFullName("");
        setEmail("");
        setPassword("");
  
        await navigate("/login");
       }
    }catch(error){
      console.log("Register error", error)
    }

  }


  return (
    <div className="flex items-center w-full mx-auto h-screen diagonal-background">
      <form onSubmit={handleSubmit}
        className="grid place-items-center lg:w-5/12 sm:w-9/12 w-11/12 mx-auto bg-white text-[#4f7cff] 
      shadow-2xl rounded-3xl"
      >
        <div className="pt-16 pb-4 text-3xl font-bold capitalize">
          Register To serVices
        </div>
        {/**** fullname ***/}
        <div className="w-full flex flex-col px-14 py-8">
          <label>Fullname</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 mt-1 text-lg outline-none"
            placeholder="your fullname"
            required
            value={fullname}
            onChange={(e)=>setFullName(e.target.value)}
          />
        </div>
        {/**** email ****/}
        <div className="w-full flex flex-col px-14 pb-8">
          <label>Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 mt-1 text-lg outline-none"
            placeholder="example@123.com"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
        </div>
        {/***** password ****/}
        <div className="w-full flex flex-col px-14 pb-8">
          <label>Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 mt-1 text-lg outline-none"
            placeholder="******"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
        </div>
        <div className="w-full flex justify-between items-center px-14 pb-8 text-[#3d5fc4]">
          <div>Already have an account?</div>
          <div>
            <a href="/login" className="hover:underline">
              Login Now
            </a>
          </div>
        </div>
        <div className="mx-auto flex justify-center items-center pt-6 pb-16">
          <button
            type="submit"
            className="bg-[#3d5fc4] text-white rounded-md text-base uppercase w-24 py-2"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
