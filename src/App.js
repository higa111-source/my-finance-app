// src/App.js
import { useState } from 'react'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"

function App() {
  const [reload, setReload] = useState(false)

  // ExpenseForm から呼ばれる
  const handleAdd = () => {
    // トグルすることで、ExpenseList に再レンダリングを促す
    setReload(prev => !prev)
  }

  return (
    <Router>
      <div>
        <nav>
          <Link to="/">支出追加</Link> |{" "}
          <Link to="/list">支出一覧</Link>
        </nav>
        <Routes>
          {/* onAdd を渡す */}
          <Route path="/" element={<ExpenseForm onAdd={handleAdd} />} />
          {/* reload を渡す */}
          <Route path="/list" element={<ExpenseList reload={reload} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
