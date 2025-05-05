"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Fallback products when database connection fails
const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "Espresso",
    description: "Strong black coffee made by forcing steam through ground coffee beans",
    price: 3.5,
    image: "/placeholder.svg?height=200&width=200&text=Espresso",
    category: "coffee",
  },
  {
    id: "2",
    name: "Cappuccino",
    description: "Coffee made with milk that has been frothed up with pressurized steam",
    price: 4.5,
    image: "/placeholder.svg?height=200&width=200&text=Cappuccino",
    category: "coffee",
  },
  {
    id: "3",
    name: "Latte",
    description: "Coffee made with espresso and steamed milk",
    price: 4.0,
    image: "/placeholder.svg?height=200&width=200&text=Latte",
    category: "coffee",
  },
  {
    id: "4",
    name: "Croissant",
    description: "Buttery, flaky, French viennoiserie pastry",
    price: 3.0,
    image: "/placeholder.svg?height=200&width=200&text=Croissant",
    category: "pastry",
  },
]

export default function MenuFallbackPage() {
  const [products] = useState(FALLBACK_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", ...new Set(products.map((product) => product.category))]

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category === selectedCategory)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{product.description}</p>
              <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">
          <strong>Note:</strong> This is a fallback menu with sample products. The database connection is currently
          unavailable.
        </p>
      </div>
    </div>
  )
}
