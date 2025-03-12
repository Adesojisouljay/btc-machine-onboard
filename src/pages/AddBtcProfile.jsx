import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import { getAddress, signMessage } from '@sats-connect/core';
import { getWalletAddress, validateUsername } from '../helpers';
import { getAccount } from '../api/hive';

export const AddBtcProfile = () => {

    const debounceTimer = useRef(null);

    const [username, setUsername] = useState("");
    const [walletAddress, setWalletAddress] = useState(null);
    const [ordinalAddress, setOrdinalAddress] = useState(null);
    const [signedMessage, setSignedMessage] = useState(null);
    const [messageToSign, setMessageToSign] = useState(null);
    const [step, setStep] = useState(1);
    const [usernameAvailable, setUsernameAvailable] = useState(false)
    const [msg, setMsg] = useState("");

    useEffect(() => {
        if(username === "" || username === undefined){
            setMsg("")
          }
    }, [username])
    
      const signMessageFromWallet = (address, message) => {
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

    const getBitcoinAddress = async (e) => {
        e.preventDefault()
        try {
            const walletAddresses = await getWalletAddress();
            const bitcoinAddress = walletAddresses.find(addr => addr.purpose === 'payment')?.address;
            const ordinalAddress = walletAddresses.find(addr => addr.purpose === 'ordinals')?.address;

            setWalletAddress(bitcoinAddress)
            setOrdinalAddress(ordinalAddress)
            setMessageToSign(`Hive:${username}`)
            setStep(2)
        } catch (error) {
            console.log(error)
        }
    }

    const handleSigning = async () => {
        try {
            const signedMessage = await signMessageFromWallet(walletAddress, messageToSign);
            setSignedMessage(signedMessage);
        } catch (error) {
            console.error('Error signing the message:', error);
        }
    };

    async function updateHiveProfileMetadata() {
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

                // Update  metadata
                  metadata.profile = {
                    ...metadata.profile, // Preserve existing fields
                    btcLightningAddress: `${username}@sats.v4v.app`,
                };
    
                metadata.bitcoin = {
                    address: walletAddress,
                    ordinalAddress: ordinalAddress,
                    signature: signedMessage,
                    message: messageToSign
                };
    
                const operations = [
                    ['account_update2', {
                        account: username,
                        json_metadata: '',
                        posting_json_metadata: JSON.stringify(metadata),
                        extensions: []
                    }]
                ];

               const added = await updateAccountBtcInfo();
    
                window.hive_keychain.requestBroadcast(username, operations, 'posting', (response) => {
                    if (response.success) {
                        setMsg('Bitcoin address and signature successfully added to your Hive profile!');
                    } else {
                        setMsg('Failed to update Hive profile: ' + response.message);
                    }
                });
            } else {
                console.error('Unable to fetch account details');
                setMsg('Failed to fetch account details');
            }
        } catch (error) {
            console.error('Error fetching or updating account details:', error);
            setMsg('Error fetching or updating account details: ' + error.message);
        }
    }

    const updateAccountBtcInfo = async () => {
      try {
          // const apiUrl = 'http://localhost:4000/update-account-btc'
          const apiUrl = 'https://api.breakaway.community/update-account-btc'
          const payload = {
              username,
              address: walletAddress,
              ordinalAddress,
              signature: signedMessage,
              message: messageToSign
          };
  
          const { data } = await axios.post(apiUrl, payload);
  
          if (data.success) {
              setMsg('Account updated successfully with BTC info!');
          } else {
              setMsg('Failed to update account: ' + data.message);
              console.error('Error:', data);
          }
          return data
      } catch (error) {
          console.error('Error updating account with BTC info:', error);
          setMsg('An error occurred while updating account: ' + error.message);
      }
  };

  const validateUsernameWithDelay = async (newUsername) => {
        clearTimeout(debounceTimer.current);

    if (!newUsername || newUsername === "") {
      setMsg("")
      return;
    };

    debounceTimer.current = setTimeout(async () => {
      const isValid = await validateUsername(newUsername, setMsg);
         const existingAccount = await getAccount(newUsername)
      if (existingAccount !== undefined) {
          setUsernameAvailable(true)
          setMsg("Username is valid")
        } else {
            setUsernameAvailable(false)
            setMsg("Provided username is invalid")         
      }
    }, 500);
  };


  const usernameChanged = async (e) => {
    const newUsername = e.target.value.trim().toLowerCase();
    
    setUsername(newUsername);
  
    if (newUsername === "") {
      setMsg("");
      setUsernameAvailable(false);
      return;
    }
  
    await validateUsernameWithDelay(newUsername);
  };
  

  return (
    <div className='general-container'>
      <div className="app-container">
        <h1>Add existing hive username</h1>
        <p className={usernameAvailable ? "success" : "error"}>{msg}</p>
        {step === 1 ? <div className="form-container">
          <form className='acc-form'>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              placeholder='Enter hive username'
              value={username}
              onChange={usernameChanged}
              required
            />
            <button
              style={{cursor: usernameAvailable ? "pointer" : "not-allowed"}}
              disabled={!usernameAvailable}
              className="submit-button"
              onClick={getBitcoinAddress}
            >
              Get btc address
            </button>
          </form>
        </div> : step === 2 ?
        <div className="acc-info-container">
            <span>Payment Address: {walletAddress}</span>
            <span>Ordinals Address: {ordinalAddress}</span>
            <span>Message: {messageToSign}</span>
            {signedMessage && <span>Signature: {signedMessage}</span>}
            {!signedMessage ? <button 
              className="submit-button"
              onClick={handleSigning}
            >
              Sign Message
            </button> : 
            <button 
            className="submit-button"
            onClick={updateHiveProfileMetadata}
          >
            Connect to Hive account
          </button>}
        </div> : <></>}
      </div>
    </div>

  )
}

