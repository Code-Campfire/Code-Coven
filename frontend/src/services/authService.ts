import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserData {
  id: string;
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

/**
 * Sign up a new user with Firebase and initialize their record in the database.
 * Implements rollback logic: if database initialization fails, the Firebase user is deleted.
 */
export const signUpUser = async (email: string, password: string): Promise<UserData> => {
  let firebaseUser = null;

  try {
    // Step 1: Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;

    // Step 2: Get Firebase ID token
    const idToken = await firebaseUser.getIdToken();

    // Step 3: Initialize user in database
    try {
      const response = await axios.post(`${API_URL}/users/init`, {
        id_token: idToken,
      });

      // Success! Return user data
      return response.data as UserData;

    } catch (dbError: any) {
      // Database initialization failed - ROLLBACK: Delete Firebase user
      console.error('Database initialization failed, rolling back Firebase user:', dbError);

      if (firebaseUser) {
        try {
          await deleteUser(firebaseUser);
          console.log('Successfully deleted Firebase user after database failure');
        } catch (deleteError) {
          console.error('Failed to delete Firebase user during rollback:', deleteError);
        }
      }

      // Re-throw error with better message
      throw new Error(
        dbError.response?.data?.detail ||
        'Failed to initialize user account. Please try again.'
      );
    }

  } catch (error: any) {
    // Handle Firebase auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered. Please sign in instead.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Please use a stronger password.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        default:
          throw new Error(error.message || 'Signup failed. Please try again.');
      }
    }

    // Re-throw if it's already a formatted error from database rollback
    throw error;
  }
};

/**
 * Sign in an existing user with Firebase.
 */
export const signInUser = async (email: string, password: string): Promise<UserData> => {
  try {
    // Step 1: Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Step 2: Get user data from database using Firebase ID token
    const idToken = await firebaseUser.getIdToken();

    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      return response.data as UserData;
    } catch (dbError: any) {
      console.error('Failed to fetch user data from database:', dbError);
      throw new Error(
        dbError.response?.data?.detail ||
        'Failed to load user data. Please try again.'
      );
    }
  } catch (error: any) {
    // Handle Firebase auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled.');
        case 'auth/user-not-found':
          throw new Error('No account found with this email.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password.');
        case 'auth/invalid-credential':
          throw new Error('Invalid email or password.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later.');
        default:
          throw new Error(error.message || 'Login failed. Please try again.');
      }
    }

    // Re-throw if it's already a formatted error
    throw error;
  }
};

/**
 * Send a password reset email to the user.
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code) {
      switch (error.code) {
        case 'auth/invalid-email':
          throw new Error('Invalid email address.');
        case 'auth/user-not-found':
          throw new Error('No account found with this email.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.');
        default:
          throw new Error(error.message || 'Failed to send password reset email.');
      }
    }
    throw error;
  }
};

/**
 * Sign out the current user from Firebase.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to log out. Please try again.');
  }
};
