import './App.css';
import TopBar from './TopBar'
import MainMenu from './MainMenu';
import MapView from './MapView';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const hideTopbarRoutes = ['/map'];

  const showElement = !hideTopbarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {showElement && <header className="App-header">
        <TopBar />
      </header>}

      <main>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/map" element={<MapView />} />
        </Routes>
      </main>

      {showElement && <footer style={{
        backgroundColor: "rgb(34, 58, 88)",
        color: "#fff",
        textAlign: "center",
        padding: "20px 0",
        marginTop: "0px",
        fontSize: "14px"
      }}>
        <hr style={{ border: "0", borderTop: "1px solid black", margin: "0 20%" }} />
        <p style={{ marginTop: "10px" }}>
          © {new Date().getFullYear()} WingPath · All rights reserved.
        </p>
      </footer>}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;