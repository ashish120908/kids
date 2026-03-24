import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomeScreen from './components/HomeScreen'
import TimesTablesGame from './components/TimesTablesGame'
import ColorMatchGame from './components/ColorMatchGame'
import ShapeMatchGame from './components/ShapeMatchGame'
import CountingGame from './components/CountingGame'
import ProgressDashboard from './components/ProgressDashboard'
import AlphabetMatchGame from './components/AlphabetMatchGame'
import SpellingBeeGame from './components/SpellingBeeGame'
import AdditionGame from './components/AdditionGame'
import SubtractionGame from './components/SubtractionGame'
import MemoryFlipGame from './components/MemoryFlipGame'
import DivisionGame from './components/DivisionGame'
import RhymingGame from './components/RhymingGame'
import ClockGame from './components/ClockGame'
import PatternGame from './components/PatternGame'
import CompareGame from './components/CompareGame'
import EnglishSpeakingGame from './components/EnglishSpeakingGame'
import AboutUs from './components/AboutUs'
import KidsProfile from './components/KidsProfile'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/times-tables" element={<TimesTablesGame />} />
            <Route path="/color-match" element={<ColorMatchGame />} />
            <Route path="/shape-match" element={<ShapeMatchGame />} />
            <Route path="/counting" element={<CountingGame />} />
            <Route path="/progress" element={<ProgressDashboard />} />
            <Route path="/alphabet" element={<AlphabetMatchGame />} />
            <Route path="/spelling" element={<SpellingBeeGame />} />
            <Route path="/addition" element={<AdditionGame />} />
            <Route path="/subtraction" element={<SubtractionGame />} />
            <Route path="/memory" element={<MemoryFlipGame />} />
            <Route path="/division" element={<DivisionGame />} />
            <Route path="/rhyming" element={<RhymingGame />} />
            <Route path="/clock" element={<ClockGame />} />
            <Route path="/pattern" element={<PatternGame />} />
            <Route path="/compare" element={<CompareGame />} />
            <Route path="/english-speaking" element={<EnglishSpeakingGame />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/profile" element={<KidsProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
