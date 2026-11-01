import React,{useState,useEffect,useRef} from 'react';
import {Mic,MicOff,Play,Square,RotateCcw,Check,Upload,Volume2,X,ArrowRight} from 'lucide-react';
import {mic,record,createMeter,audioBus,audioPrefs,silenceEffects} from './audio.js';

export function Avatar({kind='blob',size=48,className=''}){
 const colors={blob:'var(--violet)',star:'var(--gold)',ghost:'var(--mint)',cat:'var(--coral)',robot:'var(--blue)',frog:'var(--mint)',cloud:'var(--blue)',flower:'var(--coral)'};
 const shapes={blob:<path d="M14 47C8 24 20 9 38 12C51 4 69 20 66 35C79 52 62 72 46 68C27 79 10 65 14 47Z"/>,star:<path d="m40 5 10 19 21-5-6 22 12 17-23 3-14 16-10-20-23-3 15-18-3-22 21 8Z"/>,ghost:<path d="M15 66V34a25 25 0 0 1 50 0v32l-10-8-9 9-10-8-10 9Z"/>,cat:<path d="M14 18 30 27Q40 22 50 27L66 16l-1 35Q62 70 40 69 14 69 14 49Z"/>,robot:<><rect x="12" y="22" width="56" height="44" rx="12"/><path d="M37 22V11h6v11Z"/></>,frog:<><ellipse cx="40" cy="47" rx="29" ry="23"/><circle cx="23" cy="27" r="13"/><circle cx="57" cy="27" r="13"/></>,cloud:<path d="M16 60C0 55 5 33 20 33 15 10 47 6 53 27 78 23 83 59 63 62Z"/>,flower:<path d="M40 9C53 0 59 15 55 24 78 13 81 41 65 44 82 59 58 78 49 62 44 85 22 77 26 59 5 67 0 42 19 37 0 20 22 7 30 24 28 14 33 9 40 9Z"/>};
 return <svg width={size} height={size} viewBox="0 0 80 80" className={`avatar ${className}`} role="img" aria-label={`${kind} avatar`}><g fill={colors[kind]||colors.blob}>{shapes[kind]||shapes.blob}</g><g fill="#222231"><ellipse cx="30" cy="40" rx="3" ry="5"/><ellipse cx="50" cy="40" rx="3" ry="5"/></g><path d="M34 51q6 6 12 0" fill="none" stroke="#222231" strokeWidth="3" strokeLinecap="round"/></svg>;
}
export function Wave({level=0,decorative=false}){return <div className={`wave ${decorative?'decorative':''}`} aria-hidden="true">{Array.from({length:31},(_,i)=><i key={i} style={{height:`${decorative?12+Math.abs(Math.sin(i*1.8))*42:5+level*(15+Math.abs(Math.sin(i*1.8))*75)}px`}}/>)}</div>;}
export function Modal({title,children,onClose}){
 const ref=useRef();useEffect(()=>{const previous=document.activeElement;ref.current.showModal();return ()=>previous?.focus?.();},[]);
 return <dialog ref={ref} onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}><div className="dialog-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X/></button></div>{children}</dialog>;
}
export function PlayerAudio({audioId,session,auto=false,replay=0,onPlay,onEnded,label='Play sound'}){
 const ref=useRef(),busy=useRef(false);const [url,setUrl]=useState(''),[error,setError]=useState('');
 const release=()=>{if(busy.current){audioBus.busy=Math.max(0,audioBus.busy-1);busy.current=false;}};
 useEffect(()=>{let cancelled=false,objectUrl;setUrl('');setError('');fetch(`/api/rooms/${session.code}/audio/${audioId}`,{headers:{Authorization:`Bearer ${session.token}`}}).then(async r=>{if(!r.ok)throw Error('This sound is unavailable or has expired.');return r.blob();}).then(blob=>{if(cancelled)return;objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}).catch(e=>{if(!cancelled)setError(e.message);});return ()=>{cancelled=true;if(objectUrl)URL.revokeObjectURL(objectUrl);release();};},[audioId,session.code,session.token]);
 useEffect(()=>{if(ref.current){ref.current.volume=audioPrefs.voice;if(auto&&url){ref.current.currentTime=0;ref.current.play().catch(()=>setError('Tap play to enable audio.'));}}},[url,replay,auto]);
 useEffect(()=>{const update=()=>{if(ref.current)ref.current.volume=audioPrefs.voice;};window.addEventListener('audio-prefs',update);return ()=>window.removeEventListener('audio-prefs',update);},[]);
 return <div className="audio-player">{url?<audio ref={ref} aria-label={label} controls src={url} onPlay={()=>{silenceEffects();if(!busy.current){busy.current=true;audioBus.busy++;}setError('');onPlay?.();}} onPause={release} onEnded={()=>{release();onEnded?.();}}/>:<span>Loading sound…</span>}{error&&<small role="status">{error}</small>}</div>;
}
export function Recorder({maxSeconds=10,onSubmit,onMic,check=false}){
 const [recording,setRecording]=useState(false),[blob,setBlob]=useState(null),[url,setUrl]=useState(''),[level,setLevel]=useState(0),[elapsed,setElapsed]=useState(0),[error,setError]=useState(''),[uploading,setUploading]=useState(false),[devices,setDevices]=useState([]);
 const stop=useRef(),meter=useRef(),alive=useRef(true),duration=useRef(0),preview=useRef();
 useEffect(()=>()=>{alive.current=false;stop.current?.();meter.current?.();mic.stop();},[]);
 useEffect(()=>{if(!blob)return;const u=URL.createObjectURL(blob);setUrl(u);return ()=>URL.revokeObjectURL(u);},[blob]);
 useEffect(()=>{if(!recording)return;const t=setInterval(()=>setElapsed(e=>Math.min(maxSeconds,e+0.1)),100);return ()=>clearInterval(t);},[recording,maxSeconds]);
 const begin=async()=>{
   setError('');setBlob(null);setElapsed(0);preview.current?.pause();
   try{
     const stream=await mic.acquire();if(!alive.current){mic.stop();return;}stream.getAudioTracks().forEach(t=>t.enabled=true);onMic?.(true);
     setDevices((await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='audioinput'));
     meter.current=createMeter(stream,setLevel);setRecording(true);
     stop.current=record(stream,maxSeconds,(b,d)=>{meter.current?.();mic.stop();if(alive.current){duration.current=d;setRecording(false);setBlob(b);}});
   }catch(e){setError(e.message);onMic?.(false);}
 };
 const submit=async()=>{setUploading(true);setError('');try{await onSubmit(blob,duration.current);}catch(e){setError(e.message);}finally{if(alive.current)setUploading(false);}};
 return <div className="recorder">
   <div className={`record-orb ${recording?'recording':''}`}><Mic size={38}/></div>
   <Wave level={level}/><p className="record-status" role="status">{recording?`Recording · ${elapsed.toFixed(1)} / ${maxSeconds}s`:blob?'Nice. Give it a listen.':check?'Let’s hear your lovely noise.':'Your voice. No words. Go weird.'}</p>
   {recording?<button className="button danger" onClick={()=>stop.current?.()}><Square size={17}/>Stop recording</button>:<button className="button primary" onClick={begin} disabled={uploading}>{blob?<RotateCcw size={18}/>:<Mic size={18}/>} {blob?'Record again':check?'Test microphone':'Start recording'}</button>}
   {blob&&<div className="preview-take"><audio ref={preview} controls src={url} aria-label="Preview your recording"/><span>{duration.current.toFixed(1)} seconds · only you can hear this preview</span>{!check&&<button className="button mint" onClick={submit} disabled={uploading}>{uploading?<Upload size={18}/>:<Check size={18}/>} {uploading?'Uploading…':'Submit this sound'}</button>}</div>}
   {error&&<p role="alert" className="error">{error}</p>}
   {check&&<><label className="field">Microphone<select value={mic.device} disabled={recording} onChange={e=>{mic.device=e.target.value;mic.stop();setDevices([...devices]);}}><option value="">System default</option>{devices.map(d=><option key={d.deviceId} value={d.deviceId}>{d.label||'Microphone'}</option>)}</select></label><label className="check-row"><input type="checkbox" defaultChecked={mic.performance} disabled={recording} onChange={e=>{mic.performance=e.target.checked;mic.stop();}}/>Performance mode: keep humming and unusual sounds</label><p className="muted small">Browser support varies. Headphones help keep other players out of your microphone. This test stays on your device.</p></>}
 </div>;
}
export function Foley({scene='bounce',playKey=0,playing=false}){
 const ref=useRef();useEffect(()=>{if(playing){ref.current.getAnimations({subtree:true}).forEach(a=>{a.currentTime=0;a.play();});}},[playKey,playing]);
 return <div ref={ref} className={`foley-scene ${scene} ${playing?'playing':''}`} aria-label={`Silent animation: ${scene==='bounce'?'a bouncing creature':scene==='slip'?'a slipping robot':'a dramatic door opening'}`}><div className="foley-floor"/>{scene==='door'?<div className="door-frame"><div className="door-panel"><i/></div><span>!</span></div>:<div className="foley-actor"><Avatar kind={scene==='slip'?'robot':'blob'} size={90}/></div>}<span className="scene-caption">SILENT SHORT · {scene==='bounce'?'THE BIG BOUNCE':scene==='slip'?'WATCH YOUR STEP':'WHO’S THERE?'}</span></div>;
}
