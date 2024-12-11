import { Content } from "Components/Content";
import { Client } from "Pages/Client";
import { Clients } from "Pages/Clients";
import { Deal } from "Pages/Deal";
import { Deals } from "Pages/Deals";
import { Home } from "Pages/Home";
import { Login } from "Pages/Login";
import { Error404 } from "Pages/Error404";
import { Search } from "Pages/Search";
import { User } from "Pages/User";
import { Users } from "Pages/Users";
import store, { persistor } from "Redux/store";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PersistGate } from 'redux-persist/integration/react';
import { Error401 } from "Pages/Error401";
import "GlobalStyles/common.css";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Content><Home/></Content>} />
            <Route path="/users" element={<Content><Users/></Content>} />
            <Route path="/users/:id" element={<Content><User/></Content>} />
            <Route path="/clients" element={<Content><Clients/></Content>} />
            <Route path="/clients/:id" element={<Content><Client/></Content>} />
            <Route path="/deals" element={<Content><Deals/></Content>} />
            <Route path="/deals/:id" element={<Content><Deal/></Content>} />
            <Route path="/search" element={<Content><Search/></Content>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/401" element={<Error401/>} />
            <Route path="*" element={<Error404/>} />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  )
}

export default App