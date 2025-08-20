// src/components/ExpenseForm.js
import { useState } from 'react'
import { supabase } from '../supabaseClient'

function ExpenseForm({ onAdd }) {
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')

  const addExpense = async (e) => {
    e.preventDefault()

    const { error } = await supabase
      .from('expenses')
      .insert([{ category, amount, date }])

    if (error) console.error(error)
    else {
      onAdd() // 親コンポーネントに「追加完了」を通知
      setCategory('')
      setAmount('')
      setDate('')
    }
  }

  return (
    <form onSubmit={addExpense}>
      <input value={date} onChange={e => setDate(e.target.value)} placeholder="日付" type="date" />
      <input value={category} onChange={e => setCategory(e.target.value)} placeholder="カテゴリ" />
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="金額" type="number" />
      <button type="submit">追加</button>
    </form>
  )
}

export default ExpenseForm
