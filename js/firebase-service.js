import { db, auth } from "./firebase-config.js";
import { 
    collection, addDoc, getDocs, doc, getDoc, 
    query, where, orderBy, limit, setDoc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ... (ส่วน Seeding Data คงเดิม) ...
const initialTrashTypes = [
    { name: "ขวดพลาสติกใส (PET)", category: "พลาสติก", price_per_unit: 8.50, unit: "kg", icon: "🥤", trend: "up" },
    { name: "กระป๋องอลูมิเนียม", category: "โลหะ", price_per_unit: 45.00, unit: "kg", icon: "⚙️", trend: "up" },
    { name: "กระดาษขาว-ดำ (A4)", category: "กระดาษ", price_per_unit: 3.60, unit: "kg", icon: "📄", trend: "stable" },
    { name: "ขวดแก้วรวม", category: "แก้ว", price_per_unit: 1.00, unit: "kg", icon: "🍾", trend: "stable" },
    { name: "กล่องกระดาษ/ลัง", category: "กระดาษ", price_per_unit: 2.50, unit: "kg", icon: "📦", trend: "up" },
    { name: "ทองแดง/สายไฟ", category: "โลหะ", price_per_unit: 260.00, unit: "kg", icon: "🔌", trend: "down" }
];
const initialBooths = [
    { name: "จุดรับซื้อศาลาประชาคม 1", district: "ลาดพร้าว", address: "หน้าหมู่บ้านสุขใจ ซอย 5", hours: "09:00 - 16:00", status: "open", phone: "081-111-1111" },
    { name: "จุดรับซื้อตลาดสดเทศบาล", district: "จตุจักร", address: "โซนด้านหลังตลาด", hours: "08:00 - 14:00", status: "open", phone: "082-222-2222" }
];
const initialRewards = [
    { name: "ถุงผ้าลดโลกร้อน", cost: 500, stock: 50, icon: "🛍️", desc: "ถุงผ้าแคนวาสอย่างดี ทนทาน" },
    { name: "คูปองส่วนลด 20฿", cost: 200, stock: 100, icon: "🎟️", desc: "ใช้แทนเงินสดที่ร้านค้าชุมชน" },
    { name: "กระบอกน้ำรักษ์โลก", cost: 1200, stock: 20, icon: "💧", desc: "เก็บความเย็นได้ 12 ชม." },
    { name: "ชุดช้อนส้อมพกพา", cost: 300, stock: 40, icon: "🍴", desc: "ทำจากฟางข้าวสาลี" },
    { name: "ดินปุ๋ยหมักชีวภาพ", cost: 150, stock: 200, icon: "🌱", desc: "สูตรเข้มข้น 1 ถุง" }
];

export async function seedInitialData() {
    try {
        const trashRef = collection(db, "trash_types");
        for (const trash of initialTrashTypes) await addDoc(trashRef, { ...trash, updated_at: new Date() });
        const boothRef = collection(db, "booths");
        for (const booth of initialBooths) await addDoc(boothRef, { ...booth, created_at: new Date() });
        const rewardRef = collection(db, "rewards");
        for (const reward of initialRewards) await addDoc(rewardRef, { ...reward, created_at: new Date() });
    } catch (error) { console.error(error); }
}

// ... (Get Data Functions) ...
export async function getTrashTypes() {
    try {
        const q = query(collection(db, "trash_types"), orderBy("price_per_unit", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { return []; }
}

export async function getTrashTypeById(id) {
    try {
        const docRef = doc(db, "trash_types", id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) { return null; }
}

export async function getEvents() {
    try {
        const querySnapshot = await getDocs(collection(db, "booths"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { return []; }
}

export async function getRewards() {
    try {
        const q = query(collection(db, "rewards"), orderBy("cost", "asc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) { return []; }
}

// ✅ ฟังก์ชันใหม่: ดึงยอด Volume ของขยะแต่ละชนิด
export async function getTrashVolumeStats() {
    try {
        // ดึงรายการขายทั้งหมด (type = sell)
        const q = query(collection(db, "transactions"), where("type", "==", "sell"));
        const snapshot = await getDocs(q);
        const volumeStats = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    const id = item.id;
                    const weight = parseFloat(item.weight || 0);
                    if (id) {
                        volumeStats[id] = (volumeStats[id] || 0) + weight;
                    }
                });
            }
        });
        return volumeStats; // คืนค่า { "id_ขวด": 100, "id_กระดาษ": 50 }
    } catch (error) {
        console.error("Error getting volume stats:", error);
        return {};
    }
}

// ... (CRUD Functions) ...
export async function addTrashType(data) { await addDoc(collection(db, "trash_types"), { ...data, updated_at: new Date() }); }
export async function updateTrashType(id, data) { await updateDoc(doc(db, "trash_types", id), { ...data, updated_at: new Date() }); }
export async function deleteTrashType(id) { await deleteDoc(doc(db, "trash_types", id)); }

export async function addEvent(data) { await addDoc(collection(db, "booths"), { ...data, created_at: new Date() }); }
export async function updateEvent(id, data) { await updateDoc(doc(db, "booths", id), data); }
export async function deleteEvent(id) { await deleteDoc(doc(db, "booths", id)); }

export async function addReward(data) { await addDoc(collection(db, "rewards"), { ...data, created_at: new Date() }); }
export async function updateReward(id, data) { await updateDoc(doc(db, "rewards", id), data); }
export async function deleteReward(id) { await deleteDoc(doc(db, "rewards", id)); }

// ... (User Functions) ...
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
    } catch (error) { return null; }
}

export async function getUserTransactions(uid) {
    try {
        const q = query(collection(db, "transactions"), where("member_id", "==", uid));
        const querySnapshot = await getDocs(q);
        let transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        transactions.sort((a, b) => {
            const timeA = a.created_at?.seconds || 0;
            const timeB = b.created_at?.seconds || 0;
            return timeB - timeA;
        });
        return transactions;
    } catch (error) { console.error("Transaction Error:", error); return []; }
}

export async function simulateTransaction(uid, type, amount, detail) {
    try {
        await addDoc(collection(db, "transactions"), { 
            member_id: uid, type, amount: parseFloat(amount), detail, status: 'completed', created_at: new Date() 
        });
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const userData = userSnap.data();
            let currentBalance = userData.balance?.cash || userData.balance?.thb || 0;
            if (type === 'deposit' || type === 'sell') currentBalance += parseFloat(amount);
            else if (type === 'withdraw') currentBalance -= parseFloat(amount);
            await updateDoc(userRef, { "balance.cash": currentBalance });
            return true;
        }
        return false;
    } catch (error) { return false; }
}

export async function redeemReward(uid, reward) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User not found");
        
        const userData = userSnap.data();
        const currentPoints = parseInt(userData.points || 0);
        
        if (currentPoints < reward.cost) return { success: false, message: "แต้มสะสมไม่เพียงพอ" };

        await updateDoc(userRef, { points: currentPoints - reward.cost });
        await addDoc(collection(db, "transactions"), {
            member_id: uid, type: 'redeem', amount: -reward.cost,
            detail: `แลกของรางวัล: ${reward.name}`, reward_id: reward.id,
            status: 'completed', created_at: new Date()
        });
        return { success: true, message: "แลกของรางวัลสำเร็จ!" };
    } catch (error) {
        console.error("Redeem Error:", error);
        return { success: false, message: "เกิดข้อผิดพลาด" };
    }
}

export async function requestWithdraw(uid, amount) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return { success: false, message: "ไม่พบข้อมูลผู้ใช้" };
        
        const userData = userSnap.data();
        const currentBalance = userData.balance?.cash || 0;

        if (amount > currentBalance) return { success: false, message: "ยอดเงินคงเหลือไม่พอ" };
        if (amount <= 0) return { success: false, message: "ยอดถอนต้องมากกว่า 0" };

        await updateDoc(userRef, { "balance.cash": currentBalance - amount });
        await addDoc(collection(db, "transactions"), {
            member_id: uid, type: 'withdraw', amount: -amount,
            detail: 'ถอนเงินออกจากระบบ', status: 'completed', created_at: new Date()
        });
        return { success: true, message: "ถอนเงินสำเร็จ!" };
    } catch (error) {
        console.error("Withdraw Error:", error);
        return { success: false, message: "เกิดข้อผิดพลาด" };
    }
}

// ... (Other Functions) ...
export async function findUserByPhone(phone) {
    try {
        const q = query(collection(db, "users"), where("phone", "==", phone));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) { throw error; }
}

export async function adminRecordTransaction(userData, items, totalAmount) {
    try {
        const isGuest = !userData || !userData.id;
        const memberId = isGuest ? 'GUEST' : userData.id;
        const memberName = isGuest ? 'Guest (Walk-in)' : (userData.username || 'Unknown User');
        const community = userData?.community || 'general'; 

        const transactionData = {
            member_id: memberId, member_name: memberName, community: community,
            type: 'sell', amount: parseFloat(totalAmount), items: items,
            status: 'completed', created_at: new Date(), recorded_by: 'admin'
        };
        await addDoc(collection(db, "transactions"), transactionData);

        if (!isGuest) {
            const userRef = doc(db, "users", memberId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const currentData = userSnap.data();
                let currentBalance = currentData.balance?.cash || currentData.balance?.thb || 0;
                const currentPoints = currentData.points || 0;
                const currentPortfolio = currentData.portfolio || {};

                items.forEach(item => {
                    if (currentPortfolio[item.id]) currentPortfolio[item.id] += parseFloat(item.weight);
                    else currentPortfolio[item.id] = parseFloat(item.weight);
                });

                const pointsEarned = Math.floor(totalAmount); 
                await updateDoc(userRef, {
                    "balance.cash": currentBalance + parseFloat(totalAmount),
                    "points": currentPoints + pointsEarned,
                    "portfolio": currentPortfolio
                });
            }
        }
        return true;
    } catch (error) { console.error("Admin Record Error:", error); throw error; }
}

export async function getCommunityStats(filterCommunity = null) {
    try {
        let qUsers = collection(db, "users");
        let qTx = collection(db, "transactions");

        if (filterCommunity && filterCommunity !== 'all') {
            qUsers = query(collection(db, "users"), where("community", "==", filterCommunity));
            qTx = query(collection(db, "transactions"), where("community", "==", filterCommunity));
        }

        const usersSnap = await getDocs(qUsers);
        let totalMembers = usersSnap.size;
        let totalPoints = 0;
        usersSnap.forEach(doc => { totalPoints += Number(doc.data().points || 0); });

        const txSnap = await getDocs(qTx);
        let totalWeight = 0;
        let totalMoney = 0;
        txSnap.forEach(doc => {
            const data = doc.data();
            if(data.type === 'sell') {
                totalMoney += parseFloat(data.amount || 0);
                if(data.items && Array.isArray(data.items)) {
                    data.items.forEach(item => { totalWeight += parseFloat(item.weight || 0); });
                }
            }
        });

        return { members: totalMembers, points: totalPoints, weight: totalWeight.toFixed(2), money: totalMoney.toFixed(2) };
    } catch (error) { return { members: 0, points: 0, weight: 0, money: 0 }; }
}

export async function getLeaderboard() {
    try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { return []; }
}

export async function fixOldData() {
    try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        let updatedCount = 0;
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            if (!data.community) {
                await updateDoc(doc(db, "users", docSnap.id), { community: "muang_sakon_nakhon" });
                updatedCount++;
            }
        }
        const txRef = collection(db, "transactions");
        const txSnap = await getDocs(txRef);
        for (const docSnap of txSnap.docs) {
            const data = docSnap.data();
            if (!data.community) {
                await updateDoc(doc(db, "transactions", docSnap.id), { community: "muang_sakon_nakhon" });
                updatedCount++;
            }
        }
        return updatedCount;
    } catch (error) { return 0; }
}

// ... (Helpers) ...
export function showPopup(title, message, type = 'success') {
    return new Promise((resolve) => {
        const old = document.getElementById('global-popup'); if(old) old.remove();
        const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
        const btnClass = type === 'error' ? 'popup-btn-danger' : 'popup-btn-primary';
        document.body.insertAdjacentHTML('beforeend', `
            <div id="global-popup" class="popup-overlay"><div class="popup-box"><div class="popup-icon">${icon}</div><div class="popup-title">${title}</div><div class="popup-message">${message}</div><div class="popup-buttons"><button id="popup-ok" class="popup-btn ${btnClass}">ตกลง</button></div></div></div>`);
        const overlay = document.getElementById('global-popup');
        requestAnimationFrame(() => overlay.classList.add('show'));
        document.getElementById('popup-ok').onclick = () => { overlay.classList.remove('show'); setTimeout(() => { overlay.remove(); resolve(); }, 300); };
    });
}

export function showConfirm(title, message) {
    return new Promise((resolve) => {
        const old = document.getElementById('global-popup'); if(old) old.remove();
        document.body.insertAdjacentHTML('beforeend', `
            <div id="global-popup" class="popup-overlay"><div class="popup-box"><div class="popup-icon">❓</div><div class="popup-title">${title}</div><div class="popup-message">${message}</div><div class="popup-buttons"><button id="popup-cancel" class="popup-btn popup-btn-secondary">ยกเลิก</button><button id="popup-confirm" class="popup-btn popup-btn-primary">ยืนยัน</button></div></div></div>`);
        const overlay = document.getElementById('global-popup');
        requestAnimationFrame(() => overlay.classList.add('show'));
        const close = (res) => { overlay.classList.remove('show'); setTimeout(() => { overlay.remove(); resolve(res); }, 300); };
        document.getElementById('popup-confirm').onclick = () => close(true);
        document.getElementById('popup-cancel').onclick = () => close(false);
    });
}