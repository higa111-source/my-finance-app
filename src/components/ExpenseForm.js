import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import useUserName from "../hooks/useUserName"

function ExpenseForm({ onAdd }) {
  const userName = useUserName()
  const [bigCategories, setBigCategories] = useState([])
  const [smallCategories, setSmallCategories] = useState([])
  const [selectedBig, setSelectedBig] = useState('')
  const [selectedSmall, setSelectedSmall] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [message, setMessage] = useState('')

  // --- 大カテゴリ取得 ---
  useEffect(() => {
    async function fetchBigCategories() {
      try {
        const { data, error } = await supabase
          .from('big_category_master')
          .select('big_category_id, big_category_name')
          .order('big_category_id', { ascending: true })
        if (error) throw error
        setBigCategories(data || [])
      } catch (err) {
        console.error('大カテゴリ取得失敗', err)
      }
    }
    fetchBigCategories()
  }, [])

  // --- 小カテゴリ取得（大カテゴリ選択時） ---
  useEffect(() => {
    if (!selectedBig) {
      setSmallCategories([])
      setSelectedSmall('')
      return
    }

    async function fetchSmallCategories() {
      try {
        const { data, error } = await supabase
          .from('small_category_master')
          .select('small_category_id, small_category_name')
          .eq('big_category_id', parseInt(selectedBig, 10))
          .order('small_category_id', { ascending: true })

        if (error) throw error

        const list = data || []
        setSmallCategories(list)

        if (list.length > 0) {
          setSelectedSmall(String(list[0].small_category_id))
        } else {
          setSelectedSmall('')
        }
      } catch (err) {
        console.error('小カテゴリ取得失敗', err)
        setSmallCategories([])
        setSelectedSmall('')
      }
    }

    fetchSmallCategories()
  }, [selectedBig])

  // --- 追加処理 ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBig || !amount) {
      setMessage('❌ 大カテゴリと金額は必須です')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          date,
          big_category_id: parseInt(selectedBig, 10),
          small_category_id: selectedSmall ? parseInt(selectedSmall, 10) : null,
          note,
          amount: Number(amount),
          created_by: userName,
          last_updated_by: userName
        }])

      if (error) throw error

      onAdd()
      handleClear()
      setMessage('✅ データを追加しました')
    } catch (err) {
      console.error('データ追加失敗', err)
      setMessage('❌ データ追加に失敗しました')
    }

    setTimeout(() => setMessage(''), 3000)
  }

  const handleClear = () => {
    setAmount('')
    setNote('')
    setSelectedBig('')
    setSelectedSmall('')
    setDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: '30px',
      fontSize: '16px'
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '320px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        backgroundColor: '#fff'
      }}>
        <div>
          <label>日付: </label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', fontSize: '16px', padding: '6px' }} />
        </div>

        <div>
          <label>大カテゴリ: </label>
          <select value={selectedBig} onChange={e => setSelectedBig(e.target.value)} style={{ width: '100%', fontSize: '16px', padding: '6px' }}>
            <option value="">大カテゴリを選択</option>
            {bigCategories.map(bc => (
              <option key={bc.big_category_id} value={bc.big_category_id}>{bc.big_category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>小カテゴリ: </label>
          <select value={selectedSmall} onChange={e => setSelectedSmall(e.target.value)} style={{ width: '100%', fontSize: '16px', padding: '6px' }}>
            <option value="">小カテゴリを選択</option>
            {smallCategories.map(sc => (
              <option key={sc.small_category_id} value={sc.small_category_id}>{sc.small_category_name}</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="メモ"
            style={{ width: '100%', fontSize: '16px', padding: '6px' }}
          />
        </div>

        <div>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="金額"
            style={{ width: '100%', fontSize: '16px', padding: '6px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button type="submit" style={{ flex: 1, fontSize: '16px', padding: '8px', cursor: 'pointer' }}>追加</button>
          <button type="button" onClick={handleClear} style={{ flex: 1, fontSize: '16px', padding: '8px', cursor: 'pointer' }}>クリア</button>
        </div>

        {message && <div style={{ marginTop: '10px', color: message.includes('❌') ? 'red' : 'green', textAlign: 'center' }}>{message}</div>}
      </form>
    </div>
  )
}

export default ExpenseForm
//version 1.5.8