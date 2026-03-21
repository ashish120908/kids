import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomeScreen from './components/HomeScreen'
import TimesTablesGame from './components/TimesTablesGame'
import ColorMatchGame from './components/ColorMatchGame'
import ShapeMatchGame from './components/ShapeMatchGame'
import CountingGame from './components/CountingGame'
import ProgressDashboard from './components/ProgressDashboard'
import AlphabetMatchGame from './components/AlphabetMatchGame'
import SpellingBeeGame from './components/SpellingBeeGame'
import AdditionGame from './components/AdditionGame'
import MemoryFlipGame from './components/MemoryFlipGame'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
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
        <Route path="/memory" element={<MemoryFlipGame />} />
      </Routes>
    </BrowserRouter>
  )
}
