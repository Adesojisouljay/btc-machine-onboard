import React, { useState } from 'react';
import { getAddress, signMessage } from '@sats-connect/core';
import { addAccountTokeychain } from '../api';
// import './App.css';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [signedMessage, setSignedMessage] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [messageToSign, setMessageToSign] = useState(null);
  const [step, setStep] = useState(1);
  const [isCreated, setIsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [page, setPage] = useState("create")

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    try {
      const walletAddresses = await getWalletAddress();

      console.log('Wallet Addresses:', walletAddresses);

      if (walletAddresses && walletAddresses.length > 0) {
        const bitcoinAddress = walletAddresses[0].address;
        const messageToSign = `Hive:${username}`;

        const signedMessageResponse = await signMessageFromWallet(messageToSign, bitcoinAddress);

        setWalletAddress(bitcoinAddress);
        setSignedMessage(signedMessageResponse);
        setMessageToSign(messageToSign)

        console.log('Bitcoin Address:', bitcoinAddress);
        console.log('Signed Message:', signedMessageResponse);
        setStep(2)

        // const response = await sendToServer(username, bitcoinAddress, messageToSign, signedMessageResponse);
        // setServerResponse(response);
        // console.log(response)

        // if (response && response.success) {
        //   window.location.href = 'http://localhost:3000';
        // }

      } else {
        throw new Error('No addresses found in the response.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setServerResponse(`Error: ${error.message}`);
    }
  };

  const getWalletAddress = () => {
    return new Promise((resolve, reject) => {
      const getAddressOptions = {
        payload: {
          purposes: ['payment'],
          message: 'Address for creating Hive account',
          network: {
            type: 'Mainnet'
          },
        },
        onFinish: (response) => {
          console.log('onFinish response:', response);
          resolve(response.addresses);
        },
        onCancel: () => reject(new Error('Request canceled')),
      };

      getAddress(getAddressOptions);
    });
  };

  const signMessageFromWallet = (message, address) => {
    return new Promise((resolve, reject) => {
      const signMessageOptions = {
        payload: {
          network: {
            type: 'Mainnet',
          },
          address: address,
          message: message,
        },
        onFinish: (response) => {
          console.log('Signature response:', response);
          resolve(response);
        },
        onCancel: () => reject(new Error('Signing canceled')),
      };

      signMessage(signMessageOptions);
    });
  };

  const sendToServer = async (username, address, message, signature) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:7000/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          address,
          message,
          signature,
        }),
      });

      console.log("json....",response)
      const data = await response.json();

      // if (response.ok) {
      //   setMsg("created hive account successfully")
      // } else {
      //   setMsg("Something went wrong")
      // }

      console.log(data, "data....")
      setLoading(false)
      return data;
    } catch (error) {
      console.error('Error sending data to server:', error);
      setLoading(false)
      throw error;
    }
  };

  const handleFinalStage = async () => {
    const response = await sendToServer (username, walletAddress, messageToSign, signedMessage);
    
    if(response.success) {
      const keys = response.keys;
          setServerResponse(response);  
          setMsg("created hive account successfully")
          setIsCreated(true);

          await addAccountTokeychain(username, {
            active: keys.active,
            posting: keys.posting,
            memo: keys.memo
          });

        } else {
          setMsg(response.error)
        }
        console.log(response)
  }

  const redirect = () => {
    window.open('http://localhost:3000', '_blank');
    // setPage("login")
  }  

  function downloadKeys() {
  
    const content = `
  Owner Key: ${serverResponse?.keys?.owner}
  
  Active Key: ${serverResponse?.keys?.active}
  
  Posting Key: ${serverResponse?.keys?.posting}
  
  Memo Key: ${serverResponse?.keys?.memo}
    `;
  
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${username}_hive_keys.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded(true)
  }  

  return (
    <div className='general-container'>
      <div className="app-container">
        <h1>Login</h1>
        <div className="form-container">
          <form onSubmit={handleCreateAccount} className='acc-form'>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              placeholder='Choose a username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button 
              type="submit" 
              className="submit-button"
            >
              <img
              className='keychain-logo'
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF0wPMyXXA0D62n1Rl2EAAJkUUI33czT7Pgw&s" 
                alt='keychain'
              />
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
