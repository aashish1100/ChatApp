import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavScroll from './components/navbar';
import AuthForm from './pages/userAuthForm';
import { createContext, useEffect, useState } from 'react';
import { lookInSession } from './common/session';

export const UserContext=createContext({});
function App() {
  const [userAuth,setUserAuth]=useState({});
  
  useEffect(()=>
  {
       let userInSession = lookInSession("user");
       userInSession ? setUserAuth(JSON.parse(userInSession)):setUserAuth({access_token:null});
  },[])

  return (
    <UserContext.Provider value={{userAuth,setUserAuth}}>
      <Router>
      <NavScroll />
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/login" element={<AuthForm type="signin" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
      </Routes>
    </Router>
    </UserContext.Provider>
  );
}



export default App;
