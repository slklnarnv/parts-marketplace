import { db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc, getDoc, query, orderBy, where } from "firebase/firestore";

export const getListings = async () => {
  const snapshot = await getDocs(collection(db, "listings"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getListingById = async (id) => {
  const docSnap = await getDoc(doc(db, "listings", id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const getUserListings = async (email) => {
  const q = query(collection(db, "listings"), where("userEmail", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addListing = async (listingData) => {
  return await addDoc(collection(db, "listings"), {
    ...listingData,
    createdAt: new Date(),
  });
};

export const updateListing = async (id, updateData) => {
  const listingRef = doc(db, "listings", id);
  return await updateDoc(listingRef, updateData);
};

export const deleteListing = async (id) => {
  return await deleteDoc(doc(db, "listings", id));
};
