import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";

import Header from "./layout/Header";
import { Wallets } from "./components/wallet/Wallets";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';


function App() {

    return (
        <BrowserRouter>
            <div className="App flex">
                <Wallets>
                    <div className={`w-full dark:bg-regal-white`}>
                        <Header />
                        <div>
                            <Routes>
                                <Route path="/" element={<Home />} />
                            </Routes>
                        </div>
                        <ToastContainer
                            position="top-right"
                            autoClose={4000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            // theme={ darkMode ? "light" : "light" }
                        />
                    </div>
                </Wallets>
            </div>
        </BrowserRouter>
    );
}

export default App;
