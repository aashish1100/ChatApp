import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavScroll from './components/navbar';
import AuthForm from './pages/userAuthForm';
import { createContext, useEffect, useState } from 'react';
import { lookInSession } from './common/session';
import HomePage from './pages/home';
import ChatPage from './pages/chatPage';
import AdminPage from './pages/AdminPage';
import { useParams } from 'react-router-dom'; // Import useParams
import { SocketProvider } from './context/SocketContext'; 

export const UserContext = createContext({});

function App() {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null });
    console.log(JSON.parse(userInSession))
  }, []);
   
   
  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <SocketProvider> 
      <Router>
        <NavScroll />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users/chat/:receiverId" element={<ChatPageWrapper />} />
          <Route path="/login" element={<AuthForm type="signin" />} />
          <Route path="/signup" element={<AuthForm type="signup" />} />
        </Routes>
      </Router>
      </SocketProvider>
    </UserContext.Provider>
  );
}

function ChatPageWrapper() {
  const { receiverId } = useParams(); // Correct usage of useParams
  return <ChatPage receiverId={receiverId} />; // Pass receiverId as a prop to ChatPage
}

export default App;
