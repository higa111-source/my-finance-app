import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseEdit from './components/ExpenseEdit'
import ReportPage from './components/ReportPage'
import TemplateExpensePage from './components/TemplateExpensePage'
import TemplateApplyPage from './components/TemplateApplyPage'
import ItemMonthlyGraphPage from './components/ItemMonthlyGraphPage'

function App() {
  const [reload, setReload] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [page, setPage] = useState('add')
  // 'add' | 'list' | 'edit' | 'report' | 'template' | 'templateApply' | 'itemGraph'

  const handleAdd = () => setReload(prev => !prev)
  const handleEditSave = () => setReload(prev => !prev)

  const navigateTo = (targetPage) => {
    setPage(targetPage)
    setEditingExpense(null)
  }

  return (
    <div>
      {/* 上部ナビ */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0', padding: '10px', zIndex: 1000 }}>
        <button onClick={() => navigateTo('add')}>追加画面</button>
        <button onClick={() => navigateTo('list')}>一覧画面</button>
        <button onClick={() => navigateTo('report')}>レポート</button>
        <button onClick={() => navigateTo('itemGraph')}>項目別グラフ</button>
        <button onClick={() => navigateTo('template')}>テンプレート設定</button>
        <button onClick={() => navigateTo('templateApply')}>テンプレート出力</button>
      </div>

      {/* ページ切替 */}
      {page === 'add' && <ExpenseForm onAdd={handleAdd} />}

      {page === 'list' && (
        <ExpenseList
          reload={reload}
          onEdit={(exp) => {
            setEditingExpense(exp)
            setPage('edit')
          }}
        />
      )}

      {page === 'report' && <ReportPage />}

      {page === 'itemGraph' && <ItemMonthlyGraphPage />}

      {page === 'template' && <TemplateExpensePage />}

      {page === 'templateApply' && <TemplateApplyPage />}

      {page === 'edit' && editingExpense && (
        <ExpenseEdit
          expense={editingExpense}
          onCancel={() => setPage('list')}
          onSave={() => { setPage('list'); handleEditSave() }}
          onDelete={() => { setPage('list'); handleEditSave() }}
          navigateTo={navigateTo}
        />
      )}
    </div>
  )
}

export default App
