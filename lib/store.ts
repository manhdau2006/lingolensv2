import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Folder {
  id: string
  name: string
  createdAt: number
}

export interface Vocabulary {
  id: string
  folderId: string
  originalWord: string
  wordType: string
  translatedWord: string
  ipa: string
  imageUrl: string
  createdAt: number
  targetSpeechLocale?: string
}

type StoreState = {
  folders: Folder[]
  vocabularies: Vocabulary[]

  // Search State
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Language Selection State
  sourceLanguage: string
  targetLanguage: string
  setSourceLanguage: (code: string) => void
  setTargetLanguage: (code: string) => void
  swapLanguages: () => void

  // Folder Actions
  addFolder: (name: string) => void
  deleteFolder: (id: string) => void
  updateFolder: (id: string, newName: string) => void

  // Vocabulary Actions
  addVocabulary: (vocab: Omit<Vocabulary, "id" | "createdAt">) => void
  deleteVocabulary: (id: string) => void
  duplicateVocabulary: (id: string) => void
  moveVocabulary: (id: string, newFolderId: string) => void
  deleteMultipleVocabularies: (ids: string[]) => void
  moveMultipleVocabularies: (ids: string[], newFolderId: string) => void
  copyVocabularyToFolder: (id: string, targetFolderId: string) => void
  copyMultipleVocabulariesToFolder: (ids: string[], targetFolderId: string) => void
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: "unsaved", name: "#unsaved", createdAt: Date.now() },
  { id: "phong-khach", name: "#phòng_khách", createdAt: Date.now() - 1000 },
  { id: "ngoai-troi", name: "#ngoài_trời", createdAt: Date.now() - 2000 },
  { id: "cong-so", name: "#công_sở", createdAt: Date.now() - 3000 },
]

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      folders: DEFAULT_FOLDERS,
      vocabularies: [],
      searchQuery: "",

      setSearchQuery: (query: string) => set({ searchQuery: query }),

      // Language Defaults
      sourceLanguage: "vi",
      targetLanguage: "en",

      setSourceLanguage: (code: string) => set({ sourceLanguage: code }),
      setTargetLanguage: (code: string) => set({ targetLanguage: code }),
      swapLanguages: () =>
        set((state) => ({
          sourceLanguage: state.targetLanguage,
          targetLanguage: state.sourceLanguage,
        })),

      addFolder: (name: string) => {
        const cleanName = name.trim()
        if (!cleanName) return
        const formattedName = cleanName.startsWith("#")
          ? cleanName
          : `#${cleanName.replace(/\s+/g, "_").toLowerCase()}`
        const id = cleanName.replace(/\s+/g, "-").toLowerCase() + `-${Date.now()}`

        const newFolder: Folder = {
          id,
          name: formattedName,
          createdAt: Date.now(),
        }

        set((state) => ({
          folders: [newFolder, ...state.folders],
        }))
      },

      deleteFolder: (id: string) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          vocabularies: state.vocabularies.filter((v) => v.folderId !== id),
        }))
      },

      updateFolder: (id: string, newName: string) => {
        const cleanName = newName.trim()
        if (!cleanName) return
        const formattedName = cleanName.startsWith("#")
          ? cleanName
          : `#${cleanName.replace(/\s+/g, "_").toLowerCase()}`

        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, name: formattedName } : f
          ),
        }))
      },

      addVocabulary: (vocabData) => {
        const newVocab: Vocabulary = {
          ...vocabData,
          id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          createdAt: Date.now(),
        }
        set((state) => ({
          vocabularies: [newVocab, ...state.vocabularies],
        }))
      },

      deleteVocabulary: (id: string) => {
        set((state) => ({
          vocabularies: state.vocabularies.filter((v) => v.id !== id),
        }))
      },

      duplicateVocabulary: (id: string) => {
        set((state) => {
          const target = state.vocabularies.find((v) => v.id === id)
          if (!target) return state

          const duplicateItem: Vocabulary = {
            ...target,
            id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            createdAt: Date.now(),
          }

          return {
            vocabularies: [duplicateItem, ...state.vocabularies],
          }
        })
      },

      moveVocabulary: (id: string, newFolderId: string) => {
        set((state) => ({
          vocabularies: state.vocabularies.map((v) =>
            v.id === id ? { ...v, folderId: newFolderId } : v
          ),
        }))
      },

      deleteMultipleVocabularies: (ids: string[]) => {
        if (!ids || ids.length === 0) return
        set((state) => ({
          vocabularies: state.vocabularies.filter((v) => !ids.includes(v.id)),
        }))
      },

      moveMultipleVocabularies: (ids: string[], newFolderId: string) => {
        if (!ids || ids.length === 0) return
        set((state) => ({
          vocabularies: state.vocabularies.map((v) =>
            ids.includes(v.id) ? { ...v, folderId: newFolderId } : v
          ),
        }))
      },

      copyVocabularyToFolder: (id: string, targetFolderId: string) => {
        set((state) => {
          const target = state.vocabularies.find((v) => v.id === id)
          if (!target) return state

          const newCopy: Vocabulary = {
            ...target,
            id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            folderId: targetFolderId,
            createdAt: Date.now(),
          }

          return {
            vocabularies: [newCopy, ...state.vocabularies],
          }
        })
      },

      copyMultipleVocabulariesToFolder: (ids: string[], targetFolderId: string) => {
        if (!ids || ids.length === 0) return
        set((state) => {
          const targets = state.vocabularies.filter((v) => ids.includes(v.id))
          if (targets.length === 0) return state

          const newCopies: Vocabulary[] = targets.map((target, idx) => ({
            ...target,
            id: `vocab_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
            folderId: targetFolderId,
            createdAt: Date.now() + idx,
          }))

          return {
            vocabularies: [...newCopies, ...state.vocabularies],
          }
        })
      },
    }),
    {
      name: "lingolearn-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
