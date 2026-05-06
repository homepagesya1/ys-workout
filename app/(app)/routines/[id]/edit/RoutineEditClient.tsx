'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Routine } from '@/types'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'
import { loadEDBDataForExercises } from '@/lib/exercises'
import { pairSuperset, dissolveSuperset } from '@/lib/supabase/sessions'

interface RoutineSet { id?: string; set_number: number; weight_kg: number|null; reps: number|null; isNew?: boolean }
interface RoutineExercise {
  id: string; routine_id: string; exercise_id: string; position: number
  superset_group: string|null; default_sets: number|null
  exercises?: { id:string; external_id:string|null; name:string|null; source:string }
  routine_sets?: RoutineSet[]
  edbData?: { name:string; imageUrl:string; targetMuscles:string[] }
}
type RenderGroup =
  | { type:'single'; ex:RoutineExercise }
  | { type:'superset'; exA:RoutineExercise; exB:RoutineExercise; groupId:string }

function buildRenderGroups(exercises:RoutineExercise[]): RenderGroup[]{
  const groups:RenderGroup[]=[], seen=new Set<string>()
  exercises.forEach(ex=>{
    if(seen.has(ex.id)) return
    if(ex.superset_group){ const p=exercises.find(e=>e.superset_group===ex.superset_group&&e.id!==ex.id); if(p){ seen.add(ex.id); seen.add(p.id); groups.push({type:'superset',exA:ex,exB:p,groupId:ex.superset_group}); return } }
    seen.add(ex.id); groups.push({type:'single',ex})
  })
  return groups
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SSIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h8M8 12h8M8 18h8M3 6h.01M3 12h.01M3 18h.01"/></svg> }
function ReplaceIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> }
function TrashIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> }

// ─── Note Inline ──────────────────────────────────────────────────────────────
function NoteIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )
}

function NoteInline({ exerciseId, userId, initialNote }: { exerciseId: string; userId: string; initialNote: string }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(initialNote)
  const [saved, setSaved] = useState(false)
  const lastSaved = useRef(initialNote)

  async function save() {
    if (text === lastSaved.current) return
    lastSaved.current = text
    setSaved(true)
    await supabase.from('exercise_notes').upsert(
      { user_id: userId, exercise_id: exerciseId, note: text, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,exercise_id' }
    )
    setTimeout(() => setSaved(false), 1500)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', padding: '2px 0 8px', color: 'var(--color-text-secondary)', fontSize: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '5px', opacity: text ? 0.8 : 0.45 }}>
      <NoteIcon />
      {text ? (text.length > 50 ? text.slice(0, 50) + '…' : text) : 'Add note'}
    </button>
  )

  return (
  <div style={{ paddingBottom: '8px' }}>
    <textarea
      value={text}
      onChange={e => setText(e.target.value)}
      placeholder="Note for this exercise..."
      rows={2}
      style={{ width: '100%', background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '13px', lineHeight: '1.4', padding: '8px 10px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
      <button
        onClick={() => { save(); setOpen(false) }}
        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
      >
        Save
      </button>
      {saved && <span style={{ fontSize: '11px', color: 'var(--color-success)' }}>✓ Saved</span>}
    </div>
  </div>
)
}

// ─── Exercise Menu ─────────────────────────────────────────────────────────────
function ExerciseMenu({ isInSuperset, canPair, onStartPairing, onDissolve, onReplace, onRemove, onClose }: {
  isInSuperset: boolean; canPair: boolean; onStartPairing: () => void; onDissolve: () => void; onReplace: () => void; onRemove: () => void; onClose: () => void
}) {
  const item = (danger = false, disabled = false): React.CSSProperties => ({ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '14px', textAlign: 'left', color: disabled ? 'rgba(255,255,255,0.2)' : danger ? '#FF5A5A' : 'var(--color-text-primary)' })
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={onClose} />
      <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: '220px', background: 'var(--color-bg-elevated, #1a1a2e)', border: '1px solid rgba(151,125,255,0.2)', borderRadius: '14px', padding: '6px', zIndex: 99, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
        {isInSuperset
          ? <button onClick={() => { onDissolve(); onClose() }} style={{ ...item(), color: '#F5A623' }}><SSIcon /> Dissolve Superset</button>
          : <button onClick={() => { if (canPair) { onStartPairing(); onClose() } }} disabled={!canPair} style={item(false, !canPair)}><SSIcon /> Add to Superset</button>
        }
        <button onClick={() => { onReplace(); onClose() }} style={item()}><ReplaceIcon /> Replace Exercise</button>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '6px 0' }} />
        <button onClick={() => { onRemove(); onClose() }} style={item(true)}><TrashIcon /> Remove Exercise</button>
      </div>
    </>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function RoutineEditClient({ routine, initialExercises, initialNotes }: { routine:Routine; initialExercises:RoutineExercise[]; initialNotes: Record<string, string> }) {
  const router = useRouter()
  const [title, setTitle] = useState(routine.title)
  const [description, setDescription] = useState(routine.description??'')
  const [exercises, setExercises] = useState<RoutineExercise[]>(
    initialExercises.map(ex=>({ ...ex, routine_sets: ex.routine_sets?.length ? [...ex.routine_sets].sort((a,b)=>a.set_number-b.set_number) : [{set_number:1,weight_kg:null,reps:null,isNew:true}] }))
  )
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [saving, setSaving] = useState(false)
  const [supersetPickingFor, setSupersetPickingFor] = useState<string|null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string|null>(null)
  const [replacingExerciseId, setReplacingExerciseId] = useState<string|null>(null)
  const [dragState, setDragState] = useState<{ exerciseId:string; exerciseIndex:number; startY:number; currentY:number; targetIndex:number }|null>(null)

  const exerciseRefs = useRef<Map<string,HTMLDivElement>>(new Map())
  const longPressTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const longPressFired = useRef(false)
  const longPressStart = useRef({ y: 0 })
  const dragStateRef = useRef(dragState)
  const exercisesRef = useRef(exercises)
  useEffect(() => { dragStateRef.current = dragState }, [dragState])
  useEffect(() => { exercisesRef.current = exercises }, [exercises])

  const supabase = createClient()

  useEffect(() => {
    if (initialExercises.length === 0) return
    loadEDBDataForExercises(initialExercises).then(updated => {
      setExercises(prev => prev.map((ex, i) => ({ ...ex, edbData: (updated[i] as any).edbData })))
    })
  }, [initialExercises.length])

  useEffect(() => {
    if (!dragState) return
    function onMove(e: TouchEvent) { e.preventDefault(); const cy = e.touches[0].clientY; const ds = dragStateRef.current; if (!ds) return; const others = exercisesRef.current.filter(ex => ex.id !== ds.exerciseId); let ti = others.length; for (let i = 0; i < others.length; i++) { const el = exerciseRefs.current.get(others[i].id); if (!el) continue; const r = el.getBoundingClientRect(); if (cy < r.top + r.height / 2) { ti = i; break } }; setDragState(prev => prev ? { ...prev, currentY: cy, targetIndex: ti } : null) }
    async function onEnd() { const ds = dragStateRef.current; if (!ds) return; const exs = exercisesRef.current; if (ds.targetIndex !== ds.exerciseIndex) { const n = [...exs]; const [m] = n.splice(ds.exerciseIndex, 1); n.splice(ds.targetIndex, 0, m); const u = n.map((ex, i) => ({ ...ex, position: i })); setExercises(u); await Promise.all(u.map(ex => supabase.from('routine_exercises').update({ position: ex.position }).eq('id', ex.id))) }; setDragState(null) }
    window.addEventListener('touchmove', onMove, { passive: false }); window.addEventListener('touchend', onEnd, { passive: true })
    return () => { window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd) }
  }, [!!dragState])

  function handleNameTouchStart(e: React.TouchEvent, exerciseId: string, index: number) { longPressFired.current = false; longPressStart.current = { y: e.touches[0].clientY }; longPressTimer.current = setTimeout(() => { longPressFired.current = true; navigator.vibrate?.(40); setDragState({ exerciseId, exerciseIndex: index, startY: longPressStart.current.y, currentY: longPressStart.current.y, targetIndex: index }) }, 500) }
  function handleNameTouchMove(e: React.TouchEvent) { if (longPressFired.current) return; if (Math.abs(e.touches[0].clientY - longPressStart.current.y) > 10) clearTimeout(longPressTimer.current!) }
  function handleNameTouchEnd() { if (!longPressFired.current) clearTimeout(longPressTimer.current!) }

  function getInsertionLineIndex() { if (!dragState) return -1; const others = exercises.filter(ex => ex.id !== dragState.exerciseId); const target = others[dragState.targetIndex]; if (!target) return exercises.length; return exercises.findIndex(ex => ex.id === target.id) }
  const insertionLineAt = getInsertionLineIndex()

  function updateSet(exId:string, si:number, field:'weight_kg'|'reps', value:string) { const nv = value===''?null:parseFloat(value); setExercises(p=>p.map(ex=>{if(ex.id!==exId)return ex;const s=[...(ex.routine_sets??[])];s[si]={...s[si],[field]:nv};return{...ex,routine_sets:s}})) }
  function addSet(exId:string) { setExercises(p=>p.map(ex=>{if(ex.id!==exId)return ex;const s=ex.routine_sets??[];const ls=s[s.length-1];return{...ex,routine_sets:[...s,{set_number:s.length+1,weight_kg:ls?.weight_kg??null,reps:ls?.reps??null,isNew:true}]}})) }
  function removeSet(exId:string, si:number) { setExercises(p=>p.map(ex=>{if(ex.id!==exId)return ex;const s=(ex.routine_sets??[]).filter((_,i)=>i!==si).map((x,i)=>({...x,set_number:i+1}));return{...ex,routine_sets:s}})) }

  async function addExercise(edbExercise:any) {
    let exerciseId:string|undefined
    if(edbExercise.source==='custom'){exerciseId=edbExercise.exerciseId}
    else{const{data:e}=await supabase.from('exercises').select('id').eq('external_id',edbExercise.exerciseId).eq('source','exercisedb').maybeSingle();exerciseId=e?.id;if(!exerciseId){const{data:n}=await supabase.from('exercises').insert({external_id:edbExercise.exerciseId,source:'exercisedb',name:edbExercise.name}).select('id').single();exerciseId=n?.id}}
    if(!exerciseId)return
    const{data:re}=await supabase.from('routine_exercises').insert({routine_id:routine.id,exercise_id:exerciseId,position:exercises.length,default_sets:3}).select(`*,exercises(id,external_id,name,source)`).single()
    if(re){setExercises(p=>[...p,{...re,routine_sets:[{set_number:1,weight_kg:null,reps:null,isNew:true},{set_number:2,weight_kg:null,reps:null,isNew:true},{set_number:3,weight_kg:null,reps:null,isNew:true}],edbData:{name:edbExercise.name,imageUrl:edbExercise.imageUrl,targetMuscles:edbExercise.targetMuscles}}]);setShowAddExercise(false)}
  }

  async function replaceExercise(edbExercise:any) {
    if(!replacingExerciseId)return
    const reid=replacingExerciseId
    let exerciseId:string|undefined
    if(edbExercise.source==='custom'){exerciseId=edbExercise.exerciseId}
    else{const{data:e}=await supabase.from('exercises').select('id').eq('external_id',edbExercise.exerciseId).eq('source','exercisedb').maybeSingle();exerciseId=e?.id;if(!exerciseId){const{data:n}=await supabase.from('exercises').insert({external_id:edbExercise.exerciseId,source:'exercisedb',name:edbExercise.name}).select('id').single();exerciseId=n?.id}}
    if(!exerciseId)return
    await supabase.from('routine_exercises').update({exercise_id:exerciseId}).eq('id',reid)
    setExercises(prev=>prev.map(ex=>ex.id===reid?{...ex,exercise_id:exerciseId!,edbData:edbExercise,exercises:undefined}:ex))
    setReplacingExerciseId(null)
  }

  async function removeExercise(id:string) { const ex=exercises.find(e=>e.id===id); if(ex?.superset_group){await dissolveSuperset(ex.superset_group,'routine_exercises');setExercises(p=>p.map(e=>e.superset_group===ex.superset_group?{...e,superset_group:null}:e))}; await supabase.from('routine_exercises').delete().eq('id',id); setExercises(p=>p.filter(e=>e.id!==id)) }
  async function handleSupersetPair(targetId:string) { if(!supersetPickingFor)return; const groupId=await pairSuperset(supersetPickingFor,targetId,'routine_exercises'); setExercises(p=>p.map(ex=>ex.id===supersetPickingFor||ex.id===targetId?{...ex,superset_group:groupId}:ex)); setSupersetPickingFor(null) }
  async function handleSupersetDissolve(groupId:string) { await dissolveSuperset(groupId,'routine_exercises'); setExercises(p=>p.map(ex=>ex.superset_group===groupId?{...ex,superset_group:null}:ex)) }

  async function handleUpdate() {
    setSaving(true)
    await supabase.from('routines').update({title:title.trim(),description:description.trim()||null}).eq('id',routine.id)
    await Promise.all(exercises.map(async(ex,index)=>{
      await supabase.from('routine_exercises').update({position:index}).eq('id',ex.id)
      const sets=ex.routine_sets??[]
      await supabase.from('routine_sets').delete().eq('routine_exercise_id',ex.id)
      if(sets.length>0)await supabase.from('routine_sets').insert(sets.map(s=>({routine_exercise_id:ex.id,set_number:s.set_number,weight_kg:s.weight_kg,reps:s.reps})))
    }))
    setSaving(false); router.push('/routines'); router.refresh()
  }

  const renderGroups = buildRenderGroups(exercises)

  function renderExBlock(ex:RoutineExercise, index:number) {
    const name = ex.edbData?.name??ex.exercises?.name??'Loading...'
    const isInSS = !!ex.superset_group
    const isPairingTarget = !!supersetPickingFor&&supersetPickingFor!==ex.id&&!isInSS
    const canPair = !isInSS&&exercises.filter(e=>!e.superset_group&&e.id!==ex.id).length>0
    const isDragging = dragState?.exerciseId===ex.id
    const isMenuOpen = menuOpenId===ex.id

    return (
      <div key={ex.id} ref={el=>{if(el)exerciseRefs.current.set(ex.id,el);else exerciseRefs.current.delete(ex.id)}} style={{opacity:isDragging?0.4:1,transition:'opacity 0.15s'}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'var(--spacing-sm)',flex:1,minWidth:0}} onClick={()=>isPairingTarget&&handleSupersetPair(ex.id)}>
            <div style={{width:'36px',height:'36px',borderRadius:'var(--radius-full)',overflow:'hidden',background:isPairingTarget?'rgba(151,125,255,0.3)':'rgba(151,125,255,0.2)',border:isPairingTarget?'2px solid rgba(151,125,255,0.8)':'1px solid rgba(151,125,255,0.3)',flexShrink:0,cursor:isPairingTarget?'pointer':'default',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
              {isPairingTarget?<span style={{color:'var(--color-primary)',fontSize:'18px',fontWeight:'700'}}>+</span>:ex.edbData?.imageUrl?<img src={ex.edbData.imageUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'16px'}}>💪</span>}
            </div>
            <button onTouchStart={e=>!supersetPickingFor&&handleNameTouchStart(e,ex.id,index)} onTouchMove={handleNameTouchMove} onTouchEnd={handleNameTouchEnd} onContextMenu={e=>e.preventDefault()} style={{background:'none',border:'none',padding:0,textAlign:'left',color:'var(--color-primary)',fontWeight:'600',fontSize:'var(--font-size-md)',cursor:isPairingTarget?'pointer':dragState?'grabbing':'grab',WebkitUserSelect:'none',userSelect:'none',WebkitTouchCallout:'none' as any,opacity:supersetPickingFor&&!isPairingTarget&&supersetPickingFor!==ex.id?0.35:1,transition:'opacity 0.2s'}}>
              {name}
              {isPairingTarget&&<span style={{fontSize:'11px',marginLeft:'6px',fontWeight:'400',color:'var(--color-text-secondary)'}}>tap to pair</span>}
            </button>
          </div>
          <div style={{position:'relative'}}>
            <button onClick={()=>!supersetPickingFor&&setMenuOpenId(isMenuOpen?null:ex.id)} style={{background:isMenuOpen?'rgba(151,125,255,0.12)':'none',border:'none',borderRadius:'8px',color:'var(--color-text-secondary)',fontSize:'18px',padding:'4px 8px',cursor:'pointer',opacity:supersetPickingFor&&supersetPickingFor!==ex.id?0.3:1,transition:'all 0.15s'}}>···</button>
            {isMenuOpen&&<ExerciseMenu isInSuperset={isInSS} canPair={canPair} onStartPairing={()=>setSupersetPickingFor(ex.id)} onDissolve={()=>ex.superset_group&&handleSupersetDissolve(ex.superset_group)} onReplace={()=>setReplacingExerciseId(ex.id)} onRemove={()=>removeExercise(ex.id)} onClose={()=>setMenuOpenId(null)}/>}
          </div>
        </div>

        {/* ── Note field ── */}
        <div style={{paddingLeft:'44px'}}>
          <NoteInline exerciseId={ex.exercise_id} userId={routine.user_id} initialNote={initialNotes[ex.exercise_id]??''} />
        </div>

        <div className="glass" style={{overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr 32px',padding:'8px var(--spacing-md)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            {['Set','kg','Reps',''].map(h=><span key={h} style={{fontSize:'11px',color:'var(--color-text-secondary)',textAlign:'center',fontWeight:'500'}}>{h}</span>)}
          </div>
          {(ex.routine_sets??[]).map((s,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr 32px',padding:'10px var(--spacing-md)',background:i%2===1?'rgba(6,0,171,0.3)':'transparent',borderBottom:'1px solid rgba(255,255,255,0.03)',alignItems:'center'}}>
              <span style={{textAlign:'center',color:'var(--color-text-secondary)',fontSize:'var(--font-size-sm)',fontWeight:'600'}}>{s.set_number}</span>
              <input type="number" inputMode="decimal" placeholder="0" value={s.weight_kg??''} onFocus={e=>e.target.select()} onChange={e=>updateSet(ex.id,i,'weight_kg',e.target.value)} style={{textAlign:'center',width:'100%',fontSize:'16px',fontWeight:'500'}}/>
              <input type="number" inputMode="numeric" placeholder="0" value={s.reps??''} onFocus={e=>e.target.select()} onChange={e=>updateSet(ex.id,i,'reps',e.target.value)} style={{textAlign:'center',width:'100%',fontSize:'16px',fontWeight:'500'}}/>
              <button onClick={()=>removeSet(ex.id,i)} style={{background:'none',border:'none',color:'var(--color-danger)',fontSize:'16px',textAlign:'center',padding:0,cursor:'pointer'}}>×</button>
            </div>
          ))}
          <button onClick={()=>addSet(ex.id)} style={{width:'100%',padding:'var(--spacing-sm)',background:'rgba(151,125,255,0.1)',border:'none',color:'var(--color-primary)',fontSize:'var(--font-size-sm)',fontWeight:'500',cursor:'pointer'}}>+ Add Set</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100dvh',backgroundColor:'var(--color-bg)',paddingBottom:'40px'}}>
      {supersetPickingFor&&(
        <div style={{position:'fixed',top:0,left:0,right:0,zIndex:150,background:'var(--color-primary)',padding:'12px var(--spacing-md)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'var(--font-size-sm)',fontWeight:'600',color:'#0E0E10'}}>Choose an exercise for the superset</span>
          <button onClick={()=>setSupersetPickingFor(null)} style={{background:'rgba(0,0,0,0.15)',border:'none',borderRadius:'8px',padding:'4px 12px',color:'#0E0E10',fontWeight:'600',fontSize:'var(--font-size-sm)',cursor:'pointer'}}>Cancel</button>
        </div>
      )}

      <div className="glass-nav" style={{position:'sticky',top:supersetPickingFor?'44px':0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px var(--spacing-md)',zIndex:100,borderTop:'none',borderBottom:'1px solid rgba(151,125,255,0.15)',transition:'top 0.2s'}}>
        <button onClick={()=>router.push('/routines')} style={{background:'none',border:'none',color:'var(--color-text-secondary)',fontWeight:'500',cursor:'pointer'}}>Cancel</button>
        <span style={{fontWeight:'600',fontSize:'var(--font-size-md)'}}>Edit Routine</span>
        <button onClick={handleUpdate} disabled={saving||!title.trim()} style={{background:'none',border:'none',color:title.trim()?'var(--color-primary)':'var(--color-text-secondary)',fontWeight:'600',fontSize:'var(--font-size-base)',cursor:'pointer'}}>{saving?'Saving...':'Update'}</button>
      </div>

      <div style={{padding:'var(--spacing-md)',display:'flex',flexDirection:'column',gap:'var(--spacing-lg)'}}>
        <div className="glass" style={{padding:'var(--spacing-md)',display:'flex',flexDirection:'column',gap:'var(--spacing-md)'}}>
          <div style={{borderBottom:'1px solid rgba(151,125,255,0.3)',paddingBottom:'var(--spacing-sm)'}}>
            <label style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-secondary)',display:'block',marginBottom:'4px'}}>Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Routine title" style={{fontSize:'16px',fontWeight:'600'}}/>
          </div>
          <div>
            <label style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-secondary)',display:'block',marginBottom:'4px'}}>Description</label>
            <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Optional description" style={{fontSize:'16px'}}/>
          </div>
        </div>

        {exercises.length>1&&<p style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-secondary)',textAlign:'center',opacity:0.6}}>Hold exercise name to reorder</p>}

        {renderGroups.map((group)=>{
          if(group.type==='single'){
            const isDragging=dragState?.exerciseId===group.ex.id
            const idx=exercises.findIndex(e=>e.id===group.ex.id)
            return(<div key={group.ex.id}>{dragState&&!isDragging&&insertionLineAt===idx&&<div style={{height:'2px',borderRadius:'2px',margin:'0 0 8px',background:'var(--color-primary)',boxShadow:'0 0 6px color-mix(in srgb, var(--color-primary) 60%, transparent)'}}/>}{renderExBlock(group.ex,idx)}</div>)
          }
          const idxA=exercises.findIndex(e=>e.id===group.exA.id)
          return(
            <div key={group.groupId} style={{display:'flex',gap:'10px'}}>
              <div style={{width:'3px',borderRadius:'3px',background:'linear-gradient(to bottom, var(--color-primary), color-mix(in srgb, var(--color-primary) 30%, transparent))',flexShrink:0,marginTop:'6px'}}/>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--spacing-lg)',minWidth:0}}>
                <div style={{marginBottom:'-6px'}}><span style={{fontSize:'10px',fontWeight:'700',letterSpacing:'0.08em',color:'var(--color-primary)',background:'color-mix(in srgb, var(--color-primary) 12%, transparent)',border:'1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',borderRadius:'var(--radius-full)',padding:'2px 8px'}}>SUPERSET</span></div>
                {renderExBlock(group.exA,idxA)}
                {renderExBlock(group.exB,idxA+1)}
              </div>
            </div>
          )
        })}

        {dragState&&insertionLineAt===exercises.length&&<div style={{height:'2px',borderRadius:'2px',background:'var(--color-primary)',boxShadow:'0 0 6px color-mix(in srgb, var(--color-primary) 60%, transparent)'}}/>}

        <button onClick={()=>setShowAddExercise(true)} style={{width:'100%',padding:'var(--spacing-md)',background:'rgba(151,125,255,0.1)',border:'1px solid rgba(151,125,255,0.3)',borderRadius:'var(--radius-main)',color:'var(--color-primary)',fontSize:'var(--font-size-md)',fontWeight:'600',cursor:'pointer'}}>+ Add Exercise</button>
      </div>

      {showAddExercise&&<AddExerciseModal onAdd={addExercise} onClose={()=>setShowAddExercise(false)}/>}
      {replacingExerciseId&&<AddExerciseModal onAdd={replaceExercise} onClose={()=>setReplacingExerciseId(null)}/>}
    </div>
  )
}