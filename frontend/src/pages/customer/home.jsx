import React from "react";
import Header from "../../components/Header/Header";
import About from "../../components/About/about";
import Footer from "../../components/Footer/Footer";

const Home = () => {
    return (
        <div className="home">
            <Header/>
            <About/>
        </div>
    );
}

export default Home;