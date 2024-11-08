import React, { useState } from 'react';
import { getAddress, signMessage } from '@sats-connect/core';
import { addAccountTokeychain } from '../api';
import { Link } from 'react-router-dom';
import axios from 'axios';
// import './App.css';

export const SignUp = () => {
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
  const [keychainAdded, setKeychainAdded] = useState(false);

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
    setLoading(true);
    try {
        const response = await axios.post('https://api.breakaway.community/create-account', {
            username,
            address,
            message,
            signature,
        });

        console.log("Response data:", response);
        setLoading(false);
        return response.data;
    } catch (error) {
        console.error('Error sending data to server:', error);
        setLoading(false);
        throw error;
    }
};

  const handleFinalStage = async () => {
    try {
      const response = await sendToServer (username, walletAddress, messageToSign, signedMessage);
    
    if(response?.success) {
          setServerResponse(response);  
          setMsg("created hive account successfully")
          setIsCreated(true);

        } else {
          setMsg(response?.data.error)
        }
        console.log(response)
      } catch (error) {
        setMsg(error?.response?.data.error)
    }
  }

  const redirect = () => {
    window.open('https://bitcoinmachines.community/', '_blank');
    // setPage("login")
  }  

  function downloadKeys() {
  
    const content = `
  Master Password: ${serverResponse?.keys?.master}

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
    setDownloaded(true);
  }  

  async function updateHiveProfileMetadata(username, address, signature, message) {
    try {
        const apiUrl = 'https://api.hive.blog';
        const requestBody = {
            jsonrpc: '2.0',
            method: 'condenser_api.get_accounts',
            params: [[username]],
            id: 1
        };

        const { data } = await axios.post(apiUrl, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (data.result && data.result.length > 0) {
            let metadata = {};
            try {
                metadata = JSON.parse(data.result[0].posting_json_metadata || '{}');
            } catch (e) {
                console.error('Error parsing existing metadata:', e);
                metadata = {}; // Default to empty metadata if parsing fails
            }

            // Update Bitcoin details in the metadata
            metadata.bitcoin = {
                address: address,
                signature: signature,
                message: message
            };

            // Step 3: Broadcast the updated metadata
            const operations = [
                ['account_update2', {
                    account: username,
                    json_metadata: '',
                    posting_json_metadata: JSON.stringify(metadata),
                    extensions: []
                }]
            ];

            window.hive_keychain.requestBroadcast(username, operations, 'posting', (response) => {
                if (response.success) {
                    alert('Bitcoin address and signature successfully added to your Hive profile!');
                } else {
                    alert('Failed to update Hive profile: ' + response.message);
                }
            });
        } else {
            console.error('Unable to fetch account details');
            alert('Failed to fetch account details');
        }
    } catch (error) {
        console.error('Error fetching or updating account details:', error);
        alert('Error fetching or updating account details: ' + error.message);
    }
}

  const addToKeychain = async() => {
    const keys = serverResponse.keys;
    const metadata = {
      signature: signedMessage,
      message: messageToSign,
      btcAddress: walletAddress
  };

    try {
        await addAccountTokeychain(username, {
            active: keys.active,
            posting: keys.posting,
            memo: keys.memo,
            // json_metadata: metadata
          });
          await updateHiveProfileMetadata(username, walletAddress, signedMessage, messageToSign)
          setKeychainAdded(true)
        } catch (error) {
            console.log(error)
            setKeychainAdded(false)
    }

  }

  return (
    <div className="app-container">
      <h1>Create A Bitcoin Social Account</h1>
      <p className={serverResponse?.success ? "success" : "error"}>{msg}</p>
      {step === 1 && <div className="form-container">
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
          <button type="submit" className="submit-button">Get bitcoin Address</button>
        </form>
      </div>}
      
      {step === 2 && <>
        {walletAddress && (
          <div className="wallet-info">
            <h3>Wallet Address:</h3>
            <p>{walletAddress}</p>
          </div>
        )}

        {signedMessage && (
          <div className="message-info">
            <h3>Signed Message:</h3>
            <p>{JSON.stringify(signedMessage)}</p>
          </div>
        )}

        {serverResponse?.success && (
          <div className="server-response">
            <h3>Server Response:</h3>
            {!downloaded && <button 
              className="submit-button"
              onClick={downloadKeys}
            >
              Download keys
            </button>}
            <p>Username: {username}</p>
            <p>Master Password: {serverResponse?.keys?.master}</p>
            <p>Owner Key: {serverResponse?.keys?.owner}</p>
            <p>Active key: {serverResponse?.keys?.active}</p>
            <p>Posting key: {serverResponse?.keys?.posting}</p>
            <p>Memo key: {serverResponse?.keys?.memo}</p>
          </div>
        )}

        {!isCreated && <button 
          className="submit-button"
          onClick={handleFinalStage}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>}
        {downloaded && (!keychainAdded ? 
        <button className="submit-button" onClick={addToKeychain}>Add to keychain</button> :
        <button 
          className="submit-button"
          onClick={redirect}
        >
          {/* <Link to="/login"> */}
            Proceed to login
          {/* </Link> */}
        </button>)
        }
      </>}
    </div> 
  );
}
