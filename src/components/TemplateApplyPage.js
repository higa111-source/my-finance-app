import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import useUserName from "../hooks/useUserName"

export default function TemplateApplyPage() {
  const userName = useUserName()
  const today = new Date()

  // --- 年月 ---
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  // --- テンプレート ---
  const [templates, setTemplates] = useState([])
  const [checkedIds, setCheckedIds] = useState([])

  // =========================
  // テンプレート取得
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
        big_category_id,
        small_category_id
      `)
      .eq('is_active', true)
      .order('day_of_month')

    setTemplates(data || [])
    setCheckedIds((data || []).map(t => t.id)) // デフォルト全選択
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // =========================
  // チェック操作
  // =========================
  const toggleCheck = (id) => {
    setCheckedIds(prev =>
      prev.includes(id)
        ? prev.filter(v => v !== id)
        : [...prev, id]
    )
  }

  // =========================
  // 計上処理
  // =========================
  const handleApply = async () => {
    if (checkedIds.length === 0) {
      alert('計上するテンプレートが選択されていません')
      return
    }

    const ym = `${year}年${month}月`
    const ok = window.confirm(
      `${ym}分の支出として、選択したテンプレートを計上します。\nよろしいですか？`
    )
    if (!ok) return

    const records = templates
      .filter(t => checkedIds.includes(t.id))
      .map(t => {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(t.day_of_month).padStart(2, '0')}`
        return {
          date,
          big_category_id: t.big_category_id,
          small_category_id: t.small_category_id,
          note: t.note,
          amount: t.amount,
          created_by: userName,
          last_updated_by: userName
        }
      })

    const { error } = await supabase
      .from('expenses')
      .insert(records)

    if (error) {
      alert('計上に失敗しました')
      return
    }

    alert('テンプレートを計上しました')
  }

  // =========================
  // 画面
  // =========================
  return (
    <div style={{ padding: '20px' }}>
      <h2>テンプレート出力</h2>

      {/* 年月選択 */}
      <div style={{ marginBottom: '15px' }}>
        <label>年：</label>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          style={{ width: '80px' }}
        />

        <label style={{ marginLeft: '10px' }}>月：</label>
        <select value={month} onChange={e => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* テンプレート一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {templates.length === 0 && (
          <div style={{ color: '#888' }}>有効なテンプレートがありません</div>
        )}

        {templates.map((t, idx) => (
          <div
            key={t.id}
            style={{
              backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
              padding: '10px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong>{t.template_name}</strong>
              <div>毎月 {t.day_of_month} 日 / ¥{Number(t.amount).toLocaleString()}</div>
            </div>

            <input
              type="checkbox"
              checked={checkedIds.includes(t.id)}
              onChange={() => toggleCheck(t.id)}
            />
          </div>
        ))}
      </div>

      {/* 実行ボタン */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleApply}>
          選択したテンプレートを計上
        </button>
      </div>
    </div>
  )
}
