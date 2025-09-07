import {useEffect, useState} from 'react'
import background from './assets/background-lines.png'
import electronRsbuildLogo from './assets/electron-rsbuild-logo.svg'
import Versions from './components/Versions'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [mainMessage, setMainMessage] = useState({
    message: '',
    time: 0,
  })

  useEffect(() => {
    const onReceiver = (_, data: any) => {
      setMainMessage(data)
    }
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
          {/* biome-ignore lint/a11y/useValidAnchor: These are correct links but we need to use an onclick to open an external link in Electron */}
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Send IPC
          </a>
        </div>
      </div>
      {mainMessage?.message && (
        <div className="action">
          {/* biome-ignore lint/a11y/useValidAnchor: These are correct links but we need to use an onclick to open an external link in Electron */}
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            {mainMessage?.time as number}: {mainMessage?.message}
          </a>
        </div>
      )}
      <Versions />
    </>
  )
}

export default App
