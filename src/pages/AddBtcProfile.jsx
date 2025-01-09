import React, { useState } from 'react'
import axios from 'axios';
import { getAddress, signMessage } from '@sats-connect/core';

export const AddBtcProfile = () => {

    const [username, setUsername] = useState("");
    const [walletAddress, setWalletAddress] = useState(null);
    const [signedMessage, setSignedMessage] = useState(null);
    const [messageToSign, setMessageToSign] = useState(null);
    const [step, setStep] = useState(1)

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
                    console.log('Signature response:', response);
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
            const bitcoinAddress = walletAddresses[0]?.address;
            console.log("....add",bitcoinAddress)
            setWalletAddress(bitcoinAddress)
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
                    metadata = {}; // Default to empty metadata if parsing fails
                }
    
                // Update Bitcoin details in the metadata
                metadata.bitcoin = {
                    address: walletAddress,
                    signature: signedMessage,
                    message: messageToSign
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

  return (
    <div className='general-container'>
      <div className="app-container">
        <h1>Add existing hive username</h1>
        {step === 1 ? <div className="form-container">
          <form className='acc-form'>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              placeholder='Enter hive username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button 
              className="submit-button"
              onClick={getBitcoinAddress}
            >
              Get btc address
            </button>
          </form>
        </div> : step === 2 ?
        <div className="acc-info-container">
            <span>Address: {walletAddress}</span>
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

