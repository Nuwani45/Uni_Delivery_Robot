
import { database } from "./firebase";
import { ref, set } from "firebase/database";

async function testFirebase() {
  try {
    await set(ref(database, "connectionTest"), {
      message: "Hello from UniDelivery!",
      status: "Connected",
      timestamp: Date.now()
    });

    alert("Firebase connection successful!");
  } catch (error) {
    console.error("Firebase error:", error);
    alert("Firebase connection failed: " + error.message);
  }
}

export default testFirebase;
