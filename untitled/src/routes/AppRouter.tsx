import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import ModelPage from '../pages/ModelPage/ModelPage'
import Admin from '../pages/Admin/Admin'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/model/:id" element={<ModelPage />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default AppRouter

