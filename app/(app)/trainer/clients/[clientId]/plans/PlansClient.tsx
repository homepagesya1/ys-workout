'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCoachLang } from '@/lib/coachLang'
import AddExerciseModal from '@/components/exercise/AddExerciseModal'
import type { ClientFolder, TrainingPlan, TrainerPlanExercise } from '@/types'

interface ClientWithFolders {
  id: string
  name: string
  folders: ClientFolder[]
}

interface Props {
  trainerId: string
  clientId: string
  clientName: string
  folders: ClientFolder[]
  plans: TrainingPlan[]
  sharedPlanIds: string[]
  templates: TrainingPlan[]
  allClients: ClientWithFolders[]
  isTemplates?: boolean
}

interface PlanEditorState {
  planId: string | null
  folderId: string
  name: string
  exercises: TrainerPlanExercise[]
}

// ── Shared button styles ──────────────────────────────────────────────────────
const cancelBtnStyle: React.CSSProperties = {
  flex: 1, padding: '10px', borderRadius: 'var(--radius-main)',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--color-text)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer',
}
const dangerBtnStyle: React.CSSProperties = {
  flex: 1, padding: '10px', borderRadius: 'var(--radius-main)',
  background: 'color-mix(in srgb, var(--color-danger) 15%, transparent)',
  border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)',
  color: 'var(--color-danger)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer',
}
const menuItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '10px 16px',
  background: 'none', border: 'none', textAlign: 'left',
  color: 'var(--color-text)', fontSize: 'var(--font-size-sm)',
  cursor: 'pointer', whiteSpace: 'nowrap',
}
const menuDangerStyle: React.CSSProperties = { ...menuItemStyle, color: 'var(--color-danger)' }

// ── Bottom-sheet modal ────────────────────────────────────────────────────────
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="glass"
        style={{ width: '100%', maxWidth: '480px', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-main) var(--radius-main) 0 0', paddingBottom: 'calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px))' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// ── Exercise row (plan editor) ────────────────────────────────────────────────
function ExerciseRow({ ex, index, total, onChange, onRemove, onMoveUp, onMoveDown }: {
  ex: TrainerPlanExercise; index: number; total: number
  onChange: (u: TrainerPlanExercise) => void; onRemove: () => void
  onMoveUp: () => void; onMoveDown: () => void
}) {
  const { t } = useCoachLang()
  return (
    <div className="glass" style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
        <span style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: 'var(--font-size-base)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ex.name}
        </span>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {index > 0 && <button onClick={onMoveUp} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px 4px', fontSize: '12px' }}>↑</button>}
          {index < total - 1 && <button onClick={onMoveDown} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px 4px', fontSize: '12px' }}>↓</button>}
          <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', padding: '2px 6px', fontSize: '16px' }}>×</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
        {([
          { label: t('sets'), field: 'sets' as const },
          { label: t('reps'), field: 'reps' as const },
          { label: t('weight_kg'), field: 'weight' as const },
        ] as const).map(({ label, field }) => (
          <div key={field}>
            <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: '500', display: 'block', marginBottom: '3px' }}>{label}</label>
            <input
              type="number" inputMode="numeric"
              value={ex[field] ?? ''}
              onChange={e => onChange({ ...ex, [field]: e.target.value === '' ? null : Number(e.target.value) })}
              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}
            />
          </div>
        ))}
      </div>
      <input
        type="text" placeholder={t('notes_placeholder')} value={ex.notes}
        onChange={e => onChange({ ...ex, notes: e.target.value })}
        style={{ width: '100%', boxSizing: 'border-box', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PlansClient({
  trainerId, clientId, clientName,
  folders: initialFolders, plans: initialPlans, sharedPlanIds: initialSharedIds,
  templates, allClients, isTemplates = false,
}: Props) {
  const { t } = useCoachLang()
  const router = useRouter()
  const supabase = createClient()

  const [folders, setFolders] = useState<ClientFolder[]>(initialFolders)
  const [plans, setPlans] = useState<TrainingPlan[]>(initialPlans)
  const [sharedIds, setSharedIds] = useState(new Set<string>(initialSharedIds))

  useEffect(() => { setFolders(initialFolders) }, [initialFolders])
  useEffect(() => { setPlans(initialPlans) }, [initialPlans])
  useEffect(() => { setSharedIds(new Set(initialSharedIds)) }, [initialSharedIds])

  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editor, setEditor] = useState<PlanEditorState | null>(null)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Menus & modals
  const [folderMenu, setFolderMenu] = useState<string | null>(null)
  const [planMenu, setPlanMenu] = useState<string | null>(null)
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<ClientFolder | null>(null)
  const [confirmDeletePlan, setConfirmDeletePlan] = useState<TrainingPlan | null>(null)
  const [insertTemplateFor, setInsertTemplateFor] = useState<string | null>(null)
  const [copyPlan, setCopyPlan] = useState<{ plan: TrainingPlan; step: 1 | 2; targetClientId: string | null } | null>(null)

  function closeMenus() { setFolderMenu(null); setPlanMenu(null) }

  // ── Folder CRUD ────────────────────────────────────────────────────────────
  async function createFolder() {
    if (!newFolderName.trim()) return
    const { data, error } = await supabase
      .from('client_folders')
      .insert({ trainer_id: trainerId, client_id: clientId, name: newFolderName.trim() })
      .select('*')
      .single()
    if (error) { alert('Error: ' + error.message); return }
    if (data) {
      setFolders(f => [...f, data])
      setNewFolderName('')
      setShowNewFolder(false)
      router.refresh()
    }
  }

  async function handleDeleteFolder() {
    if (!confirmDeleteFolder) return
    await supabase.from('training_plans').delete().eq('folder_id', confirmDeleteFolder.id)
    await supabase.from('client_folders').delete().eq('id', confirmDeleteFolder.id)
    setFolders(f => f.filter(x => x.id !== confirmDeleteFolder.id))
    setPlans(p => p.filter(x => x.folder_id !== confirmDeleteFolder.id))
    setConfirmDeleteFolder(null)
    router.refresh()
  }

  // ── Plan CRUD ──────────────────────────────────────────────────────────────
  function openNewPlan(folderId: string) {
    setEditor({ planId: null, folderId, name: '', exercises: [] })
  }

  function openEditPlan(plan: TrainingPlan) {
    setEditor({ planId: plan.id, folderId: plan.folder_id, name: plan.name, exercises: plan.exercises ?? [] })
  }

  async function savePlan() {
    if (!editor) return
    setSaving(true)
    setSaveError(null)

    if (editor.planId) {
      const { data, error } = await supabase
        .from('training_plans')
        .update({ name: editor.name, exercises: editor.exercises, updated_at: new Date().toISOString() })
        .eq('id', editor.planId)
        .select('*')
        .single()
      if (error) { setSaveError(error.message + ' [' + error.code + ']'); setSaving(false); return }
      if (data) setPlans(p => p.map(x => x.id === data.id ? data : x))
    } else {
      const { data, error } = await supabase
        .from('training_plans')
        .insert({ trainer_id: trainerId, folder_id: editor.folderId, name: editor.name || 'New Plan', exercises: editor.exercises })
        .select('*')
        .single()
      if (error) { setSaveError(error.message + ' [' + error.code + ']'); setSaving(false); return }
      if (data) setPlans(p => [...p, data])
    }

    setSaving(false)
    setEditor(null)
    router.refresh()
  }

  async function handleDeletePlan() {
    if (!confirmDeletePlan) return
    await supabase.from('training_plans').delete().eq('id', confirmDeletePlan.id)
    setPlans(p => p.filter(x => x.id !== confirmDeletePlan.id))
    setConfirmDeletePlan(null)
    router.refresh()
  }

  // ── Share ──────────────────────────────────────────────────────────────────
  async function toggleShare(planId: string) {
    if (sharedIds.has(planId)) {
      await supabase.from('plan_shares').delete().eq('plan_id', planId).eq('client_id', clientId)
      setSharedIds(s => { const next = new Set(s); next.delete(planId); return next })
    } else {
      await supabase.from('plan_shares').upsert({ plan_id: planId, client_id: clientId, shared_at: new Date().toISOString() })
      setSharedIds(s => new Set([...s, planId]))
    }
  }

  // ── Template insert ────────────────────────────────────────────────────────
  async function handleInsertTemplate(folderId: string, template: TrainingPlan) {
    const { data } = await supabase
      .from('training_plans')
      .insert({ trainer_id: trainerId, folder_id: folderId, name: template.name, exercises: template.exercises })
      .select('*')
      .single()
    if (data) setPlans(p => [...p, data])
    setInsertTemplateFor(null)
    router.refresh()
  }

  // ── Copy to client ─────────────────────────────────────────────────────────
  async function handleCopyToFolder(targetFolderId: string) {
    if (!copyPlan) return
    await supabase
      .from('training_plans')
      .insert({ trainer_id: trainerId, folder_id: targetFolderId, name: copyPlan.plan.name, exercises: copyPlan.plan.exercises })
    setCopyPlan(null)
    router.refresh()
  }

  // ── Exercise editor helpers ────────────────────────────────────────────────
  async function addExerciseToEditor(edbExercise: any) {
    let exerciseId: string | undefined
    if (edbExercise.source === 'custom') {
      exerciseId = edbExercise.exerciseId
    } else {
      const { data: e } = await supabase.from('exercises').select('id').eq('external_id', edbExercise.exerciseId).eq('source', 'exercisedb').maybeSingle()
      exerciseId = e?.id
      if (!exerciseId) {
        const { data: n } = await supabase.from('exercises').insert({ external_id: edbExercise.exerciseId, source: 'exercisedb', name: edbExercise.name }).select('id').single()
        exerciseId = n?.id
      }
    }
    if (!exerciseId || !editor) return
    const newEx: TrainerPlanExercise = { id: crypto.randomUUID(), exerciseId, name: edbExercise.name, source: edbExercise.source ?? 'exercisedb', sets: 3, reps: 10, weight: null, notes: '' }
    setEditor(prev => prev ? { ...prev, exercises: [...prev.exercises, newEx] } : prev)
    setShowAddExercise(false)
  }

  function updateEditorExercise(index: number, updated: TrainerPlanExercise) {
    setEditor(prev => {
      if (!prev) return prev
      const exs = [...prev.exercises]; exs[index] = updated; return { ...prev, exercises: exs }
    })
  }
  function removeEditorExercise(index: number) {
    setEditor(prev => prev ? { ...prev, exercises: prev.exercises.filter((_, i) => i !== index) } : prev)
  }
  function moveEditorExercise(from: number, to: number) {
    setEditor(prev => {
      if (!prev) return prev
      const exs = [...prev.exercises]; [exs[from], exs[to]] = [exs[to], exs[from]]; return { ...prev, exercises: exs }
    })
  }

  // ── Editor view ────────────────────────────────────────────────────────────
  if (editor) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '40px' }}>
        <div className="glass-nav" style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px var(--spacing-md)', zIndex: 100, borderTop: 'none', borderBottom: '1px solid rgba(151,125,255,0.15)' }}>
          <button onClick={() => setEditor(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontWeight: '500', cursor: 'pointer' }}>{t('cancel')}</button>
          <input
            value={editor.name}
            onChange={e => setEditor(prev => prev ? { ...prev, name: e.target.value } : prev)}
            placeholder={t('plan_name_placeholder')}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--color-text)', fontWeight: '600', fontSize: 'var(--font-size-md)', textAlign: 'center', flex: 1, margin: '0 var(--spacing-sm)' }}
          />
          <button onClick={savePlan} disabled={saving} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer' }}>
            {saving ? t('saving') : t('save_plan')}
          </button>
        </div>

        <div style={{ padding: 'var(--spacing-md)' }}>
          {saveError && (
            <div style={{ padding: '10px 12px', marginBottom: 'var(--spacing-md)', borderRadius: 'var(--radius-main)', background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)', color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', fontFamily: 'monospace' }}>
              {saveError}
            </div>
          )}
          {editor.exercises.map((ex, i) => (
            <ExerciseRow
              key={ex.id} ex={ex} index={i} total={editor.exercises.length}
              onChange={u => updateEditorExercise(i, u)}
              onRemove={() => removeEditorExercise(i)}
              onMoveUp={() => moveEditorExercise(i, i - 1)}
              onMoveDown={() => moveEditorExercise(i, i + 1)}
            />
          ))}
          <button
            onClick={() => setShowAddExercise(true)}
            style={{ width: '100%', padding: 'var(--spacing-md)', background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', border: '1px dashed color-mix(in srgb, var(--color-primary) 40%, transparent)', borderRadius: 'var(--radius-main)', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer', marginBottom: 'var(--spacing-md)' }}
          >
            + {t('add_exercise')}
          </button>
        </div>

        {showAddExercise && <AddExerciseModal onAdd={addExerciseToEditor} onClose={() => setShowAddExercise(false)} />}
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--color-bg)', paddingBottom: '100px' }} onClick={closeMenus}>
      {/* Header */}
      <div className="glass-nav" style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px var(--spacing-md)', zIndex: 100, borderTop: 'none', borderBottom: '1px solid rgba(151,125,255,0.15)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <span style={{ fontWeight: '600', fontSize: 'var(--font-size-md)' }}>
          {isTemplates ? t('templates_title') : `${clientName} — ${t('plans_title')}`}
        </span>
        <button
          onClick={e => { e.stopPropagation(); setShowNewFolder(o => !o) }}
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}
        >
          + {t('new_folder')}
        </button>
      </div>

      <div style={{ padding: 'var(--spacing-md)' }}>
        {/* New folder input */}
        {showNewFolder && (
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
            <input
              autoFocus value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolder(false) }}
              placeholder={t('folder_name_placeholder')}
              style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-main)', border: '1px solid rgba(151,125,255,0.3)', background: 'rgba(255,255,255,0.04)', color: 'var(--color-text)', fontSize: 'var(--font-size-base)' }}
            />
            <button onClick={createFolder} style={{ padding: '8px 16px', borderRadius: 'var(--radius-main)', background: 'var(--color-primary)', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}>{t('save')}</button>
          </div>
        )}

        {folders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '60px', fontSize: 'var(--font-size-sm)' }}>{t('no_folders')}</p>
        ) : folders.map(folder => {
          const folderPlans = plans.filter(p => p.folder_id === folder.id)
          return (
            <div key={folder.id} style={{ marginBottom: 'var(--spacing-xl)' }}>
              {/* Folder header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {folder.name}
                </span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    onClick={e => { e.stopPropagation(); openNewPlan(folder.id) }}
                    style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)', borderRadius: '6px', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)', cursor: 'pointer', padding: '3px 10px' }}
                  >
                    + {t('new_plan')}
                  </button>
                  {!isTemplates && (
                    <button
                      onClick={e => { e.stopPropagation(); setInsertTemplateFor(folder.id) }}
                      style={{ background: 'none', border: '1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)', borderRadius: '6px', color: 'var(--color-primary)', fontWeight: '600', fontSize: 'var(--font-size-sm)', cursor: 'pointer', padding: '3px 10px' }}
                    >
                      + {t('insert_template')}
                    </button>
                  )}
                  {/* Folder ⋯ menu (delete only) */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setFolderMenu(folderMenu === folder.id ? null : folder.id); setPlanMenu(null) }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px 8px', fontSize: '18px', lineHeight: 1 }}
                    >
                      ⋯
                    </button>
                    {folderMenu === folder.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={closeMenus} />
                        <div className="glass" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, minWidth: '170px', borderRadius: 'var(--radius-main)', overflow: 'hidden', padding: '4px 0', border: '1px solid rgba(151,125,255,0.2)' }}>
                          <button
                            style={menuDangerStyle}
                            onClick={e => { e.stopPropagation(); setConfirmDeleteFolder(folder); setFolderMenu(null) }}
                          >
                            🗑 {t('delete_folder')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Plans in folder */}
              {folderPlans.length === 0 ? (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', padding: 'var(--spacing-md)', textAlign: 'center' }}>
                  {t('no_plans_in_folder')}
                </p>
              ) : folderPlans.map(plan => (
                <div
                  key={plan.id}
                  className="glass"
                  style={{ padding: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: isTemplates ? 'pointer' : 'default' }}
                  onClick={isTemplates ? () => openEditPlan(plan) : undefined}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: 'var(--font-size-base)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.name}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{(plan.exercises ?? []).length} {t('exercises_count')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexShrink: 0, alignItems: 'center' }}>
                    {!isTemplates && (
                      <button
                        onClick={() => toggleShare(plan.id)}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: sharedIds.has(plan.id) ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'rgba(255,255,255,0.06)', color: sharedIds.has(plan.id) ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: '600', fontSize: '12px' }}
                      >
                        {sharedIds.has(plan.id) ? t('unshare_plan') : t('share_plan')}
                      </button>
                    )}
                    <button
                      onClick={() => openEditPlan(plan)}
                      style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: 'rgba(151,125,255,0.12)', color: 'var(--color-primary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {t('edit')}
                    </button>
                    {/* Plan ⋯ menu */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setPlanMenu(planMenu === plan.id ? null : plan.id); setFolderMenu(null) }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '2px 8px', fontSize: '18px', lineHeight: 1 }}
                      >
                        ⋯
                      </button>
                      {planMenu === plan.id && (
                        <>
                          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={closeMenus} />
                          <div className="glass" style={{ position: 'absolute', right: 0, top: '100%', zIndex: 10, minWidth: '170px', borderRadius: 'var(--radius-main)', overflow: 'hidden', padding: '4px 0', border: '1px solid rgba(151,125,255,0.2)' }}>
                            {!isTemplates && allClients.length > 0 && (
                              <button
                                style={menuItemStyle}
                                onClick={e => { e.stopPropagation(); setCopyPlan({ plan, step: 1, targetClientId: null }); setPlanMenu(null) }}
                              >
                                📋 {t('copy_to_client')}
                              </button>
                            )}
                            <button
                              style={menuDangerStyle}
                              onClick={e => { e.stopPropagation(); setConfirmDeletePlan(plan); setPlanMenu(null) }}
                            >
                              🗑 {t('delete_plan')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* ── Delete Folder confirm ──────────────────────────────────────────── */}
      {confirmDeleteFolder && (
        <Modal onClose={() => setConfirmDeleteFolder(null)}>
          <p style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)' }}>{t('delete_folder')}</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            {t('confirm_delete_folder').replace('{name}', confirmDeleteFolder.name)}
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button onClick={() => setConfirmDeleteFolder(null)} style={cancelBtnStyle}>{t('cancel')}</button>
            <button onClick={handleDeleteFolder} style={dangerBtnStyle}>{t('delete')}</button>
          </div>
        </Modal>
      )}

      {/* ── Delete Plan confirm ────────────────────────────────────────────── */}
      {confirmDeletePlan && (
        <Modal onClose={() => setConfirmDeletePlan(null)}>
          <p style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-sm)' }}>{t('delete_plan')}</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
            {t('confirm_delete_plan').replace('{name}', confirmDeletePlan.name)}
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button onClick={() => setConfirmDeletePlan(null)} style={cancelBtnStyle}>{t('cancel')}</button>
            <button onClick={handleDeletePlan} style={dangerBtnStyle}>{t('delete')}</button>
          </div>
        </Modal>
      )}

      {/* ── Insert Template modal ──────────────────────────────────────────── */}
      {insertTemplateFor && (
        <Modal onClose={() => setInsertTemplateFor(null)}>
          <p style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>{t('insert_template')}</p>
          {templates.length === 0 ? (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>{t('no_templates')}</p>
          ) : templates.map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => handleInsertTemplate(insertTemplateFor, tmpl)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: '6px', borderRadius: 'var(--radius-main)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: '600' }}>{tmpl.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{(tmpl.exercises ?? []).length} {t('exercises_count')}</div>
            </button>
          ))}
          <button onClick={() => setInsertTemplateFor(null)} style={{ ...cancelBtnStyle, marginTop: 'var(--spacing-sm)', width: '100%' }}>{t('cancel')}</button>
        </Modal>
      )}

      {/* ── Copy to Client modal ───────────────────────────────────────────── */}
      {copyPlan && (
        <Modal onClose={() => setCopyPlan(null)}>
          {copyPlan.step === 1 ? (
            <>
              <p style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>{t('select_client')}</p>
              {allClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCopyPlan({ ...copyPlan, step: 2, targetClientId: c.id })}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: '6px', borderRadius: 'var(--radius-main)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: '500' }}
                >
                  {c.name}
                </button>
              ))}
              <button onClick={() => setCopyPlan(null)} style={{ ...cancelBtnStyle, marginTop: 'var(--spacing-sm)', width: '100%' }}>{t('cancel')}</button>
            </>
          ) : (
            <>
              <p style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', marginBottom: 'var(--spacing-md)' }}>{t('select_folder')}</p>
              {(() => {
                const tc = allClients.find(c => c.id === copyPlan.targetClientId)
                if (!tc || tc.folders.length === 0) return (
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>{t('no_folders_for_client')}</p>
                )
                return tc.folders.map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleCopyToFolder(f.id)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: '6px', borderRadius: 'var(--radius-main)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', cursor: 'pointer', fontWeight: '500' }}
                  >
                    {f.name}
                  </button>
                ))
              })()}
              <button onClick={() => setCopyPlan({ ...copyPlan, step: 1, targetClientId: null })} style={{ ...cancelBtnStyle, marginTop: 'var(--spacing-sm)', width: '100%' }}>← {t('back')}</button>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
