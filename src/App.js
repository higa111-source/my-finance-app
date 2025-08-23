// src/App.js
import { useState } from 'react'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"

function App() {
  const [reload, setReload] = useState(false)

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">支出追加</Link> |{" "}
          <Link to="/list">支出一覧</Link>
        </nav>
        <Routes>
          <Route path="/" element={<ExpenseForm />} />
          <Route path="/list" element={<ExpenseList />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
