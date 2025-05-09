import React from "react";
import "./AppDownload.css";
import { assets } from "../../assets/assets";

const AppDownload = () => {
    return (
        <div className="app-download-container" id="app-download-container">
            <div className="app-download-content">
                <h1>Download Our  App</h1>
                <p>Get the best experience with our PizzaCraft app.</p>
                <a href="https://example.com/download" className="download-button">Download Now</a>
                <div className="app-download-images">
                   <a href="https://play.google.com/" target="_blank" rel="noopener noreferrer">
                    <img src={assets.playstore} alt="App Image 1" className="app-image" /></a>
                    <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                    <img src={assets.appstore} alt="App Image 2" className="app-image" /></a>
                </div>
            </div>
        </div>
    );
}


export default AppDownload;