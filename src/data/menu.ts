export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  prepTime: string;
  isVeg: boolean;
  isBestseller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "sushi", name: "Sushi", icon: "🍣" },
  { id: "salads", name: "Salads", icon: "🥗" },
  { id: "pasta", name: "Pasta", icon: "🍝" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, San Marzano tomatoes, basil on artisan dough",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&h=300&fit=crop",
    category: "pizza",
    rating: 4.8,
    prepTime: "20 min",
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "2",
    name: "Pepperoni Feast",
    description: "Double pepperoni, mozzarella blend, oregano-infused sauce",
    price: 17.99,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop",
    category: "pizza",
    rating: 4.7,
    prepTime: "22 min",
    isVeg: false,
  },
  {
    id: "3",
    name: "Classic Smash Burger",
    description: "Double smashed patty, American cheese, pickles, special sauce",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "burgers",
    rating: 4.9,
    prepTime: "15 min",
    isVeg: false,
    isBestseller: true,
  },
  {
    id: "4",
    name: "Truffle Mushroom Burger",
    description: "Wagyu beef, truffle aioli, sautéed wild mushrooms, gruyère",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop",
    category: "burgers",
    rating: 4.6,
    prepTime: "18 min",
    isVeg: false,
  },
  {
    id: "5",
    name: "Salmon Nigiri Set",
    description: "8 pieces of premium Norwegian salmon nigiri with wasabi",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    category: "sushi",
    rating: 4.9,
    prepTime: "10 min",
    isVeg: false,
    isBestseller: true,
  },
  {
    id: "6",
    name: "Dragon Roll",
    description: "Eel, avocado, cucumber, topped with thinly sliced avocado",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop",
    category: "sushi",
    rating: 4.7,
    prepTime: "12 min",
    isVeg: false,
  },
  {
    id: "7",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan crisps, house-made Caesar dressing",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    category: "salads",
    rating: 4.5,
    prepTime: "8 min",
    isVeg: true,
  },
  {
    id: "8",
    name: "Penne Arrabbiata",
    description: "Al dente penne in spicy tomato sauce with fresh basil",
    price: 13.99,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
    category: "pasta",
    rating: 4.6,
    prepTime: "16 min",
    isVeg: true,
  },
  {
    id: "9",
    name: "Tiramisu",
    description: "Classic Italian dessert with mascarpone, espresso, cocoa",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop",
    category: "desserts",
    rating: 4.8,
    prepTime: "5 min",
    isVeg: true,
    isBestseller: true,
  },
  {
    id: "10",
    name: "Mango Smoothie",
    description: "Fresh mango, yogurt, honey, a touch of cardamom",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
    category: "drinks",
    rating: 4.7,
    prepTime: "5 min",
    isVeg: true,
  },
  {
    id: "11",
    name: "BBQ Chicken Pizza",
    description: "Smoky BBQ sauce, grilled chicken, red onion, cilantro",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    category: "pizza",
    rating: 4.6,
    prepTime: "22 min",
    isVeg: false,
  },
  {
    id: "12",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, vanilla ice cream",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
    category: "desserts",
    rating: 4.9,
    prepTime: "12 min",
    isVeg: true,
  },
];
