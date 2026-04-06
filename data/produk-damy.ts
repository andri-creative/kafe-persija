export const categories = [
    { id: 1, title: "All menu", image: "/icons/categori/all.png" },
    { id: 2, title: "Appetizer", image: "/icons/categori/icons8-appetizer-48.png" },
    { id: 3, title: "Soup", image: "/icons/categori/icons8-soup-58.png" },
    { id: 4, title: "Salads", image: "/icons/categori/icons8-green-salad-48.png" },
    { id: 5, title: "Main Course", image: "/icons/categori/icons8-fork-and-knife-with-plate-48.png" },
    { id: 6, title: "Italian", image: "/icons/categori/icons8-pizza-48.png" },
    { id: 7, title: "Side Dish", image: "/icons/categori/icons8-mashed-potatoes-50.png" },
    { id: 8, title: "Dessert", image: "/icons/categori/icons8-dessert-48.png" },
    { id: 9, title: "Beverages", image: "/icons/categori/icons8-soda-48.png" },
    { id: 10, title: "Best Seller", icon: "Star" },
    { id: 11, title: "Breakfast", image: "/icons/categori/icons8-breakfast-58.png" },
    { id: 12, title: "Grill", image: "/icons/categori/icons8-grill-48.png" }
];

export const products = [
    // APPETIZERS & SIDES (ID Kategori: 2, 7, 10)
    { id: 1, name: "Crispy Calamari", categoryIds: [2, 7, 10], price: 35000, isBestSeller: true },
    { id: 2, name: "Garlic Bread", categoryIds: [2, 6, 7], price: 25000, isBestSeller: false },
    { id: 3, name: "Bruschetta Tomato", categoryIds: [2, 6], price: 32000, isBestSeller: false },
    { id: 4, name: "Truffle Fries", categoryIds: [7, 10], price: 28000, isBestSeller: true },
    { id: 5, name: "Chicken Wings", categoryIds: [2, 7], price: 42000, isBestSeller: false },
    { id: 6, name: "Nachos Deluxe", categoryIds: [2, 7, 10], price: 45000, isBestSeller: true },

    // SOUP & SALADS (ID Kategori: 3, 4, 10)
    { id: 7, name: "Chicken Tofu Soup", categoryIds: [3, 10], price: 38000, isBestSeller: true },
    { id: 8, name: "Mushroom Cream Soup", categoryIds: [3, 6], price: 42000, isBestSeller: false },
    { id: 9, name: "Quinoa Salad", categoryIds: [4, 10], price: 48000, isBestSeller: true },
    { id: 10, name: "Classic Caesar Salad", categoryIds: [4, 6], price: 45000, isBestSeller: false },
    { id: 11, name: "Pumpkin Soup", categoryIds: [3], price: 35000, isBestSeller: false },
    { id: 12, name: "Greek Salad", categoryIds: [4], price: 42000, isBestSeller: false },

    // MAIN COURSES (ID Kategori: 5, 6, 10)
    { id: 13, name: "Beef Wellington", categoryIds: [5, 10], price: 125000, isBestSeller: true },
    { id: 14, name: "Cheesy Pizza Margheritta", categoryIds: [5, 6, 10], price: 85000, isBestSeller: true },
    { id: 15, name: "Spaghetti Carbonara", categoryIds: [5, 6], price: 65000, isBestSeller: false },
    { id: 16, name: "Lasagna Bolognese", categoryIds: [5, 6], price: 75000, isBestSeller: false },
    { id: 17, name: "Grilled Salmon", categoryIds: [5, 10], price: 110000, isBestSeller: true },
    { id: 18, name: "Ribeye Steak", categoryIds: [5], price: 145000, isBestSeller: false },
    { id: 19, name: "Chicken Parmigiana", categoryIds: [5, 6], price: 68000, isBestSeller: false },
    { id: 20, name: "Seafood Risotto", categoryIds: [5, 6], price: 82000, isBestSeller: false },
    { id: 21, name: "Beef Burger XXL", categoryIds: [5, 10], price: 55000, isBestSeller: true },
    { id: 22, name: "Fish and Chips", categoryIds: [5, 7], price: 62000, isBestSeller: false },

    // DESSERTS (ID Kategori: 8, 10)
    { id: 23, name: "Melting Brownie", categoryIds: [8, 10], price: 35000, isBestSeller: true },
    { id: 24, name: "Matcha Ice Cream", categoryIds: [8], price: 25000, isBestSeller: false },
    { id: 25, name: "Tiramisu Classic", categoryIds: [6, 8, 10], price: 42000, isBestSeller: true },
    { id: 26, name: "Panna Cotta", categoryIds: [6, 8], price: 38000, isBestSeller: false },

    // BEVERAGES (ID Kategori: 9, 10)
    { id: 27, name: "Iced Lychee Tea", categoryIds: [9, 10], price: 22000, isBestSeller: true },
    { id: 28, name: "Fresh Orange Juice", categoryIds: [9], price: 25000, isBestSeller: false },
    { id: 29, name: "Espresso", categoryIds: [6, 9], price: 20000, isBestSeller: false },
    { id: 30, name: "Strawberry Milkshake", categoryIds: [9, 10], price: 28000, isBestSeller: true },

    // BREAKFAST (ID Kategori: 11, 10)
    { id: 31, name: "Classic Omelette", categoryIds: [11], price: 35000, isBestSeller: false },
    { id: 32, name: "Pancakes with Syrup", categoryIds: [11, 10], price: 32000, isBestSeller: true },
    { id: 33, name: "French Toast", categoryIds: [11], price: 30000, isBestSeller: false },

    // GRILL (ID Kategori: 12, 5, 10)
    { id: 34, name: "Grilled Ribs BBQ", categoryIds: [12, 5, 10], price: 135000, isBestSeller: true },
    { id: 35, name: "T-Bone Steak", categoryIds: [12, 5], price: 155000, isBestSeller: false },
    { id: 36, name: "Lamb Chops", categoryIds: [12, 5], price: 120000, isBestSeller: false }
];