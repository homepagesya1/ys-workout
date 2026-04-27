'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Routine } from '@/types'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'
import { loadEDBDataForExercises } from '@/lib/exercises'
import { pairSuperset, dissolveSuperset } from '@/lib/supabase/sessions'

interface RoutineSet {
  id?: string; set_number: number; weight_kg: number|null; reps: number|null; isNew?: boolean
}
interface RoutineExercise {
  id: string; routine_id: string; exercise_id: string; position: number
  superset_group: string|null; default_sets: number|null
  exercises?: { id:string; external_id:string|null; name:string|null; source:string }
  routine_sets?: RoutineSet[]
  edbData?: { name:string; imageUrl:string; targetMuscles:string[] }
}
type RenderGroup =
  | { type:'single';   ex:RoutineExercise }
  | { type:'superset'; exA:RoutineExercise; exB:RoutineExercise; groupId:string }

function buildRenderGroups(exercises:RoutineExercise[]): RenderGroup[]{
  const groups:RenderGroup[]=[], seen=new Set<string>()
  exercises.forEach(ex=>{
    if(seen.has(ex.id)) return
    if(ex.superset_group){
      const p=exercises.find(e=>e.superset_group===ex.superset_group&&e.id!==ex.id)
      if(p){ seen.add(ex.id); seen.add(p.id); groups.push({type:'superset',exA:ex,exB:p,groupId:ex.superset_group}); return }
    }
    seen.add(ex.id); groups.push({type:'single',ex})
  })
  return groups
}

export default function RoutineEditClient({ routine, initialExercises }: { routine:Routine; initialExercises:RoutineExercise[] }) {
  const router = useRouter()
  const [title,       setTitle]       = useState(routine.title)
  const [description, setDescription] = useState(routine.description??'')
  const [exercises,   setExercises]   = useState<RoutineExercise[]>(
    initialExercises.map(ex=>({ ...ex, routine_sets: ex.routine_sets?.length ? [...ex.routine_sets].sort((a,b)=>a.set_number-b.set_number) : [{set_number:1,weight_kg:null,reps:null,isNew:true}] }))
  )
  const [showAddExercise,    setShowAddExercise]    = useState(false)
  const [saving,             setSaving]             = useState(false)
  const [supersetPickingFor, setSupersetPickingFor] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(()=>{
    if(initialExercises.length===0) return
    loadEDBDataForExercises(initialExercises).then(updated=>{
      setExercises(prev=>prev.map((ex,i)=>({...ex,edbData:(updated[i] as any).edbData})))
    })
  },[initialExercises.length])

  function updateSet(exId:string,si:number,field:'weight_kg'|'reps',value:string){
    const nv=value===''?null:parseFloat(value)
    setExercises(p=>p.map(ex=>{ if(ex.id!==exId) return ex; const s=[...(ex.routine_sets??[])]; s[si]={...s[si],[field]:nv}; return{...ex,routine_sets:s} }))
  }
  function addSet(exId:string){
    setExercises(p=>p.map(ex=>{ if(ex.id!==exId) return ex; const s=ex.routine_sets??[]; const ls=s[s.length-1]; return{...ex,routine_sets:[...s,{set_number:s.length+1,weight_kg:ls?.weight_kg??null,reps:ls?.reps??null,isNew:true}]} }))
  }
  function removeSet(exId:string,si:number){
    setExercises(p=>p.map(ex=>{ if(ex.id!==exId) return ex; const s=(ex.routine_sets??[]).filter((_,i)=>i!==si).map((x,i)=>({...x,set_number:i+1})); return{...ex,routine_sets:s} }))
  }

  async function addExercise(edbExercise:any){
    let exerciseId:string|undefined
    if(edbExercise.source==='custom'){ exerciseId=edbExercise.exerciseId }
    else{
      const{data:e}=await supabase.from('exercises').select('id').eq('external_id',edbExercise.exerciseId).eq('source','exercisedb').maybeSingle()
      exerciseId=e?.id
      if(!exerciseId){ const{data:n}=await supabase.from('exercises').insert({external_id:edbExercise.exerciseId,source:'exercisedb',name:edbExercise.name}).select('id').single(); exerciseId=n?.id }
    }
    if(!exerciseId) return
    const{data:re}=await supabase.from('routine_exercises').insert({routine_id:routine.id,exercise_id:exerciseId,position:exercises.length,default_sets:3}).select(`*,exercises(id,external_id,name,source)`).single()
    if(re){
      setExercises(p=>[...p,{...re,routine_sets:[{set_number:1,weight_kg:null,reps:null,isNew:true},{set_number:2,weight_kg:null,reps:null,isNew:true},{set_number:3,weight_kg:null,reps:null,isNew:true}],edbData:{name:edbExercise.name,imageUrl:edbExercise.imageUrl,targetMuscles:edbExercise.targetMuscles}}])
      setShowAddExercise(false)
    }
  }

  async function removeExercise(id:string){
    const ex=exercises.find(e=>e.id===id)
    if(ex?.superset_group){ await dissolveSuperset(ex.superset_group,'routine_exercises'); setExercises(p=>p.map(e=>e.superset_group===ex.superset_group?{...e,superset_group:null}:e)) }
    await supabase.from('routine_exercises').delete().eq('id',id)
    setExercises(p=>p.filter(e=>e.id!==id))
  }

  async function handleSupersetPair(targetId:string){
    if(!supersetPickingFor) return
    const groupId=await pairSuperset(supersetPickingFor,targetId,'routine_exercises')
    setExercises(p=>p.map(ex=>ex.id===supersetPickingFor||ex.id===targetId?{...ex,superset_group:groupId}:ex))
    setSupersetPickingFor(null)
  }

  async function handleSupersetDissolve(groupId:string){
    await dissolveSuperset(groupId,'routine_exercises')
    setExercises(p=>p.map(ex=>ex.superset_group===groupId?{...ex,superset_group:null}:ex))
  }

  async function handleUpdate(){
    setSaving(true)
    await supabase.from('routines').update({title:title.trim(),description:description.trim()||null}).eq('id',routine.id)
    for(const ex of exercises){
      const sets=ex.routine_sets??[]
      await supabase.from('routine_sets').delete().eq('routine_exercise_id',ex.id)
      if(sets.length>0) await supabase.from('routine_sets').insert(sets.map(s=>({routine_exercise_id:ex.id,set_number:s.set_number,weight_kg:s.weight_kg,reps:s.reps})))
    }
    setSaving(false); router.push('/routines'); router.refresh()
  }

  const renderGroups=buildRenderGroups(exercises)

  function renderExBlock(ex:RoutineExercise){
    const name=ex.edbData?.name??ex.exercises?.name??'Loading...'
    const isInSS=!!ex.superset_group
    const isPairingTarget=!!supersetPickingFor&&supersetPickingFor!==ex.id&&!isInSS
    const canPair=!isInSS&&exercises.filter(e=>!e.superset_group&&e.id!==ex.id).length>0

    return(
      <div key={ex.id}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'var(--spacing-sm)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'var(--spacing-sm)',flex:1,minWidth:0}}
            onClick={()=>isPairingTarget&&handleSupersetPair(ex.id)}>
            <div style={{
              width:'36px',height:'36px',borderRadius:'var(--radius-full)',overflow:'hidden',
              background:isPairingTarget?'rgba(151,125,255,0.3)':'rgba(151,125,255,0.2)',
              border:isPairingTarget?'2px solid rgba(151,125,255,0.8)':'1px solid rgba(151,125,255,0.3)',
              flexShrink:0,cursor:isPairingTarget?'pointer':'default',
              display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',
            }}>
              {isPairingTarget
                ? <span style={{color:'var(--color-primary)',fontSize:'18px',fontWeight:'700'}}>+</span>
                : ex.edbData?.imageUrl
                  ? <img src={ex.edbData.imageUrl} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <span style={{fontSize:'16px'}}>💪</span>
              }
            </div>
            <span style={{fontWeight:'600',color:'var(--color-primary)',fontSize:'var(--font-size-md)',opacity:supersetPickingFor&&!isPairingTarget&&supersetPickingFor!==ex.id?0.35:1,transition:'opacity 0.2s',cursor:isPairingTarget?'pointer':'default'}}>
              {name}
              {isPairingTarget&&<span style={{fontSize:'11px',marginLeft:'6px',fontWeight:'400',color:'var(--color-text-secondary)'}}>tippe zum pairen</span>}
            </span>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            {/* Superset button */}
            {!supersetPickingFor&&(
              isInSS
                ? <button onClick={()=>ex.superset_group&&handleSupersetDissolve(ex.superset_group)} style={{background:'none',border:'none',color:'#F5A623',fontSize:'var(--font-size-sm)',fontWeight:'500',cursor:'pointer'}}>SS ✕</button>
                : <button onClick={()=>canPair&&setSupersetPickingFor(ex.id)} disabled={!canPair} style={{background:'none',border:'none',color:canPair?'var(--color-text-secondary)':'rgba(255,255,255,0.2)',fontSize:'var(--font-size-sm)',cursor:canPair?'pointer':'not-allowed'}}>SS</button>
            )}
            <button onClick={()=>removeExercise(ex.id)} style={{background:'none',border:'none',color:'var(--color-danger)',fontSize:'var(--font-size-sm)',fontWeight:'500',cursor:'pointer'}}>Remove</button>
          </div>
        </div>

        <div className="glass" style={{overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr 32px',padding:'8px var(--spacing-md)',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            {['Satz','kg','Wdh.',''].map(h=><span key={h} style={{fontSize:'11px',color:'var(--color-text-secondary)',textAlign:'center',fontWeight:'500'}}>{h}</span>)}
          </div>
          {(ex.routine_sets??[]).map((s,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr 32px',padding:'10px var(--spacing-md)',background:i%2===1?'rgba(6,0,171,0.3)':'transparent',borderBottom:'1px solid rgba(255,255,255,0.03)',alignItems:'center'}}>
              <span style={{textAlign:'center',color:'var(--color-text-secondary)',fontSize:'var(--font-size-sm)',fontWeight:'600'}}>{s.set_number}</span>
              <input type="number" inputMode="decimal" placeholder="0" value={s.weight_kg??''} onChange={e=>updateSet(ex.id,i,'weight_kg',e.target.value)} style={{textAlign:'center',width:'100%',fontSize:'var(--font-size-base)',fontWeight:'500'}}/>
              <input type="number" inputMode="numeric" placeholder="0" value={s.reps??''} onChange={e=>updateSet(ex.id,i,'reps',e.target.value)} style={{textAlign:'center',width:'100%',fontSize:'var(--font-size-base)',fontWeight:'500'}}/>
              <button onClick={()=>removeSet(ex.id,i)} style={{background:'none',border:'none',color:'var(--color-danger)',fontSize:'16px',textAlign:'center',padding:0,cursor:'pointer'}}>×</button>
            </div>
          ))}
          <button onClick={()=>addSet(ex.id)} style={{width:'100%',padding:'var(--spacing-sm)',background:'rgba(151,125,255,0.1)',border:'none',color:'var(--color-primary)',fontSize:'var(--font-size-sm)',fontWeight:'500',cursor:'pointer'}}>+ Satz hinzufügen</button>
        </div>
      </div>
    )
  }

  return(
    <div style={{minHeight:'100dvh',backgroundColor:'var(--color-bg)',paddingBottom:'40px'}}>

      {/* Superset banner */}
      {supersetPickingFor&&(
        <div style={{position:'fixed',top:0,left:0,right:0,zIndex:150,background:'var(--color-primary)',padding:'12px var(--spacing-md)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:'var(--font-size-sm)',fontWeight:'600',color:'#0E0E10'}}>Wähle eine Übung für das Superset</span>
          <button onClick={()=>setSupersetPickingFor(null)} style={{background:'rgba(0,0,0,0.15)',border:'none',borderRadius:'8px',padding:'4px 12px',color:'#0E0E10',fontWeight:'600',fontSize:'var(--font-size-sm)',cursor:'pointer'}}>Abbrechen</button>
        </div>
      )}

      <div className="glass-nav" style={{position:'sticky',top:supersetPickingFor?'44px':0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px var(--spacing-md)',zIndex:100,borderTop:'none',borderBottom:'1px solid rgba(151,125,255,0.15)',transition:'top 0.2s'}}>
        <button onClick={()=>router.push('/routines')} style={{background:'none',border:'none',color:'var(--color-text-secondary)',fontWeight:'500',cursor:'pointer'}}>Cancel</button>
        <span style={{fontWeight:'600',fontSize:'var(--font-size-md)'}}>Edit Routine</span>
        <button onClick={handleUpdate} disabled={saving||!title.trim()} style={{background:'none',border:'none',color:title.trim()?'var(--color-primary)':'var(--color-text-secondary)',fontWeight:'600',fontSize:'var(--font-size-base)',cursor:'pointer'}}>
          {saving?'Saving...':'Update'}
        </button>
      </div>

      <div style={{padding:'var(--spacing-md)',display:'flex',flexDirection:'column',gap:'var(--spacing-lg)'}}>
        <div className="glass" style={{padding:'var(--spacing-md)',display:'flex',flexDirection:'column',gap:'var(--spacing-md)'}}>
          <div style={{borderBottom:'1px solid rgba(151,125,255,0.3)',paddingBottom:'var(--spacing-sm)'}}>
            <label style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-secondary)',display:'block',marginBottom:'4px'}}>Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Routine title" style={{fontSize:'var(--font-size-md)',fontWeight:'600'}}/>
          </div>
          <div>
            <label style={{fontSize:'var(--font-size-sm)',color:'var(--color-text-secondary)',display:'block',marginBottom:'4px'}}>Description</label>
            <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Optional description"/>
          </div>
        </div>

        {renderGroups.map(group=>{
          if(group.type==='single') return renderExBlock(group.ex)
          return(
            <div key={group.groupId} style={{display:'flex',gap:'10px'}}>
              <div style={{width:'3px',borderRadius:'3px',background:'linear-gradient(to bottom, var(--color-primary), color-mix(in srgb, var(--color-primary) 30%, transparent))',flexShrink:0,marginTop:'6px'}}/>
              <div style={{flex:1,display:'flex',flexDirection:'column',gap:'var(--spacing-lg)',minWidth:0}}>
                <div style={{marginBottom:'-6px'}}>
                  <span style={{fontSize:'10px',fontWeight:'700',letterSpacing:'0.08em',color:'var(--color-primary)',background:'color-mix(in srgb, var(--color-primary) 12%, transparent)',border:'1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',borderRadius:'var(--radius-full)',padding:'2px 8px'}}>SUPERSET</span>
                </div>
                {renderExBlock(group.exA)}
                {renderExBlock(group.exB)}
              </div>
            </div>
          )
        })}

        <button onClick={()=>setShowAddExercise(true)} style={{width:'100%',padding:'var(--spacing-md)',background:'rgba(151,125,255,0.1)',border:'1px solid rgba(151,125,255,0.3)',borderRadius:'var(--radius-main)',color:'var(--color-primary)',fontSize:'var(--font-size-md)',fontWeight:'600',cursor:'pointer'}}>
          + Add Exercise
        </button>
      </div>

      {showAddExercise&&<AddExerciseModal onAdd={addExercise} onClose={()=>setShowAddExercise(false)}/>}
    </div>
  )
}