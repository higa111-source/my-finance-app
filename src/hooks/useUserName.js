import { useState, useEffect } from "react"

function useUserName() {
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const savedName = localStorage.getItem("userName")
    if (savedName) {
      setUserName(savedName)
    } else {
      const name = prompt("ユーザ名を入力してください (例: Aさん, Bさん)")
      if (name) {
        localStorage.setItem("userName", name)
        setUserName(name)
      }
    }
  }, [])

  return userName
}

export default useUserName
