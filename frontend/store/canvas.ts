import { create } from 'zustand'

interface CanvasState {
  canvas: Canvas;
  getCanvas: () => void;
}

const useCanvasState = create<CanvasState>((set) => ({
  canvas: null,
  getCanvas: () => set({ canvas: document.getElementById('canvas') }),
}))