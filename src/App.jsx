import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Queue from './pages/Queue'
import Doctor from './pages/Doctor'
import QRGenerator from './pages/QRGenerator'
import { QueueProvider } from './context/QueueContext'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
    return (
        <ErrorBoundary>
            <QueueProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="check-in" element={<CheckIn />} />
                            <Route path="queue" element={<Queue />} />
                            <Route path="doctor" element={<Doctor />} />
                            <Route path="qr-generator" element={<QRGenerator />} />
                        </Route>
                    </Routes>
                </Router>
            </QueueProvider>
        </ErrorBoundary>
    )
}

export default App
