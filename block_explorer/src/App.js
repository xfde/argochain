import "./App.scss";
import NavBar from "./components/navbar";
import Explorer from "./components/explorer/explorer";
import Accounts from "./components/accounts/accounts";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/" element={<Explorer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
