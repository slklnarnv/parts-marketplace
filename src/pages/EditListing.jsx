import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      const docSnap = await getDoc(doc(db, "listings", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.userEmail !== auth.currentUser?.email) {
          alert("Not authorized");
          navigate("/listings");
          return;
        }
        setTitle(data.title);
        setPrice(data.price);
        setLocation(data.location);
        setCount(data.count);
      }
      setLoading(false);
    };
    fetchListing();
  }, [id, navigate]);

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "listings", id), {
        title,
        price: parseFloat(price),
        location,
        count: parseInt(count),
      });
      alert("Updated!");
      navigate("/my-listings");
    } catch (err) {
      alert("Update failed.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Listing</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} /> <br />
      <br />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />{" "}
      <br />
      <br />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />{" "}
      <br />
      <br />
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(e.target.value)}
      />{" "}
      <br />
      <br />
      <button onClick={handleUpdate}>Save Changes</button>
    </div>
  );
}
