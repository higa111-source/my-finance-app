// src/components/ExpenseList.js
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function ExpenseList({ reload }) {
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    fetchExpenses()
  }, [reload]) // ← reload が変わるたびに再取得

  const fetchExpenses = async () => {
    let { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })

    if (error) console.error(error)
    else setExpenses(data)
  }

  const deleteExpense = async (id) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) console.error(error)
    else fetchExpenses() // 削除後に再取得
  }

  return (
    <div>
      <h2>支出一覧</h2>
      <ul>
        {expenses.map(exp => (
          <li key={exp.id}>
            {exp.date} - {exp.big_category_id} - {exp.amount}円
            <button onClick={() => deleteExpense(exp.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ExpenseList
