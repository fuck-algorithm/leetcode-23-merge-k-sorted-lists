import { create } from 'zustand';
import type { AlgorithmType, CodeLanguage, AlgorithmStep, PlaybackState } from '../types';
import { generateSteps } from '../algorithms/stepGenerator';
import { getSetting, saveSetting } from '../utils/indexedDB';

interface AppState {
  // 输入数据
  inputLists: number[][];
  inputText: string;
  
  // 算法相关
  algorithmType: AlgorithmType;
  codeLanguage: CodeLanguage;
  steps: AlgorithmStep[];
  
  // 播放状态
  playback: PlaybackState;
  
  // 操作方法
  setInputLists: (lists: number[][]) => void;
  setInputText: (text: string) => void;
  setAlgorithmType: (type: AlgorithmType) => void;
  setCodeLanguage: (lang: CodeLanguage) => void;
  generateAlgorithmSteps: () => void;
  
  // 播放控制
  play: () => void;
  pause: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  goToStep: (step: number) => void;
  setSpeed: (speed: number) => void;
  
  // 初始化
  initFromStorage: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // 初始状态
  inputLists: [[1, 4, 5], [1, 3, 4], [2, 6]],
  inputText: '[[1,4,5],[1,3,4],[2,6]]',
  algorithmType: 'sequential',
  codeLanguage: 'java',
  steps: [],
  playback: {
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
  },
  
  // 设置输入数据
  setInputLists: (lists) => {
    set({ inputLists: lists });
    get().generateAlgorithmSteps();
  },
  
  setInputText: (text) => {
    set({ inputText: text });
  },
  
  // 设置算法类型
  setAlgorithmType: (type) => {
    set({ algorithmType: type });
    get().generateAlgorithmSteps();
  },
  
  // 设置代码语言
  setCodeLanguage: async (lang) => {
    set({ codeLanguage: lang });
    await saveSetting('codeLanguage', lang);
  },
  
  // 生成算法步骤
  generateAlgorithmSteps: () => {
    const { algorithmType, inputLists } = get();
    const steps = generateSteps(algorithmType, inputLists);
    set({
      steps,
      playback: {
        ...get().playback,
        currentStep: 0,
        totalSteps: steps.length,
        isPlaying: false,
      },
    });
  },
  
  // 播放控制
  play: () => {
    set((state) => ({
      playback: { ...state.playback, isPlaying: true },
    }));
  },
  
  pause: () => {
    set((state) => ({
      playback: { ...state.playback, isPlaying: false },
    }));
  },
  
  nextStep: () => {
    set((state) => {
      const nextStep = Math.min(state.playback.currentStep + 1, state.playback.totalSteps - 1);
      return {
        playback: { ...state.playback, currentStep: nextStep },
      };
    });
  },
  
  prevStep: () => {
    set((state) => {
      const prevStep = Math.max(state.playback.currentStep - 1, 0);
      return {
        playback: { ...state.playback, currentStep: prevStep },
      };
    });
  },
  
  reset: () => {
    set((state) => ({
      playback: { ...state.playback, currentStep: 0, isPlaying: false },
    }));
  },
  
  goToStep: (step) => {
    set((state) => ({
      playback: {
        ...state.playback,
        currentStep: Math.max(0, Math.min(step, state.playback.totalSteps - 1)),
      },
    }));
  },
  
  setSpeed: async (speed) => {
    set((state) => ({
      playback: { ...state.playback, speed },
    }));
    await saveSetting('playbackSpeed', speed);
  },
  
  // 从存储初始化
  initFromStorage: async () => {
    try {
      const savedLanguage = await getSetting('codeLanguage');
      const savedSpeed = await getSetting('playbackSpeed');
      
      set((state) => ({
        codeLanguage: (savedLanguage as CodeLanguage) || state.codeLanguage,
        playback: {
          ...state.playback,
          speed: (savedSpeed as number) || state.playback.speed,
        },
      }));
      
      // 生成初始步骤
      get().generateAlgorithmSteps();
    } catch (error) {
      console.error('Failed to load settings from storage:', error);
      get().generateAlgorithmSteps();
    }
  },
}));
