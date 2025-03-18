import React, { useState, useEffect, useRef } from 'react';
import { getAddress, signMessage } from '@sats-connect/core';
import { addAccountTokeychain } from '../api';
import { validateUsername } from '../helpers';
import { getAccount } from '../api/hive';
import axios from 'axios';
import { getWalletAddress } from '../helpers';

export const SignUpOneBtcClub = () => {
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [ordinalAddress, setOrdinalAddress] = useState(null);
  const [signedMessage, setSignedMessage] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [messageToSign, setMessageToSign] = useState(null);
  const [step, setStep] = useState(1);
  const [isCreated, setIsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [keychainAdded, setKeychainAdded] = useState(false);
  const [keys, setKeys] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(false)

  const debounceTimer = useRef(null);

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    try {
      const walletAddresses = await getWalletAddress();
            const bitcoinAddress = walletAddresses.find(addr => addr.purpose === 'payment')?.address;
            const ordinalAddress = walletAddresses.find(addr => addr.purpose === 'ordinals')?.address;

      if (walletAddresses && walletAddresses.length > 0) {
        const bitcoinAddress = walletAddresses[0].address;
        const messageToSign = `Hive:${username}`;

        const signedMessageResponse = await signMessageFromWallet(messageToSign, bitcoinAddress);

        setWalletAddress(bitcoinAddress);
        setOrdinalAddress(ordinalAddress);
        setSignedMessage(signedMessageResponse);
        setMessageToSign(messageToSign)

        setStep(2)

      } else {
        throw new Error('No addresses found in the response.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setServerResponse(`Error: ${error.message}`);
    }
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
          resolve(response);
        },
        onCancel: () => reject(new Error('Signing canceled')),
      };

      signMessage(signMessageOptions);
    });
  };

  const createRequest = async (username, address, message, signature, keys, ordinalAddress) => {
    setLoading(true);
    try {
            const response = await axios.post('https://api.breakaway.community/create-one-btc-account', {
            username,
            address,
            ordinalAddress,
            message,
            signature,
            accountKeys: keys
        });

        setLoading(false);
        return response.data;
    } catch (error) {
        console.error('Error sending data to server:', error);
        setLoading(false);
        throw error;
    }
};

const getAccountKeys = async (username) => {
    setLoading(true);
    try {
        const response = await axios.post('https://api.breakaway.community/get-account-keys', { username });

        if (response.data && response.data.accountDetails) {
            setKeys(response.data.accountDetails);
        } else {
            console.error("Account details not found in the response");
        }

        setLoading(false);
    } catch (error) {
        console.error('Error sending data to server:', error);
        setLoading(false);
        throw error;
    }
};

  const createHiveAccount = async () => {
    try {
      const response = await createRequest(username, walletAddress, messageToSign, signedMessage, keys, ordinalAddress);
    
    if(response?.success) {
          setServerResponse(response);  
          setMsg("created hive account successfully")
          setIsCreated(true);

        } else {
          setMsg(response?.data.error)
        }
      } catch (error) {
        setMsg(error?.response?.data.error)
    }
  }

  const redirect = () => {
    window.open("https://onebitcoinclub.org", '_blank');
  }  

  function downloadKeys() {
  
    const content = `
        Master Password: ${keys?.masterPassword}

        Owner Key: ${keys?.owner}
        
        Active Key: ${keys?.active}
        
        Posting Key: ${keys?.posting}
        
        Memo Key: ${keys?.memo}
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
                metadata = {}; // Default to empty
            }

            // Update metadata
              metadata.profile = {
                ...metadata.profile, // Preserve existing fields
                btcLightningAddress: `${username}@sats.v4v.app`,
            };

            metadata.bitcoin = {
                address: address,
                ordinalAddress: ordinalAddress,
                signature: signature,
                message: message
            };

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

  const validateUsernameWithDelay = async (newUsername) => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      const isValid = await validateUsername(newUsername, setMsg);
      setUsernameAvailable(isValid)
      if (isValid) {
        console.log("Username is valid!");
      } else {
        console.log("Username validation failed.");
      }
    }, 500);
  };

  const usernameChanged = async (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername.toLowerCase());
    await validateUsernameWithDelay(newUsername);
  };


  /////shoukld be removed
  const getExistingHiveAccount = async () => {
    setLoading(true);
    try {
      const account = await getAccount(username);
      const isNameValid =  validateUsernameWithDelay(username);
        if(account) {
        setMsg("Username is already taken");
        setUsernameAvailable(false);
      } else if (account === undefined && isNameValid) {
        setUsernameAvailable(true);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="general-container">
      <div className="app-container">
        <h1>Create A Bitcoin Social Account</h1>
        <p>You need at least 5,000 satoshis in your Xverse wallet to get a free account</p>
        {step === 1 ? <p className={usernameAvailable ? "success" : "error"}>{msg}</p> :
        <p className={(serverResponse?.success) ? "success" : "error"}>{msg}</p>}
        {step === 1 && <div className="form-container">
          <form onSubmit={handleCreateAccount} className='acc-form'>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              placeholder='Choose a username'
              value={username}
              onChange={usernameChanged}
              required
            />
            <button
              style={{cursor: usernameAvailable ? "pointer" : "not-allowed"}}
              disabled={!usernameAvailable}
              type="submit" 
              className="submit-button"
            >
              Get bitcoin Address
            </button>
          </form>
        </div>}
        
      {step === 2 && (
      <>
          {walletAddress && (
          <div className="wallet-info">
              <h3>Wallet Address:</h3>
              <p>{walletAddress}</p>
          </div>
          )}

          {/* {ordinalAddress && (
            <div className="wallet-info">
                <h3>Ordinal Address:</h3>
                <p>{ordinalAddress}</p>
            </div>
          )} */}

          {signedMessage && (
          <div className="message-info">
              <h3>Signed Message:</h3>
              <p>{JSON.stringify(signedMessage)}</p>
          </div>
          )}

          {keys ? (
          <div className="server-response">
              <h3>Account Keys:</h3>
              {!downloaded && <button className="submit-button" onClick={downloadKeys}>
              Download Keys
              </button>}
              <p>Username: {username}</p>
              <p>Master Password: {keys?.masterPassword}</p>
              <p>Owner Key: {keys?.owner}</p>
              <p>Active Key: {keys?.active}</p>
              <p>Posting Key: {keys?.posting}</p>
              <p>Memo Key: {keys?.memo}</p>
          </div>
          ) : (
          <button className="submit-button" onClick={() => getAccountKeys(username)}>
              {loading ? 'Getting keys...' : 'Get Keys'}
          </button>
          )}

          {downloaded && !isCreated && (
          <button className="submit-button" onClick={createHiveAccount}>
              {loading ? 'Creating account...' : 'Create Account'}
          </button>
          )}

          {isCreated && !keychainAdded && (
          <button className="submit-button" onClick={addToKeychain}>
              Add to Keychain
          </button>
          )}

          {keychainAdded && (
          <button className="submit-button" onClick={redirect}>
              Proceed to Login
          </button>
          )}
      </>
      )}

      <>
      <p>Watch Tutorial</p>
      <iframe
        width="900"
        height="400"
        src="https://3speak.tv/embed?v=neopch/zxhupbzu"
        title="Xverse wallet setup"
        style={{ border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      ></iframe>
      </>

      </div> 
    </div>
  );
}
