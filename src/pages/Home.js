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
                {/* https://www.youtube.com/watch?v=q1WDbMhQOEU */}
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
            {/* <div style={{}}> */}
              <p>Watch Xvers set up tutorial below</p>
              <iframe
                width="700"
                height="400"
                src="https://www.youtube.com/embed/bYN7FHnNH0w"
                title="Xverse wallet setup"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            {/* </div> */}

            {/* <p>
              <a
                  className='links'
                  href='https://www.youtube.com/watch?v=bYN7FHnNH0w'
                  target="_blank"
              >
                  Xvers set up tutorial
              </a>
            </p> */}
        </h3>
        
      </div>
      <div>
        <h3>After successfully installing hive keychain and Xverse extensions</h3>
        <div className='login-links-wrapper'>
          <Link className='links' to="/signup">
            <button className='home-btn'>Proceed with Bitcoin Machine</button>
          </Link>
          <h4>OR</h4>
          <Link className='links' to="/one-btc-signup">
            <button className='home-btn'>Proceed with Bitcoin address</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
