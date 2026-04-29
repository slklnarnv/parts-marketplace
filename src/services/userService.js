import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";

// Get a user's profile document
export const getUserProfile = async (uid) => {
  const userDocRef = doc(db, "users", uid);
  const docSnap = await getDoc(userDocRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Create a new user profile document
export const createUserProfile = async (uid, email, role = "user") => {
  await setDoc(doc(db, "users", uid), {
    email,
    role,
    createdAt: new Date(),
  });
};

// Get all users (Admin)
export const getAllUsers = async () => {
  const usersSnapshot = await getDocs(collection(db, "users"));
  return usersSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Update user role (Admin)
export const updateUserRole = async (userId, newRole) => {
  await updateDoc(doc(db, "users", userId), { role: newRole });
};

// Delete user profile (Admin)
export const deleteUserProfile = async (userId) => {
  await deleteDoc(doc(db, "users", userId));
};

// Update admin view preferences (Admin)
export const updateAdminPreferences = async (uid, data) => {
  await updateDoc(doc(db, "users", uid), data);
};

// Hide single transaction for admin (Admin)
export const hideTransactionForAdmin = async (uid, transactionId) => {
  await updateDoc(doc(db, "users", uid), {
    hiddenTransactionIds: arrayUnion(transactionId)
  });
};
