export type ThemeId = 'vulkan' | 'polar' | 'malachit' | 'obsidian' | 'stahl'

export interface Theme {
  id: ThemeId
  name: string
  bg: string
  primary: string
  card: string
  setRow: string
  setRowAlt: string
  text: string
  textSecondary: string
  danger: string
  success: string
}

export const THEMES: Theme[] = [
  {
    id: 'obsidian',
    name: 'Obsidian',
    bg: '#09090F',
    primary: '#8B5CF6',
    card: '#13111F',
    setRow: '#13111F',
    setRowAlt: '#0F0E1A',
    text: '#E8E8F5',
    textSecondary: '#7A78A0',
    danger: '#FF4444',
    success: '#4CAF50',
  },
  {
    id: 'vulkan',
    name: 'Vulkan',
    bg: '#0E0E10',
    primary: '#C8F53B',
    card: '#1A1A1D',
    setRow: '#1A1A1D',
    setRowAlt: '#141417',
    text: '#FFFFFF',
    textSecondary: '#8A8A8E',
    danger: '#FF4444',
    success: '#4CAF50',
  },
  {
    id: 'polar',
    name: 'Polar',
    bg: '#F0F4FA',
    primary: '#1A56DB',
    card: '#FFFFFF',
    setRow: '#FFFFFF',
    setRowAlt: '#F8FAFD',
    text: '#0F1828',
    textSecondary: '#64748B',
    danger: '#E53935',
    success: '#2E7D32',
  },
  {
    id: 'malachit',
    name: 'Malachit',
    bg: '#080E0A',
    primary: '#C8A84B',
    card: '#0F1E13',
    setRow: '#0F1E13',
    setRowAlt: '#0B150E',
    text: '#D4EDD8',
    textSecondary: '#5A8A6A',
    danger: '#E53935',
    success: '#66BB6A',
  },
  {
    id: 'stahl',
    name: 'Stahl',
    bg: '#0A0C10',
    primary: '#38BDF8',
    card: '#101520',
    setRow: '#101520',
    setRowAlt: '#0C1018',
    text: '#DCE8F5',
    textSecondary: '#5A7090',
    danger: '#F87171',
    success: '#34D399',
  },
]

export function applyTheme(id: ThemeId) {
  const theme = THEMES.find(t => t.id === id) ?? THEMES[0]
  const root = document.documentElement
  root.style.setProperty('--color-bg', theme.bg)
  root.style.setProperty('--color-primary', theme.primary)
  root.style.setProperty('--color-card', theme.card)
  root.style.setProperty('--color-set-row', theme.setRow)
  root.style.setProperty('--color-set-row-alt', theme.setRowAlt)
  root.style.setProperty('--color-text', theme.text)
  root.style.setProperty('--color-text-secondary', theme.textSecondary)
  root.style.setProperty('--color-danger', theme.danger)
  root.style.setProperty('--color-success', theme.success)
  localStorage.setItem('color_scheme', id)
}