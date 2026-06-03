import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_USER = {
  name: "Hanora Scholar",
  email: "learner@hanora.com",
  streak: 8,
  xp: 320,
  level: "HSK 2",
  targetDailyMinutes: 20,
  todayMinutes: 12,
  avatar: null
};

export const useAuthStore = create(
  persist(
    (set) => ({
      user: DEFAULT_USER,
      isAuthenticated: false, // Login first
      
      login: (email, name) => set({
        user: {
          ...DEFAULT_USER,
          name: name || "Hanora Scholar",
          email: email,
        },
        isAuthenticated: true
      }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      updateProfile: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null
      })),
      
      addXp: (amount) => set((state) => {
        if (!state.user) return {};
        const newXp = state.user.xp + amount;
        // Determine HSK level estimate based on XP for fun gamified experience!
        let level;
        if (newXp > 800) level = "HSK 4";
        else if (newXp > 500) level = "HSK 3";
        else if (newXp > 200) level = "HSK 2";
        else level = "HSK 1";
        
        return {
          user: { ...state.user, xp: newXp, level }
        };
      }),
      
      incrementStudyTime: (minutes) => set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            todayMinutes: state.user.todayMinutes + minutes
          }
        };
      }),
      
      incrementStreak: () => set((state) => {
        if (!state.user) return {};
        return {
          user: {
            ...state.user,
            streak: state.user.streak + 1
          }
        };
      })
    }),
    {
      name: 'hanora-auth-storage',
    }
  )
);
