import { db } from "./db";

export async function getCartItems(userId) {
  const [rows] = await db.query(
    `SELECT ci.product_id, ci.quantity, p.name, p.price, p.image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getCartCount(userId) {
  if (!userId) return 0;
  const [rows] = await db.query(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM cart_items WHERE user_id = ?",
    [userId]
  );
  return Number(rows[0].total);
}

async function getStock(productId) {
  const [rows] = await db.query("SELECT stock FROM products WHERE id = ?", [productId]);
  return rows[0]?.stock ?? 0;
}

export async function addToCart(userId, productId, quantity = 1) {
  const stock = await getStock(productId);
  if (stock <= 0) return;

  const [rows] = await db.query(
    "SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
  const currentQuantity = rows[0]?.quantity ?? 0;
  const newQuantity = Math.min(currentQuantity + quantity, stock);
  if (newQuantity === currentQuantity) return;

  await db.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = ?`,
    [userId, productId, newQuantity, newQuantity]
  );
}

export async function updateCartQuantity(userId, productId, quantity) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    await removeFromCart(userId, productId);
    return;
  }
  const stock = await getStock(productId);
  const cappedQuantity = Math.min(quantity, stock);
  if (cappedQuantity <= 0) {
    await removeFromCart(userId, productId);
    return;
  }
  await db.query(
    "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
    [cappedQuantity, userId, productId]
  );
}

export async function removeFromCart(userId, productId) {
  await db.query(
    "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
    [userId, productId]
  );
}
