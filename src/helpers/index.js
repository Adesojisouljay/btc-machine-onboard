import { getAddress, signMessage } from '@sats-connect/core';
import { getAccount } from '../api/hive';

export const validateUsername = async (username, setError) => {

  try {
      const account = await getAccount(username);
      console.log("object", account)

      if (account && account !== undefined) {
        setError("Username is already taken");
        return false;
      }

      if (username.length < 3 || username.length > 16) {
        setError("Username must be between 3 and 16 characters long.");
        return false;
      }
    
      if (/^\d/.test(username)) {
        setError("Username cannot start with a number.");
        return false;
      }
    
      if (/^\./.test(username) || /\.$/.test(username)) {
        setError("Username cannot start or end with a dot (.).");
        return false;
      }
    
      if (/\.{2,}/.test(username)) {
        setError("Username cannot contain consecutive dots (..).");
        return false;
      }
    
      const parts = username.split(".");
      for (const part of parts) {
        if (part.length < 3) {
          setError("Each part of the username (separated by dots) must be at least 3 characters long.");
          return false;
        }
      }
    
      //validate Hive username rules (dots, hyphens, and alphanumeric)
      const regex = /^(?!.*--)(?!.*\.\.)(?!.*-\.)[a-z0-9]+([-\.][a-z0-9]+)*$/;
      if (!regex.test(username)) {
        setError(
          "Username can only contain lowercase letters, numbers, single dots, and single hyphens."
        );
        return false;
      }

      if (account === undefined) {
        setError("Username is available");
        return true;
      }
    
      // return true;
    
  } catch (error) {
    
  }
};
  
export const getWalletAddress = () => {
  return new Promise((resolve, reject) => {
    const getAddressOptions = {
      payload: {
        purposes: ['payment', 'ordinals'],
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