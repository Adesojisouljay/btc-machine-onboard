import React, { useState } from 'react';
import { Link } from 'react-router-dom';


export const Home = () => {
  

  return (
    <div className='general-container'>
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
                  1. Please install keychain extension here
                  {/* https://www.youtube.com/watch?v=q1WDbMhQOEU */}
              </a>
          </h3>
          <h3>
              <a
                  className='links'
                  href='https://www.xverse.app/'
                  target="_blank"
              >
                 2. Please install Xverse wallet extension here
              </a>
              {/* <div style={{}}> */}
                <p>Watch Xvers set up tutorial below</p>
                <iframe
                  width="700"
                  height="400"
                  src="https://www.youtube.com/embed/bYN7FHnNH0w"
                  title="Xverse wallet setup"
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                ></iframe>
              {/* </div> */}
              <div className='tutorials-sections'>
                <p>See video below on how to set up your account</p>
                <div className="video-iframes">
                <iframe
                    width="700"
                    height="200"
                    src="https://3speak.tv/embed?v=artakush/yetsndrp"
                    title="Xverse wallet setup"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  ></iframe>

                <iframe
                    width="700"
                    height="200"
                    src="https://3speak.tv/embed?v=neopch/zxhupbzu"
                    title="Xverse wallet setup"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  ></iframe>

                <iframe
                    width="700"
                    height="200"
                    src="https://3speak.tv/embed?v=neopch/kwgfvehg"
                    title="Xverse wallet setup"
                    style={{ border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>

              </div>

          </h3>
          
        </div>
        <div>
            <h3>After successfully installing hive keychain and Xverse extensions</h3>
            <div className='login-links-wrapper'>
              {/* <div className="btc-machine">
                  <p>Get a BTC machines social account and earn for posting</p>
                  <Link className='links' to="/signup">
                    <button className='home-btn'>Get started</button>
                  </Link>
              </div>
              <h4>OR</h4> */}
              <div className="btc-address">
                <p>3. Get BTC social account and earn for posting</p>
                <Link className='links' to="/one-btc-signup">
                  <button className='home-btn'>Get started</button>
                </Link>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
