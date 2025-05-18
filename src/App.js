import logo from './logo.svg';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  withAuthenticator,
  Button,
  Heading,
  Image,
  View,
  Card,
} from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import './components/Navbar'
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';

function App({ signOut }) {
  const [idToken, setIdToken] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        setIdToken(token);

        const attributes = await fetchUserAttributes();
        setUserEmail(attributes.email);
      } catch (error) {
        console.error('Error fetching session or user attributes:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Router>
      <Navbar  signOut= {signOut} userEmail={userEmail}/>
      {/* Optional debug:
      <h3>Email: {userEmail}</h3>
      */}
      {/* <h3>ID Token: {idToken}</h3> */}
           
      <Routes>
        <Route path="/" element={<Home idToken={idToken}  />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default withAuthenticator(App);
