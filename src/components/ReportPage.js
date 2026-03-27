import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const formatAmount = amount => Number(amount).toLocaleString()

export default function ReportPage() {
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [reportData, setReportData] = useState([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [allExpenses, setAllExpenses] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  useEffect(() => {
    async function fetchReport() {
      const monthStart = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
      const monthEndDate = new Date(selectedYear, selectedMonth, 0).getDate()
      const monthEnd = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${monthEndDate}`

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          date,
          amount,
          note,
          big_category_master (big_category_name),
          small_category_master (small_category_name)
        `)
        .or('delete_flg.is.null,delete_flg.eq.false')
        .gte('date', monthStart)
        .lte('date', monthEnd)

      if (!error && data) {
        const grouped = {}
        let total = 0
        data.forEach(item => {
          const bigCat = item.big_category_master?.big_category_name || '未分類'
          if (!grouped[bigCat]) grouped[bigCat] = 0
          grouped[bigCat] += Number(item.amount)
          total += Number(item.amount)
        })

        const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value }))
        setReportData(chartData)
        setTotalAmount(total)
        setAllExpenses(data)
        setSelectedCategory(null)
      }
    }

    fetchReport()
  }, [selectedYear, selectedMonth])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF3366', '#33CCFF']

  // 選択カテゴリの明細
  const filteredExpenses = selectedCategory
    ? allExpenses
        .filter(e => (e.big_category_master?.big_category_name || '未分類') === selectedCategory)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : []

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const bigCatName = payload[0].name
      const total = payload[0].value

      // 小カテゴリごとの合計
      const smallGrouped = {}
      allExpenses
        .filter(e => (e.big_category_master?.big_category_name || '未分類') === bigCatName)
        .forEach(e => {
          const smallName = e.small_category_master?.small_category_name || '未分類'
          if (!smallGrouped[smallName]) smallGrouped[smallName] = 0
          smallGrouped[smallName] += Number(e.amount)
        })

      return (
        <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <div><strong>{bigCatName}</strong></div>
          <div>総額: {formatAmount(total)} 円</div>
          <div style={{ marginTop: '5px' }}>
            小カテゴリ別:
            <ul style={{ paddingLeft: '15px', margin: 0 }}>
              {Object.entries(smallGrouped).map(([name, val]) => (
                <li key={name}>{name}: {formatAmount(val)} 円</li>
              ))}
            </ul>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <h2>月別支出レポート</h2>

      <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
        合計支出: {formatAmount(totalAmount)} 円
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>年: </label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <label style={{ marginLeft: '10px' }}>月: </label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={reportData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label={({ name, value }) => `${name}: ${formatAmount(value)}`}
            onClick={entry => setSelectedCategory(entry.name)}
          >
            {reportData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {selectedCategory && (
        <div style={{ marginTop: '20px' }}>
          <h3>{selectedCategory} の明細</h3>
          <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>日付</th>
                <th>大カテゴリ</th>
                <th>小カテゴリ</th>
                <th>備考</th>
                <th>金額</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(e => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.big_category_master?.big_category_name || '未分類'}</td>
                  <td>{e.small_category_master?.small_category_name || '-'}</td>
                  <td>{e.note || '-'}</td>
                  <td>{formatAmount(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
//version 1.5.7