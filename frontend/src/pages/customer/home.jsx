import React from "react";
import Header from "../../components/Header/Header";
import About from "../../components/About/about";
import Footer from "../../components/Footer/Footer";
import AppDownload from "../../components/AppDownload/AppDownload";

const Home = () => {
    return (
        <div className="home">
            <Header/>
            <About/>
            <AppDownload/>
        </div>
    );
}

export default Home;