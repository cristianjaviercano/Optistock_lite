"use client";

import type { User } from './types';

function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const usersJson = localStorage.getItem('optistock_users');
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return [];
  }
}

function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('optistock_users', JSON.stringify(users));
}

export function signup(email: string, password: string): { success: boolean; user?: User; message: string } {
  const users = getUsers();
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser: User = {
    id: new Date().toISOString() + Math.random(),
    email,
    password // This is insecure, but fine for a simulation
  };

  users.push(newUser);
  saveUsers(users);

  // Return user object without password for security, even in simulation
  const { password: _, ...userToReturn } = newUser;
  return { success: true, user: userToReturn, message: 'Signup successful.' };
}


export function login(email: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (user) {
    // Return user object without password for security
    const { password: _, ...userToReturn } = user;
    return userToReturn;
  }
  
  return null;
}
