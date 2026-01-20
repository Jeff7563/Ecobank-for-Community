import { db, auth } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  updateDoc,
  deleteDoc,
  getAggregateFromServer,
  getCountFromServer,
  sum,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { deleteUser } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ==========================================
// 1. SEEDING DATA (ข้อมูลเริ่มต้น)
// ==========================================
const initialTrashTypes = [
  {
    name: "ขวดพลาสติกใส (PET)",
    category: "พลาสติก",
    price_per_unit: 8.5,
    unit: "kg",
    icon: "🥤",
    trend: "up",
  },
  {
    name: "กระป๋องอลูมิเนียม",
    category: "โลหะ",
    price_per_unit: 45.0,
    unit: "kg",
    icon: "⚙️",
    trend: "up",
  },
  {
    name: "กระดาษขาว-ดำ (A4)",
    category: "กระดาษ",
    price_per_unit: 3.6,
    unit: "kg",
    icon: "📄",
    trend: "stable",
  },
  {
    name: "ขวดแก้วรวม",
    category: "แก้ว",
    price_per_unit: 1.0,
    unit: "kg",
    icon: "🍾",
    trend: "stable",
  },
  {
    name: "กล่องกระดาษ/ลัง",
    category: "กระดาษ",
    price_per_unit: 2.5,
    unit: "kg",
    icon: "📦",
    trend: "up",
  },
  {
    name: "ทองแดง/สายไฟ",
    category: "โลหะ",
    price_per_unit: 260.0,
    unit: "kg",
    icon: "🔌",
    trend: "down",
  },
];

const initialBooths = [
  {
    name: "จุดรับซื้อศาลาประชาคม 1",
    district: "เมืองสกลนคร",
    address: "หน้าหมู่บ้านสุขใจ ซอย 5",
    hours: "09:00 - 16:00",
    status: "open",
    phone: "081-111-1111",
    lat: 17.166139,
    lng: 104.148613,
  },
  {
    name: "จุดรับซื้อตลาดสดเทศบาล",
    district: "เมืองสกลนคร",
    address: "โซนด้านหลังตลาด",
    hours: "08:00 - 14:00",
    status: "open",
    phone: "082-222-2222",
    lat: 17.1625,
    lng: 104.145,
  },
];

const initialRewards = [
  {
    name: "ถุงผ้าลดโลกร้อน",
    cost: 500,
    stock: 50,
    icon: "🛍️",
    desc: "ถุงผ้าแคนวาสอย่างดี ทนทาน",
  },
  {
    name: "คูปองส่วนลด 20฿",
    cost: 200,
    stock: 100,
    icon: "🎟️",
    desc: "ใช้แทนเงินสดที่ร้านค้าชุมชน",
  },
  {
    name: "กระบอกน้ำรักษ์โลก",
    cost: 1200,
    stock: 20,
    icon: "💧",
    desc: "เก็บความเย็นได้ 12 ชม.",
  },
  {
    name: "ชุดช้อนส้อมพกพา",
    cost: 300,
    stock: 40,
    icon: "🍴",
    desc: "ทำจากฟางข้าวสาลี",
  },
  {
    name: "ดินปุ๋ยหมักชีวภาพ",
    cost: 150,
    stock: 200,
    icon: "🌱",
    desc: "สูตรเข้มข้น 1 ถุง",
  },
];

// ✅ เพิ่มฟังก์ชันสร้างข้อมูลทดสอบ (Demo Data)
export async function seedDemoData() {
    try {
        const communities = ["muang_sakon_nakhon", "banthala", "kokpar_sil"];
        const demoUsers = [];

        // 1. สร้าง Users จำลอง
        for (let i = 1; i <= 5; i++) {
            const uid = `demo_user_${i}`;
            const community = communities[Math.floor(Math.random() * communities.length)];
            const userData = {
                username: `User ${i}`,
                email: `user${i}@demo.com`,
                phone: `080000000${i}`,
                role: 'user',
                community: community,
                points: Math.floor(Math.random() * 500),
                balance: { cash: Math.floor(Math.random() * 1000) },
                created_at: new Date()
            };
            await setDoc(doc(db, "users", uid), userData);
            demoUsers.push({ id: uid, ...userData });
        }

        // 2. สร้าง Transactions จำลอง
        const trashList = await getTrashTypes();
        if (trashList.length === 0) await seedInitialData(); 
        
        for (let i = 0; i < 20; i++) {
            const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
            const randomTrash = trashList[Math.floor(Math.random() * trashList.length)] || { id: 'plastic', name: 'พลาสติก', price_per_unit: 10 };
            const weight = (Math.random() * 10 + 1).toFixed(1);
            const amount = weight * randomTrash.price_per_unit;

            await adminRecordTransaction(
                user, 
                [{ id: randomTrash.id, name: randomTrash.name, weight: weight }], 
                amount.toFixed(2)
            );
        }
        
        return { success: true };
    } catch (error) {
        console.error("Seed Demo Error:", error);
        return { success: false, error };
    }
}

export async function seedInitialData() {
  try {
    const trashRef = collection(db, "trash_types");
    for (const trash of initialTrashTypes)
      await addDoc(trashRef, { ...trash, updated_at: new Date() });
    const boothRef = collection(db, "booths");
    for (const booth of initialBooths)
      await addDoc(boothRef, { ...booth, created_at: new Date() });
    const rewardRef = collection(db, "rewards");
    for (const reward of initialRewards)
      await addDoc(rewardRef, { ...reward, created_at: new Date() });
  } catch (error) {
    console.error(error);
  }
}

// ==========================================
// 2. PUBLIC DATA (ดึงข้อมูลทั่วไป)
// ==========================================
export async function getTrashTypes() {
  try {
    const q = query(
      collection(db, "trash_types"),
      orderBy("price_per_unit", "desc")
    );
    const querySnapshot = await getDocs(q);
    console.log("DEBUG: Trash Types Found:", querySnapshot.size);
    if (querySnapshot.size === 0) console.warn("DEBUG: Collection 'trash_types' is empty or query failed.");
    
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("DEBUG: Error fetching trash types:", e.code, e.message);
    return [];
  }
}

export async function getTrashTypeById(id) {
  try {
    const docRef = doc(db, "trash_types", id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    return null;
  }
}

export async function getEvents() {
  try {
    const querySnapshot = await getDocs(collection(db, "booths"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    return [];
  }
}

export async function getRewards() {
  try {
    const q = query(collection(db, "rewards"), orderBy("cost", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    return [];
  }
}

// ✅ อัปเดต: คำนวณปริมาณการซื้อขายรวม (รองรับการกรองตามชุมชน)
export async function getTrashVolumeStats(filterCommunity = null) {
  try {
    let constraints = [where("type", "==", "sell")];

    if (filterCommunity && filterCommunity !== "all") {
      constraints.push(where("community", "==", filterCommunity));
    }

    const q = query(collection(db, "transactions"), ...constraints);
    const snapshot = await getDocs(q);

    const volumeStats = {};
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item) => {
          const id = item.id;
          const weight = parseFloat(item.weight || 0);
          if (id) {
            volumeStats[id] = (volumeStats[id] || 0) + weight;
          }
        });
      }
    });
    return volumeStats;
  } catch (error) {
    console.error(error);
    return {};
  }
}

// ✅ เพิ่มใหม่: ดึงธุรกรรมล่าสุด (รองรับการกรองตามชุมชน)
export async function getRecentTransactions(filterCommunity = null) {
  try {
    let q;
    if (filterCommunity && filterCommunity !== "all") {
      q = query(
        collection(db, "transactions"),
        where("community", "==", filterCommunity),
        orderBy("created_at", "desc"),
        limit(5)
      );
    } else {
      q = query(
        collection(db, "transactions"),
        orderBy("created_at", "desc"),
        limit(5)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Recent Tx Error:", error);
    return [];
  }
}

// ==========================================
// 3. ADMIN CRUD (จัดการข้อมูล)
// ==========================================
export async function addTrashType(data) {
  await addDoc(collection(db, "trash_types"), {
    ...data,
    updated_at: new Date(),
  });
}
export async function updateTrashType(id, data) {
  await updateDoc(doc(db, "trash_types", id), {
    ...data,
    updated_at: new Date(),
  });
}
export async function deleteTrashType(id) {
  await deleteDoc(doc(db, "trash_types", id));
}

export async function addEvent(data) {
  await addDoc(collection(db, "booths"), { ...data, created_at: new Date() });
}
export async function updateEvent(id, data) {
  await updateDoc(doc(db, "booths", id), data);
}
export async function deleteEvent(id) {
  await deleteDoc(doc(db, "booths", id));
}

export async function addReward(data) {
  await addDoc(collection(db, "rewards"), { ...data, created_at: new Date() });
}
export async function updateReward(id, data) {
  await updateDoc(doc(db, "rewards", id), data);
}
export async function deleteReward(id) {
  await deleteDoc(doc(db, "rewards", id));
}

// ==========================================
// 4. USER & WALLET (สมาชิก)
// ==========================================
export async function getUserWallet(uid) {
  try {
    const userRef = doc(db, "users", uid);
    let userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      const q = query(collection(db, "users"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) return querySnapshot.docs[0].data();
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function getUserTransactions(uid) {
  try {
    const q = query(
      collection(db, "transactions"),
      where("member_id", "==", uid)
    );
    const querySnapshot = await getDocs(q);
    let transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    transactions.sort((a, b) => {
      const timeA = a.created_at?.seconds || 0;
      const timeB = b.created_at?.seconds || 0;
      return timeB - timeA;
    });
    return transactions;
  } catch (error) {
    return [];
  }
}

export async function simulateTransaction(uid, type, amount, detail) {
  try {
    await addDoc(collection(db, "transactions"), {
      member_id: uid,
      type,
      amount: parseFloat(amount),
      detail,
      status: "completed",
      created_at: new Date(),
    });

    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      let currentBalance = userData.balance?.cash || 0;

      if (type === "deposit" || type === "sell")
        currentBalance += parseFloat(amount);
      else if (type === "withdraw") currentBalance -= parseFloat(amount);

      await updateDoc(userRef, { "balance.cash": currentBalance });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export async function redeemReward(uid, reward) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");

    const userData = userSnap.data();
    const currentPoints = parseInt(userData.points || 0);

    if (currentPoints < reward.cost)
      return { success: false, message: "แต้มสะสมไม่เพียงพอ" };

    await updateDoc(userRef, { points: currentPoints - reward.cost });
    await addDoc(collection(db, "transactions"), {
      member_id: uid,
      type: "redeem",
      amount: -reward.cost,
      detail: `แลกของรางวัล: ${reward.name}`,
      reward_id: reward.id,
      status: "completed",
      created_at: new Date(),
    });
    return { success: true, message: "แลกของรางวัลสำเร็จ!" };
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาด" };
  }
}

export async function requestWithdraw(uid, amount) {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists())
      return { success: false, message: "ไม่พบข้อมูลผู้ใช้" };

    const userData = userSnap.data();
    const currentBalance = userData.balance?.cash || 0;

    if (amount > currentBalance)
      return { success: false, message: "ยอดเงินคงเหลือไม่พอ" };
    if (amount <= 0) return { success: false, message: "ยอดถอนต้องมากกว่า 0" };

    await updateDoc(userRef, { "balance.cash": currentBalance - amount });
    await addDoc(collection(db, "transactions"), {
      member_id: uid,
      type: "withdraw",
      amount: -amount,
      detail: "ถอนเงินออกจากระบบ",
      status: "completed",
      created_at: new Date(),
    });
    return { success: true, message: "ถอนเงินสำเร็จ!" };
  } catch (error) {
    return { success: false, message: "เกิดข้อผิดพลาด" };
  }
}

export async function deleteUserAccount(uid) {
  try {
    await deleteDoc(doc(db, "users", uid));
    const user = auth.currentUser;
    if (user) {
      await deleteUser(user);
    }
    return { success: true, message: "ลบบัญชีเรียบร้อยแล้ว" };
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      return {
        success: false,
        message:
          "เพื่อความปลอดภัย กรุณาออกจากระบบแล้วเข้าใหม่ ก่อนทำรายการลบบัญชี",
      };
    }
    return { success: false, message: "เกิดข้อผิดพลาด: " + error.message };
  }
}

// ==========================================
// 5. ADMIN POS & DASHBOARD
// ==========================================
export async function findUserByPhone(phone) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
}

export async function adminRecordTransaction(userData, items, totalAmount) {
  try {
    const isGuest = !userData || !userData.id;
    const memberId = isGuest ? "GUEST" : userData.id;
    const memberName = isGuest
      ? "Guest (Walk-in)"
      : userData.username || "Unknown User";
    const community = userData?.community || "general";

    const totalWeight = items.reduce(
      (acc, curr) => acc + parseFloat(curr.weight || 0),
      0
    );

    const transactionData = {
      member_id: memberId,
      member_name: memberName,
      community: community,
      type: "sell",
      amount: parseFloat(totalAmount),
      items: items,
      total_weight: parseFloat(totalWeight.toFixed(2)), // ✅ Save Total Weight for Aggregation
      status: "completed",
      created_at: new Date(),
      recorded_by: "admin",
    };
    await addDoc(collection(db, "transactions"), transactionData);

    if (!isGuest) {
      const userRef = doc(db, "users", memberId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentData = userSnap.data();
        let currentBalance = currentData.balance?.cash || 0;
        const currentPoints = currentData.points || 0;
        const currentPortfolio = currentData.portfolio || {};

        let totalPoints = 0;
        
        items.forEach((item) => {
          if (currentPortfolio[item.id])
            currentPortfolio[item.id] += parseFloat(item.weight);
          else currentPortfolio[item.id] = parseFloat(item.weight);

          // Calculate Points based on specific item config
          // If points_per_unit is defined, use it. Otherwise, fallback to 0 (or 1 point per baht if preferred, but user asked for specific config).
          const pointsPerUnit = parseFloat(item.points || 0);
          totalPoints += parseFloat(item.weight) * pointsPerUnit;
        });
        
        // Round points
        const pointsEarned = Math.floor(totalPoints);
        
        await updateDoc(userRef, {
          "balance.cash": currentBalance + parseFloat(totalAmount),
          points: currentPoints + pointsEarned,
          portfolio: currentPortfolio,
        });
      }
    }
    return true;
  } catch (error) {
    throw error;
  }
}

export async function getCommunityStats(filterCommunity = null) {
  try {
    let qUsers = collection(db, "users");
    let qTxSell = query(
      collection(db, "transactions"),
      where("type", "==", "sell")
    );

    if (filterCommunity && filterCommunity !== "all") {
      qUsers = query(
        collection(db, "users"),
        where("community", "==", filterCommunity)
      );
      qTxSell = query(
        collection(db, "transactions"),
        where("type", "==", "sell"),
        where("community", "==", filterCommunity)
      );
    }

    // 🚀 Fallback: Use Client-Side Aggregation to ensure data is found even without specific indexes
    const userSnapshot = await getDocs(qUsers);
    const totalMembers = userSnapshot.size;
    
    // Calculate User Points & Monthly Growth manually
    let totalPoints = 0;
    let newMembersMonth = 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    userSnapshot.forEach(doc => {
        const d = doc.data();
        totalPoints += (d.points || 0);
        
        // Check New Members This Month
        if(d.created_at && d.created_at.toDate() >= startOfMonth) {
            newMembersMonth++;
        }
    });

    const txSnapshot = await getDocs(qTxSell);
    let totalMoney = 0;
    let totalWeight = 0;
    let weightToday = 0;
    let moneyToday = 0;

    txSnapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount || 0);
        let itemWeight = 0;

        // Robust weight calculation: Use field OR sum items
        if (data.total_weight !== undefined && data.total_weight !== null) {
            itemWeight = parseFloat(data.total_weight);
        } else if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => itemWeight += parseFloat(item.weight || 0));
        }
        
        totalMoney += amount;
        totalWeight += itemWeight;

        // Check Daily Stats
        if (data.created_at && data.created_at.toDate() >= startOfDay) {
            weightToday += itemWeight;
            moneyToday += amount;
        }
    });

    return {
      members: totalMembers || 0,
      newMembersMonth: newMembersMonth || 0,
      money: totalMoney.toFixed(2),
      moneyToday: moneyToday.toFixed(2),
      weight: totalWeight.toFixed(2),
      weightToday: weightToday.toFixed(2),
      points: totalPoints || 0
    };
  } catch (error) {
    console.error("Stats Error:", error);
    return { members: 0, newMembersMonth: 0, money: '0.00', moneyToday: '0.00', weight: '0.00', weightToday: '0.00', points: 0 };
  }
}
/*
export async function getLeaderboard() {
  try {
    const q = query(
      collection(db, "users"),
      orderBy("points", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}
*/
export async function getLeaderboard() {
  try {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(15)); // Fetch more to allow filtering
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(user => {
        const email = (user.email || "").toLowerCase();
        const role = (user.role || "").toLowerCase();
        const username = (user.username || "").toLowerCase();
        return email !== 'admin@ecobank.com' && role !== 'admin' && username !== 'admin'; 
      })
      .slice(0, 10); // Return top 10
  } catch (error) {
    return [];
  }
}

export async function getAllTransactions(limitCount = 50) {
  try {
    const q = query(
      collection(db, "transactions"),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fixOldData() {
  try {
    let updatedCount = 0;

    // Fix Users (Community)
    const usersRef = collection(db, "users");
    const userSnapshot = await getDocs(usersRef);
    for (const docSnap of userSnapshot.docs) {
      const data = docSnap.data();
      if (!data.community) {
        await updateDoc(doc(db, "users", docSnap.id), {
          community: "muang_sakon_nakhon",
        });
        updatedCount++;
      }
    }

    // Fix Transactions (Community & Total Weight)
    const txRef = collection(db, "transactions");
    const txSnap = await getDocs(txRef);
    for (const docSnap of txSnap.docs) {
      const data = docSnap.data();
      let updates = {};

      if (!data.community) {
        updates.community = "muang_sakon_nakhon";
      }

      // ✅ Backfill total_weight if missing
      if (
        data.type === "sell" &&
        (data.total_weight === undefined || data.total_weight === null)
      ) {
        let weight = 0;
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item) => {
            weight += parseFloat(item.weight || 0);
          });
        }
        updates.total_weight = weight;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(doc(db, "transactions", docSnap.id), updates);
        updatedCount++;
      }
    }
    return updatedCount;
  } catch (error) {
    return 0;
  }
}

// ==========================================
// 6. GAMIFICATION & IMPACT
// ==========================================
export function calculateLevel(totalWeight) {
    if (totalWeight < 10) return { level: "Green Rookie", next: 10, icon: "🌱", color: "#8bc34a" };
    if (totalWeight < 50) return { level: "Earth Guardian", next: 50, icon: "🛡️", color: "#00bcd4" };
    if (totalWeight < 200) return { level: "Recycle Hero", next: 200, icon: "🦸", color: "#9c27b0" };
    return { level: "Legendary Saver", next: 1000, icon: "👑", color: "#ffc107" };
}

export function calculateImpact(totalWeight) {
    // 1 kg trash => ~0.8 kg CO2 reduced (Avg for mixed plastics/paper)
    // 1 tree absorbs ~20 kg CO2 per year
    const co2 = totalWeight * 0.8;
    const trees = co2 / 20; 
    return { 
        co2: co2.toFixed(1),
        trees: trees.toFixed(1)
    };
}

// ==========================================
// 7. GLOBAL UI SYSTEM
// ==========================================
export function showPopup(title, message, type = "success") {
  return new Promise((resolve) => {
    const old = document.getElementById("global-popup");
    if (old) old.remove();
    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    const btnClass =
      type === "error" ? "popup-btn-danger" : "popup-btn-primary";
    document.body.insertAdjacentHTML(
      "beforeend",
      `
            <div id="global-popup" class="popup-overlay"><div class="popup-box"><div class="popup-icon">${icon}</div><div class="popup-title">${title}</div><div class="popup-message">${message}</div><div class="popup-buttons"><button id="popup-ok" class="popup-btn ${btnClass}">ตกลง</button></div></div></div>`
    );
    const overlay = document.getElementById("global-popup");
    requestAnimationFrame(() => overlay.classList.add("show"));
    document.getElementById("popup-ok").onclick = () => {
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.remove();
        resolve();
      }, 300);
    };
  });
}

export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const old = document.getElementById("global-popup");
    if (old) old.remove();
    document.body.insertAdjacentHTML(
      "beforeend",
      `
            <div id="global-popup" class="popup-overlay"><div class="popup-box"><div class="popup-icon">❓</div><div class="popup-title">${title}</div><div class="popup-message">${message}</div><div class="popup-buttons"><button id="popup-cancel" class="popup-btn popup-btn-secondary">ยกเลิก</button><button id="popup-confirm" class="popup-btn popup-btn-primary">ยืนยัน</button></div></div></div>`
    );
    const overlay = document.getElementById("global-popup");
    requestAnimationFrame(() => overlay.classList.add("show"));
    const close = (res) => {
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.remove();
        resolve(res);
      }, 300);
    };
    document.getElementById("popup-confirm").onclick = () => close(true);
    document.getElementById("popup-cancel").onclick = () => close(false);
  });
}

export async function signOutUser() {
  const { signOut } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  return signOut(auth);
}
