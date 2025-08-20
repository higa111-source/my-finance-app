// src/App.js
import { useState } from 'react'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'

function App() {
  const [reload, setReload] = useState(false)

  return (
    <div>
      <h1>家計簿アプリ</h1>
      <ExpenseForm onAdd={() => setReload(!reload)} />
      <ExpenseList key={reload} />
    </div>
  )
}

export default App
