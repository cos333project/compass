import create from 'zustand'

type CanvasState = {
  items: Array<any>
  addItem: (item: any) => void
}

const useCanvasStore = create<CanvasState>(set => ({
  items: [],
  addItem: (item) => set(state => ({ items: [...state.items, item] }))
}));

export default useCanvasStore;
