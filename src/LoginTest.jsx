import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

export default function LoginTest() {
  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, "test@gmail.com", "123456");
      alert("User created");
    } catch (e) {
      alert(e.message);
    }
  };

  return <button onClick={signup}>Test Signup</button>;
}
