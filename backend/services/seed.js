/**
 * Seed data for a fresh installation: 26 realistic café menu items with
 * INR pricing and 10 tables. Orders start empty — no sample data.
 */

export const SEED_MENU = [
  { name: 'Espresso', category: 'Coffee', price: 80, description: 'Double shot of rich espresso', image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop' },
  { name: 'Americano', category: 'Coffee', price: 100, description: 'Espresso with hot water', image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&h=300&fit=crop' },
  { name: 'Cappuccino', category: 'Coffee', price: 120, description: 'Espresso with steamed milk foam', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop' },
  { name: 'Café Latte', category: 'Coffee', price: 130, description: 'Espresso with plenty of steamed milk', image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop' },
  { name: 'Mocha', category: 'Coffee', price: 150, description: 'Espresso, chocolate and milk', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop' },
  { name: 'Cold Coffee', category: 'Cold Drinks', price: 140, description: 'Chilled blended coffee with ice cream', image: 'https://images.unsplash.com/photo-1467453678174-768ec283a940?w=400&h=300&fit=crop' },
  { name: 'Masala Tea', category: 'Tea', price: 40, description: 'Spiced Indian milk tea', image: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=300&fit=crop' },
  { name: 'Ginger Tea', category: 'Tea', price: 40, description: 'Fresh ginger brewed milk tea', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&h=300&fit=crop' },
  { name: 'Green Tea', category: 'Tea', price: 60, description: 'Light sencha green tea', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop' },
  { name: 'Iced Tea', category: 'Cold Drinks', price: 90, description: 'Lemon iced tea over ice', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop' },
  { name: 'Fresh Lime Soda', category: 'Cold Drinks', price: 70, description: 'Sweet or salted lime soda', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=400&h=300&fit=crop' },
  { name: 'Cold Brew', category: 'Cold Drinks', price: 160, description: '18-hour steeped cold brew coffee', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop' },
  { name: 'French Fries', category: 'Snacks', price: 110, description: 'Crispy salted fries', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop' },
  { name: 'Veg Sandwich', category: 'Snacks', price: 120, description: 'Grilled sandwich with garden veggies', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
  { name: 'Club Sandwich', category: 'Snacks', price: 180, description: 'Triple-decker grilled sandwich', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop' },
  { name: 'Veg Burger', category: 'Snacks', price: 150, description: 'Crunchy patty with house sauce', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
  { name: 'Masala Fries', category: 'Snacks', price: 130, description: 'Fries tossed in chat masala', image: 'https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=400&h=300&fit=crop' },
  { name: 'Idli Sambar', category: 'Breakfast', price: 90, description: 'Steamed rice cakes with sambar', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop' },
  { name: 'Masala Dosa', category: 'Breakfast', price: 110, description: 'Crisp dosa with potato filling', image: 'https://images.unsplash.com/photo-1630383249927-9bb539d53b63?w=400&h=300&fit=crop' },
  { name: 'Poha', category: 'Breakfast', price: 60, description: 'Flattened rice with peanuts and lemon', image: 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=400&h=300&fit=crop' },
  { name: 'Pasta Alfredo', category: 'Meals', price: 220, description: 'Penne in creamy alfredo sauce', image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400&h=300&fit=crop' },
  { name: 'Margherita Pizza', category: 'Meals', price: 250, description: 'Classic tomato and mozzarella pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop' },
  { name: 'Chocolate Brownie', category: 'Desserts', price: 140, description: 'Fudgy walnut brownie', image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&h=300&fit=crop' },
  { name: 'Cheesecake', category: 'Desserts', price: 180, description: 'New York style baked cheesecake', image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400&h=300&fit=crop' },
  { name: 'Blueberry Muffin', category: 'Desserts', price: 90, description: 'Soft muffin bursting with blueberries', image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop' },
  { name: 'Butter Croissant', category: 'Desserts', price: 85, description: 'Flaky French butter croissant', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop' },
];

export function buildTables(count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    id: `T${i + 1}`,
    name: `Table ${i + 1}`,
    status: 'Available',
  }));
}
