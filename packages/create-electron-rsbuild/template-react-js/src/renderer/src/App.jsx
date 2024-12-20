import { useEffect, useState } from 'react'
import Versions from './components/Versions'
import electronRsbuildLogo from './assets/electron-rsbuild-logo.svg'
import background from './assets/background-lines.png'

function App() {
  const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [mainMessage, setMainMessage] = useState({
    message: '',
    time: 0
  })

  const onReceiver = (_, data) => {
    setMainMessage(data)
  }

  useEffect(() => {
    window.electron.ipcRenderer.on('pong', onReceiver)
    return () => {
      window.electron.ipcRenderer.removeListener('pong', onReceiver)
    }
  }, [])

  return (
    <>
      <img alt="logo" className="logo" src={electronRsbuildLogo} />
      <img alt="logo" className="background" src={background} />

      <div className="creator">Powered by electron-rsbuild</div>
      <div className="text">
        Build an Electron + Rsbuild app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-rsbuild.org/" target="_blank" rel="noreferrer">
            Documentation
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      {mainMessage?.message && (
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            {mainMessage?.time}: {mainMessage?.message}
          </a>
        </div>
      )}
      <Versions></Versions>
    </>
  )
}

export default App
