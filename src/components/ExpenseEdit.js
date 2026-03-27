import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import useUserName from "../hooks/useUserName"

export default function ExpenseEdit({ expense, onCancel, onSave, onDelete, navigateTo }) {
    const userName = useUserName()
    
    const [date, setDate] = useState(expense.date)
    const [bigCategories, setBigCategories] = useState([])
    const [smallCategories, setSmallCategories] = useState([])
    const [bigCategory, setBigCategory] = useState(expense.big_category_master?.big_category_id || '')
    const [smallCategory, setSmallCategory] = useState(expense.small_category_master?.small_category_id || '')
    const [note, setNote] = useState(expense.note || '')
    const [amount, setAmount] = useState(expense.amount || '')

    // --- 大カテゴリ取得 ---
    useEffect(() => {
        async function fetchBigCategories() {
            const { data, error } = await supabase
                .from('big_category_master')
                .select('big_category_id, big_category_name')
                .order('big_category_id')
            if (!error) setBigCategories(data)
        }
        fetchBigCategories()
    }, [])

    // --- 小カテゴリ取得（大カテゴリ変更時） ---
    useEffect(() => {
        if (!bigCategory) {
            setSmallCategories([])
            setSmallCategory('')
            return
        }

        async function fetchSmallCategories() {
            const { data, error } = await supabase
                .from('small_category_master')
                .select('small_category_id, small_category_name')
                .eq('big_category_id', Number(bigCategory))
                .order('small_category_id')

            if (!error) {
                setSmallCategories(data)
                // 大カテゴリ変更時は最初の小カテゴリを自動選択
                if (data.length > 0) {
                    setSmallCategory(data[0].small_category_id)
                } else {
                    setSmallCategory('')
                }
            }
        }

        fetchSmallCategories()
    }, [bigCategory])

    // --- 保存 ---
    const handleSave = async () => {
        const { error } = await supabase
            .from('expenses')
            .update({
                date,
                big_category_id: bigCategory,
                small_category_id: smallCategory,
                note,
                amount: Number(amount),
                last_updated_by: userName
            })
            .eq('id', expense.id)

        if (!error) onSave()
        else alert('更新に失敗しました')
    }

    // --- 削除（確認付き） ---
    const handleDelete = async () => {
        if (!window.confirm('本当に削除しますか？')) return

        const { error } = await supabase
            .from('expenses')
            .update({ delete_flg: true })
            .eq('id', expense.id)

        if (!error) onDelete()
        else alert('削除に失敗しました')
    }

    return (
        <div>
            <h2>支出編集</h2>
            <div>
                <label>日付: </label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div>
                <label>大カテゴリ: </label>
                <select value={bigCategory} onChange={e => setBigCategory(e.target.value)}>
                    <option value="">大カテゴリを選択</option>
                    {bigCategories.map(bc => (
                        <option key={bc.big_category_id} value={bc.big_category_id}>{bc.big_category_name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>小カテゴリ: </label>
                <select value={smallCategory} onChange={e => setSmallCategory(e.target.value)}>
                    <option value="">小カテゴリを選択</option>
                    {smallCategories.map(sc => (
                        <option key={sc.small_category_id} value={sc.small_category_id}>{sc.small_category_name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>備考: </label>
                <input value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <div>
                <label>金額: </label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>

            <div style={{ marginTop: '10px' }}>
                <button onClick={handleSave}>保存</button>
                <button onClick={handleDelete}>削除</button>
                <button onClick={onCancel}>キャンセル</button>
            </div>
        </div>
    )
}
