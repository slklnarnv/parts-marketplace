import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const getUserCart = async (email) => {
  const docSnap = await getDoc(doc(db, "carts", email));
  if (docSnap.exists()) {
    return docSnap.data().items || [];
  }
  return [];
};

export const saveUserCart = async (email, items) => {
  await setDoc(doc(db, "carts", email), { items, updatedAt: new Date() }, { merge: true });
};
