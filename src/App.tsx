import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Product from './pages/Product';
import WhyCredion from './pages/WhyCredion';
import Pricing from './pages/Pricing';
import Resources from './pages/Resources';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PaymentMethod from './pages/PaymentMethod';
import PaymentMethods from './pages/PaymentMethods';
import Government from './pages/Government';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/why-credion" element={<WhyCredion />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/payment-method" element={<PaymentMethod />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/government" element={<Government />} />
            <Route path="/user-profile" element={<UserProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;