// firebase-service.js - Firebase Firestore CRUD Service Layer
import { db, auth } from "./firebase-config.js";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==================== TRASH TYPES MANAGEMENT ====================
export async function getTrashTypes() {
    try {
        const querySnapshot = await getDocs(collection(db, "trash_types"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching trash types:", error);
        return [];
    }
}

export async function addTrashType(trashData) {
    try {
        const docRef = await addDoc(collection(db, "trash_types"), {
            ...trashData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...trashData };
    } catch (error) {
        console.error("Error adding trash type:", error);
        throw error;
    }
}

export async function updateTrashType(trashId, trashData) {
    try {
        await updateDoc(doc(db, "trash_types", trashId), trashData);
        return { id: trashId, ...trashData };
    } catch (error) {
        console.error("Error updating trash type:", error);
        throw error;
    }
}

export async function deleteTrashType(trashId) {
    try {
        await deleteDoc(doc(db, "trash_types", trashId));
        return true;
    } catch (error) {
        console.error("Error deleting trash type:", error);
        throw error;
    }
}

// ==================== EVENTS/BOOTHS MANAGEMENT ====================
export async function getEvents() {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, "events"), orderBy("date", "asc"))
        );
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export async function addEvent(eventData) {
    try {
        const docRef = await addDoc(collection(db, "events"), {
            ...eventData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...eventData };
    } catch (error) {
        console.error("Error adding event:", error);
        throw error;
    }
}

export async function updateEvent(eventId, eventData) {
    try {
        await updateDoc(doc(db, "events", eventId), eventData);
        return { id: eventId, ...eventData };
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}

export async function deleteEvent(eventId) {
    try {
        await deleteDoc(doc(db, "events", eventId));
        return true;
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
}

// ==================== USER WALLET MANAGEMENT ====================
export async function getUserWallet(userId) {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletSnap = await getDoc(walletRef);
        
        if (walletSnap.exists()) {
            return { id: walletSnap.id, ...walletSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching wallet:", error);
        return null;
    }
}

export async function initializeUserWallet(userId, userData) {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletSnap = await getDoc(walletRef);
        
        if (!walletSnap.exists()) {
            await updateDoc(walletRef, {
                userId,
                userName: userData.name || "User",
                balance: 0,
                portfolio: {},
                totalTransactions: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
        return true;
    } catch (error) {
        console.error("Error initializing wallet:", error);
        return false;
    }
}

// ==================== EXCHANGE - ADD WASTE TO PORTFOLIO ====================
export async function addWasteToPortfolio(userId, trashItem, quantity, price) {
    try {
        const walletRef = doc(db, "wallets", userId);
        const transactionAmount = quantity * price;
        
        // Add to portfolio
        const portfolioKey = `trash_${trashItem.id}`;
        await updateDoc(walletRef, {
            [`portfolio.${portfolioKey}`]: {
                trashId: trashItem.id,
                name: trashItem.name,
                symbol: trashItem.symbol,
                category: trashItem.category,
                quantity: increment(quantity),
                avgPrice: price,
                currentPrice: trashItem.price_per_unit || price,
                totalValue: increment(transactionAmount),
                timestamp: serverTimestamp()
            },
            balance: increment(transactionAmount),
            totalTransactions: increment(1),
            updatedAt: serverTimestamp()
        });

        // Create transaction record
        const transactionRef = await addDoc(collection(db, "transactions"), {
            userId,
            type: "buy",
            trashId: trashItem.id,
            trashName: trashItem.name,
            quantity,
            pricePerUnit: price,
            totalAmount: transactionAmount,
            timestamp: serverTimestamp(),
            status: "completed"
        });

        return { 
            success: true, 
            transactionId: transactionRef.id,
            amount: transactionAmount 
        };
    } catch (error) {
        console.error("Error adding waste to portfolio:", error);
        throw error;
    }
}

// ==================== WALLET - GET TRANSACTIONS ====================
export async function getUserTransactions(userId, limitCount = 50) {
    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, "transactions"),
                where("userId", "==", userId),
                orderBy("timestamp", "desc"),
                limit(limitCount)
            )
        );
        
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
}

// ==================== WALLET - DEPOSIT/WITHDRAW ====================
export async function depositToWallet(userId, amount, method = "credit_card") {
    try {
        const walletRef = doc(db, "wallets", userId);
        
        const transactionRef = await addDoc(collection(db, "transactions"), {
            userId,
            type: "deposit",
            amount,
            method,
            timestamp: serverTimestamp(),
            status: "completed"
        });

        await updateDoc(walletRef, {
            balance: increment(amount),
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            transactionId: transactionRef.id,
            amount
        };
    } catch (error) {
        console.error("Error depositing to wallet:", error);
        throw error;
    }
}

export async function withdrawFromWallet(userId, amount, method = "bank_transfer") {
    try {
        const walletRef = doc(db, "wallets", userId);
        const walletSnap = await getDoc(walletRef);
        const currentBalance = walletSnap.data()?.balance || 0;

        if (currentBalance < amount) {
            throw new Error("Insufficient balance");
        }

        const transactionRef = await addDoc(collection(db, "transactions"), {
            userId,
            type: "withdraw",
            amount,
            method,
            timestamp: serverTimestamp(),
            status: "pending"
        });

        await updateDoc(walletRef, {
            balance: increment(-amount),
            updatedAt: serverTimestamp()
        });

        return {
            success: true,
            transactionId: transactionRef.id,
            amount,
            newBalance: currentBalance - amount
        };
    } catch (error) {
        console.error("Error withdrawing from wallet:", error);
        throw error;
    }
}

// ==================== HELPER FUNCTIONS ====================
export async function getTrashTypeById(trashId) {
    try {
        const docSnap = await getDoc(doc(db, "trash_types", trashId));
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching trash type:", error);
        return null;
    }
}

export async function seedInitialData() {
    try {
        // Seed trash types
        const trashTypesData = [
            {
                name: "ขวดพลาสติก PET",
                symbol: "PET",
                category: "พลาสติก",
                price_per_unit: 8,
                description: "ขวดน้ำใส",
                icon: "🥤"
            },
            {
                name: "ทองแดง",
                symbol: "Cu",
                category: "โลหะ",
                price_per_unit: 260,
                description: "ทองแดงบริสุทธิ์",
                icon: "🔴"
            },
            {
                name: "กระดาษขาว",
                symbol: "Paper",
                category: "กระดาษ",
                price_per_unit: 3.6,
                description: "กระดาษสีขาว A4",
                icon: "📄"
            },
            {
                name: "อลูมิเนียม",
                symbol: "Al",
                category: "โลหะ",
                price_per_unit: 45,
                description: "กระป๋องอลูมิเนียม",
                icon: "🥫"
            },
            {
                name: "แก้ว",
                symbol: "Glass",
                category: "แก้ว",
                price_per_unit: 1,
                description: "ขวดแก้ว",
                icon: "🥛"
            }
        ];

        for (const trashType of trashTypesData) {
            const existingDocs = await getDocs(
                query(collection(db, "trash_types"), where("symbol", "==", trashType.symbol))
            );
            
            if (existingDocs.empty) {
                await addDoc(collection(db, "trash_types"), trashType);
            }
        }

        console.log("✅ Initial data seeded successfully");
        return true;
    } catch (error) {
        console.error("Error seeding data:", error);
        return false;
    }
}
