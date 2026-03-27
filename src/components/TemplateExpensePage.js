import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import useUserName from "../hooks/useUserName"

export default function TemplateExpensePage() {
  const userName = useUserName()

  // --- form state ---
  const [templateName, setTemplateName] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState(1)
  const [bigCategory, setBigCategory] = useState('')
  const [smallCategory, setSmallCategory] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [isActive, setIsActive] = useState(true)

  // --- master / list ---
  const [bigCategories, setBigCategories] = useState([])
  const [smallCategories, setSmallCategories] = useState([])
  const [templates, setTemplates] = useState([])

  const [editingId, setEditingId] = useState(null)

  // =========================
  // マスタ取得
  // =========================
  useEffect(() => {
    async function fetchBigCategories() {
      const { data } = await supabase
        .from('big_category_master')
        .select('big_category_id, big_category_name')
        .order('big_category_id')

      setBigCategories(data || [])
    }
    fetchBigCategories()
  }, [])

  useEffect(() => {
    if (!bigCategory) {
      setSmallCategories([])
      setSmallCategory('')
      return
    }

    async function fetchSmallCategories() {
      const { data } = await supabase
        .from('small_category_master')
        .select('small_category_id, small_category_name')
        .eq('big_category_id', Number(bigCategory))
        .order('small_category_id')

      setSmallCategories(data || [])

      // 新規作成時のみ先頭を自動選択
      if (!editingId && data && data.length > 0) {
        setSmallCategory(String(data[0].small_category_id))
      }
    }

    fetchSmallCategories()
  }, [bigCategory, editingId])

  // =========================
  // テンプレート一覧取得
  // =========================
  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('template_expenses')
      .select(`
        id,
        template_name,
        day_of_month,
        amount,
        note,
        is_active,
        big_category_id,
        small_category_id,
        big_category_master (big_category_name),
        small_category_master (small_category_name)
      `)
      .order('is_active', { ascending: false })
      .order('day_of_month')

    setTemplates(data || [])
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // =========================
  // 登録 / 更新
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!templateName || !bigCategory || !amount) {
      alert('テンプレート名・大カテゴリ・金額は必須です')
      return
    }

    const payload = {
      template_name: templateName,
      day_of_month: Number(dayOfMonth),
      big_category_id: Number(bigCategory),
      small_category_id: smallCategory ? Number(smallCategory) : null,
      note,
      amount: Number(amount),
      is_active: isActive,
      last_updated_by: userName
    }

    let error
    if (editingId) {
      ;({ error } = await supabase
        .from('template_expenses')
        .update(payload)
        .eq('id', editingId))
    } else {
      ;({ error } = await supabase
        .from('template_expenses')
        .insert([{ ...payload, created_by: userName }]))
    }

    if (error) {
      alert('保存に失敗しました')
      return
    }

    clearForm()
    fetchTemplates()
  }

  // =========================
  // 編集開始（重要）
  // =========================
  const handleEdit = (tpl) => {
    setEditingId(tpl.id)
    setTemplateName(tpl.template_name)
    setDayOfMonth(tpl.day_of_month)
    setBigCategory(String(tpl.big_category_id))
    setSmallCategory(tpl.small_category_id ? String(tpl.small_category_id) : '')
    setNote(tpl.note || '')
    setAmount(tpl.amount)
    setIsActive(tpl.is_active)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('このテンプレートを削除しますか？')) return
    await supabase.from('template_expenses').delete().eq('id', id)
    fetchTemplates()
  }

  const clearForm = () => {
    setEditingId(null)
    setTemplateName('')
    setDayOfMonth(1)
    setBigCategory('')
    setSmallCategory('')
    setNote('')
    setAmount('')
    setIsActive(true)
  }

  // =========================
  // 画面
  // =========================
  return (
    <div style={{ padding: '20px' }}>
      <h2>テンプレート設定</h2>

      {/* 入力フォーム（追加画面と同型） */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '320px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            backgroundColor: '#fff'
          }}
        >
          <input
            type="text"
            placeholder="テンプレート名"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />

          <input
            type="number"
            min="1"
            max="28"
            value={dayOfMonth}
            onChange={e => setDayOfMonth(e.target.value)}
          />

          <select value={bigCategory} onChange={e => setBigCategory(e.target.value)}>
            <option value="">大カテゴリを選択</option>
            {bigCategories.map(bc => (
              <option key={bc.big_category_id} value={bc.big_category_id}>
                {bc.big_category_name}
              </option>
            ))}
          </select>

          <select value={smallCategory} onChange={e => setSmallCategory(e.target.value)}>
            <option value="">小カテゴリを選択</option>
            {smallCategories.map(sc => (
              <option key={sc.small_category_id} value={sc.small_category_id}>
                {sc.small_category_name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="メモ"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <input
            type="number"
            placeholder="金額"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />

          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            有効
          </label>

          <button type="submit">
            {editingId ? '更新' : '追加'}
          </button>

          {editingId && (
            <button type="button" onClick={clearForm}>
              キャンセル
            </button>
          )}
        </form>
      </div>

      {/* 一覧（カード型・既存踏襲） */}
      <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {templates.map((tpl, idx) => (
          <div
            key={tpl.id}
            style={{
              backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
              padding: '12px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <strong>{tpl.template_name}</strong>（毎月 {tpl.day_of_month} 日）
            <div>
              {tpl.big_category_master?.big_category_name} /
              {tpl.small_category_master?.small_category_name || '-'}
            </div>
            <div>¥{Number(tpl.amount).toLocaleString()}</div>
            <div>{tpl.is_active ? '有効' : '無効'}</div>
            <button onClick={() => handleEdit(tpl)}>編集</button>
            <button onClick={() => handleDelete(tpl.id)}>削除</button>
          </div>
        ))}
      </div>
    </div>
  )
}
