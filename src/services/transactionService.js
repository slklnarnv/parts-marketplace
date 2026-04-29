import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, where, runTransaction } from "firebase/firestore";

export const createTransaction = async (cart, userEmail) => {
  // Use Firestore transaction for atomic stock check + update
  await runTransaction(db, async (transaction) => {
    // Phase 1: Read all item stocks
    const itemRefs = cart.map(item => doc(db, "listings", item.id));
    const snapshots = await Promise.all(itemRefs.map(ref => transaction.get(ref)));

    // Phase 2: Validate all stocks
    snapshots.forEach((snap, index) => {
      const item = cart[index];
      if (!snap.exists()) {
        throw new Error(`Item "${item.title}" no longer exists.`);
      }
      const currentStock = snap.data().count;
      if (currentStock < item.quantity) {
        throw new Error(`Not enough stock for "${item.title}". Only ${currentStock} left.`);
      }
    });

    // Phase 3: Write all updates atomically
    snapshots.forEach((snap, index) => {
      const item = cart[index];
      const currentStock = snap.data().count;
      transaction.update(itemRefs[index], {
        count: currentStock - item.quantity,
      });
    });
  });

  // Record transactions after successful stock update
  for (const item of cart) {
    await addDoc(collection(db, "transactions"), {
      itemId: item.id,
      itemTitle: item.title,
      buyerEmail: userEmail,
      priceAtPurchase: item.price,
      quantity: item.quantity,
      totalPrice: item.price * item.quantity,
      sellerEmail: item.userEmail || "Unknown",
      status: "Pending", // For Order Fulfillment
      timestamp: new Date(),
    });
  }
};

export const getUserOrders = async (email) => {
  const q = query(
    collection(db, "transactions"),
    where("buyerEmail", "==", email)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return results.sort((a, b) => b.timestamp - a.timestamp);
};

export const getSellerSales = async (email) => {
  const q = query(
    collection(db, "transactions"),
    where("sellerEmail", "==", email)
  );
  const snapshot = await getDocs(q);
  const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return results.sort((a, b) => b.timestamp - a.timestamp);
};

export const updateTransactionStatus = async (id, status) => {
  const ref = doc(db, "transactions", id);
  return await updateDoc(ref, { status });
};

export const getAllTransactions = async () => {
  const q = query(
    collection(db, "transactions"),
    orderBy("timestamp", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
