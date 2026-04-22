import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "./firebase"; // Assuming you have firebase setup here

// Custom hook to manage user authentication and role checking
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // To show loading while checking user status

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // If user is logged in, fetch their role from Firestore
        const db = getFirestore();
        const userDocRef = doc(db, "users", authUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser(authUser); // Set the authenticated user
          setIsAdmin(userData.role === "admin"); // Check if user is admin
        }
      } else {
        setUser(null); // No user logged in
        setIsAdmin(false);
      }
      setLoading(false); // Set loading to false once done
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  return { user, isAdmin, loading };
};
