import React, { useState } from 'react';
import { Link } from 'react-router-dom';


export const Home = () => {
  

  return (
     <div className="app-container">
      <h1>Create A Bitcoin Social Account</h1>
      <div>
        {/* <p>What you need?</p> */}
        <h3>
            <a
                className='links'
                href='https://hive-keychain.com/'
                target="_blank"
            >
                Please install keychain extension here
            </a>
        </h3>
        <h3>
            <a
                className='links'
                href='https://www.xverse.app/'
                target="_blank"
            >
                Please install Xverse wallet extension here
            </a>
        </h3>
        
      </div>
      <div>
        <h3>After successfully installing keychain extension</h3>
        <Link className='links' to="/signup">Click here to begin</Link>
      </div>
    </div>
  );
}
