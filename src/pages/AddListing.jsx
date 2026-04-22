import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function AddListing() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(1);

  const handleAdd = async () => {
    if (!auth.currentUser) {
      alert("Please login first");
      return;
    }

    // Validation
    if (!title || !price || !location) {
      alert("Please fill in all fields.");
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid price.");
      return;
    }

    try {
      await addDoc(collection(db, "listings"), {
        title,
        price: numericPrice,
        location,
        count: parseInt(count),
        userEmail: auth.currentUser.email,
        createdAt: new Date(),
      });

      alert("Listing added!");
      setTitle("");
      setPrice("");
      setLocation("");
      setCount(1);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Ship Part</h2>
      <input
        placeholder="Part Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <br />
      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
      />
      <br />
      <br />
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <br />
      <br />
      <input
        placeholder="Count"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        type="number"
        min="1"
      />
      <br />
      <br />
      <button onClick={handleAdd}>Post Listing</button>
    </div>
  );
}
