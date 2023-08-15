import { useState, useRef } from "react"
import { SliderPlus } from "../comps/SliderPlus";
import { FaVolumeUp, FaMusic, FaArrowsAltH } from "react-icons/fa";
import { EqualizerControl } from "./EqualizerControl";
import { useStateView } from "../hooks/useStateView";
import { useCaptureStatus } from "../hooks/useCaptureStatus";
import { MdAccessTime } from "react-icons/md";
import { getDefaultAudioFx } from "../defaults";
import { ReverseButton } from "./ReverseButton";
import cloneDeep from "lodash.clonedeep";
import produce from "immer";
import "./AudioPanel.scss"

export function AudioPanel(props: {}) {
  const [view, setView] = useStateView({audioFx: true, audioFxAlt: true, monoOutput: true, audioPan: true})
  const env = useRef({viaButton: true}).current
  let [rightTab, setRightTab] = useState(false)
  const status = useCaptureStatus()
  
  if (!view) return <div className="panel unloaded"></div>

  if (!view.audioFxAlt) {
    rightTab = false 
  }
 
  let starAudioFx = rightTab ? view.audioFxAlt : view.audioFx
  let starKey: "audioFxAlt" | "audioFx"  = rightTab ? "audioFxAlt" : "audioFx"

  const ensureCaptured = () => {
    if (status) return 
    env.viaButton = false
    chrome.runtime.sendMessage({type: "TAB_CAPTURE", on: true, tabId: gvar.tabInfo.tabId})
  }

  return <div className="AudioPanel panel">
    <button className={`capture ${status ? "active" : ""}`} onClick={e => {
      env.viaButton = true 
      chrome.runtime.sendMessage({type: "TAB_CAPTURE", tabId: gvar.tabInfo.tabId})
    }}>{status ? window.gsm.audio.releaseTab : window.gsm.audio.captureTab}</button>
    <div className="mainControls">
      <button 
        className={`toggle ${view.audioFxAlt ? "active" : ""}`}
        onClick={() => {
          setView(produce(view, d => {
            d.audioFxAlt = d.audioFxAlt ? null : cloneDeep(d.audioFx || getDefaultAudioFx())
          }))
        }}
      >{window.gsm.audio.split}</button>
      <button 
        className={`toggle ${view.monoOutput ? "active" : ""}`}
        onClick={() => {
          setView(produce(view, d => {
            d.monoOutput = !d.monoOutput
            d.monoOutput && ensureCaptured()
          }))
        }}
      >{window.gsm.audio.mono}</button>
    </div>
    {view.audioFxAlt ? (
      <div className="tabs">
        <button className={!rightTab ? "open" : ""} onClick={e => {
          setRightTab(false)
        }}>{"<< L"}</button>
        <button className={rightTab ? "open" : ""} onClick={e => {
          setRightTab(true)
        }}>{"R >>"}</button>
      </div>
    ) : null}
    <SliderPlus
      label={<div>
        <FaMusic size="17px"/>
        <span style={{marginLeft: "10px"}}>{window.gsm.command.adjustPitch}</span>
        <button title={"high quality"} style={{marginLeft: "10px"}} className={`micro toggle ${starAudioFx.jungleMode ? "" : "active"}`} onClick={e => {
          setView(produce(view, d => {
            d[starKey].jungleMode = !starAudioFx.jungleMode
          }))
        }}>HD</button>
      </div>}
      value={starAudioFx.pitch ?? 1}
      sliderMin={-6}
      sliderMax={6}
      min={-36}
      max={36}
      sliderStep={0.1}
      default={0}
      onChange={newValue => {
        setView(produce(view, d => {
          d[starKey].pitch = newValue 
        }))
        newValue !== 0 && ensureCaptured()
      }}
    />
    <SliderPlus
      label={<div>
        <FaVolumeUp size="17px"/>
        <span style={{marginLeft: "10px"}}>{window.gsm.command.adjustGain}</span>
      </div>}
      value={starAudioFx.volume ?? 1}
      sliderMin={0}
      sliderMax={3}
      min={0}
      default={1}
      onChange={newValue => {
        setView(produce(view, d => {
          d[starKey].volume = newValue 
        }))
        newValue !== 1 && ensureCaptured()
      }}
    />
    <SliderPlus
      label={<div>
        <FaArrowsAltH size="17px"/>
        <span style={{marginLeft: "10px"}}>{window.gsm.audio.pan}</span>
      </div>}
      value={view.audioPan ?? 0}
      sliderMin={-1}
      sliderMax={1}
      min={-1}
      default={0}
      onChange={newValue => {
        setView(produce(view, d => {
          d.audioPan = newValue
        }))
        newValue !== 0 && ensureCaptured()
      }}
    />
    <SliderPlus
      label={<div>
        <MdAccessTime size="20px"/>
        <span style={{marginLeft: "10px"}}>{window.gsm.command.adjustDelay}</span>
        <button title={"merge"} style={{marginLeft: "10px"}} className={`toggle ${starAudioFx.delayMerge ? "active" : ""}`} onClick={e => {
          setView(produce(view, d => {
            d[starKey].delayMerge = !starAudioFx.delayMerge
          }))
        }}>+</button>
      </div>}
      value={starAudioFx.delay ?? 0}
      sliderMin={0}
      sliderMax={5}
      min={0}
      max={179}
      default={0}
      onChange={newValue => {
        setView(produce(view, d => {
          d[starKey].delay = newValue 
        }))
        newValue !== 0 && ensureCaptured()
      }}
    />
    {<ReverseButton onActivate={ensureCaptured}/>}
    <EqualizerControl value={starAudioFx.eq} onChange={newValue => {
      setView(produce(view, d => {
        d[starKey].eq = newValue
      }))
      newValue.enabled && ensureCaptured()
    }}/>
  </div>
}