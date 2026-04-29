import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, query, where, getDoc } from "firebase/firestore";

export const addReview = async (reviewData) => {
  // reviewData: { buyerEmail, sellerEmail, transactionId, rating, comment }
  
  // 1. Add review
  const reviewRef = await addDoc(collection(db, "reviews"), {
    ...reviewData,
    createdAt: new Date(),
  });

  // 2. Fetch all reviews for this seller to compute new average
  const q = query(collection(db, "reviews"), where("sellerEmail", "==", reviewData.sellerEmail));
  const snapshot = await getDocs(q);
  
  let totalRating = 0;
  snapshot.docs.forEach(doc => {
    totalRating += doc.data().rating;
  });
  
  const reviewCount = snapshot.docs.length;
  const averageRating = totalRating / reviewCount;

  // 3. Update seller's user doc with new rating
  // We need the seller's uid, but we only have email. 
  // Let's assume users document IDs are their uid, we need to query the users collection by email.
  const userQuery = query(collection(db, "users"), where("email", "==", reviewData.sellerEmail));
  const userSnapshot = await getDocs(userQuery);
  
  if (!userSnapshot.empty) {
    const sellerDoc = userSnapshot.docs[0];
    await updateDoc(doc(db, "users", sellerDoc.id), {
      averageRating,
      reviewCount
    });
  }

  return reviewRef;
};

export const getSellerRating = async (email) => {
  const userQuery = query(collection(db, "users"), where("email", "==", email));
  const userSnapshot = await getDocs(userQuery);
  if (!userSnapshot.empty) {
    const data = userSnapshot.docs[0].data();
    return {
      averageRating: data.averageRating || 0,
      reviewCount: data.reviewCount || 0
    };
  }
  return { averageRating: 0, reviewCount: 0 };
};

export const getSellerReviews = async (email) => {
  const q = query(collection(db, "reviews"), where("sellerEmail", "==", email));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
