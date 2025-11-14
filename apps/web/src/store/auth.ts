import { atom } from 'jotai';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
