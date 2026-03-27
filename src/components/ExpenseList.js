import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function ExpenseList({ reload, onEdit }) {
  const [expenses, setExpenses] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)

  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']

  useEffect(() => {
    async function fetchExpenses() {
      const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
      const monthEndDate = new Date(selectedYear, selectedMonth, 0).getDate()
      const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${monthEndDate}`

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          date,
          note,
          amount,
          big_category_master (big_category_id, big_category_name),
          small_category_master (small_category_id, small_category_name),
          delete_flg
        `)
        .or('delete_flg.is.null,delete_flg.eq.false')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false })

      if (!error) {
        const filtered = data.filter(e => !e.delete_flg)
        setExpenses(filtered)
        const total = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0)
        setTotalAmount(total)
      } else {
        setExpenses([])
        setTotalAmount(0)
      }
    }

    fetchExpenses()
  }, [reload, selectedYear, selectedMonth])

  return (
    <div style={{ padding: '20px' }}>
      <h2>支出一覧</h2>

      {/* 年月プルダウン＋合計金額 */}
      <div style={{ marginBottom: '15px' }}>
        <label>年: </label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <label style={{ marginLeft: '10px' }}>月: </label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>
          合計: {totalAmount.toLocaleString()}円
        </span>
      </div>

      {/* カードリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto', marginTop: '5px' }}>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>データがありません</div>
        ) : (
          expenses.map((exp, index) => {
            const dateObj = new Date(exp.date)
            const day = dateObj.getDate()
            const weekday = weekdays[dateObj.getDay()]
            return (
              <div
                key={exp.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* 上段 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                  <span>{day}日({weekday})</span>
                  <span>{exp.big_category_master?.big_category_name || '-'}</span>
                  <span>{exp.small_category_master?.small_category_name || '-'}</span>
                  <span>{Number(exp.amount).toLocaleString()}円</span>
                </div>

                {/* 下段 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                  <span>備考: {exp.note || '-'}</span>
                  <button onClick={() => onEdit(exp)}>編集</button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
//version 1.6.1