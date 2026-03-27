import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
)

export default function ItemMonthlyGraphPage() {
  const [fromYm, setFromYm] = useState('')
  const [toYm, setToYm] = useState('')

  const [bigCategories, setBigCategories] = useState([])
  const [smallCategories, setSmallCategories] = useState([])

  const [bigCategoryId, setBigCategoryId] = useState('')
  const [smallCategoryId, setSmallCategoryId] = useState('')

  const [chartData, setChartData] = useState(null)

  // =========================
  // 初期表示：期間＋大カテゴリ取得
  // =========================
  useEffect(() => {
    const init = async () => {
      // --- 期間初期値 ---
      const { data: minDate } = await supabase
        .from('expenses')
        .select('date')
        .or('delete_flg.is.null,delete_flg.eq.false')
        .order('date', { ascending: true })
        .limit(1)

      const { data: maxDate } = await supabase
        .from('expenses')
        .select('date')
        .or('delete_flg.is.null,delete_flg.eq.false')
        .order('date', { ascending: false })
        .limit(1)

      if (minDate?.length && maxDate?.length) {
        setFromYm(minDate[0].date.slice(0, 7))
        setToYm(maxDate[0].date.slice(0, 7))
      }

      // --- 大カテゴリ ---
      const { data: bigs } = await supabase
        .from('big_category_master')
        .select('big_category_id, big_category_name')
        .order('big_category_id')

      setBigCategories(
        (bigs || []).map(b => ({
          id: b.big_category_id,
          name: b.big_category_name
        }))
      )
    }

    init()
  }, [])

  // =========================
  // 大カテゴリ変更時：小カテゴリ取得
  // =========================
  useEffect(() => {
    if (!bigCategoryId) {
      setSmallCategories([])
      setSmallCategoryId('')
      return
    }

    const fetchSmall = async () => {
      const { data } = await supabase
        .from('small_category_master')
        .select('small_category_id, small_category_name')
        .eq('big_category_id', bigCategoryId)
        .order('small_category_id')

      setSmallCategories(
        (data || []).map(s => ({
          id: s.small_category_id,
          name: s.small_category_name
        }))
      )
      setSmallCategoryId('')
    }

    fetchSmall()
  }, [bigCategoryId])

  // =========================
  // 検索・集計
  // =========================
  const handleSearch = async () => {
    if (!bigCategoryId) {
      alert('大カテゴリを選択してください')
      return
    }

    let query = supabase
      .from('expenses')
      .select('date, amount')
      .gte('date', `${fromYm}-01`)
      .lte('date', `${toYm}-31`)
      .eq('big_category_id', bigCategoryId)
      .or('delete_flg.is.null,delete_flg.eq.false')

    if (smallCategoryId) {
      query = query.eq('small_category_id', smallCategoryId)
    }

    const { data } = await query

    const monthly = {}
    data.forEach(r => {
      const ym = r.date.slice(0, 7)
      monthly[ym] = (monthly[ym] || 0) + Number(r.amount)
    })

    // 0円補完
    const labels = []
    const values = []

    let cur = new Date(`${fromYm}-01`)
    const end = new Date(`${toYm}-01`)

    while (cur <= end) {
      const ym = cur.toISOString().slice(0, 7)
      labels.push(ym)
      values.push(monthly[ym] || 0)
      cur.setMonth(cur.getMonth() + 1)
    }

    setChartData({
      labels,
      datasets: [
        {
          label: '月別支出金額',
          data: values
        }
      ]
    })
  }

  // =========================
  // 画面
  // =========================
  return (
    <div style={{ padding: '20px' }}>
      <h2>項目別 月次グラフ</h2>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input type="month" value={fromYm} onChange={e => setFromYm(e.target.value)} />
        <input type="month" value={toYm} onChange={e => setToYm(e.target.value)} />

        <select value={bigCategoryId} onChange={e => setBigCategoryId(e.target.value)}>
          <option value="">大カテゴリ選択</option>
          {bigCategories.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={smallCategoryId}
          onChange={e => setSmallCategoryId(e.target.value)}
          disabled={!bigCategoryId}
        >
          <option value="">（全小カテゴリ）</option>
          {smallCategories.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button onClick={handleSearch}>表示</button>
      </div>

      {chartData && (
        <div style={{ maxWidth: '800px' }}>
          <Bar
            data={chartData}
            options={{
              plugins: {
                tooltip: {
                  callbacks: {
                    label: ctx => `¥${ctx.raw.toLocaleString()}`
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: v => `¥${v.toLocaleString()}`
                  }
                }
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
